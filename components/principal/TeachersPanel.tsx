"use client";

import { useTeachersList, useDeleteTeacher } from "@/hooks/useAdminTeachers";
import type { TeacherRow } from "@/lib/api/adminTeachers";
import { useMemo, useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  Phone, 
  UserCheck, 
  BookOpen, 
  Trash2, 
  UserX, 
  Loader2, 
  Plus,
  AlertTriangle
} from "lucide-react";

export default function TeachersPanel() {
  const { data: teachers = [], isLoading, isError, error, refetch } = useTeachersList();
  const deleteMut = useDeleteTeacher();

  // State to track which teacher is being deleted
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>("");

  const listErr = useMemo(() => {
    if (!isError) return null;
    return error instanceof Error ? error.message : "Could not load teachers";
  }, [isError, error]);

  function triggerDelete(id: number, name: string) {
    setConfirmDeleteId(id);
    setConfirmDeleteName(name);
  }

  function cancelDelete() {
    setConfirmDeleteId(null);
    setConfirmDeleteName("");
  }

  function confirmDelete() {
    if (confirmDeleteId != null) {
      deleteMut.mutate(confirmDeleteId, {
        onSuccess: () => cancelDelete()
      });
    }
  }

  // Get teacher's name initials for placeholder avatar
  function getInitials(name: string) {
    if (!name) return "ST";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  // Safe parsing helper for classes/subjects which can be arrays or strings
  function parseToList(value?: string | string[]): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-violet-600">Teachers</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            Staff Directory
          </h2>
          <p className="mt-2 max-w-xl text-slate-600">
            Add teachers, manage details, and keep class assignments up to date.
          </p>
        </div>
        <Link
          href="/principal/teachers/add"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-violet-700 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Teacher
        </Link>
      </div>

      {/* Error */}
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

      {/* Loading & Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-violet-600" />
          Loading teachers list…
        </div>
      ) : teachers.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/20 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
            <UserX className="h-8 w-8 text-violet-600" />
          </div>
          <p className="text-lg font-semibold text-slate-800">No teachers in directory</p>
          <p className="mt-1 text-sm text-slate-500">
            There are no teacher accounts registered. Click &quot;Add Teacher&quot; to register one.
          </p>
        </div>
      ) : (
        /* Staff Cards Grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t: TeacherRow, i: number) => {
            const classesArray = parseToList(t.classes);
            const subjectsArray = parseToList(t.subjects);
            const initials = getInitials(t.name || "");

            return (
              <div
                key={t.emailId ?? `teacher-${i}`}
                className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm flex flex-col hover:shadow-md hover:border-violet-300 transition-all duration-200 relative overflow-hidden"
              >
                {/* Profile Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-extrabold text-sm shadow-sm">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-base leading-tight">
                        {t.name || "—"}
                      </h3>
                      <span className="text-[10px] mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider bg-violet-50 text-violet-700">
                        {t.classTeacher ? `Class Teacher: ${t.classTeacher}` : "No Homeroom"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-2 text-xs text-slate-500 py-3 border-y border-slate-50 my-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{t.emailId || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{t.mobileNumber || "—"}</span>
                  </div>
                </div>

                {/* Assignments section */}
                <div className="flex-1 py-3 space-y-3">
                  {/* Classes */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Assigned Classes</span>
                    {classesArray.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {classesArray.map((cls, idx) => (
                          <span key={idx} className="rounded bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                            {cls}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No assigned classes</span>
                    )}
                  </div>

                  {/* Subjects */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Subjects</span>
                    {subjectsArray.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {subjectsArray.map((sub, idx) => (
                          <span key={idx} className="rounded bg-violet-50 border border-violet-100/50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600">
                            {sub}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No subjects scheduled</span>
                    )}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
                  <Link
                    href={`/principal/teachers/${encodeURIComponent(t.emailId ?? "")}`}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition"
                  >
                    View Profile & Edit
                  </Link>
                  {t.id != null ? (
                    <button
                      type="button"
                      onClick={() => triggerDelete(t.id!, t.name || "")}
                      disabled={deleteMut.isPending}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {confirmDeleteId != null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={cancelDelete}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            className="w-full max-w-md rounded-2xl border border-violet-100 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 text-rose-600">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3
                id="confirm-delete-title"
                className="font-montserrat text-lg font-bold"
              >
                Delete Teacher Profile
              </h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-800">{confirmDeleteName}</span> from the school directory? This action will permanently revoke their access and cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleteMut.isPending}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteMut.isPending}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60 transition active:scale-[0.98]"
              >
                {deleteMut.isPending ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
