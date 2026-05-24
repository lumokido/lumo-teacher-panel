"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  emptyQuestion,
  type QuizQuestion,
  type QuizWriteBody,
} from "@/lib/api/quizzes";
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
  function setField<K extends keyof Omit<QuizWriteBody, "questions">>(
    key: K,
    value: QuizWriteBody[K],
  ) {
    onChange({ ...form, [key]: value });
  }

  function updateQuestion(index: number, next: QuizQuestion) {
    const questions = [...form.questions];
    questions[index] = next;
    onChange({ ...form, questions });
  }

  function addQuestion() {
    onChange({ ...form, questions: [...form.questions, emptyQuestion()] });
  }

  function removeQuestion(index: number) {
    if (form.questions.length <= 1) return;
    onChange({
      ...form,
      questions: form.questions.filter((_, i) => i !== index),
    });
  }

  return (
    <Card className="max-w-3xl border-sky-100">
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6">
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
            <Field label="Subject">
              <Input
                required
                value={form.subject}
                onChange={(e) => setField("subject", e.target.value)}
                placeholder="Mathematics"
                disabled={busy}
              />
            </Field>
            <Field label="Class">
              <Input
                required
                value={form.className}
                onChange={(e) => setField("className", e.target.value)}
                placeholder="10-A"
                disabled={busy}
              />
            </Field>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Questions</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuestion}
                disabled={busy}
              >
                Add question
              </Button>
            </div>

            {form.questions.map((q, index) => (
              <QuestionBlock
                key={index}
                index={index}
                question={q}
                canRemove={form.questions.length > 1}
                busy={busy}
                onChange={(next) => updateQuestion(index, next)}
                onRemove={() => removeQuestion(index)}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t border-sky-100 bg-transparent">
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

function QuestionBlock({
  index,
  question,
  canRemove,
  busy,
  onChange,
  onRemove,
}: {
  index: number;
  question: QuizQuestion;
  canRemove: boolean;
  busy?: boolean;
  onChange: (q: QuizQuestion) => void;
  onRemove: () => void;
}) {
  function setOption(optIndex: number, value: string) {
    const options = [...question.options];
    options[optIndex] = value;
    const correctAnswer =
      question.correctAnswer === question.options[optIndex]
        ? value
        : question.correctAnswer;
    onChange({ ...question, options, correctAnswer });
  }

  const filledOptions = question.options.filter((o) => o.trim());

  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">
          Question {index + 1}
        </span>
        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:text-rose-700"
            onClick={onRemove}
            disabled={busy}
          >
            Remove
          </Button>
        ) : null}
      </div>

      <Field label="Question text" className="mb-3">
        <Input
          required
          value={question.questionText}
          onChange={(e) => onChange({ ...question, questionText: e.target.value })}
          disabled={busy}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((opt, i) => (
          <Field key={i} label={`Option ${i + 1}`}>
            <Input
              required
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              disabled={busy}
            />
          </Field>
        ))}
      </div>

      <Field label="Correct answer" className="mt-3">
        <select
          required
          className={cn(
            "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
          )}
          value={question.correctAnswer}
          onChange={(e) =>
            onChange({ ...question, correctAnswer: e.target.value })
          }
          disabled={busy || filledOptions.length === 0}
        >
          <option value="">Select correct option</option>
          {question.options.map((opt, i) =>
            opt.trim() ? (
              <option key={i} value={opt}>
                {opt}
              </option>
            ) : null,
          )}
        </select>
      </Field>
    </div>
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
