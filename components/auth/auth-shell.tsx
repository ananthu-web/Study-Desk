"use client";
import { StudyBook } from "@/components/study-book";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useRef, type MouseEvent } from "react";
import { ArrowLeft, ArrowUpRight, Sprout } from "lucide-react";
import { DeskIllustration } from "@/components/auth/desk-illustration";
import { ThemeToggle } from "@/components/theme-toggle";

const entryRoutes = new Set(["/", "/login", "/signup"]);

export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const welcome = pathname === "/";
  const contentRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const departureHeight = useRef<number | null>(null);
  const navigating = useRef(false);
  const mounted = useRef(false);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    navigating.current = false;
    content.scrollTop = 0;
    const outer = content.closest(".form-main");
    if (outer) outer.scrollTop = 0;
    if (mounted.current) {
      const heading = content.querySelector("h2");
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
    }
    mounted.current = true;
    const from = departureHeight.current;
    departureHeight.current = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !content.animate) return;
    const entrance = content.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
    // On phones the green panel fills the screen on welcome and fits its content on login and sign-up.
    // The panel stays vertically centred, so its top and bottom edges move together while the content
    // keeps its final size and position (centred, clipped by the panel) for the whole animation.
    const panel = panelRef.current;
    const to = panel?.getBoundingClientRect().height;
    if (!panel || from === null || to === undefined || Math.abs(from - to) <= 1) return () => entrance.cancel();
    const contentHeight = content.getBoundingClientRect().height;
    const release = () => { panel.style.justifyContent = ""; content.style.flex = ""; content.style.height = ""; };
    panel.style.justifyContent = "center";
    content.style.flex = "none";
    content.style.height = `${contentHeight}px`;
    const resize = panel.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 300, easing: "cubic-bezier(.2, 0, 0, 1)" });
    resize.addEventListener("finish", release);
    return () => { entrance.cancel(); resize.cancel(); release(); };
  }, [pathname]);

  async function navigate(event: MouseEvent<HTMLElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest("a") : null;
    if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
    const destination = new URL(anchor.href, window.location.origin);
    if (destination.origin !== window.location.origin || !entryRoutes.has(destination.pathname) || destination.hash || destination.pathname === pathname) return;
    event.preventDefault();
    if (navigating.current) return;
    navigating.current = true;
    departureHeight.current = panelRef.current?.getBoundingClientRect().height ?? null;
    const content = contentRef.current;
    let departure: Animation | undefined;
    if (content?.animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      departure = content.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: "ease-in", fill: "forwards" });
      await departure.finished.catch(() => undefined);
    }
    try {
      router.push(destination.pathname + destination.search, { scroll: false });
    } catch {
      departure?.cancel();
      departureHeight.current = null;
      navigating.current = false;
    }
  }

  return (
    <main className={`auth-layout${welcome ? " welcome-layout" : ""}`} onClickCapture={navigate}>
      <a className="skip-link" href={welcome ? "#welcome-actions" : "#auth-form"}>{welcome ? "Skip to get started" : "Skip to form"}</a>
      <section className="story-panel" aria-label="Welcome to StudyDesk">
        <Link href="/" className="brand" aria-label="StudyDesk welcome">
          <span className="brand-mark"><StudyBook size={27} /></span>
          <span>study<span className="brand-light">desk</span><span className="brand-dot">.</span></span>
        </Link>
        <div className="story-copy">
          <p className="eyebrow"><span className="tiny-line" /> A SPACE TO MAKE PROGRESS</p>
          <h1>A little focus.<br />A lot of <em>possibility.</em></h1>
          <p className="story-description">Your subjects, your plans, your next big thing.<br className="desktop-break" /> Find a little room for all of it.</p>
        </div>
        <div className="illustration-wrap"><DeskIllustration /></div>
        <div className="story-bottom">
          <p><Sprout size={17} strokeWidth={1.5} /> Small steps. Meaningful progress.</p>
          <ArrowUpRight size={18} strokeWidth={1.4} aria-hidden="true" />
        </div>
      </section>
      <section className="form-panel" aria-label={welcome ? "Start with StudyDesk" : "Your account"}>
        <header className="form-topbar">
          <span className="topbar-caption">YOUR PERSONAL STUDY SPACE</span>
          <ThemeToggle />
        </header>
        <div className="form-main">
          <div className={`entry-panel ${welcome ? "entry-welcome" : "entry-form"}`} ref={panelRef}>
            <div className="entry-panel-content" ref={contentRef} key={pathname}>
              {!welcome && <Link href="/" className="entry-back"><ArrowLeft size={16} aria-hidden="true" /><span>Back to welcome</span></Link>}
              {children}
            </div>
          </div>
        </div>
        <footer className="form-footer"><span>Made for a clearer mind.</span><span className="preview-label"><span /> Your study space</span></footer>
      </section>
    </main>
  );
}
