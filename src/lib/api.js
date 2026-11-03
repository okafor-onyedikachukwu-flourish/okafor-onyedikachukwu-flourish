export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// POST /api/chat and read the server-sent event stream it returns.
export async function streamChat(messages, { onEvent, signal }) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal
  });
  const type = res.headers.get("content-type") || "";
  if (!res.ok || !type.includes("text/event-stream") || !res.body) {
    let message = `The AI Machine returned ${res.status}.`;
    try {
      message = (await res.json()).error || message;
    } catch {
      /* not JSON */
    }
    throw new ApiError(message, res.ok ? 404 : res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let split;
    while ((split = buffer.indexOf("\n\n")) >= 0) {
      const block = buffer.slice(0, split);
      buffer = buffer.slice(split + 2);
      let event = "message";
      let data = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (data) onEvent(event, JSON.parse(data));
    }
  }
}

// Same pipeline, run entirely in the browser. Used when the site is opened
// without the API (for example a static preview), so the demo always works.
export async function answerInBrowser(history, onEvent, signal) {
  const [{ localStream }, { retrieve }] = await Promise.all([
    import("../../server/core/providers/local.js"),
    import("../../server/core/knowledge.js")
  ]);
  const started = performance.now();
  let firstTokenMs = null;
  let words = 0;
  onEvent("stage", { stage: "routing" });
  const { projects } = retrieve(history.at(-1).content);
  onEvent("stage", { stage: "retrieving", matches: projects.map((p) => p.name) });
  onEvent("stage", { stage: "generating", provider: "browser", model: "flourish-offline-v1" });
  for await (const text of localStream({ messages: history, signal })) {
    if (firstTokenMs === null) firstTokenMs = Math.round(performance.now() - started);
    words += text.split(/\s+/).filter(Boolean).length;
    onEvent("token", { text });
  }
  onEvent("done", { provider: "browser", model: "flourish-offline-v1", words, firstTokenMs, latencyMs: Math.round(performance.now() - started) });
}
