"use client";

import { useState, useMemo, useEffect } from "react";
import { useStudentsByClassId, useStudentsByClassAndSectionId, useSectionsByClassId } from "@/hooks/useAdminClasses";
import { useMarkClassAttendance, useAttendanceHistory } from "@/hooks/useAttendance";
import type { ClassItem } from "@/lib/api/adminClasses";
import { getStudentId, studentDisplayName } from "@/lib/api/students";

type Props = {
  classItem: ClassItem;
  sectionId: number | null;
  date: string;
};

export default function MarkAttendancePanel({ classItem, sectionId, date }: Props) {
  const { data: sections = [] } = useSectionsByClassId(classItem.id);
  const section = useMemo(() => sections.find((s) => s.id === sectionId), [sections, sectionId]);

  const { data: allStudents = [], isLoading: isLoadingAll } = useStudentsByClassId(classItem.id);
  const { data: sectionStudents = [], isLoading: isLoadingSection } = useStudentsByClassAndSectionId(
    classItem.id,
    sectionId || 0
  );

  const students = sectionId ? sectionStudents : allStudents;
  const { data: history = [], isLoading: isLoadingHistory, isFetching } = useAttendanceHistory(date);
  const isLoading = (sectionId ? isLoadingSection : isLoadingAll) || isLoadingHistory;
  const totalStudents = students.length;

  const markMut = useMarkClassAttendance();

  const [attendance, setAttendance] = useState<Record<string, "PRESENT" | "ABSENT">>({});
  const [loadedKey, setLoadedKey] = useState<string>("");
  const currentKey = `${classItem.id}-${sectionId || 0}-${date}`;

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
  const [searchQuery, setSearchQuery] = useState("");

  const absentCount = Object.values(attendance).filter((s) => s === "ABSENT").length;
  const presentCount = Object.values(attendance).filter((s) => s === "PRESENT").length;
  const notSetCount = totalStudents - (absentCount + presentCount);

  const presentPercentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(2) : "0.00";
  const absentPercentage = totalStudents > 0 ? ((absentCount / totalStudents) * 100).toFixed(2) : "0.00";

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
  }

  function clearAll() {
    setAttendance({});
  }

  function submitAttendance() {
    if (totalStudents === 0) return;

    // Optional: Warn if not all students are marked
    if (notSetCount > 0) {
      if (!confirm(`There are ${notSetCount} students without a marked status. Unmarked students will be considered PRESENT by default. Continue?`)) {
        return;
      }
    }

    const absentIds = Object.entries(attendance)
      .filter(([_, status]) => status === "ABSENT")
      .map(([id]) => id);

    markMut.mutate({
      classId: classItem.id,
      sectionId: sectionId || undefined,
      date: date,
      absentStudentIds: absentIds
    }, {
      onSuccess: () => {
        setLoadedKey("");
      }
    });
  }

  const filteredStudents = students.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = studentDisplayName(s).toLowerCase().includes(q);
    const rollMatch = s.rollNumber?.toLowerCase().includes(q);
    return nameMatch || rollMatch;
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-violet-100 bg-white">
        <div className="flex flex-col items-center text-slate-500">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          Loading students...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-violet-100 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-violet-100 p-6 flex items-center justify-between">
        <h3 className="font-montserrat text-lg font-semibold text-slate-900">
          Mark Attendance - {classItem.name} {section ? `(Section ${section.name})` : ""}
        </h3>
        <button
          onClick={markAllPresent}
          disabled={totalStudents === 0 || markMut.isPending}
          className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
        >
          Mark All Present
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Students</p>
              <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600/80 uppercase tracking-wider">Present</p>
              <p className="text-2xl font-bold text-emerald-900">{presentCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-rose-100 bg-rose-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-rose-600/80 uppercase tracking-wider">Absent</p>
              <p className="text-2xl font-bold text-rose-900">{absentCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Not Set</p>
              <p className="text-2xl font-bold text-slate-700">{notSetCount}</p>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div>
          <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <label className="font-montserrat text-lg font-semibold text-slate-900">
                Student List
              </label>
              <p className="text-sm text-slate-600">
                Manually select Present or Absent for each student.
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-violet-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 transition-all"
              />
            </div>
          </div>
          
          <div className="rounded-xl border border-violet-100 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-violet-100">
                <tr>
                  <th className="py-3 px-4 font-semibold w-24">Roll No</th>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold text-right w-[200px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-50">
                {filteredStudents.map((s) => {
                  const id = getStudentId(s);
                  if (!id) return null;
                  const status = attendance[id];
                  return (
                    <tr key={id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {s.rollNumber || "—"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {studentDisplayName(s)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                          <button
                            onClick={() => markStudent(id, "PRESENT")}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                              status === "PRESENT"
                                ? "bg-emerald-100 text-emerald-700 shadow-sm"
                                : "text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markStudent(id, "ABSENT")}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                              status === "ABSENT"
                                ? "bg-rose-100 text-rose-700 shadow-sm"
                                : "text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">
                      {searchQuery ? "No students match your search." : "No students found in this class/section."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50/30 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="font-montserrat font-semibold text-slate-900">Attendance Summary</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8 text-center">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Students</p>
                <p className="text-lg font-bold text-slate-900">{totalStudents}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Present</p>
                <p className="text-lg font-bold text-emerald-600">{presentCount} <span className="text-sm font-medium">({presentPercentage}%)</span></p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Absent</p>
                <p className="text-lg font-bold text-rose-600">{absentCount} <span className="text-sm font-medium">({absentPercentage}%)</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={clearAll}
            disabled={Object.keys(attendance).length === 0 || markMut.isPending}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All
          </button>
          
          <button
            onClick={submitAttendance}
            disabled={markMut.isPending || totalStudents === 0}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
          >
            {markMut.isPending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {markMut.isPending ? "Submitting..." : "Submit Attendance"}
          </button>
        </div>
        
        <div className="rounded-xl bg-slate-50 p-4 flex items-start gap-3">
          <svg className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-slate-600">
            Attendance will be saved and visible to students and parents immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
