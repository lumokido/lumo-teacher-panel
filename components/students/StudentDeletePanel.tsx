"use client";

import { useDeleteStudent, useStudentDetails } from "@/hooks/useStudents";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

export default function StudentDeletePanel({ studentId }: { studentId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const isPrincipal = pathname?.includes("/principal");
  const backHref = isPrincipal ? `/principal/students/${studentId}` : `/students/${studentId}`;
  const listHref = isPrincipal ? "/principal/classes" : "/students";

  const { data: student, isLoading, isError, error, refetch } = useStudentDetails(studentId);
  const deleteMut = useDeleteStudent();
  const [confirmText, setConfirmText] = useState("");

  const listErr =
    isError && error instanceof Error
      ? error.message
      : isError
        ? "Could not load student details"
        : null;

  const fullName = student
    ? [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ")
    : "";

  const canDelete = confirmText.trim().toUpperCase() === "DELETE";

  function handleDelete() {
    if (!canDelete || deleteMut.isPending) return;
    deleteMut.mutate(studentId, {
      onSuccess: () => {
        router.push(listHref);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-rose-500" />
          Loading student…
        </div>
      </div>
    );
  }

  if (listErr) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        {listErr}{" "}
        <button type="button" className="font-semibold underline" onClick={() => void refetch()}>
          Retry
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-800">
        Student not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className={`mb-3 inline-flex items-center gap-1.5 text-sm font-medium transition ${
            isPrincipal ? "text-violet-600 hover:text-violet-800" : "text-sky-600 hover:text-sky-800"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to profile
        </button>
        <p className={`mb-1 text-xs font-semibold uppercase tracking-wider ${
          isPrincipal ? "text-violet-600" : "text-sky-600"
        }`}>
          Students
        </p>
        <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
          Delete student
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Permanently remove this student from the school directory.
        </p>
      </div>

      <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <h3 className="font-montserrat text-lg font-semibold text-slate-900">
              This action cannot be undone
            </h3>
            <p className="text-sm text-slate-600">
              You are about to delete{" "}
              <span className="font-semibold text-slate-900">{fullName || "this student"}</span>
              {student.studentClass ? (
                <>
                  {" "}
                  from class <span className="font-semibold text-slate-900">{student.studentClass}</span>
                </>
              ) : null}
              . Related attendance and academic records may also be affected.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Name</p>
            <p className="mt-1 font-medium text-slate-900">{fullName || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Class</p>
            <p className="mt-1 font-medium text-slate-900">{student.studentClass || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Mobile</p>
            <p className="mt-1 font-medium text-slate-900">{student.mobileNumber || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Student ID</p>
            <p className="mt-1 font-medium text-slate-900 font-mono">{studentId}</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <label htmlFor="confirm-delete" className="block text-sm font-medium text-slate-700">
            Type <span className="font-mono font-semibold text-rose-600">DELETE</span> to confirm
          </label>
          <input
            id="confirm-delete"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push(backHref)}
            disabled={deleteMut.isPending}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete || deleteMut.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleteMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {deleteMut.isPending ? "Deleting…" : "Permanently delete student"}
          </button>
        </div>
      </div>
    </div>
  );
}
