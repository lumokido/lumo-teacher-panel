import {
  createExam,
  listAllExams,
  listSchoolExams,
  listExamsByClass,
  getExamById,
  updateExam,
  deleteExam,
  type ExamWriteBody
} from "@/lib/api/exams";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export const examKeys = {
  all: ["exams"] as const,
  school: ["exams", "school"] as const,
  byClass: (classId: number) => ["exams", "class", classId] as const,
};

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

export function useAllExams() {
  return useQuery({
    queryKey: examKeys.all,
    queryFn: listAllExams,
  });
}

export function useSchoolExams() {
  return useQuery({
    queryKey: examKeys.school,
    queryFn: listSchoolExams,
  });
}

export function useExamsByClass(classId?: number) {
  return useQuery({
    queryKey: examKeys.byClass(classId || 0),
    queryFn: () => listExamsByClass(classId!),
    enabled: !!classId,
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ExamWriteBody) => createExam(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: examKeys.all });
      toast.success("Exam scheduled successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useExamById(id?: number) {
  return useQuery({
    queryKey: ["exams", id],
    queryFn: () => getExamById(id!),
    enabled: typeof id === "number" && !isNaN(id),
  });
}

export function useUpdateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ExamWriteBody }) => updateExam(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: examKeys.all });
      toast.success("Exam updated successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useDeleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteExam(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: examKeys.all });
      toast.success("Exam deleted successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}
