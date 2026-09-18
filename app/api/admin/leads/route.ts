import { isAdminRequest } from "@/lib/adminAuth";
import { getDb, COLLECTIONS } from "@/lib/mongo";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdminRequest())) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const url = new URL(req.url);
  const tier = url.searchParams.get("tier");
  const status = url.searchParams.get("status");
  const q: Record<string, unknown> = {};
  if (tier && ["A", "B", "C"].includes(tier)) q.tier = tier;
  if (status) q.status = status;

  const db = await getDb();
  const leads = await db
    .collection(COLLECTIONS.leads)
    .find(q)
    .project({
      fullName: 1,
      emailNormalized: 1,
      company: 1,
      tier: 1,
      score: 1,
      status: 1,
      leadId: 1,
      createdAt: 1,
      flags: 1,
      bookingUrl: 1,
    })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  const [total, byTier] = await Promise.all([
    db.collection(COLLECTIONS.leads).countDocuments(),
    db.collection(COLLECTIONS.leads).aggregate([{ $group: { _id: "$tier", n: { $sum: 1 } } }]).toArray(),
  ]);

  return Response.json({
    ok: true,
    kpis: {
      total,
      A: byTier.find((t) => t._id === "A")?.n ?? 0,
      B: byTier.find((t) => t._id === "B")?.n ?? 0,
      C: byTier.find((t) => t._id === "C")?.n ?? 0,
    },
    leads,
  });
}
