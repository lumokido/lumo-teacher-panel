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
  useQuiz,
} from "@/hooks/useQuizzes";
import { useClassesList } from "@/hooks/useAdminClasses";
import { type QuizRow, getQuizId } from "@/lib/api/quizzes";
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
  CheckCircle2,
  Award,
  ShieldCheck,
} from "lucide-react";

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function PrincipalQuizzesPage() {
  const router = useRouter();
  const { data: quizzes = [], isLoading: quizzesLoading } = useQuizzesList();
  const { data: classes = [] } = useClassesList();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");

  // Modal states
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
      {/* Principal Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              Director / Principal Control
            </span>
          </div>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            Quiz Approval & Session Control
          </h2>
          <p className="mt-2 max-w-xl text-slate-600">
            Review teacher quiz submissions, activate sessions for student participation, and inspect live leaderboards.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-violet-100 bg-white p-5 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-violet-200 pl-10 pr-4 py-2 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-violet-300 bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 rounded-xl border border-violet-200 px-3 py-2 text-sm text-slate-700 bg-white">
            <SlidersHorizontal className="h-4 w-4 text-violet-600" />
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
          <Loader2 className="h-8 w-8 animate-spin text-violet-600 mb-3" />
          <p className="font-medium text-sm text-slate-500">Loading quiz catalogue...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/20 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-600">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h3 className="mt-4 font-montserrat text-lg font-bold text-slate-800">No Quizzes Available</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            There are currently no quiz submissions from teachers matching this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <PrincipalQuizCard
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
            />
          ))}
        </div>
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
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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

// Subcomponent: Principal Quiz Card
function PrincipalQuizCard({
  quiz,
  classes,
  onDelete,
  onViewResults,
  onViewDetails,
}: {
  quiz: QuizRow;
  classes: any[];
  onDelete: () => void;
  onViewResults: () => void;
  onViewDetails: () => void;
}) {
  const targetClass = classes.find((c) => String(c.id) === String(quiz.classId));
  const id = getQuizId(quiz);

  const startQuizMut = useStartQuiz();
  const completeQuizMut = useCompleteQuiz();

  const isCompleted = quiz.status === "COMPLETED" || quiz.status === "ENDED";
  const isActive = quiz.status === "ACTIVE" || quiz.status === "STARTED";
  const isPending = quiz.status === "PENDING" || quiz.status === "REQUESTED";

  return (
    <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-violet-200 transition-all duration-200 relative">
      <div>
        {/* Status Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-700 flex items-center gap-1">
              <School className="h-3.5 w-3.5" />
              {/* {targetClass ? targetClass.name : `Class ID: ${quiz.classId || "General"}`} */}
            </span>

            {/* Status Pill */}
            {isActive ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 flex items-center gap-1 animate-pulse">
                <Play className="h-3 w-3 fill-emerald-600" /> Active Session
              </span>
            ) : isPending ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-extrabold text-amber-900 border border-amber-300 animate-pulse">
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

          <button
            onClick={onDelete}
            className="text-slate-300 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50 cursor-pointer"
            title="Delete Quiz"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
        {/* Principal Controls: Activate / End Session */}
        <div className="flex items-center justify-between gap-2">
          {isActive ? (
            <button
              onClick={() => id && completeQuizMut.mutate(id)}
              disabled={completeQuizMut.isPending}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer shadow-xs"
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
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-md"
            >
              {startQuizMut.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-white" />
              )}
              {isPending ? "Approve & Start Quiz" : "Start / Activate Quiz"}
            </button>
          )}
        </div>

        {/* View Actions */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-1">
          <button
            onClick={onViewDetails}
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-violet-600 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 text-violet-500" />
            {Array.isArray(quiz.questions) ? quiz.questions.length : 0} Questions
          </button>

          <button
            onClick={onViewResults}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors cursor-pointer"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            View Results
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
              <p className="text-xs font-bold text-violet-600 uppercase tracking-wider">Quiz Inspector</p>
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
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
          ) : !quiz ? (
            <p className="text-center text-sm text-slate-500 py-8">Could not load quiz details.</p>
          ) : (
            <div className="space-y-6 overflow-y-auto flex-1 pr-1">
              <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase">Topic:</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{quiz.topic || "General"}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase">Target Class ID:</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{quiz.classId || "—"}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-slate-500 uppercase">Description:</span>
                  <p className="text-slate-700 text-sm mt-0.5">{quiz.description || "No description provided."}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-montserrat text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Questions & Answers Key ({quiz.questions?.length || 0})
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
              <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
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
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 hover:bg-violet-50/50 transition-colors"
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
                      <span className="font-bold text-violet-700 text-sm block">
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
