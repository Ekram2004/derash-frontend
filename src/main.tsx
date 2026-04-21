import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { useThemeStore } from "@/shared/store/theme.store";

// initialize theme BEFORE render
useThemeStore.getState().initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);