"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Minus, Plus, X } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { subjectApi } from "./use-stored-subjects";
import type { StudyResource } from "./workspace-types";
export async function downloadPdf(subjectId: string, resourceId: string) {
  const { url } = await subjectApi<{ url: string }>(`/${subjectId}/resources/${resourceId}/file?download=1`);
  const a = document.createElement("a"); a.href = url; a.rel = "noopener noreferrer"; a.download = ""; document.body.append(a); a.click(); a.remove();
}
export function PdfReader({ subjectId, resource, onClose }: { subjectId: string; resource: StudyResource; onClose: () => void }) {
  const modal = useRef<HTMLDialogElement>(null), canvas = useRef<HTMLCanvasElement>(null), surface = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null), [page, setPage] = useState(1), [zoom, setZoom] = useState(1), [width, setWidth] = useState(300), [error, setError] = useState(""), [loading, setLoading] = useState(true), [retry, setRetry] = useState(0);
  useEffect(() => { modal.current?.showModal(); const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width)); if (surface.current) observer.observe(surface.current); return () => { observer.disconnect(); modal.current?.close(); }; }, []);
  useEffect(() => {
    let cancelled = false; let document: PDFDocumentProxy | undefined; let task: ReturnType<typeof import("pdfjs-dist")["getDocument"]> | undefined;
    setLoading(true); setError(""); setDoc(null); setPage(1);
    (async () => {
      const { url } = await subjectApi<{ url: string }>(`/${subjectId}/resources/${resource.id}/file`);
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      if (cancelled) return;
      task = pdfjs.getDocument({ url, enableXfa: false, maxImageSize: 16777216, canvasMaxAreaInBytes: 33554432, cMapUrl: "/pdfjs/cmaps/", standardFontDataUrl: "/pdfjs/standard_fonts/", wasmUrl: "/pdfjs/wasm/" });
      document = await task.promise;
      if (cancelled) { await task.destroy(); return; } setDoc(document); setLoading(false);
    })().catch(() => { if (!cancelled) { setError("This PDF couldn’t open. Try again or download the original."); setLoading(false); } });
    return () => { cancelled = true; void task?.destroy().catch(() => undefined); };
  }, [subjectId, resource.id, retry]);
  useEffect(() => {
    if (!doc || !canvas.current) return;
    let stopped = false; let render: ReturnType<Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]> | undefined;
    (async () => {
      const pdfPage = await doc.getPage(page); if (stopped || !canvas.current) return;
      const scale = Math.max(180, width - 24) / pdfPage.getViewport({ scale: 1 }).width * zoom;
      const viewport = pdfPage.getViewport({ scale }); const ratio = Math.min(devicePixelRatio || 1, 2);
      const element = canvas.current; element.width = Math.floor(viewport.width * ratio); element.height = Math.floor(viewport.height * ratio); element.style.width = `${viewport.width}px`; element.style.height = `${viewport.height}px`;
      render = pdfPage.render({ canvas: element, viewport, transform: [ratio, 0, 0, ratio, 0, 0] }); await render.promise;
    })().catch(error => { if (!stopped && error?.name !== "RenderingCancelledException") setError("This page couldn’t render. Try reopening the PDF."); });
    return () => { stopped = true; render?.cancel(); };
  }, [doc, page, zoom, width]);
  return <dialog ref={modal} className="pdf-reader" aria-labelledby="pdf-reader-title" onCancel={onClose} onClose={onClose}><header><div><p className="desk-kicker">YOUR READING SPACE</p><h2 id="pdf-reader-title">{resource.title}</h2></div><button className="desk-icon-button" aria-label="Close PDF" onClick={onClose}><X size={20} /></button></header><div className="pdf-reader-controls"><button className="desk-icon-button" aria-label="Previous page" disabled={!doc || page <= 1} onClick={() => setPage(current => current - 1)}><ChevronLeft size={19} /></button><span aria-live="polite">{doc ? `${page} / ${doc.numPages}` : "Opening…"}</span><button className="desk-icon-button" aria-label="Next page" disabled={!doc || page >= doc.numPages} onClick={() => setPage(current => current + 1)}><ChevronRight size={19} /></button><span className="pdf-controls-spacer" /><button className="desk-icon-button" aria-label="Zoom out" disabled={zoom <= .75} onClick={() => setZoom(current => Math.max(.75, current - .25))}><Minus size={17} /></button><span>{Math.round(zoom * 100)}%</span><button className="desk-icon-button" aria-label="Zoom in" disabled={zoom >= 2} onClick={() => setZoom(current => Math.min(2, current + .25))}><Plus size={17} /></button><button className="desk-icon-button" aria-label="Download PDF" onClick={() => void downloadPdf(subjectId, resource.id).catch(() => setError("The download couldn’t start. Please try again."))}><Download size={18} /></button></div><div ref={surface} className="pdf-reader-surface">{loading && <p role="status">Opening your PDF…</p>}{error && <div role="alert" className="workspace-error"><p>{error}</p><button className="desk-outline-button" onClick={() => setRetry(current => current + 1)}>Try again</button></div>}<canvas ref={canvas} role="img" aria-label={`PDF page ${page}. Download the original for selectable text and accessibility tools.`} hidden={!doc} /></div></dialog>;
}
