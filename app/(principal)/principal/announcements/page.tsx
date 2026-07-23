"use client";

import { useEffect, useState } from "react";
import {
  useAnnouncements,
  useAnnouncement,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from "@/hooks/useAnnouncements";
import { format } from "date-fns";
import type { AnnouncementType, AnnouncementWriteBody } from "@/lib/api/announcements";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Pencil, Trash2 } from "lucide-react";

const emptyForm = (): AnnouncementWriteBody => ({
  title: "",
  description: "",
  type: "ANNOUNCEMENT",
  startDate: format(new Date(), "yyyy-MM-dd"),
});

export default function PrincipalAnnouncementsPage() {
  const { data: announcements = [], isLoading, isError, refetch } = useAnnouncements();
  const createMut = useCreateAnnouncement();
  const updateMut = useUpdateAnnouncement();
  const deleteMut = useDeleteAnnouncement();

  const [filterType, setFilterType] = useState<"ALL" | AnnouncementType>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [formData, setFormData] = useState<AnnouncementWriteBody>(emptyForm);

  const { data: editingAnnouncement, isLoading: editingLoading } = useAnnouncement(editingId);

  const filteredAnnouncements = announcements.filter((a) => {
    if (filterType === "ALL") return true;
    return a.type === filterType;
  });

  const isSaving = createMut.isPending || updateMut.isPending;
  const isEditMode = editingId != null;

  useEffect(() => {
    if (!editingAnnouncement) return;
    setFormData({
      title: editingAnnouncement.title,
      description: editingAnnouncement.description,
      type: editingAnnouncement.type,
      startDate: editingAnnouncement.startDate,
    });
  }, [editingAnnouncement]);

  function openCreateModal() {
    setEditingId(null);
    setFormData(emptyForm());
    setShowModal(true);
  }

  function openEditModal(id: number) {
    setEditingId(id);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
  }

  function openDelete(id: number, title: string) {
    setDeleteId(id);
    setDeleteTitle(title);
  }

  function closeDelete() {
    setDeleteId(null);
    setDeleteTitle("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    if (isEditMode && editingId != null) {
      updateMut.mutate(
        { id: editingId, body: formData },
        { onSuccess: () => closeModal() },
      );
      return;
    }

    createMut.mutate(formData, {
      onSuccess: () => closeModal(),
    });
  }

  function confirmDelete() {
    if (deleteId == null) return;
    deleteMut.mutate(deleteId, {
      onSuccess: () => closeDelete(),
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-violet-600">Events & Bulletins</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            School Announcements
          </h2>
          <p className="mt-2 text-slate-600">
            Publish school-wide announcements and track calendar events.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-[0.98]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Announcement
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex border-b border-violet-100 pb-px">
        {(["ALL", "ANNOUNCEMENT", "EVENT"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
              filterType === tab
                ? "border-violet-600 text-violet-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "ALL" ? "All Posts" : tab === "ANNOUNCEMENT" ? "Announcements" : "Events"}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Failed to load announcements.{" "}
          <button onClick={() => void refetch()} className="font-semibold underline">
            Retry
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          Loading announcements...
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/40 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
            <svg className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-800">No postings found</p>
          <p className="mt-1 text-sm text-slate-500">
            Get started by posting your first school announcement or event.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition hover:border-violet-300 hover:shadow-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      item.type === "EVENT"
                        ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                        : "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20"
                    }`}
                  >
                    {item.type === "EVENT" ? "Event" : "Bulletin"}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="mr-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {format(new Date(item.startDate), "MMM dd, yyyy")}
                    </div>
                    <button
                      type="button"
                      onClick={() => openEditModal(item.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-violet-50 hover:text-violet-700"
                      aria-label="Edit announcement"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDelete(item.id, item.title)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Delete announcement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-montserrat text-lg font-bold text-slate-900 group-hover:text-violet-950 transition-colors">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="w-full max-w-lg rounded-2xl border border-violet-100 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="modal-title" className="font-montserrat text-xl font-bold text-slate-900">
              {isEditMode ? "Edit Announcement" : "Create Event & Bulletin Post"}
            </h3>

            {isEditMode && editingLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                Loading announcement…
              </div>
            ) : (
              <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                <label className="block text-xs font-semibold text-slate-600">
                  Post Title
                  <input
                    required
                    autoFocus
                    placeholder="e.g. Science Fair 2026"
                    disabled={isSaving}
                    className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-950 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </label>

                <div className="block text-xs font-semibold text-slate-600 space-y-1.5">
                  Post Type
                  <Select
                    value={formData.type}
                    onValueChange={(val) => setFormData((prev) => ({ ...prev, type: val as AnnouncementType }))}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="w-full rounded-lg border border-violet-200 bg-white h-[38px] text-sm">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANNOUNCEMENT">Bulletin Announcement</SelectItem>
                      <SelectItem value="EVENT">Calendar Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <label className="block text-xs font-semibold text-slate-600">
                  Start/Event Date
                  <input
                    required
                    type="date"
                    disabled={isSaving}
                    className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  />
                </label>

                <label className="block text-xs font-semibold text-slate-600">
                  Description / Body
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the bulletin event details here..."
                    disabled={isSaving}
                    className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-950 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </label>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSaving}
                    className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-violet-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-xl bg-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-60 transition-all active:scale-[0.98]"
                  >
                    {isSaving
                      ? isEditMode
                        ? "Saving…"
                        : "Posting..."
                      : isEditMode
                        ? "Save Changes"
                        : "Publish Post"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation */}
      {deleteId != null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={closeDelete}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-announcement-title"
            className="w-full max-w-md rounded-2xl border border-rose-100 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-announcement-title" className="font-montserrat text-lg font-semibold text-slate-900">
              Delete announcement?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800">{deleteTitle}</span>? This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDelete}
                disabled={deleteMut.isPending}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteMut.isPending}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deleteMut.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
