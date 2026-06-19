"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Trash2, Upload, X } from "lucide-react";
import { GALLERY_TYPES } from "@/lib/api/gallery";
import { useGalleryItem, useUpdateGallery } from "@/hooks/useGallery";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Props = {
  itemId: number | null;
  open: boolean;
  onClose: () => void;
  theme?: "sky" | "violet";
};

export default function GalleryEditModal({ itemId, open, onClose, theme = "sky" }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: item, isLoading, isError, error } = useGalleryItem(itemId || undefined);
  const updateMut = useUpdateGallery(itemId || undefined);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("SCHOOL_EVENT");
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const isSky = theme === "sky";

  const themeClasses = {
    title: isSky ? "text-sky-950 font-bold" : "text-violet-950 font-bold",
    bgAccent: isSky ? "bg-sky-600 hover:bg-sky-700" : "bg-violet-600 hover:bg-violet-700",
    borderFocus: isSky ? "focus:border-sky-500 focus:ring-sky-200" : "focus:border-violet-500 focus:ring-violet-200",
    borderActive: isSky ? "border-sky-500 ring-2 ring-sky-100" : "border-violet-500 ring-2 ring-violet-100",
    borderDefault: isSky ? "border-sky-200" : "border-violet-200",
    textAccent: isSky ? "text-sky-600" : "text-violet-600",
  };

  // Initialize form fields when item loads
  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setDescription(item.description || "");
      setType(item.type || "SCHOOL_EVENT");
      setRemovedUrls([]);
      setNewFiles([]);
    }
  }, [item, open]);

  function resetForm() {
    setRemovedUrls([]);
    setNewFiles([]);
    onClose();
  }

  // Get list of existing image URLs that are not marked for deletion
  const existingImages = React.useMemo(() => {
    if (!item) return [];
    const urls = item.imageUrls || [];
    const allUrls = urls.length > 0 ? urls : item.imageUrl ? [item.imageUrl] : [];
    return allUrls.filter((url) => !removedUrls.includes(url));
  }, [item, removedUrls]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    addValidFiles(selectedFiles);
  }

  function addValidFiles(incomingFiles: File[]) {
    const validFiles: File[] = [];
    for (const file of incomingFiles) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }
      validFiles.push(file);
    }
    setNewFiles((prev) => [...prev, ...validFiles]);
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    addValidFiles(droppedFiles);
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, idx) => idx !== index));
  }

  function removeExistingImage(url: string) {
    setRemovedUrls((prev) => [...prev, url]);
  }

  function undoRemoveExistingImage(url: string) {
    setRemovedUrls((prev) => prev.filter((u) => u !== url));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Check if we will be left with zero images after update
    if (existingImages.length === 0 && newFiles.length === 0) {
      toast.error("A gallery item must have at least one image.");
      return;
    }

    const normalizedType = type.toLowerCase().replace(/_/g, " ");

    updateMut.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        type: normalizedType,
        newFiles,
        removedUrls,
      },
      {
        onSuccess: () => {
          resetForm();
        },
      }
    );
  }

  const busy = updateMut.isPending || isLoading;

  if (!open || !itemId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
      role="presentation"
      onClick={() => !busy && resetForm()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-gallery-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 id="edit-gallery-title" className={cn("font-montserrat text-lg", themeClasses.title)}>
            Edit Gallery Event
          </h3>
          {!busy && (
            <button
              onClick={resetForm}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-500">
            <Loader2 className={cn("mx-auto h-8 w-8 animate-spin text-slate-400 mb-2", themeClasses.textAccent)} />
            Fetching event details...
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-rose-800 bg-rose-50 border border-rose-200 rounded-2xl p-4">
            <p className="font-semibold">Failed to fetch gallery details.</p>
            <p className="text-xs text-rose-600 mt-1">{error instanceof Error ? error.message : "Network error"}</p>
            <button
              type="button"
              onClick={resetForm}
              className="mt-4 rounded-xl border border-rose-300 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
            >
              Close
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block text-xs font-semibold text-slate-600">
              Event Title
              <input
                required
                disabled={busy}
                placeholder="e.g. Annual Day 2026"
                className={cn(
                  "mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-hidden transition focus:ring-3 focus:outline-hidden",
                  themeClasses.borderFocus
                )}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="block text-xs font-semibold text-slate-600">
              Description
              <textarea
                required
                disabled={busy}
                placeholder="Describe the event..."
                rows={3}
                className={cn(
                  "mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-hidden transition focus:ring-3 focus:outline-hidden",
                  themeClasses.borderFocus
                )}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <div className="block text-xs font-semibold text-slate-600 space-y-1.5">
              Category / Type
              <Select value={type} onValueChange={(val) => setType(val || "SCHOOL_EVENT")} disabled={busy}>
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-white h-[44px] text-sm">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {GALLERY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Existing Images Management */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-600">Manage Existing Images</span>
              <div className="grid grid-cols-4 gap-3 max-h-[160px] overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50/20">
                {/* Images not deleted */}
                {existingImages.map((url, idx) => (
                  <div
                    key={`exist-${idx}`}
                    className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Existing gallery event preview"
                      className="h-full w-full object-cover"
                    />
                    {!busy && (
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute inset-0 flex items-center justify-center bg-slate-900/60 opacity-0 group-hover:opacity-100 transition text-white hover:bg-rose-600/80"
                        title="Remove image"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Images marked for deletion */}
                {removedUrls.map((url, idx) => (
                  <div
                    key={`del-${idx}`}
                    className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-red-200 bg-red-50/50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Deleted image placeholder"
                      className="h-full w-full object-cover opacity-30 grayscale"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/40 text-white text-[9px] font-bold">
                      <span className="mb-0.5">Removed</span>
                      {!busy && (
                        <button
                          type="button"
                          onClick={() => undoRemoveExistingImage(url)}
                          className="underline hover:text-slate-200 font-semibold"
                        >
                          Undo
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drag & Drop Upload Zone for new images */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-600">Append New Images</span>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => !busy && fileInputRef.current?.click()}
                className={cn(
                  "flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all duration-200",
                  isDragActive ? themeClasses.borderActive : themeClasses.borderDefault,
                  "bg-slate-50/50 hover:bg-slate-50"
                )}
              >
                <Upload className={cn("h-6 w-6 text-slate-400 mb-1 stroke-[1.5]", themeClasses.textAccent)} />
                <p className="text-xs font-semibold text-slate-700">
                  Click to add or drop new files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={busy}
                  className="hidden"
                />
              </div>
            </div>

            {/* Previews of newly appended files */}
            {newFiles.length > 0 && (
              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold text-slate-500 px-0.5">Appended Files ({newFiles.length})</span>
                <div className="grid grid-cols-4 gap-3 max-h-[120px] overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/20">
                  {newFiles.map((file, idx) => {
                    const localUrl = URL.createObjectURL(file);
                    return (
                      <div
                        key={`new-${file.name}-${idx}`}
                        className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={localUrl}
                          alt="New upload preview thumbnail"
                          className="h-full w-full object-cover"
                        />
                        {!busy && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNewFile(idx);
                            }}
                            className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={busy}
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className={cn(
                  "rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] flex items-center justify-center gap-2",
                  themeClasses.bgAccent
                )}
              >
                {busy && !isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
