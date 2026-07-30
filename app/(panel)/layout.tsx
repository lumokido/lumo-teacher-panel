"use client";

import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function PanelLayout({
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
    <div className="min-h-screen bg-[#f5f9ff] text-slate-800 flex flex-col">
      <header className="sticky top-0 z-30 border-b border-sky-100/80 bg-white/85 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-sm font-medium text-slate-500">
              Alphores teacher workspace
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
              Built by Lumo
            </span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-800">
              Teacher panel
            </span>
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
            <Sidebar />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 rounded-2xl border border-sky-100 bg-white/80 p-4 md:p-8 shadow-sm backdrop-blur transition-all duration-300 flex flex-col justify-between">
          <div className="flex-1">{children}</div>
          <footer className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Alphores Educational Institutions © 2026</span>
            <span className="font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
              Built by Lumo
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
