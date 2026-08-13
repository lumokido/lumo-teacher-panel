import {
  saveBulkMarks,
  saveSingleMark,
  getAdminMarks,
  updateStudentMark,
  publishClassResults,
  publishOverallResults,
  getReportCard,
  type BulkMarkRequest,
  type SingleMarkRequest,
} from "@/lib/api/marks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export const adminMarksKey = ["admin", "marks"] as const;

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

export function useAdminMarks(examId?: number) {
  return useQuery({
    queryKey: ["admin", "marks", examId],
    queryFn: () => getAdminMarks(examId),
  });
}

export function useSaveSingleMark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SingleMarkRequest) => saveSingleMark(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminMarksKey });
      void qc.invalidateQueries({ queryKey: ["report-card"] });
      toast.success("Student mark saved");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useSaveBulkMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BulkMarkRequest) => saveBulkMarks(body),
    onSuccess: (_, variables) => {
      void qc.invalidateQueries({ queryKey: adminMarksKey });
      void qc.invalidateQueries({ queryKey: ["report-card", variables.studentId] });
      toast.success("Marks saved successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useUpdateStudentMark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { marksObtained: number; maxMarks?: number } }) =>
      updateStudentMark(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminMarksKey });
      void qc.invalidateQueries({ queryKey: ["report-card"] });
      toast.success("Student score updated successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function usePublishClassResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, examId }: { classId: number | string; examId: number | string }) =>
      publishClassResults(classId, examId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminMarksKey });
      void qc.invalidateQueries({ queryKey: ["report-card"] });
      toast.success("Class results published successfully!");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function usePublishOverallResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (examId: number | string) => publishOverallResults(examId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminMarksKey });
      void qc.invalidateQueries({ queryKey: ["report-card"] });
      toast.success("Overall results published across all classes!");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useReportCard(studentId: string, examId?: number) {
  return useQuery({
    queryKey: ["report-card", studentId, examId],
    queryFn: () => getReportCard(studentId, examId),
    enabled: !!studentId,
  });
}
