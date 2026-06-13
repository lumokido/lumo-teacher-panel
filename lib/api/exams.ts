import { api } from "@/lib/api/httpClient";

export type ExamSubject = {
  id: number;
  subject: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  maxMarks: number;
};

export type ExamRow = {
  id: number;
  schoolClass?: {
    id: number;
    name: string;
  } | null;
  examName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  subjects: ExamSubject[];
};

export type ExamWriteSubject = {
  subject: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  maxMarks: number;
};

export type ExamWriteBody = {
  classId?: number | null;
  examName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  subjects: ExamWriteSubject[];
};

export async function listAllExams(): Promise<ExamRow[]> {
  const res = await api.get("/api/exams/school");
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

export async function getExamById(id: number): Promise<ExamRow> {
  const res = await api.get(`/api/exams/${id}`);
  return res.data;
}

export async function updateExam(id: number, body: ExamWriteBody): Promise<ExamRow> {
  const res = await api.put(`/api/exams/${id}`, body);
  return res.data;
}

export async function deleteExam(id: number): Promise<void> {
  await api.delete(`/api/exams/${id}`);
}
