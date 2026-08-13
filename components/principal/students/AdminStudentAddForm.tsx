"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useClassesList, useSectionsByClassId } from "@/hooks/useAdminClasses";
import { addStudent, emptyStudentForm, type StudentWriteBody } from "@/lib/api/students";
import { StudentPhotoUploader } from "@/components/students/StudentPhotoUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;

type Props = {
  className: string;
};

export default function AdminStudentAddForm({ className }: Props) {
  const router = useRouter();
  const decodedClassName = decodeURIComponent(className);

  const { data: classes = [] } = useClassesList();
  const classItem = classes.find((c) => c.name === decodedClassName);
  const { data: sections = [] } = useSectionsByClassId(classItem?.id);

  const [form, setForm] = useState<StudentWriteBody>(() => ({
    ...emptyStudentForm(),
    studentClass: decodedClassName,
  }));
  const [busy, setBusy] = useState(false);

  function setField<K extends keyof StudentWriteBody>(key: K, value: StudentWriteBody[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      await addStudent({
        ...form,
        studentClass: decodedClassName,
      });

      toast.success("Student added successfully!");
      router.push(`/principal/classes/${encodeURIComponent(decodedClassName)}`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || "Failed to add student.";
      toast.error(errMsg);
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-violet-200 px-3.5 py-2.5 text-sm text-slate-900 outline-hidden focus:ring-3 focus:border-violet-400 focus:ring-violet-100 transition disabled:bg-slate-50";

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-violet-100 bg-white p-8 shadow-sm">
      <div className="mb-8 flex flex-col items-center justify-center border-b border-slate-100 pb-6">
        <StudentPhotoUploader
          value={form.profilePhotoUrl || ""}
          onChange={(url) => setField("profilePhotoUrl", url)}
          theme="violet"
        />
        <div className="text-center mt-3">
          <h3 className="font-montserrat text-xl font-bold text-slate-800">
            Student Details
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Provide the personal details and upload a photo for the student profile.
          </p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <label className="block text-xs font-semibold text-slate-600">
          Admission ID
          <input
            required
            disabled={busy}
            className={inputClass}
            value={form.studentId}
            onChange={(e) => setField("studentId", e.target.value)}
            placeholder="e.g. ALP260099"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-xs font-semibold text-slate-600">
            First name
            <input
              required
              disabled={busy}
              className={inputClass}
              value={form.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              placeholder="e.g. John"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Middle name
            <input
              disabled={busy}
              className={inputClass}
              value={form.middleName}
              onChange={(e) => setField("middleName", e.target.value)}
              placeholder="e.g. Robert"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Last name
            <input
              required
              disabled={busy}
              className={inputClass}
              value={form.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              placeholder="e.g. Doe"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-600">
            Mobile number
            <input
              required
              disabled={busy}
              type="tel"
              className={inputClass}
              value={form.mobileNumber}
              onChange={(e) => setField("mobileNumber", e.target.value)}
              placeholder="10-digit mobile number"
            />
          </label>

          <div className="block text-xs font-semibold text-slate-600 space-y-1.5">
            Gender
            <Select
              value={form.gender}
              onValueChange={(val) => setField("gender", val || "")}
              disabled={busy}
            >
              <SelectTrigger className="w-full rounded-xl border-violet-200 bg-white h-[44px] text-sm">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-600">
            Father name
            <input
              required
              disabled={busy}
              className={inputClass}
              value={form.fatherName}
              onChange={(e) => setField("fatherName", e.target.value)}
              placeholder="Father's full name"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Mother name
            <input
              required
              disabled={busy}
              className={inputClass}
              value={form.motherName}
              onChange={(e) => setField("motherName", e.target.value)}
              placeholder="Mother's full name"
            />
          </label>
        </div>


        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-600">
            Date of birth
            <input
              required
              disabled={busy}
              type="date"
              className={inputClass}
              value={form.dateOfBirth}
              onChange={(e) => setField("dateOfBirth", e.target.value)}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Class
            <input
              readOnly
              className="mt-1.5 w-full rounded-xl border border-violet-200 bg-violet-50/50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed outline-hidden h-[44px]"
              value={decodedClassName}
            />
          </label>
        </div>

        <div className="block text-xs font-semibold text-slate-600 space-y-1.5">
          Section <span className="text-slate-400 font-normal">(Optional)</span>
          <Select
            value={form.sectionName || "none"}
            onValueChange={(val) => setField("sectionName", val === "none" || !val ? "" : val)}
            disabled={busy}
          >
            <SelectTrigger className="w-full rounded-xl border-violet-200 bg-white h-[44px] text-sm">
              <SelectValue placeholder="Select section..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Section</SelectItem>
              {sections.map((sec) => (
                <SelectItem key={sec.id} value={sec.name}>
                  {sec.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={busy}
            onClick={() => router.push(`/principal/classes/${encodeURIComponent(decodedClassName)}`)}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60 transition active:scale-[0.98]"
          >
            {busy ? "Saving..." : "Add Student"}
          </button>
        </div>
      </form>
    </div>
  );
}
