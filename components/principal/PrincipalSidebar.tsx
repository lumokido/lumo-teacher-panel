"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/auth/session.client";

const navItems = [
  { label: "Overview", href: "/principal/dashboard" },
  { label: "School", href: "/principal/school" },
  { label: "Reports", href: "/principal/reports" },
  { label: "Teachers", href: "/principal/teachers" },
  {label : "Students" , href:"/principal/students"}
];

export default function PrincipalSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearAuthSession();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="w-72 rounded-2xl border border-violet-100 bg-white/90 p-2 shadow-sm backdrop-blur">
      <div className="mb-6 flex h-[100px] items-center justify-center gap-2 text-center">
        <Image src="/logo.svg" alt="Alphores" width={100} height={100} />
        <h1 className="text-xl font-semibold font-montserrat text-violet-950">
          Alphores Principal
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
                  ? "block w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white shadow-sm"
                  : "block w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-violet-50 hover:text-violet-800"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-violet-100 pt-4">
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
