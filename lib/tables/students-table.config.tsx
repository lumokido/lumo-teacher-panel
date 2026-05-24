import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getStudentId,
  studentDisplayName,
  type StudentRow,
} from "@/lib/api/students";
import type { ColumnDef } from "@/lib/tables/types";

export const studentsTableColumns: ColumnDef<StudentRow>[] = [
  {
    id: "name",
    header: "Name",
    cell: (row) => (
      <span className="font-medium text-slate-900">{studentDisplayName(row)}</span>
    ),
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
    id: "marks",
    header: "Marks",
    cell: (row) => row.marks || "—",
  },
  {
    id: "actions",
    header: "Actions",
    className: "text-right",
    cell: (row) => {
      const id = getStudentId(row);
      if (!id) return "—";
      return (
        <Button variant="link" size="sm" className="text-sky-700" render={<Link href={`/students/${id}/edit`} />}>
          Edit
        </Button>
      );
    },
  },
];
