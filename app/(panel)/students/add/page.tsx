"use client";

import { StudentForm } from "@/components/students/StudentForm";
import { emptyStudentForm } from "@/lib/api/students";
import { useAddStudent } from "@/hooks/useStudents";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddStudentPage() {
  const router = useRouter();
  const addMut = useAddStudent();
  const [form, setForm] = useState(emptyStudentForm);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    addMut.mutate(form, {
      onSuccess: () => router.push("/students"),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-sky-600">Students</p>
        <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
          Add student
        </h2>
        <p className="mt-2 text-slate-600">Create a new student record.</p>
      </div>
      <StudentForm
        form={form}
        onChange={setForm}
        onSubmit={onSubmit}
        busy={addMut.isPending}
        submitLabel="Create student"
      />
    </div>
  );
}
