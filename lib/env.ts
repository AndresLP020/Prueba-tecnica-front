import { z } from "zod";

function blank(v: string | undefined) {
  const t = v?.trim();
  return t ? t : undefined;
}

const schema = z.object({
  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().default("leadflow"),
  N8N_WEBHOOK_URL: z.string().optional(),
  N8N_WEBHOOK_SECRET: z.string().optional(),
  N8N_WEBHOOK_HEADER: z.string().default("X-Webhook-Secret"),
  CAL_BASE_URL: z.string().default("https://cal.com"),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  ADMIN_SECRET: z.string().min(16).optional(),
  APP_URL: z.string().default("http://localhost:3000"),
  TURNSTILE_SECRET: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  LLM_API_KEY: z.string().optional(),
  LLM_API_URL: z.string().optional(),
  CAL_EVENT_A: z.string().optional(),
  CAL_EVENT_B: z.string().optional(),
  CAL_BOOKING_A: z.string().optional(),
  CAL_BOOKING_B: z.string().optional(),
  BACKEND_URL: z.string().optional(),
  BACKEND_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof schema>;

export function getServerEnv(): ServerEnv {
  const parsed = schema.safeParse({
    MONGODB_URI: blank(process.env.MONGODB_URI),
    MONGODB_DB: blank(process.env.MONGODB_DB),
    N8N_WEBHOOK_URL: blank(process.env.N8N_WEBHOOK_URL),
    N8N_WEBHOOK_SECRET: blank(process.env.N8N_WEBHOOK_SECRET),
    N8N_WEBHOOK_HEADER: blank(process.env.N8N_WEBHOOK_HEADER),
    CAL_BASE_URL: blank(process.env.CAL_BASE_URL),
    ADMIN_PASSWORD: blank(process.env.ADMIN_PASSWORD),
    ADMIN_SECRET: blank(process.env.ADMIN_SECRET),
    APP_URL: blank(process.env.APP_URL),
    TURNSTILE_SECRET: blank(process.env.TURNSTILE_SECRET),
    SMTP_USER: blank(process.env.SMTP_USER),
    SMTP_PASS: blank(process.env.SMTP_PASS),
    SMTP_HOST: blank(process.env.SMTP_HOST),
    SMTP_PORT: blank(process.env.SMTP_PORT),
    LLM_API_KEY: blank(process.env.LLM_API_KEY),
    LLM_API_URL: blank(process.env.LLM_API_URL),
    CAL_EVENT_A: blank(process.env.CAL_EVENT_A),
    CAL_EVENT_B: blank(process.env.CAL_EVENT_B),
    CAL_BOOKING_A: blank(process.env.CAL_BOOKING_A),
    CAL_BOOKING_B: blank(process.env.CAL_BOOKING_B),
    BACKEND_URL: blank(process.env.BACKEND_URL),
    BACKEND_SECRET: blank(process.env.BACKEND_SECRET),
  });
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Variables de entorno faltantes o inválidas: ${fields}`);
  }
  return parsed.data;
}
