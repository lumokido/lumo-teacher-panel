"use client";

import InstallAppButton from "@/components/pwa/InstallAppButton";
import { Download } from "lucide-react";

export default function PrincipalSchoolPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium text-violet-600">School</p>
        <h2 className="text-3xl font-semibold font-montserrat text-slate-900">
          School profile
        </h2>
        <p className="mt-3 max-w-xl text-slate-600">
          Configure school-wide settings and policies here.
        </p>
      </div>

      <section className="max-w-lg rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-montserrat text-lg font-semibold text-slate-900">
              Install app
            </h3>
            <p className="text-sm text-slate-500">
              Download Alphores Teacher Panel to your device for faster access.
            </p>
          </div>
        </div>
        <InstallAppButton />
      </section>
    </div>
  );
}
