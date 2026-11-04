import Link from "next/link";
import { ArrowRight, CalendarDays, LayoutList, Timer } from "lucide-react";
import { StudyBook } from "@/components/study-book";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemePreference } from "./theme-preference";

export const sections = ["subjects", "focus", "planner", "calendar", "settings"] as const;
export type Section = typeof sections[number];
const content = {
  subjects: { kicker: "A PLACE FOR EVERY CHAPTER", title: "Your subjects.", subtitle: "Everything you’re learning, a little more together.", icon: StudyBook, empty: "Room for your next big thing.", description: "Subjects will bring your folders, PDFs, links, and notes into one place. Subject creation and uploads are coming next.", note: "No subjects added yet", next: "Plan a little study time", href: "/planner" },
  focus: { kicker: "ONE THING AT A TIME", title: "Find your focus.", subtitle: "Put the rest aside. Make room for one good session.", icon: Timer, empty: "A quieter space is taking shape.", description: "Your subject timer and automatic study tracking are coming soon. The timer preview below is static; no time is being recorded.", note: "45 minutes of focus · 10 minutes to breathe", next: "Back to your desk", href: "" },
  planner: { kicker: "A LITTLE INTENTION GOES A LONG WAY", title: "Make a little plan.", subtitle: "Give today some direction, and yourself some breathing room.", icon: LayoutList, empty: "A fresh page for your day.", description: "Today, tomorrow, and the week ahead will come together here. Creating and saving study plans isn’t available yet.", note: "No plans added yet", next: "Take a look at your calendar", href: "/calendar" },
  calendar: { kicker: "A LITTLE LOOK AHEAD", title: "Good things ahead.", subtitle: "A home for the dates that matter to you.", icon: CalendarDays, empty: "Nothing on the horizon. Yet.", description: "Your exams, deadlines, and study plans will share this space. Adding calendar events is coming soon.", note: "No events added yet", next: "Back to your desk", href: "" },
};

export function SectionPage({ section, name, base = "/dashboard", preview = false }: { section: Section; name: string; base?: string; preview?: boolean }) {
  if (section === "settings") return <><div className="desk-heading"><div><p className="desk-kicker">MAKE YOURSELF AT HOME</p><h1>Your space, <em>your way.</em></h1><p>A few small choices for a more comfortable desk.</p></div></div><section className="desk-settings-section"><div className="desk-section-heading"><div><h2>Appearance</h2><p>Choose what feels comfortable. System follows your device.</p></div></div><ThemePreference /></section><section className="desk-settings-section"><h2>Your account</h2><p className="desk-settings-name">{name}</p><p>{preview ? "Fictional student for this design preview." : "Signed in to your private study space."}</p>{preview ? <p className="desk-dialog-note">Logout is available in your signed-in workspace.</p> : <LogoutButton />}</section><p className="desk-settings-note">Timer preferences and more personal touches will arrive with their features.</p></>;
  const item = content[section];
  const Icon = item.icon;
  return <><div className="desk-heading"><div><p className="desk-kicker">{item.kicker}</p><h1>{item.title}</h1><p>{item.subtitle}</p></div></div><section className="desk-section-empty"><span className="desk-section-illustration"><Icon size={55} strokeWidth={1.3} aria-hidden="true" /></span><p className="desk-kicker">{item.note}</p><h2>{item.empty}</h2><p>{item.description}</p>{section === "focus" && <div className="desk-timer-preview" aria-label="Static timer preview: 45 minutes">45<span>:</span>00<small>Timer coming soon</small></div>}<Link href={base + item.href} className="desk-outline-button">{item.next}<ArrowRight size={17} /></Link></section></>;
}
