"use client";

import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  trend: number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'green' | 'gold' | 'sky' | 'violet';
  data?: number[];
  loading?: boolean;
  onClick?: () => void;
  relatedView?: string;
}

const tones = {
  green: 'bg-emerald-50 text-emerald-700',
  gold: 'bg-amber-50 text-amber-700',
  sky: 'bg-sky-50 text-sky-700',
  violet: 'bg-violet-50 text-violet-700'
};

export function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  tone = 'green',
  data = [4, 7, 5, 9, 8, 12, 14],
  loading = false,
  onClick,
  relatedView
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    if (loading) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      requestAnimationFrame(() => setDisplayValue(value));
      return;
    }
    const start = performance.now();
    const frame = (now: number) => {
      const progress = Math.min((now - start) / 600, 1);
      setDisplayValue(Math.round(value * progress));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [loading, value]);

  if (loading) {
    return <Card className="h-40 animate-pulse p-5"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></Card>;
  }

  const TrendIcon = trend >= 0 ? ArrowUpRight : ArrowDownRight;
  const chartData = data.map((amount, index) => ({ index, amount }));
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${value}`}
      className="block w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5c4d] focus-visible:ring-offset-2"
      data-related-view={relatedView}
    >
      <Card className="group min-h-40 p-5 transition-transform hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
          <span className={cn('rounded-xl p-2.5', tones[tone])}><Icon className="h-5 w-5" /></span>
        </div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-black tabular-nums text-[#0d2b26]">{displayValue.toLocaleString()}</p>
            <span className={cn('mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold', trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
              <TrendIcon className="h-3 w-3" /> {Math.abs(trend)}% <span className="font-medium opacity-70">vs last term</span>
            </span>
          </div>
          <div className="h-12 w-24" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id={`stat-${label.replace(/\W/g, '')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d8b71" stopOpacity={0.3} /><stop offset="100%" stopColor="#0d8b71" stopOpacity={0} /></linearGradient></defs>
                <Area type="monotone" dataKey="amount" stroke="#0d8b71" strokeWidth={2} fill={`url(#stat-${label.replace(/\W/g, '')})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </button>
  );
}
