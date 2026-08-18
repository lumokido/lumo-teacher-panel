"use client";

import { useState, useMemo } from "react";
import {
  useAdminMarks,
  useUpdateStudentMark,
  usePublishClassResults,
  usePublishOverallResults,
} from "@/hooks/useMarks";
import { useClassesList } from "@/hooks/useAdminClasses";
import { listStudentsByClassId } from "@/lib/api/adminClasses";
import { getStudentId, studentDisplayName, listStudents } from "@/lib/api/students";
import { useAllExams } from "@/hooks/useExams";
import type { MarkRecord } from "@/lib/api/marks";
import { sortClasses } from "@/lib/utils/sortClasses";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Globe,
  Loader2,
  Layers,
  Sparkles,
  Trophy,
  X,
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  FileCheck,
  User,
  Users,
  Award,
  FileText,
  Eye,
  BookOpen,
  PlusCircle,
} from "lucide-react";

export default function AdminMarksApprovalCenter() {
  const { data: rawClasses = [], isLoading: classesLoading } = useClassesList();
  const classes = useMemo(() => sortClasses(rawClasses), [rawClasses]);
  const { data: exams = [] } = useAllExams();

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"student" | "subject">("student");

  const [localFallbackMarks, setLocalFallbackMarks] = useState<MarkRecord[]>([]);

  const examIdNum = selectedExamId ? parseInt(selectedExamId, 10) : undefined;
  const { data: rawMarks = [], isLoading: marksLoading } = useAdminMarks(examIdNum);
  const marks = useMemo(
    () => [...(Array.isArray(rawMarks) ? rawMarks : []), ...localFallbackMarks],
    [rawMarks, localFallbackMarks]
  );

  const updateMarkMut = useUpdateStudentMark();
  const publishClassMut = usePublishClassResults();
  const publishOverallMut = usePublishOverallResults();

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<MarkRecord | null>(null);
  const [editScore, setEditScore] = useState<number | string>("");
  const [editMaxMarks, setEditMaxMarks] = useState<number | string>(100);

  // Student Report Card Modal State
  const [viewingStudentCard, setViewingStudentCard] = useState<any | null>(null);

  // Selected Class details
  const selectedClass = useMemo(() => {
    if (!selectedClassId) return null;
    return classes.find((c) => String(c.id) === selectedClassId) || null;
  }, [classes, selectedClassId]);

  // Selected Exam details
  const selectedExam = useMemo(() => {
    if (!selectedExamId) return null;
    return exams.find((e) => String(e.id) === selectedExamId) || null;
  }, [exams, selectedExamId]);

  // Relevant exams for selected class
  const relevantExams = useMemo(() => {
    if (!selectedClassId) return exams;
    return exams.filter(
      (e) => !e.schoolClass || String(e.schoolClass.id) === selectedClassId
    );
  }, [exams, selectedClassId]);

  // Fetch all students to resolve studentId -> Student Name across school
  const { data: allStudents = [] } = useQuery({
    queryKey: ["admin", "allStudents"],
    queryFn: () => listStudents(),
  });

  // Fetch students for selected class box specifically
  const { data: classStudents = [] } = useQuery({
    queryKey: ["admin", "classStudentsById", selectedClassId],
    queryFn: () => listStudentsByClassId(parseInt(selectedClassId!, 10)),
    enabled: !!selectedClassId,
  });

  const classStudentIdsSet = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(classStudents)) {
      classStudents.forEach((s) => {
        if (s.id != null) set.add(String(s.id));
        if (s.studentId != null) set.add(String(s.studentId));
        if (s.admissionId != null) set.add(String(s.admissionId));
      });
    }
    return set;
  }, [classStudents]);

  const studentMap = useMemo(() => {
    const map: Record<string, string> = {};
    const registerStudent = (s: any) => {
      if (!s) return;
      const name = studentDisplayName(s);
      if (name && name !== "—") {
        if (s.id != null) map[String(s.id)] = name;
        if (s.studentId != null) map[String(s.studentId)] = name;
        if (s.admissionId != null) map[String(s.admissionId)] = name;
      }
    };

    if (Array.isArray(allStudents)) allStudents.forEach(registerStudent);
    if (Array.isArray(classStudents)) classStudents.forEach(registerStudent);
    return map;
  }, [allStudents, classStudents]);

  function handleSelectClassBox(classId: number | string) {
    const clsIdStr = String(classId);
    setSelectedClassId(clsIdStr);
    setSelectedExamId(null);
    setExamModalOpen(true);
  }

  function handleSelectExam(examId: number | string) {
    setSelectedExamId(String(examId));
    setExamModalOpen(false);
  }

  function handleResetSelection() {
    setSelectedClassId(null);
    setSelectedExamId(null);
    setExamModalOpen(false);
  }

  function openEditModal(record: MarkRecord) {
    setEditingRecord(record);
    setEditScore(record.marksObtained);
    setEditMaxMarks(record.maxMarks || 100);
  }

  function closeEditModal() {
    setEditingRecord(null);
    setEditScore("");
    setEditMaxMarks(100);
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRecord || editScore === "") return;

    updateMarkMut.mutate(
      {
        id: editingRecord.id,
        payload: {
          marksObtained: Number(editScore),
          maxMarks: editMaxMarks !== "" ? Number(editMaxMarks) : 100,
        },
      },
      {
        onSuccess: () => closeEditModal(),
      }
    );
  }

  function handleInitializeClassFallback() {
    if (!selectedClass || !selectedExam || classStudents.length === 0) return;

    const subjects =
      selectedExam.subjects && selectedExam.subjects.length > 0
        ? selectedExam.subjects.map((s) => s.subject)
        : ["Mathematics", "English", "General Science"];

    const generated: MarkRecord[] = [];
    classStudents.forEach((stu: any, index: number) => {
      const sId = getStudentId(stu) || String(stu.id || index + 1);
      const sName = studentDisplayName(stu);

      subjects.forEach((subName: string, subIdx: number) => {
        generated.push({
          id: Date.now() + index * 100 + subIdx,
          studentId: sId,
          studentName: sName,
          classId: Number(selectedClassId),
          className: `Class ${selectedClass.name}`,
          examId: Number(selectedExamId),
          examName: selectedExam.examName,
          subject: subName,
          marksObtained: 0,
          maxMarks: 100,
          published: false,
        });
      });
    });

    setLocalFallbackMarks((prev) => [...prev, ...generated]);
  }

  // Filter marks for selected class and exam strictly
  const filteredMarks = useMemo(() => {
    if (!Array.isArray(marks)) return [];

    return marks.filter((m) => {
      if (!m || typeof m !== "object") return false;

      // Exam filter: must match selected exam
      if (selectedExamId) {
        const examIdStr = m.examId != null ? String(m.examId) : "";
        if (examIdStr !== selectedExamId) return false;
      }

      // Class filter: strictly check class membership
      if (selectedClassId) {
        const clsIdStr = m.classId != null ? String(m.classId) : "";
        const clsNameStr = m.className ? String(m.className).toLowerCase() : "";
        const targetCls = selectedClass?.name ? selectedClass.name.toLowerCase() : "";

        const matchClassId = clsIdStr === selectedClassId;
        const matchClassName = targetCls && clsNameStr.includes(targetCls);
        const matchClassStudent = classStudentIdsSet.has(String(m.studentId));

        if (classStudentIdsSet.size > 0) {
          if (!matchClassId && !matchClassName && !matchClassStudent) {
            return false;
          }
        } else if (m.classId != null) {
          if (!matchClassId && !matchClassName) {
            return false;
          }
        }
      }

      // Search query filter by student name / ID / subject
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const resolvedName = (studentMap[m.studentId] || m.studentName || "").toLowerCase();
        const subMatch = (m.subject || "").toLowerCase().includes(q);
        const idMatch = String(m.studentId).toLowerCase().includes(q);
        if (!resolvedName.includes(q) && !subMatch && !idMatch) return false;
      }

      return true;
    });
  }, [marks, selectedClassId, selectedClass, selectedExamId, searchQuery, studentMap, classStudentIdsSet]);

  // Group marks by Student (Student-Wise Result)
  const studentWiseResults = useMemo(() => {
    const groups: Record<
      string,
      {
        studentId: string;
        studentName: string;
        className: string;
        examName: string;
        subjects: Array<{
          id: number;
          subject: string;
          marksObtained: number;
          maxMarks: number;
          published: boolean;
          rawRecord: MarkRecord;
        }>;
        totalObtained: number;
        totalMax: number;
        percentage: number;
        grade: string;
        allPublished: boolean;
      }
    > = {};

    filteredMarks.forEach((m) => {
      const sId = String(m.studentId || "1");
      const resolvedName =
        studentMap[sId] ||
        (m.studentName && m.studentName !== "Student" && m.studentName !== sId
          ? m.studentName
          : `Student #${sId}`);
      const clsName = m.className || selectedClass?.name || "Class";
      const exName = m.examName || selectedExam?.examName || "Exam Series";

      if (!groups[sId]) {
        groups[sId] = {
          studentId: sId,
          studentName: resolvedName,
          className: clsName,
          examName: exName,
          subjects: [],
          totalObtained: 0,
          totalMax: 0,
          percentage: 0,
          grade: "F",
          allPublished: true,
        };
      }

      groups[sId].subjects.push({
        id: m.id,
        subject: m.subject,
        marksObtained: m.marksObtained,
        maxMarks: m.maxMarks || 100,
        published: m.published,
        rawRecord: m,
      });

      groups[sId].totalObtained += m.marksObtained || 0;
      groups[sId].totalMax += m.maxMarks || 100;
      if (!m.published) {
        groups[sId].allPublished = false;
      }
    });

    const list = Object.values(groups).map((g) => {
      const pct = g.totalMax > 0 ? (g.totalObtained / g.totalMax) * 100 : 0;
      let grade = "F";
      if (pct >= 90) grade = "A+";
      else if (pct >= 80) grade = "A";
      else if (pct >= 70) grade = "B";
      else if (pct >= 60) grade = "C";
      else if (pct >= 50) grade = "D";

      return {
        ...g,
        percentage: pct,
        grade,
      };
    });

    list.sort((a, b) => b.percentage - a.percentage);

    return list.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [filteredMarks, selectedClass, selectedExam, studentMap]);

  // Compute stats
  const totalRecords = filteredMarks.length;
  const totalStudentsCount = studentWiseResults.length;
  const draftCount = filteredMarks.filter((m) => !m.published).length;
  const publishedCount = filteredMarks.filter((m) => m.published).length;

  function handlePublishClass() {
    if (!selectedClassId || !selectedExamId) return;
    publishClassMut.mutate({ classId: selectedClassId, examId: selectedExamId });
  }

  function handlePublishOverall() {
    const targetExam = selectedExamId || (exams[0]?.id ? String(exams[0].id) : "1");
    publishOverallMut.mutate(targetExam);
  }

  const isClassSelected = !!selectedClassId;
  const isExamSelected = !!selectedExamId;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-900 to-purple-900 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-violet-200 backdrop-blur-sm border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Marks Approval & Publishing Workspace
            </div>
            <h2 className="font-montserrat text-3xl font-bold tracking-tight">
              Marks & Results Approval Center
            </h2>
            <p className="text-sm text-violet-200 max-w-2xl leading-relaxed">
              Click on a class box below, choose an exam series, review student-wise report card breakdowns, edit scores, and publish official results to student report cards.
            </p>
          </div>

          {/* Action Header Controls when exam & class selected */}
          {isClassSelected && isExamSelected && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handlePublishClass}
                disabled={publishClassMut.isPending || totalRecords === 0}
                className="flex items-center gap-2 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-3 text-sm font-semibold shadow-lg shadow-indigo-950/30 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {publishClassMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Layers className="h-4 w-4" />
                )}
                Publish Class Results ({selectedClass?.name})
              </button>

              <button
                onClick={handlePublishOverall}
                disabled={publishOverallMut.isPending || totalRecords === 0}
                className="flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-3 text-sm font-semibold shadow-lg shadow-emerald-950/30 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {publishOverallMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                Publish All School Results
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STAGE 1: Class Selection Cards Grid (When no Class is selected) */}
      {!isClassSelected && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-montserrat text-xl font-bold text-slate-900">
                Step 1: Select a Class Box
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Click on any class box below to select an exam and view student-wise results.
              </p>
            </div>
            <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-3.5 py-1.5 rounded-full border border-violet-100 font-montserrat">
              {classes.length} Classes Available
            </span>
          </div>

          {classesLoading ? (
            <div className="py-24 text-center text-slate-400">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-violet-600" />
              Loading class boxes...
            </div>
          ) : classes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-violet-200 p-12 text-center text-slate-500">
              No classes found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => handleSelectClassBox(cls.id)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition-all duration-200 hover:border-violet-400 hover:shadow-md hover:-translate-y-1 text-left"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full group-hover:bg-violet-100">
                        Class Box
                      </span>
                    </div>

                    <div>
                      <h4 className="font-montserrat text-lg font-bold text-slate-900">
                        Class {cls.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Students: <span className="font-semibold text-slate-700">{cls.totalStudents ?? 0}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-violet-600 group-hover:text-violet-800">
                    <span>Select Class & Exam</span>
                    <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STAGE 2: Exam Selector Modal */}
      {examModalOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-violet-100 bg-white p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
                  Step 2: Select Exam
                </span>
                <h3 className="font-montserrat text-xl font-bold text-slate-900">
                  Choose Exam for Class {selectedClass.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExamModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {relevantExams.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs italic">
                  No exam series scheduled for Class {selectedClass.name}
                </div>
              ) : (
                relevantExams.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => handleSelectExam(e.id)}
                    className="w-full text-left p-4 rounded-2xl border border-violet-100 hover:border-violet-400 hover:bg-violet-50/50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{e.examName}</p>
                        <p className="text-xs text-slate-500">
                          {e.schoolClass ? `Class ${e.schoolClass.name}` : "School-wide Series"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleResetSelection()}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Back to All Class Boxes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: Marks & Results Approval Center (When Class & Exam are selected) */}
      {isClassSelected && isExamSelected && selectedClass && selectedExam && (
        <div className="space-y-6">
          {/* Breadcrumb Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap text-sm font-semibold">
              <button
                type="button"
                onClick={handleResetSelection}
                className="flex items-center gap-1 text-violet-600 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                All Class Boxes
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-bold">Class {selectedClass.name}</span>
              <span className="text-slate-300">/</span>
              <span className="text-violet-900 font-extrabold">{selectedExam.examName}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setExamModalOpen(true)}
                className="text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3.5 py-1.5 rounded-xl transition"
              >
                Change Exam
              </button>
            </div>
          </div>

          {/* Controls Bar: Search & View Mode Switcher */}
          <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-violet-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by Student Name or Subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-violet-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 font-medium transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("student")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "student"
                    ? "bg-white text-violet-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="h-4 w-4 text-violet-600" />
                Student-Wise View ({totalStudentsCount})
              </button>
              <button
                type="button"
                onClick={() => setViewMode("subject")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "subject"
                    ? "bg-white text-violet-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="h-4 w-4 text-violet-600" />
                All Subjects Table ({totalRecords})
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: Student-Wise Result Breakdown Cards */}
          {viewMode === "student" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-montserrat text-lg font-bold text-slate-900">
                    Student-Wise Report Cards ({studentWiseResults.length} Students in Class {selectedClass.name})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Consolidated subject marks, percentages, overall grades, and ranks for Class {selectedClass.name}.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Draft: {draftCount}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Published: {publishedCount}
                  </span>
                </div>
              </div>

              {marksLoading ? (
                <div className="py-24 text-center text-slate-400">
                  <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-violet-600" />
                  Loading student-wise results for Class {selectedClass.name}...
                </div>
              ) : studentWiseResults.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-violet-200 bg-white p-12 text-center text-slate-500 space-y-4">
                  <AlertCircle className="mx-auto h-10 w-10 text-slate-300" />
                  <div>
                    <p className="font-bold text-slate-800 text-base">
                      No marks recorded yet for Class {selectedClass.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      There are no marks submitted for Class {selectedClass.name} in {selectedExam.examName}. You can initialize draft records to enter scores for this class.
                    </p>
                  </div>
                  {classStudents.length > 0 && (
                    <button
                      type="button"
                      onClick={handleInitializeClassFallback}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-violet-500 hover:to-indigo-500 transition-all"
                    >
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      Initialize Draft Marks for Class {selectedClass.name} ({classStudents.length} Students)
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studentWiseResults.map((sr) => (
                    <div
                      key={sr.studentId}
                      className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-violet-300 transition-all flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-4">
                        {/* Student Card Header */}
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 font-bold text-white shadow-sm shrink-0">
                              <User className="h-5.5 w-5.5" />
                            </div>
                            <div>
                              <h4 className="font-montserrat text-base font-bold text-slate-900 leading-snug">
                                {sr.studentName}
                              </h4>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800 border border-amber-200">
                              <Trophy className="h-3.5 w-3.5 text-amber-600" />
                              #{sr.rank}
                            </span>
                          </div>
                        </div>

                        {/* Summary Numbers */}
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase">Total Marks</p>
                            <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                              {sr.totalObtained} <span className="text-[11px] font-medium text-slate-400">/ {sr.totalMax}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase">Percentage</p>
                            <p className="text-sm font-black text-violet-700 mt-0.5">
                              {sr.percentage.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase">Grade</p>
                            <p className="text-sm font-black text-emerald-700 mt-0.5">
                              {sr.grade}
                            </p>
                          </div>
                        </div>

                        {/* Subject Marks List */}
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5 text-violet-500" />
                            Subject Breakdown ({sr.subjects.length})
                          </p>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {sr.subjects.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-violet-50/40 border border-violet-100/60 hover:bg-violet-50 transition-colors"
                              >
                                <span className="text-xs font-bold text-slate-800">
                                  {sub.subject}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-violet-900">
                                    {sub.marksObtained} <span className="text-[10px] text-slate-400 font-normal">/ {sub.maxMarks}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(sub.rawRecord)}
                                    className="p-1 text-slate-400 hover:text-violet-600 transition"
                                    title="Edit Subject Score"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {sr.allPublished ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 border border-amber-200">
                            <AlertCircle className="h-3 w-3 text-amber-600" />
                            Draft (Pending)
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setViewingStudentCard(sr)}
                          className="inline-flex items-center gap-1 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 text-xs font-bold text-violet-700 transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Report Card
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: Subject Marks Table */}
          {viewMode === "subject" && (
            <div className="rounded-2xl border border-violet-100 bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-violet-50 bg-slate-50/50 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Subject Marks List — Class {selectedClass.name} ({filteredMarks.length} records)
                </p>
                <p className="text-xs text-slate-400">
                  Draft marks are hidden from students until published.
                </p>
              </div>

              <div className="overflow-x-auto">
                {marksLoading ? (
                  <div className="py-24 text-center text-slate-400">
                    <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-violet-600" />
                    Loading marks for Class {selectedClass.name}...
                  </div>
                ) : filteredMarks.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 space-y-4">
                    <AlertCircle className="mx-auto h-10 w-10 text-slate-300" />
                    <div>
                      <p className="font-bold text-slate-800 text-base">No marks recorded yet for Class {selectedClass.name}</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        No student marks have been submitted for Class {selectedClass.name} in {selectedExam.examName} yet.
                      </p>
                    </div>
                    {classStudents.length > 0 && (
                      <button
                        type="button"
                        onClick={handleInitializeClassFallback}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-violet-500 hover:to-indigo-500 transition-all"
                      >
                        <Sparkles className="h-4 w-4 text-amber-300" />
                        Initialize Draft Marks for Class {selectedClass.name} ({classStudents.length} Students)
                      </button>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-violet-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3.5 px-4">Student Name</th>
                        <th className="py-3.5 px-4">Subject</th>
                        <th className="py-3.5 px-4">Marks Obtained</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right pr-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-violet-50">
                      {filteredMarks.map((m) => {
                        const resolvedStudentName =
                          studentMap[m.studentId] ||
                          (m.studentName && m.studentName !== "Student" && m.studentName !== String(m.studentId)
                            ? m.studentName
                            : `Student #${m.studentId}`);

                        return (
                          <tr key={m.id} className="hover:bg-violet-50/20 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              <div>
                                <span>{resolvedStudentName}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-violet-900">
                              {m.subject}
                            </td>
                            <td className="py-3.5 px-4 font-extrabold text-slate-900">
                              {m.marksObtained} <span className="text-xs font-medium text-slate-400">/ {m.maxMarks || 100}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              {m.published ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  Published
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                                  Draft (Pending)
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right pr-6">
                              <button
                                type="button"
                                onClick={() => openEditModal({ ...m, studentName: resolvedStudentName })}
                                className="inline-flex items-center gap-1 rounded-xl border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 transition-colors shadow-2xs"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                Edit Score
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STUDENT REPORT CARD PREVIEW MODAL */}
      {viewingStudentCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-violet-100 bg-white p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-800 text-white font-bold shadow-sm">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-montserrat text-xl font-bold text-slate-900">
                    Official Student Report Card Preview
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {viewingStudentCard.studentName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingStudentCard(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Banner Summary */}
            <div className="rounded-2xl bg-gradient-to-r from-violet-900 to-indigo-900 p-6 text-white space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300">Examination</p>
                  <p className="text-lg font-bold">{viewingStudentCard.examName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300">Class Rank</p>
                  <p className="text-xl font-black text-amber-300">#{viewingStudentCard.rank}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
                  <p className="text-[10px] font-bold uppercase text-violet-200">Total Marks</p>
                  <p className="text-lg font-black">{viewingStudentCard.totalObtained} / {viewingStudentCard.totalMax}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
                  <p className="text-[10px] font-bold uppercase text-violet-200">Percentage</p>
                  <p className="text-lg font-black text-emerald-300">{viewingStudentCard.percentage.toFixed(1)}%</p>
                </div>
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
                  <p className="text-[10px] font-bold uppercase text-violet-200">Overall Grade</p>
                  <p className="text-lg font-black text-amber-300">{viewingStudentCard.grade}</p>
                </div>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="space-y-3">
              <h4 className="font-montserrat text-sm font-bold text-slate-800 uppercase tracking-wider">
                Subject Performance Breakdown
              </h4>
              <table className="w-full text-left text-sm border-collapse rounded-xl overflow-hidden border border-slate-100">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Marks Obtained</th>
                    <th className="py-3 px-4">Max Marks</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4 text-right pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingStudentCard.subjects.map((s: any) => {
                    const pct = s.maxMarks > 0 ? (s.marksObtained / s.maxMarks) * 100 : 0;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{s.subject}</td>
                        <td className="py-3 px-4 font-extrabold text-violet-900">{s.marksObtained}</td>
                        <td className="py-3 px-4 text-slate-500 font-medium">{s.maxMarks}</td>
                        <td className="py-3 px-4 font-bold text-slate-700">{pct.toFixed(0)}%</td>
                        <td className="py-3 px-4 text-right pr-4">
                          {s.published ? (
                            <span className="text-xs font-semibold text-emerald-700">Published</span>
                          ) : (
                            <span className="text-xs font-semibold text-amber-700">Draft</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingStudentCard(null)}
                className="rounded-xl bg-violet-600 text-white px-5 py-2.5 text-xs font-bold hover:bg-violet-700 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mark Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-violet-100 bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-montserrat text-lg font-bold text-slate-900">
                Edit Student Marks
              </h3>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1 text-slate-600 border border-slate-100">
                <p><span className="font-semibold text-slate-800">Student:</span> {editingRecord.studentName}</p>
                <p><span className="font-semibold text-slate-800">Subject:</span> {editingRecord.subject}</p>
                <p><span className="font-semibold text-slate-800">Exam:</span> {editingRecord.examName}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Marks Obtained
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  min="0"
                  max={editMaxMarks || 100}
                  value={editScore}
                  onChange={(e) => {
                    const valStr = e.target.value;
                    if (valStr === "") {
                      setEditScore("");
                      return;
                    }
                    const num = parseFloat(valStr);
                    if (!isNaN(num) && num >= 0) {
                      setEditScore(valStr);
                    }
                  }}
                  className="w-full rounded-xl border border-violet-200 bg-white px-3.5 py-2.5 text-base font-bold text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Maximum Marks
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={editMaxMarks}
                  onChange={(e) => setEditMaxMarks(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMarkMut.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white hover:bg-violet-700 shadow-sm disabled:opacity-50"
                >
                  {updateMarkMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
