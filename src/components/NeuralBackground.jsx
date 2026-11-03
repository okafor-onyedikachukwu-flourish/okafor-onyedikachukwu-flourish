import { useEffect, useRef } from "react";

// A living neural network drawn on one <canvas>. Built for speed:
// - starts only when the browser is idle, so it never delays first paint
// - spatial grid: each node only checks nearby cells, not every other node
// - lines are batched into 3 strokes per frame instead of hundreds
// - device-pixel ratio capped, node count scaled to screen and CPU
// - adapts: if frames get expensive it removes nodes automatically
// - pauses in background tabs; draws one still frame for reduced motion
const LINK = 132;
const LINK2 = LINK * LINK;
const LINE_ALPHA = [0.06, 0.13, 0.22];
const BRASS = "232,182,90";
const SIGNAL = "103,227,211";

export default function NeuralBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return undefined;

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lowPower = (navigator.hardwareConcurrency || 4) <= 4 || navigator.connection?.saveData === true;
    const pointer = { x: -1e4, y: -1e4 };
    let w = 0;
    let h = 0;
    let nodes = [];
    let pulses = [];
    let adjacency = [];
    let raf = 0;
    let running = false;
    let last = 0;
    let spawnClock = 0;
    let scale = 1;
    let costs = [];
    let idleHandle = 0;

    const target = () => {
      const base = (w * h) / (lowPower ? 21000 : 14500);
      return Math.round(Math.max(22, Math.min(lowPower ? 58 : 96, base * scale)));
    };
    const makeNode = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      r: Math.random() * 1.3 + 0.9,
      warm: Math.random() < 0.26,
      flash: 0
    });

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = target();
      while (nodes.length < n) nodes.push(makeNode());
      if (nodes.length > n) nodes.length = n;
      pulses = pulses.filter((p) => p.a < n && p.b < n);
    }

    function step(dt) {
      for (const p of nodes) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22500 && d2 > 1) {
          const d = Math.sqrt(d2);
          const push = (1 - d / 150) * 0.9 * dt;
          p.x += (dx / d) * push;
          p.y += (dy / d) * push;
        }
        if (p.flash > 0) p.flash = Math.max(0, p.flash - 0.03 * dt);
      }
    }

    function draw(dt) {
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / LINK) + 2;
      const grid = new Map();
      adjacency = nodes.map(() => []);
      nodes.forEach((p, i) => {
        const key = (Math.floor(p.y / LINK) + 1) * cols + Math.floor(p.x / LINK) + 1;
        const cell = grid.get(key);
        if (cell) cell.push(i);
        else grid.set(key, [i]);
      });

      const buckets = [[], [], []];
      for (const [key, cell] of grid) {
        // Own cell + 4 forward neighbours = every pair checked exactly once.
        for (const offset of [0, 1, cols - 1, cols, cols + 1]) {
          const other = offset === 0 ? cell : grid.get(key + offset);
          if (!other) continue;
          for (let ai = 0; ai < cell.length; ai++) {
            const a = nodes[cell[ai]];
            for (let bi = offset === 0 ? ai + 1 : 0; bi < other.length; bi++) {
              const b = nodes[other[bi]];
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const d2 = dx * dx + dy * dy;
              if (d2 > LINK2) continue;
              const s = 1 - Math.sqrt(d2) / LINK;
              buckets[s > 0.66 ? 2 : s > 0.33 ? 1 : 0].push(a.x, a.y, b.x, b.y);
              adjacency[cell[ai]].push(other[bi]);
              adjacency[other[bi]].push(cell[ai]);
            }
          }
        }
      }

      ctx.lineWidth = 1;
      buckets.forEach((segs, i) => {
        if (!segs.length) return;
        ctx.beginPath();
        for (let k = 0; k < segs.length; k += 4) {
          ctx.moveTo(segs[k], segs[k + 1]);
          ctx.lineTo(segs[k + 2], segs[k + 3]);
        }
        ctx.strokeStyle = `rgba(130,142,210,${LINE_ALPHA[i]})`;
        ctx.stroke();
      });

      // Threads from the pointer to nearby nodes.
      ctx.beginPath();
      for (const p of nodes) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        if (dx * dx + dy * dy < 32400) {
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.strokeStyle = `rgba(${SIGNAL},0.16)`;
      ctx.stroke();

      for (const warm of [false, true]) {
        ctx.beginPath();
        for (const p of nodes) {
          if (p.warm !== warm) continue;
          const r = p.r + p.flash * 2.2;
          ctx.moveTo(p.x + r, p.y);
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        }
        ctx.fillStyle = `rgba(${warm ? BRASS : SIGNAL},0.78)`;
        ctx.fill();
      }

      // Signals travelling along connections, like neurons firing.
      if (dt > 0) {
        spawnClock += dt;
        const maxPulses = lowPower ? 6 : 12;
        if (spawnClock > 20 && pulses.length < maxPulses) {
          spawnClock = 0;
          const a = Math.floor(Math.random() * nodes.length);
          const options = adjacency[a];
          if (options?.length) {
            pulses.push({ a, b: options[Math.floor(Math.random() * options.length)], t: 0, warm: Math.random() < 0.4, hops: 0 });
          }
        }
        pulses = pulses.filter((pulse) => {
          pulse.t += 0.022 * dt;
          if (pulse.t < 1) return true;
          const arrived = nodes[pulse.b];
          if (arrived) arrived.flash = 1;
          const next = (adjacency[pulse.b] || []).filter((n) => n !== pulse.a);
          if (next.length && pulse.hops < 5 && Math.random() < 0.6) {
            pulse.a = pulse.b;
            pulse.b = next[Math.floor(Math.random() * next.length)];
            pulse.t = 0;
            pulse.hops += 1;
            return true;
          }
          return false;
        });
      }
      for (const pulse of pulses) {
        const a = nodes[pulse.a];
        const b = nodes[pulse.b];
        if (!a || !b) continue;
        const x = a.x + (b.x - a.x) * pulse.t;
        const y = a.y + (b.y - a.y) * pulse.t;
        const color = pulse.warm ? BRASS : SIGNAL;
        ctx.fillStyle = `rgba(${color},0.18)`;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${color},0.95)`;
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function adapt(cost) {
      costs.push(cost);
      if (costs.length < 90) return;
      const avg = costs.reduce((s, c) => s + c, 0) / costs.length;
      costs = [];
      if (avg > 6 && scale > 0.4) {
        scale *= 0.8;
        resize();
      }
    }

    function frame(now) {
      if (!running) return;
      const dt = Math.min(48, now - (last || now)) / 16.667;
      last = now;
      const t0 = performance.now();
      step(dt);
      draw(dt);
      adapt(performance.now() - t0);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || document.hidden) return;
      if (reduceQuery.matches) {
        draw(0); // one still frame, no motion
        return;
      }
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    let resizeTimer = 0;
    let lastWidth = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Mobile address bars change the height while scrolling; only react
        // to real layout changes so scrolling never reallocates the canvas.
        if (Math.abs(window.innerWidth - lastWidth) < 2 && Math.abs(canvas.getBoundingClientRect().height - h) < 160) return;
        lastWidth = window.innerWidth;
        resize();
        if (!running) draw(0);
      }, 150);
    };
    const onPointer = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onLeave = () => {
      pointer.x = -1e4;
      pointer.y = -1e4;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onMotionPref = () => {
      stop();
      start();
    };

    const init = () => {
      lastWidth = window.innerWidth;
      resize();
      canvas.classList.add("is-on");
      start();
      window.addEventListener("resize", onResize, { passive: true });
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("pointerleave", onLeave);
      window.addEventListener("blur", onLeave);
      document.addEventListener("visibilitychange", onVisibility);
      reduceQuery.addEventListener?.("change", onMotionPref);
    };

    if ("requestIdleCallback" in window) idleHandle = window.requestIdleCallback(init, { timeout: 1200 });
    else idleHandle = window.setTimeout(init, 300);

    return () => {
      stop();
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleHandle);
      clearTimeout(idleHandle);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceQuery.removeEventListener?.("change", onMotionPref);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-bg" aria-hidden="true" />;
}
