import { api } from "@/lib/api/httpClient";

export type SubjectMarkInput = {
  subject: string;
  marksObtained: number;
};

export type BulkMarkRequest = {
  studentId: string;
  examId: number;
  marks: SubjectMarkInput[];
};

export type SubjectMarkResponse = {
  subject: string;
  marksObtained: number;
  maxMarks: number;
};

export type ReportCardResponse = {
  studentId: string;
  examName: string;
  subjectMarks: SubjectMarkResponse[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  grade: string;
};

export async function saveBulkMarks(body: BulkMarkRequest): Promise<unknown> {
  const res = await api.post("/api/marks/bulk", body);
  return res.data;
}

export async function getReportCard(studentId: string, examId: number): Promise<ReportCardResponse> {
  const res = await api.get(`/api/marks/report-card/student/${studentId}/exam/${examId}`);
  return res.data;
}
