"use client";

import { useState } from "react";
import AttendanceOverviewPanel from "@/components/principal/attendance/AttendanceOverviewPanel";
import ClassesGrid from "@/components/principal/attendance/ClassesGrid";
import { format } from "date-fns";

export default function AttendancePage() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-violet-600">Attendance</p>
            <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
              School Overview
            </h2>
            <p className="mt-2 text-slate-600">
              Daily attendance statistics and history.
            </p>
          </div>
          
          
          <div className="relative flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
           
           
            <svg className="h-5 w-5 text-violet-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-slate-700 outline-none cursor-pointer"
            />
          </div>
          
        </div>
      
      <div className="">

        <AttendanceOverviewPanel date={date} />
      </div>
      
      </section>

      
    </div>
  );
}

