import { performance } from "node:perf_hooks";
import { systemPrompt, retrieve } from "./knowledge.js";
import { engineInfo } from "./providers/index.js";
import { geminiStream } from "./providers/gemini.js";
import { localStream } from "./providers/local.js";
import { track } from "./metrics.js";
import { rateLimit } from "./rateLimit.js";
import { clientIp, openStream, sendJson } from "./http.js";

const MAX_MESSAGES = 12;
const MAX_CHARS = 600;

function validate(body) {
  let data = body;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return { error: "Send a JSON body with a messages array." };
    }
  }
  const raw = Array.isArray(data?.messages) ? data.messages : null;
  if (!raw || raw.length === 0) return { error: "Send a JSON body with a messages array." };
  const messages = raw.slice(-MAX_MESSAGES).map((m) => ({
    role: m?.role === "assistant" ? "assistant" : "user",
    content: String(m?.content ?? "").slice(0, MAX_CHARS).trim()
  }));
  if (messages.at(-1).role !== "user" || !messages.at(-1).content) return { error: "The last message must be a question." };
  return { messages };
}

// Pipeline: route -> retrieve facts -> generate (Gemini or offline) -> stream.
// Every stage is reported to the browser so the dashboard can show it live.
export async function handleChat(req, res, body) {
  const limit = rateLimit(`chat:${clientIp(req)}`, { limit: Number(process.env.CHAT_RATE_LIMIT || 12) });
  if (!limit.ok) {
    return sendJson(res, 429, { error: `Too many questions at once. Try again in ${limit.retryAfterSec} seconds.` }, { "Retry-After": String(limit.retryAfterSec) });
  }
  const parsed = validate(body);
  if (parsed.error) return sendJson(res, 400, { error: parsed.error });
  const { messages } = parsed;

  const stream = openStream(res);
  const controller = new AbortController();
  res.on("close", () => controller.abort());

  const started = performance.now();
  let firstTokenMs = null;
  let words = 0;
  let { provider, model } = engineInfo();
  track.chatStarted();

  const pump = async (generator) => {
    for await (const text of generator) {
      if (stream.closed) return;
      if (firstTokenMs === null) firstTokenMs = Math.round(performance.now() - started);
      words += text.split(/\s+/).filter(Boolean).length;
      stream.send("token", { text });
    }
  };

  try {
    stream.send("stage", { stage: "routing" });
    const question = messages.at(-1).content;
    const { projects } = retrieve(question);
    stream.send("stage", { stage: "retrieving", matches: projects.map((p) => p.name) });
    stream.send("stage", { stage: "generating", provider, model });

    if (provider === "gemini") {
      try {
        await pump(geminiStream({ system: systemPrompt(), messages, signal: controller.signal }));
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("[chat] Gemini failed, using offline engine:", err.message);
        if (words > 0) throw err;
        provider = "local";
        model = "flourish-offline-v1";
        stream.send("notice", { message: "The live model is unavailable, so the offline engine answered." });
        stream.send("stage", { stage: "generating", provider, model });
        await pump(localStream({ messages, signal: controller.signal }));
      }
    } else {
      await pump(localStream({ messages, signal: controller.signal }));
    }

    stream.send("done", { provider, model, words, firstTokenMs, latencyMs: Math.round(performance.now() - started) });
  } catch (err) {
    console.error("[chat] stream error:", err);
    stream.send("error", { message: "The answer stopped partway. Ask again to retry." });
  } finally {
    track.chatFinished({ provider, latencyMs: Math.round(performance.now() - started), words });
    stream.end();
  }
}
