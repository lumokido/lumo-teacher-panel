import {
  addTeacher,
  listTeachers,
  updateTeacher,
  deleteTeacher,
  type AdminTeacherWriteBody,
} from "@/lib/api/adminTeachers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export const adminTeachersKey = ["admin", "teachers"] as const;

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

export function useTeachersList() {
  return useQuery({
    queryKey: adminTeachersKey,
    queryFn: listTeachers,
  });
}

export function useAddTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminTeacherWriteBody) => addTeacher(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminTeachersKey });
      toast.success("Teacher added");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AdminTeacherWriteBody }) => updateTeacher(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminTeachersKey });
      toast.success("Teacher updated");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useDeleteTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTeacher(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminTeachersKey });
      toast.success("Teacher deleted successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}
