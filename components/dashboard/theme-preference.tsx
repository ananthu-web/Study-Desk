"use client";

import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { applyTheme, savedTheme, type Theme } from "@/components/theme-sync";

export function ThemePreference() {
  const [choice, setChoice] = useState<Theme>("system");
  useEffect(() => {
    const sync = () => setChoice(savedTheme());
    sync();
    window.addEventListener("studydesk-theme-change", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("studydesk-theme-change", sync); window.removeEventListener("storage", sync); };
  }, []);
  return <div className="desk-theme-options" role="group" aria-label="Appearance">{([{ value: "light", label: "Light", icon: Sun }, { value: "dark", label: "Dark", icon: Moon }, { value: "system", label: "System", icon: Laptop }] as const).map(({ value, label, icon: Icon }) => <button key={value} aria-pressed={choice === value} onClick={() => { setChoice(value); applyTheme(value); try { localStorage.setItem("studydesk-theme", value); } catch { /* Apply this visit even without storage. */ } window.dispatchEvent(new Event("studydesk-theme-change")); }}><Icon size={20} /><span>{label}</span></button>)}</div>;
}
