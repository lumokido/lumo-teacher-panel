"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  School,
  Users,
  FileText,
  Clock,
  LogOut,
  Award,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { clearAuthSession } from "@/lib/auth/session.client";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Classes", href: "/classes", icon: School },
  { label: "Students", href: "/students", icon: Users },
  { label: "Assignments", href: "/assignments", icon: FileText },
  { label: "Quizzes", href: "/quizzes", icon: HelpCircle },
  { label: "Report Card", href: "/reportcard", icon: Award },
  { label: "Timetable", href: "/timetable", icon: Clock },
  { label: "Communication Hub", href: "/messages", icon: MessageSquare },
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
        <Image src="/logo.svg" alt="Alphores Teacher Panel" width={50} height={50} />
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
                  ? "flex items-center gap-3 w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200"
                  : "flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-sky-50 hover:text-sky-700 hover:translate-x-1"
              }
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-sky-600"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-sky-100 pt-4 space-y-3">
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 hover:translate-x-1 cursor-pointer"
        >
          <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-600" />
          <span>Sign out</span>
        </button>

        <div className="pt-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-100 px-3 py-1 text-[11px] font-bold text-sky-700 tracking-wide">
            Built by Lumo ✨
          </span>
        </div>
      </div>
    </aside>
  );
}
