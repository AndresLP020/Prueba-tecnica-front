"use client";

import { motion, useReducedMotion } from "motion/react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { photos } from "@/lib/media";

const QUOTES = [
  {
    q: "Por fin un proceso de primer contacto que no se siente improvisado.",
    a: "Directora de operaciones · servicios profesionales",
    img: photos.portraitA,
  },
  {
    q: "Entendieron el presupuesto y la urgencia sin pedirnos un deck de 40 páginas.",
    a: "Fundador · e-commerce",
    img: photos.portraitB,
  },
];

export function Quotes() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-line bg-[#efe9dc]">
      <div className="mx-auto grid max-w-6xl md:grid-cols-2">
        {QUOTES.map((item, i) => (
          <motion.blockquote
            key={item.a}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: i * 0.12, duration: 0.65 }}
            className="flex gap-5 border-b border-line px-4 py-12 md:border-b-0 md:border-r md:px-10 last:border-r-0"
          >
            <MediaFrame src={item.img.src} alt={item.img.alt} className="h-20 w-20 shrink-0 rounded-full" />
            <div>
              <p className="font-serif text-2xl leading-snug italic md:text-3xl">“{item.q}”</p>
              <footer className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ash">
                {item.a} · demo
              </footer>
            </div>
          </motion.blockquote>
        ))}
      </div>
    </section>
  );
}
