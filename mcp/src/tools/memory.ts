import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { analyzeConversation } from "./htca.js";

const storeSchema = z.object({
  sessionId: z.string().min(1),
  role: z.enum(["system", "user", "assistant"]).default("user"),
  content: z.string().min(1),
});

export function createMemoryRoutes() {
  return {
    /**
     * Stores a new message in a conversation.
     * Finds the conversation by `sessionId` or creates a new one.
     */
    store: async (req: Request, res: Response) => {
      const parsed = storeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }
      const { sessionId, role, content } = parsed.data;

      const message = await prisma.message.create({
        data: {
          role,
          content,
          conversation: {
            connectOrCreate: {
              where: { sessionId },
              create: { sessionId },
            },
          },
        },
      });

      return res.json({ ok: true, message });
    },

    /**
     * Retrieves all messages for a given session.
     */
    retrieve: async (req: Request, res: Response) => {
      const sessionId = String(req.query.sessionId || "");
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId required" });
      }

      const conversation = await prisma.conversation.findUnique({
        where: { sessionId },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: limit,
          },
        },
      });

      return res.json({
        sessionId,
        memories: conversation ? conversation.messages.reverse() : [],
      });
    },

    /**
     * Summarizes a conversation using HTCA.
     */
    summarize: async (req: Request, res: Response) => {
      const sessionId = String(req.query.sessionId || "");
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId required" });
      }

      const conversation = await prisma.conversation.findUnique({
        where: { sessionId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });

      if (!conversation || conversation.messages.length === 0) {
        return res.status(404).json({ error: "Conversation not found or is empty." });
      }

      // We can use the analysis already stored on the conversation,
      // or re-analyze for a fresh summary. Let's re-analyze.
      const analysis = analyzeConversation(conversation.messages);

      const summary = `Conversation (${sessionId}) has ${conversation.messages.length} messages. Coherence is ${analysis.coherenceScore}. The tone arc is: ${analysis.toneArc}.`;

      return res.json({ sessionId, summary, analysis });
    },
  };
}
