"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/auth/session.client";

import {
  LayoutDashboard,
  School,
  GraduationCap,
  Calendar,
  Megaphone,
  Clock,
  LogOut,
  Users,
  ClipboardList,
  BookOpen,
  Award,
  Images,
  HelpCircle,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/principal/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/principal/attendance", icon: Calendar },

  { label: "Classes", href: "/principal/classes", icon: GraduationCap },
  { label: "Exams", href: "/principal/exams", icon: ClipboardList },
  { label: "Report Card", href: "/principal/reportcard", icon: Award },

  { label: "Homework", href: "/principal/homework", icon: BookOpen },
  { label: "Quizzes", href: "/principal/quizzes", icon: HelpCircle },

  { label: "Teachers", href: "/principal/teachers", icon: Users },
  { label: "Timetable", href: "/principal/timetable", icon: Clock },
  { label: "Announcements & Events", href: "/principal/announcements", icon: Megaphone },
  { label: "School Gallery", href: "/principal/gallery", icon: Images },
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
          Alphores Director
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
                  ? "flex items-center gap-3 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200"
                  : "flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-violet-50 hover:text-violet-800 hover:translate-x-1"
              }
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-violet-600"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-violet-100 pt-4 space-y-3">
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 hover:translate-x-1 cursor-pointer"
        >
          <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-600" />
          <span>Sign out</span>
        </button>

        <div className="pt-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-[11px] font-bold text-violet-700 tracking-wide">
            Built by Lumo ✨
          </span>
        </div>
      </div>
    </aside>
  );
}
