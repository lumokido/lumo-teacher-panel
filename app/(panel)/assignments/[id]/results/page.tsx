"use client";

import { useQuizResults, useQuiz } from "@/hooks/useQuizzes";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function QuizResultsPage() {
  const { id } = useParams() as { id: string };
  const { data: quiz, isLoading: isQuizLoading } = useQuiz(id);
  const { data: results = [], isLoading: isResultsLoading, isError, error, refetch } = useQuizResults(id);

  const listErr =
    isError && error instanceof Error
      ? error.message
      : isError
        ? "Could not load quiz results"
        : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-sky-600">Assignments / Results</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            {isQuizLoading ? "Loading..." : quiz?.title || "Quiz"} Results
          </h2>
          <p className="mt-2 max-w-xl text-slate-600">
            View student scores and leaderboard.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/assignments" />}>
          Back to quizzes
        </Button>
      </div>

      {listErr ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {listErr}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void refetch()}
          >
            Retry
          </button>
        </div>
      ) : null}

      {isResultsLoading ? (
        <p className="text-sm text-slate-500">Loading results...</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-slate-500">No results found for this quiz yet.</p>
      ) : (
        <div className="rounded-xl border border-sky-100 bg-white overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-sky-50 text-slate-900 font-semibold border-b border-sky-100">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {results.map((r, i) => (
                <tr key={r.studentId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{i + 1}</td>
                  <td className="px-4 py-3">{r.studentName}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {r.score} / {r.totalQuestions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
