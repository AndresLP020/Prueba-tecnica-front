import { randomUUID } from "node:crypto";
import { getDb, COLLECTIONS } from "./mongo";
import { bookingUrlForTier, calculateScore } from "./score";
import { sendLeadEmails, smtpConfigured } from "./mailer";
import { analyzeLeadWithGemini } from "./gemini";
import type { LeadPayload } from "./schemas";

export type IngestResult = {
  leadId: string;
  tier: "A" | "B" | "C";
  bookingUrl: string | null;
  duplicate: boolean;
  emailSent: boolean;
};

export async function ingestLead(
  payload: LeadPayload & { calBaseUrl: string },
): Promise<IngestResult> {
  const firstName = payload.fullName.trim().split(/\s+/)[0] || "Hola";
  const emailDomain = payload.emailNormalized.split("@")[1] || "";
  const ai = await analyzeLeadWithGemini({
    firstName,
    company: payload.company,
    niche: payload.niche,
    need: payload.need,
    budget: payload.budget,
    urgency: payload.urgency,
    message: payload.message || "",
    emailDomain,
  });

  const scored = calculateScore(payload, ai.spamRisk);
  const bookingUrl = scored.flags.spam
    ? null
    : bookingUrlForTier(scored.tier, payload.calBaseUrl);
  const db = await getDb();
  const leads = db.collection(COLLECTIONS.leads);
  const existing = await leads.findOne({ emailNormalized: payload.emailNormalized });

  if (existing) {
    await leads.updateOne(
      { emailNormalized: payload.emailNormalized },
      {
        $inc: { submissionsCount: 1 },
        $set: { updatedAt: new Date(), lastSubmissionId: payload.submissionId, ai },
      },
    );
    return {
      leadId: String(existing.leadId || existing._id),
      tier: (existing.tier as "A" | "B" | "C") || scored.tier,
      bookingUrl: (existing.bookingUrl as string | null) ?? bookingUrl,
      duplicate: true,
      emailSent: false,
    };
  }

  const leadId = randomUUID();
  await leads.insertOne({
    leadId,
    submissionId: payload.submissionId,
    emailNormalized: payload.emailNormalized,
    fullName: payload.fullName,
    phoneE164: payload.phoneE164,
    company: payload.company,
    niche: payload.niche,
    budget: payload.budget,
    urgency: payload.urgency,
    need: payload.need,
    message: payload.message || "",
    consent: payload.consent,
    utm: payload.utm || {},
    score: scored.score,
    tier: scored.tier,
    status: scored.flags.spam ? "spam" : "active",
    flags: { ...scored.flags, spamRisk: ai.spamRisk },
    ai,
    bookingUrl,
    submissionsCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  let emailSent = false;
  if (!scored.flags.spam && smtpConfigured()) {
    try {
      const mail = await sendLeadEmails({
        to: payload.emailNormalized,
        firstName,
        company: payload.company,
        bookingUrl,
        intro: ai.intro,
        internal: {
          fullName: payload.fullName,
          company: payload.company,
          tier: scored.tier,
          email: payload.emailNormalized,
          summary: ai.summary,
        },
      });
      emailSent = mail.sent;
    } catch (err) {
      console.error("No se pudo enviar el correo", err);
    }
  }

  return {
    leadId,
    tier: scored.tier,
    bookingUrl,
    duplicate: false,
    emailSent,
  };
}
