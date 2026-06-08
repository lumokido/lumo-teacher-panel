import { api } from "@/lib/api/httpClient";

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
  studentId: number;
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
  studentId: number;
  studentRegistrationId: string;
  studentName: string;
  className: string;
  status: string;
};

export async function markClassAttendance(
  payload: MarkAttendancePayload,
): Promise<{ success: boolean; message?: string }> {
  const res = await api.post("/api/attendance/class", payload);
  return res.data;
}

export async function getStudentAttendanceHistory(
  studentId: string,
): Promise<AttendanceRecord[]> {
  const res = await api.get(`/api/attendance/student/${encodeURIComponent(studentId)}`);
  return res.data;
}

export async function getAttendanceStats(date?: string): Promise<AttendanceStats> {
  const url = date ? `/api/attendance/stats?date=${encodeURIComponent(date)}` : "/api/attendance/stats";
  const res = await api.get(url);
  return res.data;
}

export async function getAttendanceHistory(date?: string): Promise<AttendanceHistoryItem[]> {
  const url = date ? `/api/attendance/history/date?date=${encodeURIComponent(date)}` : "/api/attendance/history/date";
  const res = await api.get(url);
  return res.data;
}
