import { nurtureSchema } from "@/lib/schemas";
import { saveNurtureExtra } from "@/lib/outbox";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const parsed = nurtureSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Campos inválidos" }, { status: 400 });
  }
  try {
    const ok = await saveNurtureExtra(parsed.data.leadId, parsed.data);
    if (!ok) {
      return Response.json({ ok: false, error: "No encontramos tu órbita" }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "No se pudo guardar" }, { status: 500 });
  }
}
