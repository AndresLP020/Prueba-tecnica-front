import nodemailer from "nodemailer";
import { brand } from "./brand.config";

type MailInput = {
  to: string;
  firstName: string;
  bookingUrl: string | null;
  intro?: string;
  internal?: {
    fullName: string;
    company: string;
    tier: string;
    email: string;
    summary?: string;
  };
};

function confirmationHtml(firstName: string, bookingUrl: string | null, intro?: string) {
  const name = firstName || "Hola";
  const line =
    intro || "Recibimos tu briefing. El equipo ya está en trayectoria de acercamiento.";
  const cta = bookingUrl
    ? `<p style="margin:24px 0"><a href="${bookingUrl}" style="background:#1c1915;color:#f4f0e7;padding:12px 20px;text-decoration:none">Elegir horario</a></p>`
    : "<p>Te escribiremos con el siguiente paso. No hace falta que agendes ahora.</p>";
  return `<!doctype html><html lang="es-MX"><body style="margin:0;background:#f4f0e7;color:#1c1915;font-family:Georgia,serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;border:1px solid #d8d0c2;background:#fffdf8">
  <tr><td style="padding:28px 28px 8px;font-family:Arial,sans-serif;letter-spacing:.22em;font-size:11px;color:#8c6b3a">${brand.name} · DEMO</td></tr>
  <tr><td style="padding:8px 28px 0;font-size:26px;line-height:1.15">Recibimos tu briefing, ${name}.</td></tr>
  <tr><td style="padding:12px 28px 0;color:#6a6358;font-style:italic">${line}</td></tr>
  <tr><td style="padding:16px 28px 28px">${cta}
  <p style="font-size:12px;color:#6a6358">Si no fuiste tú, ignora este correo.</p></td></tr>
  </table></td></tr></table></body></html>`;
}

export function smtpConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendLeadEmails(input: MailInput) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    return { sent: false, reason: "missing_smtp" as const };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: { user, pass: pass.replace(/\s/g, "") },
  });

  await transporter.sendMail({
    from: `"${brand.name}" <${user}>`,
    to: input.to,
    subject: `Recibimos tu briefing, ${input.firstName || ""}`.trim(),
    html: confirmationHtml(input.firstName, input.bookingUrl, input.intro),
    text: `${input.firstName || "Hola"}, ${input.intro || "recibimos tu briefing"}. ${
      input.bookingUrl ? `Agenda: ${input.bookingUrl}` : "Te escribiremos con el siguiente paso."
    }`,
  });

  if (input.internal) {
    await transporter.sendMail({
      from: `"${brand.name}" <${user}>`,
      to: user,
      subject: `[ÓRBITA ${input.internal.tier}] ${input.internal.fullName} · ${input.internal.company}`,
      text: `${input.internal.fullName}\n${input.internal.email}\n${input.internal.company}\nTier interno: ${input.internal.tier}${
        input.internal.summary ? `\nResumen IA: ${input.internal.summary}` : ""
      }`,
    });
  }

  return { sent: true as const };
}
