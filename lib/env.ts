import { z } from "zod";

const schema = z.object({
  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().default("leadflow"),
  N8N_WEBHOOK_URL: z.string().optional(),
  N8N_WEBHOOK_SECRET: z.string().optional(),
  N8N_WEBHOOK_HEADER: z.string().default("X-Webhook-Secret"),
  CAL_BASE_URL: z.string().url().default("https://cal.com/orbita"),
  ADMIN_PASSWORD: z.string().min(8),
  ADMIN_SECRET: z.string().min(16),
  APP_URL: z.string().url().default("http://localhost:3000"),
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
});

export type ServerEnv = z.infer<typeof schema>;

export function getServerEnv(): ServerEnv {
  const parsed = schema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB: process.env.MONGODB_DB,
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
    N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET,
    N8N_WEBHOOK_HEADER: process.env.N8N_WEBHOOK_HEADER,
    CAL_BASE_URL: process.env.CAL_BASE_URL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_SECRET: process.env.ADMIN_SECRET,
    APP_URL: process.env.APP_URL,
    TURNSTILE_SECRET: process.env.TURNSTILE_SECRET,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    LLM_API_KEY: process.env.LLM_API_KEY,
    LLM_API_URL: process.env.LLM_API_URL,
    CAL_EVENT_A: process.env.CAL_EVENT_A,
    CAL_EVENT_B: process.env.CAL_EVENT_B,
    CAL_BOOKING_A: process.env.CAL_BOOKING_A,
    CAL_BOOKING_B: process.env.CAL_BOOKING_B,
  });
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Variables de entorno faltantes o inválidas: ${fields}`);
  }
  return parsed.data;
}
