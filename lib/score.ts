const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.es",
  "outlook.com",
  "outlook.es",
  "yahoo.com",
  "yahoo.com.mx",
  "yahoo.es",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "live.com",
  "msn.com",
  "aol.com",
  "gmx.com",
  "gmx.es",
  "mail.com",
  "zoho.com",
]);

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "throwaway.email",
  "trashmail.com",
  "yopmail.com",
]);

const BUDGET_POINTS: Record<string, number> = {
  lt10k: 0,
  "10k_30k": 12,
  "30k_80k": 25,
  gt80k: 35,
};

const URGENCY_POINTS: Record<string, number> = {
  exploring: 0,
  q1: 8,
  month: 17,
  asap: 25,
};

const IDEAL_NICHES = new Set([
  "ecommerce",
  "professional_services",
  "health_wellness",
  "saas_tech",
]);

const LISTED_NICHES = new Set([
  "ecommerce",
  "professional_services",
  "health_wellness",
  "saas_tech",
  "real_estate",
  "education",
  "restaurants_hospitality",
]);

export type ScoreResult = {
  score: number;
  tier: "A" | "B" | "C";
  flags: { spam: boolean; disposableEmail: boolean; corporateEmail: boolean };
  bookingUrl: string | null;
};

function domainFromEmail(email: string) {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1).toLowerCase() : "";
}

export function calculateScore(
  lead: {
    email?: string;
    emailNormalized?: string;
    budget?: string;
    urgency?: string;
    niche?: string;
    need?: string;
    message?: string;
    phoneValid?: boolean;
    phoneE164?: string;
  },
  spamRisk = 0,
): Omit<ScoreResult, "bookingUrl"> {
  const email = lead.emailNormalized || lead.email || "";
  const domain = domainFromEmail(email);
  const corporate = domain.length > 0 && !FREE_EMAIL_DOMAINS.has(domain);
  const disposable = DISPOSABLE_DOMAINS.has(domain);
  const heuristicSpam = /viagra|casino online|crypto airdrop|seo backlinks/i.test(lead.message || "");
  const spam = heuristicSpam || spamRisk >= 0.7;

  const raw =
    (BUDGET_POINTS[lead.budget || ""] ?? 0) +
    (URGENCY_POINTS[lead.urgency || ""] ?? 0) +
    (IDEAL_NICHES.has(lead.niche || "") ? 15 : LISTED_NICHES.has(lead.niche || "") ? 8 : 0) +
    (["automation", "marketing_leads", "integrations_crm"].includes(lead.need || "")
      ? 10
      : ["website_landing", "branding_design"].includes(lead.need || "")
        ? 6
        : 0) +
    (corporate ? 10 : 0) +
    (lead.phoneValid || lead.phoneE164 ? 5 : 0) -
    (disposable ? 25 : 0);

  const score = Math.max(0, Math.min(100, raw));
  const flags = { spam, disposableEmail: disposable, corporateEmail: corporate };
  let tier: "A" | "B" | "C" = "C";
  if (!spam && score >= 70) tier = "A";
  else if (!spam && score >= 40) tier = "B";
  return { score, tier, flags };
}

export function bookingUrlForTier(
  tier: "A" | "B" | "C",
  calBase: string,
  events?: { a?: string; b?: string },
) {
  const directA = process.env.CAL_BOOKING_A;
  const directB = process.env.CAL_BOOKING_B;
  if (tier === "A" && directA) return directA;
  if (tier === "B" && directB) return directB;
  const base = calBase.replace(/\/$/, "");
  const slugA = events?.a || process.env.CAL_EVENT_A || "priority-15min";
  const slugB = events?.b || process.env.CAL_EVENT_B || "discovery-30min";
  if (tier === "A") return `${base}/${slugA}`;
  if (tier === "B") return `${base}/${slugB}`;
  return null;
}
