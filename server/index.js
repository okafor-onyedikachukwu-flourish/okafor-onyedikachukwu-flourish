import "./core/env.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import compression from "compression";
import { health, projectsList, metricsStream, handleChat } from "./core/handlers.js";
import { sendJson } from "./core/http.js";
import { engineInfo } from "./core/providers/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const PORT = Number(process.env.PORT || 8787);

const app = express();
app.disable("x-powered-by");

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});

// Compress pages and assets, but never the event streams (that would buffer them).
app.use(compression({ filter: (req, res) => !req.path.startsWith("/api/") && compression.filter(req, res) }));
app.use(express.json({ limit: "16kb" }));

app.get("/api/health", health);
app.get("/api/projects", projectsList);
app.get("/api/metrics/stream", metricsStream);
app.post("/api/chat", (req, res) => handleChat(req, res, req.body));
app.use("/api", (_req, res) => sendJson(res, 404, { error: "Unknown API route." }));

if (fs.existsSync(dist)) {
  app.use(
    express.static(dist, {
      extensions: ["html"],
      setHeaders(res, file) {
        if (/[\\/]assets[\\/][^\\/]+-[A-Za-z0-9_-]{8}\.(js|css)$/.test(file)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (/\.(webp|jpg|png|svg|woff2)$/.test(file)) {
          res.setHeader("Cache-Control", "public, max-age=2592000");
        } else {
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        }
      }
    })
  );
  // Real 404 status for unknown pages (no "soft 404" for Google).
  app.use((_req, res) => res.status(404).sendFile(path.join(dist, "404.html")));
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const badJson = err?.type === "entity.parse.failed";
  sendJson(res, badJson ? 400 : 500, { error: badJson ? "Send a valid JSON body." : "Server error." });
});

app.listen(PORT, () => {
  const { provider, model } = engineInfo();
  console.log(`AI Machine API on http://localhost:${PORT}  (engine: ${provider} / ${model})`);
  if (!fs.existsSync(dist)) console.log("No dist/ yet: run `npm run dev` for the site, or `npm run build` first.");
});
