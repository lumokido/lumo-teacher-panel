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
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

// List of typical subjects for easy typing or selection
const SUBJECT_OPTIONS = [
  "Mathematics",
  "Science",
  "English",
  "Social Studies",
  "Physical Education",
  "Art",
  "Music",
  "Computer Science",
  "Foreign Language",
  "Library"
];

export default function PrincipalTimetablePage() {
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

  const saveMut = useSaveTimetableEntry();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<{
    day: string;
    period: number;
    subject: string;
    teacherId: number | "";
  }>({
    day: "",
    period: 1,
    subject: "",
    teacherId: "",
  });

  const classItem = useMemo(() => classes.find((c) => c.id === selectedClassId), [classes, selectedClassId]);
  const sectionItem = useMemo(() => sections.find((s) => s.id === selectedSectionId), [sections, selectedSectionId]);

  // Create a fast lookup map for timetable slots: `${day}-${period}`
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

  function closeModal() {
    setShowModal(false);
  }

  function handleCellClick(day: string, period: number) {
    if (!selectedClassId || !selectedSectionId) return;

    const existing = timetableMap.get(`${day}-${period}`);
    setModalData({
      day,
      period,
      subject: existing ? existing.subject : "",
      teacherId: existing ? existing.teacherId : "",
    });
    setShowModal(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClassId || !selectedSectionId || !modalData.subject.trim() || !modalData.teacherId) return;

    saveMut.mutate({
      classId: selectedClassId as number,
      sectionId: selectedSectionId as number,
      day: modalData.day,
      period: modalData.period,
      subject: modalData.subject.trim(),
      teacherId: modalData.teacherId as number,
    }, {
      onSuccess: () => {
        setShowModal(false);
        void refetchTimetable();
      }
    });
  }

  const isLoading = classesLoading || teachersLoading;

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
                      <th key={p} className="px-4 py-4 font-semibold text-slate-500 text-center border-r border-violet-100 last:border-r-0">
                        Period {p}
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
                        const teacherName = entry ? teacherMap.get(entry.teacherId) || `ID: ${entry.teacherId}` : "";

                        return (
                          <td
                            key={period}
                            onClick={() => handleCellClick(day, period)}
                            className="px-3 py-4 border-r border-violet-100 last:border-r-0 text-center relative group cursor-pointer transition-all hover:bg-violet-50/40"
                          >
                            {entry ? (
                              <div className="space-y-1">
                                <p className="font-semibold text-violet-900 text-sm">{entry.subject}</p>
                                <p className="text-xs text-slate-500">{teacherName}</p>
                                <div className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Edit2 className="h-3 w-3 text-violet-500" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-center items-center py-2">
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
          <p className="text-lg font-semibold text-slate-800">Select Class & Section</p>
          <p className="mt-1 text-sm text-slate-500">
            Choose a class and a section above to view or build the weekly timetable grid.
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
              Assign Class Period
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Class {classItem?.name} (Section {sectionItem?.name}) &bull; {modalData.day} &bull; Period {modalData.period}
            </p>

            <form className="mt-4 space-y-4" onSubmit={handleSave}>
              {/* Subject Input */}
              <label className="block text-xs font-semibold text-slate-600">
                Subject Name
                <input
                  required
                  list="subjects-list"
                  placeholder="e.g. Mathematics"
                  disabled={saveMut.isPending}
                  className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-950 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                  value={modalData.subject}
                  onChange={(e) => setModalData((prev) => ({ ...prev, subject: e.target.value }))}
                />
                <datalist id="subjects-list">
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
              </label>

              {/* Teacher Selector */}
              <div className="block text-xs font-semibold text-slate-600 space-y-1.5">
                Assigned Teacher
                <Select
                  value={modalData.teacherId ? String(modalData.teacherId) : ""}
                  onValueChange={(val) => setModalData((prev) => ({ ...prev, teacherId: val ? parseInt(val, 10) : "" }))}
                  disabled={saveMut.isPending}
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

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saveMut.isPending}
                  className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-violet-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMut.isPending || !modalData.subject.trim() || !modalData.teacherId}
                  className="rounded-xl bg-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-60 transition-all active:scale-[0.98]"
                >
                  {saveMut.isPending ? "Saving..." : "Save Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
