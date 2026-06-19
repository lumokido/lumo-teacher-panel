"use client";

import React, { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { GALLERY_TYPES } from "@/lib/api/gallery";
import { useUploadGallery } from "@/hooks/useGallery";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  theme?: "sky" | "violet";
};

export default function GalleryUploadModal({ open, onClose, theme = "sky" }: Props) {
  const uploadMut = useUploadGallery();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("SCHOOL_EVENT");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const isSky = theme === "sky";

  const themeClasses = {
    title: isSky ? "text-sky-950 font-bold" : "text-violet-950 font-bold",
    bgAccent: isSky ? "bg-sky-600 hover:bg-sky-700" : "bg-violet-600 hover:bg-violet-700",
    borderFocus: isSky ? "focus:border-sky-500 focus:ring-sky-200" : "focus:border-violet-500 focus:ring-violet-200",
    borderActive: isSky ? "border-sky-500 ring-2 ring-sky-100" : "border-violet-500 ring-2 ring-violet-100",
    borderDefault: isSky ? "border-sky-200" : "border-violet-200",
    textAccent: isSky ? "text-sky-600" : "text-violet-600",
    hoverBg: isSky ? "hover:bg-sky-50" : "hover:bg-violet-50",
  };

  if (!open) return null;

  function resetForm() {
    setTitle("");
    setDescription("");
    setType("SCHOOL_EVENT");
    setFiles([]);
    onClose();
  }

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
    setFiles((prev) => [...prev, ...validFiles]);
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

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Please select at least one image file.");
      return;
    }

    // Backend fromString expects normalized input (e.g. "school event" case-insensitive)
    const normalizedType = type.toLowerCase().replace(/_/g, " ");

    uploadMut.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        type: normalizedType,
        files,
      },
      {
        onSuccess: () => {
          resetForm();
        },
      }
    );
  }

  const busy = uploadMut.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
      role="presentation"
      onClick={() => !busy && resetForm()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-gallery-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 id="upload-gallery-title" className={cn("font-montserrat text-lg", themeClasses.title)}>
            Upload Gallery Images
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
              placeholder="Describe the event, date, or attendees..."
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

          {/* Drag & Drop Upload Zone */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-600">Select Images</span>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => !busy && fileInputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-200",
                isDragActive ? themeClasses.borderActive : themeClasses.borderDefault,
                "bg-slate-50/50 hover:bg-slate-50"
              )}
            >
              <Upload className={cn("h-8 w-8 text-slate-400 mb-2 stroke-[1.5]", themeClasses.textAccent)} />
              <p className="text-xs font-semibold text-slate-700">
                Drag & drop images here, or click to browse
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Supports JPG, PNG up to 10MB
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

          {/* Preview list */}
          {files.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-0.5">
                <span>Selected Images ({files.length})</span>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-rose-600 hover:underline"
                  disabled={busy}
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3 max-h-[160px] overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/20">
                {files.map((file, idx) => {
                  const localUrl = URL.createObjectURL(file);
                  return (
                    <div
                      key={`${file.name}-${idx}`}
                      className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={localUrl}
                        alt="File upload thumbnail"
                        className="h-full w-full object-cover"
                      />
                      {!busy && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(idx);
                          }}
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition"
                        >
                          <X className="h-3 w-3" />
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
              disabled={busy || files.length === 0}
              className={cn(
                "rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                themeClasses.bgAccent
              )}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
