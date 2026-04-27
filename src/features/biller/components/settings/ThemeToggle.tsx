// src/features/biller/components/settings/ThemeToggle.tsx

import { useState, useEffect } from "react";
import { MoonIcon, SunIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | "system" || "light";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (selected: "light" | "dark" | "system") => {
    if (selected === "dark") document.documentElement.classList.add("dark");
    else if (selected === "light") document.documentElement.classList.remove("dark");
    else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", selected);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const getIcon = () => {
    if (theme === "light") return <SunIcon className="w-4 h-4" />;
    if (theme === "dark") return <MoonIcon className="w-4 h-4" />;
    return <ComputerDesktopIcon className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (theme === "light") return "Light";
    if (theme === "dark") return "Dark";
    return "System";
  };

  return (
    <button onClick={toggleTheme} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-gray-700 text-xs font-medium">
      {getIcon()} {getLabel()} Mode
    </button>
  );
}