"use client";

import { motion, useReducedMotion } from "motion/react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { photos } from "@/lib/media";

const STEPS = [
  {
    n: "01",
    t: "Briefing",
    d: "Nos cuentas empresa, presupuesto y necesidad. Validamos datos antes de mover nada.",
    img: photos.desk,
  },
  {
    n: "02",
    t: "Calificación",
    d: "El equipo prioriza internamente. Tú no ves puntajes: ves el siguiente paso que corresponde.",
    img: photos.workshop,
  },
  {
    n: "03",
    t: "Conversación",
    d: "Agenda inmediata, discovery o una secuencia breve si el proyecto aún está en formación.",
    img: photos.meeting,
  },
];

export function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section id="metodo" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-brass">Método</p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-5xl">
            Tres movimientos. Una conversación.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.article
              key={s.n}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduce ? undefined : { y: -8 }}
              className="paper-card overflow-hidden"
            >
            <MediaFrame src={s.img.src} alt={s.img.alt} className="h-44 w-full" />
              <div className="p-6">
                <p className="font-mono text-sm text-brass">{s.n}</p>
                <h3 className="mt-3 font-display text-2xl">{s.t}</h3>
                <p className="mt-3 font-serif text-lg leading-relaxed text-ash">{s.d}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
