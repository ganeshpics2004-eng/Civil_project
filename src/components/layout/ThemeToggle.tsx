import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { Button } from "../ui/Button";

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle dark mode" title="Toggle dark mode">
      {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </Button>
  );
}
