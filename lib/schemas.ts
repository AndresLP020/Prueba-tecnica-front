import { z } from "zod";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import {
  EMAIL_MAX,
  EMAIL_PATTERN,
  PHONE_MAX_DIGITS,
  hasKnownEmailDomain,
} from "@/lib/contactInput";

export const NICHES = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "professional_services", label: "Servicios profesionales" },
  { value: "health_wellness", label: "Salud y bienestar" },
  { value: "saas_tech", label: "SaaS/Tecnología" },
  { value: "real_estate", label: "Inmobiliaria" },
  { value: "education", label: "Educación" },
  { value: "restaurants_hospitality", label: "Restaurantes y hospitalidad" },
  { value: "other", label: "Otro" },
] as const;

export const BUDGETS = [
  { value: "lt10k", label: "< $10,000", hint: "MXN / mes" },
  { value: "10k_30k", label: "$10k – $30k", hint: "MXN / mes" },
  { value: "30k_80k", label: "$30k – $80k", hint: "MXN / mes" },
  { value: "gt80k", label: "> $80,000", hint: "MXN / mes" },
] as const;

export const URGENCIES = [
  { value: "exploring", label: "Solo explorando" },
  { value: "q1", label: "En 1–3 meses" },
  { value: "month", label: "Este mes" },
  { value: "asap", label: "Lo antes posible" },
] as const;

export const NEEDS = [
  { value: "website_landing", label: "Sitio web/Landing" },
  { value: "automation", label: "Automatización de procesos" },
  { value: "marketing_leads", label: "Marketing y captación de leads" },
  { value: "branding_design", label: "Branding/Diseño" },
  { value: "integrations_crm", label: "Integraciones y CRM" },
  { value: "other", label: "Otro" },
] as const;

export type Niche = (typeof NICHES)[number]["value"];
export type Budget = (typeof BUDGETS)[number]["value"];
export type Urgency = (typeof URGENCIES)[number]["value"];
export type Need = (typeof NEEDS)[number]["value"];

const nicheValues = NICHES.map((n) => n.value) as [Niche, ...Niche[]];
const budgetValues = BUDGETS.map((n) => n.value) as [Budget, ...Budget[]];
const urgencyValues = URGENCIES.map((n) => n.value) as [Urgency, ...Urgency[]];
const needValues = NEEDS.map((n) => n.value) as [Need, ...Need[]];

export const COUNTRIES: { iso: CountryCode; dial: string; label: string }[] = [
  { iso: "MX", dial: "+52", label: "México" },
  { iso: "US", dial: "+1", label: "Estados Unidos" },
  { iso: "CA", dial: "+1", label: "Canadá" },
  { iso: "CO", dial: "+57", label: "Colombia" },
  { iso: "AR", dial: "+54", label: "Argentina" },
  { iso: "CL", dial: "+56", label: "Chile" },
  { iso: "PE", dial: "+51", label: "Perú" },
  { iso: "ES", dial: "+34", label: "España" },
  { iso: "GT", dial: "+502", label: "Guatemala" },
  { iso: "CR", dial: "+506", label: "Costa Rica" },
  { iso: "PA", dial: "+507", label: "Panamá" },
  { iso: "EC", dial: "+593", label: "Ecuador" },
  { iso: "UY", dial: "+598", label: "Uruguay" },
  { iso: "BO", dial: "+591", label: "Bolivia" },
  { iso: "DO", dial: "+1", label: "República Dominicana" },
  { iso: "BR", dial: "+55", label: "Brasil" },
  { iso: "GB", dial: "+44", label: "Reino Unido" },
];

export function toE164(raw: string, country: CountryCode): string | null {
  const parsed = parsePhoneNumberFromString(raw, country);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.format("E.164");
}

const leadFormObjectSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre completo (mín. 2)")
    .max(80, "Máximo 80 caracteres"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(6, "Correo demasiado corto")
    .max(EMAIL_MAX, "Correo demasiado largo")
    .regex(EMAIL_PATTERN, "Escribe un correo válido, por ejemplo  nombre@empresa.mx")
    .refine((v) => !v.includes(".."), { message: "El correo no puede tener puntos seguidos" })
    .refine(hasKnownEmailDomain, {
      message:
        "Después de @ usa un dominio conocido: gmail.com, outlook.com, hotmail.com, empresa.mx, empresa.com…",
    }),
  phoneCountry: z.string().min(2).max(2).default("MX"),
  phone: z
    .string()
    .trim()
    .length(PHONE_MAX_DIGITS, "El teléfono debe tener exactamente 10 números")
    .regex(/^\d+$/, "El teléfono solo admite números"),
  company: z.string().trim().min(2, "Empresa requerida").max(120),
  niche: z.enum(nicheValues, {
    errorMap: () => ({ message: "Elige un nicho" }),
  }),
  budget: z.enum(budgetValues, {
    errorMap: () => ({ message: "Elige un presupuesto" }),
  }),
  urgency: z.enum(urgencyValues, {
    errorMap: () => ({ message: "Elige una urgencia" }),
  }),
  need: z.enum(needValues, {
    errorMap: () => ({ message: "Elige una necesidad" }),
  }),
  message: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  consent: z
    .boolean()
    .refine((v) => v === true, { message: "Necesitamos tu consentimiento" }),
  website: z.string().optional().default(""),
  submissionId: z.string().uuid("submissionId inválido"),
  startedAt: z.number().int().positive(),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
      term: z.string().optional(),
      content: z.string().optional(),
    })
    .optional(),
});

export type LeadFormInput = z.input<typeof leadFormObjectSchema>;
export type LeadFormValues = z.output<typeof leadFormObjectSchema>;

export const leadFormSchema = leadFormObjectSchema.superRefine((data, ctx) => {
  if (!toE164(data.phone, data.phoneCountry as CountryCode)) {
    ctx.addIssue({
      code: "custom",
      path: ["phone"],
      message: "Teléfono inválido para el país seleccionado",
    });
  }
});

export const leadPayloadSchema = leadFormSchema.transform((data, ctx) => {
  const phoneE164 = toE164(data.phone, data.phoneCountry as CountryCode);
  if (!phoneE164) {
    ctx.addIssue({
      code: "custom",
      path: ["phone"],
      message: "Teléfono inválido para el país seleccionado",
    });
    return z.NEVER;
  }
  return {
    ...data,
    emailNormalized: data.email,
    phoneE164,
    phoneValid: true,
  };
});

export type LeadPayload = z.output<typeof leadPayloadSchema>;

export const n8nResponseSchema = z.object({
  leadId: z.string().min(1),
  tier: z.enum(["A", "B", "C"]),
  bookingUrl: z.string().url().nullable().optional(),
  duplicate: z.boolean().optional(),
  status: z.string().optional(),
});

export const nurtureSchema = z.object({
  leadId: z.string().min(1),
  submissionId: z.string().uuid(),
  teamSize: z.enum(["solo", "2_10", "11_50", "50_plus"]),
  timelineBudget: z.enum(["flexible", "this_quarter", "approved"]),
  biggestBlocker: z.string().trim().min(4).max(280),
});

export const MIN_FILL_MS = 4_000;
export const MAX_BODY_BYTES = 32_768;
