import Sidebar from "@/components/Sidebar";

export default function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#f5f9ff] text-slate-800">
      <header className="sticky top-0 z-20 border-b border-sky-100/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <span className="text-sm font-medium text-slate-500">
            Lumo teacher workspace
          </span>
          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-800">
            Teacher panel
          </span>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-7xl gap-6 p-6">
        <Sidebar />
        <main className="flex-1 rounded-2xl border border-sky-100 bg-white/80 p-8 shadow-sm backdrop-blur">
          {children}
        </main>
      </div>
    </div>
  );
}
