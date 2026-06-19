import { api } from "@/lib/api/httpClient";

export type GalleryType =
  | "SCHOOL_EVENT"
  | "EXAMS"
  | "SPORTS"
  | "CULTURAL"
  | "TECHNICAL"
  | "ACHIEVEMENTS"
  | "OTHER";

export type GalleryItem = {
  id: number;
  title: string;
  description: string;
  type: GalleryType;
  imageUrl: string;
  imageUrls?: string[];
  uploadedBy: string;
  createdAt: string;
};

export const GALLERY_TYPES: { value: GalleryType; label: string }[] = [
  { value: "SCHOOL_EVENT", label: "School Event" },
  { value: "EXAMS", label: "Exams" },
  { value: "SPORTS", label: "Sports" },
  { value: "CULTURAL", label: "Cultural" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "ACHIEVEMENTS", label: "Achievements" },
  { value: "OTHER", label: "Other" },
];

export async function uploadGalleryImages(
  title: string,
  description: string,
  type: string,
  files: File[],
): Promise<{ success: boolean; message: string; imageUrl: string; imageUrls?: string[] }> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("type", type);
  for (const file of files) {
    formData.append("file", file);
    formData.append("files", file); // Fallback for list of files
  }

  const res = await api.post("/api/gallery/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function getGalleryItems(typeFilter?: string): Promise<GalleryItem[]> {
  const params: Record<string, string> = {};
  if (typeFilter && typeFilter !== "ALL") {
    const normalizedType = typeFilter.toLowerCase().replace(/_/g, " ");
    params.type = normalizedType;
  }

  const res = await api.get("/api/gallery", { params });
  return res.data;
}

export async function getGalleryItem(id: number): Promise<GalleryItem> {
  const res = await api.get(`/api/gallery/${id}`);
  return res.data;
}

export async function updateGalleryItem(
  id: number,
  title: string,
  description: string,
  type: string,
  newFiles: File[],
  removedUrls: string[],
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("type", type);
  
  if (removedUrls.length > 0) {
    // Some backends prefer comma separated, others multiple keys. We will send comma separated to be safe.
    formData.append("removedUrls", removedUrls.join(","));
    // Also append as multiple keys just in case
    for (const url of removedUrls) {
      formData.append("removedUrls[]", url);
    }
  }

  for (const file of newFiles) {
    formData.append("file", file);
    formData.append("files", file); // Fallback for list of files
    formData.append("newFiles", file); // Fallback for list of files
  }

  const res = await api.put(`/api/gallery/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function deleteGalleryItem(id: number): Promise<{ success: boolean; message: string }> {
  const res = await api.delete(`/api/gallery/${id}`);
  return res.data;
}
