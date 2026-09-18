import nodemailer from "nodemailer";
import { brand } from "./brand.config";

type MailInput = {
  to: string;
  firstName: string;
  company?: string;
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

function confirmationHtml(input: {
  firstName: string;
  company?: string;
  bookingUrl: string | null;
  intro?: string;
}) {
  const name = input.firstName || "Hola";
  const company = input.company ? ` ${input.company}` : "";
  const line =
    input.intro ||
    `${name}, tu briefing ya tiene peso. No es un “gracias por escribirnos”: es el inicio de una conversación con criterio.`;
  const cta = input.bookingUrl
    ? `<p style="margin:28px 0 8px">El siguiente movimiento es una llamada corta. Elige el hueco que te acomode:</p>
       <p style="margin:0 0 24px"><a href="${input.bookingUrl}" style="background:#1c1915;color:#f4f0e7;padding:14px 22px;text-decoration:none;letter-spacing:.04em">Reservar conversación</a></p>`
    : `<p style="margin:24px 0">No te pedimos agenda todavía. En un día hábil te escribimos con el paso que sí corresponde —sin teatro, sin puntaje a la vista.</p>`;
  return `<!doctype html><html lang="es-MX"><body style="margin:0;background:#f4f0e7;color:#1c1915;font-family:Georgia,'Times New Roman',serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0e7"><tr><td align="center" style="padding:40px 16px">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;border:1px solid #d8d0c2;background:#fffdf8">
  <tr><td style="padding:32px 32px 4px;font-family:Arial,sans-serif;letter-spacing:.32em;font-size:11px;color:#8c6b3a">${brand.name}</td></tr>
  <tr><td style="padding:4px 32px 0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.14em;color:#6a6358">CIUDAD DE MÉXICO · DEMO</td></tr>
  <tr><td style="padding:28px 32px 0;font-size:30px;line-height:1.12;font-weight:600">${name}, tu proyecto ya tiene gravedad.</td></tr>
  <tr><td style="padding:18px 32px 0;font-size:18px;line-height:1.5;color:#3d3830">${line}</td></tr>
  <tr><td style="padding:8px 32px 0;font-size:16px;line-height:1.55;color:#6a6358">Leímos lo de${company || " tu empresa"} con calma. Aquí no hay embudo decorativo: hay mesa, criterio y un siguiente paso que se puede operar.</td></tr>
  <tr><td style="padding:8px 32px 32px;font-size:16px;line-height:1.55;color:#1c1915">${cta}
  <p style="margin:28px 0 0;font-size:13px;color:#8c6b3a;letter-spacing:.04em">Equipo ${brand.name}</p>
  <p style="margin:6px 0 0;font-size:12px;color:#6a6358">Si no fuiste tú quien abrió este expediente, ignora el mensaje y el universo sigue su curso.</p></td></tr>
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

  const subject = input.firstName
    ? `${input.firstName}, tu proyecto ya tiene gravedad`
    : "Tu proyecto ya tiene gravedad";

  await transporter.sendMail({
    from: `"${brand.name}" <${user}>`,
    to: input.to,
    subject,
    html: confirmationHtml(input),
    text: [
      `${input.firstName || "Hola"}, tu proyecto ya tiene gravedad.`,
      input.intro || "Leímos tu briefing. El siguiente paso es una conversación con criterio, no un embudo.",
      input.bookingUrl
        ? `Reserva aquí: ${input.bookingUrl}`
        : "En un día hábil te escribimos con el movimiento que sí corresponde.",
      `— ${brand.name} · CDMX`,
    ].join("\n\n"),
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
