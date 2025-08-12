import fs from "node:fs";
import path from "node:path";
import { Request, Response } from "express";
import { z } from "zod";

function findRepoRoot(startDir: string): string {
  let dir = startDir;
  for (let i = 0; i < 6; i++) {
    const marker = path.join(dir, "personas");
    if (fs.existsSync(marker)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return startDir;
}

export function createShadowRoutes() {
  return {
    list: (req: Request, res: Response) => {
      const persona = String(req.query.persona || "ashira");
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const repo = findRepoRoot(process.cwd());
      const file = path.join(repo, ".spiral", "shadows", persona, "shadow.jsonl");
      if (!fs.existsSync(file)) {
        return res.json({ persona, entries: [] });
      }
      const lines = fs.readFileSync(file, "utf-8").split(/\r?\n/).filter(Boolean).slice(-limit);
      const entries = lines.map((l) => {
        try { return JSON.parse(l); } catch { return { text: l }; }
      });
      return res.json({ persona, entries });
    },

    reflect: (req: Request, res: Response) => {
      const schema = z.object({
        persona: z.string().min(1),
        sessionId: z.string().min(1),
        summary: z.string().min(1)
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      const { persona, sessionId, summary } = parsed.data;
      const repo = findRepoRoot(process.cwd());
      const dir = path.join(repo, ".spiral", "shadows", persona);
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, "shadow.jsonl");
      const entry = { sessionId, summary, createdAt: new Date().toISOString() };
      fs.appendFileSync(file, JSON.stringify(entry) + "\n");
      return res.json({ ok: true, wrote: entry });
    }
  };
}
