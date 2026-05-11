"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Classes", href: "/classes" },
  { label: "Students", href: "/students" },
  { label: "Assignments", href: "/assignments" },
  { label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 rounded-2xl border border-sky-100 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="mb-6 flex h-[100px]  items-center justify-center gap-2 text-center">
        <Image src="/main.png" alt="Lumo Teacher Panel" width={50} height={50} />
        <h1 className="text-2xl font-semibold font-montserrat text-slate-900">
          Lumo Teacher
        </h1>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "block w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-medium text-white shadow-sm"
                  : "block w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
