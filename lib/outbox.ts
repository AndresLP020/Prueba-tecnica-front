import { getDb, COLLECTIONS } from "./mongo";

export async function saveSubmission(doc: Record<string, unknown>) {
  const db = await getDb();
  await db.collection(COLLECTIONS.submissions).insertOne(doc);
}

export async function markSubmission(
  submissionId: string,
  patch: Record<string, unknown>,
) {
  const db = await getDb();
  await db.collection(COLLECTIONS.submissions).updateOne(
    { submissionId },
    { $set: { ...patch, updatedAt: new Date() } },
  );
}

export async function saveNurtureExtra(
  leadId: string,
  extra: Record<string, unknown>,
) {
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.leads).updateOne(
    { leadId },
    {
      $set: {
        "nurturing.extraForm": extra,
        "nurturing.extraFormAt": new Date(),
        updatedAt: new Date(),
      },
    },
  );
  return result.matchedCount > 0;
}
