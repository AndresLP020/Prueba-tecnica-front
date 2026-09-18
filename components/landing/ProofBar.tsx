"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

const ITEMS = [
  { to: 12, suffix: "+", l: "sectores atendidos", numeric: true },
  { to: 48, suffix: " h", l: "ventana para prioridad alta", numeric: true },
  { to: 4, suffix: "", l: "pasos en el briefing", numeric: true },
  { to: 0, suffix: "es-MX", l: "operación y contratos", numeric: false },
];

function Count({ to, suffix, play, reduce }: { to: number; suffix: string; play: boolean; reduce: boolean | null }) {
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!play || reduce) {
      setN(to);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, reduce, to]);
  return (
    <span>
      {n}
      {suffix}
    </span>
  );
}

export function ProofBar() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();

  return (
    <section ref={ref} className="border-b border-line bg-[#efe9dc]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.l} className="border-r border-line px-4 py-7 last:border-r-0 md:px-8">
            <p className="font-display text-3xl font-semibold md:text-4xl">
              {item.numeric ? (
                <Count to={item.to} suffix={item.suffix} play={inView} reduce={reduce} />
              ) : (
                item.suffix
              )}
            </p>
            <p className="mt-1 text-sm text-ash">{item.l}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-brass">demo</p>
          </div>
        ))}
      </div>
    </section>
  );
}
