"use client";

import { DataTable } from "@/components/ui/data-table";
import { getStudentId } from "@/lib/api/students";
import { studentsTableColumns } from "@/lib/tables/students-table.config";
import { useStudentsList } from "@/hooks/useStudents";

export default function StudentsList() {
  const { data: students = [], isLoading, isError, error, refetch } =
    useStudentsList();

  const listErr =
    isError && error instanceof Error
      ? error.message
      : isError
        ? "Could not load students"
        : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-sky-600">Students</p>
          <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
            Student Directory
          </h2>
          <p className="mt-2 max-w-xl text-slate-600">
            View students, attendance, and performance. Contact your admin to add or edit students.
          </p>
        </div>
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

      <DataTable
        columns={studentsTableColumns}
        data={students}
        isLoading={isLoading}
        emptyMessage="No students yet."
        rowKey={(row, index) => getStudentId(row) ?? `row-${index}`}
      />
    </div>
  );
}
