"use client";

import { useStudentDetails } from "@/hooks/useStudents";
import { useRouter } from "next/navigation";

export default function StudentDetailPanel({ studentId }: { studentId: string }) {
  const router = useRouter();
  const { data: student, isLoading, isError, error, refetch } = useStudentDetails(studentId);

  const listErr =
    isError && error instanceof Error
      ? error.message
      : isError
        ? "Could not load student details"
        : null;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-slate-200 rounded-md"></div>
        <div className="h-64 w-full bg-slate-100 rounded-2xl border border-slate-200"></div>
      </div>
    );
  }

  if (listErr) {
    return (
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
    );
  }

  if (!student) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-800">
        Student not found.
      </div>
    );
  }

  const fullName = [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 transition hover:text-sky-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-sky-600 tracking-wide uppercase">
              Student Profile
            </p>
            <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
              {fullName || "—"}
            </h2>
            <p className="mt-2 text-slate-600">
              Detailed view of student records and teacher assignments.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <h3 className="font-montserrat text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date of Birth</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{student.dateOfBirth || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Gender</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{student.gender || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Parent/Guardian Name</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{student.parentName || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mobile Number</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{student.mobileNumber || "—"}</p>
            </div>
          </div>
        </div>

        {/* Academic & Teacher Details */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-6 shadow-sm">
            <h3 className="font-montserrat text-lg font-semibold text-sky-900 mb-4">
              Academic Status
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-sky-600/80 uppercase tracking-wider">Current Class</p>
                <p className="text-xl font-bold text-sky-900">{student.studentClass || "—"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-violet-50/30 p-6 shadow-sm">
            <h3 className="font-montserrat text-lg font-semibold text-violet-900 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Allotted Class Teacher
            </h3>
            {student.teacherId ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-violet-500 uppercase tracking-wider">Teacher Name</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{student.teacherName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-violet-500 uppercase tracking-wider">Teacher Email</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{student.teacherEmail || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-violet-500 uppercase tracking-wider">Contact Number</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{student.teacherMobile || "—"}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                No class teacher is currently assigned to this student's class.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
