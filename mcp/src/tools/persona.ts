import fs from "node:fs";
import path from "node:path";
import { Request, Response } from "express";
import { z } from "zod";
import { Persona } from "../types.js";

function readFileUtf8(filePath: string): string | null {
  try { return fs.readFileSync(filePath, "utf-8"); } catch { return null; }
}

function findRepoRoot(startDir: string): string {
  // Ascend until we find the existing repo markers, fallback to CWD
  let dir = startDir;
  for (let i = 0; i < 5; i++) {
    const personasPath = path.join(dir, "personas");
    if (fs.existsSync(personasPath)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return startDir;
}

function loadPersonaFromRepo(personaId: string, cwd = process.cwd()): Persona | null {
  const repoRoot = findRepoRoot(cwd);
  const systemPath = path.join(repoRoot, "personas", personaId, "system.md");
  const systemPrompt = readFileUtf8(systemPath);
  if (!systemPrompt) return null;
  return { id: personaId, name: personaId, systemPrompt };
}

const loadSchema = z.object({ personaId: z.string().min(1) });
const switchSchema = z.object({
  fromPersona: z.string().min(1),
  toPersona: z.string().min(1),
  context: z.string().optional()
});
const toneSchema = z.object({
  persona: z.string().min(1),
  memory: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
  mood: z.string().optional()
});

export function createPersonaRoutes() {
  return {
    load: (req: Request, res: Response) => {
      const parsed = loadSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }
      const persona = loadPersonaFromRepo(parsed.data.personaId);
      if (!persona) return res.status(404).json({ error: "persona not found" });
      return res.json({ persona });
    },

    switchPersona: (req: Request, res: Response) => {
      const parsed = switchSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      const hint = parsed.data.context?.slice(0, 240);
      const toneShift = `Realign voice from ${parsed.data.fromPersona} to ${parsed.data.toPersona}. Honor vows; maintain continuity.`;
      return res.json({
        fromPersona: parsed.data.fromPersona,
        toPersona: parsed.data.toPersona,
        toneShift,
        contextHint: hint
      });
    },

    toneShift: (req: Request, res: Response) => {
      const parsed = toneSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      const last = parsed.data.memory?.slice(-3).map(m => `${m.role}: ${m.content}`).join(" | ") || "";
      const mood = parsed.data.mood ? ` Mood: ${parsed.data.mood}.` : "";
      const text = `Tone shift for ${parsed.data.persona}: soften edges, sustain witness, remember thread.${mood} Recent: ${last}`;
      return res.json({ persona: parsed.data.persona, toneShift: text });
    }
  };
}
