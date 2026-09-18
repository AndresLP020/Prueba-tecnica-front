import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getServerEnv } from "./env";

const COOKIE = "orbita_admin";
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function createAdminCookie(password: string) {
  const env = getServerEnv();
  if (!env.ADMIN_PASSWORD || !env.ADMIN_SECRET) return null;
  if (!safeEqual(password, env.ADMIN_PASSWORD)) return null;
  const exp = Date.now() + MAX_AGE_MS;
  const payload = `v1.${exp}`;
  return {
    name: COOKIE,
    value: `${payload}.${sign(payload, env.ADMIN_SECRET)}`,
    maxAge: Math.floor(MAX_AGE_MS / 1000),
  };
}

export function verifyAdminToken(token: string | undefined | null) {
  if (!token) return false;
  const env = getServerEnv();
  if (!env.ADMIN_SECRET) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot < 0) return false;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  if (!safeEqual(sig, sign(payload, env.ADMIN_SECRET))) return false;
  const exp = Number(payload.split(".")[1]);
  return Number.isFinite(exp) && Date.now() <= exp;
}

export async function isAdminRequest() {
  const jar = await cookies();
  return verifyAdminToken(jar.get(COOKIE)?.value);
}

export { COOKIE as ADMIN_COOKIE };
