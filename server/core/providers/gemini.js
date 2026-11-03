import { DEFAULT_GEMINI_MODEL } from "./index.js";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

// Streams text chunks from the Gemini API (server-sent events). The API key
// stays on the server; the browser never sees it.
export async function* geminiStream({ system, messages, signal }) {
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const generationConfig = { temperature: 0.5, maxOutputTokens: 600 };
  // 2.5 Flash "thinks" by default; a portfolio Q&A doesn't need it and it
  // would eat the output budget, so it's switched off for that model family.
  if (/2\.5-flash/.test(model)) generationConfig.thinkingConfig = { thinkingBudget: 0 };

  const res = await fetch(`${ENDPOINT}/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      generationConfig
    }),
    signal
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini responded ${res.status}: ${detail.slice(0, 300)}`);
  }

  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of res.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let newline;
    while ((newline = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      let json;
      try {
        json = JSON.parse(payload);
      } catch {
        continue;
      }
      for (const part of json?.candidates?.[0]?.content?.parts || []) {
        if (part.text) yield part.text;
      }
    }
  }
}
