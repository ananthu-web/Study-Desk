"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays, House, LayoutList, Settings2, Timer, ArrowUpRight } from "lucide-react";
import { StudyBook } from "@/components/study-book";
import { ThemeSync } from "./theme-preference";
import "./dashboard-polish.css";
import { AuthSuccessNotice } from "@/components/auth/auth-success-notice";
import { ThemeToggle } from "@/components/theme-toggle";

const items = [
  { path: "", label: "Home", icon: House },
  { path: "/subjects", label: "Subjects", icon: StudyBook },
  { path: "/focus", label: "Focus", icon: Timer },
  { path: "/planner", label: "Planner", icon: LayoutList },
  { path: "/calendar", label: "Calendar", icon: CalendarDays },
  { path: "/settings", label: "Settings", icon: Settings2 },
];

export function AppShell({ children, name, userId, base = "/dashboard", preview = false }: { children: React.ReactNode; name: string; userId?: string; base?: string; preview?: boolean }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);
  const topbarRef = useRef<HTMLElement>(null);
  const [topbarHidden, setTopbarHidden] = useState(false);
  // Phones: the top bar hides while scrolling down and returns on scrolling up (never inside a subject's workspace).
  useEffect(() => {
    const main = mainRef.current, bar = topbarRef.current;
    if (!main || !bar) return;
    let lastY = main.scrollTop, lockedUntil = 0, hidden = false;
    const set = (value: boolean) => { if (hidden === value) return; hidden = value; lockedUntil = performance.now() + 350; setTopbarHidden(value); };
    const measure = () => { if (hidden) return; bar.style.height = "auto"; const natural = bar.offsetHeight; bar.style.height = ""; bar.parentElement?.style.setProperty("--topbar-h", `${natural}px`); };
    const onScroll = () => {
      const y = main.scrollTop, delta = y - lastY;
      lastY = y;
      if (performance.now() < lockedUntil || main.querySelector(".subject-workspace-hero")) { if (main.querySelector(".subject-workspace-hero")) set(false); return; }
      if (y < 24 || delta < -8) set(false);
      else if (delta > 8 && y > 96) set(true);
    };
    measure();
    window.addEventListener("resize", measure);
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("resize", measure); main.removeEventListener("scroll", onScroll); };
  }, [pathname]);
  useEffect(() => { setTopbarHidden(false); }, [pathname]);
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    mainRef.current?.scrollTo({ top: 0, behavior: "instant" });
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);
  const navigation = (mobile = false) => items.filter(item => !mobile || item.path !== "/settings").map(({ path, label, icon: Icon }) => {
    const active = pathname === base + path;
    return <Link key={path} href={base + path} className={`desk-nav-link${active ? " is-active" : ""}${mobile && path === "/focus" ? " is-fab" : ""}`} aria-current={active ? "page" : undefined}><Icon size={21} aria-hidden="true" /><span>{label}</span></Link>;
  });
  return <div className={`desk-app${pathname === base ? " is-home" : ""}${topbarHidden ? " is-topbar-hidden" : ""}`}><ThemeSync /><AuthSuccessNotice userId={preview ? undefined : userId} />
    <a href="#desk-main" className="skip-link">Skip to your desk</a>
    <aside className="desk-sidebar">
      <Link href={base} className="desk-brand"><StudyBook size={29} /><span>study<span className="brand-light">desk</span><span className="brand-dot">.</span></span></Link>
      <p className="desk-nav-caption">YOUR LITTLE SPACE</p>
      <nav aria-label="Main navigation">{navigation()}</nav>
      <div className="desk-sidebar-bottom"><span className="desk-sidebar-rule" /><p>A little focus.<br /><em>A lot of possibility.</em></p><Link href={base + "/settings"} className="desk-account"><span className="desk-avatar">{name.slice(0, 1).toUpperCase()}</span><span>{name}<small>Your study space</small></span><ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    </aside>
    <div className="desk-workspace">
      <header className="desk-topbar" ref={topbarRef} onFocusCapture={() => setTopbarHidden(false)}><Link href={base} className="desk-brand"><StudyBook size={27} /><span>study<span className="brand-light">desk</span><span className="brand-dot">.</span></span></Link><span className="desk-topbar-note">One thing at a time.</span><div className="desk-topbar-actions"><ThemeToggle /><Link href={base + "/settings"} className="desk-icon-button" aria-label="Open settings"><Settings2 size={19} /></Link></div></header>
      <main id="desk-main" ref={mainRef} className="desk-main" tabIndex={-1}>{preview && <p className="desk-preview-label">Design preview · fictional student · no account data</p>}{children}<footer className="desk-footer">Your own space. Your own pace.<span>studydesk.</span></footer></main>
    </div>
    <nav className="desk-bottom-nav" aria-label="Mobile navigation">{navigation(true)}</nav>
  </div>;
}
