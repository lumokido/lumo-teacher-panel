"use client";

import React, { useRef, useState } from "react";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { uploadStudentPhoto } from "@/lib/api/students";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type StudentPhotoUploaderProps = {
  value: string;
  onChange: (url: string) => void;
  studentId?: string; // If provided, upload using this, else use "temp"
  theme?: "sky" | "violet";
};

export function StudentPhotoUploader({
  value,
  onChange,
  studentId,
  theme = "sky",
}: StudentPhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSky = theme === "sky";

  const themeClasses = {
    text: isSky ? "text-sky-600" : "text-violet-600",
    textHover: isSky ? "group-hover:text-sky-700" : "group-hover:text-violet-700",
    border: isSky ? "border-sky-200" : "border-violet-200",
    borderActive: isSky ? "border-sky-500 ring-2 ring-sky-100" : "border-violet-500 ring-2 ring-violet-100",
    buttonBg: isSky ? "bg-sky-600 hover:bg-sky-700" : "bg-violet-600 hover:bg-violet-700",
  };

  async function handleUpload(file: File) {
    const idToUse = studentId || "temp";

    try {
      setUploading(true);
      const res = await uploadStudentPhoto(idToUse, file);
      if (res.success && res.profilePhotoUrl) {
        onChange(res.profilePhotoUrl);
        toast.success(res.message || "Profile photo uploaded successfully!");
      } else {
        toast.error(res.message || "Failed to upload profile photo.");
      }
    } catch (err: any) {
      console.error("Error uploading photo:", err);
      const errMsg = err.response?.data?.message || err.message || "An error occurred during file upload.";
      toast.error(errMsg);
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    void handleUpload(selectedFile);
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

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (!droppedFile.type.startsWith("image/")) {
      toast.error("Please drop an image file.");
      return;
    }

    if (droppedFile.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    void handleUpload(droppedFile);
  }

  function handleRemove() {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Upload Zone & Preview Circle */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          "group relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-all duration-200",
          isDragActive ? themeClasses.borderActive : themeClasses.border,
          !value && "bg-slate-50 hover:bg-slate-100/60"
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Student Profile Preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <Camera className={cn("h-8 w-8 stroke-[1.5] transition-colors duration-200", themeClasses.textHover)} />
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider">Add Photo</span>
          </div>
        )}

        {/* Hover Overlay */}
        {value && !uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-white">
            <Upload className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
          </div>
        )}

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-semibold shadow-xs transition active:scale-[0.98] cursor-pointer disabled:opacity-60",
              themeClasses.buttonBg,
              "text-white"
            )}
          >
            Select Photo
          </button>
          {value && (
            <button
              type="button"
              disabled={uploading}
              onClick={handleRemove}
              className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition active:scale-[0.98]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
        <p className="text-[10px] text-slate-400">Supports JPG, PNG up to 5MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
}
