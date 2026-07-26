import { api } from "@/lib/api/httpClient";

export type QuizQuestion = {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string; // "A", "B", "C", or "D"
};

export type QuizWriteBody = {
  title: string;
  topic: string;
  description: string;
  classId: number;
};

export type QuizRow = {
  id?: number | string;
  quizId?: number | string;
  title?: string;
  topic?: string;
  description?: string;
  classId?: number;
  status?: "DRAFT" | "PENDING" | "ACTIVE" | "COMPLETED" | string;
  questions?: QuizQuestion[];
};

export type QuizResult = {
  studentId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
};

export function getQuizId(row: QuizRow): string | null {
  const id = row.id ?? row.quizId;
  if (id == null || id === "") return null;
  return String(id);
}

export function questionCount(row: QuizRow): number {
  return Array.isArray(row.questions) ? row.questions.length : 0;
}

export function emptyQuestion(): QuizQuestion {
  return {
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  };
}

export function emptyQuizForm(): QuizWriteBody {
  return {
    title: "",
    topic: "",
    description: "",
    classId: 0,
  };
}

function unwrapQuizList(data: unknown): QuizRow[] {
  if (Array.isArray(data)) return data as QuizRow[];
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["data", "quizzes", "quizList", "records"]) {
      const v = o[key];
      if (Array.isArray(v)) return v as QuizRow[];
    }
  }
  return [];
}

function unwrapQuiz(data: unknown): QuizRow | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (o.quiz && typeof o.quiz === "object") return o.quiz as QuizRow;
  if (o.data && typeof o.data === "object") return unwrapQuiz(o.data);
  if ("title" in o || "questions" in o) return o as QuizRow;
  return null;
}

export async function listQuizzes(): Promise<QuizRow[]> {
  const res = await api.get("/api/quizzes");
  return unwrapQuizList(res.data);
}

export async function getQuiz(quizId: string): Promise<QuizRow> {
  const res = await api.get(`/api/quizzes/${quizId}`);
  const quiz = unwrapQuiz(res.data);
  if (!quiz) throw new Error("Quiz not found");
  return quiz;
}

export async function createQuiz(body: QuizWriteBody): Promise<QuizRow> {
  const res = await api.post("/api/quizzes", body);
  const quiz = unwrapQuiz(res.data);
  if (!quiz) return res.data as QuizRow;
  return quiz;
}

export async function updateQuizDraft(quizId: number | string, body: QuizWriteBody): Promise<QuizRow> {
  const res = await api.put(`/api/quizzes/${quizId}`, body);
  return res.data;
}

export async function deleteQuiz(quizId: number | string): Promise<void> {
  await api.delete(`/api/quizzes/${quizId}`);
}

export async function generateQuestions(topic: string, count: number): Promise<QuizQuestion[]> {
  const res = await api.post("/api/quizzes/generate-questions", { topic, count });
  return Array.isArray(res.data) ? res.data : (res.data.questions || []);
}

export async function saveQuizQuestions(quizId: number | string, questions: QuizQuestion[]): Promise<void> {
  await api.post(`/api/quizzes/${quizId}/questions`, questions);
}

export async function getQuizResults(quizId: string): Promise<QuizResult[]> {
  const res = await api.get(`/api/quizzes/${quizId}/results`);
  return Array.isArray(res.data) ? res.data : (res.data.results || []);
}

export async function requestActivation(quizId: number | string): Promise<void> {
  await api.put(`/api/quizzes/${quizId}/request-activation`);
}

export async function startQuiz(quizId: number | string): Promise<void> {
  await api.put(`/api/quizzes/${quizId}/start`);
}

export async function completeQuiz(quizId: number | string): Promise<void> {
  await api.put(`/api/quizzes/${quizId}/complete`);
}
