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
import { ChevronLeft, ChevronRight } from "lucide-react";

type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowKey: (row: T, index: number) => string;
  // Pagination props
  pageNumber?: number;
  totalPages?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
};

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = "No records found.",
  rowKey,
  pageNumber,
  totalPages,
  onPrevPage,
  onNextPage,
}: DataTableProps<T>) {
  const colSpan = columns.length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-sky-100 overflow-hidden">
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
      
      {pageNumber !== undefined && totalPages !== undefined && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-slate-500">
            Page {pageNumber + 1} of {Math.max(1, totalPages)}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onPrevPage}
              disabled={pageNumber === 0 || isLoading}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </button>
            <button
              onClick={onNextPage}
              disabled={pageNumber >= totalPages - 1 || isLoading}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
