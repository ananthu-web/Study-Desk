import "server-only";
import { MongoClient } from "mongodb";
import { getAuthConfig } from "@/server/auth/config";

type Connection = { client: MongoClient; db: ReturnType<MongoClient["db"]> };
const shared = globalThis as typeof globalThis & { studyDeskDatabase?: Promise<Connection> };

export function getDatabase(): Promise<Connection> {
  if (!shared.studyDeskDatabase) {
    const { uri, databaseName } = getAuthConfig();
    const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000, timeoutMS: 10000 });
    shared.studyDeskDatabase = client.connect().then(() => ({ client, db: client.db(databaseName) })).catch(async () => {
      shared.studyDeskDatabase = undefined;
      await client.close().catch(() => undefined);
      throw new Error("Database connection unavailable.");
    });
  }
  return shared.studyDeskDatabase;
}
