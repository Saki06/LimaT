"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { validatePasswordStrength } from "@/lib/passwordPolicy";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export function ForgotPasswordModal({ isOpen, onClose, defaultEmail = "" }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail);
      setStep("email");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("");
    }
  }, [defaultEmail, isOpen]);

  if (!isOpen) return null;

  const sendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const result = await api.auth.forgotPassword(email.trim().toLowerCase());
      if (!result.success) {
        setMessage(result.message || "Unable to send a reset code.");
        return;
      }
      setStep("reset");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send a reset code.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const policyError = validatePasswordStrength(newPassword);
    if (policyError) {
      setMessage(policyError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const result = await api.auth.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });
      if (!result.success) {
        setMessage(result.message || "Unable to reset the password.");
        return;
      }
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reset the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Reset password</h2>
          <button type="button" onClick={onClose} className="text-sm text-slate-500">Close</button>
        </div>
        {message && <p className="mb-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{message}</p>}
        {step === "email" ? (
          <form onSubmit={sendCode} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Registered email"
              className="w-full rounded-lg border p-3"
            />
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#0d5c4d] p-3 font-bold text-white disabled:opacity-60">
              {loading ? "Sending..." : "Send reset code"}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
              placeholder="6-digit code"
              className="w-full rounded-lg border p-3"
            />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
              className="w-full rounded-lg border p-3"
            />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-lg border p-3"
            />
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#0d5c4d] p-3 font-bold text-white disabled:opacity-60">
              {loading ? "Updating..." : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
