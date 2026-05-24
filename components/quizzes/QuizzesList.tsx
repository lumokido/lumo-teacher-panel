"use client";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { getQuizId } from "@/lib/api/quizzes";
import { quizzesTableColumns } from "@/lib/tables/quizzes-table.config";
import { useQuizzesList } from "@/hooks/useQuizzes";
import Link from "next/link";

export default function QuizzesList() {
  const { data: quizzes = [], isLoading, isError, error, refetch } =
    useQuizzesList();

  const listErr =
    isError && error instanceof Error
      ? error.message
      : isError
        ? "Could not load quizzes"
        : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-sky-600">Assignments</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            Assignment Center
          </h2>
          <p className="mt-2 max-w-xl text-slate-600">
            Create, share, and review quizzes across your classes.
          </p>
        </div>
        <Button
          className="bg-sky-600 hover:bg-sky-700"
          render={<Link href="/assignments/add" />}
        >
          Create quiz
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

      <DataTable
        columns={quizzesTableColumns}
        data={quizzes}
        isLoading={isLoading}
        emptyMessage="No quizzes yet. Create your first quiz to get started."
        rowKey={(row, index) => getQuizId(row) ?? `row-${index}`}
      />
    </div>
  );
}
