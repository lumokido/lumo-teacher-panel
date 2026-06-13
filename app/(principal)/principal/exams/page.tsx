"use client";

import { useState, useMemo } from "react";
import { useClassesList } from "@/hooks/useAdminClasses";
import { useAllExams, useDeleteExam } from "@/hooks/useExams";
import type { ExamRow } from "@/lib/api/exams";
import { format } from "date-fns";
import { ClipboardList, Calendar, Clock, Plus, Loader2, Filter, BookOpen, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrincipalExamsPage() {
  const router = useRouter();
  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  const { data: exams = [], isLoading: examsLoading } = useAllExams();
  const deleteMut = useDeleteExam();

  const [filterClassId, setFilterClassId] = useState<string>("ALL"); // "ALL", "SCHOOL", or Class ID string

  const isLoading = classesLoading || examsLoading;

  // Filter exams based on selected filter
  const filteredExams = useMemo(() => {
    if (filterClassId === "ALL") return exams;
    if (filterClassId === "SCHOOL") {
      return exams.filter((e) => !e.schoolClass);
    }
    return exams.filter((e) => e.schoolClass && String(e.schoolClass.id) === filterClassId);
  }, [exams, filterClassId]);

  // Format date nicely
  function formatDateString(dateStr: string) {
    try {
      // Avoid time zone shifts by parsing date string manually
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return format(date, "MMMM dd, yyyy");
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-violet-600">Exams</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            Exam Scheduling
          </h2>
          <p className="mt-2 text-slate-600">
            Schedule and manage examinations for all classes or the overall school.
          </p>
        </div>

        <button
          onClick={() => router.push("/principal/exams/schedule")}
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Schedule Exam
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-white border border-violet-100 rounded-2xl p-4 shadow-sm w-fit max-w-full overflow-x-auto">
        <Filter className="h-4.5 w-4.5 text-violet-500 shrink-0" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Filter:</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilterClassId("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterClassId === "ALL"
                ? "bg-violet-100 text-violet-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Exams
          </button>
          <button
            onClick={() => setFilterClassId("SCHOOL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterClassId === "SCHOOL"
                ? "bg-violet-100 text-violet-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            School-wide Only
          </button>
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterClassId(String(c.id))}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                filterClassId === String(c.id)
                  ? "bg-violet-100 text-violet-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Class {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Exams */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-violet-600" />
          Loading examinations...
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/20 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-600">
            <ClipboardList className="h-8 w-8" />
          </div>
          <p className="text-lg font-semibold text-slate-800">No exams scheduled</p>
          <p className="mt-1 text-sm text-slate-500">
            There are no examinations matching this filter. Click &quot;Schedule Exam&quot; to create one.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam: ExamRow) => {
            return (
              <div
                key={exam.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-violet-100 bg-white p-6 shadow-sm hover:border-violet-300 hover:shadow-md transition-all duration-200"
              >
                {/* Top Accent Gradient */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  exam.schoolClass ? "bg-violet-500" : "bg-gradient-to-r from-pink-500 to-violet-600"
                }`} />

                <div className="flex flex-col h-full pt-1 justify-between">
                  <div>
                    {/* Badge for Scope & Action buttons */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                        exam.schoolClass
                          ? "bg-violet-50 text-violet-700 border border-violet-100"
                          : "bg-pink-50 text-pink-700 border border-pink-100"
                      }`}>
                        {exam.schoolClass ? `Class ${exam.schoolClass.name}` : "School-wide"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/principal/exams/edit/${exam.id}`)}
                          className="p-1 rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors cursor-pointer"
                          title="Edit Exam Series"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete the exam series "${exam.examName}"? This will delete all its scheduled subject papers.`)) {
                              deleteMut.mutate(exam.id);
                            }
                          }}
                          disabled={deleteMut.isPending}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Exam Series"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Exam Title */}
                    <h4 className="font-montserrat text-lg font-bold text-slate-900 group-hover:text-violet-800 transition-colors">
                      {exam.examName}
                    </h4>

                    {/* Date range of Series */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-1.5">
                      <Calendar className="h-3.5 w-3.5 text-violet-500" />
                      <span>
                        {formatDateString(exam.startDate)} - {formatDateString(exam.endDate)}
                      </span>
                    </div>
                  </div>

                  {/* Footer Action to View Details */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      {exam.subjects && exam.subjects.length > 0
                        ? `${exam.subjects.length} Subject Paper${exam.subjects.length > 1 ? "s" : ""}`
                        : "No papers scheduled"}
                    </span>
                    <button
                      onClick={() => router.push(`/principal/exams/view/${exam.id}`)}
                      className="rounded-xl bg-violet-50 hover:bg-violet-600 hover:text-white px-4 py-2.5 text-xs font-bold text-violet-700 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      View Schedule
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
