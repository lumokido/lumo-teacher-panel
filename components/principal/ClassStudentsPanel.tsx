"use client";

import {
  useCreateSection,
  useClassesList,
  useSectionsByClassId,
  useStudentsByClassId,
  useStudentsByClassAndSectionId,
} from "@/hooks/useAdminClasses";
import { studentDisplayName, getStudentId } from "@/lib/api/students";
import type { StudentRow } from "@/lib/api/students";
import type { ClassItem, SectionItem } from "@/lib/api/adminClasses";
import AdminStudentDialog from "@/components/principal/AdminStudentDialog";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  className: string;
};

export default function ClassStudentsPanel({ className }: Props) {
  const decodedName = decodeURIComponent(className);
  
  const { data: classes = [] } = useClassesList();

  const router = useRouter();
  
  // Find the class ID for section creation and data fetching
  const classItem = useMemo(
    () => classes.find((c: ClassItem) => c.name === decodedName),
    [classes, decodedName],
  );

  const { data: sections = [], refetch: refetchSections } = useSectionsByClassId(classItem?.id);

  const sectionMut = useCreateSection();

  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [activeTab, setActiveTab] = useState<number | "all">("all");

  const {
    data: allStudents = [],
    isLoading: isLoadingAll,
    isError: isErrorAll,
    error: errorAll,
    refetch: refetchAll,
  } = useStudentsByClassId(activeTab === "all" ? classItem?.id : undefined);

  const {
    data: sectionStudents = [],
    isLoading: isLoadingSection,
    isError: isErrorSection,
    error: errorSection,
    refetch: refetchSection,
  } = useStudentsByClassAndSectionId(
    activeTab !== "all" ? classItem?.id : undefined,
    activeTab !== "all" ? activeTab : undefined,
  );

  const students = activeTab === "all" ? allStudents : sectionStudents;
  const isLoading = activeTab === "all" ? isLoadingAll : isLoadingSection;
  const isError = activeTab === "all" ? isErrorAll : isErrorSection;
  const error = activeTab === "all" ? errorAll : errorSection;
  const refetch = activeTab === "all" ? refetchAll : refetchSection;

  const listErr = useMemo(() => {
    if (!isError) return null;
    return error instanceof Error ? error.message : "Could not load students";
  }, [isError, error]);

  function closeSectionDialog() {
    setShowSectionDialog(false);
    setSectionName("");
  }

  function onSectionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sectionName.trim() || !classItem) return;
    sectionMut.mutate(
      { name: sectionName.trim(), classId: classItem.id },
      { onSuccess: () => {
        closeSectionDialog();
        void refetchSections();
      } },
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/principal/classes"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 transition hover:text-violet-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to classes
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-violet-600">
              Class details
            </p>
            <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
              {decodedName}
            </h2>
            <p className="mt-2 text-slate-600">
              {students.length} student{students.length !== 1 ? "s" : ""} enrolled
            </p>
          </div>
          <div className="flex gap-2">
            {classItem ? (
              <button
                type="button"
                onClick={() => setShowSectionDialog(true)}
                className="rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 active:scale-[0.98]"
              >
                + Add section
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setShowStudentDialog(true)}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-[0.98]"
            >
              + Add student
            </button>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      {classItem && sections.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-violet-100">
          <button
            onClick={() => setActiveTab("all")}
            className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-t-xl transition-colors ${
              activeTab === "all"
                ? "bg-violet-100 text-violet-900 border-b-2 border-violet-600"
                : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
            }`}
          >
            All Sections
          </button>
          {sections.map((sec: SectionItem) => (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-t-xl transition-colors ${
                activeTab === sec.id
                  ? "bg-violet-100 text-violet-900 border-b-2 border-violet-600"
                  : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              Section {sec.name}
            </button>
          ))}
        </div>
      ) : null}

      {/* Error */}
      {listErr ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {listErr}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void refetch()}
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* Students table */}
      <div className="overflow-x-auto rounded-xl border border-violet-100">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-violet-100 bg-violet-50/80 text-xs font-semibold uppercase tracking-wide text-violet-900">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Date of birth</th>
              <th className="px-4 py-3"> Actions </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-100 bg-white">
            {isLoading || !classItem ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
                  Loading students…
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  No students in this {activeTab === "all" ? "class" : "section"} yet.
                </td>
              </tr>
            ) : (
              students.map((s: StudentRow, i: number) => (
                <tr
                  key={getStudentId(s) ?? `row-${i}`}
                  className="hover:bg-violet-50/40 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {studentDisplayName(s)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {s.mobileNumber || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {s.parentName || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {s.gender || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {s.dateOfBirth || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/principal/students/${getStudentId(s)}`}
                      className="text-sm font-semibold text-violet-700 hover:text-violet-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add student dialog */}
      <AdminStudentDialog
        className={decodedName}
        sections={sections}
        open={showStudentDialog}
        onClose={() => setShowStudentDialog(false)}
      />

      {/* Add section dialog */}
      {showSectionDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={closeSectionDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="section-dialog-title"
            className="w-full max-w-md rounded-2xl border border-violet-100 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="section-dialog-title"
              className="font-montserrat text-lg font-semibold text-slate-900"
            >
              Add section to {decodedName}
            </h3>
            <form className="mt-4 space-y-4" onSubmit={onSectionSubmit}>
              <label className="block text-xs font-medium text-slate-600">
                Section name
                <input
                  required
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-violet-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="e.g. A"
                  disabled={sectionMut.isPending}
                />
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeSectionDialog}
                  className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-violet-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sectionMut.isPending}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {sectionMut.isPending ? "Creating…" : "Create section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
