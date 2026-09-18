"use client";

import { motion, useReducedMotion } from "motion/react";
import { brand } from "@/lib/brand.config";
import { photos } from "@/lib/media";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { MediaFrame } from "@/components/ui/MediaFrame";

export function Hero() {
  const reduce = useReducedMotion();
  const lines = ["Diseñamos sistemas", "de captación que", "se pueden operar."];

  return (
    <section className="relative isolate h-[92svh] min-h-[640px] overflow-hidden">
      <MediaFrame
        src={photos.hero.src}
        alt={photos.hero.alt}
        kenburns
        priority
        className="absolute inset-0"
        sizes="100vw"
      />
      <div className="img-veil pointer-events-none absolute inset-0 z-[1]" />
      <div className="relative z-10 mx-auto grid h-full max-w-6xl items-end gap-8 px-4 pb-12 pt-28 md:grid-cols-[1.15fr_0.85fr] md:px-8 md:pb-16">
        <div className="text-void">
          <DemoBadge className="border-void/40 text-void" />
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-void/75">
            Ciudad de México · remoto LATAM
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            {lines.map((line, i) => (
              <motion.span
                key={line}
                className="block overflow-hidden"
                initial={reduce ? false : { y: 48, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.12 * i, duration: reduce ? 0.01 : 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {line}
              </motion.span>
            ))}
          </h1>
          <motion.p
            className="mt-6 max-w-lg font-serif text-xl leading-relaxed text-void/85"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
          >
            {brand.name} evalúa encaje, prioridad y siguiente conversación.
            Un briefing de cuatro pasos; respuesta en un día hábil.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.a
              href="#cabina"
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-void px-6 py-3 text-sm font-medium text-bone"
            >
              Iniciar briefing
            </motion.a>
            <motion.a
              href="#metodo"
              whileHover={reduce ? undefined : { y: -2 }}
              className="border border-void/40 px-6 py-3 text-sm text-void"
            >
              Ver el método
            </motion.a>
          </motion.div>
        </div>

        <motion.aside
          className="paper-card overflow-hidden text-bone"
          initial={reduce ? false : { opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
            <span>Estudio · CDMX</span>
            <span>demo</span>
          </div>
          <div className="grid grid-cols-2 gap-1 p-1">
            <MediaFrame src={photos.meeting.src} alt={photos.meeting.alt} className="h-36 md:h-44" />
            <MediaFrame src={photos.studio.src} alt={photos.studio.alt} className="h-36 md:h-44" />
          </div>
          <div className="grid grid-cols-3 border-t border-line">
            {[
              ["Respuesta", "1 día"],
              ["Sesión", "15–30 min"],
              ["Zona", "CDMX"],
            ].map(([k, v]) => (
              <div key={k} className="border-r border-line px-3 py-3 last:border-r-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ash">{k}</p>
                <p className="mt-1 text-sm">{v}</p>
              </div>
            ))}
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
