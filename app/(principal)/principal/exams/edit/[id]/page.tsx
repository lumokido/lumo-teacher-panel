"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useClassesList } from "@/hooks/useAdminClasses";
import { useExamById, useUpdateExam } from "@/hooks/useExams";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Calendar, Clock, Plus, Trash2, ArrowLeft } from "lucide-react";

type ExamPaper = {
  id: string;
  subject: string;
  examDate: string;
  startTime: string;
  endTime: string;
  maxMarks: number;
};

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Science",
  "English",
  "Social Studies",
  "Physical Education",
  "Art",
  "Music",
  "Computer Science",
  "Foreign Language",
  "Library"
];

function EditExamContent({ examId }: { examId: number }) {
  const router = useRouter();
  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  const { data: exam, isLoading: examLoading, isError: examError } = useExamById(examId);
  const updateMut = useUpdateExam();

  // Series details
  const [examName, setExamName] = useState("");
  const [scope, setScope] = useState<"SCHOOL" | "CLASS">("SCHOOL");
  const [classId, setClassId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Exam papers details
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-populate form when exam details are loaded
  useEffect(() => {
    if (exam) {
      setExamName(exam.examName);
      setScope(exam.schoolClass ? "CLASS" : "SCHOOL");
      setClassId(exam.schoolClass ? String(exam.schoolClass.id) : "");
      setStartDate(exam.startDate);
      setEndDate(exam.endDate);
      setPapers(
        exam.subjects.map((p) => ({
          id: String(p.id || Math.random()),
          subject: p.subject,
          examDate: p.examDate,
          startTime: p.startTime.slice(0, 5),
          endTime: p.endTime.slice(0, 5),
          maxMarks: p.maxMarks || 100,
        }))
      );
    }
  }, [exam]);

  function handleAddPaper() {
    const defaultDate = papers[papers.length - 1]?.examDate || startDate || "";
    setPapers((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        subject: "",
        examDate: defaultDate,
        startTime: "09:00",
        endTime: "12:00",
        maxMarks: 100
      }
    ]);
  }

  function handleRemovePaper(index: number) {
    if (papers.length <= 1) return;
    setPapers((prev) => prev.filter((_, idx) => idx !== index));
  }

  function updatePaper(index: number, fields: Partial<ExamPaper>) {
    setPapers((prev) => prev.map((p, idx) => idx === index ? { ...p, ...fields } : p));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!examName.trim()) {
      toast.error("Please enter the exam series name");
      return;
    }

    if (scope === "CLASS" && !classId) {
      toast.error("Please select a target class");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (startDate > endDate) {
      toast.error("Start Date cannot be after End Date");
      return;
    }

    // Validate papers
    for (let i = 0; i < papers.length; i++) {
      const p = papers[i];
      if (!p.subject.trim() || !p.examDate || !p.startTime || !p.endTime || p.maxMarks === undefined || p.maxMarks <= 0) {
        toast.error(`Please fill in all details for exam paper #${i + 1} (Maximum Marks must be greater than 0)`);
        return;
      }

      if (p.examDate < startDate || p.examDate > endDate) {
        toast.error(`Exam Date for paper #${i + 1} (${p.subject}) must be between ${startDate} and ${endDate}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payloadSubjects = papers.map((p) => {
        const formattedStartTime = p.startTime.length === 5 ? `${p.startTime}:00` : p.startTime;
        const formattedEndTime = p.endTime.length === 5 ? `${p.endTime}:00` : p.endTime;
        return {
          subject: p.subject.trim(),
          examDate: p.examDate,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          maxMarks: p.maxMarks,
        };
      });

      await updateMut.mutateAsync({
        id: examId,
        body: {
          examName: examName.trim(),
          startDate,
          endDate,
          classId: scope === "CLASS" ? parseInt(classId, 10) : null,
          subjects: payloadSubjects,
        },
      });

      toast.success("Exam series updated successfully!");
      router.push("/principal/exams");
    } catch {
      // Errors are handled by the hook wrapper
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLoading = classesLoading || examLoading || isSubmitting;

  if (examLoading || classesLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-violet-100 bg-white">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-violet-600" />
          Loading exam details...
        </div>
      </div>
    );
  }

  if (examError || !exam) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center space-y-4 max-w-md mx-auto mt-12">
        <p className="text-rose-800 font-semibold">Could not load exam details</p>
        <button
          type="button"
          onClick={() => router.push("/principal/exams")}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition cursor-pointer"
        >
          Back to Exams
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push("/principal/exams")}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 transition hover:text-violet-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Exams
        </button>
        <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
          Edit Exam Series
        </h2>
        <p className="mt-2 text-slate-600">
          Update the multi-day exam timetable for different subjects under the exam series name.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Exam Series Metadata Card */}
        <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm space-y-6">
          <h3 className="font-montserrat text-lg font-bold text-slate-800 border-b pb-3">
            Exam Series Metadata
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exam Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Exam Series Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Mid-Term Examination 2026"
                disabled={isLoading}
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
              />
            </div>

            {/* Scope (School-wide vs Class-specific) */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Exam Scope *</span>
              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 font-semibold text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value="SCHOOL"
                    checked={scope === "SCHOOL"}
                    onChange={() => setScope("SCHOOL")}
                    disabled={isLoading}
                    className="h-4.5 w-4.5 rounded-full border-slate-300 text-violet-600 focus:ring-violet-300 cursor-pointer accent-violet-600"
                  />
                  Overall School
                </label>
                <label className="flex items-center gap-2 font-semibold text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value="CLASS"
                    checked={scope === "CLASS"}
                    onChange={() => setScope("CLASS")}
                    disabled={isLoading}
                    className="h-4.5 w-4.5 rounded-full border-slate-300 text-violet-600 focus:ring-violet-300 cursor-pointer accent-violet-600"
                  />
                  Specific Class
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Class Selection Dropdown (if scope is Class) */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Target Class</label>
              <select
                disabled={isLoading || scope === "SCHOOL" || classes.length === 0}
                value={scope === "SCHOOL" ? "" : classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all disabled:opacity-50 disabled:bg-slate-50"
              >
                {scope === "SCHOOL" ? (
                  <option value="">N/A (School-wide)</option>
                ) : (
                  classes.map((c) => (
                    <option key={c.id} value={c.id}>Class {c.name}</option>
                  ))
                )}
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Start Date *</label>
              <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                <Calendar className="h-4.5 w-4.5 text-slate-400 mr-2 shrink-0" />
                <input
                  required
                  type="date"
                  disabled={isLoading}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-slate-900 outline-none w-full cursor-pointer font-medium"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">End Date *</label>
              <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                <Calendar className="h-4.5 w-4.5 text-slate-400 mr-2 shrink-0" />
                <input
                  required
                  type="date"
                  disabled={isLoading}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-slate-900 outline-none w-full cursor-pointer font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Exam Schedule papers list */}
        <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm space-y-6">
          <h3 className="font-montserrat text-lg font-bold text-slate-800 border-b pb-3">
            Exam Papers & Subjects Timetable
          </h3>

          <div className="space-y-6">
            {papers.map((paper, idx) => (
              <div key={paper.id} className="relative p-5 rounded-2xl border border-violet-100 bg-slate-50/20 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="font-bold text-sm text-violet-700">Exam Paper #{idx + 1}</span>
                  {papers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePaper(idx)}
                      disabled={isLoading}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Subject *</label>
                    <input
                      required
                      type="text"
                      list={`subject-options-${paper.id}`}
                      placeholder="e.g. Mathematics"
                      disabled={isLoading}
                      value={paper.subject}
                      onChange={(e) => updatePaper(idx, { subject: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                    />
                    <datalist id={`subject-options-${paper.id}`}>
                      {SUBJECT_OPTIONS.map((sub) => (
                        <option key={sub} value={sub} />
                      ))}
                    </datalist>
                  </div>

                  {/* Exam Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Exam Date *</label>
                    <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                      <Calendar className="h-4.5 w-4.5 text-slate-400 mr-2 shrink-0" />
                      <input
                        required
                        type="date"
                        min={startDate}
                        max={endDate}
                        disabled={isLoading}
                        value={paper.examDate}
                        onChange={(e) => updatePaper(idx, { examDate: e.target.value })}
                        className="bg-transparent text-slate-900 outline-none w-full cursor-pointer font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Start Time */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Start Time *</label>
                    <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                      <Clock className="h-4.5 w-4.5 text-slate-400 mr-2 shrink-0" />
                      <input
                        required
                        type="time"
                        disabled={isLoading}
                        value={paper.startTime}
                        onChange={(e) => updatePaper(idx, { startTime: e.target.value })}
                        className="bg-transparent text-slate-900 outline-none w-full cursor-pointer font-medium"
                      />
                    </div>
                  </div>

                  {/* End Time */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">End Time *</label>
                    <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                      <Clock className="h-4.5 w-4.5 text-slate-400 mr-2 shrink-0" />
                      <input
                        required
                        type="time"
                        disabled={isLoading}
                        value={paper.endTime}
                        onChange={(e) => updatePaper(idx, { endTime: e.target.value })}
                        className="bg-transparent text-slate-900 outline-none w-full cursor-pointer font-medium"
                      />
                    </div>
                  </div>

                  {/* Maximum Marks */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Maximum Marks *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="100"
                      disabled={isLoading}
                      value={paper.maxMarks}
                      onChange={(e) => updatePaper(idx, { maxMarks: parseInt(e.target.value, 10) || 0 })}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Paper Button */}
          <button
            type="button"
            onClick={handleAddPaper}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-violet-300 bg-violet-50/20 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-50 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Subject Exam Paper
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/principal/exams")}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !examName.trim()}
            className="rounded-xl bg-violet-600 px-8 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-violet-700 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditExamPage() {
  const params = useParams();
  const idStr = typeof params?.id === "string" ? params.id : "";
  const examId = parseInt(idStr, 10);

  if (isNaN(examId)) {
    return (
      <div className="p-8 text-center text-rose-500 font-semibold">
        Invalid Exam ID
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center rounded-2xl border border-violet-100 bg-white">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-violet-600" />
          Loading edit form...
        </div>
      </div>
    }>
      <EditExamContent examId={examId} />
    </Suspense>
  );
}
