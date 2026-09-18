import { ADMIN_COOKIE, createAdminCookie } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let password = "";
  try {
    const body = (await req.json()) as { password?: string };
    password = body.password || "";
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const cookie = createAdminCookie(password);
  if (!cookie) {
    return Response.json({ ok: false, error: "Credencial inválida" }, { status: 401 });
  }
  const secure = process.env.NODE_ENV === "production";
  const headers = new Headers({ "Content-Type": "application/json" });
  headers.append(
    "Set-Cookie",
    `${cookie.name}=${cookie.value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${cookie.maxAge}${secure ? "; Secure" : ""}`,
  );
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

export async function DELETE() {
  const headers = new Headers({ "Content-Type": "application/json" });
  headers.append("Set-Cookie", `${ADMIN_COOKIE}=; Path=/; HttpOnly; Max-Age=0`);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
