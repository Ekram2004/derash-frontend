// derash-frontend/src/shared/components/common/ThemeToggle.tsx

import { useState } from "react";
import { MoonIcon, SunIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { useThemeStore } from "@/shared/store/theme.store";

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-300 text-xs font-medium"
      >
        {getIcon()}
        <span>{getLabel()}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <button
              onClick={() => { setTheme("light"); setIsOpen(false); }}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === "light" ? "bg-gray-100 dark:bg-gray-700 text-red-600" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              <SunIcon className="w-4 h-4" /> Light
            </button>
            <button
              onClick={() => { setTheme("dark"); setIsOpen(false); }}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === "dark" ? "bg-gray-100 dark:bg-gray-700 text-red-600" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              <MoonIcon className="w-4 h-4" /> Dark
            </button>
            <button
              onClick={() => { setTheme("system"); setIsOpen(false); }}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === "system" ? "bg-gray-100 dark:bg-gray-700 text-red-600" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              <ComputerDesktopIcon className="w-4 h-4" /> System
            </button>
          </div>
        </>
      )}
    </div>
  );
}