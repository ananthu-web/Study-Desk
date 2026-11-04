"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Subject } from "./subject-data";
export class SubjectRequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export async function subjectApi<T>(path = "", init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/subjects${path}`, { ...init, cache: "no-store", headers: { "Content-Type": "application/json", ...init?.headers } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new SubjectRequestError(data?.message ?? "We couldn’t complete this change. Please try again.", response.status);
  if (!data) throw new Error("We couldn’t read the server response. Please refresh your subjects.");
  return data as T;
}
export function useStoredSubjects(enabled: boolean) {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const reload = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try {
      const data = await subjectApi<{ subjects: Subject[] }>("", { signal });
      if (!signal?.aborted) setSubjects(data.subjects);
    } catch (error) {
      if (signal?.aborted) return;
      if (error instanceof SubjectRequestError && error.status === 401) router.replace("/");
      setError(error instanceof SubjectRequestError ? error.message : "We couldn’t load your subjects. Check your connection and try again.");
    } finally { if (!signal?.aborted) setLoading(false); }
  }, [router]);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void reload(controller.signal);
    return () => controller.abort();
  }, [enabled, reload]);
  return { subjects, setSubjects, loading, error, reload };
}
