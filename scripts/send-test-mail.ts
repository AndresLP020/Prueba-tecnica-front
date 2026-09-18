import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import nodemailer from "nodemailer";

const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
const env: Record<string, string> = {};
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
}

const user = env.SMTP_USER;
const pass = env.SMTP_PASS?.replace(/\s/g, "");
if (!user || !pass) {
  console.error("Faltan SMTP_USER o SMTP_PASS en .env.local");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || "smtp.gmail.com",
  port: Number(env.SMTP_PORT || 465),
  secure: true,
  auth: { user, pass },
});

async function main() {
  const info = await transporter.sendMail({
    from: `"ORBITA" <${user}>`,
    to: user,
    subject: "Prueba ORBITA — correo listo",
    text: "Si lees esto, SMTP de Gmail funciona. Ya puedes enviar el briefing en http://localhost:3000",
  });
  console.log("OK", info.messageId);
}

main().catch((err) => {
  console.error("FAIL", err instanceof Error ? err.message : err);
  process.exit(1);
});
