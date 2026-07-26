import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { getQuizId, questionCount, type QuizRow } from "@/lib/api/quizzes";
import type { ColumnDef } from "@/lib/tables/types";
import { useDeleteQuiz } from "@/hooks/useQuizzes";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export const quizzesTableColumns: ColumnDef<QuizRow>[] = [
  {
    id: "title",
    header: "Title",
    cell: (row) => (
      <span className="font-medium text-slate-900">{row.title || "—"}</span>
    ),
  },
  {
    id: "topic",
    header: "Topic",
    cell: (row) => row.topic || "—",
  },
  {
    id: "class",
    header: "Class ID",
    cell: (row) => row.classId || "—",
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
    cell: function ActionsCell(row) {
      const id = getQuizId(row);
      const deleteMut = useDeleteQuiz();
      
      if (!id) return "—";
      return (
        <DropdownMenu>
          <DropdownMenuTrigger >
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem >
              <Link href={`/assignments/${id}`}>View details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem >
              <Link href={`/assignments/${id}/edit`}>Edit & Questions</Link>
            </DropdownMenuItem>
            <DropdownMenuItem >
              <Link href={`/assignments/${id}/results`}>View Results</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-700"
              onClick={() => {
                if (confirm("Are you sure you want to delete this quiz?")) {
                  deleteMut.mutate(id);
                }
              }}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending ? "Deleting..." : "Delete Quiz"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
