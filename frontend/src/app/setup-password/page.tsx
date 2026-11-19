"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { validatePasswordStrength } from "@/lib/passwordPolicy";

function SetupPasswordForm() {
  const router = useRouter();
  const [setupToken, setSetupToken] = useState("");
  const [tenantId, setTenantId] = useState<string | undefined>();
  const [userLabel, setUserLabel] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const tokenFromUrl = fragment.get("token") || "";
    const tenantFromUrl = fragment.get("tenantId") || undefined;
    setSetupToken(tokenFromUrl);
    setTenantId(tenantFromUrl);

    if (fragment.has("token")) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    if (!tokenFromUrl) {
      setError("This setup link is invalid.");
      setLoading(false);
      return;
    }

    api.auth.validateSetupToken({ setupToken: tokenFromUrl, tenantId: tenantFromUrl }).then((result) => {
      if (!result.success || !result.data) {
        setError(result.message || "This setup link is invalid or expired.");
      } else {
        setUserLabel(`${result.data.user.firstName} ${result.data.user.lastName}`.trim());
      }
      setLoading(false);
    }).catch(() => {
      setError("Unable to validate this setup link.");
      setLoading(false);
    });
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const result = await api.auth.setupPassword({
        setupToken,
        tenantId,
        newPassword,
        confirmPassword,
      });
      if (!result.success || !result.token) {
        setError(result.message || "Unable to set up your password.");
        return;
      }
      api.token.set(result.token);
      if (result.user) api.user.set(result.user);
      router.push("/");
    } catch {
      setError("Unable to set up your password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <meta name="referrer" content="no-referrer" />
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Set up your password</h1>
        {loading ? <p className="text-sm text-slate-500">Validating setup link...</p> : (
          <>
            {userLabel && <p className="text-sm text-slate-600">Account: {userLabel}</p>}
            <input required type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full rounded-xl border p-3" />
            <input required type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full rounded-xl border p-3" />
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={saving || Boolean(error && !userLabel)} className="w-full rounded-xl bg-[#0d5c4d] p-3 font-semibold text-white disabled:opacity-50">
              {saving ? "Saving..." : "Set password"}
            </button>
          </>
        )}
        {!loading && error && !userLabel && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}

export default function SetupPasswordPage() {
  return <Suspense fallback={<main className="p-8">Loading...</main>}><SetupPasswordForm /></Suspense>;
}
