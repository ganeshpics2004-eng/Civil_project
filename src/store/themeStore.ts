import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

const storedTheme = localStorage.getItem("cefp-theme");
const initialTheme: Theme = storedTheme === "dark" ? "dark" : "light";

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("cefp-theme", theme);
      return { theme };
    }),
}));
