"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateQuiz, useGenerateQuestions, useSaveQuestions } from "@/hooks/useQuizzes";
import { useClassesList } from "@/hooks/useAdminClasses";
import { type QuizQuestion, emptyQuestion, getQuizId } from "@/lib/api/quizzes";
import { Sparkles, ArrowLeft, BrainCircuit, Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CreateAiQuizPage() {
  const router = useRouter();
  const { data: classes = [], isLoading: classesLoading } = useClassesList();

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [aiCount, setAiCount] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const createQuizMut = useCreateQuiz();
  const generateAiMut = useGenerateQuestions();
  const saveQuestionsMut = useSaveQuestions();

  async function handleGenerateAI() {
    if (!topic.trim()) {
      toast.error("Please enter a topic first!");
      return;
    }
    try {
      const generated = await generateAiMut.mutateAsync({ topic, count: aiCount });
      if (generated && generated.length > 0) {
        setQuestions(generated);
        toast.success(`Generated ${generated.length} AI questions!`);
      }
    } catch {
      // Handled by mutation toast
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClassId) {
      toast.error("Please select a target class!");
      return;
    }
    if (questions.length === 0) {
      toast.error("Please generate or add at least one question!");
      return;
    }

    try {
      const created = await createQuizMut.mutateAsync({
        title,
        topic,
        description,
        classId: Number(selectedClassId),
      });

      const qId = getQuizId(created);
      if (qId && questions.length > 0) {
        await saveQuestionsMut.mutateAsync({ id: qId, questions });
      }

      toast.success("Quiz published successfully!");
      router.push("/quizzes");
    } catch {
      // Handled by mutation toast
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/quizzes"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> AI Generator
            </span>
          </div>
          <h1 className="font-montserrat text-2xl font-extrabold text-slate-900 mt-1">
            Create Quiz with AI
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Quiz Details */}
        <div className="rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="font-montserrat text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold">1</span>
            Quiz Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quiz Title</label>
              <input
                type="text"
                required
                placeholder="e.g. World War II History Quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Topic</label>
              <input
                type="text"
                required
                placeholder="e.g. World War II"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Class (Select Tag)</label>
              <select
                required
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all bg-white cursor-pointer"
              >
                <option value="" disabled>
                  Select a Class...
                </option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} (Class ID: {cls.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</label>
              <textarea
                rows={2}
                placeholder="Brief summary of what this quiz covers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Step 2: AI Generation Controls */}
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-md">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-montserrat text-lg font-bold text-slate-900">Generate Questions with AI</h2>
                <p className="text-xs text-slate-500">Generates MCQs using OpenRouter AI based on your topic.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="text-[10px] font-bold text-indigo-900 uppercase">Count</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                  className="w-20 rounded-xl border border-indigo-200 px-3 py-2 text-sm font-bold bg-white text-center"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={generateAiMut.isPending || !topic}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
              >
                {generateAiMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-amber-300" />
                )}
                Auto-Generate
              </button>
            </div>
          </div>

          {/* Generated Questions Edit List */}
          {questions.length > 0 && (
            <div className="space-y-4 border-t pt-6 border-indigo-100">
              <div className="flex items-center justify-between">
                <h3 className="font-montserrat text-base font-bold text-slate-900">
                  Review & Edit Questions ({questions.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setQuestions([...questions, emptyQuestion()])}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  + Add Extra Question
                </button>
              </div>

              {questions.map((q, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Question {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Question text..."
                    value={q.questionText}
                    onChange={(e) => {
                      const copy = [...questions];
                      copy[idx].questionText = e.target.value;
                      setQuestions(copy);
                    }}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium outline-none focus:border-indigo-500"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Option A</label>
                      <input
                        type="text"
                        required
                        value={q.optionA}
                        onChange={(e) => {
                          const copy = [...questions];
                          copy[idx].optionA = e.target.value;
                          setQuestions(copy);
                        }}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Option B</label>
                      <input
                        type="text"
                        required
                        value={q.optionB}
                        onChange={(e) => {
                          const copy = [...questions];
                          copy[idx].optionB = e.target.value;
                          setQuestions(copy);
                        }}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Option C</label>
                      <input
                        type="text"
                        required
                        value={q.optionC}
                        onChange={(e) => {
                          const copy = [...questions];
                          copy[idx].optionC = e.target.value;
                          setQuestions(copy);
                        }}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Option D</label>
                      <input
                        type="text"
                        required
                        value={q.optionD}
                        onChange={(e) => {
                          const copy = [...questions];
                          copy[idx].optionD = e.target.value;
                          setQuestions(copy);
                        }}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs font-semibold text-slate-600">Correct Answer:</span>
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => {
                        const copy = [...questions];
                        copy[idx].correctAnswer = e.target.value;
                        setQuestions(copy);
                      }}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold bg-white text-slate-800"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/quizzes"
            className="rounded-xl px-6 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createQuizMut.isPending || saveQuestionsMut.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-8 py-3.5 text-base font-bold text-white shadow-xl hover:bg-sky-700 active:scale-95 transition-all cursor-pointer"
          >
            {createQuizMut.isPending || saveQuestionsMut.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
            Publish Quiz
          </button>
        </div>
      </form>
    </div>
  );
}
