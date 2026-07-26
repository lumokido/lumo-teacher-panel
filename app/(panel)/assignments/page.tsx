"use client";

import { useState, useMemo, useEffect } from "react";
import { useClassesList, useSectionsByClassId, useMyAssignedClasses } from "@/hooks/useAdminClasses";
import { useAssignmentsByDateAndClass } from "@/hooks/useAssignments";
import Link from "next/link";
import { format } from "date-fns";
import { School, Calendar, FileText, Plus, Loader2, Eye } from "lucide-react";

export default function AssignmentsPage() {
  return <HomeworkCenter />;
}

function HomeworkCenter() {
  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  const { data: assignedData, isLoading: assignedLoading } = useMyAssignedClasses();
  
  const [selectedDate, setSelectedDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));
  const [activeClassId, setActiveClassId] = useState<number | "">("");
  const [activeSectionId, setActiveSectionId] = useState<number | "">("");

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

  // Pre-select the first class if list loaded and none selected yet
  useEffect(() => {
    if (filteredClasses.length > 0 && !activeClassId) {
      setActiveClassId(filteredClasses[0].id);
      setActiveSectionId("");
    }
  }, [filteredClasses, activeClassId]);

  // Fetch homework assignments by date and class
  const { data: rawAssignments = [], isLoading: assignmentsLoading } = useAssignmentsByDateAndClass(
    selectedDate,
    activeClassId ? (activeClassId as number) : undefined
  );
  
  // Client-side filter by selected section
  const assignments = useMemo(() => {
    if (!activeSectionId) return rawAssignments;
    return rawAssignments.filter((item) => item.section?.id === activeSectionId);
  }, [rawAssignments, activeSectionId]);

  const isLoading = classesLoading || assignedLoading || (activeClassId ? assignmentsLoading : false);

  function handleSelectSection(classId: number, sectionId: number | "") {
    setActiveClassId(classId);
    setActiveSectionId(sectionId);
  }

  function formatDateString(dateStr: string) {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return format(date, "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-sky-600">Homework Center</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            Daily Homework logs
          </h2>
          <p className="mt-2 max-w-xl text-slate-600">
            Select a class card and section to view scheduled homework for any date.
          </p>
        </div>
        <Link
          href="/assignments/add-homework"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-sky-700 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Publish Homework
        </Link>
      </div>

      {/* Date Picker Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-sky-100 bg-white p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Selected Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 rounded-xl border border-sky-200 px-3 py-1.5 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-sky-300 bg-white cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Class Directory</h3>
        {classesLoading || assignedLoading ? (
          <div className="py-8 text-center text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
            Loading classes...
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/20 px-6 py-10 text-center">
            <p className="text-slate-600 font-medium">No assigned classes found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredClasses.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                activeClassId={activeClassId}
                activeSectionId={activeSectionId}
                onSelectSection={handleSelectSection}
              />
            ))}
          </div>
        )}
      </div>

      {/* Homework List Grid */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="font-montserrat text-lg font-bold text-slate-800 flex items-center gap-2">
            Homework List {activeClassId ? `(${filteredClasses.find(c => c.id === activeClassId)?.name || ""}${activeSectionId ? ` - Section ${filteredClasses.find(c => c.id === activeClassId)?.name || ""}` : " - All Sections"})` : ""}
          </h3>
        </div>

        {!activeClassId ? (
          <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/20 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-slate-800">Select a Class Card</p>
            <p className="mt-1 text-sm text-slate-500">
              Click a section inside a class card above to load homework logs.
            </p>
          </div>
        ) : isLoading ? (
          <div className="py-20 text-center text-slate-500">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-sky-600" />
            Loading homework assignments...
          </div>
        ) : assignments.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/20 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
              <FileText className="h-8 w-8 text-sky-600" />
            </div>
            <p className="text-lg font-semibold text-slate-800">No homework assignments found</p>
            <p className="mt-1 text-sm text-slate-500">
              There are no homework assignments scheduled for {formatDateString(selectedDate)} for this selection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm flex flex-col hover:shadow-md hover:border-sky-200 transition-all duration-200 relative overflow-hidden"
              >
                {/* Due Date Indicator Badge */}
                <div className="mb-4 flex items-center justify-between border-b pb-3 border-slate-50">
                  <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700">
                    {item.section ? `Section ${item.section.name}` : "All Sections"}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Due: {formatDateString(item.dueDate)}
                  </span>
                </div>

                {/* Homework Title & Description */}
                <h4 className="font-semibold text-slate-900 text-lg">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 flex-1 line-clamp-3">
                  {item.description}
                </p>

                {/* Scanned/Reference Image Thumbnail */}
                {item.imageUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-slate-100 h-28 relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full" />
                    <a
                      href={item.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1 transition-opacity cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      View Scanned Worksheet
                    </a>
                  </div>
                )}

                {/* Created By Footer */}
                <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>By {item.createdBy || "Class Teacher"}</span>
                  {item.assignedDate && (
                    <span className="text-slate-400">Assigned: {formatDateString(item.assignedDate)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClassCard({
  cls,
  activeClassId,
  activeSectionId,
  onSelectSection,
}: {
  cls: any;
  activeClassId: number | "";
  activeSectionId: number | "";
  onSelectSection: (classId: number, sectionId: number | "") => void;
}) {
  const { data: sections = [], isLoading } = useSectionsByClassId(cls.id);
  const isActive = activeClassId === cls.id;

  return (
    <div 
      className={`rounded-2xl border p-5 bg-white shadow-sm transition-all duration-200 ${
        isActive ? "border-sky-400 ring-2 ring-sky-100 shadow-md" : "border-slate-100 hover:border-sky-200 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
          isActive ? "bg-sky-600 text-white" : "bg-sky-50 text-sky-600"
        }`}>
          <School className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 text-base">{cls.name}</h4>
          <p className="text-xs text-slate-500">
            {isLoading ? "Loading..." : `${sections.length} Section${sections.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 py-1">
          <Loader2 className="h-3 w-3 animate-spin text-sky-500" />
          Loading sections...
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelectSection(cls.id, "")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isActive && activeSectionId === ""
                ? "bg-sky-600 text-white"
                : "bg-slate-50 text-slate-600 hover:bg-sky-100"
            }`}
          >
            All
          </button>
          {sections.map((sec) => {
            const isSecActive = isActive && activeSectionId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSection(cls.id, sec.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSecActive
                    ? "bg-sky-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-sky-100"
                }`}
              >
                {sec.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
