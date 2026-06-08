"use client";

import type { AdminTeacherWriteBody } from "@/lib/api/adminTeachers";
import { useAddTeacher, useTeachersList } from "@/hooks/useAdminTeachers";
import { useMemo, useState } from "react";
import Link from "next/link";

export default function TeachersPanel() {
  const { data: teachers = [], isLoading, isError, error, refetch } =
    useTeachersList();

  const listErr = useMemo(() => {
    if (!isError) return null;
    return error instanceof Error ? error.message : "Could not load teachers";
  }, [isError, error]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-violet-600">Teachers</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            Staff directory
          </h2>
          <p className="mt-2 max-w-xl text-slate-600">
            Add teachers and keep class assignments up to date.
          </p>
        </div>
        <Link
          href="/principal/teachers/add"
          className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          Add teacher
        </Link>
      </div>

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

      <div className="overflow-x-auto rounded-xl border border-violet-100">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-violet-100 bg-violet-50/80 text-xs font-semibold uppercase tracking-wide text-violet-900">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Class teacher</th>
              <th className="px-4 py-3">Classes</th>
              <th className="px-4 py-3">Subjects</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No teachers yet. Use Add teacher to create one.
                </td>
              </tr>
            ) : (
              teachers.map((t, i) => (
                <tr key={t.emailId ?? `row-${i}`} className="hover:bg-violet-50/40">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {t.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{t.emailId ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {t.mobileNumber ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {t.classTeacher ?? "—"}
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-slate-600">
                    {t.classes || "—"}
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-slate-600">
                    {t.subjects || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/principal/teachers/${encodeURIComponent(t.emailId ?? "")}`}
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
    </div>
  );
}
