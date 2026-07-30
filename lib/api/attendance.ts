import { api } from "@/lib/api/httpClient";
import type { StudentRow } from "@/lib/api/students";
import { getAdmissionId, getStudentId } from "@/lib/api/students";

export type MarkAttendancePayload = {
  classId: number;
  sectionId?: number;
  date?: string; // YYYY-MM-DD
  absentStudentIds: string[];
};

export type AttendanceRecord = {
  id: number;
  date: string;
  status: string; // e.g. "PRESENT", "ABSENT"
  studentId: number | string;
  classId: number;
  sectionId?: number;
};

export type AttendanceStats = {
  date: string;
  totalStudentsInSchool: number;
  totalStudentsMarked: number;
  totalPresent: number;
  totalAbsent: number;
};

export type AttendanceHistoryItem = {
  studentId: number | string;
  studentRegistrationId?: string | null;
  studentName: string;
  className: string;
  status: string;
};

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["data", "history", "records", "attendance", "content", "items"]) {
      const v = o[key];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

function unwrapObject<T extends object>(data: unknown): T {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const o = data as Record<string, unknown>;
    if (o.data && typeof o.data === "object" && !Array.isArray(o.data)) {
      return o.data as T;
    }
    return data as T;
  }
  return data as T;
}

/** Match a history row to a student by DB id, studentId, or registration/admission id. */
export function findStudentAttendance(
  history: AttendanceHistoryItem[],
  student: StudentRow,
): AttendanceHistoryItem | undefined {
  const id = getStudentId(student);
  const admissionId = getAdmissionId(student);
  const candidates = [
    id,
    admissionId,
    student.studentId != null ? String(student.studentId) : null,
  ].filter((v): v is string => !!v);

  return history.find((h) => {
    const hid = h.studentId != null ? String(h.studentId) : null;
    const reg = h.studentRegistrationId != null ? String(h.studentRegistrationId) : null;
    return candidates.some((c) => c === hid || c === reg);
  });
}

/**
 * Daily default is PRESENT. Only ABSENT from saved history overrides that.
 */
export function attendanceStatusFromHistory(
  history: AttendanceHistoryItem[],
  student: StudentRow,
): "PRESENT" | "ABSENT" {
  const status = findStudentAttendance(history, student)?.status?.toUpperCase();
  return status === "ABSENT" ? "ABSENT" : "PRESENT";
}

export async function markClassAttendance(
  payload: MarkAttendancePayload,
): Promise<{ success: boolean; message?: string }> {
  const res = await api.post("/api/attendance/class", payload);
  return unwrapObject(res.data);
}

export async function getStudentAttendanceHistory(
  studentId: string,
): Promise<AttendanceRecord[]> {
  const res = await api.get(`/api/attendance/student/${encodeURIComponent(studentId)}`);
  return unwrapList<AttendanceRecord>(res.data);
}

export async function getAttendanceStats(date?: string): Promise<AttendanceStats> {
  const url = date ? `/api/attendance/stats?date=${encodeURIComponent(date)}` : "/api/attendance/stats";
  const res = await api.get(url);
  return unwrapObject<AttendanceStats>(res.data);
}

export async function getAttendanceHistory(date?: string): Promise<AttendanceHistoryItem[]> {
  const url = date ? `/api/attendance/history/date?date=${encodeURIComponent(date)}` : "/api/attendance/history/date";
  const res = await api.get(url);
  return unwrapList<AttendanceHistoryItem>(res.data);
}

export type HomeroomStats = {
  date: string;
  totalStudents: number;
  totalMarked: number;
  totalPresent: number;
  totalAbsent: number;
};

export async function getMyHomeroomStats(date?: string): Promise<HomeroomStats> {
  const url = date ? `/api/attendance/my-homeroom-stats?date=${encodeURIComponent(date)}` : "/api/attendance/my-homeroom-stats";
  const res = await api.get(url);
  return unwrapObject<HomeroomStats>(res.data);
}
