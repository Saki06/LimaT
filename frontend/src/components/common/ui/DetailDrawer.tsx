"use client";

import React from 'react';
import { X } from 'lucide-react';

interface DetailDrawerProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function DetailDrawer({ open, title, description, onClose, children }: DetailDrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close drawer" onClick={onClose} className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" />
      <aside role="dialog" aria-modal="true" aria-label={title} className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-[#e6ece8] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between border-b border-[#e6ece8] pb-5">
          <div><h2 className="text-xl font-black text-[#0d2b26]">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5c4d]"><X className="h-5 w-5" /></button>
        </div>
        <div className="pt-6">{children}</div>
      </aside>
    </div>
  );
}
