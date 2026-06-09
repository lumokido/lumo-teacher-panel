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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-[#f0f7ff] to-indigo-50 text-slate-800">
      <div
        className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-indigo-200/35 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:items-stretch md:gap-12 md:px-8 md:py-14">
        <section className="flex flex-1 flex-col justify-center rounded-3xl border border-white/60 bg-white/50 p-8 shadow-lg shadow-sky-100/50 backdrop-blur-md md:max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-3xl bg-white shadow-md ring-1 ring-sky-100">
              <Image
                src="/image.png"
                alt="Vignan"
                width={96}
                height={96}
                className="h-20 w-20 object-contain"
                priority
              />
            </div>
            <p className="text-sm font-medium uppercase tracking-widest text-sky-600">
              VIgnan 
            </p>
            <h1 className="mt-2 font-montserrat text-3xl font-bold text-slate-900">
              Welcome back
            </h1>
            <p className="mt-2 max-w-xs text-sm text-slate-600">
              Sign in as principal or teacher to open your panel.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/80 p-1.5">
            <button
              type="button"
              onClick={() => {
                setTab("principal");
                setError(null);
              }}
              className={
                tab === "principal"
                  ? "rounded-xl bg-white py-2.5 text-sm font-semibold text-sky-700 shadow-sm"
                  : "rounded-xl py-2.5 text-sm font-medium text-slate-600 transition hover:text-slate-900"
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
                  ? "rounded-xl bg-white py-2.5 text-sm font-semibold text-sky-700 shadow-sm"
                  : "rounded-xl py-2.5 text-sm font-medium text-slate-600 transition hover:text-slate-900"
              }
            >
              Teacher
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-sky-200 transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-sky-200 transition focus:border-sky-400 focus:ring-2"
              />
            </div>

            {error ? (
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-sky-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-200/50 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </section>

        <section className="hidden flex-1 flex-col justify-center rounded-3xl border border-sky-100/80 bg-white/40 p-10 shadow-inner backdrop-blur-sm md:flex">
          <blockquote className="font-montserrat text-2xl font-semibold leading-relaxed text-slate-800">
            “Learning is brighter when teachers and leaders stay in sync.”
          </blockquote>
          <p className="mt-6 text-sm text-slate-600">
            Use your school email and password. Your session stays on this
            device until you sign out.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                ✓
              </span>
              Principals get the full school overview and admin tools.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                ✓
              </span>
              Teachers jump straight to classes, students, and assignments.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
