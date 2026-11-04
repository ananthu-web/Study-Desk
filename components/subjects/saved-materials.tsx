"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, Download, FileText, Folder, FolderPlus, Link2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { subjectApi, SubjectRequestError } from "./use-stored-subjects";
import { PdfReader, downloadPdf } from "./pdf-reader";
import type { StudyFolder, StudyResource, WorkspaceData } from "./workspace-types";

type Dialog = { kind: "folder"; folder?: StudyFolder } | { kind: "link"; resource?: StudyResource } | { kind: "resource"; resource: StudyResource } | { kind: "deleteFolder"; folder: StudyFolder } | { kind: "deleteResource"; resource: StudyResource } | null;
export function SavedMaterials({ subjectId, subjectName, folderId, onFolder }: { subjectId: string; subjectName: string; folderId: string | null; onFolder: (id?: string) => void }) {
  const [data, setData] = useState<WorkspaceData | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [dialog, setDialog] = useState<Dialog>(null), [formError, setFormError] = useState(""), [title, setTitle] = useState(""), [url, setUrl] = useState(""), [destination, setDestination] = useState("");
  const [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false), [progress, setProgress] = useState(0), [uploadName, setUploadName] = useState(""), [viewer, setViewer] = useState<StudyResource | null>(null), [feedback, setFeedback] = useState("");
  const alive = useRef(true);
  const modal = useRef<HTMLDialogElement>(null), chooser = useRef<HTMLInputElement>(null), xhr = useRef<XMLHttpRequest | null>(null), uploadId = useRef<string | null>(null), active = useRef(false);
  const reload = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try { const next = await subjectApi<WorkspaceData>(`/${subjectId}/workspace${folderId ? `?folder=${folderId}` : ""}`, { signal }); if (!signal?.aborted) setData(next); }
    catch (error) { if (!signal?.aborted) setError(error instanceof Error ? error.message : "Your materials couldn’t load. Please try again."); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [subjectId, folderId]);
  useEffect(() => { const abort = new AbortController(); void reload(abort.signal); return () => abort.abort(); }, [reload]);
  useEffect(() => { alive.current = true; return () => { alive.current = false; xhr.current?.abort(); const pending = uploadId.current; if (pending) void subjectApi(`/${subjectId}/resources/${pending}`, { method: "DELETE" }).catch(() => undefined); }; }, [subjectId]);
  useEffect(() => { if (dialog && modal.current && !modal.current.open) modal.current.showModal(); if (!dialog && modal.current?.open) modal.current.close(); }, [dialog]);
  function open(next: Exclude<Dialog, null>) {
    setFormError(""); setDialog(next);
    setTitle(next.kind === "folder" ? next.folder?.name ?? "" : "resource" in next ? next.resource?.title ?? "" : "");
    setUrl("resource" in next ? next.resource?.url ?? "" : "");
    setDestination(next.kind === "folder" ? next.folder ? next.folder.parentId ?? "" : folderId ?? "" : "resource" in next && next.resource ? next.resource.folderId ?? "" : folderId ?? "");
  }
  function close() { if (active.current) return; modal.current?.close(); setDialog(null); setFormError(""); }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!dialog || active.current) return;
    active.current = true; setBusy(true); setFormError("");
    try {
      const selected = dialog;
      if (selected.kind === "folder") await subjectApi(`/${subjectId}/folders${selected.folder ? `/${selected.folder.id}` : ""}`, { method: selected.folder ? "PATCH" : "POST", body: JSON.stringify({ name: title, parentId: destination || null }) });
      else if (selected.kind === "link" || selected.kind === "resource") await subjectApi(`/${subjectId}/resources${selected.resource ? `/${selected.resource.id}` : ""}`, { method: selected.resource ? "PATCH" : "POST", body: JSON.stringify({ title, folderId: destination || null, ...((selected.kind === "link" || selected.resource.type === "link") ? { url } : {}), ...(!selected.resource ? { type: "link" } : {}) }) });
      else if (selected.kind === "deleteFolder") await subjectApi(`/${subjectId}/folders/${selected.folder.id}`, { method: "DELETE" });
      else await subjectApi(`/${subjectId}/resources/${selected.resource.id}`, { method: "DELETE" });
      modal.current?.close(); setDialog(null); setFeedback(selected.kind.startsWith("delete") ? "Deleted. Your materials are up to date." : "Saved to your subject.");
      if (selected.kind === "deleteFolder" && selected.folder.id === folderId) onFolder(selected.folder.parentId ?? undefined); else await reload();
    } catch (error) { setFormError(error instanceof Error ? error.message : "This change couldn’t finish. Please try again."); }
    finally { active.current = false; setBusy(false); }
  }
  async function upload(file: File) {
    if (uploading) return;
    setActionError(""); setFeedback("");
    if (file.size > 20 * 1024 * 1024 || file.size < 8 || !(await file.slice(0, 8).text()).startsWith("%PDF-")) { setActionError("Choose a PDF document up to 20 MB."); return; }
    setUploading(true); setProgress(0); setUploadName(file.name);
    try {
      const ticket = await subjectApi<{ resource: StudyResource; uploadUrl: string }>(`/${subjectId}/resources`, { method: "POST", body: JSON.stringify({ title: file.name.replace(/\.pdf$/i, "").slice(0, 120) || "Document", folderId, type: "pdf", size: file.size }) });
      uploadId.current = ticket.resource.id;
      if (!alive.current) { await subjectApi(`/${subjectId}/resources/${ticket.resource.id}`, { method: "DELETE" }); uploadId.current = null; return; }
      await new Promise<void>((resolve, reject) => {
        const request = new XMLHttpRequest(); xhr.current = request;
        request.open("PUT", ticket.uploadUrl); request.setRequestHeader("Content-Type", "application/pdf");
        request.upload.onprogress = event => { if (event.lengthComputable) setProgress(Math.round(event.loaded / event.total * 100)); };
        request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error("The file upload was refused. Please try again."));
        request.onerror = () => reject(new Error("Upload connection lost. Check your connection and try again."));
        request.onabort = () => reject(new Error("Upload cancelled."));
        request.timeout = 180000; request.ontimeout = () => reject(new Error("Upload timed out. Please try again.")); request.send(file);
      });
      await subjectApi(`/${subjectId}/resources/${ticket.resource.id}/complete`, { method: "POST" });
      uploadId.current = null; setFeedback(`${file.name} uploaded and ready to read.`);
    } catch (error) {
      const pending = uploadId.current;
      if (pending) { try { await subjectApi(`/${subjectId}/resources/${pending}`, { method: "DELETE" }); uploadId.current = null; } catch { /* Keep the unfinished row available for cleanup retry. */ } }
      setActionError(error instanceof Error ? error.message : "The upload didn’t finish. You can remove an unfinished item below.");
    } finally { xhr.current = null; setUploading(false); await reload(); }
  }
  async function finish(resource: StudyResource) {
    if (active.current) return; active.current = true; setBusy(true); setActionError("");
    try { await subjectApi(`/${subjectId}/resources/${resource.id}/complete`, { method: "POST" }); setFeedback("Upload checked and ready to read."); await reload(); }
    catch (error) { setActionError(error instanceof Error ? error.message : "The upload couldn’t be completed. Remove it and upload again."); }
    finally { active.current = false; setBusy(false); }
  }
  const all = data?.folders ?? [], current = all.find(folder => folder.id === folderId), children = all.filter(folder => folder.parentId === folderId);
  const breadcrumbs: StudyFolder[] = []; let cursor = current; for (let i = 0; cursor && i < 5; i++) { breadcrumbs.unshift(cursor); cursor = all.find(folder => folder.id === cursor?.parentId); }
  const deleting = dialog?.kind === "deleteFolder" || dialog?.kind === "deleteResource";
  const invalidDestination = new Set<string>(); if (dialog?.kind === "folder" && dialog.folder) { invalidDestination.add(dialog.folder.id); for (let i = 0; i < 5; i++) for (const folder of all) if (folder.parentId && invalidDestination.has(folder.parentId)) invalidDestination.add(folder.id); }
  return <div className="saved-materials"><div className="subject-material-heading"><div><p className="desk-kicker">EVERYTHING IN ITS PLACE</p><h2>Study materials</h2></div>{data && <span className="subject-status-chip">{(data.usedBytes / 1024 / 1024).toFixed(1)} / 100 MB</span>}</div>
    <nav className="subject-breadcrumbs" aria-label="Folder path"><button disabled={uploading} onClick={() => onFolder()}>{subjectName}</button>{breadcrumbs.map(folder => <span className="workspace-crumb" key={folder.id}><ChevronRight size={14} /><button disabled={uploading} onClick={() => onFolder(folder.id)} aria-current={folder.id === folderId ? "location" : undefined}>{folder.name}</button></span>)}</nav>
    <div className="workspace-toolbar"><button className="desk-outline-button" disabled={loading || uploading || busy || current?.deleting} onClick={() => open({ kind: "folder" })}><FolderPlus size={17} />New folder</button><button className="desk-outline-button" disabled={loading || uploading || busy || current?.deleting} onClick={() => chooser.current?.click()}><Upload size={17} />Upload PDF</button><button className="desk-outline-button" disabled={loading || uploading || busy || current?.deleting} onClick={() => open({ kind: "link" })}><Link2 size={17} />Add link</button><input ref={chooser} type="file" accept="application/pdf,.pdf" className="sr-only" tabIndex={-1} aria-label="Choose PDF" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload(file); }} />{current && <button className="desk-text-action" disabled={uploading || busy} onClick={() => open({ kind: current.deleting ? "deleteFolder" : "folder", folder: current })}>{current.deleting ? "Retry folder deletion" : "Edit this folder"}</button>}</div>
    {feedback && <p className="subject-live-feedback" role="status">{feedback}</p>}
    {uploading && <div className="workspace-upload" role="status"><strong>{uploadName}</strong><span>{progress === 100 ? "Checking your PDF…" : `Uploading · ${progress}%`}</span><progress max={100} value={progress} /><button className="desk-text-action" disabled={!xhr.current} onClick={() => xhr.current?.abort()}>Cancel upload</button></div>}
    {(error || actionError) && <div className="workspace-error" role="alert"><p>{error || actionError}</p><button className="desk-outline-button" onClick={() => { setActionError(""); void reload(); }}>Refresh materials</button>{folderId && <button className="desk-text-action" onClick={() => onFolder()}>Back to subject</button>}</div>}
    {loading ? <p className="subject-load-state" role="status">Opening your materials…</p> : data && <>
      {children.length > 0 && <div className="subject-folder-grid">{children.map(folder => <article className="saved-folder" key={folder.id}><button className="saved-folder-open" disabled={uploading || folder.deleting} onClick={() => onFolder(folder.id)}><Folder size={29} /><strong>{folder.name}</strong><span>{folder.deleting ? "Cleanup pending" : "Open folder"}<ChevronRight size={16} /></span></button><div className="saved-row-actions"><button className="subject-edit-button" disabled={uploading || folder.deleting} onClick={() => open({ kind: "folder", folder })} aria-label={`Edit folder ${folder.name}`}><Pencil size={16} /></button><button className="subject-edit-button" disabled={uploading} onClick={() => open({ kind: "deleteFolder", folder })} aria-label={`Delete folder ${folder.name}`}><Trash2 size={16} /></button></div></article>)}</div>}
      {!children.length && !data.resources.length && !error && !actionError && <div className="subject-material-empty"><Folder size={36} /><h3>Room for your next chapter.</h3><p>Add a folder, upload your PDFs, or keep a class link here.</p><span>PDFs up to 20 MB · private to your account</span></div>}
      <div className="subject-resource-list">{data.resources.map(resource => <article key={resource.id} className="saved-resource"><div className="saved-resource-main">{resource.type === "link" && resource.status === "ready" ? <a href={resource.url} target="_blank" rel="noopener noreferrer" className="saved-resource-open"><Link2 size={24} /><span><strong>{resource.title}</strong><small>Website link · opens in a new tab</small></span></a> : <button className="saved-resource-open" disabled={resource.status !== "ready" || uploading} onClick={() => setViewer(resource)}><FileText size={24} /><span><strong>{resource.title}</strong><small>{resource.status === "ready" ? `PDF · ${(resource.size / 1024 / 1024).toFixed(1)} MB` : resource.status === "uploading" ? "Unfinished upload" : "Cleanup pending — retry delete"}</small></span></button>}</div><div className="saved-row-actions">{resource.status === "uploading" && <button className="desk-text-action" disabled={busy || uploading} onClick={() => void finish(resource)}>Check upload</button>}{resource.type === "pdf" && resource.status === "ready" && <button className="subject-edit-button" aria-label={`Download ${resource.title}`} onClick={() => void downloadPdf(subjectId, resource.id).catch(() => setActionError("The download couldn’t start. Please try again."))}><Download size={16} /></button>}<button className="subject-edit-button" disabled={resource.status !== "ready" || uploading} aria-label={`Edit material ${resource.title}`} onClick={() => open({ kind: "resource", resource })}><Pencil size={16} /></button><button className="subject-edit-button" disabled={uploading} aria-label={`Delete material ${resource.title}`} onClick={() => open({ kind: "deleteResource", resource })}><Trash2 size={16} /></button></div></article>)}</div>
    </>}
    <dialog ref={modal} className="desk-dialog subject-dialog" aria-labelledby="workspace-dialog-title" onCancel={event => { if (busy) event.preventDefault(); else setDialog(null); }} onClose={() => setDialog(null)}><button className="desk-icon-button desk-dialog-close" disabled={busy} aria-label="Close material dialog" onClick={close}><X size={19} /></button><div className="subject-dialog-body"><p className="desk-kicker">EVERYTHING IN ITS PLACE</p><h2 id="workspace-dialog-title">{deleting ? "Ready to let this go?" : dialog?.kind === "folder" ? dialog.folder ? "A little reorganisation." : "Room for a new chapter." : dialog?.kind === "resource" ? "Keep it organised." : "Keep a useful link."}</h2>{formError && <p role="alert" className="workspace-error">{formError}</p>}<form className="workspace-form" onSubmit={event => void submit(event)}><fieldset disabled={busy}>{deleting ? <p>{dialog?.kind === "deleteFolder" ? `Delete “${dialog.folder.name}” and every subfolder and material inside it?` : dialog?.kind === "deleteResource" ? `Permanently delete “${dialog.resource.title}”?` : ""} This can’t be undone. If file cleanup fails, you can retry deletion safely.</p> : <><label htmlFor="workspace-item-title">{dialog?.kind === "folder" ? "Folder name" : "Title"}</label><input id="workspace-item-title" value={title} onChange={event => setTitle(event.target.value)} required maxLength={dialog?.kind === "folder" ? 60 : 120} placeholder={dialog?.kind === "folder" ? "e.g. Chapter one" : "A title you’ll recognise"} />{(dialog?.kind === "link" || dialog?.kind === "resource" && dialog.resource.type === "link") && <><label htmlFor="workspace-item-url">Website address</label><input id="workspace-item-url" type="url" value={url} onChange={event => setUrl(event.target.value)} placeholder="https://…" required maxLength={2048} /></>}<label htmlFor="workspace-destination">{dialog?.kind === "folder" ? "Inside" : "Folder"}</label><select id="workspace-destination" value={destination} onChange={event => setDestination(event.target.value)}><option value="">Subject root</option>{all.filter(folder => !invalidDestination.has(folder.id) && !folder.deleting).map(folder => <option value={folder.id} key={folder.id}>{breadcrumbsFor(all, folder)}</option>)}</select></>}<div className="subject-form-actions"><button type="button" className="desk-outline-button" onClick={close}>Cancel</button><button type="submit" className={deleting ? "subject-danger-button" : "desk-primary"}>{busy ? deleting ? "Deleting…" : "Saving…" : deleting ? "Delete permanently" : "Save"}</button></div></fieldset></form></div></dialog>
    {viewer && <PdfReader subjectId={subjectId} resource={viewer} onClose={() => setViewer(null)} />}
  </div>;
}
function breadcrumbsFor(all: StudyFolder[], folder: StudyFolder) { const names = [folder.name]; let parent = folder.parentId; for (let i = 0; parent && i < 5; i++) { const entry = all.find(item => item.id === parent); if (!entry) break; names.unshift(entry.name); parent = entry.parentId; } return names.join(" / "); }
