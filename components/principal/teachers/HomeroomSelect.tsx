"use client";

import { useState, useRef, useEffect } from "react";
import { useClassesList, useSectionsByClassId } from "@/hooks/useAdminClasses";
import type { ClassItem } from "@/lib/api/adminClasses";

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function HomeroomSelect({ value, onChange }: Props) {
  const { data: classes = [], isLoading } = useClassesList();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
        className="flex min-h-[42px] w-full cursor-pointer flex-wrap items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus-within:ring-2 focus-within:ring-violet-300 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        {!value ? (
          <span className="text-slate-500">Select homeroom section...</span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
            {value}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="rounded-full text-emerald-500 hover:bg-emerald-200 hover:text-emerald-900 focus:outline-none"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
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
              <ClassHomeroomOption 
                key={cls.id} 
                classItem={cls} 
                selectedValue={value} 
                onSelect={(val) => {
                  onChange(val);
                  setIsOpen(false);
                }} 
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ClassHomeroomOption({ 
  classItem, 
  selectedValue, 
  onSelect 
}: { 
  classItem: ClassItem; 
  selectedValue: string;
  onSelect: (str: string) => void;
}) {
  const { data: sections = [], isLoading } = useSectionsByClassId(classItem.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const classNameStr = classItem.name;

  return (
    <div className="mb-1">
      <div className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50">
        <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
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
        <div className="ml-4 space-y-1 border-l-2 border-violet-100 pl-2">
          {isLoading ? (
            <div className="px-2 py-1 text-xs text-slate-500">Loading sections...</div>
          ) : (
            sections.map((sec) => {
              const secNameStr = `${classNameStr}${sec.name}`;
              const isSelected = selectedValue === secNameStr;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onSelect(secNameStr)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    isSelected ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  Section {sec.name}
                  {isSelected && (
                    <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
