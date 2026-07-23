"use client";

import { useClassesList, useSectionsByClassId } from "@/hooks/useAdminClasses";
import type { ClassItem } from "@/lib/api/adminClasses";
import Link from "next/link";

export default function ClassesGrid({ date }: { date: string }) {
  const { data: classes = [], isLoading } = useClassesList();

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-violet-100 bg-white">
        <div className="flex flex-col items-center text-slate-500">
          <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          Loading classes...
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-violet-200 bg-violet-50/50">
        <p className="text-sm font-medium text-violet-600/60">
          No classes found. Please create classes first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-montserrat text-lg font-semibold text-slate-900">
        Select a Class to Mark Attendance
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <ClassCard key={cls.id} classItem={cls} date={date} />
        ))}
      </div>
    </div>
  );
}

function ClassCard({ classItem, date }: { classItem: ClassItem; date: string }) {
  const { data: sections = [], isLoading } = useSectionsByClassId(classItem.id);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm flex items-center justify-center h-32 animate-pulse">
        <div className="h-4 w-24 bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 text-lg">{classItem.name}</h4>
          <p className="text-xs text-slate-500">{classItem.totalStudents} Students</p>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        {sections.length === 0 ? (
          <Link
            href={`/principal/attendance/mark?classId=${classItem.id}&date=${date}`}
            className="flex w-full items-center justify-center rounded-lg bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
          >
            Mark Attendance
          </Link>
        ) : (
          <div className="flex flex-col gap-2">
            {sections.map(sec => (
              <Link
                key={sec.id}
                href={`/principal/attendance/mark?classId=${classItem.id}&sectionId=${sec.id}&date=${date}`}
                className="flex w-full items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-colors"
              >
                <span>Section {sec.name}</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
