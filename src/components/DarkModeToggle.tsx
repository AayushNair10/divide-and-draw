import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/useDarkMode";

export const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleDarkMode}
      className="sketch-border"
    >
      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
};