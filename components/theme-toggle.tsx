"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("studydesk-theme", next); } catch { /* The theme still works if storage is unavailable. */ }
    window.dispatchEvent(new Event("studydesk-theme-change"));
  }

  return <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Switch between light and dark theme" title="Switch theme"><Moon className="moon-icon" size={18} /><Sun className="sun-icon" size={18} /></button>;
}
