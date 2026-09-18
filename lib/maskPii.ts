export function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "***";
  const keep = user.slice(0, 1);
  return `${keep}***@${domain}`;
}

export function maskPhone(e164: string) {
  if (e164.length < 6) return "***";
  return `${e164.slice(0, 4)}****${e164.slice(-2)}`;
}

export function emailDomain(email: string) {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1).toLowerCase() : "";
}
