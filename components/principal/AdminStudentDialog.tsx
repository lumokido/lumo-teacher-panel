"use client";

import { emptyStudentForm, type StudentWriteBody } from "@/lib/api/students";
import { useAddStudentToClass } from "@/hooks/useAdminClasses";
import type { SectionItem } from "@/lib/api/adminClasses";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;

type Props = {
  className: string;
  sections: SectionItem[];
  open: boolean;
  onClose: () => void;
};

export default function AdminStudentDialog({ className, sections, open, onClose }: Props) {
  const addMut = useAddStudentToClass(className);
  const [form, setForm] = useState<StudentWriteBody>(() => ({
    ...emptyStudentForm(),
    studentClass: className,
  }));

  function resetAndClose() {
    setForm({ ...emptyStudentForm(), studentClass: className });
    onClose();
  }

  function setField<K extends keyof StudentWriteBody>(
    key: K,
    value: StudentWriteBody[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    addMut.mutate(
      { ...form, studentClass: className },
      { onSuccess: () => resetAndClose() },
    );
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={resetAndClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-student-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-violet-100 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="add-student-title"
          className="font-montserrat text-lg font-semibold text-slate-900"
        >
          Add student to {className}
        </h3>

        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-600">
              First name
              <input
                required
                className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                disabled={addMut.isPending}
              />
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Last name
              <input
                required
                className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                disabled={addMut.isPending}
              />
            </label>
          </div>

          <label className="block text-xs font-medium text-slate-600">
            Mobile number
            <input
              required
              className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
              value={form.mobileNumber}
              onChange={(e) => setField("mobileNumber", e.target.value)}
              disabled={addMut.isPending}
            />
          </label>

          <label className="block text-xs font-medium text-slate-600">
            Parent name
            <input
              required
              className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
              value={form.parentName}
              onChange={(e) => setField("parentName", e.target.value)}
              disabled={addMut.isPending}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-600">
              Date of birth
              <input
                required
                type="date"
                className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
                value={form.dateOfBirth}
                onChange={(e) => setField("dateOfBirth", e.target.value)}
                disabled={addMut.isPending}
              />
            </label>
            <div className="block text-xs font-medium text-slate-600 space-y-1">
              Gender
              <Select
                value={form.gender}
                onValueChange={(val) => setField("gender", val || "")}
                disabled={addMut.isPending}
              >
                <SelectTrigger className="w-full rounded-lg border-violet-200 bg-white h-[38px] text-sm">
                  <SelectValue placeholder="Select gender..." />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-xs font-medium text-slate-600">
              Class
              <input
                readOnly
                className="mt-1 w-full rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-slate-500 outline-none cursor-not-allowed h-[38px]"
                value={className}
              />
            </label>
            <div className="block text-xs font-medium text-slate-600">
              Section
              <div className="mt-1">
                <Select
                  value={form.sectionName || ""}
                  onValueChange={(val) => setField("sectionName", val || "")}
                  disabled={addMut.isPending}
                >
                  <SelectTrigger className="w-full rounded-lg border-violet-200 bg-white focus:ring-2 focus:ring-violet-300 h-[38px] text-sm">
                    <SelectValue placeholder="Select section..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((sec) => (
                      <SelectItem key={sec.id} value={sec.name}>
                        {sec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <label className="block text-xs font-medium text-slate-600">
              Roll number
              <input
                required
                className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 h-[38px]"
                value={form.rollNumber || ""}
                onChange={(e) => setField("rollNumber", e.target.value)}
                placeholder="e.g. 101"
                disabled={addMut.isPending}
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetAndClose}
              className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-violet-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMut.isPending}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {addMut.isPending ? "Adding…" : "Add student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
