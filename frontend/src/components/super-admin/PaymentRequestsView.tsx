"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, RefreshCw, CreditCard, Landmark, Save, Edit3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

interface PaymentRequest {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  currentPlan: string;
  adminEmail: string;
  plan: string;
  planName: string;
  amount: number;
  reference: string;
  transferDate: string;
  note?: string;
  slipImage?: string | null;
  requestedAt: string;
}

interface CompletedPayment {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  adminEmail: string;
  plan: string;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  reference: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

interface PlatformBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  branchCode?: string;
}

interface PaymentRequestsViewProps {
  onPaymentProcessed?: () => void;
}

export function PaymentRequestsView({ onPaymentProcessed }: PaymentRequestsViewProps = {}) {
  const { addToast } = useApp();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [completedPayments, setCompletedPayments] = useState<CompletedPayment[]>([]);
  const [bankDetails, setBankDetails] = useState<PlatformBankDetails>({
    bankName: "Commercial Bank of Ceylon",
    accountName: "Newtoz (Pvt) Ltd",
    accountNumber: "",
    branch: "Colombo",
    branchCode: "",
  });
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.subscription.listRequests();
      setRequests(result.data ?? []);
      setCompletedPayments(result.completedPayments ?? []);
      if (result.bankDetails) {
        setBankDetails({
          bankName: result.bankDetails.bankName || "",
          accountName: result.bankDetails.accountName || "",
          accountNumber: result.bankDetails.accountNumber || "",
          branch: result.bankDetails.branch || "",
          branchCode: result.bankDetails.branchCode || "",
        });
      }
    } catch (e) {
      addToast({
        type: "error",
        title: "Load Failed",
        message: e instanceof Error ? e.message : "Could not load payment requests",
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingBank) return;
    setSavingBank(true);
    try {
      const result = await api.subscription.updateBankDetails(bankDetails);
      if (result.data) {
        setBankDetails(result.data);
      }
      setIsEditingBank(false);
      addToast({
        type: "success",
        title: "Bank Details Saved",
        message: "Tutors will now see these bank account details when paying by Bank Slip.",
      });
    } catch (err) {
      addToast({
        type: "error",
        title: "Save Failed",
        message: err instanceof Error ? err.message : "Could not save bank details",
      });
    } finally {
      setSavingBank(false);
    }
  };

  const decide = async (tenantId: string, decision: "APPROVE" | "REJECT") => {
    setBusyId(tenantId);
    try {
      const result = await api.subscription.decideRequest(
        tenantId,
        decision,
        decision === "REJECT" ? reason : undefined
      );
      addToast({ type: "success", title: "Done", message: result.message });
      setRejectingId(null);
      setReason("");
      await load();
      onPaymentProcessed?.();
    } catch (e) {
      addToast({
        type: "error",
        title: "Action Failed",
        message: e instanceof Error ? e.message : "Request failed",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-[#c4e9e0] bg-white p-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#0d2b26]">Tutor SaaS Payments &amp; Bank Slips</h2>
          <p className="text-xs text-slate-500">
            Configure your platform bank account, verify pending bank slips, and view all completed payments.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={load} disabled={loading} className="text-xs font-bold">
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </Card>

      {/* Section 0: Super Admin Platform Bank Account Details */}
      <Card className="border-[#c4e9e0] bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
              <Landmark className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0d2b26]">
                Platform Receiving Bank Account (For Tutor Transfers)
              </h3>
              <p className="text-[11px] text-slate-500">
                These bank details are displayed to Tutors when they choose Bank Slip Transfer in My Subscription.
              </p>
            </div>
          </div>

          {!isEditingBank && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditingBank(true)}
              className="text-xs font-bold cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Bank Details
            </Button>
          )}
        </div>

        {isEditingBank ? (
          <form onSubmit={handleSaveBankDetails} className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bank Name <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-[#0d5c4d]"
                >
                  <option value="Commercial Bank of Ceylon">Commercial Bank of Ceylon</option>
                  <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
                  <option value="People's Bank">People&apos;s Bank</option>
                  <option value="Hatton National Bank (HNB)">Hatton National Bank (HNB)</option>
                  <option value="Sampath Bank">Sampath Bank</option>
                  <option value="Seylan Bank">Seylan Bank</option>
                  <option value="Nations Trust Bank (NTB)">Nations Trust Bank (NTB)</option>
                  <option value="DFCC Bank">DFCC Bank</option>
                  <option value="National Development Bank (NDB)">National Development Bank (NDB)</option>
                  <option value="National Savings Bank (NSB)">National Savings Bank (NSB)</option>
                  <option value="Pan Asia Bank">Pan Asia Bank</option>
                  <option value="Cargills Bank">Cargills Bank</option>
                  <option value="Amana Bank">Amana Bank</option>
                  <option value="Union Bank of Colombo">Union Bank of Colombo</option>
                  <option value="Standard Chartered Sri Lanka">Standard Chartered Sri Lanka</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Holder Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  placeholder="e.g. Newtoz (Pvt) Ltd"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Number <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  placeholder="e.g. 8001234567"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Branch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={bankDetails.branch}
                  onChange={(e) => setBankDetails({ ...bankDetails, branch: e.target.value })}
                  placeholder="e.g. Colombo / Jaffna"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Branch Code (Optional)</label>
                <input
                  value={bankDetails.branchCode || ""}
                  onChange={(e) => setBankDetails({ ...bankDetails, branchCode: e.target.value })}
                  placeholder="e.g. 001"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={savingBank}
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold cursor-pointer"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                {savingBank ? "Saving..." : "Save Bank Details"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={savingBank}
                onClick={() => setIsEditingBank(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs">
            <div>
              <p className="text-[11px] text-slate-500 font-semibold">Bank Name</p>
              <p className="font-bold text-slate-900 mt-0.5">{bankDetails.bankName || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold">Account Holder Name</p>
              <p className="font-bold text-slate-900 mt-0.5">{bankDetails.accountName || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold">Account Number</p>
              <p className="font-mono font-black text-[#0d5c4d] mt-0.5">{bankDetails.accountNumber || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold">Branch</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {bankDetails.branch || "-"}
                {bankDetails.branchCode ? ` (${bankDetails.branchCode})` : ""}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Section 1: Pending Bank Slip Approvals */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-[#0d2b26]">
          Pending Bank Slip Verifications ({requests.length})
        </h3>
        {loading && requests.length === 0 ? (
          <div className="flex items-center gap-2 p-6 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : requests.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-500">
            No bank slip payments awaiting verification.
          </Card>
        ) : (
          requests.map((r) => (
            <Card key={r.tenantId} className="border-[#e6ece8] bg-white p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-[#0d2b26]">
                    {r.tenantName} <span className="text-xs font-mono text-slate-500">[{r.tenantCode}]</span>
                  </p>
                  <p className="text-xs text-slate-500">{r.adminEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#0d5c4d]">
                    {r.currentPlan} → {r.planName}
                  </p>
                  <p className="text-lg font-black">LKR {r.amount.toLocaleString("en-US")}</p>
                </div>
              </div>

              <div className="text-xs text-slate-700 space-y-0.5">
                <p>
                  Reference: <b>{r.reference}</b>
                </p>
                <p>Transfer date: {r.transferDate}</p>
                <p>Submitted: {new Date(r.requestedAt).toLocaleString()}</p>
                {r.note && <p>Note: {r.note}</p>}
              </div>

              {r.slipImage && (
                <a href={r.slipImage} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.slipImage} alt="Bank slip" className="max-h-56 rounded-lg border border-slate-200" />
                </a>
              )}

              {rejectingId === r.tenantId ? (
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason (optional)"
                    maxLength={300}
                    className="flex-1 min-w-[200px] p-2 rounded-xl border border-slate-300 text-xs"
                  />
                  <Button
                    size="sm"
                    disabled={busyId === r.tenantId}
                    onClick={() => decide(r.tenantId, "REJECT")}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                  >
                    Confirm Reject
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setRejectingId(null)} className="text-xs">
                    Back
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={busyId === r.tenantId}
                    onClick={() => decide(r.tenantId, "APPROVE")}
                    className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve &amp; Activate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === r.tenantId}
                    onClick={() => setRejectingId(r.tenantId)}
                    className="text-xs font-bold text-rose-600"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Section 2: Completed Tutor Payments & Active Subscriptions History */}
      <Card className="border-[#e6ece8] bg-white p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-[#0d2b26]">
            Completed Tutor Payments &amp; Subscription History ({completedPayments.length})
          </h3>
        </div>

        {completedPayments.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No completed tutor subscription payments recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-2 pr-4">Tutor / Studio</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 pr-4">Method</th>
                  <th className="py-2 pr-4">Receipt / Ref</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Period</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {completedPayments.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="py-2.5 pr-4">
                      <p className="font-bold text-slate-900">{p.tenantName}</p>
                      <p className="text-[11px] text-slate-500">{p.adminEmail}</p>
                    </td>
                    <td className="py-2.5 pr-4 font-bold text-[#0d2b26]">{p.planName}</td>
                    <td className="py-2.5 pr-4">
                      {p.paymentMethod === "CARD" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          <CreditCard className="h-3 w-3" /> Card (Instant)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                          <Landmark className="h-3 w-3" /> Bank Slip
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-[11px] text-slate-700">{p.reference}</td>
                    <td className="py-2.5 pr-4 font-black text-slate-900">
                      LKR {p.amount.toLocaleString("en-US")}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">
                      {String(p.startDate).slice(0, 10)} →{" "}
                      {p.endDate ? String(p.endDate).slice(0, 10) : "-"}
                    </td>
                    <td className="py-2.5">
                      <Badge
                        className={`text-[10px] font-extrabold ${
                          p.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
