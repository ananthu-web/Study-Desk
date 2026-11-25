"use client";

import { useEffect } from "react";

export type Theme = "light" | "dark" | "system";

export function savedTheme(): Theme {
  try {
    const saved = localStorage.getItem("studydesk-theme");
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch { return "system"; }
}

export function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
  document.documentElement.dataset.theme = resolved;
  const colour = resolved === "dark" ? "#202120" : "#f1efe8";
  // Keep this outside Next's static viewport metadata: React otherwise inserts
  // another server-coloured tag when hydrating a saved dark preference.
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = colour;
}

// One listener for every route, including welcome/auth and the installed app.
export function ThemeSync() {
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyTheme(savedTheme());
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("studydesk-theme-change", sync);
    window.addEventListener("pageshow", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("studydesk-theme-change", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, []);
  return null;
}
