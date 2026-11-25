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

function visible(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement && element.getClientRects().length > 0;
}

export function syncBrowserChrome() {
  const root = document.documentElement;
  let colour = getComputedStyle(root).getPropertyValue("--paper").trim();
  if (matchMedia("(max-width: 800px)").matches) {
    const loading = document.querySelector(".app-loading");
    const reader = document.querySelector(".pdf-reader[open]");
    const app = document.querySelector(".desk-app");
    if (visible(reader)) colour = getComputedStyle(reader).backgroundColor;
    else if (!visible(loading) && visible(app)) {
      const bar = app.querySelector(".desk-topbar");
      const main = app.querySelector(".desk-main");
      if (!app.classList.contains("is-topbar-hidden") && visible(bar)) {
        colour = getComputedStyle(bar).backgroundColor;
      } else if (visible(main)) {
        // The sheet overlaps the hero, so the last matching surface is on top.
        const edge = main.getBoundingClientRect().top + 1;
        const surface = Array.from(main.querySelectorAll<HTMLElement>(".desk-hero, .desk-sheet, .desk-footer"))
          .filter(element => {
            const bounds = element.getBoundingClientRect();
            return bounds.top <= edge && bounds.bottom > edge;
          }).at(-1) ?? main;
        colour = getComputedStyle(surface).backgroundColor;
      }
    }
  }
  if (root.style.getPropertyValue("--browser-chrome") !== colour) root.style.setProperty("--browser-chrome", colour);
  // This is runtime-owned, so hydration cannot restore a stale server colour.
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  if (meta.content !== colour) meta.content = colour;
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
  syncBrowserChrome();
}

// One listener for every route, including welcome/auth and the installed app.
export function ThemeSync() {
  const pathname = usePathname();
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const phone = matchMedia("(max-width: 800px)");
    const standalone = matchMedia("(display-mode: standalone)");
    let frame = 0;
    const refreshChrome = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; syncBrowserChrome(); });
    };
    const sync = () => applyTheme(savedTheme());
    let app: HTMLElement | null = null;
    let main: HTMLElement | null = null;
    let intersections: IntersectionObserver | null = null;
    const observeSurfaces = () => {
      intersections?.disconnect();
      if (!main) return;
      // A one-pixel band at the top of the scroller: callbacks happen only when
      // a surface crosses it, rather than reading geometry on every scroll frame.
      intersections = new IntersectionObserver(refreshChrome, {
        root: main, rootMargin: `0px 0px -${Math.max(0, main.clientHeight - 1)}px 0px`, threshold: 0,
      });
      main.querySelectorAll(".desk-hero, .desk-sheet, .desk-footer").forEach(surface => intersections!.observe(surface));
    };
    const appObserver = new MutationObserver(refreshChrome);
    const contentObserver = new MutationObserver(() => { observeSurfaces(); refreshChrome(); });
    const sizeObserver = new ResizeObserver(() => { observeSurfaces(); refreshChrome(); });
    const bindScene = () => {
      const nextApp = document.querySelector<HTMLElement>(".desk-app");
      const nextMain = nextApp?.querySelector<HTMLElement>(".desk-main") ?? null;
      if (nextApp !== app) {
        appObserver.disconnect(); app = nextApp;
        if (app) appObserver.observe(app, { attributes: true, attributeFilter: ["class"] });
      }
      if (nextMain !== main) {
        contentObserver.disconnect(); sizeObserver.disconnect(); intersections?.disconnect(); main = nextMain;
        if (main) {
          contentObserver.observe(main, { childList: true });
          sizeObserver.observe(main);
          observeSurfaces();
        }
      }
    };
    // Watch only scene containers, not every card, SVG, editor and text mutation.
    const sceneObserver = new MutationObserver(() => { bindScene(); refreshChrome(); });
    sceneObserver.observe(document.body, { childList: true });
    document.addEventListener("toggle", refreshChrome, true);
    document.addEventListener("close", refreshChrome, true);
    window.addEventListener("resize", refreshChrome);
    bindScene();
    sync();
    media.addEventListener("change", sync);
    phone.addEventListener("change", sync);
    standalone.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("studydesk-theme-change", sync);
    window.addEventListener("pageshow", sync);
    return () => {
      sceneObserver.disconnect(); appObserver.disconnect(); contentObserver.disconnect(); sizeObserver.disconnect(); intersections?.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("toggle", refreshChrome, true);
      document.removeEventListener("close", refreshChrome, true);
      window.removeEventListener("resize", refreshChrome);
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
