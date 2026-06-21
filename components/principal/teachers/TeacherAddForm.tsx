"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAddTeacher } from "@/hooks/useAdminTeachers";
import type { AdminTeacherWriteBody } from "@/lib/api/adminTeachers";
import ClassMultiSelect from "./ClassMultiSelect";
import SubjectMultiSelect from "./SubjectMultiSelect";
import HomeroomSelect from "./HomeroomSelect";
import Link from "next/link";

type TeacherAddFormState = Omit<
  AdminTeacherWriteBody,
  "success" | "classes" | "subjects"
> & {
  classes: string;
  subjects: string;
};

function emptyForm(): TeacherAddFormState {
  return {
    emailId: "",
    passwordHash: "",
    name: "",
    mobileNumber: "",
    classTeacher: "",
    classes: "",
    subjects: "",
  };
}

export default function TeacherAddForm() {
  const router = useRouter();
  const addMut = useAddTeacher();
  const [form, setForm] = useState(() => emptyForm());

  const busy = addMut.isPending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: AdminTeacherWriteBody = {
      success: true,
      ...form,
    };
    addMut.mutate(body, {
      onSuccess: () => {
        router.push("/principal/teachers");
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-violet-100 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <h3 className="font-montserrat text-2xl font-semibold text-slate-900">
          Teacher Details
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Enter the new teacher's information and assign their classes.
        </p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block text-sm font-medium text-slate-700">
            Full Name
            <input
              required
              disabled={busy}
              placeholder="e.g. Jane Doe"
              className="mt-1.5 w-full rounded-xl border border-violet-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-slate-50 transition-all"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Mobile Number
            <input
              required
              disabled={busy}
              placeholder="e.g. +1 234 567 8900"
              className="mt-1.5 w-full rounded-xl border border-violet-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-slate-50 transition-all"
              value={form.mobileNumber}
              onChange={(e) => setForm((f) => ({ ...f, mobileNumber: e.target.value }))}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block text-sm font-medium text-slate-700">
            Email Address
            <input
              required
              type="email"
              disabled={busy}
              placeholder="teacher@school.edu"
              className="mt-1.5 w-full rounded-xl border border-violet-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-slate-50 transition-all"
              value={form.emailId}
              onChange={(e) => setForm((f) => ({ ...f, emailId: e.target.value }))}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Temporary Password
            <input
              required
              type="password"
              autoComplete="new-password"
              disabled={busy}
              placeholder="Enter a secure password"
              className="mt-1.5 w-full rounded-xl border border-violet-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-slate-50 transition-all"
              value={form.passwordHash}
              onChange={(e) => setForm((f) => ({ ...f, passwordHash: e.target.value }))}
            />
          </label>
        </div>

        <div className="my-6 border-t border-slate-100"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Assigned Classes & Sections
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Select the classes this teacher will teach.
            </p>
            <ClassMultiSelect 
              value={form.classes} 
              onChange={(val) => setForm((f) => ({ ...f, classes: val }))} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Class Teacher (Homeroom)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              The primary section they are responsible for (optional).
            </p>
            <HomeroomSelect 
              value={form.classTeacher} 
              onChange={(val) => setForm((f) => ({ ...f, classTeacher: val }))} 
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Subjects Taught
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Select the subjects this teacher will teach.
          </p>
          <SubjectMultiSelect
            value={form.subjects}
            onChange={(val) => setForm((f) => ({ ...f, subjects: val }))}
          />
        </div>

        <div className="mt-10 flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
          <Link
            href="/principal/teachers"
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-violet-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-60 transition-all active:scale-[0.98]"
          >
            {busy ? "Creating Teacher..." : "Create Teacher Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
