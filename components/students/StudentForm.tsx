"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StudentWriteBody } from "@/lib/api/students";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { StudentPhotoUploader } from "@/components/students/StudentPhotoUploader";

const GENDERS = ["Male", "Female", "Other"] as const;

type StudentFormProps = {
  form: StudentWriteBody;
  onChange: (next: StudentWriteBody) => void;
  onSubmit: (e: React.FormEvent) => void;
  busy?: boolean;
  submitLabel: string;
  studentId?: string;
};

export function StudentForm({
  form,
  onChange,
  onSubmit,
  busy,
  submitLabel,
  studentId,
}: StudentFormProps) {
  function setField<K extends keyof StudentWriteBody>(
    key: K,
    value: StudentWriteBody[K],
  ) {
    onChange({ ...form, [key]: value });
  }

  return (
    <Card className="max-w-2xl border-sky-100">
      <form onSubmit={onSubmit}>
        <CardContent className="grid gap-4 sm:grid-cols-2 pt-6">
          <div className="sm:col-span-2 mb-4 flex justify-center">
            <StudentPhotoUploader
              value={form.profilePhotoUrl || ""}
              onChange={(url) => setField("profilePhotoUrl", url)}
              studentId={studentId}
              theme="sky"
            />
          </div>
          <Field label="First name" className="sm:col-span-1">
            <Input
              required
              value={form.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              disabled={busy}
            />
          </Field>
          <Field label="Last name" className="sm:col-span-1">
            <Input
              required
              value={form.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              disabled={busy}
            />
          </Field>
          <Field label="Admission ID" className="sm:col-span-2">
            <Input
              required
              value={form.studentId}
              onChange={(e) => setField("studentId", e.target.value)}
              placeholder="e.g. ALP260099"
              disabled={busy}
            />
          </Field>
          <Field label="Mobile number" className="sm:col-span-1">
            <Input
              required
              value={form.mobileNumber}
              onChange={(e) => setField("mobileNumber", e.target.value)}
              disabled={busy}
            />
          </Field>
          <Field label="Middle name" className="sm:col-span-1">
            <Input
              value={form.middleName}
              onChange={(e) => setField("middleName", e.target.value)}
              disabled={busy}
            />
          </Field>
          <Field label="Date of birth" className="sm:col-span-1">
            <Input
              required
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setField("dateOfBirth", e.target.value)}
              disabled={busy}
            />
          </Field>
          <Field label="Gender" className="sm:col-span-1">
            <select
              className={cn(
                "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
              )}
              value={form.gender}
              onChange={(e) => setField("gender", e.target.value)}
              disabled={busy}
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Father name" className="sm:col-span-1">
            <Input
              required
              value={form.fatherName}
              onChange={(e) => setField("fatherName", e.target.value)}
              disabled={busy}
            />
          </Field>
          <Field label="Mother name" className="sm:col-span-1">
            <Input
              required
              value={form.motherName}
              onChange={(e) => setField("motherName", e.target.value)}
              disabled={busy}
            />
          </Field>

          <Field label="Class" className="sm:col-span-1">
            <Input
              required
              value={form.studentClass}
              onChange={(e) => setField("studentClass", e.target.value)}
              placeholder="10A"
              disabled={busy}
            />
          </Field>
          <Field label="Section" className="sm:col-span-1">
            <Input
              value={form.sectionName || ""}
              onChange={(e) => setField("sectionName", e.target.value)}
              placeholder="e.g. A"
              disabled={busy}
            />
          </Field>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t border-sky-100 bg-transparent">
          <Button variant="outline" type="button" render={<Link href="/students" />} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy} className="bg-sky-600 hover:bg-sky-700">
            {busy ? "Saving…" : submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
