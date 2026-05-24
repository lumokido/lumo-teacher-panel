"use client";

import { QuizForm } from "@/components/quizzes/QuizForm";
import { emptyQuizForm } from "@/lib/api/quizzes";
import { useCreateQuiz } from "@/hooks/useQuizzes";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddQuizPage() {
  const router = useRouter();
  const createMut = useCreateQuiz();
  const [form, setForm] = useState(emptyQuizForm);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const questions = form.questions.map((q) => ({
      ...q,
      options: q.options.map((o) => o.trim()).filter(Boolean),
    }));
    createMut.mutate(
      { ...form, questions },
      { onSuccess: () => router.push("/assignments") },
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-sky-600">Assignments</p>
        <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
          Create quiz
        </h2>
        <p className="mt-2 text-slate-600">
          Add questions and mark the correct answer for each.
        </p>
      </div>
      <QuizForm
        form={form}
        onChange={setForm}
        onSubmit={onSubmit}
        busy={createMut.isPending}
        submitLabel="Create quiz"
      />
    </div>
  );
}
