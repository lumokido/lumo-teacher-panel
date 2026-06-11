"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useClassesList, useSectionsByClassId } from "@/hooks/useAdminClasses";
import { useAssignmentsByClass, useAssignmentsByClassAndSection } from "@/hooks/useAssignments";
import Link from "next/link";
import { format } from "date-fns";
import { School, Calendar, FileText, Plus, Loader2, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function HomeworkCenterContent() {
  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [selectedSectionId, setSelectedSectionId] = useState<number | "">("");

  // Pre-select the first class if list loaded and none selected yet
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const { data: sections = [], isLoading: sectionsLoading } = useSectionsByClassId(
    selectedClassId ? (selectedClassId as number) : undefined
  );

  // Fetch homework assignments
  const { data: allAssignments = [], isLoading: allLoading } = useAssignmentsByClass(
    selectedClassId ? (selectedClassId as number) : undefined
  );
  
  const { data: sectionAssignments = [], isLoading: sectionLoading } = useAssignmentsByClassAndSection(
    selectedClassId ? (selectedClassId as number) : undefined,
    selectedSectionId ? (selectedSectionId as number) : null
  );

  const assignments = selectedSectionId ? sectionAssignments : allAssignments;
  const isLoading = classesLoading || (selectedClassId ? (selectedSectionId ? sectionLoading : allLoading) : false);

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
          <p className="mb-2 text-sm font-medium text-violet-600">Homework Center</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            Daily Homework logs
          </h2>
          <p className="mt-2 max-w-xl text-slate-600">
            Publish and manage homework tasks across all classes and sections.
          </p>
        </div>
        <Link
          href="/principal/homework/add"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-violet-700 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Publish Homework
        </Link>
      </div>

      {/* Class/Section Select Filter */}
      <div className="flex flex-wrap items-center gap-4 border border-violet-100 bg-white p-5 rounded-2xl shadow-sm">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Class</label>
          <Select
            disabled={classesLoading}
            value={selectedClassId ? String(selectedClassId) : ""}
            onValueChange={(val) => {
              setSelectedClassId(val ? parseInt(val, 10) : "");
              setSelectedSectionId("");
            }}
          >
            <SelectTrigger className="w-[200px] rounded-xl border-violet-200 bg-white h-[38px] text-sm">
              <SelectValue placeholder="Select a Class">
                {(val) => val ? classes.find((c) => String(c.id) === String(val))?.name : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Section</label>
          <Select
            disabled={!selectedClassId || sectionsLoading}
            value={selectedSectionId ? String(selectedSectionId) : ""}
            onValueChange={(val) => setSelectedSectionId(val ? parseInt(val, 10) : "")}
          >
            <SelectTrigger className="w-[200px] rounded-xl border-violet-200 bg-white h-[38px] text-sm">
              <SelectValue placeholder="All Sections">
                {(val) => val ? sections.find((s) => String(s.id) === String(val))?.name : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  Section {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Homework List Grid */}
      {!selectedClassId ? (
        <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/20 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
            <School className="h-8 w-8 text-violet-600" />
          </div>
          <p className="text-lg font-semibold text-slate-800">Select a Class</p>
          <p className="mt-1 text-sm text-slate-500">
            Choose a class and section from the filters above to view scheduled homework.
          </p>
        </div>
      ) : isLoading ? (
        <div className="py-20 text-center text-slate-500">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-violet-600" />
          Loading homework assignments...
        </div>
      ) : assignments.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/20 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
            <FileText className="h-8 w-8 text-violet-600" />
          </div>
          <p className="text-lg font-semibold text-slate-800">No homework assignments found</p>
          <p className="mt-1 text-sm text-slate-500">
            There are no active homework logs for this selection. Click &quot;Publish Homework&quot; to publish one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm flex flex-col hover:shadow-md hover:border-violet-200 transition-all duration-200 relative overflow-hidden"
            >
              {/* Due Date Indicator Badge */}
              <div className="mb-4 flex items-center justify-between border-b pb-3 border-slate-50">
                <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
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
                    className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1 transition-opacity"
                  >
                    <Eye className="h-4 w-4" />
                    View Scanned Worksheet
                  </a>
                </div>
              )}

              {/* Created By Footer */}
              <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>By {item.createdBy || "Class Teacher"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomeworkCenter() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center rounded-2xl border border-violet-100 bg-white">
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-violet-600" />
          Loading homework logs...
        </div>
      </div>
    }>
      <HomeworkCenterContent />
    </Suspense>
  );
}
