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
  period?: number | null; // e.g. 1, 2, 3... (null for breaks)
  subject?: string | null;
  teacherId?: number | null;
  type?: string;
  startTime?: string | null; // "HH:mm:ss"
  endTime?: string | null;   // "HH:mm:ss"
};

export type SaveTimetablePayload = {
  classId: number;
  sectionId?: number | null;
  day: string;
  period?: number | null;
  subject?: string | null;
  teacherId?: number | null;
  type?: string;
  startTime?: string | null; // "HH:mm:ss" or "HH:mm"
  endTime?: string | null;   // "HH:mm:ss" or "HH:mm"
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
