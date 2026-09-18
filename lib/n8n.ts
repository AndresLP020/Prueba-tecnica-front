import { getServerEnv } from "./env";
import { n8nResponseSchema } from "./schemas";

export class N8nError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
    this.name = "N8nError";
  }
}

export async function forwardToN8n(payload: unknown, signal?: AbortSignal) {
  const env = getServerEnv();
  if (!env.N8N_WEBHOOK_URL || !env.N8N_WEBHOOK_SECRET) {
    throw new N8nError("n8n no está configurado", 502);
  }
  const res = await fetch(env.N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [env.N8N_WEBHOOK_HEADER]: env.N8N_WEBHOOK_SECRET,
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (res.status === 401 || res.status === 403) {
    throw new N8nError("Webhook de n8n rechazó la autenticación", 502);
  }
  if (!res.ok) {
    throw new N8nError(`n8n respondió ${res.status}`, 502);
  }

  const json: unknown = await res.json();
  const parsed = n8nResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new N8nError("Respuesta de n8n inválida", 502);
  }
  return parsed.data;
}
