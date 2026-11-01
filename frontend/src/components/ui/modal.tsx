"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeMap: Record<string, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-5xl"
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-2xl",
  size
}: ModalProps) {
  const effectiveMaxWidth = size ? (sizeMap[size] || maxWidth) : maxWidth;
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative z-50 w-full overflow-hidden rounded-3xl border border-[#c4e9e0] bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200",
          effectiveMaxWidth
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#e6ece8]">
          <div>
            <h2 className="text-xl font-black text-[#0d2b26]">{title}</h2>
            {description && (
              <p className="text-xs text-slate-500 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 max-h-[75vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
