"use client";

import { useReportCard } from "@/hooks/useMarks";
import { AlertCircle, Award, CheckCircle2, Sparkles, Trophy, Loader2, BookOpen } from "lucide-react";

type Props = {
  studentId?: string;
  examId?: number;
};

export default function StudentReportCardView({
  studentId = "STU-1001",
  examId = 1,
}: Props) {
  const { data: reportCard, isLoading } = useReportCard(studentId, examId);

  if (isLoading) {
    return (
      <div className="flex h-72 items-center justify-center rounded-3xl border border-violet-100 bg-white shadow-sm">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-violet-600" />
          Loading official report card...
        </div>
      </div>
    );
  }

  // Unpublished State
  if (!reportCard || !reportCard.published) {
    return (
      <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50/70 via-orange-50/30 to-white p-8 md:p-12 text-center shadow-sm space-y-6 max-w-3xl mx-auto">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 ring-8 ring-amber-50">
          <AlertCircle className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-800 border border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Pending Admin Approval & Publication
          </span>

          <h3 className="font-montserrat text-2xl md:text-3xl font-bold text-slate-900 pt-2">
            Results Not Published Yet
          </h3>

          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Your examination marks have been submitted by teachers and are currently being reviewed by administration. Once approved, your official report card will automatically display here.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200/60 bg-white p-4 max-w-md mx-auto text-xs text-slate-500 flex items-center justify-between">
          <span>Examination: <strong className="text-slate-800">{reportCard?.examName || "Mid-Term Examination 2026"}</strong></span>
          <span>Status: <strong className="text-amber-700">Under Review</strong></span>
        </div>
      </div>
    );
  }

  // Published State
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Summary Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-900 to-purple-900 p-8 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Official Report Card Published
              </span>
              <h2 className="font-montserrat text-2xl md:text-3xl font-bold tracking-tight text-white mt-2">
                {reportCard.examName}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black text-lg shadow-md">
                {reportCard.grade}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-xs border border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-200">Student Name</p>
              <p className="text-base font-bold text-white mt-0.5 truncate">{reportCard.studentName}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-xs border border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-200">Class & Section</p>
              <p className="text-base font-bold text-white mt-0.5">{reportCard.className}</p>
              <p className="text-[11px] text-violet-300 font-medium">Academic Year 2026</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-xs border border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-200">Total Score</p>
              <p className="text-base font-extrabold text-white mt-0.5">
                {reportCard.totalObtained} <span className="text-xs font-normal text-violet-300">/ {reportCard.totalMax}</span>
              </p>
              <p className="text-[11px] text-emerald-300 font-bold">{reportCard.percentage.toFixed(1)}% Score</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-xs border border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Class Rank</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Trophy className="h-4 w-4 text-amber-400" />
                <p className="text-base font-black text-amber-300">
                  Rank #{reportCard.rank || 1}
                </p>
              </div>
              <p className="text-[11px] text-violet-200 font-medium">Top Performer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Breakdown Table */}
      <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-violet-50 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-violet-600" />
            <h3 className="font-montserrat text-lg font-bold text-slate-900">
              Subject-Wise Breakdown
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {reportCard.subjectMarks.length} Subjects Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-violet-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Max Marks</th>
                <th className="py-3.5 px-4">Marks Obtained</th>
                <th className="py-3.5 px-4">Grade</th>
                <th className="py-3.5 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-50">
              {reportCard.subjectMarks.map((sub, index) => (
                <tr key={index} className="hover:bg-violet-50/20 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {sub.subject}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-500">
                    {sub.maxMarks}
                  </td>
                  <td className="py-4 px-4 font-extrabold text-slate-900">
                    {sub.marksObtained}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 font-black text-xs text-violet-800">
                      {sub.grade}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-slate-600 italic">
                    {sub.remarks || "Good performance"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
