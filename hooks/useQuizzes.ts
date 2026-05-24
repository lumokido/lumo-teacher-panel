import {
  createQuiz,
  getQuiz,
  listQuizzes,
  type QuizWriteBody,
} from "@/lib/api/quizzes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export const quizzesKey = ["quizzes"] as const;

function messageFromAxios(err: unknown): string {
  if (!isAxiosError(err)) return "Request failed";
  const d = err.response?.data;
  if (d && typeof d === "object") {
    const o = d as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
    if (typeof o.error === "string") return o.error;
  }
  return err.message || "Request failed";
}

export function useQuizzesList() {
  return useQuery({
    queryKey: quizzesKey,
    queryFn: listQuizzes,
  });
}

export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: [...quizzesKey, quizId],
    queryFn: () => getQuiz(quizId),
    enabled: !!quizId,
  });
}

export function useCreateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: QuizWriteBody) => createQuiz(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: quizzesKey });
      toast.success("Quiz created");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}
