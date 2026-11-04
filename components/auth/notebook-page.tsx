"use client";

import { useEffect, useRef } from "react";

const STRIPS = 22;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** A flexible sheet projected onto the same isometric axes as the desk. */
export function NotebookPage() {
  const root = useRef<SVGGElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const strips = element.querySelectorAll<SVGPathElement>("[data-sheet]");
    const rules = element.querySelector<SVGPathElement>("[data-rules]")!;
    const edge = element.querySelector<SVGPathElement>("[data-edge]")!;
    const shadow = element.querySelector<SVGPathElement>("[data-shadow]")!;
    let visible = false;
    let frame = 0;
    let elapsed = 0;
    let last = 0;
    let painted = 0;

    function draw(time: number) {
      const phase = (time % 10500) / 10500;
      // A long resting interval, then lift, cross the spine, and gently settle.
      const progress = Math.max(0, Math.min(1, (phase - .55) / .36));
      if (progress === 0 || progress === 1) { element!.setAttribute("opacity", "0"); return; }
      const angle = Math.PI * smooth(progress);
      const lift = Math.sin(angle);
      const point = (u: number, v: number, flat = false) => {
        // The free edge leads slightly; the flexible centre follows with a soft curl.
        const curl = 13 * Math.sin(Math.PI * u) * lift * Math.sin(angle + v * .35);
        const along = 74 * u * Math.cos(angle) + curl * .25;
        const height = flat ? 0 : 57 * u * lift + curl;
        return [233 + 80 * v + along, 268 - 47 * v + along * 40 / 74 - height];
      };
      const xy = (p: number[]) => p.map(n => n.toFixed(2)).join(",");
      const line = (u: number, reverse = false, flat = false) => Array.from({ length: 9 }, (_, i) => point(u, reverse ? 1 - i / 8 : i / 8, flat));
      const polygon = (a: number, b: number, flat = false) => "M" + [...line(a, false, flat), ...line(b, true, flat)].map(xy).join("L") + "Z";
      const opacity = Math.min(1, progress / .05, (1 - progress) / .09);
      element!.setAttribute("opacity", String(opacity));
      shadow.setAttribute("d", polygon(0, 1, true));
      shadow.setAttribute("opacity", String(.08 + lift * .12));
      strips.forEach((strip, i) => {
        // Tiny overlap prevents anti-aliased seams between curved paper strips.
        strip.setAttribute("d", polygon(i / STRIPS, Math.min(1, (i + 1.015) / STRIPS)));
        const shade = Math.round(10 * lift + 8 * Math.sin(i / STRIPS * Math.PI) * lift);
        strip.setAttribute("fill", `rgb(${249 - shade},${244 - shade},${222 - shade})`);
      });
      rules.setAttribute("d", [.25, .42, .59, .76].map(u => "M" + Array.from({ length: 7 }, (_, i) => xy(point(u, .2 + i * .09))).join("L")).join(""));
      rules.setAttribute("opacity", angle > Math.PI / 2 ? ".26" : ".65");
      edge.setAttribute("d", "M" + line(1).map(xy).join("L"));
    }

    function tick(now: number) {
      elapsed += Math.min(now - last, 64);
      last = now;
      if (now - painted >= 32) { draw(elapsed); painted = now; }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      const focused = element!.closest(".auth-layout")?.querySelector("form:focus-within");
      if (motion.matches) element!.setAttribute("opacity", "0");
      if (!visible || document.hidden || motion.matches || focused) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    observer.observe(element.ownerSVGElement ?? element);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    document.addEventListener("focusin", sync);
    document.addEventListener("focusout", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      document.removeEventListener("focusin", sync);
      document.removeEventListener("focusout", sync);
    };
  }, []);

  return <g ref={root} className="desk-paper-motion" opacity="0" aria-hidden="true">
    <path data-shadow fill="#5c4c35" />
    {Array.from({ length: STRIPS }, (_, i) => <path key={i} data-sheet />)}
    <path data-rules fill="none" stroke="#8b967d" strokeWidth="1.1" strokeLinecap="round" />
    <path data-edge fill="none" stroke="#d4cbb2" strokeWidth=".7" />
  </g>;
}
