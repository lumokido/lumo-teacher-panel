"use client";

import { useClassesList } from "@/hooks/useAdminClasses";
import { useTeachersList } from "@/hooks/useAdminTeachers";
import { useAttendanceStats } from "@/hooks/useAttendance";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { format } from "date-fns";
import Link from "next/link";
import { 
  Users, 
  GraduationCap, 
  School, 
  CalendarDays, 
  Megaphone, 
  ArrowRight,
  PlusCircle,
  ClipboardList
} from "lucide-react";

export default function PrincipalDashboardPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  
  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachersList();
  const { data: attendanceStats, isLoading: attendanceLoading } = useAttendanceStats(today);
  const { data: announcements = [], isLoading: announcementsLoading } = useAnnouncements();

  const isLoading = classesLoading || teachersLoading || attendanceLoading || announcementsLoading;

  // Split and take latest 3 of each
  const bulletins = announcements
    .filter((a) => a.type === "ANNOUNCEMENT")
    .slice(0, 3);
  const events = announcements
    .filter((a) => a.type === "EVENT")
    .slice(0, 3);

  const totalStudents = attendanceStats?.totalStudentsInSchool || 0;
  const attendanceRate = totalStudents > 0 
    ? ((attendanceStats?.totalPresent || 0) / totalStudents * 100).toFixed(1)
    : "—";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <p className="mb-2 text-sm font-medium text-violet-600">Welcome back, Director</p>
        <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
          Alphores  Administration
        </h2>
        <p className="mt-2 text-slate-600">
          Get a quick overview of your school's daily stats, announcements, and quick tools.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</p>
            <h3 className="text-3xl font-extrabold text-slate-900">
              {isLoading ? "..." : totalStudents}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Total Teachers */}
        <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff Teachers</p>
            <h3 className="text-3xl font-extrabold text-slate-900">
              {isLoading ? "..." : teachers.length}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        {/* Total Classes */}
        <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Classes</p>
            <h3 className="text-3xl font-extrabold text-slate-900">
              {isLoading ? "..." : classes.length}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <School className="h-6 w-6" />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-emerald-700/80 uppercase tracking-wider">Attendance Rate</p>
            <h3 className="text-3xl font-extrabold text-emerald-900">
              {isLoading ? "..." : `${attendanceRate}%`}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CalendarDays className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Notices Feed & Quick Shortcuts */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Bulletins Board */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-montserrat text-xl font-bold text-slate-800 flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-violet-500" />
              Latest Bulletins
            </h3>
            <Link 
              href="/principal/announcements" 
              className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 transition"
            >
              Manage Board <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-slate-400">
              <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
              Loading bulletins...
            </div>
          ) : bulletins.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
              No bulletins published yet.
            </div>
          ) : (
            <div className="space-y-4">
              {bulletins.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-violet-100/50 bg-white p-5 shadow-sm hover:shadow-md hover:border-violet-200 transition-all"
                >
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-violet-700">Bulletin</span>
                    <span>{format(new Date(item.startDate), "MMMM dd, yyyy")}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-base">{item.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 line-clamp-2">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Shortcuts */}
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-montserrat text-xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-slate-700" />
              Quick Actions
            </h3>
          </div>

          <div className="grid gap-4">
            <Link
              href="/principal/teachers/add"
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:border-violet-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-950 text-sm">Add Teacher</h4>
                  <p className="text-xs text-slate-500">Register new staff profile</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-violet-600 transition" />
            </Link>

            <Link
              href="/principal/classes"
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:border-violet-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition">
                  <School className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-950 text-sm">Classes & Students</h4>
                  <p className="text-xs text-slate-500">Manage school enrollment</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-violet-600 transition" />
            </Link>

            <Link
              href="/principal/attendance"
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:border-violet-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-950 text-sm">Attendance Stats</h4>
                  <p className="text-xs text-slate-500">Track daily student records</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-violet-600 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

