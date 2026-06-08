import {
  markClassAttendance,
  getStudentAttendanceHistory,
  getAttendanceStats,
  getAttendanceHistory,
  type MarkAttendancePayload,
} from "@/lib/api/attendance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export const attendanceKeys = {
  all: ["attendance"] as const,
  studentHistory: (studentId: string) => ["attendance", "student", studentId] as const,
  stats: (date?: string) => ["attendance", "stats", date] as const,
  history: (date?: string) => ["attendance", "history", date] as const,
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

export function useMarkClassAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarkAttendancePayload) => markClassAttendance(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success("Attendance marked successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useStudentAttendanceHistory(studentId?: string) {
  return useQuery({
    queryKey: attendanceKeys.studentHistory(studentId || ""),
    queryFn: () => getStudentAttendanceHistory(studentId!),
    enabled: !!studentId,
  });
}

export function useAttendanceStats(date?: string) {
  return useQuery({
    queryKey: attendanceKeys.stats(date),
    queryFn: () => getAttendanceStats(date),
  });
}

export function useAttendanceHistory(date?: string) {
  return useQuery({
    queryKey: attendanceKeys.history(date),
    queryFn: () => getAttendanceHistory(date),
  });
}
