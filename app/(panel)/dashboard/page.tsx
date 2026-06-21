"use client";

import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useMyHomeroomStats } from "@/hooks/useAttendance";
import { useMyAssignedClasses, useClassesList } from "@/hooks/useAdminClasses";
import { useAllExams } from "@/hooks/useExams";
import { getTimetableByClass } from "@/lib/api/timetable";
import { useQueries } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Percent, 
  CheckCircle, 
  Loader2, 
  Megaphone, 
  Clock, 
  Calendar,
  BookOpen
} from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"bulletins" | "exams" | "timetable">("bulletins");

  const { data: announcements = [], isLoading: announcementsLoading } = useAnnouncements();
  const { data: assignedData, isLoading: assignedLoading } = useMyAssignedClasses();
  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  const { data: exams = [], isLoading: examsLoading } = useAllExams();
  
  // Use today's date formatted as YYYY-MM-DD
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayDayName = format(new Date(), "EEEE");
  const { data: stats, isLoading: statsLoading } = useMyHomeroomStats(todayStr);

  // Split into announcements and events
  const bulletins = announcements.filter((a) => a.type === "ANNOUNCEMENT");
  const events = announcements.filter((a) => a.type === "EVENT");

  // Map teacher's assigned classes to retrieve their class IDs
  const assignedClassNames = assignedData?.assignedClasses || [];
  const teacherClasses = classes.filter((cls) => assignedClassNames.includes(cls.name));
  const teacherClassIds = teacherClasses.map((cls) => cls.id);

  // Fetch timetables in parallel for the teacher's assigned classes
  const timetableQueries = useQueries({
    queries: teacherClassIds.map((classId) => ({
      queryKey: ["timetable", "class", classId],
      queryFn: () => getTimetableByClass(classId),
      enabled: !!classId,
    })),
  });
  
  const timetablesLoading = timetableQueries.some((q) => q.isLoading);

  // Filter Today's Timetable (only matching periods on today's day of the week)
  const allTimetableEntries = timetableQueries.flatMap((q) => q.data || []);
  const todayTimetable = allTimetableEntries
    .filter((entry) => entry.day.toLowerCase() === todayDayName.toLowerCase())
    .sort((a, b) => {
      const classCompare = a.schoolClass.name.localeCompare(b.schoolClass.name);
      if (classCompare !== 0) return classCompare;
      return (a.period || 0) - (b.period || 0);
    });

  // Filter Today's Exams (matching teacher's classes OR school-wide exams scheduled for today)
  const todayExams = exams
    .filter((exam) => {
      const isSchoolWide = !exam.schoolClass;
      const isAssigned = exam.schoolClass?.name && assignedClassNames.includes(exam.schoolClass.name);
      return isSchoolWide || isAssigned;
    })
    .flatMap((exam) => {
      return exam.subjects
        .filter((sub) => sub.examDate === todayStr)
        .map((sub) => ({
          ...sub,
          examName: exam.examName,
          className: exam.schoolClass?.name || "School-Wide",
        }));
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const isBoardLoading = announcementsLoading || assignedLoading || classesLoading || examsLoading || timetablesLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="mb-2 text-sm font-medium text-sky-600">Welcome back</p>
        <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
          Teacher Dashboard
        </h2>
        <p className="mt-2 text-slate-600">
          Manage your classes, students, assignments, and stay updated with school notices.
        </p>
      </div>

      {/* Homeroom Attendance Stats */}
      {assignedLoading || statsLoading ? (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-sky-100 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
            <span>Loading homeroom stats...</span>
          </div>
        </div>
      ) : assignedData?.homeroomClass ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-montserrat text-lg font-bold text-slate-800 flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
                Homeroom: {assignedData.homeroomClass}
              </span>
              <span className="text-slate-500 text-sm font-normal">Today's Attendance Overview ({format(new Date(), "MMMM dd, yyyy")})</span>
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Total Students */}
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</p>
                <p className="text-xl font-extrabold text-slate-800">{stats?.totalStudents ?? 0}</p>
              </div>
            </div>

            {/* Total Marked */}
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Marked</p>
                <p className="text-xl font-extrabold text-slate-800">
                  {stats?.totalMarked ?? 0} / {stats?.totalStudents ?? 0}
                </p>
              </div>
            </div>

            {/* Present */}
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Present</p>
                <p className="text-xl font-extrabold text-slate-800">{stats?.totalPresent ?? 0}</p>
              </div>
            </div>

            {/* Absent */}
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <UserX className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Absent</p>
                <p className="text-xl font-extrabold text-slate-800">{stats?.totalAbsent ?? 0}</p>
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="col-span-2 md:col-span-1 rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Rate</p>
                <p className="text-xl font-extrabold text-slate-800">
                  {stats?.totalStudents && stats.totalStudents > 0
                    ? Math.round((stats.totalPresent / stats.totalStudents) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-sm text-slate-500">
          No homeroom class assigned to your profile.
        </div>
      )}


      {/* Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left/Main Column: Tabbed Notice Board */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="font-montserrat text-xl font-bold text-slate-800 flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-sky-500" />
              School Board
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("bulletins")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "bulletins"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Bulletins
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "bulletins"
                    ? "bg-sky-100 text-sky-700 font-bold"
                    : "bg-slate-200 text-slate-600"
                }`}>
                  {bulletins.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("exams")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "exams"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Today's Exams
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "exams"
                    ? "bg-sky-100 text-sky-700 font-bold"
                    : "bg-slate-200 text-slate-600"
                }`}>
                  {todayExams.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("timetable")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "timetable"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Today's Timetable
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "timetable"
                    ? "bg-sky-100 text-sky-700 font-bold"
                    : "bg-slate-200 text-slate-600"
                }`}>
                  {todayTimetable.length}
                </span>
              </button>
            </div>
          </div>

          {isBoardLoading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
              Loading board items...
            </div>
          ) : activeTab === "bulletins" ? (
            bulletins.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
                No bulletin notices posted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {bulletins.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all"
                  >
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-sky-700">Bulletin</span>
                      <span>{format(new Date(item.startDate), "MMMM dd, yyyy")}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-lg">{item.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === "exams" ? (
            todayExams.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
                No exams scheduled for today ({format(new Date(), "MMMM dd, yyyy")}).
              </div>
            ) : (
              <div className="space-y-4">
                {todayExams.map((paper, idx) => (
                  <div
                    key={`${paper.id}-${idx}`}
                    className="rounded-xl border border-sky-100/50 bg-white p-5 shadow-sm hover:shadow-md hover:border-sky-200 transition-all flex justify-between items-center"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
                        <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-sky-700">
                          {paper.className}
                        </span>
                        <span>{paper.examName}</span>
                      </div>
                      <h4 className="font-semibold text-slate-900 text-lg">{paper.subject}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-sky-500" />
                        {paper.startTime.slice(0, 5)} - {paper.endTime.slice(0, 5)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-400 block">Max Marks</span>
                      <p className="text-xl font-extrabold text-slate-800">{paper.maxMarks}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            todayTimetable.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
                No periods scheduled for today ({todayDayName}).
              </div>
            ) : (
              <div className="space-y-4">
                {todayTimetable.map((entry, idx) => (
                  <div
                    key={`${entry.id || idx}-${idx}`}
                    className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 font-extrabold text-lg">
                        P{entry.period}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-base">{entry.subject}</h4>
                        <p className="text-xs text-slate-500">
                          Class: {entry.schoolClass.name} {entry.section ? ` - Section ${entry.section.name}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                      Scheduled
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Right Column: Events & Calendar */}
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-montserrat text-xl font-bold text-slate-800 flex items-center gap-2">
              <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upcoming Events
            </h3>
          </div>

          {announcementsLoading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
              No school events scheduled.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-xl border border-indigo-50 bg-gradient-to-br from-indigo-50/40 to-white p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex gap-4"
                >
                  <div className="flex flex-col items-center justify-center bg-indigo-600 text-white rounded-lg px-3 py-2 shrink-0 h-fit text-center min-w-[56px]">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {format(new Date(item.startDate), "MMM")}
                    </span>
                    <span className="text-xl font-extrabold leading-none">
                      {format(new Date(item.startDate), "dd")}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 text-base">{item.title}</h4>
                    <p className="mt-1 text-xs text-slate-500">{format(new Date(item.startDate), "EEEE")}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
