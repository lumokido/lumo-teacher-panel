import { api } from "@/lib/api/httpClient";

export type StudentWriteBody = {
  studentId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  mobileNumber: string;
  fatherName: string;
  motherName: string;
  fatherAadharNumber: string;
  motherAadharNumber: string;
  studentAadharNumber: string;
  dateOfBirth: string;
  gender: string;
  studentClass: string;
  sectionName?: string;
  profilePhotoUrl?: string | null;
};

export type StudentRow = {
  id?: number | string;
  studentId?: number | string;
  admissionId?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  mobileNumber?: string;
  fatherName?: string;
  motherName?: string;
  fatherAadharNumber?: string;
  motherAadharNumber?: string;
  studentAadharNumber?: string;
  parentName?: string;
  dateOfBirth?: string;
  gender?: string;
  studentClass?: string;
  sectionName?: string;
  rollNumber?: string;
  profilePhotoUrl?: string | null;
};

export function getStudentId(row: StudentRow | StudentDetailResponse): string | null {
  const id = row.id ?? row.studentId;
  if (id == null || id === "") return null;
  return String(id);
}

export function getAdmissionId(row: StudentRow): string | null {
  const id = row.admissionId;
  if (id == null || id === "") return null;
  return id;
}

export function studentDisplayName(row: StudentRow): string {
  const parts = [row.firstName, row.middleName, row.lastName].filter(Boolean);
  return parts.join(" ") || "—";
}

export function emptyStudentForm(): StudentWriteBody {
  return {
    studentId: "",
    firstName: "",
    lastName: "",
    middleName: "",
    mobileNumber: "",
    fatherName: "",
    motherName: "",
    fatherAadharNumber: "",
    motherAadharNumber: "",
    studentAadharNumber: "",
    dateOfBirth: "",
    gender: "MALE",
    studentClass: "",
    sectionName: "",
    profilePhotoUrl: "",
  };
}

export function rowToForm(row: StudentRow): StudentWriteBody {
  return {
    studentId: getAdmissionId(row) ?? "",
    firstName: row.firstName ?? "",
    lastName: row.lastName ?? "",
    middleName: row.middleName ?? "",
    mobileNumber: row.mobileNumber ?? "",
    fatherName: row.fatherName ?? row.parentName ?? "",
    motherName: row.motherName ?? "",
    fatherAadharNumber: row.fatherAadharNumber ?? "",
    motherAadharNumber: row.motherAadharNumber ?? "",
    studentAadharNumber: row.studentAadharNumber ?? "",
    dateOfBirth: row.dateOfBirth ?? "",
    gender: row.gender ?? "MALE",
    studentClass: row.studentClass ?? "",
    sectionName: row.sectionName ?? "",
    profilePhotoUrl: row.profilePhotoUrl ?? "",
  };
}

export type PaginatedStudents = {
  students: StudentRow[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

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

export function listStudents(page: number, size: number): Promise<PaginatedStudents>;
export function listStudents(): Promise<StudentRow[]>;
export async function listStudents(page?: number, size?: number): Promise<StudentRow[] | PaginatedStudents> {
  const params: Record<string, number> = {};
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;

  const res = await api.get("/api/admin/get-all-students", { params });
  if (page !== undefined && size !== undefined && res.data && typeof res.data === "object" && "pageNumber" in res.data) {
    return res.data as PaginatedStudents;
  }
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
  admissionId?: string;
  firstName: string;
  lastName: string;
  middleName: string;
  mobileNumber: string;
  fatherName?: string;
  motherName?: string;
  fatherAadharNumber?: string;
  motherAadharNumber?: string;
  studentAadharNumber?: string;
  parentName?: string;
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
