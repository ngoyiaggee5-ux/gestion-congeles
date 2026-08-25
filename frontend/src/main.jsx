import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import App from "./App.jsx";
import { getData } from "./data/store.js";
import { applyAppearance } from "./utils/settings.js";
import { mergeAppearance } from "./utils/appearanceStorage.js";

applyAppearance(mergeAppearance(getData().settings));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
