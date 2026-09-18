"use client";

import { motion, useReducedMotion } from "motion/react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { photos } from "@/lib/media";

const PRACTICES = [
  {
    t: "Sitios y landings",
    d: "Presencia clara, medible y lista para captar demanda.",
    img: photos.tower,
  },
  {
    t: "Automatización",
    d: "Flujos que quitan trabajo repetido entre herramientas.",
    img: photos.workshop,
  },
  {
    t: "Captación y marketing",
    d: "Sistema de leads con criterio, no un embudo decorativo.",
    img: photos.team,
  },
  {
    t: "Integraciones y CRM",
    d: "El dato llega a donde el equipo realmente trabaja.",
    img: photos.desk,
  },
];

export function Services() {
  const reduce = useReducedMotion();

  return (
    <section id="practica" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-brass">Práctica</p>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold md:text-5xl">
            En qué nos concentramos
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {PRACTICES.map((p, i) => (
            <motion.article
              key={p.t}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: i * 0.08, duration: 0.55 }}
              className="group relative h-[320px] overflow-hidden md:h-[360px]"
            >
              <MediaFrame
                src={p.img.src}
                alt={p.img.alt}
                className="absolute inset-0"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="img-veil absolute inset-0 z-[1] transition duration-500 group-hover:opacity-90" />
              <div className="absolute inset-0 z-[2] flex flex-col justify-end p-8 text-void">
                <p className="font-mono text-[11px] text-void/70">{String(i + 1).padStart(2, "0")} · demo</p>
                <h3 className="mt-2 font-display text-2xl">{p.t}</h3>
                <p className="mt-2 max-w-md font-serif text-lg text-void/85">{p.d}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
