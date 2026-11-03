import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App.jsx";

// Used only at build time by scripts/prerender.mjs.
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
