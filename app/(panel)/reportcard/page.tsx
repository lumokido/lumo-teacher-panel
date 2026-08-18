"use client";

import { useState, useMemo, useEffect } from "react";
import { useClassesList, useMyAssignedClasses } from "@/hooks/useAdminClasses";
import { listStudentsByClassId } from "@/lib/api/adminClasses";
import { useAllExams } from "@/hooks/useExams";
import { useSaveBulkMarks, useReportCard } from "@/hooks/useMarks";
import { getStudentId, studentDisplayName } from "@/lib/api/students";
import type { StudentRow } from "@/lib/api/students";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  GraduationCap,
  Calendar,
  Search,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Award,
  Loader2,
  CheckCircle2
} from "lucide-react";

import { sortClasses } from "@/lib/utils/sortClasses";

export default function TeacherReportCardPage() {
  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  const { data: assignedData, isLoading: assignedLoading } = useMyAssignedClasses();
  const { data: exams = [], isLoading: examsLoading } = useAllExams();
  const saveMarksMut = useSaveBulkMarks();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [activeStudentId, setActiveStudentId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter classes teacher is assigned to
  const filteredClasses = useMemo(() => {
    if (!assignedData) return sortClasses(classes);
    const homeroom = assignedData.homeroomClass;
    const assigned = assignedData.assignedClasses || [];
    
    const list = classes.filter((cls) => {
      const name = cls.name.trim().toLowerCase();
      const isHomeroom = homeroom ? homeroom.trim().toLowerCase() === name : false;
      const isAssigned = assigned.some(c => c.trim().toLowerCase() === name);
      return isHomeroom || isAssigned;
    });

    return sortClasses(list.length > 0 ? list : classes);
  }, [classes, assignedData]);

  // Filter exams based on selected class
  const relevantExams = useMemo(() => {
    if (!selectedClassId) return [];
    return exams.filter(
      (e) => !e.schoolClass || String(e.schoolClass.id) === selectedClassId
    );
  }, [exams, selectedClassId]);

  // Reset exam and student when class changes
  useEffect(() => {
    setSelectedExamId("");
    setActiveStudentId("");
  }, [selectedClassId]);

  // Fetch students for selected class
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["admin", "classStudentsById", selectedClassId],
    queryFn: () => listStudentsByClassId(parseInt(selectedClassId, 10)),
    enabled: !!selectedClassId,
  });

  // Automatically select first student when students list loads
  useEffect(() => {
    if (students.length > 0 && !activeStudentId) {
      const firstId = getStudentId(students[0]);
      if (firstId) setActiveStudentId(firstId);
    }
  }, [students, activeStudentId]);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter((s) => {
      const name = studentDisplayName(s).toLowerCase();
      const roll = (s.rollNumber || "").toLowerCase();
      return name.includes(q) || roll.includes(q);
    });
  }, [students, searchQuery]);

  // Get active student details
  const activeStudent = useMemo(() => {
    return students.find((s) => getStudentId(s) === activeStudentId);
  }, [students, activeStudentId]);

  // Get selected exam details
  const activeExam = useMemo(() => {
    return exams.find((e) => String(e.id) === selectedExamId);
  }, [exams, selectedExamId]);

  // Fetch report card data for active student and exam
  const { data: reportCard, isLoading: reportCardLoading } = useReportCard(
    activeStudentId,
    parseInt(selectedExamId, 10)
  );

  const subjects = useMemo(
    () => activeExam?.subjects ?? [],
    [activeExam],
  );

  // Local state for the marks entry form
  const [marksForm, setMarksForm] = useState<{ [subject: string]: number | string }>({});

  // Populate form state when report card or active student changes
  useEffect(() => {
    if (reportCard && reportCard.subjectMarks && reportCard.subjectMarks.length > 0) {
      const formState: { [subject: string]: number | string } = {};
      subjects.forEach((sub) => {
        const saved = reportCard.subjectMarks.find(
          (sm) => sm.subject.toLowerCase() === sub.subject.toLowerCase()
        );
        formState[sub.subject] = saved ? saved.marksObtained : "";
      });
      setMarksForm(formState);
    } else {
      const emptyForm: { [subject: string]: number | string } = {};
      subjects.forEach((sub) => {
        emptyForm[sub.subject] = "";
      });
      setMarksForm(emptyForm);
    }
  }, [reportCard, activeStudentId, selectedExamId, subjects]);

  // Live total, percentage, and grade calculations
  const liveStats = useMemo(() => {
    let obtained = 0;
    let max = 0;
    subjects.forEach((sub) => {
      const val = marksForm[sub.subject];
      const numVal = typeof val === "number" ? val : parseFloat(val as string);
      obtained += !isNaN(numVal) ? numVal : 0;
      max += sub.maxMarks || 100;
    });
    obtained = Math.round(obtained * 100) / 100;
    const pct = max > 0 ? (obtained / max) * 100 : 0;
    let grade = "F";
    if (pct >= 90) grade = "A+";
    else if (pct >= 80) grade = "A";
    else if (pct >= 70) grade = "B";
    else if (pct >= 60) grade = "C";
    else if (pct >= 50) grade = "D";
    return { obtained, max, pct, grade };
  }, [marksForm, subjects]);

  // Handle input changes
  function handleMarkChange(subject: string, valStr: string) {
    if (valStr === "") {
      setMarksForm((f) => ({ ...f, [subject]: "" }));
      return;
    }
    const val = parseFloat(valStr);
    if (isNaN(val) || val < 0) return;
    setMarksForm((f) => ({ ...f, [subject]: valStr }));
  }

  // Save current student marks and optionally move to next
  async function handleSave(advance: boolean = false) {
    if (!activeStudentId || !selectedExamId) return;

    // Validate marks obtained does not exceed max marks
    for (const sub of subjects) {
      const rawVal = marksForm[sub.subject];
      if (rawVal === "" || rawVal === undefined || rawVal === null) {
        toast.error(`Please enter marks for ${sub.subject}`);
        return;
      }
      const val = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal));
      if (isNaN(val)) {
        toast.error(`Please enter valid marks for ${sub.subject}`);
        return;
      }
      if (val < 0) {
        toast.error(`Marks for ${sub.subject} cannot be negative`);
        return;
      }
      if (val > sub.maxMarks) {
        toast.error(`Marks for ${sub.subject} cannot exceed Maximum Marks (${sub.maxMarks})`);
        return;
      }
    }

    try {
      const payloadMarks = subjects.map((sub) => {
        const rawVal = marksForm[sub.subject];
        const val = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal)) || 0;
        return {
          subject: sub.subject,
          marksObtained: val,
        };
      });

      await saveMarksMut.mutateAsync({
        studentId: activeStudentId,
        examId: parseInt(selectedExamId, 10),
        marks: payloadMarks,
      });

      if (advance) {
        // Find next student
        const currentIndex = students.findIndex(
          (s) => getStudentId(s) === activeStudentId
        );
        if (currentIndex !== -1 && currentIndex < students.length - 1) {
          const nextStudent = students[currentIndex + 1];
          const nextId = getStudentId(nextStudent);
          if (nextId) {
            setActiveStudentId(nextId);
            toast.success(
              `Saved marks for ${studentDisplayName(
                students[currentIndex]
              )}. Moving to next student.`
            );
          }
        } else {
          toast.success("Saved marks for the last student in the class!");
        }
      }
    } catch {
      // Handled by react query error toast
    }
  }

  // Go to previous student
  function handlePrevious() {
    const currentIndex = students.findIndex(
      (s) => getStudentId(s) === activeStudentId
    );
    if (currentIndex > 0) {
      const prevStudent = students[currentIndex - 1];
      const prevId = getStudentId(prevStudent);
      if (prevId) setActiveStudentId(prevId);
    }
  }

  // Skip to next student
  function handleSkip() {
    const currentIndex = students.findIndex(
      (s) => getStudentId(s) === activeStudentId
    );
    if (currentIndex < students.length - 1) {
      const nextStudent = students[currentIndex + 1];
      const nextId = getStudentId(nextStudent);
      if (nextId) setActiveStudentId(nextId);
    }
  }

  // Form submit (Enter key triggers save & next)
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void handleSave(true);
  }

  const isLoading = classesLoading || assignedLoading || examsLoading;
  const isFormActive = !!selectedClassId && !!selectedExamId && !!activeStudentId;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <p className="mb-2 text-sm font-medium text-sky-600">Report Cards</p>
        <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
          Gradebook & Report Cards
        </h2>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Select one of your assigned classes and an examination series to enter student marks. Use Tab to navigate through fields, and press Enter to save and advance automatically.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-sky-100 rounded-2xl p-6 shadow-sm">
        {/* Class Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Class</label>
          <select
            disabled={isLoading || filteredClasses.length === 0}
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
          >
            <option value="">Select an Assigned Class...</option>
            {filteredClasses.map((c) => (
              <option key={c.id} value={c.id}>
                Class {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Exam Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Exam Series</label>
          <select
            disabled={isLoading || !selectedClassId || relevantExams.length === 0}
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all disabled:opacity-50 disabled:bg-slate-50"
          >
            <option value="">
              {!selectedClassId
                ? "Please select a Class first"
                : relevantExams.length === 0
                ? "No Exams Scheduled"
                : "Select an Exam..."}
            </option>
            {relevantExams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.examName} ({e.schoolClass ? "Class-specific" : "School-wide"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Workspace */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-sky-600" />
          Loading gradebook data...
        </div>
      ) : !isFormActive ? (
        <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/20 px-6 py-16 text-center max-w-xl mx-auto">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-600">
            <GraduationCap className="h-8 w-8" />
          </div>
          <p className="text-lg font-semibold text-slate-800">No Class or Exam Selected</p>
          <p className="mt-1 text-sm text-slate-500">
            Choose an assigned class and exam series in the selectors bar above to begin entering student marks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Panel: Students Directory */}
          <div className="lg:col-span-1 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm space-y-4 max-h-[70vh] flex flex-col">
            <div className="shrink-0 space-y-3">
              <h3 className="font-montserrat text-base font-bold text-slate-800">
                Students List
              </h3>
              {/* Search Bar */}
              <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
                <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-slate-900 outline-none w-full placeholder-slate-400 font-medium text-xs"
                />
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
              {studentsLoading ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-sky-600" />
                  Loading students...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs italic">
                  No students found
                </div>
              ) : (
                filteredStudents.map((s, index) => {
                  const sId = getStudentId(s);
                  const isActive = sId === activeStudentId;
                  return (
                    <button
                      key={sId ?? index}
                      type="button"
                      onClick={() => sId && setActiveStudentId(sId)}
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                        isActive
                          ? "bg-sky-50/70 border-sky-300 shadow-sm"
                          : "border-slate-100 hover:border-sky-200 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${isActive ? "text-sky-900" : "text-slate-800"}`}>
                          {studentDisplayName(s)}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                          Roll: {s.rollNumber || "N/A"} • Sec: {s.sectionName || "N/A"}
                        </p>
                      </div>
                      <GraduationCap className={`h-4.5 w-4.5 ${isActive ? "text-sky-600 animate-pulse" : "text-slate-300"}`} />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Marks Entry Panel */}
          <div className="lg:col-span-2 space-y-6">
            {activeStudent ? (
              <div className="rounded-2xl border border-sky-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
                {/* Student Profile Overview */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                  <div>
                    <h3 className="font-montserrat text-xl font-bold text-slate-900">
                      {studentDisplayName(activeStudent)}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      Roll Number: {activeStudent.rollNumber || "N/A"} • Section: {activeStudent.sectionName || "N/A"}
                    </p>
                  </div>
                  {/* Live calculations Display */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Grade Widget */}
                    <div className="flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-2xl px-4 py-2">
                      <Award className="h-5 w-5 text-sky-600" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Grade</p>
                        <p className="text-lg font-black text-sky-800 leading-tight">
                          {liveStats.grade}
                        </p>
                      </div>
                    </div>

                    {/* Percentage Widget */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2">
                      <Sparkles className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Percentage</p>
                        <p className="text-lg font-extrabold text-slate-800 leading-tight">
                          {liveStats.pct.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form */}
                {reportCardLoading ? (
                  <div className="py-16 text-center text-slate-400">
                    <Loader2 className="mx-auto mb-2 h-7 w-7 animate-spin text-sky-600" />
                    Loading report details...
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Live Total obtained vs Max */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">Total Marks Calculated:</span>
                      <span className="text-sm font-bold text-slate-800">
                        {liveStats.obtained} / {liveStats.max}
                      </span>
                    </div>

                    {/* Subjects Grid Inputs */}
                    <div className="space-y-4">
                      {subjects.length === 0 ? (
                        <p className="text-sm text-slate-400 italic text-center py-6">
                          No subjects defined in the selected exam series.
                        </p>
                      ) : (
                        subjects.map((sub, index) => (
                          <div
                            key={sub.id || index}
                            className="grid grid-cols-1 md:grid-cols-3 gap-3 md:items-center p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 hover:border-sky-100 transition-colors"
                          >
                            {/* Subject Name */}
                            <span className="text-sm font-bold text-slate-800 md:col-span-1">
                              {sub.subject}
                            </span>

                            {/* Input Marks Obtained */}
                            <div className="md:col-span-1">
                              <input
                                required
                                type="number"
                                step="any"
                                min="0"
                                max={sub.maxMarks}
                                placeholder="Marks"
                                value={marksForm[sub.subject] ?? ""}
                                onChange={(e) =>
                                  handleMarkChange(sub.subject, e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all font-semibold"
                              />
                            </div>

                            {/* Max Marks Indicator */}
                            <span className="text-xs font-semibold text-slate-500 md:col-span-1 md:text-right">
                              Max Marks: {sub.maxMarks}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Navigation Actions Footer */}
                    <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-100">
                      {/* Back / Next navigation */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={students.findIndex((s) => getStudentId(s) === activeStudentId) === 0}
                          onClick={handlePrevious}
                          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          Prev Student
                        </button>
                        <button
                          type="button"
                          disabled={
                            students.findIndex((s) => getStudentId(s) === activeStudentId) ===
                            students.length - 1
                          }
                          onClick={handleSkip}
                          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Skip Student
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Save buttons */}
                      <div className="flex items-center gap-2 self-end">
                        <button
                          type="button"
                          disabled={saveMarksMut.isPending}
                          onClick={() => handleSave(false)}
                          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                        >
                          Save Progress
                        </button>
                        <button
                          type="submit"
                          disabled={saveMarksMut.isPending || subjects.length === 0}
                          className="rounded-xl bg-sky-500 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-600 transition active:scale-[0.98] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {saveMarksMut.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Save & Next
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
