import { api } from "@/lib/api/httpClient";

export type QuizQuestion = {
  questionText: string;
  options: string[];
  correctAnswer: string;
};

export type QuizWriteBody = {
  title: string;
  subject: string;
  className: string;
  questions: QuizQuestion[];
};

export type QuizRow = {
  id?: number | string;
  quizId?: number | string;
  title?: string;
  subject?: string;
  className?: string;
  questions?: QuizQuestion[];
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
    options: ["", "", "", ""],
    correctAnswer: "",
  };
}

export function emptyQuizForm(): QuizWriteBody {
  return {
    title: "",
    subject: "",
    className: "",
    questions: [emptyQuestion(), emptyQuestion()],
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

export async function createQuiz(body: QuizWriteBody): Promise<unknown> {
  const res = await api.post("/api/quizzes", body);
  return res.data;
}
