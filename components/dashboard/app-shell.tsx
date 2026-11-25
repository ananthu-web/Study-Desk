"use client";

import Link, { useLinkStatus } from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays, House, LayoutList, Settings2, Timer, ArrowUpRight } from "lucide-react";
import { StudyBook } from "@/components/study-book";
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

function NavigationPending() {
  const { pending } = useLinkStatus();
  return <i className="desk-nav-pending" data-pending={pending || undefined} aria-hidden="true" />;
}

export function AppShell({ children, name, userId, base = "/dashboard", preview = false }: { children: React.ReactNode; name: string; userId?: string; base?: string; preview?: boolean }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);
  const topbarRef = useRef<HTMLElement>(null);
  const [topbarHidden, setTopbarHidden] = useState(false);
  const hiddenRef = useRef(false);
  const updateHeader = useCallback((hidden: boolean) => {
    if (hiddenRef.current === hidden) return;
    hiddenRef.current = hidden;
    setTopbarHidden(hidden);
  }, []);
  // Move the header on its own layer; never resize the scroller during a gesture.
  useEffect(() => {
    const main = mainRef.current, bar = topbarRef.current;
    if (!main || !bar) return;
    const phone = matchMedia("(max-width: 800px)");
    let lastY = main.scrollTop, direction = 0, anchor = lastY, barHeight = 0;
    let inSubject = !!main.querySelector(".subject-workspace-hero");
    const contentObserver = new MutationObserver(() => {
      inSubject = !!main.querySelector(".subject-workspace-hero");
      if (inSubject) updateHeader(false);
    });
    contentObserver.observe(main, { childList: true });
    const sizeObserver = new ResizeObserver(entries => {
      const height = entries[0].borderBoxSize?.[0]?.blockSize ?? bar.offsetHeight;
      if (height !== barHeight) {
        barHeight = height;
        bar.parentElement?.style.setProperty("--topbar-h", `${height}px`);
      }
    });
    sizeObserver.observe(bar);
    const onScroll = () => {
      const y = main.scrollTop, delta = y - lastY;
      if (delta && Math.sign(delta) !== direction) { direction = Math.sign(delta); anchor = lastY; }
      lastY = y;
      if (!phone.matches || inSubject || y < 24) updateHeader(false);
      else if (direction > 0 && y > 96 && y - anchor > 16) updateHeader(true);
      else if (direction < 0 && anchor - y > 12) updateHeader(false);
    };
    const reset = () => { if (!phone.matches) updateHeader(false); };
    phone.addEventListener("change", reset);
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => { contentObserver.disconnect(); sizeObserver.disconnect(); phone.removeEventListener("change", reset); main.removeEventListener("scroll", onScroll); };
  }, [pathname, updateHeader]);
  useEffect(() => { updateHeader(false); }, [pathname, updateHeader]);
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    mainRef.current?.scrollTo({ top: 0, behavior: "instant" });
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);
  const navigation = (mobile = false) => items.filter(item => !mobile || item.path !== "/settings").map(({ path, label, icon: Icon }) => {
    const active = pathname === base + path;
    return <Link key={path} href={base + path} className={`desk-nav-link${active ? " is-active" : ""}${mobile && path === "/focus" ? " is-fab" : ""}`} aria-current={active ? "page" : undefined}><Icon size={21} aria-hidden="true" /><span>{label}</span><NavigationPending /></Link>;
  });
  return <div className={`desk-app${pathname === base ? " is-home" : ""}${topbarHidden ? " is-topbar-hidden" : ""}`}><AuthSuccessNotice userId={preview ? undefined : userId} />
    <a href="#desk-main" className="skip-link">Skip to your desk</a>
    <aside className="desk-sidebar">
      <Link href={base} className="desk-brand"><StudyBook size={29} /><span>study<span className="brand-light">desk</span><span className="brand-dot">.</span></span></Link>
      <p className="desk-nav-caption">YOUR LITTLE SPACE</p>
      <nav aria-label="Main navigation">{navigation()}</nav>
      <div className="desk-sidebar-bottom"><span className="desk-sidebar-rule" /><p>A little focus.<br /><em>A lot of possibility.</em></p><Link href={base + "/settings"} className="desk-account"><span className="desk-avatar">{name.slice(0, 1).toUpperCase()}</span><span>{name}<small>Your study space</small></span><ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    </aside>
    <div className="desk-workspace">
      <header className="desk-topbar" ref={topbarRef} onFocusCapture={() => updateHeader(false)}><Link href={base} className="desk-brand"><StudyBook size={27} /><span>study<span className="brand-light">desk</span><span className="brand-dot">.</span></span></Link><span className="desk-topbar-note">One thing at a time.</span><div className="desk-topbar-actions"><ThemeToggle /><Link href={base + "/settings"} className="desk-icon-button" aria-label="Open settings"><Settings2 size={19} /></Link></div></header>
      <main id="desk-main" ref={mainRef} className="desk-main" tabIndex={-1}>{preview && <p className="desk-preview-label">Design preview · fictional student · no account data</p>}{children}<footer className="desk-footer">Your own space. Your own pace.<span>studydesk.</span></footer></main>
    </div>
    <nav className="desk-bottom-nav" aria-label="Mobile navigation">{navigation(true)}</nav>
  </div>;
}
