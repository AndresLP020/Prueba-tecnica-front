import { MAX_BODY_BYTES, MIN_FILL_MS, leadPayloadSchema } from "@/lib/schemas";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { getServerEnv } from "@/lib/env";
import { markSubmission, saveSubmission } from "@/lib/outbox";
import { ingestLead } from "@/lib/ingestLead";
import { orbitFromTier } from "@/lib/brand.config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function json(data: unknown, status = 200, extra?: HeadersInit) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extra },
  });
}

export async function POST(req: Request) {
  const length = Number(req.headers.get("content-length") || "0");
  if (length > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Payload demasiado grande" }, 413);
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return json({ ok: false, error: "No se pudo leer el cuerpo" }, 400);
  }
  if (raw.length > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Payload demasiado grande" }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "JSON inválido" }, 400);
  }

  const ip = clientIp(req.headers);
  const limited = rateLimit(ip);
  if (!limited.ok) {
    return json(
      { ok: false, error: "Demasiados envíos. Espera unos minutos." },
      429,
      { "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)) },
    );
  }

  const honeypot =
    typeof body === "object" &&
    body !== null &&
    "website" in body &&
    typeof (body as { website?: unknown }).website === "string" &&
    (body as { website: string }).website.trim().length > 0;

  if (honeypot) {
    return json({
      ok: true,
      orbit: "forming",
      leadId: "ignored",
      bookingUrl: null,
    });
  }

  const startedAt =
    typeof body === "object" && body !== null && "startedAt" in body
      ? Number((body as { startedAt?: unknown }).startedAt)
      : 0;
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return json({ ok: false, error: "Envío demasiado rápido. Completa el formulario con calma." }, 400);
  }

  const parsed = leadPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        ok: false,
        error: "Campos inválidos",
        details: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      400,
    );
  }

  const env = getServerEnv();
  const payload = {
    ...parsed.data,
    calBaseUrl: env.CAL_BASE_URL,
  };

  try {
    await saveSubmission({
      submissionId: parsed.data.submissionId,
      status: "pending",
      attempts: 1,
      payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch {
    /* Mongo outbox best-effort */
  }

  try {
    let result: {
      leadId: string;
      tier: "A" | "B" | "C";
      bookingUrl: string | null;
      duplicate: boolean;
      emailSent: boolean;
    };

    if (env.BACKEND_URL) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 9_000);
      try {
        const upstream = await fetch(`${env.BACKEND_URL.replace(/\/$/, "")}/api/leads`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(env.BACKEND_SECRET ? { "X-Backend-Secret": env.BACKEND_SECRET } : {}),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        const data = (await upstream.json()) as typeof result & { ok?: boolean; error?: string };
        if (!upstream.ok) {
          throw new Error(data.error || "backend_error");
        }
        result = data;
      } catch (err) {
        console.error("Render no respondió a tiempo; ingest local", err);
        result = await ingestLead(payload);
      } finally {
        clearTimeout(timer);
      }
    } else {
      result = await ingestLead(payload);
    }
    try {
      await markSubmission(parsed.data.submissionId, {
        status: "sent",
        leadId: result.leadId,
        tier: result.tier,
        emailSent: result.emailSent,
      });
    } catch {
      /* ignore */
    }
    return json({
      ok: true,
      leadId: result.leadId,
      orbit: orbitFromTier(result.tier),
      bookingUrl: result.bookingUrl,
      duplicate: result.duplicate,
      emailSent: result.emailSent,
    });
  } catch (err) {
    try {
      await markSubmission(parsed.data.submissionId, {
        status: "pending",
        lastError: err instanceof Error ? err.message : "ingest_error",
      });
    } catch {
      /* ignore */
    }
    return json({ ok: false, error: "No pudimos completar el envío. Intenta de nuevo." }, 502);
  }
}
