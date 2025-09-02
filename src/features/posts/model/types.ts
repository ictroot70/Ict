export type Step = "upload" | "crop" | "filter" | "publish";

export interface UploadedFile {
  file: File;
  preview: string;
  crop?: { x: number; y: number };
  zoom?: number;
  aspect?: number;
  filter?: string;
}

export interface Post {
  id: string;
  photos: string[];
  description: string;
  createdAt: string;
  filter?: string; // 🔹 добавляем фильтр
}

export interface Draft {
  id: string
  files: { preview: string }[]
  description: string
  filter: string
  createdAt: string
}