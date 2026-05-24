"use client";

import { StudentForm } from "@/components/students/StudentForm";
import { Button } from "@/components/ui/button";
import { getStudentId, rowToForm } from "@/lib/api/students";
import { useStudentsList, useUpdateStudent } from "@/hooks/useStudents";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: students = [], isLoading } = useStudentsList();
  const updateMut = useUpdateStudent(id);
  const [form, setForm] = useState<ReturnType<typeof rowToForm> | null>(null);

  const student = students.find((s) => getStudentId(s) === id);

  useEffect(() => {
    if (student) setForm(rowToForm(student));
  }, [student]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    updateMut.mutate(form, {
      onSuccess: () => router.push("/students"),
    });
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading student…</p>;
  }

  if (!student || !form) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-rose-700">Student not found.</p>
        <Button variant="outline" render={<Link href="/students" />}>
          Back to directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-sky-600">Students</p>
        <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
          Update student
        </h2>
        <p className="mt-2 text-slate-600">Edit details for this student.</p>
      </div>
      <StudentForm
        form={form}
        onChange={setForm}
        onSubmit={onSubmit}
        busy={updateMut.isPending}
        submitLabel="Save changes"
      />
    </div>
  );
}
