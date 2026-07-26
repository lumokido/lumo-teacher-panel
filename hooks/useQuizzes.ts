import {
  createQuiz,
  getQuiz,
  listQuizzes,
  updateQuizDraft,
  deleteQuiz,
  generateQuestions,
  saveQuizQuestions,
  getQuizResults,
  requestActivation,
  startQuiz,
  completeQuiz,
  type QuizWriteBody,
  type QuizQuestion,
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

export function useUpdateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string | number; body: QuizWriteBody }) =>
      updateQuizDraft(id, body),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: quizzesKey });
      void qc.invalidateQueries({ queryKey: [...quizzesKey, String(id)] });
      toast.success("Quiz updated");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useDeleteQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteQuiz(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: quizzesKey });
      toast.success("Quiz deleted");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useGenerateQuestions() {
  return useMutation({
    mutationFn: ({ topic, count }: { topic: string; count: number }) =>
      generateQuestions(topic, count),
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useSaveQuestions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, questions }: { id: string | number; questions: QuizQuestion[] }) =>
      saveQuizQuestions(id, questions),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [...quizzesKey, String(id)] });
      toast.success("Questions saved successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useQuizResults(quizId: string) {
  return useQuery({
    queryKey: [...quizzesKey, quizId, "results"],
    queryFn: () => getQuizResults(quizId),
    enabled: !!quizId,
  });
}

export function useRequestActivation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => requestActivation(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: quizzesKey });
      void qc.invalidateQueries({ queryKey: [...quizzesKey, String(id)] });
      toast.success("Activation request submitted! Status changed to PENDING for Principal approval.");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useStartQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => startQuiz(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: quizzesKey });
      void qc.invalidateQueries({ queryKey: [...quizzesKey, String(id)] });
      toast.success("Quiz activated! Students can now join and play.");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useCompleteQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => completeQuiz(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: quizzesKey });
      void qc.invalidateQueries({ queryKey: [...quizzesKey, String(id)] });
      toast.success("Quiz session ended.");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}
