"use client";

import React, { useMemo, useState } from "react";
import { useGalleryList, useDeleteGallery } from "@/hooks/useGallery";
import { GALLERY_TYPES, type GalleryItem, type GalleryType } from "@/lib/api/gallery";
import GalleryUploadModal from "./GalleryUploadModal";
import GalleryEditModal from "./GalleryEditModal";
import { Calendar, ChevronLeft, ChevronRight, Images, Plus, User, X, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  theme?: "sky" | "violet";
};

export default function GalleryGrid({ theme = "sky" }: Props) {
  const isSky = theme === "sky";

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Edit State
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const deleteMut = useDeleteGallery();
  
  // Lightbox State
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const { data: items = [], isLoading, isError, error, refetch } = useGalleryList(activeTab);

  const listErr = isError && error instanceof Error ? error.message : isError ? "Could not load gallery items." : null;

  const themeClasses = {
    textAccent: isSky ? "text-sky-600" : "text-violet-600",
    bgAccent: isSky ? "bg-sky-600 hover:bg-sky-700" : "bg-violet-600 hover:bg-violet-700",
    bgAccentLight: isSky ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-violet-50 text-violet-700 border-violet-200",
    tabActive: isSky ? "bg-sky-600 text-white shadow-xs" : "bg-violet-600 text-white shadow-xs",
    tabInactive: isSky ? "text-slate-600 hover:bg-sky-50 hover:text-sky-700" : "text-slate-600 hover:bg-violet-50 hover:text-violet-700",
    cardBorder: isSky ? "hover:border-sky-300" : "hover:border-violet-300",
    spinnerBorder: isSky ? "border-sky-200 border-t-sky-600" : "border-violet-200 border-t-violet-600",
    badgeBg: isSky ? "bg-sky-50 text-sky-700 border-sky-100" : "bg-violet-50 text-violet-700 border-violet-100",
  };

  // Normalizes category labels
  function getCategoryLabel(type: GalleryType): string {
    const matched = GALLERY_TYPES.find((t) => t.value === type);
    return matched ? matched.label : type;
  }

  function handleDelete(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this gallery event?")) {
      deleteMut.mutate(id);
    }
  }

  function handleEditClick(e: React.MouseEvent, item: GalleryItem) {
    e.stopPropagation();
    setEditItemId(item.id);
    setEditModalOpen(true);
  }

  // Opens lightbox viewer
  function openLightbox(item: GalleryItem) {
    setSelectedItem(item);
    setActiveImageIndex(0);
  }

  function closeLightbox() {
    setSelectedItem(null);
  }

  // Helper for images array (combines imageUrl and imageUrls)
  const currentImages = useMemo(() => {
    if (!selectedItem) return [];
    const urls = selectedItem.imageUrls || [];
    if (urls.length > 0) return urls;
    return selectedItem.imageUrl ? [selectedItem.imageUrl] : [];
  }, [selectedItem]);

  function handlePrevImage() {
    if (currentImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? currentImages.length - 1 : prev - 1));
  }

  function handleNextImage() {
    if (currentImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={cn("mb-2 text-sm font-semibold tracking-wide uppercase", themeClasses.textAccent)}>
            School Gallery
          </p>
          <h2 className="font-montserrat text-3xl font-bold text-slate-900 leading-tight">
            Event & Activities Gallery
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600 leading-relaxed">
            Browse achievements, celebrations, timetables, and campus event media.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className={cn(
            "rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition active:scale-[0.98] inline-flex items-center gap-2",
            themeClasses.bgAccent
          )}
        >
          <Plus className="h-4.5 w-4.5" />
          Upload Event
        </button>
      </div>

      {/* Categories Tabs Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2.5 border-b border-slate-100">
        <button
          onClick={() => setActiveTab("ALL")}
          className={cn(
            "whitespace-nowrap px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200",
            activeTab === "ALL" ? themeClasses.tabActive : "border-slate-200 text-slate-600 hover:bg-slate-50"
          )}
        >
          All Categories
        </button>
        {GALLERY_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={cn(
              "whitespace-nowrap px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200",
              activeTab === t.value ? themeClasses.tabActive : "border-slate-200 " + themeClasses.tabInactive
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {listErr ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {listErr}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void refetch()}
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* Loading State */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500">
          <div className={cn("mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2", themeClasses.spinnerBorder)} />
          Loading gallery items…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/40 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Images className="h-8 w-8 stroke-[1.5]" />
          </div>
          <p className="text-lg font-bold text-slate-800">No media yet</p>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Be the first to upload photos for events, exams, or cultural activities.
          </p>
        </div>
      ) : (
        /* Gallery Card Grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: GalleryItem) => {
            const count = item.imageUrls?.length || (item.imageUrl ? 1 : 0);
            return (
              <div
                key={item.id}
                onClick={() => openLightbox(item)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
                  themeClasses.cardBorder
                )}
              >
                {/* Image Cover */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      No Preview
                    </div>
                  )}

                  {/* Action Buttons overlay */}
                  <div 
                    className="absolute right-2 top-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleEditClick(e, item)}
                      className="rounded-lg bg-slate-900/80 p-1.5 text-white hover:bg-slate-800 transition active:scale-95 shadow-xs"
                      title="Edit Event"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      className="rounded-lg bg-rose-600/90 p-1.5 text-white hover:bg-rose-700 transition active:scale-95 shadow-xs"
                      title="Delete Event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Multiple Images Count Badge */}
                  {count > 1 && (
                    <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-lg bg-slate-900/75 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-xs">
                      <Images className="h-3.5 w-3.5" />
                      {count} Photos
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("inline-block rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", themeClasses.badgeBg)}>
                      {getCategoryLabel(item.type)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-montserrat text-base font-bold text-slate-950 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Metadata Footer */}
                  <div className="border-t border-slate-100 pt-3 mt-1.5 flex items-center justify-between text-[10px] font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {item.uploadedBy?.split("@")[0] || "Staff"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }) : "Recent"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <GalleryUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        theme={theme}
      />

      {/* Lightbox / Carousel Modal Popup */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/95 p-4 backdrop-blur-md text-white"
          role="presentation"
          onClick={closeLightbox}
        >
          {/* Top Bar */}
          <div className="flex w-full max-w-6xl items-center justify-between border-b border-white/10 pb-3" onClick={e => e.stopPropagation()}>
            <div>
              <span className={cn("inline-block rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", isSky ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" : "bg-violet-500/20 text-violet-300 border border-violet-500/30")}>
                {getCategoryLabel(selectedItem.type)}
              </span>
              <h3 className="font-montserrat text-lg font-bold mt-1 text-slate-100 leading-tight">
                {selectedItem.title}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const id = selectedItem.id;
                  closeLightbox();
                  setEditItemId(id);
                  setEditModalOpen(true);
                }}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/20 transition active:scale-95 flex items-center gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit Event
              </button>
              <button
                onClick={closeLightbox}
                className="rounded-full p-2 hover:bg-white/10 transition text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Image Display & Controls */}
          <div className="relative flex w-full flex-1 items-center justify-center py-6" onClick={e => e.stopPropagation()}>
            {currentImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 z-10 rounded-full bg-slate-900/60 p-2.5 hover:bg-white/20 transition active:scale-95 text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {currentImages[activeImageIndex] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentImages[activeImageIndex]}
                alt={`${selectedItem.title} - Full size view`}
                className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-2xl transition-all duration-300"
              />
            )}

            {currentImages.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 z-10 rounded-full bg-slate-900/60 p-2.5 hover:bg-white/20 transition active:scale-95 text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Bottom Bar & Carousel Thumbnails */}
          <div className="flex w-full max-w-4xl flex-col items-center gap-4 pb-4" onClick={e => e.stopPropagation()}>
            <p className="text-center text-xs text-slate-300 max-w-xl leading-relaxed px-4">
              {selectedItem.description}
            </p>

            {currentImages.length > 1 && (
              <div className="flex flex-col items-center gap-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Image {activeImageIndex + 1} of {currentImages.length}
                </span>
                <div className="flex gap-2 overflow-x-auto max-w-md p-1.5 rounded-xl border border-white/5 bg-white/5 scrollbar-thin">
                  {currentImages.map((imgUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={cn(
                        "relative h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 transition",
                        activeImageIndex === index ? (isSky ? "border-sky-500 scale-105" : "border-violet-500 scale-105") : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <GalleryEditModal
        itemId={editItemId}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditItemId(null);
        }}
        theme={theme}
      />
    </div>
  );
}
