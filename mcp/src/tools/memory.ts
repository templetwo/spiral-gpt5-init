import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type Database from "better-sqlite3";
import { DateRange, Memory } from "../types.js";
import { exportConversationState, getMemories, insertMemory } from "../db.js";

const storeSchema = z.object({
  sessionId: z.string().min(1),
  role: z.enum(["system", "user", "assistant"]).default("user"),
  content: z.string().min(1)
});

export function createMemoryRoutes(db: Database.Database) {
  return {
    store: (req: Request, res: Response) => {
      const parsed = storeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
        }
      const now = new Date().toISOString();
      const memory: Memory = {
        id: randomUUID(),
        sessionId: parsed.data.sessionId,
        role: parsed.data.role,
        content: parsed.data.content,
        createdAt: now
      };
      insertMemory(db, memory);
      return res.json({ ok: true, memory });
    },

    retrieve: (req: Request, res: Response) => {
      const sessionId = String(req.query.sessionId || "");
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId required" });
      }
      const rows = getMemories(db, sessionId, limit);
      return res.json({ sessionId, memories: rows });
    },

    summarize: (req: Request, res: Response) => {
      const sessionId = String(req.query.sessionId || "");
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId required" });
      }
      const range: DateRange | undefined = undefined; // placeholder
      const state = exportConversationState(db, sessionId);
      const text = state.messages
        .map((m: { role: string; content: string }) => `[${m.role}] ${m.content}`)
        .join("\n");
      // naive summary: first+last and counts
      const first = (state.messages[0] as { content?: string } | undefined)?.content || "";
      const last = (state.messages[state.messages.length - 1] as { content?: string } | undefined)?.content || "";
      const summary = `Conversation length: ${state.messages.length}. First: ${first.slice(0,120)} ... Last: ${last.slice(0,120)}`;
      return res.json({ sessionId, range, summary });
    }
  };
}
