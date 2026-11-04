"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays, House, LayoutList, Settings2, Timer, ArrowUpRight } from "lucide-react";
import { StudyBook } from "@/components/study-book";
import { ThemeSync } from "./theme-preference";
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
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    mainRef.current?.scrollTo({ top: 0, behavior: "instant" });
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);
  const navigation = (mobile = false) => items.filter(item => !mobile || item.path !== "/settings").map(({ path, label, icon: Icon }) => {
    const active = pathname === base + path;
    return <Link key={path} href={base + path} className={`desk-nav-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}><Icon size={21} aria-hidden="true" /><span>{label}</span></Link>;
  });
  return <div className="desk-app"><ThemeSync /><AuthSuccessNotice userId={preview ? undefined : userId} />
    <a href="#desk-main" className="skip-link">Skip to your desk</a>
    <aside className="desk-sidebar">
      <Link href={base} className="desk-brand"><StudyBook size={29} /><span>study<span className="brand-light">desk</span><span className="brand-dot">.</span></span></Link>
      <p className="desk-nav-caption">YOUR LITTLE SPACE</p>
      <nav aria-label="Main navigation">{navigation()}</nav>
      <div className="desk-sidebar-bottom"><span className="desk-sidebar-rule" /><p>A little focus.<br /><em>A lot of possibility.</em></p><Link href={base + "/settings"} className="desk-account"><span className="desk-avatar">{name.slice(0, 1).toUpperCase()}</span><span>{name}<small>Your study space</small></span><ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    </aside>
    <div className="desk-workspace">
      <header className="desk-topbar"><Link href={base} className="desk-brand"><StudyBook size={27} /><span>study<span className="brand-light">desk</span><span className="brand-dot">.</span></span></Link><span className="desk-topbar-note">One thing at a time.</span><div className="desk-topbar-actions"><ThemeToggle /><Link href={base + "/settings"} className="desk-icon-button" aria-label="Open settings"><Settings2 size={19} /></Link></div></header>
      <main id="desk-main" ref={mainRef} className="desk-main" tabIndex={-1}>{preview && <p className="desk-preview-label">Design preview · fictional student · no account data</p>}{children}<footer className="desk-footer">Your own space. Your own pace.<span>studydesk.</span></footer></main>
    </div>
    <nav className="desk-bottom-nav" aria-label="Mobile navigation">{navigation(true)}</nav>
  </div>;
}
