import { api } from "@/lib/api/httpClient";

export type AssignmentRow = {
  id: number;
  schoolClass: {
    id: number;
    name: string;
  };
  section?: {
    id: number;
    name: string;
  } | null;
  type: string; // e.g. "HOMEWORK"
  title: string;
  description: string;
  imageUrl?: string | null;
  dueDate: string; // YYYY-MM-DD
  assignedDate?: string; // YYYY-MM-DD
  createdBy: string;
};

export type AssignmentWriteBody = {
  classId: number;
  sectionId?: number | null;
  type: string; // "HOMEWORK"
  title: string;
  description: string;
  imageUrl?: string | null;
  dueDate: string; // YYYY-MM-DD
  assignedDate?: string; // YYYY-MM-DD
  createdBy?: string;
};

export async function createAssignment(body: AssignmentWriteBody): Promise<AssignmentRow> {
  const res = await api.post("/api/assignments", body);
  return res.data;
}

export async function listAssignmentsByClass(classId: number): Promise<AssignmentRow[]> {
  const res = await api.get(`/api/assignments/class/${classId}`);
  return res.data;
}

export async function listAssignmentsByClassAndSection(
  classId: number,
  sectionId: number
): Promise<AssignmentRow[]> {
  const res = await api.get(`/api/assignments/class/${classId}/section/${sectionId}`);
  return res.data;
}

export async function listMyAssignments(): Promise<AssignmentRow[]> {
  const res = await api.get("/api/assignments/my-assignments");
  return res.data;
}

export async function createAssignmentsBulk(body: AssignmentWriteBody[]): Promise<AssignmentRow[]> {
  const res = await api.post("/api/assignments/bulk", body);
  return res.data;
}

export async function getAssignmentsByDateAndClass(
  date: string,
  classId: number
): Promise<AssignmentRow[]> {
  const res = await api.get("/api/assignments/history/date", {
    params: { date, classId },
  });
  return res.data;
}


