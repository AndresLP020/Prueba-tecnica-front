import { brand } from "@/lib/brand.config";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-[#1c1915] text-[#f4f0e7]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <p className="font-display text-sm tracking-[0.28em]">{brand.name}</p>
          <p className="mt-4 max-w-sm font-serif text-lg italic text-[#cfc6b6]">
            Consultoría de crecimiento. Contenido de ejemplo para una prueba técnica.
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#cfc6b6]">Navegar</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href="#metodo" className="hover:underline">
                Método
              </a>
            </li>
            <li>
              <a href="#cabina" className="hover:underline">
                Briefing
              </a>
            </li>
            <li>
              <Link href="/privacidad" className="hover:underline">
                Aviso de privacidad
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#cfc6b6]">Contacto demo</p>
          <p className="mt-4 font-mono text-sm">hola@{brand.domain}</p>
          <p className="mt-1 text-sm text-[#cfc6b6]">Lun–vie, 09:00–18:00 CDMX</p>
        </div>
      </div>
    </footer>
  );
}
