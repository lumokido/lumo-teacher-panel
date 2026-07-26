"use client";

import { QuizForm } from "@/components/quizzes/QuizForm";
import { emptyQuizForm } from "@/lib/api/quizzes";
import { useCreateQuiz } from "@/hooks/useQuizzes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getQuizId } from "@/lib/api/quizzes";

export default function AddQuizPage() {
  const router = useRouter();
  const createMut = useCreateQuiz();
  const [form, setForm] = useState(emptyQuizForm);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMut.mutate(form, {
      onSuccess: (data) => {
        const id = getQuizId(data);
        if (id) {
          router.push(`/assignments/${id}/edit`);
        } else {
          router.push("/assignments");
        }
      },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-sky-600">Assignments</p>
        <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
          Create quiz draft
        </h2>
        <p className="mt-2 text-slate-600">
          First, create the quiz details. You will add questions on the next screen.
        </p>
      </div>
      <QuizForm
        form={form}
        onChange={setForm}
        onSubmit={onSubmit}
        busy={createMut.isPending}
        submitLabel="Next: Add Questions"
      />
    </div>
  );
}
