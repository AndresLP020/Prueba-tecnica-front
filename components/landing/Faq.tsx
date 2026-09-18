"use client";

import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { photos } from "@/lib/media";

const ITEMS = [
  {
    q: "¿Cuánto tarda la primera respuesta?",
    a: "En un día hábil. Si el proyecto es de alta prioridad, hay una ventana de 15 minutos en 48 horas.",
  },
  {
    q: "¿Qué hacen con mis datos?",
    a: "Solo para contactarte sobre este proyecto. El detalle está en el aviso de privacidad.",
  },
  {
    q: "¿Trabajan fuera de México?",
    a: "Sí, de forma remota en LATAM. La operación y la agenda se manejan en zona America/Mexico_City.",
  },
  {
    q: "¿Esto es una agencia real?",
    a: "Este sitio es una demostración técnica (demo). El flujo sí califica y registra prospectos cuando las credenciales están activas.",
  },
];

export function Faq() {
  return (
    <section id="preguntas" className="border-b border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[0.8fr_1.2fr] md:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-brass">Preguntas</p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-5xl">Antes de escribirnos</h2>
          <div className="relative mt-8 hidden overflow-hidden md:block h-64">
            <MediaFrame src={photos.desk.src} alt={photos.desk.alt} className="absolute inset-0" />
            <div className="img-veil absolute inset-0 z-[1]" />
            <p className="absolute bottom-4 left-4 z-[2] font-mono text-[10px] uppercase tracking-widest text-void">
              Mesa de trabajo · demo
            </p>
          </div>
        </Reveal>
        <div className="divide-y divide-line border-y border-line">
          {ITEMS.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.05}>
              <details className="group py-5">
                <summary className="cursor-pointer list-none font-display text-lg marker:content-none">
                  <span className="flex items-start justify-between gap-4">
                    {item.q}
                    <span className="font-mono text-ash group-open:hidden">+</span>
                    <span className="hidden font-mono text-ash group-open:inline">–</span>
                  </span>
                </summary>
                <p className="mt-3 max-w-xl font-serif text-lg text-ash">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
