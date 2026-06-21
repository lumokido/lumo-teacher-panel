"use client";

import type { AdminTeacherWriteBody } from "@/lib/api/adminTeachers";
import { useTeachersList, useUpdateTeacher } from "@/hooks/useAdminTeachers";
import { useMemo, useState, useEffect } from "react";
import SubjectMultiSelect from "./teachers/SubjectMultiSelect";
import Link from "next/link";
import { toast } from "sonner";

type Props = {
  emailId: string;
};

export default function TeacherDetailPanel({ emailId }: Props) {
  const decodedEmail = decodeURIComponent(emailId);
  const { data: teachers = [], isLoading, isError, error, refetch } = useTeachersList();
  const updateMut = useUpdateTeacher();

  const teacher = useMemo(
    () => teachers.find((t) => t.emailId === decodedEmail),
    [teachers, decodedEmail]
  );

  const [form, setForm] = useState<Omit<AdminTeacherWriteBody, "success">>({
    emailId: decodedEmail,
    passwordHash: "",
    name: "",
    mobileNumber: "",
    classTeacher: "",
    classes: "",
    subjects: "",
  });

  // Hydrate form when teacher loads
  useEffect(() => {
    if (teacher) {
      const classesStr = Array.isArray(teacher.classes) 
        ? teacher.classes.join(", ") 
        : teacher.classes ?? "";
      const subjectsStr = Array.isArray(teacher.subjects) 
        ? teacher.subjects.join(", ") 
        : teacher.subjects ?? "";

      setForm({
        emailId: teacher.emailId ?? "",
        passwordHash: "",
        name: teacher.name ?? "",
        mobileNumber: teacher.mobileNumber ?? "",
        classTeacher: teacher.classTeacher ?? "",
        classes: classesStr,
        subjects: subjectsStr,
      });
    }
  }, [teacher]);

  const listErr = useMemo(() => {
    if (!isError) return null;
    return error instanceof Error ? error.message : "Could not load teacher details";
  }, [isError, error]);

  const busy = updateMut.isPending || isLoading;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.passwordHash.trim()) {
      toast.error("Enter the new password for this teacher to update.");
      return;
    }
    const body: AdminTeacherWriteBody = {
      success: true,
      ...form,
    };
    if (teacher && teacher.id != null) {
      updateMut.mutate({ id: teacher.id, body }, {
        onSuccess: () => {
          toast.success("Teacher updated successfully!");
        },
      });
    } else {
      toast.error("Cannot update teacher: Missing profile ID.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/principal/teachers"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 transition hover:text-violet-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to directory
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-violet-600">Teacher Profile</p>
            <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
              {teacher ? teacher.name : decodedEmail}
            </h2>
            <p className="mt-2 text-slate-600">
              Update details and manage class assignments for this staff member.
            </p>
          </div>
        </div>
      </div>

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

      {!teacher && !isLoading && !isError ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-800">
          Teacher not found in the directory.
        </div>
      ) : null}

      {/* Edit Form */}
      {teacher || isLoading ? (
        <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                Name
                <input
                  required
                  disabled={isLoading}
                  className="mt-1.5 w-full rounded-xl border border-violet-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-slate-50 disabled:text-slate-500"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                Email
                <input
                  required
                  disabled
                  className="mt-1.5 w-full rounded-xl border border-violet-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed"
                  value={form.emailId}
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                New Password
                <input
                  type="password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="mt-1.5 w-full rounded-xl border border-violet-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-slate-50 disabled:text-slate-500"
                  value={form.passwordHash}
                  onChange={(e) => setForm((f) => ({ ...f, passwordHash: e.target.value }))}
                  placeholder="Required to update profile"
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                Mobile
                <input
                  required
                  disabled={isLoading}
                  className="mt-1.5 w-full rounded-xl border border-violet-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-slate-50 disabled:text-slate-500"
                  value={form.mobileNumber}
                  onChange={(e) => setForm((f) => ({ ...f, mobileNumber: e.target.value }))}
                />
              </label>



              <label className="block text-sm font-medium text-slate-600">
                Class Teacher (Homeroom)
                <input
                  required
                  disabled={isLoading}
                  className="mt-1.5 w-full rounded-xl border border-violet-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-slate-50 disabled:text-slate-500"
                  value={form.classTeacher}
                  onChange={(e) => setForm((f) => ({ ...f, classTeacher: e.target.value }))}
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                Classes
                <input
                  required
                  disabled={isLoading}
                  className="mt-1.5 w-full rounded-xl border border-violet-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-slate-50 disabled:text-slate-500"
                  value={form.classes}
                  onChange={(e) => setForm((f) => ({ ...f, classes: e.target.value }))}
                  placeholder="e.g. 10A, 10B"
                />
                <p className="mt-1 text-xs text-slate-500">Comma-separated list of assigned classes.</p>
              </label>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-600">
                  Subjects
                </label>
                <SubjectMultiSelect
                  value={form.subjects}
                  onChange={(val) => setForm((f) => ({ ...f, subjects: val }))}
                />
                <p className="mt-1 text-xs text-slate-500">Select subjects taught by this teacher.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-violet-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
