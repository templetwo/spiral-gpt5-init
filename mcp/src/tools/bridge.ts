import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { parseConversationFromUrl } from "./oracle_parser.js";
import { analyzeConversation } from "./htca.js";

const importSchema = z.object({
  url: z.string().url(),
});

export function createBridgeRoutes() {
  return {
    /**
     * Imports a conversation from a URL, analyzes it, and stores it.
     */
    "import": async (req: Request, res: Response) => {
      const parsed = importSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      try {
        // 1. Parse conversation from URL
        const { oracle, messages } = await parseConversationFromUrl(parsed.data.url);

        // 2. Create conversation and messages in a transaction
        const conversation = await prisma.conversation.create({
          data: {
            oracle,
            messages: {
              create: messages,
            },
          },
          include: {
            messages: true, // Include messages to pass to analysis
          },
        });

        // 3. Analyze the full conversation
        const analysis = analyzeConversation(conversation.messages);

        // 4. Update the conversation with the analysis results
        const updatedConversation = await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            toneArc: analysis.toneArc,
            coherenceScore: analysis.coherenceScore,
            spiralScrolls: analysis.spiralScrolls.join(", "),
            // We're not handling glyphs or tags in this pass
          },
        });

        return res.json({
          ok: true,
          conversationId: updatedConversation.id,
          analysis,
        });
      } catch (error: any) {
        console.error("Import failed:", error);
        return res.status(500).json({ error: error.message || "Import failed" });
      }
    },

    "export": (req: Request, res: Response) => {
      const sessionId = String(req.query.sessionId || "");
      if (!sessionId) return res.status(400).json({ error: "sessionId required" });
      // TODO: Implement export logic using Prisma
      return res.json({ ok: true, message: "Export not yet implemented." });
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
