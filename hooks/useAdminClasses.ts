import {
  createClass,
  createSection,
  listClasses,
  listStudentsByClass,
  listSectionsByClassId,
  listStudentsByClassId,
  listStudentsByClassAndSectionId,
} from "@/lib/api/adminClasses";
import { addStudent, type StudentWriteBody } from "@/lib/api/students";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export const adminClassesKey = ["admin", "classes"] as const;

function classStudentsKey(className: string) {
  return ["admin", "classStudents", className] as const;
}

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

export function useClassesList() {
  return useQuery({
    queryKey: adminClassesKey,
    queryFn: listClasses,
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createClass(name),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminClassesKey });
      toast.success("Class created");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, classId }: { name: string; classId: number }) =>
      createSection(name, classId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminClassesKey });
      toast.success("Section created");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useStudentsByClass(className: string) {
  return useQuery({
    queryKey: classStudentsKey(className),
    queryFn: () => listStudentsByClass(className),
    enabled: !!className,
  });
}

export function useSectionsByClassId(classId?: number) {
  return useQuery({
    queryKey: ["admin", "classSections", classId],
    queryFn: () => listSectionsByClassId(classId!),
    enabled: classId != null,
  });
}

export function useStudentsByClassId(classId?: number) {
  return useQuery({
    queryKey: ["admin", "classStudentsId", classId],
    queryFn: () => listStudentsByClassId(classId!),
    enabled: classId != null,
  });
}

export function useStudentsByClassAndSectionId(
  classId?: number,
  sectionId?: number,
) {
  return useQuery({
    queryKey: ["admin", "classStudentsSection", classId, sectionId],
    queryFn: () => listStudentsByClassAndSectionId(classId!, sectionId!),
    enabled: classId != null && sectionId != null,
  });
}

export function useAddStudentToClass(className: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StudentWriteBody) => addStudent(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: classStudentsKey(className) });
      void qc.invalidateQueries({ queryKey: ["admin", "classStudentsId"] });
      void qc.invalidateQueries({ queryKey: ["admin", "classStudentsSection"] });
      void qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student added");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}
