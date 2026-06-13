import { saveBulkMarks, getReportCard, type BulkMarkRequest } from "@/lib/api/marks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

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

export function useSaveBulkMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BulkMarkRequest) => saveBulkMarks(body),
    onSuccess: (_, variables) => {
      void qc.invalidateQueries({ queryKey: ["report-card", variables.studentId, variables.examId] });
      toast.success("Marks saved successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useReportCard(studentId: string, examId: number) {
  return useQuery({
    queryKey: ["report-card", studentId, examId],
    queryFn: () => getReportCard(studentId, examId),
    enabled: !!studentId && !!examId,
  });
}
