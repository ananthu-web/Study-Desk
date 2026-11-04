"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { subjectApi, SubjectRequestError } from "./use-stored-subjects";
import type { StudyNote } from "./workspace-types";

export function SavedNotes({ subjectId }: { subjectId: string }) {
  const [note, setNote] = useState<StudyNote | null>(null);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"loading" | "idle" | "saving" | "error" | "conflict">("loading");
  const [error, setError] = useState("");
  const editor = useRef<HTMLTextAreaElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const latestBody = useRef("");
  const saving = useRef(false);
  const generation = useRef(0);
  const key = `studydesk-note-draft:${subjectId}`;
  const dirty = !!note && body !== note.body;
  const dirtyRef = useRef(dirty); dirtyRef.current = dirty;
  latestBody.current = body;
  const load = useCallback(async (discard = false) => {
    const ticket = ++generation.current;
    setStatus("loading"); setError("");
    try {
      const { note: saved } = await subjectApi<{ note: StudyNote }>(`/${subjectId}/note`);
      if (ticket !== generation.current) return;
      setNote(saved);
      let draft: { body: string; version: number } | null = null;
      try { draft = discard ? null : JSON.parse(sessionStorage.getItem(key) ?? "null"); } catch { /* Saved note is still available. */ }
      if (draft && typeof draft.body === "string" && draft.body.length <= 20000 && draft.body !== saved.body) {
        setBody(draft.body);
        if (draft.version !== saved.version) { setStatus("conflict"); setError("Your recovered draft differs from the current saved note. Copy your draft before reloading."); }
        else setStatus("idle");
      } else { setBody(saved.body); setStatus("idle"); if (discard || draft?.body === saved.body) try { sessionStorage.removeItem(key); } catch {} }
    } catch (error) { if (ticket === generation.current) { setStatus("error"); setError(error instanceof SubjectRequestError ? error.message : "Your notes couldn’t load. Please try again."); } }
  }, [subjectId, key]);
  useEffect(() => { void load(); return () => { generation.current++; }; }, [load]);
  useEffect(() => {
    if (!note || !dirty) return;
    try { sessionStorage.setItem(key, JSON.stringify({ body, version: note.version })); } catch { /* Warn before leaving even when draft storage is unavailable. */ }
  }, [body, dirty, key, note]);
  async function save() {
    if (!note || saving.current || body === note.body || status === "conflict") return;
    saving.current = true; setStatus("saving"); setError(""); const snapshot = body;
    try {
      const { note: saved } = await subjectApi<{ note: StudyNote }>(`/${subjectId}/note`, { method: "PUT", body: JSON.stringify({ body: snapshot, version: note.version }) });
      setNote(saved); setStatus("idle");
      if (latestBody.current === snapshot) try { sessionStorage.removeItem(key); } catch {}
      else try { sessionStorage.setItem(key, JSON.stringify({ body: latestBody.current, version: saved.version })); } catch {}
    } catch (error) { setStatus(error instanceof SubjectRequestError && error.status === 409 ? "conflict" : "error"); setError(error instanceof SubjectRequestError ? error.message : "We couldn’t save this note. Your draft is still here."); }
    finally { saving.current = false; }
  }
  useEffect(() => {
    if (!dirty || status !== "idle") return;
    const timer = setTimeout(() => void save(), 900);
    return () => clearTimeout(timer);
  });
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (dirtyRef.current) { event.preventDefault(); event.returnValue = ""; } };
    const leave = (event: MouseEvent) => {
      if (!dirtyRef.current || !(event.target instanceof Element) || area.current?.contains(event.target) || !event.target.closest("a,button")) return;
      if (!window.confirm("This note has unsaved changes. Leave this page? Your draft will be kept on this device where possible.")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", unload); document.addEventListener("click", leave, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", leave, true); };
  }, []);
  async function copy() {
    try { await navigator.clipboard.writeText(body); } catch { editor.current?.focus(); editor.current?.select(); setError("Your draft is selected. Use your device’s Copy action to keep it."); }
  }
  return <div ref={area} className="saved-note-area"><div className="desk-section-heading"><div><p className="desk-kicker">A THOUGHT WORTH KEEPING</p><h2>Your quick notes</h2></div><span className="subject-status-chip" role="status">{status === "saving" ? "Saving…" : status === "loading" ? "Opening…" : status === "error" ? "Not saved" : status === "conflict" ? "Review draft" : dirty ? "Unsaved changes" : <><Check size={13} />Saved</>}</span></div>
    {error && <div className="workspace-error" role="alert"><p>{error}</p><div className="workspace-actions">{status === "conflict" ? <><button className="desk-outline-button" onClick={() => void copy()}><Copy size={16} />Copy draft</button><button className="desk-outline-button" onClick={() => { if (window.confirm("Replace your draft with the saved note? Copy any text you want to keep first.")) void load(true); }}><RefreshCw size={16} />Reload saved note</button></> : <button className="desk-outline-button" onClick={() => void (dirty ? save() : load())}>Try again</button>}</div></div>}
    {status === "loading" ? <p role="status">Opening your note…</p> : note && <><label className="sr-only" htmlFor="subject-note-body">Quick note</label><textarea ref={editor} id="subject-note-body" className="saved-note-editor" value={body} maxLength={20000} onChange={event => { setBody(event.target.value); if (status === "error") setStatus("idle"); }} placeholder="An idea from class. A question to revisit. Start writing here…" aria-describedby="subject-note-help" /><div className="saved-note-footer"><span id="subject-note-help">Changes save automatically. Your notes belong to this subject.</span><span>{body.length.toLocaleString()} / 20,000</span></div></>}
  </div>;
}
