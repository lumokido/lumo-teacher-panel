"use client";

import InstallAppButton from "@/components/pwa/InstallAppButton";
import { Download } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium text-sky-600">Settings</p>
        <h2 className="text-3xl font-semibold font-montserrat text-slate-900">
          Panel Settings
        </h2>
        <p className="mt-3 max-w-xl text-slate-600">
          Update profile, preferences, and panel configuration.
        </p>
      </div>

      <section className="max-w-lg rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
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
