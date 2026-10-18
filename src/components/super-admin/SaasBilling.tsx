"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SaasBillingProps {
  onSelectPlanForOnboard: (plan: "starter" | "pro" | "enterprise", fee: number) => void;
}

export function SaasBilling({ onSelectPlanForOnboard }: SaasBillingProps) {
  return (
    <div className="space-y-6">
      <Card className="border-[#c4e9e0] bg-white shadow-2xs p-6 space-y-4">
        <h3 className="text-lg font-black text-[#0d2b26]">Commercial SaaS Packaging &amp; Licensing</h3>
        <p className="text-xs text-slate-600 max-w-3xl">
          We offer 3 standardized SaaS editions tailored to distinct customer market segments in Sri Lanka:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Plan 1: Solo Creator Starter */}
          <div className="p-5 rounded-2xl border-2 border-slate-300 bg-slate-50/60 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <Badge className="bg-slate-200 text-slate-800 font-extrabold text-[10px]">
                Solo Creator Starter
              </Badge>
              <div>
                <p className="text-2xl font-black text-[#0d2b26]">LKR 8,500</p>
                <p className="text-[11px] text-slate-500 font-semibold">/ month &bull; 1 Tutor License</p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Pre-recorded Video Courses
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Downloadable Past Paper Library
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Homework &amp; Quiz Submissions
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Up to 100 Enrolled Students
                </li>
                <li className="flex items-center gap-1.5 text-slate-400 line-through">
                  <X className="h-3.5 w-3.5" /> Live Google Meet Studio
                </li>
                <li className="flex items-center gap-1.5 text-slate-400 line-through">
                  <X className="h-3.5 w-3.5" /> Multi-Teacher Management
                </li>
              </ul>
            </div>

            <Button
              size="sm"
              onClick={() => onSelectPlanForOnboard("starter", 8500)}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
            >
              Onboard Starter Tutor
            </Button>
          </div>

          {/* Plan 2: Solo Educator Pro */}
          <div className="p-5 rounded-2xl border-2 border-emerald-400 bg-emerald-50/50 space-y-4 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-100 text-emerald-900 font-extrabold text-[10px]">
                  Solo Educator Pro
                </Badge>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                  Most Popular
                </span>
              </div>
              <div>
                <p className="text-2xl font-black text-[#0d2b26]">LKR 18,000</p>
                <p className="text-[11px] text-slate-500 font-semibold">/ month &bull; 1 Tutor License</p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Unlimited Enrolled Students
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Direct Tuition Subscriptions
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> BOC / Commercial Bank Slip Approvals
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Live Meet / Zoom Broadcast Studio
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Interactive Study Packages &amp; Syllabus
                </li>
                <li className="flex items-center gap-1.5 text-slate-400 line-through">
                  <X className="h-3.5 w-3.5" /> Multi-Teacher Management
                </li>
              </ul>
            </div>

            <Button
              size="sm"
              onClick={() => onSelectPlanForOnboard("pro", 18000)}
              className="w-full bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold cursor-pointer"
            >
              Onboard Pro Tutor
            </Button>
          </div>

          {/* Plan 3: Solo Masterclass Elite */}
          <div className="p-5 rounded-2xl border-2 border-purple-400 bg-purple-50/40 space-y-4 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <Badge className="bg-purple-100 text-purple-900 font-extrabold text-[10px]">
                Solo Masterclass Elite
              </Badge>
              <div>
                <p className="text-2xl font-black text-[#0d2b26]">LKR 28,000</p>
                <p className="text-[11px] text-slate-500 font-semibold">/ month &bull; 1 Tutor License</p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-purple-600" /> Unlimited Enrolled Students
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-purple-600" /> 1-on-1 Paper Evaluation &amp; Solutions
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-purple-600" /> Model Paper &amp; Revision Marketplace
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-purple-600" /> Priority Dedicated Video CDN
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-purple-600" /> Automated WhatsApp SMS Alerts
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-purple-600" /> Custom Domain &amp; Tutor Brand
                </li>
              </ul>
            </div>

            <Button
              size="sm"
              onClick={() => onSelectPlanForOnboard("enterprise", 28000)}
              className="w-full bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold cursor-pointer"
            >
              Onboard Masterclass Tutor
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
