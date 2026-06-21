"use client";

import { useState, useRef, useEffect } from "react";

const SUBJECTS_LIST = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Geography",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Physical Education",
  "Art",
  "Music",
  "Hindi",
  "Telugu",
  "Social Studies"
];

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function SubjectMultiSelect({ value, onChange }: Props) {
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
        className="flex min-h-[42px] w-full cursor-pointer flex-wrap items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus-within:ring-2 focus-within:ring-violet-300 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedSet.size === 0 ? (
          <span className="text-slate-500">Select subjects...</span>
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
        <div className="absolute z-10 bottom-full mb-2 max-h-56 w-full overflow-y-auto rounded-xl border border-violet-100 bg-white p-2 shadow-lg">
          <div className="mb-2 px-1 pb-2 border-b border-violet-50">
            <input
              type="text"
              placeholder="Type custom subject & press Enter"
              className="w-full rounded-lg border border-violet-200 px-3 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-300"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = e.currentTarget.value.trim();
                  if (val) {
                    toggleSelection(val);
                    e.currentTarget.value = "";
                  }
                }
              }}
            />
          </div>
          
          {Array.from(new Set([...SUBJECTS_LIST, ...Array.from(selectedSet)])).map((subject) => {
            const isSelected = selectedSet.has(subject);
            return (
              <label 
                key={subject} 
                className="mb-1 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  checked={isSelected}
                  onChange={() => toggleSelection(subject)}
                />
                {subject}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
