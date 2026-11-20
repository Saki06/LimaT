"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Check, X, Loader2, Crown, Clock, Landmark, CreditCard, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

type PlanKey = "starter" | "pro" | "enterprise";
type PaymentMethodType = "CARD" | "BANK_SLIP";

interface PlanCard {
  key: PlanKey;
  name: string;
  price: number;
  tone: "slate" | "emerald" | "purple";
  popular?: boolean;
  features: { label: string; included: boolean }[];
}

const PLAN_CARDS: PlanCard[] = [
  {
    key: "starter",
    name: "Solo Creator Starter",
    price: 5000,
    tone: "slate",
    features: [
      { label: "Pre-recorded Video Courses", included: true },
      { label: "Past Paper Library", included: true },
      { label: "Homework & Quiz Submissions", included: true },
      { label: "Up to 100 Enrolled Students", included: true },
      { label: "Live Meet / Zoom Studio", included: false },
      { label: "Custom Domain & Tutor Brand", included: false },
    ],
  },
  {
    key: "pro",
    name: "Solo Educator Pro",
    price: 10000,
    tone: "emerald",
    popular: true,
    features: [
      { label: "Unlimited Enrolled Students", included: true },
      { label: "Direct Tuition Subscriptions", included: true },
      { label: "Bank Slip Approvals", included: true },
      { label: "Live Meet / Zoom Studio", included: true },
      { label: "Study Packages & Syllabus", included: true },
      { label: "Custom Domain & Tutor Brand", included: false },
    ],
  },
  {
    key: "enterprise",
    name: "Solo Masterclass Elite",
    price: 15000,
    tone: "purple",
    features: [
      { label: "Everything in Pro", included: true },
      { label: "1-on-1 Paper Evaluation", included: true },
      { label: "Model Paper Marketplace", included: true },
      { label: "Priority Video CDN", included: true },
      { label: "WhatsApp SMS Alerts", included: true },
      { label: "Custom Domain & Tutor Brand", included: true },
    ],
  },
];

const RANK: Record<PlanKey, number> = { starter: 1, pro: 2, enterprise: 3 };

const TONE_BORDER: Record<PlanCard["tone"], string> = {
  slate: "border-slate-300 bg-slate-50/60",
  emerald: "border-emerald-400 bg-emerald-50/50",
  purple: "border-purple-400 bg-purple-50/40",
};

interface TenantSubscriptionSettings extends Record<string, unknown> {
  renewalDate?: string;
  monthlyFeeLkr?: number | string;
}

interface SubscriptionData {
  tenant: { plan: string; settings?: TenantSubscriptionSettings | null };
  enrolledStudents: number;
  bankDetails: { bankName: string; accountName: string; accountNumber: string; branch: string };
  pendingRequest: {
    plan: string;
    planName: string;
    amount: number;
    reference: string;
    transferDate: string;
    requestedAt: string;
    hasSlip: boolean;
  } | null;
  lastDecision: {
    status: "APPROVED" | "REJECTED";
    planName: string;
    reason?: string;
    decidedAt: string;
  } | null;
  history: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    startDate: string;
    endDate: string | null;
  }[];
}

const formatLkr = (n: number) => `LKR ${n.toLocaleString("en-US")}`;
const todayIso = () => new Date().toISOString().slice(0, 10);

const compressSlip = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image file"));
      img.onload = () => {
        const maxSide = 1100;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Could not process the image"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

export function MySubscriptionView() {
  const { addToast, refreshMyTenant, isFeatureEnabled } = useApp();
  const isCardMethodAllowed = isFeatureEnabled("sub_tutor_card_payment");
  const isBankMethodAllowed = isFeatureEnabled("sub_tutor_bank_slip_payment");
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    isCardMethodAllowed ? "CARD" : "BANK_SLIP"
  );

  // Online Card fields
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Bank Slip fields
  const [reference, setReference] = useState("");
  const [transferDate, setTransferDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [slipName, setSlipName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.subscription.getMine();
      setData(result.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) {
        void load();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const resetForm = () => {
    setSelectedPlan(null);
    setCardHolderName("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setReference("");
    setTransferDate(todayIso());
    setNote("");
    setSlipImage(null);
    setSlipName("");
  };

  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setCardExpiry(digits);
    }
  };

  const currentPlan = (data?.tenant.plan || "pro").toLowerCase() as PlanKey;
  const renewalDate = data?.tenant.settings?.renewalDate as string | undefined;
  const pending = data?.pendingRequest ?? null;

  const isCardFormValid =
    cardNumber.replace(/\s+/g, "").length >= 15 &&
    /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry.trim()) &&
    cardCvc.trim().length >= 3;

  const isBankFormValid = reference.trim().length >= 3 && Boolean(transferDate);

  const handleSlip = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      addToast({ type: "error", title: "Invalid Image", message: "Use a JPG, PNG or WebP image." });
      return;
    }
    try {
      setSlipImage(await compressSlip(file));
      setSlipName(file.name);
    } catch (e) {
      addToast({
        type: "error",
        title: "Slip Upload Failed",
        message: e instanceof Error ? e.message : "Could not process the image",
      });
    }
  };

  const submitPayment = async () => {
    if (!selectedPlan || submitting) return;
    setSubmitting(true);
    try {
      const result = await api.subscription.submitPayment(
        paymentMethod === "CARD"
          ? {
              plan: selectedPlan,
              paymentMethod: "CARD",
              cardHolderName: cardHolderName.trim(),
              cardNumber: cardNumber.replace(/\s+/g, ""),
              cardExpiry: cardExpiry.trim(),
              cardCvc: cardCvc.trim(),
            }
          : {
              plan: selectedPlan,
              paymentMethod: "BANK_SLIP",
              reference: reference.trim(),
              transferDate,
              note: note.trim(),
              slipImage,
            }
      );
      setData(result.data);
      resetForm();
      if (result.activatedImmediately) {
        refreshMyTenant();
      }
      addToast({
        type: "success",
        title: result.activatedImmediately ? "Plan Activated!" : "Payment Submitted",
        message: result.message,
      });
    } catch (e) {
      addToast({
        type: "error",
        title: "Payment Failed",
        message: e instanceof Error ? e.message : "Could not process payment",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cancelPending = async () => {
    try {
      const result = await api.subscription.cancelPayment();
      setData(result.data);
      refreshMyTenant();
    } catch (e) {
      addToast({
        type: "error",
        title: "Could Not Cancel",
        message: e instanceof Error ? e.message : "Request failed",
      });
    }
  };

  useEffect(() => {
    if (data?.lastDecision?.status === "APPROVED") refreshMyTenant();
  }, [data?.lastDecision?.status, data?.lastDecision?.decidedAt, refreshMyTenant]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading subscription...
      </div>
    );
  }

  if (error || !data) {
    return <Card className="p-6 text-sm text-rose-600">{error || "Subscription not available"}</Card>;
  }

  const selectedCard = PLAN_CARDS.find((p) => p.key === selectedPlan);

  return (
    <div className="space-y-6">
      <Card className="border-[#c4e9e0] bg-white p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-black text-[#0d2b26]">My Subscription</h2>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
          <span>
            Current plan: <b>{PLAN_CARDS.find((p) => p.key === currentPlan)?.name ?? currentPlan}</b>
          </span>
          <span>
            Monthly fee: <b>{formatLkr(Number(data.tenant.settings?.monthlyFeeLkr ?? 0))}</b>
          </span>
          {renewalDate && (
            <span>
              Renews on: <b>{renewalDate}</b>
            </span>
          )}
          <span>
            Enrolled students: <b>{data.enrolledStudents}</b>
          </span>
        </div>
      </Card>

      {pending && (
        <Card className="border-amber-300 bg-amber-50 p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Clock className="h-4 w-4" /> Bank transfer awaiting verification
          </div>
          <p className="text-sm text-amber-900">
            {pending.planName} &bull; {formatLkr(pending.amount)} &bull; Ref <b>{pending.reference}</b> &bull;
            Transfer date {pending.transferDate}
            {pending.hasSlip ? " • Slip attached" : ""}
          </p>
          <p className="text-xs text-amber-800">
            Your plan will switch automatically once the bank slip is confirmed by Super Admin.
          </p>
          <Button size="sm" variant="outline" onClick={cancelPending} className="text-xs font-bold">
            Cancel request
          </Button>
        </Card>
      )}

      {!pending && data.lastDecision?.status === "REJECTED" && (
        <Card className="border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">
          Your last payment for <b>{data.lastDecision.planName}</b> was rejected
          {data.lastDecision.reason ? `: ${data.lastDecision.reason}` : "."} Please submit it again with the
          correct details.
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAN_CARDS.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          const isUpgrade = RANK[plan.key] > RANK[currentPlan];
          return (
            <div
              key={plan.key}
              className={`p-5 rounded-2xl border-2 space-y-4 flex flex-col justify-between ${TONE_BORDER[plan.tone]} ${
                isCurrent ? "ring-2 ring-[#0d5c4d]" : ""
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="font-extrabold text-[10px]">{plan.name}</Badge>
                  {plan.popular && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-2xl font-black text-[#0d2b26]">{formatLkr(plan.price)}</p>
                  <p className="text-[11px] text-slate-500 font-semibold">/ month</p>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {plan.features.map((f) => (
                    <li
                      key={f.label}
                      className={`flex items-center gap-1.5 ${f.included ? "" : "text-slate-400 line-through"}`}
                    >
                      {f.included ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}{" "}
                      {f.label}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                size="sm"
                disabled={isCurrent}
                onClick={() => setSelectedPlan(plan.key)}
                className="w-full bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                {isCurrent ? "Current Plan" : isUpgrade ? "Upgrade - Pay Now" : "Switch - Pay Now"}
              </Button>
            </div>
          );
        })}
      </div>

      {selectedCard && (
        <Card className="border-[#c4e9e0] bg-white p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-[#0d2b26]">
                Checkout: {selectedCard.name} ({formatLkr(selectedCard.price)} / month)
              </h3>
              <p className="text-xs text-slate-500">
                Choose Card Payment for instant activation or upload a Bank Deposit Slip.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
              {isCardMethodAllowed && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === "CARD"
                      ? "bg-[#0d5c4d] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" /> Card Payment (Instant)
                </button>
              )}
              {isBankMethodAllowed && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("BANK_SLIP")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === "BANK_SLIP"
                      ? "bg-[#0d5c4d] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Landmark className="h-3.5 w-3.5" /> Bank Slip Transfer
                </button>
              )}
            </div>
          </div>

          {paymentMethod === "CARD" ? (
            <div className="space-y-4 pt-1">
              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>
                  <b>Instant Plan Activation:</b> Paying by Visa / Mastercard immediately unlocks all{" "}
                  <b>{selectedCard.name}</b> features in your workspace.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cardholder Name</label>
                  <input
                    value={cardHolderName}
                    onChange={(e) => setCardHolderName(e.target.value)}
                    placeholder="Name on Card"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Card Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expiry Date (MM/YY) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={cardExpiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CVC / CVV <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  disabled={submitting || !isCardFormValid}
                  onClick={submitPayment}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold cursor-pointer"
                >
                  {submitting
                    ? "Processing Card..."
                    : `Pay ${formatLkr(selectedCard.price)} & Activate Now`}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={submitting}
                  onClick={resetForm}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 space-y-0.5">
                <p className="font-bold">Bank transfer details</p>
                <p>Bank: {data.bankDetails.bankName}</p>
                <p>Account name: {data.bankDetails.accountName}</p>
                <p>
                  Account number: <b>{data.bankDetails.accountNumber}</b>
                </p>
                <p>Branch: {data.bankDetails.branch}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transfer reference no. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    maxLength={60}
                    placeholder="e.g. FT26319XXXXX"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transfer date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={transferDate}
                    max={todayIso()}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bank slip (optional, JPG/PNG)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleSlip}
                  className="text-xs"
                />
                {slipImage && (
                  <div className="mt-2 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slipImage}
                      alt="Slip preview"
                      className="h-20 rounded-lg border border-slate-200"
                    />
                    <span className="text-[11px] text-slate-500">{slipName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Note (optional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={300}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={submitting || !isBankFormValid || Boolean(pending)}
                  onClick={submitPayment}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Submit Bank Slip"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={submitting}
                  onClick={resetForm}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {data.history.length > 0 && (
        <Card className="border-[#e6ece8] bg-white p-5 space-y-3">
          <h3 className="text-sm font-black text-[#0d2b26]">Subscription History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-1.5 pr-4">Started</th>
                  <th className="py-1.5 pr-4">Ends</th>
                  <th className="py-1.5 pr-4">Amount</th>
                  <th className="py-1.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((h) => (
                  <tr key={h.id} className="border-t border-slate-100">
                    <td className="py-1.5 pr-4">{h.startDate.slice(0, 10)}</td>
                    <td className="py-1.5 pr-4">{h.endDate ? h.endDate.slice(0, 10) : "-"}</td>
                    <td className="py-1.5 pr-4">{formatLkr(h.amount)}</td>
                    <td className="py-1.5">{h.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
