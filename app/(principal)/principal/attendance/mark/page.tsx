"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useClassesList } from "@/hooks/useAdminClasses";
import MarkAttendancePanel from "@/components/principal/attendance/MarkAttendancePanel";
import Link from "next/link";
import { format } from "date-fns";
import { Suspense } from "react";

function MarkAttendanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const classIdParam = searchParams.get("classId");
  const sectionIdParam = searchParams.get("sectionId");
  const dateParam = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");

  const classId = classIdParam ? parseInt(classIdParam, 10) : null;
  const sectionId = sectionIdParam ? parseInt(sectionIdParam, 10) : null;

  const { data: classes = [], isLoading } = useClassesList();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-violet-100 bg-white">
        <div className="flex flex-col items-center text-slate-500">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          Loading class details...
        </div>
      </div>
    );
  }

  const classItem = classes.find((c) => c.id === classId);

  if (!classId || !classItem) {
    return (
      <div className="space-y-6">
        <Link
          href="/principal/attendance"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 transition hover:text-violet-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to classes
        </Link>
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/50">
          <p className="text-sm font-medium text-rose-600/80">
            Invalid or missing class ID.
          </p>
        </div>
      </div>
    );
  }

  function handleDateChange(newDate: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate);
    router.push(`/principal/attendance/mark?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/principal/attendance"
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 transition hover:text-violet-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to classes
          </Link>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            Mark Attendance
          </h2>
        </div>
        
        <div className="relative flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
          <svg className="h-5 w-5 text-violet-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="date"
            value={dateParam}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-transparent text-slate-700 outline-none cursor-pointer"
          />
        </div>
      </div>

      <MarkAttendancePanel classItem={classItem} sectionId={sectionId} date={dateParam} />
    </div>
  );
}

export default function MarkAttendancePage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center rounded-2xl border border-violet-100 bg-white">
        <div className="flex flex-col items-center text-slate-500">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          Loading...
        </div>
      </div>
    }>
      <MarkAttendanceContent />
    </Suspense>
  );
}
