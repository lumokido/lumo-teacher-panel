"use client";

import type { AdminTeacherWriteBody, TeacherRow } from "@/lib/api/adminTeachers";
import {
  useAddTeacher,
  useTeachersList,
  useUpdateTeacher,
} from "@/hooks/useAdminTeachers";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function splitList(raw: string): string[] {
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function emptyForm(): Omit<AdminTeacherWriteBody, "success"> {
  return {
    emailId: "",
    passwordHash: "",
    name: "",
    schoolName: "",
    mobileNumber: "",
    classTeacher: "",
    classes: [],
    subjects: [],
  };
}

function rowToForm(t: TeacherRow): Omit<AdminTeacherWriteBody, "success"> {
  return {
    emailId: t.emailId ?? "",
    passwordHash: "",
    name: t.name ?? "",
    schoolName: t.schoolName ?? "",
    mobileNumber: t.mobileNumber ?? "",
    classTeacher: t.classTeacher ?? "",
    classes: Array.isArray(t.classes) ? t.classes : [],
    subjects: Array.isArray(t.subjects) ? t.subjects : [],
  };
}

type DialogMode = "add" | "edit" | null;

export default function TeachersPanel() {
  const { data: teachers = [], isLoading, isError, error, refetch } =
    useTeachersList();
  const addMut = useAddTeacher();
  const updateMut = useUpdateTeacher();

  const [dialog, setDialog] = useState<DialogMode>(null);
  const [classesInput, setClassesInput] = useState("");
  const [subjectsInput, setSubjectsInput] = useState("");
  const [form, setForm] = useState(() => emptyForm());

  const busy = addMut.isPending || updateMut.isPending;

  const listErr = useMemo(() => {
    if (!isError) return null;
    return error instanceof Error ? error.message : "Could not load teachers";
  }, [isError, error]);

  function openAdd() {
    setForm(emptyForm());
    setClassesInput("");
    setSubjectsInput("");
    setDialog("add");
  }

  function openEdit(t: TeacherRow) {
    const f = rowToForm(t);
    setForm(f);
    setClassesInput(f.classes.join(", "));
    setSubjectsInput(f.subjects.join(", "));
    setDialog("edit");
  }

  function closeDialog() {
    setDialog(null);
  }

  function buildBody(): AdminTeacherWriteBody {
    return {
      success: true,
      ...form,
      classes: splitList(classesInput),
      subjects: splitList(subjectsInput),
    };
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (dialog === "edit" && !form.passwordHash.trim()) {
      toast.error("Enter the new password for this teacher.");
      return;
    }
    const body = buildBody();
    if (dialog === "add") {
      addMut.mutate(body, { onSuccess: () => closeDialog() });
      return;
    }
    if (dialog === "edit") {
      updateMut.mutate(body, { onSuccess: () => closeDialog() });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-violet-600">Teachers</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            Staff directory
          </h2>
          <p className="mt-2 max-w-xl text-slate-600">
            Add teachers and keep class assignments up to date.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          Add teacher
        </button>
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

      <div className="overflow-x-auto rounded-xl border border-violet-100">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-violet-100 bg-violet-50/80 text-xs font-semibold uppercase tracking-wide text-violet-900">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Class teacher</th>
              <th className="px-4 py-3">Classes</th>
              <th className="px-4 py-3">Subjects</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No teachers yet. Use Add teacher to create one.
                </td>
              </tr>
            ) : (
              teachers.map((t, i) => (
                <tr key={t.emailId ?? `row-${i}`} className="hover:bg-violet-50/40">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {t.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{t.emailId ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {t.mobileNumber ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {t.classTeacher ?? "—"}
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-slate-600">
                    {Array.isArray(t.classes) ? t.classes.join(", ") : "—"}
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-slate-600">
                    {Array.isArray(t.subjects) ? t.subjects.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(t)}
                      className="text-sm font-semibold text-violet-700 hover:text-violet-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {dialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={closeDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-dialog-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-violet-100 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="teacher-dialog-title"
              className="font-montserrat text-lg font-semibold text-slate-900"
            >
              {dialog === "add" ? "Add teacher" : "Update teacher"}
            </h3>
            <form className="mt-4 space-y-3" onSubmit={onSubmit}>
              <label className="block text-xs font-medium text-slate-600">
                Email
                <input
                  required
                  disabled={dialog === "edit" || busy}
                  className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-slate-100"
                  value={form.emailId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, emailId: e.target.value }))
                  }
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Password
                <input
                  required={dialog === "add"}
                  type="password"
                  autoComplete="new-password"
                  className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
                  value={form.passwordHash}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, passwordHash: e.target.value }))
                  }
                  placeholder={
                    dialog === "edit" ? "New password (required for update)" : ""
                  }
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Name
                <input
                  required
                  className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                School name
                <input
                  required
                  className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
                  value={form.schoolName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, schoolName: e.target.value }))
                  }
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Mobile
                <input
                  required
                  className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
                  value={form.mobileNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, mobileNumber: e.target.value }))
                  }
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Class teacher (homeroom)
                <input
                  required
                  className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
                  value={form.classTeacher}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, classTeacher: e.target.value }))
                  }
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Classes (comma-separated)
                <input
                  required
                  className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
                  value={classesInput}
                  onChange={(e) => setClassesInput(e.target.value)}
                  placeholder="10A, 10B"
                />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Subjects (comma-separated)
                <input
                  required
                  className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
                  value={subjectsInput}
                  onChange={(e) => setSubjectsInput(e.target.value)}
                  placeholder="Math, Science"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-violet-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {busy ? "Saving…" : dialog === "add" ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
