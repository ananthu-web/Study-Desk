export type StudyFolder = { id: string; name: string; parentId: string | null; deleting: boolean };
export type StudyResource = { id: string; title: string; folderId: string | null; type: "pdf" | "link"; url?: string; size: number; status: "uploading" | "ready" | "deleting" };
export type StudyNote = { body: string; version: number; updatedAt: string | null };
export type WorkspaceData = { folders: StudyFolder[]; resources: StudyResource[]; usedBytes: number; maxBytes: number };
