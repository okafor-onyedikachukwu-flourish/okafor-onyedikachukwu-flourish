import { projectsList } from "../server/core/handlers.js";
export default function handler(req, res) {
  return projectsList(req, res);
}
