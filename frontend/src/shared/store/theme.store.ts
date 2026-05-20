import { create } from "zustand";

interface ThemeState {
  darkMode: boolean;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  darkMode: false,

  toggleTheme: () => {
    const newValue = !get().darkMode;

    localStorage.setItem("derash_theme", JSON.stringify(newValue));

    document.documentElement.classList.toggle("dark", newValue);

    set({ darkMode: newValue });
  },

  initTheme: () => {
    const saved = localStorage.getItem("derash_theme");

    if (!saved) return;

    const isDark = JSON.parse(saved);

    document.documentElement.classList.toggle("dark", isDark);

    set({ darkMode: isDark });
  },
}));