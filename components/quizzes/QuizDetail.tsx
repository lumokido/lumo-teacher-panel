"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { questionCount, type QuizQuestion } from "@/lib/api/quizzes";
import { useQuiz } from "@/hooks/useQuizzes";
import Link from "next/link";

type QuizDetailProps = {
  quizId: string;
};

export function QuizDetail({ quizId }: QuizDetailProps) {
  const { data: quiz, isLoading, isError } = useQuiz(quizId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading quiz…</p>;
  }

  if (isError || !quiz) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-rose-700">Could not load this quiz.</p>
        <Button variant="outline" render={<Link href="/assignments" />}>
          Back to quizzes
        </Button>
      </div>
    );
  }

  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-sky-600">Assignments</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            {quiz.title || "Quiz"}
          </h2>
          <p className="mt-2 text-slate-600">
            {quiz.subject || "—"} · Class {quiz.className || "—"} ·{" "}
            {questionCount(quiz) || questions.length} question
            {(questionCount(quiz) || questions.length) === 1 ? "" : "s"}
          </p>
        </div>
        <Button variant="outline" render={<Link href="/assignments" />}>
          Back
        </Button>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No questions in this quiz.</p>
        ) : (
          questions.map((q, i) => (
            <QuestionCard key={i} index={i + 1} question={q} />
          ))
        )}
      </div>
    </div>
  );
}

function QuestionCard({
  index,
  question,
}: {
  index: number;
  question: QuizQuestion;
}) {
  return (
    <Card className="border-sky-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {index}. {question.questionText || "Untitled question"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {(question.options ?? []).map((opt, i) => {
          const isCorrect = opt === question.correctAnswer;
          return (
            <div
              key={i}
              className={
                isCorrect
                  ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900"
                  : "rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm text-slate-700"
              }
            >
              {opt || "—"}
              {isCorrect ? (
                <span className="ml-2 text-xs font-semibold uppercase text-emerald-700">
                  Correct
                </span>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
