import { api } from "@/lib/api/httpClient";

/**
 * Request/response shapes for admin teacher APIs.
 * List: GET `/api/admin/teachers` by default — set
 * `NEXT_PUBLIC_ADMIN_TEACHERS_LIST_PATH` if your server uses another path.
 */
export type AdminTeacherWriteBody = {
  success: boolean;
  emailId: string;
  passwordHash: string;
  name: string;
  mobileNumber: string;
  classTeacher: string;
  classes: string;
  subjects: string;
};

export type TeacherRow = {
  emailId?: string;
  name?: string;
  schoolName?: string;
  mobileNumber?: string;
  classTeacher?: string;
  classes?: string;
  subjects?: string;
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

export async function listTeachers(): Promise<TeacherRow[]> {
  const res = await api.get("/api/admin/get-all");
  return unwrapTeacherList(res.data);
}

export async function addTeacher(
  body: AdminTeacherWriteBody,
): Promise<unknown> {
  const res = await api.post("/api/admin/add-teacher", body);
  return res.data;
}

export async function updateTeacher(
  body: AdminTeacherWriteBody,
): Promise<unknown> {
  const res = await api.post("/api/admin/update-teacher", body);
  return res.data;
}
