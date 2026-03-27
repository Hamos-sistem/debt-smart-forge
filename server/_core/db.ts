import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // For now, we'll use a simple connection approach
      // The DATABASE_URL is already set from environment
      _db = drizzle(process.env.DATABASE_URL!);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function checkDB() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not initialized");
    return { status: "connected" };
  } catch (err) {
    console.error("❌ DB CONNECTION FAILED:", err);
    throw err;
  }
}
