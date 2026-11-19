
"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { validatePasswordStrength } from "@/lib/passwordPolicy";

export function ForcedPasswordChangeScreen() {
  const { changePassword, logoutUser } = useApp();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!result.success) {
        setError(result.message || "Password change failed.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Unable to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-[#0d5c4d]/10 p-4">
            <ShieldCheck className="h-8 w-8 text-[#0d5c4d]" />
          </div>
        </div>

        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Change Your Password
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            For your account security, you must create a new password
            before accessing Newtoz.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                required
                type={showPasswords ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`${inputClass} pl-10 pr-11`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-3 text-slate-400"
                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
              >
                {showPasswords ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              New Password
            </label>
            <input
              required
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              placeholder="Create a new password"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Confirm New Password
            </label>
            <input
              required
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="Confirm your new password"
            />
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">
            <p className="mb-1 font-bold text-slate-800">
              Password requirements
            </p>
            <p>• At least 12 characters</p>
            <p>• One uppercase and one lowercase letter</p>
            <p>• One number and one special character</p>
            <p>• Must be different from your current password</p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d5c4d] py-3.5 text-sm font-bold text-white transition hover:bg-[#083e34] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Changing Password...
              </>
            ) : (
              "Change Password"
            )}
          </button>

          <button
            type="button"
            onClick={logoutUser}
            disabled={isLoading}
            className="w-full py-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            Sign Out
          </button>
        </form>
      </div>
    </main>
  );
}
