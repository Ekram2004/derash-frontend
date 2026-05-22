// derash-frontend/src/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n"; // ✅ Import i18n configuration (MUST be before App)
import App from "./App";
import "./index.css";

// Initialize theme before render
const setInitialTheme = () => {
  // Check if theme is stored in localStorage
  const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
  
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (savedTheme === "light") {
    document.documentElement.classList.remove("dark");
  } else if (savedTheme === "system" || !savedTheme) {
    // Check system preference
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
};

// Initialize theme
setInitialTheme();

// Listen for system theme changes
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "system" || !currentTheme) {
    if (e.matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
};
mediaQuery.addEventListener("change", handleSystemThemeChange);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);