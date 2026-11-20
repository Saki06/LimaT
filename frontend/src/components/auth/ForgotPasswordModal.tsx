"use client";

import React, { useState } from "react";
import { X, Mail, KeyRound, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  onPasswordResetSuccess?: (email: string) => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  defaultEmail = "",
  onPasswordResetSuccess,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [email, setEmail] = useState(defaultEmail);
  const [prevDefaultEmail, setPrevDefaultEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync defaultEmail when prop changes
  if (defaultEmail !== prevDefaultEmail) {
    setPrevDefaultEmail(defaultEmail);
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim()) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.forgotPassword(email.trim().toLowerCase());
      if (res.success) {
        if (res.otp) {
          setDemoCode(res.otp);
        }
        setStep("otp");
      } else {
        setErrorMsg(res.message || "Failed to generate reset code. Please check your email.");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!otp.trim()) {
      setErrorMsg("Please enter the 6-digit reset code.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });

      if (res.success) {
        setStep("success");
      } else {
        setErrorMsg(res.message || "Failed to reset password. Please check the code.");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onClose();
    if (onPasswordResetSuccess) {
      onPasswordResetSuccess(email);
    }
    // Reset internal state
    setStep("email");
    setOtp("");
    setDemoCode(null);
    setNewPassword("");
    setConfirmPassword("");
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header decoration */}
        <div className="h-2 w-full bg-gradient-to-r from-[#0d5c4d] via-[#10705e] to-[#f3b738]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close forgot password dialog"
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-7">
          {/* STEP 1: Enter Email */}
          {step === "email" && (
            <div>
              <div className="h-12 w-12 rounded-2xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center mb-4">
                <KeyRound className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-extrabold text-[#0d2b26]">Forgot Password?</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your registered LMS email address. We will send you a 6-digit verification code to reset your password.
              </p>

              {errorMsg && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSendCode} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full h-11 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white focus:ring-2 focus:ring-[#0d5c4d]/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs shadow-md shadow-[#0d5c4d]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Code</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === "otp" && (
            <div>
              <div className="h-12 w-12 rounded-2xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-extrabold text-[#0d2b26]">Reset Your Password</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter the 6-digit code sent to <span className="font-bold text-slate-800">{email}</span> and your new password.
              </p>

              {/* Demo 1-Click Code Autofill */}
              {demoCode && (
                <div
                  onClick={() => setOtp(demoCode)}
                  className="mt-3 p-2.5 rounded-xl bg-[#fef7e6] border border-[#fbd38d] text-[#b47a16] text-xs font-semibold flex items-center justify-between cursor-pointer hover:bg-[#fef2d0] transition-colors"
                  title="Click to auto-fill verification code"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#b47a16]" />
                    <span>Verification Code: <strong className="font-mono text-sm tracking-widest">{demoCode}</strong></span>
                  </span>
                  <span className="text-[10px] underline font-bold">Auto-fill</span>
                </div>
              )}

              {errorMsg && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="mt-4 space-y-3.5">
                {/* 6-Digit Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full h-11 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white focus:ring-2 focus:ring-[#0d5c4d]/10 transition-all"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full h-11 pl-9 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white focus:ring-2 focus:ring-[#0d5c4d]/10 transition-all font-medium"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full h-11 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white focus:ring-2 focus:ring-[#0d5c4d]/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 mt-1 rounded-xl bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs shadow-md shadow-[#0d5c4d]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Confirm & Reset Password</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setErrorMsg(null);
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-[#0d5c4d] hover:underline cursor-pointer"
                  >
                    Change Email or Resend Code
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Success Screen */}
          {step === "success" && (
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-full bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center mx-auto mb-4 border border-[#c4e9e0]">
                <CheckCircle2 className="h-8 w-8 text-[#0d5c4d]" />
              </div>
              <h2 className="text-xl font-extrabold text-[#0d2b26]">Password Updated!</h2>
              <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                Your account password has been successfully reset. You can now sign in using your new credentials.
              </p>

              <button
                type="button"
                onClick={handleComplete}
                className="w-full h-11 mt-6 rounded-xl bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs shadow-md shadow-[#0d5c4d]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

