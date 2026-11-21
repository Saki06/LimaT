"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-5 sm:right-5 z-50 flex flex-col gap-2.5 sm:max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = "border-indigo-500/40";
        let icon = <Info className="h-5 w-5 text-indigo-400 shrink-0" />;

        if (toast.type === "success") {
          borderClass = "border-emerald-500/50 bg-emerald-950/40 text-emerald-100";
          icon = <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === "error" || toast.type === "warning") {
          borderClass = "border-rose-500/50 bg-rose-950/40 text-rose-100";
          icon = <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />;
        } else {
          borderClass = "border-slate-700 bg-slate-900/90 text-slate-100";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 text-sm">
              <p className="font-semibold">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label={`Dismiss notification: ${toast.title}`}
              onClick={() => removeToast(toast.id)}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center -mr-2 p-2.5 md:min-h-0 md:min-w-0 md:mr-0 md:p-1 rounded text-slate-400 hover:text-white shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
