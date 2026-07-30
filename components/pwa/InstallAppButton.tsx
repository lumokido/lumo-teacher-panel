"use client";

import { Download, CheckCircle2, Share } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Props = {
  className?: string;
  variant?: "login" | "compact";
};

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export default function InstallAppButton({ className = "", variant = "login" }: Props) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    setIos(isIos());

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
      setShowHelp(false);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const onClick = useCallback(async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    setShowHelp((v) => !v);
  }, [deferred]);

  if (installed) {
    if (variant === "compact") return null;
    return (
      <div
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ${className}`}
      >
        <CheckCircle2 className="h-4 w-4" />
        App installed on this device
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void onClick()}
        className={
          variant === "compact"
            ? "inline-flex items-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700"
            : "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.99]"
        }
      >
        {ios && !deferred ? <Share className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        Download App
      </button>

      {showHelp && (
        <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50/90 p-3 text-left text-xs leading-relaxed text-slate-600">
          {ios ? (
            <>
              <p className="font-semibold text-slate-800">Install on iPhone / iPad</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4">
                <li>
                  Tap <span className="font-semibold">Share</span> in Safari
                </li>
                <li>
                  Choose <span className="font-semibold">Add to Home Screen</span>
                </li>
                <li>
                  Tap <span className="font-semibold">Add</span>
                </li>
              </ol>
            </>
          ) : deferred ? null : (
            <>
              <p className="font-semibold text-slate-800">Install this app</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>
                  <span className="font-semibold">Android / Chrome:</span> open the browser menu →
                  Install app / Add to Home screen
                </li>
                <li>
                  <span className="font-semibold">Desktop Chrome/Edge:</span> click the install icon
                  in the address bar
                </li>
                <li>Use HTTPS (required for install)</li>
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
