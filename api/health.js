import { health } from "../server/core/handlers.js";
export default function handler(req, res) {
  return health(req, res);
}
