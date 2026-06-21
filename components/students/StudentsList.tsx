"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getStudentId } from "@/lib/api/students";
import { studentsTableColumns } from "@/lib/tables/students-table.config";
import { usePaginatedStudentsList } from "@/hooks/useStudents";

export default function StudentsList() {
  const [page, setPage] = useState(0);
  const size = 10;

  const { data, isLoading, isError, error, refetch } = usePaginatedStudentsList(page, size);

  const isPaginated = data && !Array.isArray(data);
  const students = isPaginated ? data.students : (data || []);
  const pageNumber = isPaginated ? data.pageNumber : 0;
  const totalPages = isPaginated ? data.totalPages : 1;

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
        pageNumber={isPaginated ? pageNumber : undefined}
        totalPages={isPaginated ? totalPages : undefined}
        onPrevPage={() => setPage((p) => Math.max(0, p - 1))}
        onNextPage={() => setPage((p) => p + 1)}
      />
    </div>
  );
}
