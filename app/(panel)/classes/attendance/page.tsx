"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useClassesList, useSectionsByClassId, useStudentsByClassId, useStudentsByClassAndSectionId } from "@/hooks/useAdminClasses";
import { useMarkClassAttendance, useAttendanceHistory } from "@/hooks/useAttendance";
import { getStudentId, studentDisplayName } from "@/lib/api/students";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Calendar, Search, Loader2, Users, CheckCircle2, AlertTriangle, XCircle, Check } from "lucide-react";
import { toast } from "sonner";

function AttendanceMarkingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const classIdParam = searchParams.get("classId");
  const sectionIdParam = searchParams.get("sectionId");
  const dateParam = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");

  const classId = classIdParam ? parseInt(classIdParam, 10) : null;
  const sectionId = sectionIdParam ? parseInt(sectionIdParam, 10) : null;

  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  const { data: sections = [], isLoading: sectionsLoading } = useSectionsByClassId(classId || 0);

  const classItem = useMemo(() => classes.find((c) => c.id === classId), [classes, classId]);
  const sectionItem = useMemo(() => sections.find((s) => s.id === sectionId), [sections, sectionId]);

  // Load students
  const { data: allStudents = [], isLoading: isLoadingAll } = useStudentsByClassId(classId || 0);
  const { data: sectionStudents = [], isLoading: isLoadingSection } = useStudentsByClassAndSectionId(
    classId || 0,
    sectionId || 0
  );

  const students = sectionId ? sectionStudents : allStudents;
  const totalStudents = students.length;

  // Load attendance history for date
  const { data: history = [], isLoading: isLoadingHistory, isFetching } = useAttendanceHistory(dateParam);

  const isLoading = classesLoading || sectionsLoading || (sectionId ? isLoadingSection : isLoadingAll) || isLoadingHistory;

  const markMut = useMarkClassAttendance();

  const [attendance, setAttendance] = useState<Record<string, "PRESENT" | "ABSENT">>({});
  const [loadedKey, setLoadedKey] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const currentKey = `${classId || 0}-${sectionId || 0}-${dateParam}`;

  // Populate attendance from history once loaded
  useEffect(() => {
    if (!isLoading && !isFetching && currentKey !== loadedKey) {
      const newAtt: Record<string, "PRESENT" | "ABSENT"> = {};
      students.forEach((s) => {
        const id = getStudentId(s);
        if (id) {
          const histItem = history.find((h) => String(h.studentId) === id);
          if (histItem) {
            const status = histItem.status?.toUpperCase();
            if (status === "PRESENT" || status === "ABSENT") {
              newAtt[id] = status;
            }
          }
        }
      });
      setAttendance(newAtt);
      setLoadedKey(currentKey);
    }
  }, [isLoading, isFetching, currentKey, loadedKey, history, students]);

  const absentCount = Object.values(attendance).filter((s) => s === "ABSENT").length;
  const presentCount = Object.values(attendance).filter((s) => s === "PRESENT").length;
  const notSetCount = totalStudents - (absentCount + presentCount);

  function handleDateChange(newDate: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate);
    router.push(`/classes/attendance?${params.toString()}`);
  }

  function markStudent(id: string, status: "PRESENT" | "ABSENT") {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  }

  function markAllPresent() {
    const newAtt: Record<string, "PRESENT" | "ABSENT"> = {};
    students.forEach((s) => {
      const id = getStudentId(s);
      if (id) newAtt[id] = "PRESENT";
    });
    setAttendance(newAtt);
    toast.info("Marked all students as present locally");
  }

  function clearAll() {
    setAttendance({});
  }

  function saveAttendance() {
    if (totalStudents === 0 || !classId) return;

    if (notSetCount > 0) {
      if (!confirm(`There are ${notSetCount} students unmarked. Unmarked students will be recorded as PRESENT by default. Save attendance?`)) {
        return;
      }
    }

    const absentIds = Object.entries(attendance)
      .filter(([_, status]) => status === "ABSENT")
      .map(([id]) => id);

    markMut.mutate({
      classId,
      sectionId: sectionId || undefined,
      date: dateParam,
      absentStudentIds: absentIds
    }, {
      onSuccess: () => {
        setLoadedKey(""); // Reset to force refetch
      }
    });
  }

  // Filter students based on search input
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const q = searchQuery.toLowerCase();
    return students.filter((s) => {
      const nameMatch = studentDisplayName(s).toLowerCase().includes(q);
      const rollMatch = s.rollNumber?.toLowerCase().includes(q);
      return nameMatch || rollMatch;
    });
  }, [students, searchQuery]);

  if (isLoading && classes.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-sky-100 bg-white shadow-sm">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-sky-500" />
          Loading class and student list...
        </div>
      </div>
    );
  }

  if (!classId || !classItem) {
    return (
      <div className="space-y-6">
        <Link
          href={`/classes?date=${dateParam}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 transition hover:text-sky-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to classes
        </Link>
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/20">
          <p className="text-sm font-medium text-rose-700/80">
            Invalid class selection. Please go back and select a class.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href={`/classes?date=${dateParam}`}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 transition hover:text-sky-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to classes
          </Link>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            Attendance Log
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Class {classItem.name} {sectionItem ? `• Section ${sectionItem.name}` : ""}
          </p>
        </div>

        {/* Date Selector */}
        <div className="relative flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-200 transition-all w-fit">
          <Calendar className="h-5 w-5 text-sky-500 pointer-events-none" />
          <input
            type="date"
            value={dateParam}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-transparent text-slate-700 outline-none cursor-pointer font-semibold"
          />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students</p>
            <p className="text-xl font-bold text-slate-800 leading-tight">{totalStudents}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-emerald-100 bg-emerald-50/20 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100/50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-wider">Present</p>
            <p className="text-xl font-bold text-emerald-800 leading-tight">{presentCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-rose-100 bg-rose-50/20 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100/50 text-rose-600 shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-rose-600/80 uppercase tracking-wider">Absent</p>
            <p className="text-xl font-bold text-rose-800 leading-tight">{absentCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-amber-100 bg-amber-50/20 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100/50 text-amber-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-amber-600/80 uppercase tracking-wider">Not Marked</p>
            <p className="text-xl font-bold text-amber-800 leading-tight">{notSetCount}</p>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="rounded-2xl border border-sky-100 bg-white shadow-sm overflow-hidden">
        {/* Controls header */}
        <div className="border-b border-sky-50 bg-slate-50/30 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Front-end Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search student by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllPresent}
              disabled={totalStudents === 0 || markMut.isPending}
              className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-100 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Mark All Present
            </button>
            <button
              onClick={clearAll}
              disabled={totalStudents === 0 || markMut.isPending}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Student list table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-24 text-center text-slate-400">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-sky-500" />
              Fetching attendance records...
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              No students enrolled in this class/section yet.
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              No students match search filter &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <table className="w-full min-w-[600px] text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-sky-50 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4 text-right pr-12">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.map((s, index) => {
                  const id = getStudentId(s) ?? `row-${index}`;
                  const currentStatus = attendance[id];

                  return (
                    <tr key={id} className="hover:bg-sky-50/20 transition-colors">
                      <td className="px-6 py-4.5 font-semibold text-slate-900">
                        {studentDisplayName(s)}
                      </td>
                      <td className="px-6 py-4.5 font-medium text-slate-500">
                        {s.rollNumber || "—"}
                      </td>
                      <td className="px-6 py-4.5 text-right pr-12">
                        <div className="inline-flex gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
                          <button
                            type="button"
                            onClick={() => markStudent(id, "PRESENT")}
                            disabled={markMut.isPending}
                            className={`flex items-center gap-1 px-4 py-1.5 text-xs font-semibold rounded-md transition-all active:scale-[0.97] ${
                              currentStatus === "PRESENT"
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "text-slate-600 hover:bg-white/80"
                            }`}
                          >
                            {currentStatus === "PRESENT" && <Check className="h-3 w-3" />}
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => markStudent(id, "ABSENT")}
                            disabled={markMut.isPending}
                            className={`flex items-center gap-1 px-4 py-1.5 text-xs font-semibold rounded-md transition-all active:scale-[0.97] ${
                              currentStatus === "ABSENT"
                                ? "bg-rose-500 text-white shadow-sm"
                                : "text-slate-600 hover:bg-white/80"
                            }`}
                          >
                            {currentStatus === "ABSENT" && <Check className="h-3 w-3" />}
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer save section */}
        {totalStudents > 0 && (
          <div className="border-t border-sky-50 p-6 flex justify-end gap-3 bg-slate-50/30">
            <Link
              href={`/classes?date=${dateParam}`}
              className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={saveAttendance}
              disabled={markMut.isPending || isLoading}
              className="rounded-xl bg-sky-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center gap-2"
            >
              {markMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {markMut.isPending ? "Saving Records..." : "Save Attendance"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AttendanceMarkingPage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center rounded-2xl border border-sky-100 bg-white">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-sky-500" />
          Loading attendance workspace...
        </div>
      </div>
    }>
      <AttendanceMarkingContent />
    </Suspense>
  );
}
