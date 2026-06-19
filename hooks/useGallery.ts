import { getGalleryItems, uploadGalleryImages, getGalleryItem, updateGalleryItem, deleteGalleryItem } from "@/lib/api/gallery";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export const galleryListKey = ["gallery"] as const;

function messageFromAxios(err: unknown): string {
  if (!isAxiosError(err)) return "Request failed";
  const d = err.response?.data;
  if (d && typeof d === "object") {
    const o = d as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
    if (typeof o.error === "string") return o.error;
  }
  return err.message || "Request failed";
}

export function useGalleryList(typeFilter?: string) {
  return useQuery({
    queryKey: [...galleryListKey, typeFilter],
    queryFn: () => getGalleryItems(typeFilter),
  });
}

export function useGalleryItem(id?: number) {
  return useQuery({
    queryKey: [...galleryListKey, "item", id],
    queryFn: () => getGalleryItem(id!),
    enabled: id != null,
  });
}

export function useUploadGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      description,
      type,
      files,
    }: {
      title: string;
      description: string;
      type: string;
      files: File[];
    }) => uploadGalleryImages(title, description, type, files),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: galleryListKey });
      toast.success("Gallery item uploaded successfully!");
    },
    onError: (e) => {
      toast.error(messageFromAxios(e));
    },
  });
}

export function useUpdateGallery(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      description,
      type,
      newFiles,
      removedUrls,
    }: {
      title: string;
      description: string;
      type: string;
      newFiles: File[];
      removedUrls: string[];
    }) => updateGalleryItem(id!, title, description, type, newFiles, removedUrls),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: galleryListKey });
      if (id != null) {
        void qc.invalidateQueries({ queryKey: [...galleryListKey, "item", id] });
      }
      toast.success("Gallery item updated successfully!");
    },
    onError: (e) => {
      toast.error(messageFromAxios(e));
    },
  });
}

export function useDeleteGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteGalleryItem(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: galleryListKey });
      toast.success("Gallery item deleted successfully!");
    },
    onError: (e) => {
      toast.error(messageFromAxios(e));
    },
  });
}
