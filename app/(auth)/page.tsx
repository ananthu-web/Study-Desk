import { StudyBook } from "@/components/study-book";
import Link from "next/link";
import { ArrowRight, CalendarDays, Timer } from "lucide-react";
import { DeskIllustration } from "@/components/auth/desk-illustration";

export default function Home() {
  return (
      <div className="auth-content welcome-content">
        <div className="form-intro">
          <p className="eyebrow form-eyebrow"><span className="tiny-line" /> WELCOME TO STUDYDESK</p>
          <h2>A clearer space.<br />A <em>calmer start.</em></h2>
          <p className="form-description">Make room for what you want to learn.{" "}<br />One desk for your subjects, your plans, and a little more focus.</p>
        </div>
        <div className="mobile-welcome-art" aria-hidden="true"><DeskIllustration idPrefix="mobile-desk" /></div>
        <ul className="welcome-features" aria-label="Your study workspace">
          <li><span className="welcome-feature-icon"><StudyBook size={19} /></span><div><h3><span className="feature-title-full">Everything in its place</span><span className="feature-title-mobile">Organise</span></h3><p>Subjects, notes, and materials, together.</p></div></li>
          <li><span className="welcome-feature-icon"><Timer size={19} strokeWidth={1.5} /></span><div><h3><span className="feature-title-full">A little time to focus</span><span className="feature-title-mobile">Focus</span></h3><p>Study at your pace, one session at a time.</p></div></li>
          <li><span className="welcome-feature-icon"><CalendarDays size={19} strokeWidth={1.5} /></span><div><h3><span className="feature-title-full">Room for what comes next</span><span className="feature-title-mobile">Plan</span></h3><p>A clearer view of your tasks and deadlines.</p></div></li>
        </ul>
        <div id="welcome-actions" className="welcome-actions" tabIndex={-1}>
          <Link href="/signup" className="submit-button welcome-primary"><span>Get started</span><ArrowRight size={19} strokeWidth={1.6} /></Link>
          <Link href="/login" className="welcome-signin"><span className="signin-prefix">Already have an account?</span><span className="signin-label">Sign in</span><ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <p className="welcome-closing">Your own space. Your own pace.</p>
      </div>
  );
}
