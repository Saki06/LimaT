"use client";

import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  QrCode,
  Trophy,
  Building2,
  Phone,
  User,
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoredAthleteRegistration } from "./sportsRegistrationData";

interface CheckRegistrationViewProps {
  registrations: StoredAthleteRegistration[];
  onOpenRegister: () => void;
}

export function CheckRegistrationView({
  registrations,
  onOpenRegister
}: CheckRegistrationViewProps) {
  const [searchRegId, setSearchRegId] = useState("EZG26-ATH-000101");
  const [searchMobile, setSearchMobile] = useState("0771234567");
  const [searchedRecord, setSearchedRecord] = useState<StoredAthleteRegistration | null>(
    registrations[0] || null
  );
  const [hasSearched, setHasSearched] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleanId = searchRegId.trim().toUpperCase();
    const cleanPhone = searchMobile.trim().replace(/\s+/g, "");

    const found = registrations.find(
      (r) =>
        r.registrationNumber.toUpperCase() === cleanId ||
        r.mobile.replace(/\s+/g, "") === cleanPhone ||
        r.athleteName.toLowerCase().includes(cleanId.toLowerCase())
    );

    setSearchedRecord(found || null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Search Header Form */}
      <Card className="border-[#e6ece8] bg-white shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#0d2b26] flex items-center gap-2">
              <Search className="h-5 w-5 text-[#0d5c4d]" />
              <span>Check My Championship Registration Status</span>
            </h3>
            <p className="text-xs text-slate-500">
              Enter your Registration ID (e.g. EZG26-ATH-000101) or registered mobile number to verify your participant status.
            </p>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Registration Number
              </label>
              <input
                type="text"
                value={searchRegId}
                onChange={(e) => setSearchRegId(e.target.value)}
                placeholder="e.g. EZG26-ATH-000101"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Registered Mobile Number
              </label>
              <input
                type="text"
                value={searchMobile}
                onChange={(e) => setSearchMobile(e.target.value)}
                placeholder="e.g. 077 123 4567"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div className="sm:col-span-1 flex items-end">
              <Button
                type="submit"
                className="w-full h-10 bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-black rounded-xl"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Quick presets buttons for demo convenience */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 flex-wrap">
            <span className="font-bold">Quick Demo:</span>
            <button
              type="button"
              onClick={() => {
                setSearchRegId("EZG26-ATH-000101");
                setSearchMobile("0771234567");
                setSearchedRecord(registrations[0] || null);
              }}
              className="text-[#0d5c4d] font-bold hover:underline"
            >
              EZG26-ATH-000101 (Sathurjan)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setSearchRegId("EZG26-ATH-000103");
                setSearchMobile("0763456781");
                const r3 = registrations.find((r) => r.id === "EZG26-ATH-000103");
                setSearchedRecord(r3 || null);
              }}
              className="text-[#0d5c4d] font-bold hover:underline"
            >
              EZG26-ATH-000103 (Niroshika)
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Result Card */}
      {hasSearched && (
        <>
          {searchedRecord ? (
            <div className="bg-white rounded-2xl border border-[#e6ece8] shadow-sm overflow-hidden animate-in fade-in duration-200">
              {/* Header Status Bar */}
              <div className="p-5 bg-gradient-to-r from-[#0d5c4d] to-[#14473e] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#f3b738]">
                      {searchedRecord.registrationNumber}
                    </span>
                    <Badge
                      className={
                        searchedRecord.status === "Confirmed" || searchedRecord.status === "Approved"
                          ? "bg-emerald-400 text-slate-950 font-black"
                          : "bg-amber-400 text-slate-950 font-black"
                      }
                    >
                      {searchedRecord.status}
                    </Badge>
                  </div>
                  <h4 className="text-lg font-black">{searchedRecord.athleteName}</h4>
                  <p className="text-xs text-emerald-100">
                    {searchedRecord.schoolName} &bull; {searchedRecord.district}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge
                    variant="outline"
                    className="bg-white/20 text-white border-white/30 font-mono text-xs"
                  >
                    Fee: {searchedRecord.paymentStatus}
                  </Badge>
                  <Button
                    onClick={() => window.print()}
                    size="sm"
                    className="bg-white hover:bg-slate-100 text-[#0d5c4d] text-xs font-extrabold h-8 rounded-lg"
                  >
                    <Printer className="h-3.5 w-3.5 mr-1" /> Print Pass
                  </Button>
                </div>
              </div>

              {/* Details Body */}
              <div className="p-6 space-y-5 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8faf9] p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Age &amp; Bracket
                    </span>
                    <span className="font-bold text-slate-800">
                      {searchedRecord.age} Yrs ({searchedRecord.gender})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Current Grade
                    </span>
                    <span className="font-bold text-slate-800">{searchedRecord.grade}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Contact Phone
                    </span>
                    <span className="font-bold text-slate-800">{searchedRecord.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Registration Date
                    </span>
                    <span className="font-bold text-slate-800">{searchedRecord.createdAt}</span>
                  </div>
                </div>

                {/* Confirmed Events List */}
                <div className="space-y-2">
                  <h5 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-[#0d5c4d]" />
                    <span>Confirmed Event Entries</span>
                  </h5>

                  <div className="space-y-1.5">
                    {searchedRecord.selectedEvents.map((ev, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-xs">
                            {ev.sportName}: {ev.eventName}
                          </p>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Category: {ev.ageCategory} &bull; Gender: {ev.gender}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-mono font-bold text-emerald-800">
                            LKR {ev.fee}
                          </span>
                          <span className="block text-[9px] font-bold text-emerald-600">
                            ✓ Eligibility Verified
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gate Entry Pass Verification Mockup */}
                <div className="p-4 rounded-xl border border-dashed border-[#0d5c4d]/40 bg-[#ecf8f5]/40 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-[#0d2b26] text-xs">Digital Verification at Arena</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Present this screen or printed entry receipt at the stadium gate marshals for biometric/ID tag issuance.
                    </p>
                  </div>
                  <QrCode className="h-14 w-14 text-[#0d5c4d] shrink-0" />
                </div>
              </div>
            </div>
          ) : (
            <Card className="border-[#e6ece8] bg-white p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-[#0d2b26]">No Registration Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active participant matches ID <strong>{searchRegId}</strong> or mobile number{" "}
                <strong>{searchMobile}</strong>.
              </p>
              <Button
                onClick={onOpenRegister}
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold"
              >
                Start New Athlete Registration <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
