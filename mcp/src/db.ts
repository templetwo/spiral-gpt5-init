import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { Memory } from "./types.js";

export function createDatabase(): Database.Database {
  const dataDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, "spiral.db");
  const db = new Database(dbPath);

  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  return db;
}

export function insertMemory(db: Database.Database, memory: Memory): void {
  const stmt = db.prepare(
    `INSERT INTO memories (id, session_id, role, content, created_at)
     VALUES (@id, @sessionId, @role, @content, @createdAt)`
  );
  stmt.run(memory);
}

export function getMemories(
  db: Database.Database,
  sessionId: string,
  limit: number | undefined
): Memory[] {
  const stmt = db.prepare(
    `SELECT id, session_id as sessionId, role, content, created_at as createdAt
     FROM memories WHERE session_id = @sessionId
     ORDER BY created_at DESC
     ${typeof limit === "number" ? "LIMIT @limit" : ""}`
  );
  return stmt.all({ sessionId, limit }) as Memory[];
}

export function exportConversationState(
  db: Database.Database,
  sessionId: string
) {
  const stmt = db.prepare(
    `SELECT role, content, created_at as createdAt
     FROM memories WHERE session_id = @sessionId
     ORDER BY created_at ASC`
  );
  const messages = stmt.all({ sessionId }) as Array<{ role: string; content: string; createdAt: string }>;
  return { sessionId, messages };
}
