"use client";

import { LeadForm } from "./LeadForm";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { photos } from "@/lib/media";

export function LeadDock() {
  return (
    <section id="cabina" className="border-b border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[0.85fr_1.15fr] md:px-8">
        <Reveal>
          <div className="relative mb-8 h-56 w-full overflow-hidden md:h-72">
            <MediaFrame
              src={photos.city.src}
              alt={photos.city.alt}
              kenburns
              className="absolute inset-0"
            />
            <div className="img-veil pointer-events-none absolute inset-0 z-[1]" />
            <p className="absolute bottom-4 left-4 z-[2] font-mono text-[10px] uppercase tracking-widest text-void">
              CDMX · foto de archivo · demo
            </p>
          </div>
          <DemoBadge />
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-5xl">
            Briefing de proyecto
          </h2>
          <p className="mt-4 font-serif text-xl italic text-ash">
            Cuatro pasos. Un expediente. Sin puntaje a la vista.
          </p>
          <ul className="mt-10 space-y-5 text-sm">
            <li className="border-l-2 border-brass pl-4">
              <p className="font-display">Qué necesitamos</p>
              <p className="mt-1 text-ash">Nombre, correo, teléfono, empresa, presupuesto y urgencia.</p>
            </li>
            <li className="border-l-2 border-brass pl-4">
              <p className="font-display">Qué ocurre después</p>
              <p className="mt-1 text-ash">
                Confirmación por correo y, si aplica, un enlace para agendar.
              </p>
            </li>
            <li className="border-l-2 border-brass pl-4">
              <p className="font-display">Horario de mesa</p>
              <p className="mt-1 text-ash">Lunes a viernes, 09:00–18:00 America/Mexico_City.</p>
            </li>
          </ul>
        </Reveal>
        <Reveal delay={0.12}>
          <LeadForm />
        </Reveal>
      </div>
    </section>
  );
}
