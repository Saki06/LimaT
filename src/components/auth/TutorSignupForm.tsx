"use client";

import React, { useState } from "react";
import { User as UserIcon, Phone, Mail, Lock, UserPlus, Sparkles, BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface TutorSignupFormProps {
  onSuccess: () => void;
}

export function TutorSignupForm({ onSuccess }: TutorSignupFormProps) {
  const { setCurrentRole, addToast } = useApp();

  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [subjectSpecialization, setSubjectSpecialization] = useState("Combined Mathematics");
  const [teachingMedium, setTeachingMedium] = useState("Tamil & English");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

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

    if (!agreeTerms) {
      addToast({
        type: "error",
        title: "Terms Required",
        message: "Please agree to the LimaT Terms & Privacy Policy to continue."
      });
      return;
    }

    setCurrentRole("teacher");
    addToast({
      type: "success",
      title: "Tutor Profile Initialized!",
      message: `Welcome, ${signupName || "Educator"}! Your Tutor Cockpit & Course Creator Desk is ready.`
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Tutor / Educator Full Name *</label>
        <div className="relative">
          <UserIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={signupName}
            onChange={(e) => setSignupName(e.target.value)}
            placeholder="e.g. Dr. K. Arulnesan"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#b47a16] focus:ring-2 focus:ring-[#b47a16]/10 transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Primary Subject *</label>
          <div className="relative">
            <BookOpen className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={subjectSpecialization}
              onChange={(e) => setSubjectSpecialization(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#b47a16] cursor-pointer"
            >
              <option value="Combined Mathematics">Combined Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Commerce & Accounting">Commerce & Accounting</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Teaching Medium *</label>
          <select
            value={teachingMedium}
            onChange={(e) => setTeachingMedium(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#b47a16] cursor-pointer"
          >
            <option value="Tamil Medium">தமிழ் Medium</option>
            <option value="English Medium">English Medium</option>
            <option value="Sinhala Medium">සිංහල Medium</option>
            <option value="Tamil & English">Bilingual (Tamil & English)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp Mobile *</label>
          <div className="relative">
            <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              required
              value={signupPhone}
              onChange={(e) => setSignupPhone(e.target.value)}
              placeholder="e.g. 077 987 6543"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#b47a16] focus:ring-2 focus:ring-[#b47a16]/10 transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Tutor Email Address *</label>
          <div className="relative">
            <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="tutor@soloclass.lk"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#b47a16] focus:ring-2 focus:ring-[#b47a16]/10 transition-all font-medium"
            />
          </div>
        </div>
      </div>

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
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#b47a16] transition-all font-medium"
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
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#b47a16] transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <div className="pt-0.5 text-xs">
        <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="rounded text-[#b47a16] focus:ring-0"
          />
          <span>I agree to the LimaT Educator Terms &amp; Privacy Policy</span>
        </label>
      </div>

      <button
        type="submit"
        className="w-full text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-1 bg-[#b47a16] hover:bg-[#96640f]"
      >
        <Sparkles className="h-4 w-4" />
        <span>Register &amp; Launch Tutor Cockpit</span>
      </button>
    </form>
  );
}
