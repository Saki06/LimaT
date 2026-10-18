"use client";

import React, { useState } from "react";
import { User as UserIcon, Phone, Mail, Lock, UserPlus, GraduationCap, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

interface StudentSignupFormProps {
  onSuccess: () => void;
}

export function StudentSignupForm({ onSuccess }: StudentSignupFormProps) {
  const { setCurrentRole, addToast } = useApp();

  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
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
      const res = await api.auth.registerStudent({
        firstName: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
      });

      if (res.success && res.token && res.user) {
        api.token.set(res.token);
        api.user.set(res.user);
        setCurrentRole("student");
        addToast({
          type: "success",
          title: "Student Account Created!",
          message: `Welcome, ${signupName || "Student"}! Your Student learning portal has been initialized.`
        });
        onSuccess();
      } else {
        addToast({
          type: "error",
          title: "Registration Failed",
          message: res.message || "Could not complete student registration."
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
        <label className="text-xs font-bold text-slate-700 block mb-1">Student Full Name *</label>
        <div className="relative">
          <UserIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={signupName}
            onChange={(e) => setSignupName(e.target.value)}
            placeholder="e.g. Alex Morgan"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] transition-all font-medium"
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
              placeholder="student@apex.edu"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] transition-all font-medium"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Mobile No (Optional)</label>
          <div className="relative">
            <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={signupPhone}
              onChange={(e) => setSignupPhone(e.target.value)}
              placeholder="077 123 4567"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] transition-all font-medium"
            />
          </div>
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
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] transition-all font-medium"
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
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] transition-all font-medium"
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
            className="rounded text-[#0d5c4d] focus:ring-0"
          />
          <span>I agree to the LimaT Terms &amp; Privacy Policy</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-1 bg-[#0d5c4d] hover:bg-[#083e34] ${
          isLoading ? "opacity-75 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Registering Student Account...</span>
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            <span>Create Account &amp; Join as Student</span>
          </>
        )}
      </button>
    </form>
  );
}
