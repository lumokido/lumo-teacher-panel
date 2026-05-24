import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getQuizId, questionCount, type QuizRow } from "@/lib/api/quizzes";
import type { ColumnDef } from "@/lib/tables/types";

export const quizzesTableColumns: ColumnDef<QuizRow>[] = [
  {
    id: "title",
    header: "Title",
    cell: (row) => (
      <span className="font-medium text-slate-900">{row.title || "—"}</span>
    ),
  },
  {
    id: "subject",
    header: "Subject",
    cell: (row) => row.subject || "—",
  },
  {
    id: "class",
    header: "Class",
    cell: (row) => row.className || "—",
  },
  {
    id: "questions",
    header: "Questions",
    cell: (row) => questionCount(row) || "—",
  },
  {
    id: "actions",
    header: "Actions",
    className: "text-right",
    cell: (row) => {
      const id = getQuizId(row);
      if (!id) return "—";
      return (
        <Button
          variant="link"
          size="sm"
          className="text-sky-700"
          render={<Link href={`/assignments/${id}`} />}
        >
          View
        </Button>
      );
    },
  },
];
