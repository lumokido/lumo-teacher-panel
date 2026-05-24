import type { ReactNode } from "react";

export type ColumnDef<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};
