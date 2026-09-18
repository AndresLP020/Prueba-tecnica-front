import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
const env: Record<string, string> = {};
for (const line of raw.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  env[t.slice(0, eq)] = t.slice(eq + 1);
}

const key = env.LLM_API_KEY;
const url =
  env.LLM_API_URL ||
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

async function tryOnce(label: string, headers: Record<string, string>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Responde solo JSON: {"ok":true}' }] }],
    }),
  });
  const text = await res.text();
  console.log(label, res.status, text.slice(0, 400));
}

async function main() {
  if (!key) {
    console.error("sin key");
    process.exit(1);
  }
  await tryOnce("x-goog-api-key", { "x-goog-api-key": key });
  await tryOnce("query", {});
  const withQuery = await fetch(`${url}?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Responde solo JSON: {"ok":true}' }] }],
    }),
  });
  console.log("?key=", withQuery.status, (await withQuery.text()).slice(0, 400));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
