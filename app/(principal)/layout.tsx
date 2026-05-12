import PrincipalSidebar from "@/components/principal/PrincipalSidebar";

export default function PrincipalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-[#f5f3ff] to-indigo-50 text-slate-800">
      <header className="sticky top-0 z-20 border-b border-violet-100/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <span className="text-sm font-medium text-slate-500">
            Lumo school administration
          </span>
          <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-800">
            Principal panel
          </span>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-7xl gap-6 p-6">
        <PrincipalSidebar />
        <main className="flex-1 rounded-2xl border border-violet-100 bg-white/90 p-8 shadow-sm backdrop-blur">
          {children}
        </main>
      </div>
    </div>
  );
}
