"use client";

import { useState, useMemo } from "react";
import { useClassesList, useSectionsByClassId } from "@/hooks/useAdminClasses";
import { useTeachersList } from "@/hooks/useAdminTeachers";
import { useTimetableByClassAndSection, useSaveTimetableEntry } from "@/hooks/useTimetable";
import { Plus, Edit2, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Geography",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Physical Education",
  "Art",
  "Music",
  "Hindi",
  "Telugu",
  "Social Studies",
  "Library"
];

export default function PrincipalTimetablePage() {
  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachersList();

  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [selectedSectionId, setSelectedSectionId] = useState<number | "">("");

  const { data: sections = [], isLoading: sectionsLoading } = useSectionsByClassId(
    selectedClassId ? (selectedClassId as number) : undefined
  );

  const { 
    data: timetable = [], 
    isLoading: timetableLoading, 
    isError: timetableError,
    refetch: refetchTimetable
  } = useTimetableByClassAndSection(
    selectedClassId ? (selectedClassId as number) : undefined,
    selectedSectionId ? (selectedSectionId as number) : undefined
  );

  const saveMut = useSaveTimetableEntry();

  const [showModal, setShowModal] = useState(false);
  const [applyToAllDays, setApplyToAllDays] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [modalData, setModalData] = useState<{
    day: string;
    period: number;
    subject: string;
    teacherId: number | "";
    type: "PERIOD" | "LUNCH_BREAK" | "NORMAL_BREAK" | "ASSEMBLY";
    startTime: string;
    endTime: string;
  }>({
    day: "",
    period: 1,
    subject: "",
    teacherId: "",
    type: "PERIOD",
    startTime: "",
    endTime: "",
  });

  const classItem = useMemo(() => classes.find((c) => c.id === selectedClassId), [classes, selectedClassId]);
  const sectionItem = useMemo(() => sections.find((s) => s.id === selectedSectionId), [sections, selectedSectionId]);

  const timetableMap = useMemo(() => {
    const map = new Map<string, typeof timetable[0]>();
    timetable.forEach((entry) => {
      // Use the period number as the column index
      if (entry.period != null) {
        map.set(`${entry.day}-${entry.period}`, entry);
      }
    });
    return map;
  }, [timetable]);

  const slotLabels = useMemo(() => {
    const labels = new Map<number, string>();
    let teachingCounter = 1;
    
    PERIODS.forEach((p) => {
      const entriesInCol = DAYS.map(d => timetableMap.get(`${d}-${p}`)).filter(Boolean);
      // If the column has entries and ALL of them are not teaching periods, it's a break column
      const isBreakCol = entriesInCol.length > 0 && entriesInCol.every(e => e?.type !== "PERIOD");
      
      if (isBreakCol) {
        const breakName = entriesInCol[0]?.type?.replace("_", " ") || "Break";
        labels.set(p, breakName);
      } else {
        labels.set(p, `Period ${teachingCounter}`);
        teachingCounter++;
      }
    });
    
    return labels;
  }, [timetableMap]);

  const teacherMap = useMemo(() => {
    const map = new Map<number, string>();
    teachers.forEach((t) => {
      if (t.id) map.set(t.id, t.name || "Unnamed Teacher");
    });
    return map;
  }, [teachers]);

  function closeModal() {
    setShowModal(false);
  }

  function handleCellClick(day: string, period: number) {
    if (!selectedClassId) return;

    setApplyToAllDays(false);
    const existing = timetableMap.get(`${day}-${period}`);
    setModalData({
      day,
      period,
      subject: existing ? existing.subject || "" : "",
      teacherId: existing ? existing.teacherId || "" : "",
      type: (existing?.type as any) || "PERIOD",
      startTime: existing?.startTime ? existing.startTime.slice(0, 5) : "",
      endTime: existing?.endTime ? existing.endTime.slice(0, 5) : "",
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClassId) return;
    
    if (modalData.type === "PERIOD") {
      if (!modalData.subject.trim() || !modalData.teacherId) return;
    }

    const basePayload = {
      classId: selectedClassId as number,
      sectionId: selectedSectionId ? (selectedSectionId as number) : null,
      period: modalData.period, // Send period for breaks too, to place them in the grid!
      subject: modalData.type === "PERIOD" ? modalData.subject.trim() : null,
      teacherId: modalData.type === "PERIOD" ? (modalData.teacherId as number) : null,
      type: modalData.type,
      startTime: modalData.startTime ? (modalData.startTime.length === 5 ? modalData.startTime + ":00" : modalData.startTime) : null,
      endTime: modalData.endTime ? (modalData.endTime.length === 5 ? modalData.endTime + ":00" : modalData.endTime) : null,
    };

    try {
      if (applyToAllDays) {
        setIsSavingAll(true);
        for (const d of DAYS) {
          await saveMut.mutateAsync({
            ...basePayload,
            day: d,
          });
        }
      } else {
        await saveMut.mutateAsync({
          ...basePayload,
          day: modalData.day,
        });
      }
      setShowModal(false);
      void refetchTimetable();
    } catch {
      // handled
    } finally {
      setIsSavingAll(false);
    }
  }

  const isLoading = classesLoading || teachersLoading;
  const isPending = saveMut.isPending || isSavingAll;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="mb-2 text-sm font-medium text-violet-600">Administration</p>
        <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
          Weekly Timetable
        </h2>
        <p className="mt-2 text-slate-600">
          Assign subjects and teachers to class period slots.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
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

        {/* Section Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Section</label>
          <Select
            disabled={isLoading || !selectedClassId || sections.length === 0 || sectionsLoading}
            value={selectedSectionId ? String(selectedSectionId) : ""}
            onValueChange={(val) => setSelectedSectionId(val ? parseInt(val, 10) : "")}
          >
            <SelectTrigger className="w-[200px] rounded-xl border-violet-200 bg-white h-[38px] text-sm">
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
      {selectedClassId ? (
        timetableError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Failed to load timetable entries.{" "}
            <button onClick={() => void refetchTimetable()} className="font-semibold underline">
              Retry
            </button>
          </div>
        ) : timetableLoading ? (
          <div className="py-24 text-center text-slate-500">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-violet-600" />
            Loading weekly timetable...
          </div>
        ) : (
          <div className="rounded-2xl border border-violet-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-violet-100 bg-slate-50/50">
                    <th className="px-4 py-4 font-semibold text-slate-500 w-32 border-r border-violet-100">Day</th>
                    {PERIODS.map((p) => (
                      <th key={p} className="px-4 py-4 font-semibold text-slate-500 text-center border-r border-violet-100 last:border-r-0 uppercase tracking-wider text-xs">
                        {slotLabels.get(p)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-100">
                  {DAYS.map((day) => (
                    <tr key={day} className="hover:bg-slate-50/20 transition-colors">
                      <td className="px-4 py-6 font-bold text-slate-800 border-r border-violet-100 bg-slate-50/30">
                        {day}
                      </td>
                      {PERIODS.map((period) => {
                        const entry = timetableMap.get(`${day}-${period}`);
                        const teacherName = entry ? teacherMap.get(entry.teacherId!) || `ID: ${entry.teacherId}` : "";

                        return (
                          <td
                            key={period}
                            onClick={() => handleCellClick(day, period)}
                            className="px-3 py-4 border-r border-violet-100 last:border-r-0 text-center relative group cursor-pointer transition-all hover:bg-violet-50/40 min-w-[120px]"
                          >
                            {entry ? (
                              <div className="space-y-1">
                                {entry.startTime && entry.endTime && (
                                  <p className="text-[10px] font-medium text-slate-400 mb-1">
                                    {entry.startTime.slice(0, 5)} - {entry.endTime.slice(0, 5)}
                                  </p>
                                )}
                                {entry.type !== "PERIOD" ? (
                                  <div className="flex flex-col items-center justify-center text-orange-500 pt-1">
                                    <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="font-bold text-[10px] uppercase tracking-wider">{entry?.type?.replace("_", " ")}</p>
                                  </div>
                                ) : (
                                  <>
                                    <p className="font-semibold text-violet-900 text-sm">{entry.subject}</p>
                                    <p className="text-xs text-slate-500">{teacherName}</p>
                                  </>
                                )}
                                <div className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Edit2 className="h-3 w-3 text-violet-500" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-center items-center py-2 h-full">
                                <Plus className="h-5 w-5 text-slate-300 group-hover:text-violet-500 transition-colors" />
                              </div>
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
        <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/40 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
            <svg className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M12 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-800">Select Class</p>
          <p className="mt-1 text-sm text-slate-500">
            Choose a class to view or build the weekly timetable grid.
          </p>
        </div>
      )}

      {/* Assignment Modal */}
      {showModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="w-full max-w-md rounded-2xl border border-violet-100 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="modal-title" className="font-montserrat text-lg font-bold text-slate-900">
              Assign {slotLabels.get(modalData.period)}
            </h3>
            <p className="mt-1 text-xs text-slate-500 mb-4">
              Class {classItem?.name} {sectionItem ? `(Section ${sectionItem.name})` : ""} &bull; {modalData.day}
            </p>

            <form className="space-y-4" onSubmit={handleSave}>
              <div className="block text-xs font-semibold text-slate-600 space-y-1.5">
                Entry Type
                <Select
                  value={modalData.type}
                  onValueChange={(val: any) => setModalData(prev => ({ ...prev, type: val, subject: val === "PERIOD" ? prev.subject : "", teacherId: val === "PERIOD" ? prev.teacherId : "" }))}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full rounded-lg border border-violet-200 bg-white h-[38px] text-sm">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERIOD">Teaching Period</SelectItem>
                    <SelectItem value="LUNCH_BREAK">Lunch Break</SelectItem>
                    <SelectItem value="NORMAL_BREAK">Normal Break</SelectItem>
                    <SelectItem value="ASSEMBLY">Assembly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block text-xs font-semibold text-slate-600">
                  Start Time (Optional)
                  <input
                    type="time"
                    disabled={isPending}
                    className="mt-1.5 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
                    value={modalData.startTime}
                    onChange={(e) => setModalData(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-600">
                  End Time (Optional)
                  <input
                    type="time"
                    disabled={isPending}
                    className="mt-1.5 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
                    value={modalData.endTime}
                    onChange={(e) => setModalData(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </label>
              </div>

              {modalData.type === "PERIOD" && (
                <>
                  <div className="block text-xs font-semibold text-slate-600 space-y-1.5">
                    Subject Name
                    <Select
                      value={modalData.subject}
                      onValueChange={(val) => setModalData((prev) => ({ ...prev, subject: val || "" }))}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-violet-200 bg-white h-[38px] text-sm text-slate-900">
                        <SelectValue placeholder="Select a Subject" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56">
                        {SUBJECT_OPTIONS.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="block text-xs font-semibold text-slate-600 space-y-1.5">
                    Assigned Teacher
                    <Select
                      value={modalData.teacherId ? String(modalData.teacherId) : ""}
                      onValueChange={(val) => setModalData((prev) => ({ ...prev, teacherId: val ? parseInt(val, 10) : "" }))}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full rounded-lg border border-violet-200 bg-white h-[38px] text-sm">
                        <SelectValue placeholder="Select a Teacher">
                          {(val) => {
                            const found = teachers.find((t) => String(t.id) === String(val));
                            return found ? found.name : undefined;
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((t) => (
                          <SelectItem key={t.id} value={String(t.id)}>
                            {t.name} ({t.emailId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Apply to All Days Checkbox */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                <input
                  type="checkbox"
                  id="apply-all-days"
                  disabled={isPending}
                  checked={applyToAllDays}
                  onChange={(e) => setApplyToAllDays(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-violet-300 text-violet-600 focus:ring-violet-300 cursor-pointer accent-violet-600"
                />
                <label htmlFor="apply-all-days" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                  Apply this entry to {slotLabels.get(modalData.period)} on all days (Mon - Sat)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-violet-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || (modalData.type === "PERIOD" && (!modalData.subject.trim() || !modalData.teacherId))}
                  className="rounded-xl bg-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-60 transition-all active:scale-[0.98]"
                >
                  {isPending ? "Saving..." : "Save Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
