"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/auth/session.client";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Classes", href: "/classes" },
  { label: "Students", href: "/students" },
  { label: "Assignments", href: "/assignments" },
  { label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearAuthSession();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="w-72 rounded-2xl border border-sky-100 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="mb-6 flex h-[100px]  items-center justify-center gap-2 text-center">
        <Image src="/main.png" alt="Alphores Teacher Panel" width={50} height={50} />
        <h1 className="text-2xl font-semibold font-montserrat text-slate-900">
          Alphores Teacher
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

      <div className="mt-8 border-t border-sky-100 pt-4">
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-700"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
