import { api } from "@/lib/api/httpClient";

export type AdminTeacherWriteBody = {
  success: boolean;
  emailId: string;
  passwordHash: string;
  name: string;
  mobileNumber: string;
  classTeacher: string;
  classes: string | string[];
  subjects: string | string[];
};

export type TeacherRow = {
  id?: number;
  emailId?: string;
  name?: string;
  schoolName?: string;
  mobileNumber?: string;
  classTeacher?: string;
  classes?: string | string[];
  subjects?: string | string[];
};

export type PaginatedTeachers = {
  teachers: TeacherRow[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

function unwrapTeacherList(data: unknown): TeacherRow[] {
  if (Array.isArray(data)) return data as TeacherRow[];
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["data", "teachers", "teacherList", "records"]) {
      const v = o[key];
      if (Array.isArray(v)) return v as TeacherRow[];
    }
  }
  return [];
}

export function listTeachers(page: number, size: number): Promise<PaginatedTeachers>;
export function listTeachers(): Promise<TeacherRow[]>;
export async function listTeachers(page?: number, size?: number): Promise<TeacherRow[] | PaginatedTeachers> {
  const params: Record<string, number> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;

  const res = await api.get("/api/admin/get-all", { params });
  if (page !== undefined && size !== undefined && res.data && typeof res.data === "object" && "pageNumber" in res.data) {
    return res.data as PaginatedTeachers;
  }
  return unwrapTeacherList(res.data);
}

export async function addTeacher(
  body: AdminTeacherWriteBody,
): Promise<unknown> {
  const payload = {
    ...body,
    classes: typeof body.classes === "string" 
      ? body.classes.split(",").map(c => c.trim()).filter(Boolean) 
      : body.classes,
    subjects: typeof body.subjects === "string" 
      ? body.subjects.split(",").map(s => s.trim()).filter(Boolean) 
      : body.subjects,
  };
  const res = await api.post("/api/admin/add-teacher", payload);
  return res.data;
}

export async function updateTeacher(
  id: number,
  body: AdminTeacherWriteBody,
): Promise<unknown> {
  const payload = {
    ...body,
    classes: typeof body.classes === "string" 
      ? body.classes.split(",").map(c => c.trim()).filter(Boolean) 
      : body.classes,
    subjects: typeof body.subjects === "string" 
      ? body.subjects.split(",").map(s => s.trim()).filter(Boolean) 
      : body.subjects,
  };
  const res = await api.put(`/api/admin/update-teacher/${id}`, payload);
  return res.data;
}

export async function deleteTeacher(id: number): Promise<unknown> {
  const res = await api.delete(`/api/admin/delete-teacher/${id}`);
  return res.data;
}
