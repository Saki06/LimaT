"use client";

import React, { useState } from "react";
import { Phone, Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { SupportedRole } from "./types";

interface LoginFormProps {
  selectedRole: SupportedRole;
  onSuccess: () => void;
}

export function LoginForm({ selectedRole, onSuccess }: LoginFormProps) {
  const { setCurrentRole, addToast, loginUser } = useApp();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Sri Lankan Parent OTP login states
  const [parentLoginMethod, setParentLoginMethod] = useState<"password" | "otp">("password");
  const [parentOtpSent, setParentOtpSent] = useState(false);
  const [parentOtpCode, setParentOtpCode] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRole === "parent" && parentLoginMethod === "otp" && !parentOtpSent) {
      if (!loginEmail.trim()) {
        addToast({
          type: "error",
          title: "Mobile Number Required",
          message: "Please enter your registered mobile number to receive your SMS OTP."
        });
        return;
      }
      setParentOtpSent(true);
      addToast({
        type: "success",
        title: "SMS OTP Dispatched",
        message: `A 6-digit verification code has been sent via SMS to ${loginEmail}.`
      });
      return;
    }

    if (selectedRole === "parent" && parentLoginMethod === "otp" && parentOtpSent) {
      if (parentOtpCode.trim().length !== 6) {
        addToast({
          type: "error",
          title: "Invalid OTP Code",
          message: "Please enter the complete 6-digit SMS verification code."
        });
        return;
      }
      setCurrentRole("parent");
      onSuccess();
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUser(loginEmail.trim(), loginPassword);
      if (res.success) {
        onSuccess();
      } else {
        addToast({
          type: "error",
          title: "Authentication Failed",
          message: res.message || "Invalid email or password. Please verify your credentials."
        });
      }
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Connection Error",
        message: err.message || "Could not reach the authentication server."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Parent Login Method Switcher */}
      {selectedRole === "parent" && (
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setParentLoginMethod("password");
              setParentOtpSent(false);
            }}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              parentLoginMethod === "password"
                ? "bg-white text-[#1e3a5f] shadow-2xs font-black"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Password Sign In
          </button>
          <button
            type="button"
            onClick={() => setParentLoginMethod("otp")}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              parentLoginMethod === "otp"
                ? "bg-white text-[#1e3a5f] shadow-2xs font-black"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            SMS OTP Login
          </button>
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-3">
        {selectedRole === "parent" && parentLoginMethod === "otp" ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Registered Mobile Number (Sri Lanka) *
              </label>
              <div className="relative">
                <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. 077 123 4567 or 071 987 6543"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 transition-all font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Enter the mobile phone registered with your child&apos;s tuition class.
              </p>
            </div>

            {parentOtpSent && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Enter 6-Digit SMS Verification Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={parentOtpCode}
                  onChange={(e) => setParentOtpCode(e.target.value)}
                  placeholder="e.g. 849201"
                  className="w-full h-11 text-center font-mono text-base tracking-widest font-black rounded-xl bg-white border border-[#cfdeea] text-slate-900 focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/15"
                />
                <div className="flex justify-between items-center text-[11px] pt-1">
                  <span className="text-slate-500">Didn&apos;t receive code?</span>
                  <button
                    type="button"
                    onClick={() => {
                      addToast({
                        type: "info",
                        title: "SMS Re-dispatched",
                        message: `New OTP sent to ${loginEmail}.`
                      });
                    }}
                    className="font-bold text-[#1e3a5f] hover:underline cursor-pointer"
                  >
                    Resend SMS OTP
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-2"
            >
              <LogIn className="h-4 w-4" />
              <span>{parentOtpSent ? "Verify Code & Sign In" : "Send SMS Verification OTP"}</span>
            </button>
          </div>
        ) : (
          <>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {selectedRole === "student"
                  ? "Student Mobile No or Email"
                  : selectedRole === "parent"
                  ? "Parent Mobile No or Email Address"
                  : "Tutor Email or Mobile Number"}
              </label>
              <div className="relative">
                {selectedRole === "parent" ? (
                  <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                ) : (
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                )}
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder={
                    selectedRole === "student"
                      ? "e.g. 077 123 4567 or student@gmail.com"
                      : selectedRole === "parent"
                      ? "e.g. 077 123 4567 or parent@gmail.com"
                      : "e.g. tutor@soloclass.lk or 077 987 6543"
                  }
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    addToast({
                      type: "info",
                      title: "Password Reset Code",
                      message:
                        selectedRole === "parent"
                          ? "Use SMS OTP Login to sign in instantly, or enter your mobile to receive a reset code."
                          : "Enter your registered mobile number or email to receive a password reset OTP code."
                    });
                  }}
                  className="text-[11px] font-bold text-[#0d5c4d] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-10 pl-9 pr-10 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#0d5c4d] focus:ring-0"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-1 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              } ${
                selectedRole === "parent"
                  ? "bg-[#1e3a5f] hover:bg-[#152a45]"
                  : selectedRole === "teacher"
                  ? "bg-[#b47a16] hover:bg-[#96640f]"
                  : "bg-[#0d5c4d] hover:bg-[#083e34]"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>
                    Sign In to{" "}
                    {selectedRole === "student"
                      ? "Student Portal"
                      : selectedRole === "parent"
                      ? "Parent Portal"
                      : "Tutor Cockpit"}
                  </span>
                </>
              )}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
