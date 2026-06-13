import {
  createAssignment,
  listAssignmentsByClass,
  listAssignmentsByClassAndSection,
  listMyAssignments,
  createAssignmentsBulk,
  getAssignmentsByDateAndClass,
  type AssignmentWriteBody
} from "@/lib/api/assignments";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export const assignmentKeys = {
  all: ["assignments"] as const,
  byClass: (classId: number) => ["assignments", "class", classId] as const,
  byClassAndSection: (classId: number, sectionId: number) => ["assignments", "class", classId, "section", sectionId] as const,
  byDateAndClass: (date: string, classId: number) => ["assignments", "history", date, classId] as const,
  myAssignments: ["assignments", "my"] as const,
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

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignmentWriteBody) => createAssignment(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: assignmentKeys.all });
      toast.success("Homework assignment published successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useCreateAssignmentsBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignmentWriteBody[]) => createAssignmentsBulk(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: assignmentKeys.all });
      toast.success("Homework assignments published successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useAssignmentsByClass(classId?: number) {
  return useQuery({
    queryKey: assignmentKeys.byClass(classId || 0),
    queryFn: () => listAssignmentsByClass(classId!),
    enabled: !!classId,
  });
}

export function useAssignmentsByClassAndSection(classId?: number, sectionId?: number | null) {
  return useQuery({
    queryKey: assignmentKeys.byClassAndSection(classId || 0, sectionId || 0),
    queryFn: () => listAssignmentsByClassAndSection(classId!, sectionId!),
    enabled: !!classId && !!sectionId,
  });
}

export function useMyAssignments() {
  return useQuery({
    queryKey: assignmentKeys.myAssignments,
    queryFn: listMyAssignments,
  });
}

export function useAssignmentsByDateAndClass(date: string, classId?: number) {
  return useQuery({
    queryKey: assignmentKeys.byDateAndClass(date, classId || 0),
    queryFn: () => getAssignmentsByDateAndClass(date, classId!),
    enabled: !!date && !!classId,
  });
}

