"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type QuizWriteBody } from "@/lib/api/quizzes";
import { cn } from "@/lib/utils";
import Link from "next/link";

type QuizFormProps = {
  form: QuizWriteBody;
  onChange: (next: QuizWriteBody) => void;
  onSubmit: (e: React.FormEvent) => void;
  busy?: boolean;
  submitLabel: string;
};

export function QuizForm({
  form,
  onChange,
  onSubmit,
  busy,
  submitLabel,
}: QuizFormProps) {
  function setField<K extends keyof QuizWriteBody>(
    key: K,
    value: QuizWriteBody[K],
  ) {
    onChange({ ...form, [key]: value });
  }

  return (
    <Card className="max-w-3xl border-sky-100">
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2">
              <Input
                required
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Math Quiz 1"
                disabled={busy}
              />
            </Field>
            <Field label="Topic">
              <Input
                required
                value={form.topic}
                onChange={(e) => setField("topic", e.target.value)}
                placeholder="Algebra"
                disabled={busy}
              />
            </Field>
            <Field label="Class ID">
              <Input
                required
                type="number"
                value={form.classId || ""}
                onChange={(e) => setField("classId", parseInt(e.target.value, 10) || 0)}
                placeholder="2"
                disabled={busy}
              />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Input
                required
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="This quiz covers basic algebra..."
                disabled={busy}
              />
            </Field>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t border-sky-100 bg-transparent py-4">
          <Button
            variant="outline"
            type="button"
            render={<Link href="/assignments" />}
            disabled={busy}
          >
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
