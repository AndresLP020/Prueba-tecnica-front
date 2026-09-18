"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { orbitCopy, type OrbitKind } from "@/lib/brand.config";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

function isOrbit(v: string | null): v is OrbitKind {
  return v === "priority" || v === "stable" || v === "forming";
}

export function GraciasView() {
  const params = useSearchParams();
  const raw = params.get("orbit");
  const orbit: OrbitKind = isOrbit(raw) ? raw : "forming";
  const copy = orbitCopy[orbit];
  const booking = params.get("booking");
  const leadId = params.get("leadId") || "";
  const submissionId = params.get("submissionId") || "";
  const name = params.get("name") || "";
  const email = params.get("email") || "";
  const pending = params.get("pending") === "1";
  const [extraOk, setExtraOk] = useState(false);
  const [extraError, setExtraError] = useState<string | null>(null);

  const embed = useMemo(() => {
    if (!booking) return null;
    const url = new URL(booking);
    url.searchParams.set("embed", "true");
    url.searchParams.set("theme", "light");
    if (name) url.searchParams.set("name", name);
    if (email) url.searchParams.set("email", email);
    if (leadId) url.searchParams.set("metadata[leadId]", leadId);
    return url.toString();
  }, [booking, name, email, leadId]);

  async function onNurture(form: FormData) {
    setExtraError(null);
    const res = await fetch("/api/leads/nurture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId,
        submissionId,
        teamSize: form.get("teamSize"),
        timelineBudget: form.get("timelineBudget"),
        biggestBlocker: form.get("biggestBlocker"),
      }),
    });
    if (!res.ok) {
      setExtraError("No se pudo guardar. Intenta de nuevo.");
      return;
    }
    setExtraOk(true);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[70svh] max-w-4xl flex-col px-4 py-14 md:px-8">
        <DemoBadge className="w-fit" />
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-brass">{copy.kicker}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">{copy.title}</h1>
        <p className="mt-4 max-w-xl font-serif text-xl text-ash">{copy.body}</p>
        {pending && (
          <p className="mt-4 font-serif italic text-ash">
            Recibimos el briefing. Te confirmamos en cuanto termine de procesarse.
          </p>
        )}

        <div className="paper-card mt-10 p-6">
          {orbit === "priority" && embed && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
                Agenda inmediata · 15 min · 48 h
              </p>
              <iframe
                title="Reservar llamada prioritaria"
                src={embed}
                className="mt-4 h-[640px] w-full border border-line"
              />
            </div>
          )}
          {orbit === "stable" && embed && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
                Sesión de discovery · 30 min
              </p>
              <a href={embed} className="mt-4 inline-block bg-bone px-5 py-3 text-sm text-void">
                Elegir horario
              </a>
              <iframe
                title="Reservar discovery"
                src={embed}
                className="mt-4 h-[560px] w-full border border-line"
              />
            </div>
          )}
          {orbit === "forming" && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
                Tres preguntas para afinar
              </p>
              {extraOk ? (
                <p className="mt-4 font-serif text-lg italic text-ash">
                  Recibido. Te escribimos con el siguiente material.
                </p>
              ) : (
                <form
                  className="mt-4 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void onNurture(new FormData(e.currentTarget));
                  }}
                >
                  <label className="block text-sm">
                    Tamaño de equipo
                    <select name="teamSize" required className="field mt-1 w-full">
                      <option value="solo">Solo yo</option>
                      <option value="2_10">2–10</option>
                      <option value="11_50">11–50</option>
                      <option value="50_plus">Más de 50</option>
                    </select>
                  </label>
                  <label className="block text-sm">
                    Presupuesto
                    <select name="timelineBudget" required className="field mt-1 w-full">
                      <option value="flexible">Aún flexible</option>
                      <option value="this_quarter">Este trimestre</option>
                      <option value="approved">Ya aprobado</option>
                    </select>
                  </label>
                  <label className="block text-sm">
                    El mayor bloqueo ahora
                    <textarea
                      name="biggestBlocker"
                      required
                      minLength={4}
                      maxLength={280}
                      className="field mt-1 w-full"
                    />
                  </label>
                  {extraError && <p className="text-ember">{extraError}</p>}
                  <button className="bg-bone px-4 py-2 text-sm text-void" type="submit">
                    Enviar
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
        <Link href="/" className="mt-10 font-mono text-[11px] uppercase tracking-[0.2em] text-ash">
          Volver al inicio
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
