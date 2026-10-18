"use client";

import React, { useState } from "react";
import { User as UserIcon, Phone, Mail, Lock, UserPlus, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    try {
      const res = await api.auth.registerTutor({
        firstName: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        specialization: subjectSpecialization,
      });

      if (res.success && res.token && res.user) {
        api.token.set(res.token);
        api.user.set(res.user);
        setCurrentRole("teacher");
        addToast({
          type: "success",
          title: "Tutor Profile Initialized!",
          message: `Welcome, ${signupName || "Educator"}! Your Tutor Cockpit & Course Creator Desk is ready.`
        });
        onSuccess();
      } else {
        addToast({
          type: "error",
          title: "Registration Failed",
          message: res.message || "Could not complete tutor registration."
        });
      }
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Connection Error",
        message: err.message || "Could not reach registration server."
      });
    } finally {
      setIsLoading(false);
    }
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
            placeholder="e.g. Dr. Samantha Perera"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#b47a16] transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
          <div className="relative">
            <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="tutor@soloclass.lk"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#b47a16] transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone (Optional)</label>
          <div className="relative">
            <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={signupPhone}
              onChange={(e) => setSignupPhone(e.target.value)}
              placeholder="077 987 6543"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#b47a16] transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Primary Subject Specialization</label>
          <div className="relative">
            <BookOpen className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={subjectSpecialization}
              onChange={(e) => setSubjectSpecialization(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#b47a16] transition-all font-medium appearance-none cursor-pointer"
            >
              <option value="Combined Mathematics">Combined Mathematics</option>
              <option value="Advanced Physics">Advanced Level Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Information Technology">Information &amp; Tech (ICT)</option>
              <option value="Commerce & Accounting">Commerce &amp; Accounting</option>
              <option value="English Literature">English &amp; General Literature</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Teaching Medium</label>
          <select
            value={teachingMedium}
            onChange={(e) => setTeachingMedium(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#b47a16] transition-all font-medium appearance-none cursor-pointer"
          >
            <option value="Tamil Medium">Tamil Medium (தமிழ்)</option>
            <option value="English Medium">English Medium</option>
            <option value="Tamil & English">Bilingual (Tamil &amp; English)</option>
            <option value="Sinhala Medium">Sinhala Medium</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Create Password *</label>
          <div className="relative">
            <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="At least 6 chars"
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
        disabled={isLoading}
        className={`w-full text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-1 bg-[#b47a16] hover:bg-[#96640f] ${
          isLoading ? "opacity-75 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Launching Tutor Cockpit...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span>Register &amp; Launch Tutor Cockpit</span>
          </>
        )}
      </button>
    </form>
  );
}
