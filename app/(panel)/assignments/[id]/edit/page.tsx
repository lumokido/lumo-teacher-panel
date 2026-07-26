"use client";

import { QuizForm } from "@/components/quizzes/QuizForm";
import { QuestionBuilder } from "@/components/quizzes/QuestionBuilder";
import { useQuiz, useUpdateQuiz, useSaveQuestions } from "@/hooks/useQuizzes";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { type QuizWriteBody, type QuizQuestion } from "@/lib/api/quizzes";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function EditQuizPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { data: quiz, isLoading } = useQuiz(id);
  
  const updateMut = useUpdateQuiz();
  const saveQMut = useSaveQuestions();

  const [draftForm, setDraftForm] = useState<QuizWriteBody | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (quiz) {
      setDraftForm({
        title: quiz.title || "",
        topic: quiz.topic || "",
        description: quiz.description || "",
        classId: quiz.classId || 0,
      });
      setQuestions(quiz.questions || []);
    }
  }, [quiz]);

  if (isLoading || !draftForm) {
    return <p className="text-sm text-slate-500">Loading quiz...</p>;
  }

  function handleUpdateDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!draftForm) return;
    updateMut.mutate({ id, body: draftForm });
  }

  function handleSaveQuestions() {
    saveQMut.mutate({ id, questions });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-sky-600">Assignments / Edit</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            Edit Quiz
          </h2>
          <p className="mt-2 text-slate-600">
            Update quiz details and manage questions.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/assignments" />}>
          Back to quizzes
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">1. Quiz Details</h3>
          <QuizForm
            form={draftForm}
            onChange={setDraftForm}
            onSubmit={handleUpdateDraft}
            busy={updateMut.isPending}
            submitLabel="Update Details"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">2. Manage Questions</h3>
            <Button 
              onClick={handleSaveQuestions} 
              disabled={saveQMut.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saveQMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save All Questions
            </Button>
          </div>
          <QuestionBuilder
            questions={questions}
            onChange={setQuestions}
            topic={draftForm.topic}
          />
        </div>
      </div>
    </div>
  );
}
