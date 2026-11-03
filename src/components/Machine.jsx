import { useEffect, useRef, useState } from "react";
import { machineVisuals, suggestedQuestions } from "../data/profile.js";
import { answerInBrowser, streamChat } from "../lib/api.js";
import { useLiveMetrics } from "../hooks/useLiveMetrics.js";
import SmartImage from "./SmartImage.jsx";
import Sparkline from "./Sparkline.jsx";

const STAGES = [
  { id: "routing", name: "Route the question", detail: "Work out what you’re asking about" },
  { id: "retrieving", name: "Retrieve facts", detail: "Pull the matching projects and skills" },
  { id: "generating", name: "Generate the answer", detail: "Gemini, or the offline engine" },
  { id: "streaming", name: "Stream it to you", detail: "Server-sent events, word by word" }
];
const ORDER = { idle: -1, routing: 0, retrieving: 1, generating: 2, streaming: 3, done: 4, error: -1 };
const BUSY = new Set(["routing", "retrieving", "generating", "streaming"]);
const STATUS_TEXT = {
  idle: "Waiting",
  connecting: "Connecting",
  live: "Live from server",
  reconnecting: "Reconnecting",
  demo: "Demo data",
  paused: "Paused"
};

function engineLabel(engine) {
  if (!engine) return "Engine loading";
  if (engine.provider === "gemini") return `Gemini (${engine.model})`;
  if (engine.provider === "browser") return "Offline engine in your browser";
  return "Offline engine";
}

function formatUptime(sec) {
  if (sec == null) return "–";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h ? `${h}h ${m}m` : `${m}m ${String(s).padStart(2, "0")}s`;
}

export default function Machine() {
  const sectionRef = useRef(null);
  const logRef = useRef(null);
  const abortRef = useRef(null);
  const metrics = useLiveMetrics(sectionRef);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle");
  const [engine, setEngine] = useState(null);
  const [matches, setMatches] = useState([]);
  const [notice, setNotice] = useState(null);
  const [stats, setStats] = useState(null);
  const [input, setInput] = useState("");
  const busy = BUSY.has(status);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight; // scroll the chat, never the page
  }, [messages]);

  async function ask(text) {
    const question = text.trim().slice(0, 600);
    if (!question || busy) return;
    const history = [...messages.filter((m) => m.content), { role: "user", content: question }].slice(-12);
    setMessages((m) => [...m, { role: "user", content: question }, { role: "assistant", content: "" }]);
    setInput("");
    setStatus("routing");
    setMatches([]);
    setNotice(null);
    setStats(null);

    let received = 0;
    const append = (t) =>
      setMessages((m) => {
        const next = m.slice();
        const lastMsg = next[next.length - 1];
        next[next.length - 1] = { ...lastMsg, content: lastMsg.content + t };
        return next;
      });
    const dropEmpty = () => setMessages((m) => (m.at(-1)?.role === "assistant" && !m.at(-1).content ? m.slice(0, -1) : m));
    const onEvent = (event, data) => {
      if (event === "stage") {
        setStatus(data.stage);
        if (data.matches) setMatches(data.matches);
        if (data.provider) setEngine({ provider: data.provider, model: data.model });
      } else if (event === "token") {
        received += 1;
        if (received === 1) setStatus("streaming");
        append(data.text);
      } else if (event === "notice") setNotice(data.message);
      else if (event === "done") {
        setStatus("done");
        setStats(data);
      } else if (event === "error") {
        setStatus("error");
        setNotice(data.message);
      }
    };

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamChat(history, { onEvent, signal: controller.signal });
    } catch (err) {
      if (controller.signal.aborted) {
        setStatus("done");
        setNotice("Stopped.");
        dropEmpty();
      } else if (err.status && err.status !== 404 && err.status < 500) {
        setStatus("error");
        setNotice(err.message);
        dropEmpty();
      } else if (received > 0) {
        setStatus("error");
        setNotice("The connection dropped partway. Ask again to retry.");
      } else {
        setNotice("The server isn’t connected here, so your browser answered with the offline engine.");
        try {
          await answerInBrowser(history, onEvent, controller.signal);
        } catch {
          setStatus("error");
          setNotice("Something went wrong. Ask again to retry.");
          dropEmpty();
        }
      }
    } finally {
      abortRef.current = null;
    }
  }

  const stageIndex = ORDER[status] ?? -1;
  const stageState = (i) => (status === "done" ? "done" : i < stageIndex ? "done" : i === stageIndex ? "active" : "idle");
  const d = metrics.data;
  const lagHistory = metrics.history.map((m) => m.eventLoopLagMs);
  const shownEngine = engine || d?.engine;

  return (
    <section className="section" id="machine" ref={sectionRef} aria-labelledby="machine-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="machine-title">The AI Machine</h2>
          <p>
            Ask anything about my work. Your question runs through a four-stage pipeline on my Node.js server, and the
            answer streams back to you live, word by word.
          </p>
        </div>

        <div className="machine-grid">
          <div className="panel console">
            <div className="console-head">
              <h3>Ask about Flourish</h3>
              <span className="engine">{engineLabel(shownEngine)}</span>
            </div>

            <div className="log" ref={logRef} role="log" aria-live="polite" aria-label="Conversation with the AI Machine">
              {messages.length === 0 ? (
                <div className="empty-console">
                  <p>Pick a question to start, or type your own below.</p>
                  <div className="suggestions">
                    {suggestedQuestions.map((q) => (
                      <button key={q} type="button" className="chip" onClick={() => ask(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`msg msg-${m.role}`}>
                    {m.content}
                    {m.role === "assistant" && i === messages.length - 1 && busy && <span className="caret" aria-hidden="true" />}
                  </div>
                ))
              )}
            </div>

            {notice && (
              <p className="notice" role="status">
                {notice}
              </p>
            )}
            {stats && (
              <p className="run-stats">
                First word in {stats.firstTokenMs} ms. {stats.words} words in {(stats.latencyMs / 1000).toFixed(1)} s.
              </p>
            )}

            <form
              className="ask-form"
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
            >
              <label htmlFor="ask-input" className="visually-hidden">
                Your question
              </label>
              <input
                id="ask-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a project, skill or tool"
                maxLength={600}
                autoComplete="off"
              />
              {busy ? (
                <button type="button" className="btn btn-ghost" onClick={() => abortRef.current?.abort()}>
                  Stop
                </button>
              ) : (
                <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
                  Ask
                </button>
              )}
            </form>
          </div>

          <div className="side-stack">
            <div className="panel">
              <h3 className="panel-title">Pipeline</h3>
              <ol className="pipeline">
                {STAGES.map((s, i) => (
                  <li key={s.id} className="stage" data-state={stageState(i)}>
                    <span className="stage-dot" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>
                      <span className="stage-name">{s.name}</span>
                      <span className="stage-detail">
                        {s.id === "retrieving" && matches.length
                          ? `Matched ${matches.join(" and ")}`
                          : s.id === "generating" && engine
                            ? engineLabel(engine)
                            : s.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="panel">
              <div className="metrics-head">
                <h3 className="panel-title">Server vitals</h3>
                <span className="status-pill" data-status={metrics.status}>
                  {STATUS_TEXT[metrics.status]}
                </span>
              </div>
              <dl className="metrics">
                <div className="metric">
                  <dt>Event loop lag</dt>
                  <dd>
                    {d ? d.eventLoopLagMs.toFixed(2) : "–"}
                    <small>ms</small>
                  </dd>
                </div>
                <div className="metric">
                  <dt>Memory</dt>
                  <dd>
                    {d ? d.rssMb : "–"}
                    <small>MB</small>
                  </dd>
                </div>
                <div className="metric">
                  <dt>CPU load</dt>
                  <dd>
                    {d ? d.cpuLoadPct : "–"}
                    <small>%</small>
                  </dd>
                </div>
                <div className="metric">
                  <dt>Uptime</dt>
                  <dd>{formatUptime(d?.uptimeSec)}</dd>
                </div>
                <div className="metric">
                  <dt>Questions answered</dt>
                  <dd>{d ? d.chatRequests : "–"}</dd>
                </div>
                <div className="metric">
                  <dt>Words streamed</dt>
                  <dd>{d ? d.wordsStreamed : "–"}</dd>
                </div>
              </dl>
              <Sparkline values={lagHistory} label="Event loop lag over the last 40 seconds" />
              {metrics.status === "demo" && (
                <p className="metrics-note">The API isn’t connected here, so these numbers are simulated.</p>
              )}
            </div>
          </div>
        </div>

        <ul className="visuals" aria-label="Inside the AI Machine">
          {machineVisuals.map((v) => (
            <li key={v.caption}>
              <figure className="visual">
                <SmartImage src={v.src} alt={v.alt} width="720" height="540" sizes="(max-width: 720px) 72vw, 380px" fallbackLabel={v.caption} />
                <figcaption>{v.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
