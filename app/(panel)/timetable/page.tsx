"use client";

import { useState, useMemo } from "react";
import { useClassesList, useSectionsByClassId } from "@/hooks/useAdminClasses";
import { useTeachersList } from "@/hooks/useAdminTeachers";
import { useTimetableByClassAndSection } from "@/hooks/useTimetable";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TeacherTimetablePage() {
  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachersList();

  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [selectedSectionId, setSelectedSectionId] = useState<number | "">("");

  // Fetch sections when class is selected
  const { data: sections = [], isLoading: sectionsLoading } = useSectionsByClassId(
    selectedClassId ? (selectedClassId as number) : undefined
  );

  // Fetch timetable when both class and section are selected
  const { 
    data: timetable = [], 
    isLoading: timetableLoading, 
    isError: timetableError,
    refetch: refetchTimetable
  } = useTimetableByClassAndSection(
    selectedClassId ? (selectedClassId as number) : undefined,
    selectedSectionId ? (selectedSectionId as number) : undefined
  );

  // Create a lookup map for timetable slots: `${day}-${period}`
  const timetableMap = useMemo(() => {
    const map = new Map<string, typeof timetable[0]>();
    timetable.forEach((entry) => {
      map.set(`${entry.day}-${entry.period}`, entry);
    });
    return map;
  }, [timetable]);

  // Create a teacher lookup map for names
  const teacherMap = useMemo(() => {
    const map = new Map<number, string>();
    teachers.forEach((t) => {
      if (t.id) map.set(t.id, t.name || "Unnamed Teacher");
    });
    return map;
  }, [teachers]);

  const isLoading = classesLoading || teachersLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="mb-2 text-sm font-medium text-sky-600">Schedules</p>
        <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
          School Timetable
        </h2>
        <p className="mt-2 text-slate-600">
          View weekly timetable schedules for class sections.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
        {/* Class Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Class</label>
          <Select
            disabled={isLoading || classes.length === 0}
            value={selectedClassId ? String(selectedClassId) : ""}
            onValueChange={(val) => {
              setSelectedClassId(val ? parseInt(val, 10) : "");
              setSelectedSectionId("");
            }}
          >
            <SelectTrigger className="w-[200px] rounded-xl border-sky-200 bg-white h-[38px] text-sm">
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

        {/* Section Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Section</label>
          <Select
            disabled={isLoading || !selectedClassId || sections.length === 0 || sectionsLoading}
            value={selectedSectionId ? String(selectedSectionId) : ""}
            onValueChange={(val) => setSelectedSectionId(val ? parseInt(val, 10) : "")}
          >
            <SelectTrigger className="w-[200px] rounded-xl border-sky-200 bg-white h-[38px] text-sm">
              <SelectValue placeholder="Select a Section">
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

      {/* Timetable Grid Area */}
      {selectedClassId && selectedSectionId ? (
        timetableError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Failed to load timetable entries.{" "}
            <button onClick={() => void refetchTimetable()} className="font-semibold underline">
              Retry
            </button>
          </div>
        ) : timetableLoading ? (
          <div className="py-24 text-center text-slate-500">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-sky-500" />
            Loading timetable...
          </div>
        ) : (
          <div className="rounded-2xl border border-sky-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-sky-100 bg-slate-50/50">
                    <th className="px-4 py-4 font-semibold text-slate-500 w-32 border-r border-sky-100">Day</th>
                    {PERIODS.map((p) => (
                      <th key={p} className="px-4 py-4 font-semibold text-slate-500 text-center border-r border-sky-100 last:border-r-0">
                        Period {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100">
                  {DAYS.map((day) => (
                    <tr key={day} className="hover:bg-slate-50/20 transition-colors">
                      <td className="px-4 py-6 font-bold text-slate-800 border-r border-sky-100 bg-slate-50/30">
                        {day}
                      </td>
                      {PERIODS.map((period) => {
                        const entry = timetableMap.get(`${day}-${period}`);
                        const teacherName = entry ? teacherMap.get(entry.teacherId) || `ID: ${entry.teacherId}` : "";

                        return (
                          <td
                            key={period}
                            className="px-3 py-4 border-r border-sky-100 last:border-r-0 text-center"
                          >
                            {entry ? (
                              <div className="space-y-1">
                                <p className="font-semibold text-sky-900 text-sm">{entry.subject}</p>
                                <p className="text-xs text-slate-500">{teacherName}</p>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs">Unassigned</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/20 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100/60">
            <svg className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M12 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-800">Select Class & Section</p>
          <p className="mt-1 text-sm text-slate-500">
            Choose a class and a section above to view the weekly timetable grid.
          </p>
        </div>
      )}
    </div>
  );
}
