"use client";

import { useClassesList, useSectionsByClassId } from "@/hooks/useAdminClasses";
import type { ClassItem } from "@/lib/api/adminClasses";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function HomeroomSelect({ value, onChange }: Props) {
  const { data: classes = [], isLoading } = useClassesList();

  return (
    <Select value={value || undefined} onValueChange={(val) => onChange(val ?? "")}>
      <SelectTrigger className="w-full min-h-[42px] rounded-xl border-violet-200 bg-white px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
        <SelectValue placeholder="Select homeroom section..." />
      </SelectTrigger>
      <SelectContent className="max-h-64 rounded-xl border-violet-100 shadow-lg">
        {isLoading ? (
          <div className="flex items-center justify-center p-4 text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-violet-500" />
            Loading classes...
          </div>
        ) : classes.length === 0 ? (
          <div className="p-3 text-center text-sm text-slate-500">No classes available.</div>
        ) : (
          classes.map((cls) => (
            <ClassHomeroomGroup key={cls.id} classItem={cls} />
          ))
        )}
      </SelectContent>
    </Select>
  );
}

function ClassHomeroomGroup({ classItem }: { classItem: ClassItem }) {
  const { data: sections = [], isLoading } = useSectionsByClassId(classItem.id);
  const classNameStr = classItem.name;

  return (
    <SelectGroup>
      <SelectLabel className="text-violet-600 font-semibold bg-violet-50/50 py-1.5 px-2 -mx-1 mb-1 rounded-sm">
        Class {classNameStr}
      </SelectLabel>
      <SelectItem value={classNameStr} className="pl-6 mb-1 cursor-pointer">
        {classNameStr} (Whole Class)
      </SelectItem>
      {!isLoading && sections.map((sec) => {
        const secNameStr = `${classNameStr}${sec.name}`;
        return (
          <SelectItem key={sec.id} value={secNameStr} className="pl-6 mb-1 cursor-pointer">
            {classNameStr} - Section {sec.name}
          </SelectItem>
        );
      })}
    </SelectGroup>
  );
}
