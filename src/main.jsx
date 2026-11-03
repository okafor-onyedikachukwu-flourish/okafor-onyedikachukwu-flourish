import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";

const root = document.getElementById("root");
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production HTML is prerendered for Google, so React attaches to it
// (hydrates) instead of re-drawing the page. Dev mode renders fresh.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
