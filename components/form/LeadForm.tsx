"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  BUDGETS,
  COUNTRIES,
  leadFormSchema,
  NEEDS,
  NICHES,
  URGENCIES,
  type LeadFormInput,
} from "@/lib/schemas";
import {
  EMAIL_MAX,
  PHONE_MAX_DIGITS,
  sanitizeEmailInput,
  sanitizePhoneInput,
} from "@/lib/contactInput";
import { useOrbitScene } from "@/components/scene/OrbitProvider";
import { orbitFromTier } from "@/lib/brand.config";

const STEPS = ["Tú", "Tu empresa", "Tu proyecto", "Confirmar"] as const;

const stepFields: (keyof LeadFormInput)[][] = [
  ["fullName", "email", "phone", "phoneCountry"],
  ["company", "niche"],
  ["budget", "urgency", "need", "message"],
  ["consent"],
];

function FieldError({ message }: { message?: string }) {
  return (
    <p className="min-h-5 font-serif text-sm italic text-ember" role="alert">
      {message || ""}
    </p>
  );
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-ash"
    >
      {children}
    </label>
  );
}

export function LeadForm() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { setScene } = useOrbitScene();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submissionId] = useState(() => crypto.randomUUID());
  const [startedAt] = useState(() => Date.now());

  const utm = useMemo(() => {
    if (typeof window === "undefined") return {};
    const q = new URLSearchParams(window.location.search);
    return {
      source: q.get("utm_source") || undefined,
      medium: q.get("utm_medium") || undefined,
      campaign: q.get("utm_campaign") || undefined,
      term: q.get("utm_term") || undefined,
      content: q.get("utm_content") || undefined,
    };
  }, []);

  const form = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneCountry: "MX",
      phone: "",
      company: "",
      niche: undefined,
      budget: undefined,
      urgency: undefined,
      need: undefined,
      message: "",
      consent: false,
      website: "",
      submissionId,
      startedAt,
      utm,
    },
    mode: "onTouched",
  });
  const emailField = form.register("email");
  const phoneField = form.register("phone");

  useEffect(() => {
    const sub = form.watch((value) => {
      setScene({
        budget: value.budget || "",
        urgency: value.urgency || "",
        need: value.need || "",
      });
    });
    return () => sub.unsubscribe();
  }, [form, setScene]);

  async function next() {
    const ok = await form.trigger(stepFields[step], { shouldFocus: true });
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function onSubmit(values: LeadFormInput) {
    setServerError(null);
    setScene({ launching: true });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, submissionId, startedAt, utm, website: values.website || "" }),
      });
      let data: {
        ok?: boolean;
        orbit?: string;
        bookingUrl?: string | null;
        leadId?: string;
        pending?: boolean;
        error?: string;
        details?: { path: string; message: string }[];
      } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        setScene({ launching: false });
        setServerError(
          res.status
            ? `El servidor respondió ${res.status}. Revisa las variables de entorno en Vercel (MONGODB_URI).`
            : "Sin enlace con el servidor. Revisa tu conexión.",
        );
        return;
      }
      if (!res.ok) {
        setScene({ launching: false });
        if (data.details?.[0]) {
          setServerError(data.details[0].message);
        } else {
          setServerError(data.error || "No pudimos enviar el briefing. Intenta de nuevo.");
        }
        return;
      }
      const orbit = data.orbit || "forming";
      const params = new URLSearchParams({
        orbit,
        leadId: data.leadId || "",
        submissionId,
        name: values.fullName,
        email: values.email,
      });
      if (data.bookingUrl) params.set("booking", data.bookingUrl);
      if (data.pending) params.set("pending", "1");
      router.push(`/gracias?${params.toString()}`);
    } catch {
      setScene({ launching: false });
      setServerError("Sin enlace con el servidor. Revisa tu conexión.");
    }
  }

  const transition = reduce
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 260, damping: 28 };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && step < 3 && (e.target as HTMLElement).tagName !== "TEXTAREA") {
          e.preventDefault();
          void next();
        }
      }}
      className="paper-card relative w-full p-5 md:p-8"
      noValidate
    >
      <div className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brass">
          Expediente
        </p>
        <ol className="mt-4 flex gap-1" aria-label="Progreso">
          {STEPS.map((label, i) => (
            <li key={label} className="flex-1">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className="w-full text-left"
                aria-current={i === step ? "step" : undefined}
              >
                <span
                  className={`block h-[3px] w-full ${i <= step ? "bg-bone" : "bg-line"}`}
                />
                <span className={`mt-2 block font-mono text-[10px] uppercase tracking-widest ${i === step ? "text-bone" : "text-ash"}`}>
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div aria-live="polite" className="sr-only">
        {form.formState.errors.fullName?.message}
        {form.formState.errors.email?.message}
        {form.formState.errors.phone?.message}
        {serverError}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -18 }}
          transition={transition}
        >
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nombre completo</Label>
                <input
                  id="fullName"
                  autoComplete="name"
                  className="field w-full font-display"
                  {...form.register("fullName")}
                />
                <FieldError message={form.formState.errors.fullName?.message} />
              </div>
              <div>
                <Label htmlFor="email">Correo</Label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={EMAIL_MAX}
                  placeholder="nombre@empresa.mx"
                  className="field w-full font-mono text-sm"
                  {...emailField}
                  onChange={(e) => {
                    e.target.value = sanitizeEmailInput(e.target.value);
                    void emailField.onChange(e);
                  }}
                  onBeforeInput={(e) => {
                    const data = e.data;
                    if (data && data.length === 1 && !/[a-zA-Z0-9.@_%+-]/.test(data)) {
                      e.preventDefault();
                    }
                  }}
                />
                <FieldError message={form.formState.errors.email?.message} />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <div className="flex gap-2">
                  <Controller
                    control={form.control}
                    name="phoneCountry"
                    render={({ field }) => (
                      <select
                        id="phoneCountry"
                        aria-label="País del teléfono"
                        className="field w-28 font-mono text-xs"
                        {...field}
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.iso} value={c.iso}>
                            {c.iso} {c.dial}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel-national"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={PHONE_MAX_DIGITS}
                    placeholder="5512345678"
                    className="field flex-1 font-mono"
                    {...phoneField}
                    onChange={(e) => {
                      e.target.value = sanitizePhoneInput(e.target.value);
                      void phoneField.onChange(e);
                    }}
                    onBeforeInput={(e) => {
                      const data = e.data;
                      if (data && data.length === 1 && !/\d/.test(data)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <FieldError message={form.formState.errors.phone?.message} />
              </div>
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
                <label htmlFor="website">Sitio web</label>
                <input
                  id="website"
                  tabIndex={-1}
                  autoComplete="off"
                  {...form.register("website")}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="company">Empresa</Label>
                <input
                  id="company"
                  autoComplete="organization"
                  className="field w-full"
                  {...form.register("company")}
                />
                <FieldError message={form.formState.errors.company?.message} />
              </div>
              <fieldset>
                <legend className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ash">
                  Nicho
                </legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {NICHES.map((n) => (
                    <label
                      key={n.value}
                      className={`cursor-pointer border px-3 py-3 text-sm transition ${
                        form.watch("niche") === n.value
                          ? "border-plasma text-plasma glow-line"
                          : "border-line text-bone hover:border-ash"
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        value={n.value}
                        {...form.register("niche")}
                      />
                      {n.label}
                    </label>
                  ))}
                </div>
                <FieldError message={form.formState.errors.niche?.message} />
              </fieldset>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <fieldset>
                <legend className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ash">
                  Presupuesto mensual (MXN)
                </legend>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {BUDGETS.map((b, i) => (
                    <label
                      key={b.value}
                      className={`cursor-pointer border px-2 py-3 text-center transition ${
                        form.watch("budget") === b.value
                          ? "border-plasma text-plasma glow-line"
                          : "border-line hover:border-ash"
                      }`}
                    >
                      <input type="radio" className="sr-only" value={b.value} {...form.register("budget")} />
                      <span className="block font-mono text-[10px] text-ash">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-1 block text-sm">{b.label}</span>
                    </label>
                  ))}
                </div>
                <FieldError message={form.formState.errors.budget?.message} />
              </fieldset>

              <fieldset>
                <legend className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ash">
                  Urgencia
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {URGENCIES.map((u) => (
                    <label
                      key={u.value}
                      className={`cursor-pointer border px-3 py-3 text-sm transition ${
                        form.watch("urgency") === u.value
                          ? "border-ember text-ember"
                          : "border-line hover:border-ash"
                      }`}
                    >
                      <input type="radio" className="sr-only" value={u.value} {...form.register("urgency")} />
                      {u.label}
                    </label>
                  ))}
                </div>
                <FieldError message={form.formState.errors.urgency?.message} />
              </fieldset>

              <fieldset>
                <legend className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ash">
                  Necesidad principal
                </legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {NEEDS.map((n) => (
                    <label
                      key={n.value}
                      className={`cursor-pointer border px-3 py-4 text-sm transition hover:-translate-y-0.5 ${
                        form.watch("need") === n.value
                          ? "border-ice text-ice"
                          : "border-line hover:border-ice/40"
                      }`}
                    >
                      <input type="radio" className="sr-only" value={n.value} {...form.register("need")} />
                      {n.label}
                    </label>
                  ))}
                </div>
                <FieldError message={form.formState.errors.need?.message} />
              </fieldset>

              <div>
                <Label htmlFor="message">Mensaje (opcional)</Label>
                <textarea
                  id="message"
                  rows={3}
                  maxLength={500}
                  className="field w-full text-sm"
                  {...form.register("message")}
                />
                <FieldError message={form.formState.errors.message?.message} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <dl className="space-y-2 border border-line p-4 font-mono text-xs text-ash">
                <div className="flex justify-between gap-4">
                  <dt>Nombre</dt>
                  <dd className="text-bone">{form.getValues("fullName")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Correo</dt>
                  <dd className="text-bone">{form.getValues("email")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Empresa</dt>
                  <dd className="text-bone">{form.getValues("company")}</dd>
                </div>
              </dl>
              <label className="flex items-start gap-3 text-sm leading-relaxed">
                <input type="checkbox" className="mt-1 accent-[#1c1915]" {...form.register("consent")} />
                <span>
                  Autorizo el tratamiento de mis datos para contactarme sobre este proyecto. Ver{" "}
                  <a className="text-brass underline" href="/privacidad">
                    aviso de privacidad
                  </a>
                  .
                </span>
              </label>
              <FieldError message={form.formState.errors.consent?.message} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {serverError && (
        <p className="mt-4 font-serif italic text-ember" role="alert">
          {serverError}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-ash disabled:opacity-30"
        >
          Atrás
        </button>
        {step < 3 ? (
          <button
            type="button"
            onClick={() => void next()}
            className="bg-bone px-5 py-3 font-display text-sm font-medium text-void"
          >
            Continuar
          </button>
        ) : (
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="bg-bone px-5 py-3 font-display text-sm font-medium text-void disabled:opacity-60"
          >
            {form.formState.isSubmitting ? "Enviando…" : "Enviar briefing"}
          </button>
        )}
      </div>
      <p className="sr-only">{orbitFromTier("C")}</p>
    </form>
  );
}
