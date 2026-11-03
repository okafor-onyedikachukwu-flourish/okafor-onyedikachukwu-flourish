export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export function engineInfo() {
  return process.env.GEMINI_API_KEY
    ? { provider: "gemini", model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL }
    : { provider: "local", model: "flourish-offline-v1" };
}
