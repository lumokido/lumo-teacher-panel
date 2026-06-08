import { api } from "@/lib/api/httpClient";

export type ExamRow = {
  id: number;
  schoolClass?: {
    id: number;
    name: string;
  } | null;
  subject: string;
  examName: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
};

export type ExamWriteBody = {
  classId?: number | null;
  subject: string;
  examName: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
};

export async function listAllExams(): Promise<ExamRow[]> {
  const res = await api.get("/api/exams");
  return res.data;
}

export async function listSchoolExams(): Promise<ExamRow[]> {
  const res = await api.get("/api/exams/school");
  return res.data;
}

export async function listExamsByClass(classId: number): Promise<ExamRow[]> {
  const res = await api.get(`/api/exams/class/${classId}`);
  return res.data;
}

export async function createExam(body: ExamWriteBody): Promise<ExamRow> {
  const res = await api.post("/api/exams", body);
  return res.data;
}
