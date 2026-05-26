"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "kk_theme";

export type Theme = "light" | "dark";

/**
 * useTheme returns the user's preferred theme and a setter. The
 * preference is persisted in localStorage; on first load we honour
 * the OS-level `prefers-color-scheme` setting unless the user has
 * already made an explicit choice.
 *
 * The hook does NOT apply the theme to the DOM by itself — that's
 * the consumer's job (typically by toggling a `kk-dark` class on
 * a scope wrapper like AdminShell or the lesson runner).
 */
export function useTheme(): {
  theme: Theme;
  setTheme: (next: Theme) => void;
  toggle: () => void;
} {
  const [theme, setThemeState] = useState<Theme>("light");

  // Initialise from localStorage / system on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "dark" || stored === "light") {
      setThemeState(stored);
      return;
    }
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setThemeState(prefersDark ? "dark" : "light");
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const toggle = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  return { theme, setTheme, toggle };
}
