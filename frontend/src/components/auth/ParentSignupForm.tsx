"use client";

import React, { useState } from "react";
import { Users, User as UserIcon, Phone, GraduationCap, Lock, UserPlus } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface ParentSignupFormProps {
  onSuccess: () => void;
}

export function ParentSignupForm({ onSuccess }: ParentSignupFormProps) {
  const { setCurrentRole, addToast } = useApp();

  const [parentTitle, setParentTitle] = useState("Mrs.");
  const [signupName, setSignupName] = useState("");
  const [parentRelation, setParentRelation] = useState("Mother");
  const [parentPhone, setParentPhone] = useState("");
  const [childName, setChildName] = useState("");
  const [childPhoneOrId, setChildPhoneOrId] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [parentConsent, setParentConsent] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (signupPassword && signupConfirmPassword && signupPassword !== signupConfirmPassword) {
      addToast({
        type: "error",
        title: "Password Mismatch",
        message: "The passwords entered do not match. Please re-enter."
      });
      return;
    }

    if (!signupName.trim() || !parentPhone.trim() || !childName.trim() || !childPhoneOrId.trim()) {
      addToast({
        type: "error",
        title: "Missing Required Details",
        message: "Please fill in Guardian Name, Mobile Number, Student Full Name, and Student WhatsApp/ID."
      });
      return;
    }

    if (!parentConsent) {
      addToast({
        type: "error",
        title: "Guardian Verification Required",
        message: "Please confirm that you are the legal parent or guardian to monitor tuition records."
      });
      return;
    }

    setCurrentRole("parent");
    addToast({
      type: "success",
      title: "Guardian Account Registered!",
      message: `Welcome, ${parentTitle} ${signupName}! Account successfully linked with ${childName}.`
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      <div className="space-y-4">
        {/* Step 1: Guardian Information */}
        <div className="space-y-3 pt-1">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#1e3a5f]" />
            <span>1. Guardian Information</span>
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Guardian Full Name *</label>
            <div className="flex gap-2">
              <select
                value={parentTitle}
                onChange={(e) => setParentTitle(e.target.value)}
                className="w-24 h-10 px-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#1e3a5f] cursor-pointer shrink-0"
              >
                <option value="Mrs.">Mrs.</option>
                <option value="Mr.">Mr.</option>
                <option value="Dr.">Dr.</option>
                <option value="Rev.">Rev.</option>
              </select>
              <div className="relative flex-1 min-w-0">
                <UserIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Priyadarshani Kulatunga"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Relationship *</label>
              <select
                value={parentRelation}
                onChange={(e) => setParentRelation(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#1e3a5f] cursor-pointer"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Legal Guardian">Legal Guardian</option>
                <option value="Grandparent">Grandparent</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mobile No (WhatsApp) *</label>
              <div className="relative">
                <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="e.g. 077 123 4567"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Student Linking & Verification */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-[#1e3a5f]" />
            <span>2. Student Linking &amp; Verification</span>
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Child&apos;s Full Name *</label>
            <div className="relative">
              <UserIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g. Sathurjan Kaveen"
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e3a5f] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Student WhatsApp No / Student ID *</label>
            <div className="relative">
              <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={childPhoneOrId}
                onChange={(e) => setChildPhoneOrId(e.target.value)}
                placeholder="e.g. 077 987 6543 or STU-2026-042"
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-[#1e3a5f] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Account Security */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-[#1e3a5f]" />
            <span>3. Account Security</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Create Password *</label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e3a5f] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e3a5f] font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-1 text-xs">
            <label className="flex items-start gap-2 cursor-pointer text-slate-600 font-medium select-none">
              <input
                type="checkbox"
                checked={parentConsent}
                onChange={(e) => setParentConsent(e.target.checked)}
                className="rounded text-[#1e3a5f] focus:ring-0 mt-0.5"
              />
              <span className="text-[11px] leading-relaxed">
                I verify that I am the legal parent or guardian to monitor tuition fee receipts and attendance.
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Complete Parent Registration &amp; Link Student</span>
        </button>
      </div>
    </form>
  );
}
