"use client";

import { useReducedMotion } from "motion/react";

const ITEMS = [
  "E-commerce",
  "SaaS",
  "Salud",
  "Inmobiliaria",
  "Educación",
  "Hospitalidad",
  "Servicios profesionales",
  "CRM",
];

export function Marquee() {
  const reduce = useReducedMotion();
  const row = [...ITEMS, ...ITEMS];

  return (
    <div className="overflow-hidden border-b border-line bg-bone text-void">
      <div
        className={`flex w-max gap-10 py-3 font-mono text-[11px] uppercase tracking-[0.28em] ${reduce ? "" : "marquee"}`}
      >
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-10">
            {item}
            <span className="text-brass">●</span>
          </span>
        ))}
      </div>
    </div>
  );
}
