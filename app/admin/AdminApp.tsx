"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LeadRow = {
  leadId: string;
  fullName: string;
  emailNormalized: string;
  company: string;
  tier: string;
  score: number;
  status: string;
  createdAt: string;
};

export function AdminApp() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState<{
    kpis: { total: number; A: number; B: number; C: number };
    leads: LeadRow[];
  } | null>(null);
  const [detail, setDetail] = useState<{ lead: Record<string, unknown>; logs: Record<string, unknown>[] } | null>(null);

  const load = useCallback(async () => {
    const q = new URLSearchParams();
    if (tier) q.set("tier", tier);
    if (status) q.set("status", status);
    const res = await fetch(`/api/admin/leads?${q.toString()}`);
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    setAuthed(true);
    setData((await res.json()) as { kpis: { total: number; A: number; B: number; C: number }; leads: LeadRow[] });
  }, [tier, status]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(t);
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Acceso denegado");
      return;
    }
    await load();
  }

  async function openLead(id: string) {
    const res = await fetch(`/api/admin/leads/${id}`);
    if (res.ok) setDetail((await res.json()) as { lead: Record<string, unknown>; logs: Record<string, unknown>[] });
  }

  if (authed === false || authed === null && !data) {
    return (
      <main className="mx-auto max-w-sm px-4 py-24">
        <h1 className="font-display text-3xl">Panel</h1>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">noindex · demo</p>
        <form onSubmit={login} className="mt-8 space-y-4">
          <label className="block text-sm">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-line bg-void px-3 py-2"
            />
          </label>
          {error && <p className="text-ember">{error}</p>}
          <button className="w-full bg-plasma py-3 font-bold text-void" type="submit">
            Entrar
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Órbitas</h1>
        <button
          className="font-mono text-[11px] uppercase text-ash"
          onClick={async () => {
            await fetch("/api/admin/login", { method: "DELETE" });
            router.refresh();
            setAuthed(false);
          }}
        >
          Salir
        </button>
      </div>
      {data && (
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {(["total", "A", "B", "C"] as const).map((k) => (
            <div key={k} className="border border-line p-4">
              <p className="font-mono text-[10px] uppercase text-ash">{k}</p>
              <p className="font-mono text-3xl text-plasma">{data.kpis[k]}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex gap-3">
        <select value={tier} onChange={(e) => setTier(e.target.value)} className="border border-line bg-void px-2 py-2 text-sm">
          <option value="">Tier</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
        <input
          placeholder="estado"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-line bg-void px-2 py-2 text-sm"
        />
      </div>
      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[720px] text-left font-mono text-xs">
          <thead className="text-ash">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Tier</th>
              <th className="p-3">Score</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data?.leads.map((l) => (
              <tr
                key={l.leadId}
                className="cursor-pointer border-t border-line hover:bg-white/5"
                onClick={() => void openLead(l.leadId)}
              >
                <td className="p-3">{l.fullName}</td>
                <td className="p-3">{l.emailNormalized}</td>
                <td className="p-3 text-plasma">{l.tier}</td>
                <td className="p-3">{l.score}</td>
                <td className="p-3">{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detail && (
        <section className="mt-8 border border-line p-4">
          <h2 className="font-display text-xl">Detalle</h2>
          <pre className="mt-3 overflow-x-auto text-[11px] text-ash">
            {JSON.stringify(detail.lead, null, 2)}
          </pre>
          <h3 className="mt-4 font-mono text-xs uppercase text-ice">Timeline</h3>
          <ul className="mt-2 space-y-2 font-mono text-xs">
            {detail.logs.map((log, i) => (
              <li key={i} className="border-l border-plasma pl-3">
                {String(log.ts)} · {String(log.step)} · {String(log.status)} · {String(log.message)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
