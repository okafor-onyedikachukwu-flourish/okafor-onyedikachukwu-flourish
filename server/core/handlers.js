import { person, projects } from "../../src/data/profile.js";
import { engineInfo } from "./providers/index.js";
import { latestMetrics } from "./metrics.js";
import { openStream, sendJson } from "./http.js";

export { handleChat } from "./chat.js";

export function health(_req, res) {
  sendJson(res, 200, {
    status: "ok",
    engine: engineInfo(),
    modules: ["router", "retriever", "generator", "streamer"],
    time: new Date().toISOString()
  });
}

export function projectsList(_req, res) {
  sendJson(
    res,
    200,
    { owner: person.fullName, count: projects.length, projects: projects.map(({ imageAlt, ...p }) => p) },
    { "Cache-Control": "public, max-age=300" }
  );
}

// Live metrics feed. Serverless platforms cap request time, so on Vercel the
// stream closes after 25 s and the browser's EventSource reconnects by itself.
export function metricsStream(_req, res) {
  return new Promise((resolve) => {
    const stream = openStream(res, { retryMs: 1500 });
    const tick = () => stream.send("metrics", latestMetrics());
    tick();
    const interval = setInterval(tick, 1000);
    const limitMs = process.env.VERCEL ? 25_000 : 0;
    const timeout = limitMs ? setTimeout(stop, limitMs) : null;
    function stop() {
      clearInterval(interval);
      if (timeout) clearTimeout(timeout);
      stream.end();
      resolve();
    }
    res.on("close", stop);
  });
}
