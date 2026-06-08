"use client";

import { useState, useRef, useEffect } from "react";
import { useClassesList, useSectionsByClassId } from "@/hooks/useAdminClasses";
import type { ClassItem } from "@/lib/api/adminClasses";

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function ClassMultiSelect({ value, onChange }: Props) {
  const { data: classes = [], isLoading } = useClassesList();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Parse the comma-separated string into a Set for fast lookups
  const selectedSet = new Set(value.split(",").map((s) => s.trim()).filter(Boolean));

  function toggleSelection(itemStr: string) {
    const newSet = new Set(selectedSet);
    if (newSet.has(itemStr)) {
      newSet.delete(itemStr);
    } else {
      newSet.add(itemStr);
    }
    onChange(Array.from(newSet).join(", "));
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        className="flex min-h-[42px] w-full cursor-pointer flex-wrap items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-within:ring-2 focus-within:ring-violet-300 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedSet.size === 0 ? (
          <span className="text-slate-500">Select classes & sections...</span>
        ) : (
          Array.from(selectedSet).map((item) => (
            <span 
              key={item} 
              className="inline-flex items-center gap-1 rounded-md bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700"
            >
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelection(item);
                }}
                className="rounded-full text-violet-500 hover:bg-violet-200 hover:text-violet-900 focus:outline-none"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))
        )}
        <div className="ml-auto">
          <svg className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-violet-100 bg-white p-2 shadow-lg">
          {isLoading ? (
            <div className="p-3 text-center text-sm text-slate-500">Loading classes...</div>
          ) : classes.length === 0 ? (
            <div className="p-3 text-center text-sm text-slate-500">No classes available.</div>
          ) : (
            classes.map((cls) => (
              <ClassOption 
                key={cls.id} 
                classItem={cls} 
                selectedSet={selectedSet} 
                onToggle={toggleSelection} 
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ClassOption({ 
  classItem, 
  selectedSet, 
  onToggle 
}: { 
  classItem: ClassItem; 
  selectedSet: Set<string>;
  onToggle: (str: string) => void;
}) {
  const { data: sections = [], isLoading } = useSectionsByClassId(classItem.id);
  const [isExpanded, setIsExpanded] = useState(false);

  const classNameStr = classItem.name;
  const isClassSelected = selectedSet.has(classNameStr);

  return (
    <div className="mb-1">
      <div className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50">
        <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            checked={isClassSelected}
            onChange={() => onToggle(classNameStr)}
          />
          Class {classNameStr}
        </label>
        {sections.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
          >
            <svg className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="ml-6 space-y-1 border-l-2 border-violet-100 pl-2">
          {isLoading ? (
            <div className="px-2 py-1 text-xs text-slate-500">Loading sections...</div>
          ) : (
            sections.map((sec) => {
              const secNameStr = `${classNameStr}${sec.name}`;
              const isSecSelected = selectedSet.has(secNameStr);
              return (
                <label key={sec.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    checked={isSecSelected}
                    onChange={() => onToggle(secNameStr)}
                  />
                  Section {sec.name}
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
