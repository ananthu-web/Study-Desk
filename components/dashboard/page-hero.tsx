import type { ReactNode } from "react";
import { StudyBook } from "@/components/study-book";

/** Shared coloured header zone for dashboard pages. The page body follows in a `.desk-sheet`. */
export function PageHero({ children }: { children: ReactNode }) {
  return <div className="desk-hero is-page"><StudyBook className="desk-hero-mark" size={210} />{children}</div>;
}
