import { Request, Response } from "express";
import type Database from "better-sqlite3";
import { exportConversationState } from "../db.js";
import { ConversationState } from "../types.js";

export function createBridgeRoutes(db: Database.Database) {
  return {
    export: (req: Request, res: Response) => {
      const sessionId = String(req.query.sessionId || "");
      if (!sessionId) return res.status(400).json({ error: "sessionId required" });
      const state = exportConversationState(db, sessionId) as ConversationState;
      return res.json(state);
    },

    import: (req: Request, res: Response) => {
      // In a fuller build, we would insert messages into a new session
      // Here we validate payload shape and acknowledge
      const payload = req.body as ConversationState | undefined;
      if (!payload?.sessionId || !Array.isArray(payload.messages)) {
        return res.status(400).json({ error: "invalid ConversationState" });
      }
      return res.json({ ok: true });
    },

    handoff: (req: Request, res: Response) => {
      const fromProvider = String(req.body?.fromProvider || "");
      const toProvider = String(req.body?.toProvider || "");
      const sessionId = String(req.body?.sessionId || "");
      if (!fromProvider || !toProvider || !sessionId) {
        return res.status(400).json({ error: "fromProvider, toProvider, sessionId required" });
      }
      return res.json({ ok: true, message: `Handoff planned from ${fromProvider} to ${toProvider} for session ${sessionId}.` });
    }
  };
}
