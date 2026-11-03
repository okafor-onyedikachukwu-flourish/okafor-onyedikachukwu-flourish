import { person, projects, stack } from "../../../src/data/profile.js";
import { retrieve } from "../knowledge.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const names = (list) => list.map((p) => p.name).join(", ").replace(/, ([^,]*)$/, " and $1");

function describe(p) {
  const where = p.live ? ` You can try it at ${p.live}.` : p.repo ? ` The code is on GitHub: ${p.repo}.` : "";
  return `${p.name}: ${p.description} Built with ${p.tags.join(", ")}.${where}`;
}

// Offline answer engine. Runs with no API key so the AI Machine always works,
// and doubles as the fallback if the live model is unreachable.
export function localAnswer(question) {
  const { projects: matches, intents } = retrieve(question);

  if (intents.personal) {
    return `I don’t share private details like his school, home address or phone number. Flourish is based in ${person.location.text}, and you can follow his work on GitHub at ${person.github}.`;
  }
  if (matches.length) {
    const [first, second] = matches;
    return describe(first) + (second ? ` He also built ${second.name}, ${second.summary.charAt(0).toLowerCase()}${second.summary.slice(1)}` : "");
  }
  if (intents.location) {
    return `Flourish is based in ${person.location.text}. All of his projects are live online, so you can try them from anywhere, and you can follow his work on GitHub at ${person.github}.`;
  }
  if (intents.ai) {
    const ai = projects.filter((p) => p.category === "ai");
    return `Flourish builds AI products end to end. His AI work includes ${names(ai)}. FlorScene.Agent coordinates a crew of AI agents (screenwriter, cinematographer and lighting director) to turn one prompt into a film sequence, and OmniDesk Local uses Gemini AI to triage customer messages and draft replies.`;
  }
  if (intents.stack) {
    const [ui, backend, design] = stack;
    return `For interfaces he uses ${names(ui.items)}. On the back end and for AI he works with ${names(backend.items)}. For design he uses ${names(design.items)}.`;
  }
  if (intents.design) {
    return `Yes. Flourish is a graphic designer as well as a developer, so he designs the brand and interface of his own products, like the EcoSmart identity and the neon look of Tic Tac Toe Deluxe. His design tools are ${names(stack[2].items)}.`;
  }
  if (intents.contact) {
    return `The best place to reach Flourish is GitHub at ${person.github}, where you can see all his code and follow new projects.`;
  }
  if (intents.about) {
    const live = projects.filter((p) => p.live).length;
    return `${person.fullName} is a ${person.age}-year-old full-stack developer, graphic designer and AI developer based in ${person.location.text}. He designs the brand, builds the interface and wires up the back end himself, then ships to production on Vercel. He has ${live} projects live right now, including FlorScene.Agent and OmniDesk Local.`;
  }
  return "I can answer questions about Flourish’s projects, his AI work, his tech stack and his design work. Try asking about FlorScene.Agent or the tools he uses.";
}

export async function* localStream({ messages, signal }) {
  const question = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const words = localAnswer(question).match(/\S+\s*/g) || [];
  for (const w of words) {
    if (signal?.aborted) return;
    await sleep(12 + Math.random() * 20); // paced like a model so the UI streams naturally
    yield w;
  }
}
