"use client";

import { useAttendanceStats, useAttendanceHistory } from "@/hooks/useAttendance";
import { format } from "date-fns";
import ClassesGrid from "./ClassesGrid";

export default function AttendanceOverviewPanel({ date }: { date: string }) {
  const { data: stats, isLoading: statsLoading } = useAttendanceStats(date);
  const { data: history = [], isLoading: historyLoading } = useAttendanceHistory(date);

  const isLoading = statsLoading || historyLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-violet-100 bg-white">
        <div className="flex flex-col items-center text-slate-500">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          Loading school overview...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Enrolled</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-bold text-slate-900">{stats?.totalStudentsInSchool || 0}</h3>
            <span className="text-sm font-medium text-slate-500 mb-1">students</span>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm">
          <p className="text-xs font-semibold text-blue-600/80 uppercase tracking-wider mb-1">Marked Today</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-bold text-blue-900">{stats?.totalStudentsMarked || 0}</h3>
            <span className="text-sm font-medium text-blue-700/80 mb-1">students</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600/80 uppercase tracking-wider mb-1">Present Today</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-bold text-emerald-900">{stats?.totalPresent || 0}</h3>
            <span className="text-sm font-medium text-emerald-700/80 mb-1">students</span>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6 shadow-sm">
          <p className="text-xs font-semibold text-rose-600/80 uppercase tracking-wider mb-1">Absent Today</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-bold text-rose-900">{stats?.totalAbsent || 0}</h3>
            <span className="text-sm font-medium text-rose-700/80 mb-1">students</span>
          </div>
        </div>
      </div>

      {/* Full History Data Table */}
      <section className="mb-6">
        <ClassesGrid date={date} />
      </section>
      
      <div className="rounded-2xl border border-violet-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-violet-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-montserrat text-lg font-semibold text-slate-900">
              School Attendance History
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {format(new Date(date), "dd MMMM yyyy")}
            </p>
          </div>
          <div className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
            {history.length} Records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white border-b border-violet-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Reg. ID</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-100 bg-white">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No attendance records found for today.
                  </td>
                </tr>
              ) : (
                history.map((record, idx) => (
                  <tr key={`${record.studentId}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-violet-600">
                      {record.studentRegistrationId || `ID: ${record.studentId}`}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {record.studentName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {record.className}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {record.status === "PRESENT" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                          Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
