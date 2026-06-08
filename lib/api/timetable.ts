import { api } from "@/lib/api/httpClient";

export type TimetableEntry = {
  id?: number;
  schoolClass: {
    id: number;
    name: string;
  };
  section?: {
    id: number;
    name: string;
  } | null;
  day: string; // e.g. "Monday"
  period: number; // e.g. 1, 2, 3...
  subject: string;
  teacherId: number;
};

export type SaveTimetablePayload = {
  classId: number;
  sectionId?: number | null;
  day: string;
  period: number;
  subject: string;
  teacherId: number;
};

export async function saveTimetableEntry(payload: SaveTimetablePayload): Promise<TimetableEntry> {
  const res = await api.post("/api/timetable", payload);
  return res.data;
}

export async function getTimetableByClass(classId: number): Promise<TimetableEntry[]> {
  const res = await api.get(`/api/timetable/class/${classId}`);
  return res.data;
}

export async function getTimetableByClassAndSection(classId: number, sectionId: number): Promise<TimetableEntry[]> {
  const res = await api.get(`/api/timetable/class/${classId}/section/${sectionId}`);
  return res.data;
}
