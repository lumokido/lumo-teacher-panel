"use client";

import { useMemo, Suspense } from "react";
import { useExamById } from "@/hooks/useExams";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Calendar, Clock, ArrowLeft, Edit, BookOpen, AlertCircle } from "lucide-react";

function ViewExamContent({ examId }: { examId: number }) {
  const router = useRouter();
  const { data: exam, isLoading, isError } = useExamById(examId);

  // Format date nicely (long format)
  function formatDateString(dateStr: string) {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return format(date, "EEEE, MMMM dd, yyyy");
    } catch (e) {
      return dateStr;
    }
  }

  // Format date nicely (short format)
  function formatShortDate(dateStr: string) {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return format(date, "MMM dd, yyyy");
    } catch (e) {
      return dateStr;
    }
  }

  // Format time (e.g. "09:00:00" -> "09:00 AM")
  function formatTimeString(timeStr: string) {
    try {
      const [h, m] = timeStr.split(":");
      const d = new Date();
      d.setHours(parseInt(h, 10), parseInt(m, 10));
      return format(d, "hh:mm a");
    } catch (e) {
      return timeStr;
    }
  }

  // Sort papers chronologically
  const sortedSubjects = useMemo(() => {
    if (!exam || !exam.subjects) return [];
    return [...exam.subjects].sort((a, b) => {
      if (a.examDate !== b.examDate) {
        return a.examDate.localeCompare(b.examDate);
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }, [exam]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-violet-100 bg-white">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-violet-600" />
          Loading exam schedule...
        </div>
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center space-y-4 max-w-md mx-auto mt-12">
        <div className="flex justify-center text-rose-500">
          <AlertCircle className="h-10 w-10" />
        </div>
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
      {/* Header Back & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/principal/exams")}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 transition hover:text-violet-800 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </button>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900 flex items-center gap-3">
            {exam.examName}
          </h2>
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider ${
              exam.schoolClass
                ? "bg-violet-50 text-violet-700 border border-violet-100"
                : "bg-pink-50 text-pink-700 border border-pink-100"
            }`}>
              {exam.schoolClass ? `Class ${exam.schoolClass.name}` : "School-wide"}
            </span>
            <span className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-violet-500 shrink-0" />
              {formatShortDate(exam.startDate)} - {formatShortDate(exam.endDate)}
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push(`/principal/exams/edit/${exam.id}`)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-white px-5 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-50 transition active:scale-[0.98] cursor-pointer shadow-sm shrink-0"
        >
          <Edit className="h-4 w-4" />
          Edit Schedule
        </button>
      </div>

      {/* Main Content Card */}
      <div className="rounded-2xl border border-violet-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <h3 className="font-montserrat text-lg font-bold text-slate-800">
            Exam Papers & Timetable
          </h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {sortedSubjects.length} Paper{sortedSubjects.length !== 1 ? "s" : ""}
          </span>
        </div>

        {sortedSubjects.length === 0 ? (
          <div className="py-12 text-center text-slate-400 italic">
            No subject papers are scheduled for this series.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSubjects.map((paper, idx) => (
              <div
                key={paper.id}
                className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-violet-50 bg-slate-50/30 hover:bg-violet-50/20 hover:border-violet-100 transition-all duration-200"
              >
                {/* Left Side: Index & Subject Details */}
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 font-bold text-sm">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-montserrat text-base font-bold text-slate-900">
                      {paper.subject}
                    </h4>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-violet-600 flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        Paper Scheduled
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        Max Marks: {paper.maxMarks || 100}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Date & Time Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-8 shrink-0">
                  {/* Date Column */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Calendar className="h-4.5 w-4.5 text-violet-500 shrink-0" />
                    <span>{formatDateString(paper.examDate)}</span>
                  </div>

                  {/* Time Column */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 min-w-[170px]">
                    <Clock className="h-4.5 w-4.5 text-violet-500 shrink-0" />
                    <span>
                      {formatTimeString(paper.startTime)} - {formatTimeString(paper.endTime)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ViewExamPage() {
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
          Loading viewer...
        </div>
      </div>
    }>
      <ViewExamContent examId={examId} />
    </Suspense>
  );
}
