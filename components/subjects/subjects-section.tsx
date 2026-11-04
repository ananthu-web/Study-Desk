"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight, Clock3, FileText, Folder, Link2, Pencil, Plus, Trash2, X } from "lucide-react";
import { StudyBook } from "@/components/study-book";
import { subjectApi, SubjectRequestError, useStoredSubjects } from "./use-stored-subjects";
import { SubjectForm } from "./subject-form";
import { exampleMaterials, exampleSubjects, goalLabel, type Subject } from "./subject-data";

type Dialog = { kind: "add" } | { kind: "edit" | "delete"; subject: Subject } | { kind: "resource"; title: string; description: string } | null;

export function SubjectsSection({ base = "/dashboard", preview = false }: { base?: string; preview?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const subjectId = query.get("subject");
  const folderId = query.get("folder");
  const tab = query.get("tab") === "notes" ? "notes" : "materials";
  const [sampleChoice, setSampleChoice] = useState(preview);
  const sample = subjectId ? subjectId.startsWith("sample-") : sampleChoice;
  const [ownSubjects, setOwnSubjects] = useState<Subject[]>([]);
  const [samples, setSamples] = useState<Subject[]>(exampleSubjects);
  const stored = useStoredSubjects(!preview);
  const temporary = sample || preview;
  const subjects = sample ? samples : preview ? ownSubjects : stored.subjects;
  const [pending, setPending] = useState(false);
  const [operationError, setOperationError] = useState("");
  const requestActive = useRef(false);
  const subject = subjects.find(item => item.id === subjectId);
  const sampleContent = !!subject && exampleSubjects.some(item => item.id === subject.id);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [feedback, setFeedback] = useState("");
  const modal = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const previousSubject = useRef(subjectId);
  const afterCloseFocus = useRef(false);
  useEffect(() => {
    if (subjectId === previousSubject.current) return;
    previousSubject.current = subjectId;
    document.querySelector(".desk-main")?.scrollTo({ top: 0, behavior: "instant" });
    heading.current?.focus({ preventScroll: true });
  }, [subjectId]);
  useEffect(() => {
    if (dialog && modal.current && !modal.current.open) modal.current.showModal();
    if (!dialog && modal.current?.open) modal.current.close();
  }, [dialog]);
  function navigate(id?: string, nextTab = "materials", folder?: string) {
    const params = new URLSearchParams();
    if (id) params.set("subject", id);
    if (nextTab === "notes") params.set("tab", nextTab);
    if (folder) params.set("folder", folder);
    router.push(pathname + (params.size ? "?" + params.toString() : ""), { scroll: false });
  }
  function close(force = false) {
    if (requestActive.current && !force) return;
    modal.current?.close(); setDialog(null); setOperationError("");
  }
  async function save(values: Omit<Subject, "id">) {
    if (requestActive.current) return;
    const editing = dialog?.kind === "edit" ? dialog.subject : undefined;
    setOperationError("");
    if (temporary) {
      const id = editing?.id ?? `${sample ? "sample-" : "local-"}${crypto.randomUUID()}`;
      (sample ? setSamples : setOwnSubjects)(current => editing ? current.map(item => item.id === id ? { ...values, id } : item) : [...current, { ...values, id }]);
      setFeedback(`${values.name} ${editing ? "updated" : "added"} in this preview only.`);
      close(); return;
    }
    requestActive.current = true; setPending(true);
    try {
      const { subject: saved } = await subjectApi<{ subject: Subject }>(editing ? `/${editing.id}` : "", { method: editing ? "PATCH" : "POST", body: JSON.stringify(values) });
      stored.setSubjects(current => editing ? current.map(item => item.id === saved.id ? saved : item) : [saved, ...current]);
      setFeedback(`${saved.name} ${editing ? "updated" : "added"}. Saved to your account.`);
      close(true);
    } catch (error) {
      if (error instanceof SubjectRequestError && error.status === 401) router.replace("/");
      setOperationError(error instanceof SubjectRequestError ? error.message : "We couldn’t confirm this change. Check your connection, then refresh your subjects before trying again.");
    } finally { requestActive.current = false; setPending(false); }
  }
  async function remove() {
    if (dialog?.kind !== "delete" || requestActive.current) return;
    const removed = dialog.subject;
    setOperationError("");
    requestActive.current = true; setPending(true);
    try {
      if (temporary) (sample ? setSamples : setOwnSubjects)(current => current.filter(item => item.id !== removed.id));
      else {
        await subjectApi(`/${removed.id}`, { method: "DELETE" });
        stored.setSubjects(current => current.filter(item => item.id !== removed.id));
      }
      afterCloseFocus.current = true;
      close(true);
      if (subjectId === removed.id) { setSampleChoice(sample); navigate(); }
      setFeedback(temporary ? `${removed.name} removed from this preview only.` : `${removed.name} deleted.`);
    } catch (error) {
      if (error instanceof SubjectRequestError && error.status === 401) router.replace("/");
      setOperationError(error instanceof SubjectRequestError ? error.message : "We couldn’t confirm deletion. Check your connection and refresh your subjects.");
    } finally { requestActive.current = false; setPending(false); }
  }
  function tabKeys(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const target = event.key === "Home" ? "materials" : event.key === "End" ? "notes" : tab === "materials" ? "notes" : "materials";
    navigate(subjectId ?? undefined, target);
    document.getElementById(`subject-tab-${target}`)?.focus();
  }
  const folders = subject && sampleContent ? exampleMaterials(subject) : [];
  const folder = folders.find(item => item.id === folderId);
  const resources = folder ? folder.resources : sampleContent ? [{ title: "Course overview", type: "PDF", description: "An example of a syllabus saved directly in a subject." }] : [];
  return <div className="subjects-section">
    {temporary && <p className="subject-preview-notice"><span />Sample preview · changes reset when you leave or reload.</p>}
    <p className="subject-live-feedback" role="status">{feedback}</p>
    {!subjectId ? <>
      <div className="desk-heading subject-page-heading"><div><p className="desk-kicker">A PLACE FOR EVERY CHAPTER</p><h1 ref={heading} tabIndex={-1}>A little room to <em>learn.</em></h1><p>Your subjects, each with a space of their own.</p></div><button ref={addButton} disabled={!temporary && (stored.loading || !!stored.error)} className="desk-primary" onClick={() => setDialog({ kind: "add" })}><Plus size={18} />Add subject</button></div>
      <div className="subject-shelf-heading"><div className="desk-view-switch subject-view-switch" role="group" aria-label="Subject shelf"><button aria-pressed={!sample} onClick={() => { setSampleChoice(false); setFeedback(""); }}>Your subjects</button><button aria-pressed={sample} onClick={() => { setSampleChoice(true); setFeedback(""); }}>Sample subjects</button></div><span>{String(subjects.length).padStart(2, "0")} {subjects.length === 1 ? "subject" : "subjects"}<span className="subject-shelf-rule" /></span></div>
      {!temporary && stored.loading ? <div className="subject-load-state" role="status">Opening your subject shelf…</div> : !temporary && stored.error ? <div className="subject-load-state" role="alert"><p>{stored.error}</p><button className="desk-outline-button" onClick={() => void stored.reload()}>Try again</button></div> : subjects.length ? <div className="subject-shelf">{subjects.map((item, index) => <article key={item.id} className={`subject-book-card subject-colour-${item.colour}`}><button className="subject-open" onClick={() => { setSampleChoice(sample); navigate(item.id); }} aria-label={`Open ${item.name}`}><span className="subject-cover-top"><StudyBook size={40} /><span>{String(index + 1).padStart(2, "0")}</span></span><h2>{item.name}</h2><p>{item.description || "A fresh page for what comes next."}</p><span className="subject-open-cue">Open subject<ArrowUpRight size={17} /></span></button><div className="subject-card-meta"><span><Clock3 size={14} />{item.goal ? `${goalLabel(item.goal)} daily intention` : "At your own pace"}</span><button className="subject-edit-button" onClick={() => setDialog({ kind: "edit", subject: item })} aria-label={`Edit ${item.name}`}><Pencil size={16} /></button></div><span className="subject-card-label">{sample ? "SAMPLE SUBJECT" : preview ? "UNSAVED PREVIEW" : "YOUR SUBJECT"}</span></article>)}<button className="subject-add-card" onClick={() => setDialog({ kind: "add" })}><span><Plus size={25} /></span><strong>There’s room for more.</strong><span>Add another subject</span></button></div> : <section className="subject-empty-shelf"><div className="subject-library-art" aria-hidden="true"><span className="subject-art-book subject-art-one"><StudyBook size={36} /></span><span className="subject-art-book subject-art-two"><StudyBook size={42} /></span><span className="subject-art-book subject-art-three"><StudyBook size={33} /></span><span className="subject-art-line" /></div><p className="desk-kicker">YOUR NEXT CHAPTER STARTS HERE</p><h2>Big ideas deserve<br /><em>a little space.</em></h2><p>Create a subject for whatever you’re learning. Your notes, chapters, and materials will have a home here.</p><button className="desk-primary" onClick={() => setDialog({ kind: "add" })}><Plus size={18} />Add your first subject</button><button className="subject-examples-link" onClick={() => setSampleChoice(true)}>Take a look at some examples<ArrowRight size={16} /></button></section>}
      <p className="subject-shelf-footnote">A subject for each thing you’re curious about. No need to organise it all at once.</p>
    </> : !subject && !temporary && stored.loading ? <div className="subject-load-state" role="status">Opening your subject…</div> : !subject && !temporary && stored.error ? <div className="subject-load-state" role="alert"><p>{stored.error}</p><button className="desk-outline-button" onClick={() => void stored.reload()}>Try again</button></div> : !subject ? <section className="desk-section-empty"><StudyBook size={48} /><h1 ref={heading} tabIndex={-1}>{temporary ? "This preview isn’t here anymore." : "This subject isn’t available."}</h1><p>{temporary ? "Temporary subjects reset when you leave or reload. You can return to your shelf and start again." : "It may have been removed, or may belong to another account. Return to your shelf to continue."}</p><button className="desk-outline-button" onClick={() => navigate()}><ArrowLeft size={17} />Back to subjects</button></section> : <>
      <div className="subject-back-row"><button className="desk-text-action" onClick={() => navigate()}><ArrowLeft size={17} />All subjects</button><span>{sample ? "Sample subject" : preview ? "Unsaved preview" : "Your subject"}</span></div>
      <section className={`subject-workspace-hero subject-colour-${subject.colour}`}><span className="subject-workspace-mark"><StudyBook size={52} /></span><div className="subject-workspace-intro"><p className="desk-kicker">YOUR OWN LITTLE CHAPTER</p><h1 ref={heading} tabIndex={-1}>{subject.name}</h1><p>{subject.description || "A fresh page for what comes next."}</p></div><button className="subject-hero-edit" aria-label={`Edit ${subject.name}`} onClick={() => setDialog({ kind: "edit", subject })}><Pencil size={17} /></button><div className="subject-workspace-bottom"><span><Clock3 size={16} />{subject.goal ? `${goalLabel(subject.goal)} daily intention` : "At your own pace"}</span><Link href={base + "/focus"} className="desk-primary">Open Focus<ArrowRight size={17} /></Link></div></section>
      <div className="subject-tabs" role="tablist" aria-label="Subject workspace">{(["materials", "notes"] as const).map(value => <button key={value} id={`subject-tab-${value}`} role="tab" type="button" aria-selected={tab === value} aria-controls="subject-tab-panel" tabIndex={tab === value ? 0 : -1} onClick={() => navigate(subject.id, value)} onKeyDown={tabKeys}>{value === "materials" ? <Folder size={17} /> : <Pencil size={17} />}{value === "materials" ? "Materials" : "Quick notes"}</button>)}</div>
      <section id="subject-tab-panel" role="tabpanel" aria-labelledby={`subject-tab-${tab}`} tabIndex={0} className="subject-tab-panel">
      {tab === "notes" ? <><div className="desk-section-heading"><div><p className="desk-kicker">A THOUGHT WORTH KEEPING</p><h2>Your quick notes</h2></div><span className="subject-status-chip">Read-only preview</span></div>{sampleContent ? <article className="subject-note-preview"><p className="desk-kicker">A NOTE TO MY FUTURE SELF</p><h3>Start with what you know.</h3><p>Revisit the main ideas from class, work through one example, and write down anything that still feels unclear.</p><p>Small steps. A little more understanding each time.</p></article> : <div className="subject-material-empty"><Pencil size={32} /><h3>A little space for your thoughts.</h3><p>Your subject notes will live here. Writing and saving notes isn’t connected yet.</p></div>}<p className="subject-section-help">Notes shown here are examples. There’s no editable content or save operation yet.</p></> : <>
        <div className="subject-material-heading"><div><p className="desk-kicker">EVERYTHING IN ITS PLACE</p><h2>Study materials</h2></div><span className="subject-status-chip">{sampleContent ? "Example materials" : "Uploads coming next"}</span></div>
        <nav className="subject-breadcrumbs" aria-label="Folder path"><button onClick={() => navigate(subject.id)} aria-current={!folderId ? "location" : undefined}>{subject.name}</button>{folderId && <><ChevronRight size={14} /><span aria-current="location">{folder?.name ?? "Unavailable folder"}</span></>}</nav>
        {folderId && !folder ? <div className="subject-material-empty"><Folder size={32} /><h3>This folder isn’t in the preview.</h3><button className="desk-text-action" onClick={() => navigate(subject.id)}>Back to materials<ArrowRight size={16} /></button></div> : !sampleContent ? <div className="subject-material-empty"><Folder size={38} /><h3>A home for everything you’re learning.</h3><p>Folders, PDFs, and class links will come together here. Material uploads and folder creation are coming next.</p><span>No files uploaded</span></div> : <>
          {!folder && <div className="subject-folder-grid">{folders.map(item => <button key={item.id} className="subject-folder" onClick={() => navigate(subject.id, "materials", item.id)}><Folder size={28} /><strong>{item.name}</strong><span>{item.description}</span><span className="subject-folder-count">{item.resources.length} example materials<ChevronRight size={16} /></span></button>)}</div>}
          <div className="subject-resource-list"><p className="desk-kicker">{folder ? "IN THIS CHAPTER" : "ON THE DESK"}</p>{resources.map(item => <button key={item.title} className="subject-resource" onClick={() => setDialog({ kind: "resource", title: item.title, description: item.description })}><span className="subject-resource-icon">{item.type === "PDF" ? <FileText size={22} /> : <Link2 size={22} />}</span><span><strong>{item.title}</strong><small>{item.type} · sample resource</small></span><ArrowUpRight size={17} /></button>)}</div><p className="subject-section-help">These are example folders and materials. No files have been uploaded or linked to your account.</p>
        </>}
      </>}
      </section>
      <div className="subject-workspace-footer"><span>{temporary ? "This space is a temporary preview." : "Subject details are saved to your account."}</span><button className="subject-delete-action" onClick={() => setDialog({ kind: "delete", subject })}><Trash2 size={15} />{temporary ? "Delete subject preview" : "Delete subject"}</button></div>
    </>}
    <dialog ref={modal} className="desk-dialog subject-dialog" aria-labelledby="subject-dialog-title" onCancel={event => { if (pending) event.preventDefault(); else { setDialog(null); setOperationError(""); } }} onClose={() => { setDialog(null); setOperationError(""); if (afterCloseFocus.current) { afterCloseFocus.current = false; requestAnimationFrame(() => (heading.current ?? addButton.current)?.focus({ preventScroll: true })); } }} onClick={event => { if (event.target !== event.currentTarget) return; const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close(); }}>
      <button className="desk-dialog-close desk-icon-button" aria-label="Close dialog" disabled={pending} onClick={() => close()}><X size={19} /></button>
      <div className="subject-dialog-body" aria-busy={pending}>
      {operationError && <p className="subject-operation-error" role="alert">{operationError}</p>}
      {dialog?.kind === "add" || dialog?.kind === "edit" ? <><p className="desk-kicker">A PLACE FOR YOUR NEXT CHAPTER</p><h2 id="subject-dialog-title">{dialog.kind === "edit" ? "A little refresh." : "Make room to learn."}</h2><SubjectForm key={dialog.kind === "edit" ? dialog.subject.id : "add"} subject={dialog.kind === "edit" ? dialog.subject : undefined} names={subjects.filter(item => dialog.kind !== "edit" || item.id !== dialog.subject.id).map(item => item.name)} onSubmit={save} onCancel={() => close()} temporary={temporary} pending={pending} /></> : dialog?.kind === "delete" ? <><p className="desk-kicker">JUST CHECKING</p><h2 id="subject-dialog-title">Remove {dialog.subject.name}?</h2><p>{temporary ? "This removes only this temporary subject preview. No saved files or account data will be deleted." : "This permanently deletes the subject and its daily goal. This can’t be undone."}</p><div className="subject-form-actions"><button className="desk-outline-button" disabled={pending} onClick={() => close()}>Keep subject</button><button className="subject-danger-button" disabled={pending} onClick={() => void remove()}>{pending ? "Deleting…" : temporary ? "Remove preview" : "Delete subject"}<Trash2 size={16} /></button></div></> : dialog?.kind === "resource" ? <><p className="desk-kicker">RESOURCE PREVIEW</p><h2 id="subject-dialog-title">{dialog.title}</h2><p>{dialog.description}</p><div className="desk-dialog-note">This is a fictional material for reviewing the layout. There’s no file or external link behind this example yet.</div><button className="desk-primary" onClick={() => close()}>Back to materials<ArrowLeft size={17} /></button></> : null}
      </div>
    </dialog>
  </div>;
}
