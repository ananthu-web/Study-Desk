"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

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
  document.documentElement.dataset.workspace = /^\/(?:dashboard|preview\/dashboard)(?:\/|$)/.test(location.pathname) ? "dashboard" : "entry";
  const colour = getComputedStyle(document.documentElement).getPropertyValue("--browser-chrome").trim() || (resolved === "dark" ? "#202120" : "#f1efe8");
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
  const pathname = usePathname();
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const phone = matchMedia("(max-width: 800px)");
    const standalone = matchMedia("(display-mode: standalone)");
    const sync = () => applyTheme(savedTheme());
    sync();
    media.addEventListener("change", sync);
    phone.addEventListener("change", sync);
    standalone.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("studydesk-theme-change", sync);
    window.addEventListener("pageshow", sync);
    return () => {
      media.removeEventListener("change", sync);
      phone.removeEventListener("change", sync);
      standalone.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("studydesk-theme-change", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, [pathname]);
  return null;
}
