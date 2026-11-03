import { useEffect, useState } from "react";

const HISTORY = 40;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function demoSource() {
  let lag = 1.4, rss = 64, heap = 9.5, cpu = 6, uptime = 0;
  return () => {
    lag = clamp(lag + (Math.random() - 0.5) * 0.9, 0.2, 6);
    rss = clamp(rss + (Math.random() - 0.5) * 1.6, 58, 82);
    heap = clamp(heap + (Math.random() - 0.5) * 0.7, 7, 16);
    cpu = clamp(cpu + (Math.random() - 0.5) * 5, 1, 45);
    uptime += 1;
    return {
      ts: Date.now(), uptimeSec: uptime, rssMb: +rss.toFixed(1), heapMb: +heap.toFixed(1),
      eventLoopLagMs: +lag.toFixed(2), cpuLoadPct: Math.round(cpu), chatRequests: 0, wordsStreamed: 0,
      activeStreams: 0, engine: null
    };
  };
}

// Streams real server vitals from /api/metrics/stream while the section is on
// screen. Closes the connection when scrolled away or the tab is hidden. If
// the API isn't there at all, it switches to clearly labelled demo data.
export function useLiveMetrics(targetRef) {
  const [state, setState] = useState({ status: "idle", data: null, history: [] });

  useEffect(() => {
    const el = targetRef.current;
    if (!el || typeof EventSource === "undefined" || typeof IntersectionObserver === "undefined") return undefined;
    let es = null;
    let demoTimer = null;
    let openTimer = null;
    let everOpened = false;
    let demo = false;
    let onScreen = false;
    const nextDemo = demoSource();

    const push = (data, status) => setState((s) => ({ status, data, history: [...s.history, data].slice(-HISTORY) }));

    function startDemo() {
      demo = true;
      if (es) {
        es.close();
        es = null;
      }
      clearTimeout(openTimer);
      if (demoTimer) return;
      const tick = () => push(nextDemo(), "demo");
      tick();
      demoTimer = setInterval(tick, 1000);
    }

    function connect() {
      if (demo) return startDemo();
      if (es) return undefined;
      setState((s) => ({ ...s, status: everOpened ? "reconnecting" : "connecting" }));
      es = new EventSource("/api/metrics/stream");
      openTimer = setTimeout(() => !everOpened && startDemo(), 4000);
      es.addEventListener("metrics", (e) => {
        everOpened = true;
        clearTimeout(openTimer);
        try {
          push(JSON.parse(e.data), "live");
        } catch {
          /* skip a malformed frame */
        }
      });
      es.onerror = () => {
        if (!everOpened) startDemo();
        else setState((s) => ({ ...s, status: "reconnecting" }));
      };
      return undefined;
    }

    function disconnect() {
      if (es) {
        es.close();
        es = null;
      }
      clearTimeout(openTimer);
      if (demoTimer) {
        clearInterval(demoTimer);
        demoTimer = null;
      }
      setState((s) => (s.status === "idle" ? s : { ...s, status: "paused" }));
    }

    const sync = () => (onScreen && !document.hidden ? connect() : disconnect());
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      disconnect();
    };
  }, [targetRef]);

  return state;
}
