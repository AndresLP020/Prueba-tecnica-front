import { isAdminRequest } from "@/lib/adminAuth";
import { getDb, COLLECTIONS } from "@/lib/mongo";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest())) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const { id } = await ctx.params;
  const db = await getDb();
  const lead = await db.collection(COLLECTIONS.leads).findOne({ leadId: id });
  if (!lead) return Response.json({ ok: false }, { status: 404 });
  const logs = await db
    .collection(COLLECTIONS.logs)
    .find({ $or: [{ leadId: id }, { submissionId: lead.submissionId }] })
    .sort({ ts: 1 })
    .limit(200)
    .toArray();
  return Response.json({ ok: true, lead, logs });
}
