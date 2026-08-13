"use client";

import { useState, useMemo, useEffect } from "react";
import { useStudentsByClassId, useStudentsByClassAndSectionId, useSectionsByClassId } from "@/hooks/useAdminClasses";
import { useMarkClassAttendance, useAttendanceHistory } from "@/hooks/useAttendance";
import type { ClassItem } from "@/lib/api/adminClasses";
import { attendanceStatusFromHistory } from "@/lib/api/attendance";
import { getStudentId, studentDisplayName } from "@/lib/api/students";
import { Search, X, Check, Edit3, Users, CheckCircle2, XCircle, Loader2 } from "lucide-react";

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
  const {
    data: history = [],
    isLoading: isLoadingHistory,
    isFetching,
    dataUpdatedAt,
  } = useAttendanceHistory(date);
  const isLoading = (sectionId ? isLoadingSection : isLoadingAll) || isLoadingHistory;
  const totalStudents = students.length;

  const markMut = useMarkClassAttendance();

  const [attendance, setAttendance] = useState<Record<string, "PRESENT" | "ABSENT">>({});
  const [loadedKey, setLoadedKey] = useState("");
  const [syncedAt, setSyncedAt] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PRESENT" | "ABSENT">("ALL");

  const currentKey = `${classItem.id}-${sectionId || 0}-${date}`;

  // Check if attendance records already exist for this date
  const isEditing = useMemo(() => {
    return Array.isArray(history) && history.length > 0;
  }, [history]);

  // Every day defaults to Present; restore Absents from saved history for that date.
  useEffect(() => {
    if (isLoading || isFetching) return;
    if (currentKey === loadedKey && dataUpdatedAt === syncedAt) return;

    const newAtt: Record<string, "PRESENT" | "ABSENT"> = {};
    students.forEach((s) => {
      const id = getStudentId(s);
      if (id) newAtt[id] = attendanceStatusFromHistory(history, s);
    });
    setAttendance(newAtt);
    setLoadedKey(currentKey);
    setSyncedAt(dataUpdatedAt);
  }, [isLoading, isFetching, currentKey, loadedKey, syncedAt, dataUpdatedAt, history, students]);

  const absentCount = useMemo(
    () => Object.values(attendance).filter((s) => s === "ABSENT").length,
    [attendance]
  );
  const presentCount = useMemo(
    () => Object.values(attendance).filter((s) => s === "PRESENT").length,
    [attendance]
  );

  const presentPercentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : "0.0";
  const absentPercentage = totalStudents > 0 ? ((absentCount / totalStudents) * 100).toFixed(1) : "0.0";

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

  function markAllAbsent() {
    const newAtt: Record<string, "PRESENT" | "ABSENT"> = {};
    students.forEach((s) => {
      const id = getStudentId(s);
      if (id) newAtt[id] = "ABSENT";
    });
    setAttendance(newAtt);
  }

  function submitAttendance() {
    if (totalStudents === 0) return;

    const absentIds = Object.entries(attendance)
      .filter(([_, status]) => status === "ABSENT")
      .map(([id]) => id);

    markMut.mutate({
      classId: classItem.id,
      sectionId: sectionId || undefined,
      date,
      absentStudentIds: absentIds,
    });
  }

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const id = getStudentId(s);
      if (!id) return false;
      const status = attendance[id] ?? "PRESENT";

      if (statusFilter === "PRESENT" && status !== "PRESENT") return false;
      if (statusFilter === "ABSENT" && status !== "ABSENT") return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = studentDisplayName(s).toLowerCase().includes(q);
      const rollMatch = (s.rollNumber || s.admissionId || "").toLowerCase().includes(q);
      return nameMatch || rollMatch;
    });
  }, [students, attendance, statusFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-violet-100 bg-white shadow-sm">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-violet-600" />
          Loading students & attendance history...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-violet-100 bg-white shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-violet-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-montserrat text-lg font-semibold text-slate-900">
              {isEditing ? "Edit Attendance" : "Mark Attendance"} - {classItem.name}{" "}
              {section ? `(Section ${section.name})` : ""}
            </h3>
            {isEditing && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200 shadow-xs">
                <Edit3 className="h-3.5 w-3.5 text-amber-600" />
                Editing Saved Records
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Date: <span className="font-semibold text-slate-700">{date}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={markAllPresent}
            disabled={totalStudents === 0 || markMut.isPending}
            className="rounded-xl bg-emerald-50 border border-emerald-200/60 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-all flex items-center gap-1.5 active:scale-[0.98]"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark All Present
          </button>
          <button
            onClick={markAllAbsent}
            disabled={totalStudents === 0 || markMut.isPending}
            className="rounded-xl bg-rose-50 border border-rose-200/60 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-all flex items-center gap-1.5 active:scale-[0.98]"
          >
            <XCircle className="h-4 w-4" />
            Mark All Absent
          </button>
        </div>
      </div>

      <div className="p-6 pt-0 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Students</p>
              <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600/80 uppercase tracking-wider">Present</p>
              <p className="text-2xl font-bold text-emerald-900">
                {presentCount} <span className="text-xs font-semibold text-emerald-700">({presentPercentage}%)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-rose-100 bg-rose-50/70 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-rose-600/80 uppercase tracking-wider">Absent</p>
              <p className="text-2xl font-bold text-rose-900">
                {absentCount} <span className="text-xs font-semibold text-rose-700">({absentPercentage}%)</span>
              </p>
            </div>
          </div>
        </div>

        {/* High Visibility Search and Filter Section */}
        <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4 space-y-3 shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search student by name, roll no, or admission ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-violet-300 bg-white py-2.5 pl-11 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200 shadow-sm transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white p-1 shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  statusFilter === "ALL"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-violet-50"
                }`}
              >
                All ({totalStudents})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("PRESENT")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  statusFilter === "PRESENT"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                Present ({presentCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ABSENT")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  statusFilter === "ABSENT"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-rose-700 hover:bg-rose-50"
                }`}
              >
                Absent ({absentCount})
              </button>
            </div>
          </div>

          {/* Search Result Stats & Hints */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1">
            <span>
              Showing <span className="font-bold text-slate-800">{filteredStudents.length}</span> of{" "}
              <span className="font-bold text-slate-800">{totalStudents}</span> students
              {statusFilter !== "ALL" && ` (Filter: ${statusFilter})`}
              {searchQuery && ` (Search: "${searchQuery}")`}
            </span>
            {(searchQuery || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                className="font-medium text-violet-600 hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Student List Table */}
        <div className="rounded-xl border border-violet-100 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-violet-100 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 w-36">Roll / Adm ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 text-right w-[240px]">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-50">
              {filteredStudents.map((s) => {
                const id = getStudentId(s);
                if (!id) return null;
                const status = attendance[id] ?? "PRESENT";
                return (
                  <tr key={id} className="hover:bg-violet-50/30 transition-colors">
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {s.rollNumber || s.admissionId || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {studentDisplayName(s)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => markStudent(id, "PRESENT")}
                          className={`flex items-center gap-1 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                            status === "PRESENT"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-200/60"
                          }`}
                        >
                          {status === "PRESENT" && <Check className="h-3.5 w-3.5" />}
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => markStudent(id, "ABSENT")}
                          className={`flex items-center gap-1 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                            status === "ABSENT"
                              ? "bg-rose-600 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-200/60"
                          }`}
                        >
                          {status === "ABSENT" && <X className="h-3.5 w-3.5" />}
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="h-8 w-8 text-slate-300" />
                      <p className="font-medium text-slate-700">No students match your current search or filter</p>
                      <p className="text-xs text-slate-400">Try clearing the search input or switching status filter tabs</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Action & Edit Summary Bar */}
        <div className="rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50/60 to-slate-50 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 shrink-0">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {isEditing ? "Ready to save attendance edits" : "Ready to submit attendance"}
              </p>
              <p className="text-xs text-slate-500">
                {presentCount} Present • {absentCount} Absent out of {totalStudents} students
              </p>
            </div>
          </div>

          <button
            onClick={submitAttendance}
            disabled={markMut.isPending || totalStudents === 0}
            className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-[0.98] disabled:opacity-60"
          >
            {markMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : isEditing ? (
              <Edit3 className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {markMut.isPending
              ? "Saving..."
              : isEditing
              ? "Update Attendance"
              : "Submit Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}
