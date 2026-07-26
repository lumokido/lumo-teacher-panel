"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  useQuizzesList,
  useDeleteQuiz,
  useQuizResults,
  useStartQuiz,
  useCompleteQuiz,
  useRequestActivation,
  useQuiz,
} from "@/hooks/useQuizzes";
import { useClassesList } from "@/hooks/useAdminClasses";
import { type QuizRow, type QuizQuestion, getQuizId } from "@/lib/api/quizzes";
import {
  Plus,
  BrainCircuit,
  School,
  Trophy,
  Trash2,
  Edit3,
  Search,
  SlidersHorizontal,
  X,
  ChevronRight,
  HelpCircle,
  Loader2,
  AlertTriangle,
  Play,
  StopCircle,
  Eye,
  Send,
  Award,
} from "lucide-react";
import Link from "next/link";

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function QuizzesPage() {
  const router = useRouter();
  const { data: quizzes = [], isLoading: quizzesLoading } = useQuizzesList();
  const { data: classes = [] } = useClassesList();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");

  // Modal states
  const [isChoiceDialogOpen, setIsChoiceDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<QuizRow | null>(null);
  const [resultsQuizId, setResultsQuizId] = useState<string | null>(null);
  const [viewDetailQuizId, setViewDetailQuizId] = useState<string | null>(null);

  const deleteQuizMut = useDeleteQuiz();

  // Filtered Quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchesSearch =
        (q.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.topic || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass =
        selectedClassFilter === "ALL" || String(q.classId) === selectedClassFilter;
      return matchesSearch && matchesClass;
    });
  }, [quizzes, searchQuery, selectedClassFilter]);

  function handleConfirmDelete() {
    if (!quizToDelete) return;
    const id = getQuizId(quizToDelete);
    if (id) {
      deleteQuizMut.mutate(id, {
        onSuccess: () => setQuizToDelete(null),
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Clean Native Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-sky-600">Quizzes</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            Quizzes Center
          </h2>
          <p className="mt-2 max-w-xl text-slate-600">
            Create drafts, auto-generate with AI, manage questions, activate sessions, and view student leaderboards.
          </p>
        </div>

        <button
          onClick={() => setIsChoiceDialogOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-sky-700 active:scale-[0.98] transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Create quiz</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-sky-100 bg-white p-5 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-sky-200 pl-10 pr-4 py-2 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-sky-300 bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 rounded-xl border border-sky-200 px-3 py-2 text-sm text-slate-700 bg-white">
            <SlidersHorizontal className="h-4 w-4 text-sky-600" />
            <span className="font-semibold text-xs uppercase tracking-wider text-slate-500">Class:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={String(cls.id)}>
                  {cls.name} (ID: {cls.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quizzes List Grid */}
      {quizzesLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600 mb-3" />
          <p className="font-medium text-sm text-slate-500">Loading quizzes...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/20 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-600">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h3 className="mt-4 font-montserrat text-lg font-bold text-slate-800">No Quizzes Found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            There are no quizzes matching your criteria. Click below to create a new quiz.
          </p>
          <button
            onClick={() => setIsChoiceDialogOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-sky-700 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={getQuizId(quiz) || Math.random()}
              quiz={quiz}
              classes={classes}
              onDelete={() => setQuizToDelete(quiz)}
              onViewResults={() => {
                const id = getQuizId(quiz);
                if (id) setResultsQuizId(id);
              }}
              onViewDetails={() => {
                const id = getQuizId(quiz);
                if (id) setViewDetailQuizId(id);
              }}
              onEdit={() => {
                const id = getQuizId(quiz);
                if (id) router.push(`/assignments/${id}/edit`);
              }}
            />
          ))}
        </div>
      )}

      {/* CREATION MODE CHOICE DIALOG */}
      {isChoiceDialogOpen && (
        <Portal>
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 border border-sky-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <div>
                  <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">Create Quiz</p>
                  <h2 className="font-montserrat text-xl font-bold text-slate-900 mt-0.5">Choose Method</h2>
                </div>
                <button
                  onClick={() => setIsChoiceDialogOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-slate-600">
                Select how you want to build this quiz for your students.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* AI Option */}
                <button
                  onClick={() => {
                    setIsChoiceDialogOpen(false);
                    router.push("/quizzes/create/ai");
                  }}
                  className="group flex flex-col justify-between rounded-xl border border-sky-100 bg-sky-50/40 p-5 text-left hover:border-sky-400 hover:bg-sky-50 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 font-montserrat text-base font-bold text-slate-900 group-hover:text-sky-700">
                      AI Auto-Generator
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Auto-generate questions instantly based on your topic.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-sky-600">
                    <span>Start AI</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Manual Option */}
                <button
                  onClick={() => {
                    setIsChoiceDialogOpen(false);
                    router.push("/quizzes/create/manual");
                  }}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-5 text-left hover:border-sky-400 hover:bg-sky-50 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700 text-white shadow-sm">
                      <Edit3 className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 font-montserrat text-base font-bold text-slate-900 group-hover:text-sky-700">
                      Manual Builder
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Write custom questions and options step-by-step.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-600 group-hover:text-sky-600">
                    <span>Start Manual</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {quizToDelete && (
        <Portal>
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-6 text-center border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div>
                <h2 className="font-montserrat text-xl font-bold text-slate-900">Delete Quiz?</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Are you sure you want to delete <span className="font-bold text-slate-800">&quot;{quizToDelete.title}&quot;</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setQuizToDelete(null)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteQuizMut.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {deleteQuizMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Quiz"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* VIEW QUIZ DETAILS MODAL */}
      {viewDetailQuizId && (
        <ViewQuizDetailModal quizId={viewDetailQuizId} onClose={() => setViewDetailQuizId(null)} />
      )}

      {/* RESULTS / LEADERBOARD MODAL */}
      {resultsQuizId && (
        <ResultsModal quizId={resultsQuizId} onClose={() => setResultsQuizId(null)} />
      )}
    </div>
  );
}

// Subcomponent: Quiz Card
function QuizCard({
  quiz,
  classes,
  onDelete,
  onViewResults,
  onViewDetails,
  onEdit,
}: {
  quiz: QuizRow;
  classes: any[];
  onDelete: () => void;
  onViewResults: () => void;
  onViewDetails: () => void;
  onEdit: () => void;
}) {
  const targetClass = classes.find((c) => String(c.id) === String(quiz.classId));
  const id = getQuizId(quiz);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role =
      (typeof window !== "undefined" && sessionStorage.getItem("type")) ||
      (typeof window !== "undefined" && localStorage.getItem("role"));
    setIsAdmin(role === "principal" || role === "admin");
  }, []);

  const startQuizMut = useStartQuiz();
  const completeQuizMut = useCompleteQuiz();
  const requestActivationMut = useRequestActivation();

  const isCompleted = quiz.status === "COMPLETED" || quiz.status === "ENDED";
  const isActive = quiz.status === "ACTIVE" || quiz.status === "STARTED";
  const isPending = quiz.status === "PENDING" || quiz.status === "REQUESTED";

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-sky-200 transition-all duration-200 relative">
      <div>
        {/* Status Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 flex items-center gap-1">
              <School className="h-3.5 w-3.5" />
              {targetClass ? targetClass.name : `Class ID: ${quiz.classId || "General"}`}
            </span>

            {/* Status Pill */}
            {isActive ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 flex items-center gap-1 animate-pulse">
                <Play className="h-3 w-3 fill-emerald-600" /> Active Session
              </span>
            ) : isPending ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                Pending Approval
              </span>
            ) : isCompleted ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                Completed
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                Draft
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="text-slate-400 hover:text-sky-600 transition-colors p-1 rounded-md hover:bg-sky-50 cursor-pointer"
              title="Edit Quiz"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50 cursor-pointer"
              title="Delete Quiz"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h3 className="font-montserrat text-lg font-bold text-slate-900">
          {quiz.title || "Untitled Quiz"}
        </h3>
        <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Topic: {quiz.topic || "General"}
        </p>

        <p className="mt-3 text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {quiz.description || "No description provided."}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-50 space-y-3">
        {/* Controls: Start/End Quiz (Principal) or Request Activation (Teacher) */}
        {isAdmin ? (
          <div className="flex items-center justify-between gap-2">
            {isActive ? (
              <button
                onClick={() => id && completeQuizMut.mutate(id)}
                disabled={completeQuizMut.isPending}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                {completeQuizMut.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <StopCircle className="h-3.5 w-3.5" />
                )}
                End Quiz Session
              </button>
            ) : (
              <button
                onClick={() => id && startQuizMut.mutate(id)}
                disabled={startQuizMut.isPending}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm"
              >
                {startQuizMut.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-white" />
                )}
                Approve & Start Quiz
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs py-1">
            {isActive ? (
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Session Active (Students Playing)
              </span>
            ) : isPending ? (
              <span className="font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Pending Principal Approval
              </span>
            ) : isCompleted ? (
              <span className="font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                Session Completed
              </span>
            ) : (
              <button
                onClick={() => id && requestActivationMut.mutate(id)}
                disabled={requestActivationMut.isPending}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer"
              >
                {requestActivationMut.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 text-sky-600" />
                )}
                Submit for Approval
              </button>
            )}
          </div>
        )}

        {/* View Actions */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-1">
          <button
            onClick={onViewDetails}
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-600 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 text-sky-500" />
            {Array.isArray(quiz.questions) ? quiz.questions.length : 0} Questions
          </button>

          <button
            onClick={onViewResults}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: View Quiz Detail Modal (Questions & Answers)
function ViewQuizDetailModal({ quizId, onClose }: { quizId: string; onClose: () => void }) {
  const { data: quiz, isLoading } = useQuiz(quizId);

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between border-b pb-4 border-slate-100 shrink-0">
            <div>
              <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">Quiz Details</p>
              <h2 className="font-montserrat text-xl font-bold text-slate-900 mt-0.5">
                {isLoading ? "Loading..." : quiz?.title || "Quiz Preview"}
              </h2>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            </div>
          ) : !quiz ? (
            <p className="text-center text-sm text-slate-500 py-8">Could not load quiz details.</p>
          ) : (
            <div className="space-y-6 overflow-y-auto flex-1 pr-1">
              <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase">Topic:</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{quiz.topic || "General"}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase">Class ID:</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{quiz.classId || "—"}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-slate-500 uppercase">Description:</span>
                  <p className="text-slate-700 text-sm mt-0.5">{quiz.description || "No description provided."}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-montserrat text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Questions & Answers ({quiz.questions?.length || 0})
                </h3>

                {(!quiz.questions || quiz.questions.length === 0) ? (
                  <p className="text-sm text-slate-500">No questions saved for this quiz.</p>
                ) : (
                  quiz.questions.map((q, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                      <p className="font-semibold text-slate-900 text-sm">
                        {idx + 1}. {q.questionText}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className={`p-2.5 rounded-lg border font-medium ${q.correctAnswer === "A" ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold" : "bg-white border-slate-200 text-slate-700"}`}>
                          A. {q.optionA} {q.correctAnswer === "A" && "✓ (Correct)"}
                        </div>
                        <div className={`p-2.5 rounded-lg border font-medium ${q.correctAnswer === "B" ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold" : "bg-white border-slate-200 text-slate-700"}`}>
                          B. {q.optionB} {q.correctAnswer === "B" && "✓ (Correct)"}
                        </div>
                        <div className={`p-2.5 rounded-lg border font-medium ${q.correctAnswer === "C" ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold" : "bg-white border-slate-200 text-slate-700"}`}>
                          C. {q.optionC} {q.correctAnswer === "C" && "✓ (Correct)"}
                        </div>
                        <div className={`p-2.5 rounded-lg border font-medium ${q.correctAnswer === "D" ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold" : "bg-white border-slate-200 text-slate-700"}`}>
                          D. {q.optionD} {q.correctAnswer === "D" && "✓ (Correct)"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100 shrink-0">
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

// Subcomponent: Results / Leaderboard Modal
function ResultsModal({ quizId, onClose }: { quizId: string; onClose: () => void }) {
  const { data: results = [], isLoading } = useQuizResults(quizId);

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b pb-4 border-slate-100">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              <div>
                <h2 className="font-montserrat text-lg font-bold text-slate-900">Quiz Leaderboard</h2>
                <p className="text-xs text-slate-500">Live student scores sorted by performance</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Award className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No Submissions Recorded</p>
              <p className="text-xs text-slate-500">Students have not completed this quiz session yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {results.map((res, i) => {
                const percentage = Math.round((res.score / (res.totalQuestions || 1)) * 100);
                return (
                  <div
                    key={res.studentId}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 hover:bg-sky-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${
                        i === 0 ? "bg-amber-100 text-amber-800 ring-2 ring-amber-300" :
                        i === 1 ? "bg-slate-200 text-slate-700" :
                        i === 2 ? "bg-amber-800/10 text-amber-900" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        #{i + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-800 text-sm block">{res.studentName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">ID: {res.studentId}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sky-700 text-sm block">
                        {res.score} / {res.totalQuestions}
                      </span>
                      <span className={`text-[10px] font-bold ${percentage >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
                        {percentage}% Score
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
