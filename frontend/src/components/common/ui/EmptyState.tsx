import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return <div className="rounded-2xl border border-dashed border-[#cbdad3] bg-white p-10 text-center"><Inbox className="mx-auto h-8 w-8 text-[#0d8b71]" /><h3 className="mt-3 text-base font-extrabold text-[#0d2b26]">{title}</h3>{description && <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{description}</p>}{action && <div className="mt-5">{action}</div>}</div>;
}
