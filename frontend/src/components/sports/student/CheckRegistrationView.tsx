"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  Trophy,
  Building2,
  Phone,
  User,
  ArrowRight,
  Users
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SportsRegistration } from "@/lib/api";
import { StoredAthleteRegistration } from "@/components/sports/sportsRegistrationData";

interface CheckRegistrationViewProps {
  registrations: SportsRegistration[];
  onOpenRegister: () => void;
}

export function CheckRegistrationView({
  registrations,
  onOpenRegister
}: CheckRegistrationViewProps) {
  const { verifySportsRegistration } = useApp();
  const [searchRegId, setSearchRegId] = useState("");
  const [searchMobile, setSearchMobile] = useState("");
  const [searchedRecord, setSearchedRecord] = useState<StoredAthleteRegistration | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearchingBackend, setIsSearchingBackend] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleanId = searchRegId.trim().toUpperCase();
    const cleanPhone = searchMobile.trim().replace(/\s+/g, "");
    setSearchedRecord(null);
    setLookupError("");
    if (!cleanId || !cleanPhone) {
      setLookupError("Enter your registration number and registered mobile number.");
      return;
    }

    setIsSearchingBackend(true);
    try {
      const records = await verifySportsRegistration(cleanId, cleanPhone);
      if (records.length === 0) return;

      const rec = records[0];
      const details = (rec.athleteDetails || {}) as Record<string, unknown>;
      const selectedEvents = Array.isArray(details.selectedEvents)
        ? (details.selectedEvents as StoredAthleteRegistration["selectedEvents"])
        : records.map((registration) => ({
            id: registration.eventId,
            sportName: registration.event?.sportType || "Sports",
            eventName: registration.event?.title || "Event",
            ageCategory: "Open",
            gender: "All",
            fee: registration.event?.fee ?? 0,
          }));
      const status = records.some((registration) => registration.status === "REJECTED")
        ? "Rejected"
        : records.some((registration) => registration.status === "CONFIRMED")
          ? "Approved"
          : "Pending";
      setSearchedRecord({
        id: rec.registrationNumber || rec.id,
        registrationNumber: rec.registrationNumber || cleanId,
        athleteName: String(details.athleteName || `${details.firstName || ""} ${details.lastName || ""}`).trim() || "Athlete Participant",
        firstName: String(details.firstName || ""),
        lastName: String(details.lastName || ""),
        dob: String(details.dob || ""),
        age: typeof details.age === "number" ? details.age : 0,
        gender: details.gender === "Girls" || details.gender === "Mixed" ? details.gender : "Boys",
        nicOrStudentId: String(details.nicOrStudentId || ""),
        mobile: String(details.mobile || cleanPhone),
        email: String(details.email || ""),
        province: String(details.province || ""),
        district: String(details.district || ""),
        schoolName: String(details.schoolName || "Academy"),
        grade: String(details.grade || ""),
        sports: Array.isArray(details.sports) ? details.sports.map(String) : [rec.event?.sportType || "Sports"],
        selectedEvents,
        isTeamInterest: Boolean(details.isTeamInterest),
        ...(details.teamSquad && typeof details.teamSquad === "object"
          ? { teamSquad: details.teamSquad as StoredAthleteRegistration["teamSquad"] }
          : {}),
        ...(typeof details.guardianName === "string" ? { guardianName: details.guardianName } : {}),
        ...(typeof details.guardianRelationship === "string"
          ? { guardianRelationship: details.guardianRelationship }
          : {}),
        ...(typeof details.guardianMobile === "string" ? { guardianMobile: details.guardianMobile } : {}),
        consentTimestamp: rec.createdAt,
        paymentStatus: (rec.paymentStatus as StoredAthleteRegistration["paymentStatus"]) || "PAID",
        totalAmount: rec.totalAmount,
        status,
        createdAt: rec.createdAt,
      });
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : "Unable to verify this registration.");
    } finally {
      setIsSearchingBackend(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="border-[#e6ece8] bg-white shadow-xs">
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="text-lg font-black text-[#0d2b26]">My Sports Registrations</h3>
            <p className="mt-1 text-xs text-slate-500">
              Registrations associated with your signed-in account.
            </p>
          </div>
          {registrations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
              <p className="font-bold text-slate-700">No registrations yet</p>
              <Button type="button" onClick={onOpenRegister} className="mt-3">
                Browse and register
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {registrations.map((registration) => (
                <li
                  key={registration.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-800">
                      {registration.event?.title || registration.event?.sportType || "Sports event"}
                    </p>
                    <p className="font-mono text-xs text-slate-500">
                      {registration.registrationNumber || "Reference pending"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={registration.status === "CONFIRMED" ? "success" : registration.status === "REJECTED" ? "destructive" : "secondary"}>
                      {registration.status}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-600">
                      LKR {registration.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Search Header Form */}
      <Card className="border-[#e6ece8] bg-white shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#0d2b26] flex items-center gap-2">
              <Search className="h-5 w-5 text-[#0d5c4d]" />
              <span>Check My Championship Registration Status</span>
            </h3>
            <p className="text-xs text-slate-500">
              Enter your registration ID and registered mobile number to verify your participant status.
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
                placeholder="Registration ID"
                required
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Registered Mobile Number
              </label>
              <input
                type="tel"
                value={searchMobile}
                onChange={(e) => setSearchMobile(e.target.value)}
                placeholder="Registered mobile number"
                required
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div className="sm:col-span-1 flex items-end">
              <Button
                type="submit"
                disabled={isSearchingBackend}
                className="w-full h-10 bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-black rounded-xl"
              >
                {isSearchingBackend ? "Checking..." : "Search"}
              </Button>
            </div>
          </form>
          {lookupError && <p role="alert" className="text-sm text-red-600">{lookupError}</p>}

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

                {/* Team Squad Roster Section (if registered as squad) */}
                {searchedRecord.teamSquad && (
                  <div className="p-4 rounded-xl border border-[#b2e5d9] bg-[#f8fbf9] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Team &amp; Squad Information
                        </span>
                        <h5 className="font-extrabold text-sm text-[#0d2b26]">
                          {searchedRecord.teamSquad.teamName}
                        </h5>
                      </div>
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white text-[#0d5c4d] border border-[#b2e5d9] self-start sm:self-auto">
                        Code: {searchedRecord.teamSquad.teamCode}
                      </span>
                    </div>

                    {searchedRecord.teamSquad.coachName && (
                      <p className="text-[11px] text-slate-600">
                        <strong>Coach / Master-in-Charge:</strong> {searchedRecord.teamSquad.coachName}{" "}
                        {searchedRecord.teamSquad.coachPhone ? `(${searchedRecord.teamSquad.coachPhone})` : ""}
                      </p>
                    )}

                    {searchedRecord.teamSquad.players && searchedRecord.teamSquad.players.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700">
                            Verified Squad Roster ({searchedRecord.teamSquad.players.length} Players):
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                            Squad Roster Confirmed ✓
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {searchedRecord.teamSquad.players.map((p, idx) => (
                            <div
                              key={p.id || idx}
                              className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-[11px]"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-5 h-5 rounded bg-slate-100 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                                  #{p.jerseyNumber || idx + 1}
                                </span>
                                <span className="font-bold text-slate-800 truncate">{p.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium shrink-0 ml-2">
                                {p.role || "Player"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 rounded-xl border border-[#e6ece8] bg-slate-50">
                  <div className="space-y-1">
                    <p className="font-bold text-[#0d2b26] text-xs">Registration reference</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Use registration number {searchedRecord.registrationNumber} when contacting the sports office.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : lookupError ? null : isSearchingBackend ? (
            <div role="status" className="rounded-2xl border border-[#e6ece8] bg-white p-8 text-center text-sm text-slate-500">
              Checking registration details...
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
