"use client";

import { useClassesList, useCreateClass } from "@/hooks/useAdminClasses";
import type { ClassItem } from "@/lib/api/adminClasses";
import Link from "next/link";
import { useState } from "react";

export default function ClassesGrid() {
  const { data: classes = [], isLoading, isError, error, refetch } =
    useClassesList();
  const createMut = useCreateClass();

  const [showDialog, setShowDialog] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  const listErr =
    isError && error instanceof Error
      ? error.message
      : isError
        ? "Could not load classes"
        : null;

  function openDialog() {
    setNewClassName("");
    setShowDialog(true);
  }

  function closeDialog() {
    setShowDialog(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newClassName.trim()) return;
    createMut.mutate(newClassName.trim(), { onSuccess: () => closeDialog() });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-violet-600">Classes</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            Class Management
          </h2>
          <p className="mt-2 max-w-xl text-slate-600">
            Create classes and manage students in each class.
          </p>
        </div>
        <button
          type="button"
          onClick={openDialog}
          className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-[0.98]"
        >
          + Create class
        </button>
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

      {/* Loading */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          Loading classes…
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/40 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
            <svg className="h-8 w-8 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-800">No classes yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Create your first class to start managing students.
          </p>
        </div>
      ) : (
        /* Classes grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls: ClassItem) => (
            <Link
              key={cls.id}
              href={`/principal/classes/${encodeURIComponent(cls.name)}`}
              className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition-all duration-200 hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                  </svg>
                </div>
                <h3 className="font-montserrat text-lg font-semibold text-slate-900">
                  {cls.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">Manage students →</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create class dialog */}
      {showDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={closeDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-class-title"
            className="w-full max-w-md rounded-2xl border border-violet-100 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="create-class-title"
              className="font-montserrat text-lg font-semibold text-slate-900"
            >
              Create new class
            </h3>
            <form className="mt-4 space-y-4" onSubmit={onSubmit}>
              <label className="block text-xs font-medium text-slate-600">
                Class name
                <input
                  required
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Class 7"
                  disabled={createMut.isPending}
                />
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-violet-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {createMut.isPending ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
