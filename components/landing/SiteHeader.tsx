"use client";

import { brand } from "@/lib/brand.config";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

export function SiteHeader() {
  const reduce = useReducedMotion();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-void/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/" className="font-display text-sm font-bold tracking-[0.28em]">
          {brand.name}
        </Link>
        <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.18em] text-ash md:flex">
          <a href="#metodo" className="transition hover:text-bone">
            Método
          </a>
          <a href="#practica" className="transition hover:text-bone">
            Práctica
          </a>
          <a href="#cabina" className="transition hover:text-bone">
            Briefing
          </a>
          <a href="#preguntas" className="transition hover:text-bone">
            Preguntas
          </a>
        </nav>
        <motion.a
          href="#cabina"
          whileHover={reduce ? undefined : { y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-bone px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-void"
        >
          Solicitar consulta
        </motion.a>
      </div>
    </header>
  );
}
