"use client";

import { useState, useMemo } from "react";
import { useClassesList } from "@/hooks/useAdminClasses";
import { useAllExams, useCreateExam } from "@/hooks/useExams";
import type { ExamRow } from "@/lib/api/exams";
import { format } from "date-fns";
import { ClipboardList, Calendar, Clock, Plus, Loader2, Filter, BookOpen } from "lucide-react";

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

export default function PrincipalExamsPage() {
  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  const { data: exams = [], isLoading: examsLoading } = useAllExams();
  const createMut = useCreateExam();

  const [showModal, setShowModal] = useState(false);
  const [filterClassId, setFilterClassId] = useState<string>("ALL"); // "ALL", "SCHOOL", or Class ID string

  // Form State
  const [formData, setFormData] = useState({
    examName: "",
    subject: "",
    scope: "SCHOOL", // "SCHOOL" or "CLASS"
    classId: "",
    examDate: "",
    startTime: "",
    endTime: ""
  });

  const isLoading = classesLoading || examsLoading;

  // Filter exams based on selected filter
  const filteredExams = useMemo(() => {
    if (filterClassId === "ALL") return exams;
    if (filterClassId === "SCHOOL") {
      return exams.filter((e) => !e.schoolClass);
    }
    return exams.filter((e) => e.schoolClass && String(e.schoolClass.id) === filterClassId);
  }, [exams, filterClassId]);

  function resetForm() {
    setFormData({
      examName: "",
      subject: "",
      scope: "SCHOOL",
      classId: "",
      examDate: "",
      startTime: "",
      endTime: ""
    });
  }

  function handleOpenModal() {
    resetForm();
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.examName.trim() || !formData.subject.trim() || !formData.examDate || !formData.startTime || !formData.endTime) {
      return;
    }

    if (formData.scope === "CLASS" && !formData.classId) {
      return;
    }

    // Append seconds to times if needed for Java LocalTime
    const formattedStartTime = formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime;
    const formattedEndTime = formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime;

    createMut.mutate({
      examName: formData.examName.trim(),
      subject: formData.subject.trim(),
      classId: formData.scope === "CLASS" ? parseInt(formData.classId, 10) : null,
      examDate: formData.examDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime
    }, {
      onSuccess: () => {
        handleCloseModal();
      }
    });
  }

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
          onClick={handleOpenModal}
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.98]"
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
          {filteredExams.map((exam: ExamRow) => (
            <div
              key={exam.id}
              className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-white p-6 shadow-sm hover:border-violet-300 hover:shadow-md transition-all duration-200"
            >
              {/* Top Accent Gradient */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                exam.schoolClass ? "bg-violet-500" : "bg-gradient-to-r from-pink-500 to-violet-600"
              }`} />

              <div className="flex flex-col h-full pt-1">
                {/* Badge for Scope */}
                <div className="mb-3 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                    exam.schoolClass
                      ? "bg-violet-50 text-violet-700 border border-violet-100"
                      : "bg-pink-50 text-pink-700 border border-pink-100"
                  }`}>
                    {exam.schoolClass ? `Class ${exam.schoolClass.name}` : "School-wide"}
                  </span>
                  <BookOpen className="h-4.5 w-4.5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                </div>

                {/* Exam Title & Subject */}
                <h4 className="font-montserrat text-lg font-bold text-slate-900 group-hover:text-violet-800 transition-colors">
                  {exam.examName}
                </h4>
                <p className="text-sm font-semibold text-slate-500 mt-1">{exam.subject}</p>

                {/* Date and Time Info */}
                <div className="mt-6 space-y-2 border-t border-slate-50 pt-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <Calendar className="h-4 w-4 text-violet-500 shrink-0" />
                    <span>{formatDateString(exam.examDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <Clock className="h-4 w-4 text-violet-500 shrink-0" />
                    <span>{formatTimeString(exam.startTime)} - {formatTimeString(exam.endTime)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Exam Dialog Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={handleCloseModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="w-full max-w-md rounded-2xl border border-violet-100 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="modal-title" className="font-montserrat text-lg font-bold text-slate-900">
              Schedule New Exam
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Fill in the details below to publish an exam date.
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              {/* Exam Name */}
              <label className="block text-xs font-semibold text-slate-600">
                Exam Name
                <input
                  required
                  autoFocus
                  placeholder="e.g. Mid-Term Examination"
                  disabled={createMut.isPending}
                  value={formData.examName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, examName: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-violet-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                />
              </label>

              {/* Subject */}
              <label className="block text-xs font-semibold text-slate-600">
                Subject
                <input
                  required
                  list="exam-subjects"
                  placeholder="e.g. Mathematics"
                  disabled={createMut.isPending}
                  value={formData.subject}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-violet-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                />
                <datalist id="exam-subjects">
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
              </label>

              {/* Scope (School-wide vs Class-specific) */}
              <div className="block text-xs font-semibold text-slate-600 space-y-2">
                Exam Scope
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      value="SCHOOL"
                      checked={formData.scope === "SCHOOL"}
                      onChange={() => setFormData((prev) => ({ ...prev, scope: "SCHOOL", classId: "" }))}
                      disabled={createMut.isPending}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    Overall School
                  </label>
                  <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      value="CLASS"
                      checked={formData.scope === "CLASS"}
                      onChange={() => setFormData((prev) => ({ ...prev, scope: "CLASS" }))}
                      disabled={createMut.isPending}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    Specific Class
                  </label>
                </div>
              </div>

              {/* Class Selection Dropdown (if scope is Class) */}
              {formData.scope === "CLASS" && (
                <label className="block text-xs font-semibold text-slate-600">
                  Target Class
                  <select
                    required
                    disabled={createMut.isPending || classes.length === 0}
                    value={formData.classId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, classId: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-violet-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                  >
                    <option value="" disabled>Select a Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>Class {c.name}</option>
                    ))}
                  </select>
                </label>
              )}

              {/* Exam Date */}
              <label className="block text-xs font-semibold text-slate-600">
                Exam Date
                <input
                  required
                  type="date"
                  disabled={createMut.isPending}
                  value={formData.examDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, examDate: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-violet-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                />
              </label>

              {/* Start and End Times */}
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-xs font-semibold text-slate-600">
                  Start Time
                  <input
                    required
                    type="time"
                    disabled={createMut.isPending}
                    value={formData.startTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-violet-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-600">
                  End Time
                  <input
                    required
                    type="time"
                    disabled={createMut.isPending}
                    value={formData.endTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-violet-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                  />
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={createMut.isPending}
                  className="rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center gap-2"
                >
                  {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {createMut.isPending ? "Scheduling..." : "Schedule Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
