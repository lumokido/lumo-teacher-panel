import { api } from "@/lib/api/httpClient";
import type { StudentRow } from "@/lib/api/students";

export type ClassItem = {
  id: number;
  name: string;
};

export type SectionItem = {
  id: number;
  name: string;
  classId: number;
};

function unwrapClassList(data: unknown): ClassItem[] {
  if (Array.isArray(data)) return data as ClassItem[];
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["data", "classes", "classList", "records"]) {
      const v = o[key];
      if (Array.isArray(v)) return v as ClassItem[];
    }
  }
  return [];
}

function unwrapStudentList(data: unknown): StudentRow[] {
  if (Array.isArray(data)) return data as StudentRow[];
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["data", "students", "studentList", "records"]) {
      const v = o[key];
      if (Array.isArray(v)) return v as StudentRow[];
    }
  }
  return [];
}

function unwrapSectionList(data: unknown): SectionItem[] {
  if (Array.isArray(data)) return data as SectionItem[];
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["data", "sections", "sectionList", "records"]) {
      const v = o[key];
      if (Array.isArray(v)) return v as SectionItem[];
    }
  }
  return [];
}

/** GET /api/admin/classes */
export async function listClasses(): Promise<ClassItem[]> {
  const res = await api.get("/api/admin/classes");
  return unwrapClassList(res.data);
}

/** POST /api/admin/classes */
export async function createClass(name: string): Promise<ClassItem> {
  const res = await api.post("/api/admin/classes", { name });
  return res.data;
}

/** POST /api/admin/sections */
export async function createSection(
  name: string,
  classId: number,
): Promise<SectionItem> {
  const res = await api.post("/api/admin/sections", { name, classId });
  return res.data;
}

/** GET /api/students/class/{className} */
export async function listStudentsByClass(
  className: string,
): Promise<StudentRow[]> {
  const res = await api.get(
    `/api/students/class/${encodeURIComponent(className)}`,
  );
  return unwrapStudentList(res.data);
}

/** GET /api/admin/sections/class/{classId} */
export async function listSectionsByClassId(
  classId: number,
): Promise<SectionItem[]> {
  const res = await api.get(`/api/admin/sections/class/${classId}`);
  return unwrapSectionList(res.data);
}

/** GET /api/students/class/id/{classId} */
export async function listStudentsByClassId(
  classId: number,
): Promise<StudentRow[]> {
  const res = await api.get(`/api/students/class/id/${classId}`);
  return unwrapStudentList(res.data);
}

/** GET /api/students/class/{classId}/section/{sectionId} */
export async function listStudentsByClassAndSectionId(
  classId: number,
  sectionId: number,
): Promise<StudentRow[]> {
  const res = await api.get(`/api/students/class/${classId}/section/${sectionId}`);
  return unwrapStudentList(res.data);
}
