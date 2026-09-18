/** Caracteres permitidos mientras se escribe un correo. */
const EMAIL_LOCAL = /[a-z0-9._%+-]/;
const EMAIL_DOMAIN = /[a-z0-9.-]/;

export const EMAIL_MAX = 254;
export const PHONE_MAX_DIGITS = 10;

/** Correo con usuario, dominio y extensión (ej. nombre@empresa.mx). */
export const EMAIL_PATTERN =
  /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,24}$/;

const KNOWN_COMPOUND_TLDS = [
  "com.mx",
  "org.mx",
  "gob.mx",
  "edu.mx",
  "net.mx",
  "gov.mx",
  "co.uk",
  "org.uk",
  "ac.uk",
  "gov.uk",
  "com.ar",
  "com.co",
  "com.br",
  "com.pe",
  "com.ec",
  "com.au",
  "co.jp",
] as const;

const KNOWN_TLDS = [
  "com",
  "net",
  "org",
  "edu",
  "gov",
  "gob",
  "info",
  "biz",
  "pro",
  "mx",
  "es",
  "ar",
  "cl",
  "pe",
  "co",
  "br",
  "uy",
  "ec",
  "gt",
  "cr",
  "pa",
  "do",
  "bo",
  "py",
  "us",
  "uk",
  "ca",
  "de",
  "fr",
  "it",
  "pt",
  "nl",
  "io",
  "ai",
  "app",
  "dev",
  "me",
  "tech",
  "cloud",
] as const;

const KNOWN_SUFFIXES = [...KNOWN_COMPOUND_TLDS, ...KNOWN_TLDS].sort(
  (a, b) => b.length - a.length,
);

export function hasKnownEmailDomain(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at < 1) return false;
  const domain = email.slice(at + 1).toLowerCase();
  if (!domain.includes(".") || domain.startsWith("-") || domain.includes("..")) return false;
  const suffix = KNOWN_SUFFIXES.find((item) => domain === item || domain.endsWith(`.${item}`));
  if (!suffix) return false;
  const host = domain.slice(0, domain.length - suffix.length).replace(/\.$/, "");
  return host.length > 0 && /^[a-z0-9-]+(?:\.[a-z0-9-]+)*$/.test(host);
}

export function sanitizeEmailInput(raw: string): string {
  let atSeen = false;
  let out = "";
  for (const ch of raw.toLowerCase()) {
    if (ch === "@") {
      if (!atSeen && out.length > 0) {
        out += "@";
        atSeen = true;
      }
      continue;
    }
    if (atSeen ? EMAIL_DOMAIN.test(ch) : EMAIL_LOCAL.test(ch)) {
      out += ch;
    }
  }
  return out.slice(0, EMAIL_MAX);
}

export function sanitizePhoneInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, PHONE_MAX_DIGITS);
}
