// Loads .env in local development (Node 20.12+). On Vercel/Render the
// dashboard injects environment variables, so a missing file is fine.
try {
  if (typeof process.loadEnvFile === "function") process.loadEnvFile(".env");
} catch {
  /* no .env file: rely on real environment variables */
}
