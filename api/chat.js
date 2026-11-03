import { handleChat } from "../server/core/handlers.js";
import { sendJson } from "../server/core/http.js";
export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Use POST." }, { Allow: "POST" });
  return handleChat(req, res, req.body);
}
