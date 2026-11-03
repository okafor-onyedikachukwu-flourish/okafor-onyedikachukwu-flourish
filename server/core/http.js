export function sendJson(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Robots-Tag", "noindex"); // keep API responses out of search results
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(data));
}

// Server-Sent Events over a plain Node response. Works the same in Express
// and in Vercel Node functions, which both hand us an http.ServerResponse.
export function openStream(res, { retryMs } = {}) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("X-Robots-Tag", "noindex");
  if (typeof res.flushHeaders === "function") res.flushHeaders();
  if (retryMs) res.write(`retry: ${retryMs}\n\n`);
  let closed = false;
  res.on("close", () => {
    closed = true;
  });
  return {
    get closed() {
      return closed;
    },
    send(event, data) {
      if (!closed) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    },
    end() {
      if (!closed) {
        closed = true;
        res.end();
      }
    }
  };
}

export function clientIp(req) {
  const behindProxy = process.env.VERCEL || process.env.TRUST_PROXY === "1";
  const fwd = req.headers["x-forwarded-for"];
  if (behindProxy && typeof fwd === "string" && fwd) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}
