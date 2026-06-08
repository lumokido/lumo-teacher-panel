import {
  getStudentId,
  studentDisplayName,
  type StudentRow,
} from "@/lib/api/students";
import type { ColumnDef } from "@/lib/tables/types";
import Link from "next/link";

export const studentsTableColumns: ColumnDef<StudentRow>[] = [
  {
    id: "name",
    header: "Name",
    cell: (row) => (
      <span className="font-medium text-slate-900">{studentDisplayName(row)}</span>
    ),
  },
  {
    id: "roll_number",
    header: "Roll No",
    cell: (row) => row.rollNumber || "—",
  },
  {
    id: "class",
    header: "Class",
    cell: (row) => row.studentClass || "—",
  },
  {
    id: "mobile",
    header: "Mobile",
    cell: (row) => row.mobileNumber || "—",
  },
  {
    id: "parent",
    header: "Parent",
    cell: (row) => row.parentName || "—",
  },
  {
    id: "gender",
    header: "Gender",
    cell: (row) => row.gender || "—",
  },
  {
    id: "dob",
    header: "Date of Birth",
    cell: (row) => row.dateOfBirth || "—",
  },
  {
    id: "actions",
    header: "Action",
    cell: (row) => {
      const id = getStudentId(row);
      if (!id) return null;
      return (
        <div className="flex justify-end">
          <Link
            href={`/students/${id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-sky-100 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 shadow-sm hover:bg-sky-50 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </Link>
        </div>
      );
    },
  },
];
