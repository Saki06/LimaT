"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Trophy,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Search,
  Eye,
  Check,
  X,
  AlertCircle,
  Plus,
  Printer,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  Edit3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  StoredAthleteRegistration,
  ChampionshipSportItem,
  INITIAL_CHAMPIONSHIP_SPORTS
} from "./sportsRegistrationData";

interface AdminSportsRegistrationsDeskProps {
  registrations: StoredAthleteRegistration[];
  onUpdateRegistrationStatus: (
    id: string,
    newStatus: "Confirmed" | "Pending" | "Approved" | "Rejected"
  ) => void;
  sportsList: ChampionshipSportItem[];
  onAddSport: (sport: ChampionshipSportItem) => void;
  onAddEvent: (
    sportId: string,
    event: {
      id: string;
      name: string;
      ageCategory: "U12" | "U14" | "U16" | "U18" | "Open";
      gender: "Boys" | "Girls" | "Mixed" | "All";
      fee: number;
      maxParticipants: number;
    }
  ) => void;
}

export function AdminSportsRegistrationsDesk({
  registrations,
  onUpdateRegistrationStatus,
  sportsList,
  onAddSport,
  onAddEvent
}: AdminSportsRegistrationsDeskProps) {
  // Search & Multi-Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSportFilter, setSelectedSportFilter] = useState("All");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState("All");
  const [selectedAgeFilter, setSelectedAgeFilter] = useState("All");
  const [selectedGenderFilter, setSelectedGenderFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState("All");

  // Selected registration for modal detail view
  const [selectedRegistration, setSelectedRegistration] = useState<StoredAthleteRegistration | null>(
    null
  );

  // Add Sport & Add Event modal states
  const [isAddSportModalOpen, setIsAddSportModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  // New Sport Form
  const [newSportName, setNewSportName] = useState("");
  const [newSportCategory, setNewSportCategory] = useState("Field Sports");
  const [newSportDesc, setNewSportDesc] = useState("");
  const [newSportIsTeam, setNewSportIsTeam] = useState(false);

  // New Event Form
  const [targetSportId, setTargetSportId] = useState(sportsList[0]?.id || "sp_ath");
  const [newEventName, setNewEventName] = useState("");
  const [newEventAge, setNewEventAge] = useState<"U12" | "U14" | "U16" | "U18" | "Open">("U16");
  const [newEventGender, setNewEventGender] = useState<"Boys" | "Girls" | "Mixed" | "All">("Boys");
  const [newEventFee, setNewEventFee] = useState(500);
  const [newEventMax, setNewEventMax] = useState(32);

  // KPI Calculations
  const stats = useMemo(() => {
    const totalAthletes = registrations.length;
    const totalEventEntries = registrations.reduce(
      (acc, curr) => acc + curr.selectedEvents.length,
      0
    );
    const paidCount = registrations.filter((r) => r.paymentStatus === "PAID").length;
    const pendingCount = registrations.filter((r) => r.paymentStatus === "PENDING").length;

    const uniqueSchools = new Set(registrations.map((r) => r.schoolName)).size;
    const uniqueDistricts = new Set(registrations.map((r) => r.district)).size;

    return {
      totalAthletes,
      totalEventEntries,
      paidCount,
      pendingCount,
      uniqueSchools,
      uniqueDistricts
    };
  }, [registrations]);

  // Combined Multi-Filter Logic (Supports e.g. U16 + Girls + Athletics + Jaffna)
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      // Text search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        reg.athleteName.toLowerCase().includes(q) ||
        reg.registrationNumber.toLowerCase().includes(q) ||
        reg.schoolName.toLowerCase().includes(q) ||
        reg.mobile.includes(q);

      // Sport filter
      const matchSport =
        selectedSportFilter === "All" ||
        reg.sports.includes(selectedSportFilter) ||
        reg.selectedEvents.some((e) => e.sportName === selectedSportFilter);

      // District filter
      const matchDistrict =
        selectedDistrictFilter === "All" || reg.district === selectedDistrictFilter;

      // Age category filter
      const matchAge =
        selectedAgeFilter === "All" ||
        reg.selectedEvents.some((e) => e.ageCategory === selectedAgeFilter);

      // Gender filter
      const matchGender =
        selectedGenderFilter === "All" ||
        reg.gender === selectedGenderFilter ||
        reg.selectedEvents.some((e) => e.gender === selectedGenderFilter);

      // Status filter
      const matchStatus =
        selectedStatusFilter === "All" || reg.status === selectedStatusFilter;

      // Payment filter
      const matchPayment =
        selectedPaymentFilter === "All" || reg.paymentStatus === selectedPaymentFilter;

      return (
        matchSearch &&
        matchSport &&
        matchDistrict &&
        matchAge &&
        matchGender &&
        matchStatus &&
        matchPayment
      );
    });
  }, [
    registrations,
    searchQuery,
    selectedSportFilter,
    selectedDistrictFilter,
    selectedAgeFilter,
    selectedGenderFilter,
    selectedStatusFilter,
    selectedPaymentFilter
  ]);

  // CSV Export Generator (RFC 4180 compliant with UTF-8 BOM for Excel)
  const handleExportCSV = () => {
    const headers = [
      "Registration ID",
      "Athlete Name",
      "DOB",
      "Age",
      "Gender",
      "Mobile",
      "Email",
      "School Name",
      "District",
      "Province",
      "Sports",
      "Events List",
      "Guardian Name",
      "Guardian Mobile",
      "Payment Status",
      "Total Amount (LKR)",
      "Status",
      "Registered Date"
    ];

    const rows = filteredRegistrations.map((r) => [
      `"${r.registrationNumber}"`,
      `"${r.athleteName.replace(/"/g, '""')}"`,
      `"${r.dob}"`,
      r.age,
      `"${r.gender}"`,
      `"${r.mobile}"`,
      `"${r.email || ""}"`,
      `"${r.schoolName.replace(/"/g, '""')}"`,
      `"${r.district}"`,
      `"${r.province}"`,
      `"${r.sports.join(", ")}"`,
      `"${r.selectedEvents.map((e) => `${e.sportName}:${e.eventName}(${e.ageCategory})`).join("; ")}"`,
      `"${r.guardianName || ""}"`,
      `"${r.guardianMobile || ""}"`,
      `"${r.paymentStatus}"`,
      r.totalAmount,
      `"${r.status}"`,
      `"${r.createdAt}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Eezhagam_Sports_Registrations_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Add Sport submission
  const handleCreateSportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSportName.trim()) return;

    const newSport: ChampionshipSportItem = {
      id: `sp_${newSportName.toLowerCase().replace(/\s+/g, "_")}`,
      name: newSportName,
      category: newSportCategory,
      iconName: "Activity",
      description: newSportDesc || `${newSportName} inter-school championship category.`,
      ageGroups: ["U14", "U16", "U18", "Open"],
      gender: "all",
      isTeamSport: newSportIsTeam,
      registrationStatus: "Open",
      events: []
    };

    onAddSport(newSport);
    setIsAddSportModalOpen(false);
    setNewSportName("");
    setNewSportDesc("");
  };

  // Handle Add Event submission
  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim()) return;

    const newEv = {
      id: `ev_${Date.now()}`,
      name: newEventName,
      ageCategory: newEventAge,
      gender: newEventGender,
      fee: Number(newEventFee),
      maxParticipants: Number(newEventMax)
    };

    onAddEvent(targetSportId, newEv);
    setIsAddEventModalOpen(false);
    setNewEventName("");
  };

  return (
    <div className="space-y-6">
      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#e6ece8] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Athletes
          </p>
          <p className="text-xl font-black text-[#0d2b26] mt-1">{stats.totalAthletes}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Registered</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e6ece8] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Event Entries
          </p>
          <p className="text-xl font-black text-[#0d5c4d] mt-1">{stats.totalEventEntries}</p>
          <span className="text-[10px] text-slate-500 font-medium">Across Sports</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e6ece8] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Schools Verified
          </p>
          <p className="text-xl font-black text-[#0d2b26] mt-1">{stats.uniqueSchools}</p>
          <span className="text-[10px] text-slate-500 font-medium">Institutions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e6ece8] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Districts Active
          </p>
          <p className="text-xl font-black text-amber-700 mt-1">{stats.uniqueDistricts}</p>
          <span className="text-[10px] text-slate-500 font-medium">Island-wide</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e6ece8] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paid Fees</p>
          <p className="text-xl font-black text-emerald-700 mt-1">{stats.paidCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Settled</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e6ece8] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending</p>
          <p className="text-xl font-black text-amber-600 mt-1">{stats.pendingCount}</p>
          <span className="text-[10px] text-amber-700 font-bold">To verify</span>
        </div>
      </div>

      {/* ADMIN CONTROLS HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#e6ece8] shadow-xs">
        <div>
          <h3 className="text-base font-black text-[#0d2b26] flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#0d5c4d]" />
            <span>Championship Participant Records &amp; Approvals</span>
          </h3>
          <p className="text-xs text-slate-500">
            Filter, verify athlete dossiers, change approval statuses, and download tournament reports.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setIsAddSportModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-xs font-bold border-slate-300"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Sport
          </Button>

          <Button
            onClick={() => setIsAddEventModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-xs font-bold border-slate-300"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Event
          </Button>

          <Button
            onClick={handleExportCSV}
            size="sm"
            className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-black shadow-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export to Excel/CSV ({filteredRegistrations.length})
          </Button>
        </div>
      </div>

      {/* ADVANCED MULTI-FILTER PANEL (U16 + Girls + Athletics + Jaffna) */}
      <div className="bg-white p-4 rounded-2xl border border-[#e6ece8] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Name, ID, School..."
              className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-[#fbfcfb] focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          {/* Sport Filter */}
          <div>
            <select
              value={selectedSportFilter}
              onChange={(e) => setSelectedSportFilter(e.target.value)}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-[#fbfcfb]"
            >
              <option value="All">All Sports</option>
              {sportsList.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={selectedDistrictFilter}
              onChange={(e) => setSelectedDistrictFilter(e.target.value)}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-[#fbfcfb]"
            >
              <option value="All">All Districts</option>
              {["Jaffna", "Kilinochchi", "Mullaitivu", "Batticaloa", "Colombo", "Kandy"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Age Bracket */}
          <div>
            <select
              value={selectedAgeFilter}
              onChange={(e) => setSelectedAgeFilter(e.target.value)}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-[#fbfcfb]"
            >
              <option value="All">All Age Brackets</option>
              <option value="U12">Under 12</option>
              <option value="U14">Under 14</option>
              <option value="U16">Under 16</option>
              <option value="U18">Under 18</option>
              <option value="Open">Open</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <select
              value={selectedGenderFilter}
              onChange={(e) => setSelectedGenderFilter(e.target.value)}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-[#fbfcfb]"
            >
              <option value="All">All Genders</option>
              <option value="Boys">Boys Only</option>
              <option value="Girls">Girls Only</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full h-9 px-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-[#fbfcfb]"
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Active Multi-Filter Pill tags */}
        {(selectedSportFilter !== "All" ||
          selectedDistrictFilter !== "All" ||
          selectedAgeFilter !== "All" ||
          selectedGenderFilter !== "All" ||
          searchQuery) && (
          <div className="flex items-center gap-1.5 pt-1 text-[11px] flex-wrap">
            <span className="text-slate-400 font-bold">Active Filter:</span>
            {selectedSportFilter !== "All" && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                Sport: {selectedSportFilter}
              </Badge>
            )}
            {selectedDistrictFilter !== "All" && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                District: {selectedDistrictFilter}
              </Badge>
            )}
            {selectedAgeFilter !== "All" && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                Bracket: {selectedAgeFilter}
              </Badge>
            )}
            {selectedGenderFilter !== "All" && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                Gender: {selectedGenderFilter}
              </Badge>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSportFilter("All");
                setSelectedDistrictFilter("All");
                setSelectedAgeFilter("All");
                setSelectedGenderFilter("All");
                setSelectedStatusFilter("All");
              }}
              className="text-xs text-rose-600 hover:underline font-bold ml-2"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* REGISTRATION TABLE */}
      <div className="bg-white rounded-2xl border border-[#e6ece8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8faf9] border-b border-[#e6ece8] text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5">Registration ID</th>
                <th className="p-3.5">Athlete</th>
                <th className="p-3.5">School &amp; District</th>
                <th className="p-3.5">Sports / Events</th>
                <th className="p-3.5">Fee</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f1]">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No athlete registrations match the selected multi-filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-[#fafcfb] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#0d5c4d]">
                      {reg.registrationNumber}
                    </td>

                    <td className="p-3.5">
                      <p className="font-extrabold text-slate-900">{reg.athleteName}</p>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {reg.age} Yrs &bull; {reg.gender} &bull; {reg.mobile}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-800">{reg.schoolName}</p>
                      <span className="text-[10px] text-slate-500">{reg.district}</span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {reg.selectedEvents.map((ev, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold"
                          >
                            {ev.eventName} ({ev.ageCategory})
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={
                          reg.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]"
                            : "bg-amber-50 text-amber-800 border-amber-200 text-[10px]"
                        }
                      >
                        {reg.paymentStatus} (LKR {reg.totalAmount})
                      </Badge>
                    </td>

                    <td className="p-3.5">
                      <Badge
                        className={
                          reg.status === "Approved" || reg.status === "Confirmed"
                            ? "bg-emerald-100 text-emerald-900 font-bold"
                            : reg.status === "Pending"
                            ? "bg-amber-100 text-amber-900 font-bold"
                            : "bg-rose-100 text-rose-900 font-bold"
                        }
                      >
                        {reg.status}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRegistration(reg)}
                          className="h-8 px-2 text-[#0d5c4d] hover:bg-[#ecf8f5]"
                          title="View Dossier"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        {reg.status !== "Approved" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateRegistrationStatus(reg.id, "Approved")}
                            className="h-8 px-2 text-emerald-700 hover:bg-emerald-50"
                            title="Approve"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {reg.status !== "Rejected" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateRegistrationStatus(reg.id, "Rejected")}
                            className="h-8 px-2 text-rose-600 hover:bg-rose-50"
                            title="Reject"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ATHLETE DOSSIER MODAL */}
      {selectedRegistration && (
        <Modal
          isOpen={!!selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
          title={`Athlete Dossier: ${selectedRegistration.registrationNumber}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Full Name</span>
                <span className="font-extrabold text-sm text-slate-900">
                  {selectedRegistration.athleteName}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Registration Number
                </span>
                <span className="font-mono font-bold text-sm text-[#0d5c4d]">
                  {selectedRegistration.registrationNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  DOB / Age / Gender
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedRegistration.dob} ({selectedRegistration.age} yrs,{" "}
                  {selectedRegistration.gender})
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  School &amp; District
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedRegistration.schoolName} ({selectedRegistration.district})
                </span>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-700 mb-2">Registered Sports &amp; Events:</p>
              <div className="space-y-1.5">
                {selectedRegistration.selectedEvents.map((ev, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {ev.sportName}: {ev.eventName}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        Bracket: {ev.ageCategory} &bull; Gender: {ev.gender}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-800">LKR {ev.fee}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedRegistration.guardianName && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                <p className="font-bold">Guardian Authorization Verified:</p>
                <p>
                  Guardian: {selectedRegistration.guardianName} (
                  {selectedRegistration.guardianRelationship}) &bull; Phone:{" "}
                  {selectedRegistration.guardianMobile}
                </p>
                <p className="text-[10px] text-emerald-700">
                  Consent Timestamp: {selectedRegistration.consentTimestamp}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs font-bold"
              >
                <Printer className="h-3.5 w-3.5 mr-1" /> Print Athlete Pass
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onUpdateRegistrationStatus(selectedRegistration.id, "Rejected");
                    setSelectedRegistration(null);
                  }}
                  className="text-rose-600 text-xs font-bold"
                >
                  Reject Entry
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    onUpdateRegistrationStatus(selectedRegistration.id, "Approved");
                    setSelectedRegistration(null);
                  }}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold"
                >
                  Approve Entry
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD SPORT DYNAMIC MODAL */}
      {isAddSportModalOpen && (
        <Modal
          isOpen={isAddSportModalOpen}
          onClose={() => setIsAddSportModalOpen(false)}
          title="Add New Championship Sport"
        >
          <form onSubmit={handleCreateSportSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Sport Name *</label>
              <input
                type="text"
                required
                value={newSportName}
                onChange={(e) => setNewSportName(e.target.value)}
                placeholder="e.g. Boxing, Archery, Rugby"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={newSportCategory}
                  onChange={(e) => setNewSportCategory(e.target.value)}
                  className="w-full h-10 px-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <option value="Track & Field">Track &amp; Field</option>
                  <option value="Racket Sports">Racket Sports</option>
                  <option value="Combat Sports">Combat Sports</option>
                  <option value="Ball Games">Ball Games</option>
                  <option value="Aquatics">Aquatics</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Format Type</label>
                <select
                  value={newSportIsTeam ? "Team" : "Individual"}
                  onChange={(e) => setNewSportIsTeam(e.target.value === "Team")}
                  className="w-full h-10 px-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <option value="Individual">Individual Sport</option>
                  <option value="Team">Team Sport</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Description</label>
              <textarea
                value={newSportDesc}
                onChange={(e) => setNewSportDesc(e.target.value)}
                placeholder="Brief summary of events, venue, and rules..."
                className="w-full h-20 p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold h-10 rounded-xl"
            >
              Save &amp; Publish Sport
            </Button>
          </form>
        </Modal>
      )}

      {/* ADD EVENT DYNAMIC MODAL */}
      {isAddEventModalOpen && (
        <Modal
          isOpen={isAddEventModalOpen}
          onClose={() => setIsAddEventModalOpen(false)}
          title="Add Event to Sport Discipline"
        >
          <form onSubmit={handleCreateEventSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Sport Discipline *</label>
              <select
                value={targetSportId}
                onChange={(e) => setTargetSportId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold"
              >
                {sportsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Event Name *</label>
              <input
                type="text"
                required
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="e.g. 1500m Steeplechase, Kumite -70kg, Singles Trophy"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Age Bracket</label>
                <select
                  value={newEventAge}
                  onChange={(e) => setNewEventAge(e.target.value as any)}
                  className="w-full h-10 px-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <option value="U12">Under-12</option>
                  <option value="U14">Under-14</option>
                  <option value="U16">Under-16</option>
                  <option value="U18">Under-18</option>
                  <option value="Open">Open</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gender Restriction</label>
                <select
                  value={newEventGender}
                  onChange={(e) => setNewEventGender(e.target.value as any)}
                  className="w-full h-10 px-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <option value="Boys">Boys Only</option>
                  <option value="Girls">Girls Only</option>
                  <option value="Mixed">Mixed</option>
                  <option value="All">All Participants</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Registration Fee (LKR)</label>
                <input
                  type="number"
                  value={newEventFee}
                  onChange={(e) => setNewEventFee(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Max Participants</label>
                <input
                  type="number"
                  value={newEventMax}
                  onChange={(e) => setNewEventMax(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold h-10 rounded-xl"
            >
              Save &amp; Open Event Registration
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
