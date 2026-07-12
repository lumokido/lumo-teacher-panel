"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { pickPostLoginPath, useAuthLogin } from "@/hooks/useAuthLogin";

type RoleTab = "principal" | "teacher";

export default function LoginScreen() {
  const searchParams = useSearchParams();
  const { login, loading, error, setError } = useAuthLogin();
  const [tab, setTab] = useState<RoleTab>("principal");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await login(tab, {
      emailId: emailId.trim(),
      passwordHash: password,
    });
    if (!result.ok) return;

    const from = searchParams.get("from");
    const dest = pickPostLoginPath(from, result.role, result.redirectTo);

    // Full navigation so cookies are sent on the next request (middleware).
    window.location.href = dest;
  }

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Hero panel — director welcome */}
      <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 px-6 py-10 text-white lg:w-[52%] lg:px-12 lg:py-14 xl:px-16">
        <div
          className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <Image
              src="/logo.svg"
              alt="Vignan"
              width={100}
              height={100}
              className="h-100 w-100 object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-lg font-medium uppercase tracking-[0.2em] text-sky-300/90">
              Alphores  School
            </p>
            <p className="font-montserrat text-sm font-semibold text-white/90">
              Teacher Panel
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-10 flex flex-1 flex-col justify-center gap-8 lg:mt-0">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start lg:flex-col lg:items-start xl:flex-row xl:items-center">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-sky-400/40 to-indigo-400/30 blur-sm" />
              <div className="relative h-36 w-36 overflow-hidden rounded-full ring-4 ring-white/20 shadow-2xl sm:h-40 sm:w-40 lg:h-44 lg:w-44">
                <Image
                  src="/director.png"
                  alt="School Director"
                  width={176}
                  height={176}
                  className="h-full w-full object-cover object-top"
                  priority
                />
              </div>
            </div>

            <div className="text-center sm:text-left lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-300">
                Message from the Director
              </p>
              <blockquote className="mt-3 font-montserrat text-xl font-semibold leading-snug text-white sm:text-2xl lg:text-[1.65rem] lg:leading-snug xl:text-2xl">
                &ldquo;Learning is brighter when teachers and leaders stay in
                sync.&rdquo;
              </blockquote>
              <p className="mt-4 text-sm text-slate-300">
                Welcome to the Vignan staff portal — your hub for classes,
                attendance, exams, and school administration.
              </p>
            </div>
          </div>

          <ul className="hidden space-y-3 text-sm text-slate-300 lg:block">
            <li className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-300 ring-1 ring-sky-400/30">
                ✓
              </span>
              Principals access the full school overview and admin tools.
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-300 ring-1 ring-sky-400/30">
                ✓
              </span>
              Teachers manage classes, students, and assignments.
            </li>
          </ul>
        </div>

        <p className="relative z-10 mt-8 hidden text-xs text-slate-500 lg:block">
          © {new Date().getFullYear()} Vignan. All rights reserved.
        </p>
      </section>

      {/* Login panel */}
      <section className="flex flex-1 flex-col justify-center bg-gradient-to-br from-slate-50 via-white to-sky-50/60 px-6 py-10 lg:px-12 lg:py-14 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:mb-10">
            <h1 className="font-montserrat text-3xl font-bold tracking-tight text-slate-900">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Choose your role and enter your school credentials.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1.5">
            <button
              type="button"
              onClick={() => {
                setTab("principal");
                setError(null);
              }}
              className={
                tab === "principal"
                  ? "rounded-xl bg-white py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                  : "rounded-xl py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
              }
            >
              Principal
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("teacher");
                setError(null);
              }}
              className={
                tab === "teacher"
                  ? "rounded-xl bg-white py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                  : "rounded-xl py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
              }
            >
              Teacher
            </button>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/50"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="emailId"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="emailId"
                  name="emailId"
                  type="email"
                  autoComplete="email"
                  required
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  placeholder={
                    tab === "principal"
                      ? "principal@school.com"
                      : "teacher@school.com"
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {error ? (
                <p
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Your session stays on this device until you sign out.
          </p>
        </div>
      </section>
    </div>
  );
}
