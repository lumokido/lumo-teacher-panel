"use client";

import { useState, useMemo, Suspense } from "react";
import { useClassesList, useSectionsByClassId, useMyAssignedClasses } from "@/hooks/useAdminClasses";
import type { ClassItem } from "@/lib/api/adminClasses";
import { format } from "date-fns";
import Link from "next/link";
import { School, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

function ClassesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get date from query params or default to today
  const dateParam = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");
  
  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  const { data: assignedData, isLoading: assignedLoading } = useMyAssignedClasses();

  const isLoading = classesLoading || assignedLoading;

  const filteredClasses = useMemo(() => {
    const isAdmin = typeof window !== "undefined" && sessionStorage.getItem("type") === "principal";
    if (isAdmin) return classes;

    if (!assignedData) return [];
    const homeroom = assignedData.homeroomClass;
    const assigned = assignedData.assignedClasses || [];
    
    return classes.filter((cls) => {
      const name = cls.name.trim().toLowerCase();
      const isHomeroom = homeroom ? homeroom.trim().toLowerCase() === name : false;
      const isAssigned = assigned.some(c => c.trim().toLowerCase() === name);
      return isHomeroom || isAssigned;
    });
  }, [classes, assignedData]);

  function handleDateChange(newDate: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate);
    router.push(`/classes?${params.toString()}`);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-sky-600">Classes</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            My Classes
          </h2>
          <p className="mt-2 text-slate-600">
            Select an assigned class and section to manage and mark daily student attendance.
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

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-sky-100 bg-white shadow-sm">
          <div className="flex flex-col items-center text-slate-500">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-sky-500" />
            Loading classes...
          </div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/25 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
            <School className="h-8 w-8 text-sky-500" />
          </div>
          <p className="text-lg font-semibold text-slate-800">No classes assigned</p>
          <p className="mt-1 text-sm text-slate-500">
            You do not have any assigned classes or homeroom class at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <ClassCard key={cls.id} classItem={cls} date={dateParam} />
          ))}
        </div>
      )}
    </div>
  );
}


function ClassCard({ classItem, date }: { classItem: ClassItem; date: string }) {
  const { data: sections = [], isLoading } = useSectionsByClassId(classItem.id);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm flex items-center justify-center h-48 animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin text-sky-300" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm flex flex-col hover:shadow-md hover:border-sky-200 transition-all duration-200">
      <div className="flex items-center gap-3 mb-4 border-b border-slate-50 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <School className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 text-lg">{classItem.name}</h4>
          <p className="text-xs text-slate-500">{sections.length} {sections.length === 1 ? 'Section' : 'Sections'}</p>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        {sections.length === 0 ? (
          <Link
            href={`/classes/attendance?classId=${classItem.id}&date=${date}`}
            className="flex w-full items-center justify-center rounded-lg bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
          >
            Mark Attendance
          </Link>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Select Section</p>
            {sections.map((sec) => (
              <Link
                key={sec.id}
                href={`/classes/attendance?classId=${classItem.id}&sectionId=${sec.id}&date=${date}`}
                className="flex w-full items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition-all duration-150"
              >
                <span>Section {sec.name}</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClassesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center rounded-2xl border border-sky-100 bg-white">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-sky-500" />
          Loading...
        </div>
      </div>
    }>
      <ClassesPageContent />
    </Suspense>
  );
}
