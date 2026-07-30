"use client";

import { useUpcomingBirthdays } from "@/hooks/useStudents";
import { Cake, Sparkles, Calendar, Loader2, PartyPopper, Gift } from "lucide-react";
import Image from "next/image";
import { format, parseISO } from "date-fns";

export function UpcomingBirthdaysWidget({ theme = "sky" }: { theme?: "sky" | "violet" }) {
  // Always fixed to 7 days
  const { data: birthdays = [], isLoading } = useUpcomingBirthdays(7);

  const isViolet = theme === "violet";
  const badgeBorder = isViolet ? "border-violet-200" : "border-sky-200";

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
        <span className="text-sm font-medium">Checking upcoming birthdays (next 7 days)...</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-purple-500/10 p-5 sm:p-6 shadow-sm">
      {/* Background Decorative Accents */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-400/20 blur-2xl" />
      <div className="pointer-events-none absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-rose-400/20 blur-2xl" />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-md">
              <Cake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-montserrat text-lg font-bold text-slate-900 flex items-center gap-2">
                Upcoming Student Birthdays
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-extrabold text-amber-800 border border-amber-300">
                  Next 7 Days
                </span>
              </h3>
              <p className="text-xs text-slate-500">Celebrate student birthdays this week</p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {birthdays.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-amber-200 bg-white/80 p-4 text-slate-500 backdrop-blur-xs">
            <Gift className="h-5 w-5 text-amber-400 shrink-0" />
            <p className="text-xs font-semibold text-slate-600">
              No student birthdays coming up in the next 7 days.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {birthdays.map((student) => {
              const fullName = `${student.firstName} ${student.lastName}`.trim();
              const daysLeft = student.daysUntilBirthday;

              let formattedDob = student.dateOfBirth;
              try {
                if (student.dateOfBirth) {
                  formattedDob = format(parseISO(student.dateOfBirth), "MMM dd");
                }
              } catch {
                formattedDob = student.dateOfBirth;
              }

              const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase() || "ST";

              return (
                <div
                  key={student.id || student.studentId}
                  className="flex items-center justify-between rounded-xl border border-amber-100 bg-white/90 p-3.5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-200 backdrop-blur-xs relative group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-amber-300 bg-amber-50 flex items-center justify-center text-amber-900 font-extrabold text-xs shadow-xs">
                      {student.profilePhotoUrl ? (
                        <Image
                          src={student.profilePhotoUrl}
                          alt={fullName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-amber-700 transition-colors">
                        {fullName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 shrink-0">
                          {student.className || "Class N/A"}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-medium text-slate-500 text-[11px] truncate">{formattedDob}</span>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Badge */}
                  <div className="shrink-0 ml-2">
                    {daysLeft === 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-xs animate-pulse">
                        <PartyPopper className="h-3 w-3" /> Today! 🎉
                      </span>
                    ) : daysLeft === 1 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 border border-amber-300">
                        <Sparkles className="h-3 w-3 text-amber-600" /> Tomorrow
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
                        In {daysLeft} days
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
