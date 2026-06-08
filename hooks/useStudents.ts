import {
  addStudent,
  listStudents,
  updateStudent,
  getStudentDetails,
  type StudentWriteBody,
} from "@/lib/api/students";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export const studentsKey = ["students"] as const;

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

export function useStudentsList() {
  return useQuery({
    queryKey: studentsKey,
    queryFn: listStudents,
  });
}

export function useAddStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StudentWriteBody) => addStudent(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: studentsKey });
      toast.success("Student added");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useUpdateStudent(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StudentWriteBody) => updateStudent(studentId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: studentsKey });
      toast.success("Student updated");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useStudentDetails(studentId: string) {
  return useQuery({
    queryKey: [...studentsKey, studentId],
    queryFn: () => getStudentDetails(studentId),
    enabled: !!studentId,
  });
}
