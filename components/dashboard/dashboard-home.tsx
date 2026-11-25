"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, Atom, Check, Clock3, FlaskConical, LayoutList, Play, Plus, Sigma, Target, Timer, X, CalendarDays } from "lucide-react";
import { useStoredSubjects } from "@/components/subjects/use-stored-subjects";
import { goalLabel } from "@/components/subjects/subject-data";
import { StudyBook } from "@/components/study-book";
import { BooksMug } from "./books-mug";
import { SubjectArt } from "@/components/subjects/subject-art";

const subjects = [
  { name: "Mathematics", chapter: "A little closer to understanding.", topic: "Integration & its applications", count: "12 resources", code: "01", tone: "sage", detail: "Revise integration by substitution, then work through five practice questions." },
  { name: "Physics", chapter: "Make sense of the everyday.", topic: "Waves & oscillations", count: "8 resources", code: "02", tone: "sand", detail: "Review simple harmonic motion, wave equations, and your class notes." },
  { name: "Chemistry", chapter: "Small things. Big discoveries.", topic: "Organic chemistry", count: "6 resources", code: "03", tone: "clay", detail: "Organise reaction mechanisms and revisit the questions from your last class." },
];
const sampleLook: Record<string, { colour: string; Icon: typeof Sigma }> = {
  Mathematics: { colour: "sage", Icon: Sigma },
  Physics: { colour: "sand", Icon: Atom },
  Chemistry: { colour: "clay", Icon: FlaskConical },
};
const initialPlans = [
  { title: "Practice integration", subject: "Mathematics", duration: "45 min", done: false },
  { title: "Revisit wave equations", subject: "Physics", duration: "30 min", done: false },
  { title: "Organise reaction notes", subject: "Chemistry", duration: "20 min", done: true },
];

function Folder({ colour, name, meta, tag, href, onClick }: { colour: string; name: string; meta: string; tag?: string; href?: string; onClick?: () => void }) {
  const inner = <><span className="desk-folder-sheets" aria-hidden="true"><i /><i /><i><SubjectArt className="desk-folder-art" name={name} colour={colour} /></i></span><span className="desk-folder-front"><span className="desk-folder-name">{name}</span><span className="desk-folder-meta">{meta}</span>{tag && <span className="desk-folder-tag">{tag}</span>}</span></>;
  const className = `desk-folder subject-colour-${colour}`;
  return href ? <Link href={href} className={className}>{inner}</Link> : <button type="button" className={className} onClick={onClick}>{inner}</button>;
}

export function DashboardHome({ name, base = "/dashboard", initialSample = false }: { name: string; base?: string; initialSample?: boolean }) {
  const [sample, setSample] = useState(initialSample);
  const stored = useStoredSubjects(base === "/dashboard");
  const [date, setDate] = useState("Today");
  const [today, setToday] = useState<Date | null>(null);
  const [goal, setGoal] = useState(120);
  const [goalDraft, setGoalDraft] = useState("120");
  const [plans, setPlans] = useState(initialPlans);
  const [dialog, setDialog] = useState<"goal" | number | null>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  useEffect(() => { setToday(new Date()); setDate(new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date())); }, []);
  useEffect(() => {
    if (dialog !== null && modal.current && !modal.current.open) modal.current.showModal();
    else if (dialog === null && modal.current?.open) modal.current.close();
  }, [dialog]);
  const studied = sample ? 95 : 0;
  const minutes = (value: number) => `${Math.floor(value / 60) ? `${Math.floor(value / 60)}h ` : ""}${value % 60}m`;
  const firstName = name.trim().split(/\s+/)[0] || "friend";
  const goalPercent = Math.min(100, Math.round(studied / goal * 100));
  const doneCount = plans.filter(plan => plan.done).length;
  const planPercent = Math.round(doneCount / plans.length * 100);
  const exam = today ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5) : null;
  const examDay = exam ? String(exam.getDate()) : "–";
  const examMonth = exam ? new Intl.DateTimeFormat(undefined, { month: "short" }).format(exam).toUpperCase() : "";
  const examLong = exam ? new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" }).format(exam) : "";
  const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
  const next = sample ? plans.find(plan => !plan.done) : undefined;
  const then = sample && next ? plans.filter(plan => !plan.done && plan !== next) : [];
  const subjectsValue = sample ? "3 sample subjects" : stored.loading ? "Opening…" : stored.error ? "Couldn’t load" : stored.subjects.length ? `${stored.subjects.length} saved` : "None yet";
  function close() { modal.current?.close(); setDialog(null); setError(""); }
  return <>
    <div className="desk-hero">
      <StudyBook className="desk-hero-mark" size={210} />
      <div className="desk-date-row"><p className="desk-kicker">{date}</p><div className="desk-view-switch" role="group" aria-label="Dashboard data view"><button aria-pressed={!sample} onClick={() => setSample(false)}>Your desk</button><button aria-pressed={sample} onClick={() => setSample(true)}>Sample desk</button></div></div>
      <div className="desk-heading"><div><h1>A little focus, <em>{firstName}.</em></h1><p>{sample ? "Let’s make today count." : "Make room for what you want to learn today."}</p></div><span className="desk-chapter">YOUR DESK / 01</span></div>
      <section className={`desk-upnext${next ? ` has-subject subject-colour-${sampleLook[next.subject].colour}` : ""}`} aria-label={next ? "Up next" : "Start studying"}>
        {next ? <SubjectArt className="desk-upnext-art" name={next.subject} colour={sampleLook[next.subject].colour} /> : <BooksMug className="desk-upnext-art" />}
        <div className="desk-upnext-copy">
          <span className="desk-upnext-label">{next ? "Up next" : sample ? "All done" : "Start here"}</span>
          <strong>{next ? next.title : sample ? "Today’s plan is complete" : "Begin a study session"}</strong>
          {next ? <span className="desk-tags"><span>{next.subject}</span><span><Clock3 size={13} aria-hidden="true" />{next.duration}</span></span> : <span className="desk-upnext-sub">{sample ? "Nice work. Rest, or plan what comes next." : "One subject. One session."}</span>}
        </div>
        {sample && <div className="desk-upnext-progress"><span className="desk-upnext-bar" role="progressbar" aria-label="Tasks done today" aria-valuemin={0} aria-valuemax={plans.length} aria-valuenow={doneCount}><b style={{ width: `${planPercent}%` }} /></span><small>{doneCount} of {plans.length} tasks done today</small></div>}
        {then.length > 0 && <p className="desk-upnext-then">Then: {then.map(plan => lower(plan.title)).join(" · ")}</p>}
        <div className="desk-upnext-actions"><Link href={base + "/focus"} className="desk-upnext-start"><Play size={17} fill="currentColor" aria-hidden="true" />Start studying</Link><Link href={base + "/planner"} className="desk-upnext-plan">Plan today</Link></div>
      </section>
      {sample && <p className="desk-sample-note"><span />Sample data · won’t affect your account.</p>}
    </div>

    <div className="desk-sheet">
      <section className="desk-overview" aria-labelledby="overview-heading">
        <div className="desk-section-heading"><h2 id="overview-heading">Your day</h2><span className="desk-overview-note">{sample ? "Sample" : "Preview"}</span></div>
        <div className="desk-stat-list">
          <button type="button" className="desk-stat is-goal" aria-label={`Today's study goal: ${minutes(studied)} of ${minutes(goal)}. Preview editing the daily study goal.`} onClick={() => { setGoalDraft(String(goal)); setDialog("goal"); }}>
            <span className="desk-stat-icon"><Target size={21} aria-hidden="true" /></span>
            <span className="desk-stat-text"><strong>Study goal</strong><span>{minutes(studied)} / {minutes(goal)}</span></span>
            <span className="desk-ring" style={{ "--p": goalPercent } as CSSProperties} aria-hidden="true"><b>{goalPercent}%</b></span>
          </button>
          <Link href={base + "/subjects"} className="desk-stat is-subjects">
            <span className="desk-stat-icon"><StudyBook size={22} /></span>
            <span className="desk-stat-text"><strong>Subjects</strong><span>{subjectsValue}</span></span>
            <span className="desk-stat-go" aria-hidden="true"><ArrowUpRight size={18} /></span>
          </Link>
          <Link href={base + "/planner"} className="desk-stat is-plan">
            <span className="desk-stat-icon"><LayoutList size={21} aria-hidden="true" /></span>
            <span className="desk-stat-text"><strong>Today’s plan</strong><span>{sample ? `${doneCount} of ${plans.length} done` : "Nothing planned yet"}</span></span>
            {sample ? <span className="desk-ring" style={{ "--p": planPercent } as CSSProperties} aria-hidden="true"><b>{planPercent}%</b></span> : <span className="desk-stat-go" aria-hidden="true"><ArrowUpRight size={18} /></span>}
          </Link>
        </div>
        <p className="desk-goal-footnote">{sample ? "Sample progress · timer not connected" : "Preview goal · time tracking coming soon"}</p>
      </section>

      <section className="desk-subjects" aria-labelledby="subjects-heading"><div className="desk-section-heading"><div><p className="desk-kicker">A PLACE FOR EVERY CHAPTER</p><h2 id="subjects-heading">Your subjects<span className="desk-count">{sample ? "03" : stored.loading || stored.error ? "—" : String(stored.subjects.length).padStart(2, "0")}</span></h2></div><Link href={base + "/subjects"} className="desk-text-action">{sample || stored.subjects.length ? "View all" : "Set up subjects"}<ArrowUpRight size={16} /></Link></div>
        {sample ? <div className="desk-folder-grid">{subjects.map((subject, i) => <Folder key={subject.name} colour={sampleLook[subject.name].colour} name={subject.name} meta={subject.count} tag="Sample" onClick={() => setDialog(i)} />)}<Link href={base + "/subjects"} className="desk-folder is-add"><span className="desk-folder-front"><Plus size={26} aria-hidden="true" /><span className="desk-folder-name">Add subject</span></span></Link></div>
        : base === "/dashboard" && stored.loading ? <div className="desk-skel-list" role="status" aria-label="Opening your subjects"><span /><span /><span /></div>
        : base === "/dashboard" && stored.error ? <div className="subject-load-state" role="alert"><p>{stored.error}</p><button className="desk-outline-button" onClick={() => void stored.reload()}>Try again</button></div>
        : stored.subjects.length ? <div className="desk-folder-grid">{stored.subjects.slice(0, 3).map(subject => <Folder key={subject.id} colour={subject.colour} name={subject.name} meta={subject.goal ? `${goalLabel(subject.goal)} daily intention` : "At your own pace"} href={`${base}/subjects?subject=${subject.id}`} />)}<Link href={base + "/subjects"} className="desk-folder is-add"><span className="desk-folder-front"><Plus size={26} aria-hidden="true" /><span className="desk-folder-name">Add subject</span></span></Link></div>
        : <div className="desk-empty-subjects"><span className="desk-empty-mark"><StudyBook size={35} /></span><div><h3>Your next chapter belongs here.</h3><p>Keep your subjects, notes, and materials together. Your desk is ready for them.</p></div><Link href={base + "/subjects"} className="desk-outline-button"><Plus size={17} />Explore subjects</Link></div>}
      </section>

      <div className="desk-lower-grid"><section aria-labelledby="agenda-heading"><div className="desk-section-heading"><div><p className="desk-kicker">ONE THING AT A TIME</p><h2 id="agenda-heading">On your desk today</h2></div><Link href={base + "/planner"} className="desk-text-action">Planner<ArrowUpRight size={16} /></Link></div>{sample ? <ul className="desk-agenda">{plans.map((plan, i) => { const look = sampleLook[plan.subject]; return <li key={plan.title}><span className={`desk-thumb subject-colour-${look.colour}`}><SubjectArt name={plan.subject} colour={look.colour} /></span><div className={plan.done ? "desk-plan-done" : ""}><h3>{plan.title}</h3><p>{plan.subject} · {plan.duration}</p></div><button className={`desk-plan-check${plan.done ? " is-done" : ""}`} aria-label={`Mark ${plan.title} ${plan.done ? "incomplete" : "complete"}`} aria-pressed={plan.done} onClick={() => setPlans(current => current.map((item, index) => index === i ? { ...item, done: !item.done } : item))}>{plan.done && <Check size={16} />}</button></li>; })}</ul> : <div className="desk-empty-agenda"><p>A little breathing room.</p><span>Your study plans will appear here when planning is ready.</span><Link className="desk-text-action" href={base + "/planner"}>Explore your planner<ArrowRight size={16} /></Link></div>}</section>
        <section className="desk-next-up" aria-labelledby="upcoming-heading"><div className="desk-section-heading"><div><p className="desk-kicker">A LITTLE LOOK AHEAD</p><h2 id="upcoming-heading">Coming up</h2></div><CalendarDays size={21} aria-hidden="true" /></div>{sample ? <><div className="desk-deadline"><span className="desk-deadline-date"><strong>{examDay}</strong>{examMonth}</span><div><span className="desk-event-type">EXAM · SAMPLE</span><h3>Mathematics assessment</h3><p>Integration & applications</p><span className="desk-countdown">In 5 days{examLong ? ` · ${examLong}` : ""}</span></div><span className="desk-thumb is-large subject-colour-sage"><SubjectArt name="Mathematics" colour="sage" /></span></div><p className="desk-next-note">A little preparation today.<br />A little more confidence tomorrow.</p></> : <p className="desk-next-note">Nothing on the horizon yet.<br />Your exams and deadlines will have a home here.</p>}<Link href={base + "/calendar"} className="desk-text-action">Open calendar<ArrowRight size={16} /></Link></section></div>
    </div>

    <dialog ref={modal} className="desk-dialog" onCancel={() => setDialog(null)} onClose={() => { setDialog(null); setError(""); }} onClick={event => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close(); } }} aria-labelledby="desk-dialog-title"><button className="desk-dialog-close desk-icon-button" onClick={close} aria-label="Close dialog"><X size={20} /></button>{dialog === "goal" ? <form onSubmit={event => { event.preventDefault(); const value = Number(goalDraft); if (!Number.isInteger(value) || value < 15 || value > 720) { setError("Choose a whole number from 15 to 720 minutes."); return; } setGoal(value); close(); }}><p className="desk-kicker">A LITTLE INTENTION</p><h2 id="desk-dialog-title">Make time for <em>you.</em></h2><p>This is a design preview. Your goal changes only on this screen and resets when you leave.</p><label htmlFor="daily-goal">Daily goal in minutes</label><input id="daily-goal" type="number" inputMode="numeric" min={15} max={720} step={1} required value={goalDraft} onChange={e => setGoalDraft(e.target.value)} aria-invalid={!!error} aria-describedby="goal-error" /><p id="goal-error" role="status" className="field-error">{error}</p><button className="desk-primary" type="submit">Preview goal<Check size={17} /></button></form> : typeof dialog === "number" ? <><p className="desk-kicker">SUBJECT PREVIEW</p><h2 id="desk-dialog-title">{subjects[dialog].name}</h2><p>{subjects[dialog].topic}</p><p>{subjects[dialog].detail}</p><div className="desk-dialog-note">Sample subject. Materials and subject editing aren’t connected yet.</div><Link className="desk-primary" href={base + "/subjects"}>Explore subjects<ArrowRight size={17} /></Link></> : null}</dialog>
  </>;
}
