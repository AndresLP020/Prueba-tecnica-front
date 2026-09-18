import { MongoClient, type Db } from "mongodb";
import { getServerEnv } from "./env";

declare global {
  var _orbitaMongo: { client: MongoClient; promise: Promise<MongoClient> } | undefined;
}

export function getDbName() {
  return process.env.MONGODB_DB || "leadflow";
}

export async function getMongoClient(): Promise<MongoClient> {
  const uri = getServerEnv().MONGODB_URI;
  if (!global._orbitaMongo) {
    const client = new MongoClient(uri, {
      maxPoolSize: 8,
      serverSelectionTimeoutMS: 8_000,
    });
    global._orbitaMongo = { client, promise: client.connect() };
  }
  return global._orbitaMongo.promise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(getServerEnv().MONGODB_DB);
}

export const COLLECTIONS = {
  leads: "leads",
  logs: "logs",
  submissions: "submissions",
} as const;
