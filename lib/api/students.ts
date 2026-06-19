import { api } from "@/lib/api/httpClient";

export type StudentWriteBody = {
  firstName: string;
  lastName: string;
  middleName: string;
  mobileNumber: string;
  parentName: string;
  dateOfBirth: string;
  gender: string;
  studentClass: string;
  sectionName?: string;
  rollNumber?: string;
  profilePhotoUrl?: string | null;
};

export type StudentRow = StudentWriteBody & {
  id?: number | string;
  studentId?: number | string;
};

export function getStudentId(row: StudentRow | StudentDetailResponse): string | null {
  const id = row.id ?? row.studentId;
  if (id == null || id === "") return null;
  return String(id);
}

export function studentDisplayName(row: StudentRow): string {
  const parts = [row.firstName, row.middleName, row.lastName].filter(Boolean);
  return parts.join(" ") || "—";
}

export function emptyStudentForm(): StudentWriteBody {
  return {
    firstName: "",
    lastName: "",
    middleName: "",
    mobileNumber: "",
    parentName: "",
    dateOfBirth: "",
    gender: "Male",
    studentClass: "",
    sectionName: "",
    rollNumber: "",
    profilePhotoUrl: "",
  };
}

export function rowToForm(row: StudentRow): StudentWriteBody {
  return {
    firstName: row.firstName ?? "",
    lastName: row.lastName ?? "",
    middleName: row.middleName ?? "",
    mobileNumber: row.mobileNumber ?? "",
    parentName: row.parentName ?? "",
    dateOfBirth: row.dateOfBirth ?? "",
    gender: row.gender ?? "Male",
    studentClass: row.studentClass ?? "",
    sectionName: row.sectionName ?? "",
    rollNumber: row.rollNumber ?? "",
    profilePhotoUrl: row.profilePhotoUrl ?? "",
  };
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

export async function listStudents(): Promise<StudentRow[]> {
  const res = await api.get("/api/admin/get-all-students");
  return unwrapStudentList(res.data);
}

export async function addStudent(body: StudentWriteBody): Promise<unknown> {
  const res = await api.post("/api/students/add", body);
  return res.data;
}

export async function updateStudent(
  studentId: string,
  body: StudentWriteBody,
): Promise<unknown> {
  const res = await api.put(`/api/students/${studentId}`, body);
  return res.data;
}

export type StudentDetailResponse = {
  id?: number | string;
  studentId?: number | string;
  firstName: string;
  lastName: string;
  middleName: string;
  mobileNumber: string;
  parentName: string;
  dateOfBirth: string;
  gender: string;
  studentClass: string;
  teacherId?: number;
  teacherName?: string;
  teacherEmail?: string;
  teacherMobile?: string;
  profilePhotoUrl?: string | null;
};

export async function getStudentDetails(id: string): Promise<StudentDetailResponse> {
  const res = await api.get(`/api/students/${id}`);
  return res.data;
}

export async function uploadStudentPhoto(
  studentIdOrStudentIdentifier: string,
  file: File,
): Promise<{ success: boolean; message: string; profilePhotoUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(
    `/api/students/${encodeURIComponent(studentIdOrStudentIdentifier)}/photo`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
}
