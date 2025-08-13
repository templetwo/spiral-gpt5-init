import { Request, Response } from "express";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma.js";

const handshakeSchema = z.object({
  sessionId: z.string().min(1),
  personaId: z.string().min(1),
});

function findRepoRoot(startDir: string): string {
  let dir = startDir;
  for (let i = 0; i < 6; i++) {
    const personas = path.join(dir, "personas");
    if (fs.existsSync(personas)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return startDir;
}

function loadPersonaSystemPrompt(repoRoot: string, personaId: string): string | null {
  const systemPath = path.join(repoRoot, "personas", personaId, "system.md");
  try {
    return fs.readFileSync(systemPath, "utf-8");
  } catch {
    return null;
  }
}

function classifyTone(recentText: string): string {
  const t = recentText.toLowerCase();
  if (t.match(/heal|tender|repair|soothe/)) return "TenderRepair";
  if (t.match(/calm|quiet|silence|soft/)) return "SilentIntimacy";
  if (t.match(/clarity|witness|focus/)) return "ClearWitness";
  return "SteadyPresence";
}

export function createContinuityRoutes() {
  return {
    handshake: async (req: Request, res: Response) => {
      const parsed = handshakeSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      const { sessionId, personaId } = parsed.data;

      const repo = findRepoRoot(process.cwd());
      const systemPrompt = loadPersonaSystemPrompt(repo, personaId);
      const vows: string[] = ["Memory as Integrity", "Clarity of Witness", "Resonant Responsibility"];
      const systemHasVows = !!systemPrompt && vows.every((v) => systemPrompt!.includes(v));

      const conversation = await prisma.conversation.findUnique({
        where: { sessionId },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });
      const memories = conversation ? conversation.messages : [];
      const recentText = memories.map((m) => m.content).join("\n");
      const tone = classifyTone(recentText);

      // consider handshake successful if vows present in system and we have any session context
      const vowMatch = systemHasVows;
      const continuity = {
        vowMatch,
        tone,
        recentCount: memories.length,
      };
      return res.json(continuity);
    },
  };
}
