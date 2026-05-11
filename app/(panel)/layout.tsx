import Sidebar from "@/components/Sidebar";

export default function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#f5f9ff] text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 p-6">
        <Sidebar />
        <main className="flex-1 rounded-2xl border border-sky-100 bg-white/80 p-8 shadow-sm backdrop-blur">
          {children}
        </main>
      </div>
    </div>
  );
}
