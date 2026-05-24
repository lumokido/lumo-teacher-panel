"use client";

import { QuizDetail } from "@/components/quizzes/QuizDetail";
import { useParams } from "next/navigation";

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <QuizDetail quizId={id} />;
}
