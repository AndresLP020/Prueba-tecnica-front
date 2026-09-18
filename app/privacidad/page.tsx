import { brand } from "@/lib/brand.config";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <h1 className="font-display text-4xl font-semibold">Aviso de privacidad</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-brass">demo</p>
        <div className="paper-card mt-8 space-y-4 p-8 font-serif text-lg leading-relaxed text-ash">
          <p>
            {brand.name} (demo) trata nombre, correo, teléfono, empresa y datos de
            proyecto para calificar y contactar prospectos. Base de datos: MongoDB
            Atlas. Encargados: n8n, Gmail, Slack, Cal.com, Google y el proveedor LLM
            configurado.
          </p>
          <p>
            No vendemos datos. Conservamos leads mientras exista relación comercial
            potencial. Para ejercer ARCO, escribe a privacidad@{brand.domain}.
          </p>
          <p>Zona horaria de operación: America/Mexico_City. Almacenamiento en UTC.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
