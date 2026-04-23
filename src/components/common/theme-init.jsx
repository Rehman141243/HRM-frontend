"use client";

import * as React from "react";

const STORAGE_KEY = "hrm-theme";

function getPreferredTheme() {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

export function setTheme(nextTheme) {
  const root = document.documentElement;
  if (nextTheme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  window.localStorage.setItem(STORAGE_KEY, nextTheme);
}

export default function ThemeInit() {
  React.useEffect(() => {
    try {
      setTheme(getPreferredTheme());
    } catch {
      // no-op
    }
  }, []);

  return null;
}

