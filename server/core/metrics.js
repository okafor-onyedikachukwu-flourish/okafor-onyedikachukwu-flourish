import os from "node:os";
import { monitorEventLoopDelay } from "node:perf_hooks";
import { engineInfo } from "./providers/index.js";

// Real measurements from this server process, streamed to the dashboard.
const startedAt = Date.now();
const RESOLUTION_MS = 10;
const loop = monitorEventLoopDelay({ resolution: RESOLUTION_MS });
loop.enable();

const counters = { chatRequests: 0, wordsStreamed: 0, activeStreams: 0, lastLatencyMs: null, lastProvider: null };

export const track = {
  chatStarted() {
    counters.chatRequests += 1;
    counters.activeStreams += 1;
  },
  chatFinished({ provider, latencyMs, words }) {
    counters.activeStreams = Math.max(0, counters.activeStreams - 1);
    counters.lastProvider = provider;
    counters.lastLatencyMs = latencyMs;
    counters.wordsStreamed += words;
  }
};

let cached = null;
export function latestMetrics() {
  if (cached && Date.now() - cached.ts < 900) return cached;
  const mem = process.memoryUsage();
  // The histogram includes the sampling interval itself, so subtract it.
  const lag = Number.isFinite(loop.mean) ? Math.max(0, loop.mean / 1e6 - RESOLUTION_MS) : 0;
  loop.reset();
  const cpus = os.cpus()?.length || 1;
  cached = {
    ts: Date.now(),
    uptimeSec: Math.round((Date.now() - startedAt) / 1000),
    rssMb: +(mem.rss / 1048576).toFixed(1),
    heapMb: +(mem.heapUsed / 1048576).toFixed(1),
    eventLoopLagMs: +lag.toFixed(2),
    cpuLoadPct: Math.min(100, Math.round((os.loadavg()[0] / cpus) * 100)),
    ...counters,
    engine: engineInfo()
  };
  return cached;
}
