"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ColumnDef } from "@/lib/tables/types";

type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowKey: (row: T, index: number) => string;
};

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = "No records found.",
  rowKey,
}: DataTableProps<T>) {
  const colSpan = columns.length;

  return (
    <div className="rounded-xl border border-sky-100">
      <Table>
        <TableHeader className="bg-sky-50/80">
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.id} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={rowKey(row, index)}>
                {columns.map((col) => (
                  <TableCell key={col.id} className={col.className}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
