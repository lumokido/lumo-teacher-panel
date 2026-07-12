"use client";

import PrincipalSidebar from "@/components/principal/PrincipalSidebar";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function PrincipalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Set default state based on window size after mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    handleResize(); // run initially
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-[#f5f3ff] to-indigo-50 text-slate-800 flex flex-col">
      <header className="sticky top-0 z-30 border-b border-violet-100/80 bg-white/85 backdrop-blur-md">
        <div className="flex items-center gap-4 px-4 py-3 md:px-8">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-violet-100 hover:text-violet-700 transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <span className="text-sm font-medium text-slate-500">
            Alphores administration
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

      <div className="flex flex-1 w-full gap-4 md:gap-6 p-4 md:p-6 relative overflow-hidden">
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        <div 
          className={`
            fixed inset-y-0 left-0 z-50 w-72 transform p-4 md:p-0
            md:relative md:inset-auto md:z-auto md:transform-none
            transition-all duration-300 ease-in-out
            ${isSidebarOpen 
              ? "translate-x-0 opacity-100" 
              : "-translate-x-full md:-translate-x-full opacity-0 md:w-0 md:overflow-hidden pointer-events-none md:pointer-events-auto"
            }
          `}
        >
          <div className="w-full h-full md:h-auto bg-white rounded-2xl md:bg-transparent shadow-xl md:shadow-none border md:border-none">
            <div className="flex md:hidden justify-end p-2 border-b">
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <PrincipalSidebar />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 rounded-2xl border border-violet-100 bg-white/90 p-4 md:p-8 shadow-sm backdrop-blur transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
