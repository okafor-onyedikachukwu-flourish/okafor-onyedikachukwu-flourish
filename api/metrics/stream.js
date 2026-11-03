import { metricsStream } from "../../server/core/handlers.js";
export default function handler(req, res) {
  return metricsStream(req, res);
}
