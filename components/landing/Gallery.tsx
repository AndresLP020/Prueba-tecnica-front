"use client";

import { motion, useReducedMotion } from "motion/react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { photos } from "@/lib/media";

const SHOTS = [
  { img: photos.city, label: "Base CDMX", tall: true },
  { img: photos.studio, label: "Mesa de trabajo", tall: false },
  { img: photos.team, label: "Sesión de equipo", tall: false },
];

export function Gallery() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-line bg-[#efe9dc]">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-brass">Estudio</p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">El espacio, no el pitch</h2>
        </Reveal>
        <div className="mt-10 grid gap-3 md:grid-cols-3 md:grid-rows-2">
          {SHOTS.map((shot, i) => (
            <motion.figure
              key={shot.label}
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className={shot.tall ? "md:row-span-2" : ""}
            >
              <MediaFrame
                src={shot.img.src}
                alt={shot.img.alt}
                className={shot.tall ? "h-[280px] md:h-[540px]" : "h-52"}
              />
              <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ash">
                {shot.label} · foto de archivo · demo
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
