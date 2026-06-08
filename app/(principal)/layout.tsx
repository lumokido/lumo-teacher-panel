"use client";

import PrincipalSidebar from "@/components/principal/PrincipalSidebar";
import Image from "next/image";
import { useState } from "react";

export default function PrincipalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-[#f5f3ff] to-indigo-50 text-slate-800">
      <header className="sticky top-0 z-20 border-b border-violet-100/80 bg-white/85 backdrop-blur-md">
        <div className="flex items-center gap-4 px-4 py-3 md:px-8">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-violet-100 hover:text-violet-700 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <span className="text-sm font-medium text-slate-500">
            Alphores school administration
          </span>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden sm:inline-block rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-800">
              Director Panel
            </span>
            <Image 
              src="/director.png" 
              alt="Director Profile" 
              width={40} 
              height={40} 
              className="rounded-full object-cover shadow-sm ring-2 ring-violet-200" 
            />
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)] w-full gap-6 p-6">
        <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-72 opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-full overflow-hidden"}`}>
          <div className="w-72">
            <PrincipalSidebar />
          </div>
        </div>
        <main className="flex-1 rounded-2xl border border-violet-100 bg-white/90 p-8 shadow-sm backdrop-blur overflow-hidden transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
