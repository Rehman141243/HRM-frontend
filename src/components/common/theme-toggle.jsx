"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { setTheme } from "@/components/common/theme-init";

export default function ThemeToggle({ variant = "outline", size = "icon-sm" }) {
  const [theme, setThemeState] = React.useState("light");

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setThemeState(isDark ? "dark" : "light");
  }, []);

  return (
    <Button
      variant={variant}
      size={size}
      aria-label="Toggle theme"
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        setThemeState(next);
      }}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}

