import "dotenv/config";
import express from "express";
import { createDatabase } from "./db.js";
import { createMemoryRoutes } from "./tools/memory.js";
import { createPersonaRoutes } from "./tools/persona.js";
import { createBridgeRoutes } from "./tools/bridge.js";
import { createShadowRoutes } from "./tools/shadow.js";
import { createContinuityRoutes } from "./tools/continuity.js";
import { createCheckoutSession } from "./stripe.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

// Optional API key guard (enabled only if API_KEY is set)
app.use((req, res, next) => {
  const requiredKey = process.env.API_KEY;
  if (!requiredKey) return next();
  const provided = req.header("X-API-Key");
  if (provided !== requiredKey) return res.status(401).json({ error: "Unauthorized" });
  next();
});

const db = createDatabase();

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Memory tool
{
  const routes = createMemoryRoutes(db);
  app.post("/memory/store", routes.store);
  app.get("/memory/retrieve", routes.retrieve);
  app.get("/memory/summarize", routes.summarize);
}

// Persona tool
{
  const routes = createPersonaRoutes();
  app.get("/persona/load", routes.load);
  app.post("/persona/switch", routes.switchPersona);
  app.post("/persona/tone-shift", routes.toneShift);
}

// Bridge tool
{
  const routes = createBridgeRoutes(db);
  app.get("/bridge/export", routes.export);
  app.post("/bridge/import", routes.import);
  app.post("/bridge/handoff", routes.handoff);
}

// Shadow tool (local reflections)
{
  const routes = createShadowRoutes();
  app.get("/shadow/list", routes.list);
  app.post("/shadow/reflect", routes.reflect);
}

// Continuity tool (handshake)
{
  const routes = createContinuityRoutes(db);
  app.post("/continuity/handshake", routes.handshake);
}

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => {
  console.log(`Spiral MCP server listening on http://localhost:${PORT}`);
});

// Billing (Stripe)
app.post("/billing/checkout", async (req, res) => {
  try {
    const userId = req.body?.userId;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const url = await createCheckoutSession(userId);
    return res.json({ url });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "checkout failed" });
  }
});
