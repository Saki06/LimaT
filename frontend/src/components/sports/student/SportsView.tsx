"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Trophy,
  Calendar,
  MapPin,
  CheckCircle2,
  Award,
  Flame,
  Zap,
  Activity,
  Plus,
  Edit3,
  Search,
  Filter,
  Trash2,
  ChevronRight,
  ExternalLink,
  Crown,
  Sparkles,
  Info,
  ShieldCheck,
  FileText,
  Download,
  ClipboardCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Tournament, TournamentFormat, TournamentStatus, Fixture } from "@/types/lms";
import { SportsRegistrationWizard } from "./SportsRegistrationWizard";
import { CheckRegistrationView } from "./CheckRegistrationView";
import { AdminSportsRegistrationsDesk } from "../admin/AdminSportsRegistrationsDesk";
import { ChampionshipStandingsView } from "./ChampionshipStandingsView";
import { MatchCenterFixturesView } from "./MatchCenterFixturesView";
import {
  ChampionshipSportItem,
  StoredAthleteRegistration
} from "@/components/sports/sportsRegistrationData";
import { api, SportsRegistration } from "@/lib/api";

type SportsTab =
  | "tournaments"
  | "registration"
  | "check_registration"
  | "admin_registrations"
  | "fixtures"
  | "standings";

export function SportsView({
  initialTab = "tournaments"
}: {
  initialTab?: SportsTab;
}) {
  const {
    sports,
    teams,
    championshipSports,
    fixtures,
    sportsRegistrations,
    standings,
    tournaments = [],
    createTournament,
    updateTournament,
    deleteTournament,
    createFixture,
    fetchSportsEvents,
    fetchMySportsRegistrations,
    fetchSportsOperations,
    submitChampionshipRegistration,
    updateChampionshipRegistrationStatus,
    createChampionshipSport,
    createChampionshipEvent,
    currentRole,
    currentUser,
    recordMatchResult,
    addToast,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<SportsTab>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Eezhagam / Championship Sports Web Registration Platform States
  const [athleteRegistrations, setAthleteRegistrations] = useState<StoredAthleteRegistration[]>([]);

  React.useEffect(() => {
    void Promise.all([fetchSportsEvents(), fetchSportsOperations()]).catch((error) =>
      addToast({
        type: "error",
        title: "Unable to Refresh Sports Data",
        message: error instanceof Error ? error.message : "An unexpected error occurred.",
      })
    );
  }, [fetchSportsEvents, fetchSportsOperations, addToast]);

  React.useEffect(() => {
    if (activeTab === "check_registration") {
      setAthleteRegistrations(mapRegistrationRecords(sportsRegistrations));
    }
  }, [activeTab, sportsRegistrations]);

  const mapRegistrationRecords = (records: SportsRegistration[]): StoredAthleteRegistration[] => {
    const mapped = new Map<string, StoredAthleteRegistration>();
    records.forEach((registration) => {
      if (!registration.registrationNumber || !registration.athleteDetails ||
        typeof registration.athleteDetails !== "object" || Array.isArray(registration.athleteDetails)) return;
      const details = registration.athleteDetails as Record<string, unknown>;
      if (
        typeof details.athleteName !== "string" ||
        typeof details.firstName !== "string" ||
        typeof details.lastName !== "string" ||
        !Array.isArray(details.selectedEvents) ||
        typeof details.registrationNumber !== "string"
      ) return;
      const status = records.some((item) =>
        item.registrationNumber === registration.registrationNumber && item.status === "REJECTED"
      ) ? "Rejected" : records.some((item) =>
        item.registrationNumber === registration.registrationNumber && item.status === "CONFIRMED"
      ) ? "Approved" : "Pending";
      const selectedEvents = details.selectedEvents.filter((item): item is StoredAthleteRegistration["selectedEvents"][number] =>
        Boolean(item && typeof item === "object" &&
          "id" in item && "sportName" in item && "eventName" in item &&
          "ageCategory" in item && "gender" in item && "fee" in item)
      );
      mapped.set(registration.registrationNumber, {
        ...(details as unknown as StoredAthleteRegistration),
        id: registration.registrationNumber,
        registrationNumber: registration.registrationNumber,
        selectedEvents,
        status,
        paymentStatus: registration.paymentStatus as StoredAthleteRegistration["paymentStatus"],
        totalAmount: registration.totalAmount,
      });
    });
    return Array.from(mapped.values());
  };

  const handleNewRegistration = async (newRecord: StoredAthleteRegistration) => {
    const result = await submitChampionshipRegistration({
      eventIds: newRecord.selectedEvents.map((event) => event.id),
      registrationNumber: newRecord.registrationNumber,
      athleteDetails: newRecord as unknown as Record<string, unknown>,
    });
    if (result.success) setAthleteRegistrations((prev) => [newRecord, ...prev]);
    return result;
  };

  const handleUpdateRegStatus = async (
    id: string,
    newStatus: "Confirmed" | "Pending" | "Approved" | "Rejected"
  ) => {
    await updateChampionshipRegistrationStatus(id, newStatus);
    setAthleteRegistrations((prev) => prev.map((registration) =>
      registration.registrationNumber === id ? { ...registration, status: newStatus } : registration
    ));
  };

  React.useEffect(() => {
    if (activeTab !== "admin_registrations") return;
    api.sports.getRegistrations()
      .then((records) => setAthleteRegistrations(mapRegistrationRecords(records)))
      .catch((error) => addToast({
        type: "error",
        title: "Unable to Load Sports Registrations",
        message: error instanceof Error ? error.message : "An unexpected error occurred.",
      }));
  }, [activeTab, addToast]);

  React.useEffect(() => {
    if (activeTab !== "check_registration") return;
    void fetchMySportsRegistrations().catch((error) => addToast({
      type: "error",
      title: "Unable to Load Your Registrations",
      message: error instanceof Error ? error.message : "An unexpected error occurred.",
    }));
  }, [activeTab, addToast, fetchMySportsRegistrations]);

  const handleAddChampionshipSport = async (
    newSport: Omit<ChampionshipSportItem, "id" | "events" | "registrationStatus">
  ) => {
    await createChampionshipSport(newSport);
  };

  const handleAddChampionshipEvent = async (
    sportId: string,
    newEvent: Omit<ChampionshipSportItem["events"][number], "id">
  ) => {
    await createChampionshipEvent(sportId, newEvent);
  };

  // Modals state
  const [isCreateTournamentModalOpen, setIsCreateTournamentModalOpen] = useState(false);
  const [isScheduleFixtureModalOpen, setIsScheduleFixtureModalOpen] = useState(false);
  const [selectedFixtureForScore, setSelectedFixtureForScore] = useState<string | null>(null);

  // Tournament Form State
  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    sportName: "",
    category: "",
    format: "group_stage_knockout" as TournamentFormat,
    startDate: "",
    endDate: "",
    venue: "",
    organizer: "",
    trophyTitle: "",
    participatingTeamsInput: "",
    status: "upcoming" as TournamentStatus,
    currentRound: "",
    description: "",
    rules: ""
  });

  // Schedule Fixture Form State
  const [fixtureForm, setFixtureForm] = useState({
    tournamentId: "",
    competitionName: "",
    sportName: "",
    homeTeam: "",
    awayTeam: "",
    date: "",
    time: "",
    venue: ""
  });

  // Score recording modal states
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [outcome, setOutcome] = useState("");

  const isAdminOrTeacher = currentRole === "admin" || currentRole === "teacher";

  // Filtered Tournaments
  const filteredTournaments = tournaments.filter((tr) => {
    const matchSport = selectedSport === "All" || tr.sportName.toLowerCase().includes(selectedSport.toLowerCase());
    const matchStatus = selectedStatus === "All" || tr.status === selectedStatus;
    const matchSearch =
      tr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tr.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tr.trophyTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSport && matchStatus && matchSearch;
  });

  // Filtered Fixtures
  const filteredFixtures = fixtures.filter((fx) => {
    const matchSport = selectedSport === "All" || fx.sportName.toLowerCase().includes(selectedSport.toLowerCase());
    return matchSport;
  });

  // Handle Create Tournament Submit
  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !tournamentForm.name.trim() ||
      !tournamentForm.sportName ||
      !tournamentForm.startDate ||
      !tournamentForm.endDate ||
      !tournamentForm.venue.trim()
    ) return;

    const teamsArray = tournamentForm.participatingTeamsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const sportObj = sports.find((s) => s.name === tournamentForm.sportName);

    createTournament({
      name: tournamentForm.name,
      sportId: sportObj?.id || "",
      sportName: tournamentForm.sportName,
      category: tournamentForm.category,
      format: tournamentForm.format,
      startDate: tournamentForm.startDate,
      endDate: tournamentForm.endDate,
      venue: tournamentForm.venue,
      organizer: tournamentForm.organizer,
      trophyTitle: tournamentForm.trophyTitle,
      participatingTeams: teamsArray,
      teamsCount: teamsArray.length,
      status: tournamentForm.status,
      currentRound: tournamentForm.currentRound,
      description: tournamentForm.description,
      rules: tournamentForm.rules
    });

    setIsCreateTournamentModalOpen(false);
    // Reset form
    setTournamentForm({
      name: "",
      sportName: "",
      category: "",
      format: "group_stage_knockout",
      startDate: "",
      endDate: "",
      venue: "",
      organizer: "",
      trophyTitle: "",
      participatingTeamsInput: "",
      status: "upcoming",
      currentRound: "",
      description: "",
      rules: ""
    });
  };

  // Handle Schedule Fixture Submit
  const handleScheduleFixture = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !fixtureForm.competitionName.trim() ||
      !fixtureForm.sportName ||
      !fixtureForm.homeTeam.trim() ||
      !fixtureForm.awayTeam.trim() ||
      !fixtureForm.date ||
      !fixtureForm.time.trim() ||
      !fixtureForm.venue.trim()
    ) return;

    createFixture({
      tournamentId: fixtureForm.tournamentId || null,
      competitionName: fixtureForm.competitionName,
      sportName: fixtureForm.sportName,
      homeTeam: fixtureForm.homeTeam,
      awayTeam: fixtureForm.awayTeam,
      date: fixtureForm.date,
      time: fixtureForm.time,
      venue: fixtureForm.venue,
      status: "scheduled"
    });

    setIsScheduleFixtureModalOpen(false);
    setFixtureForm({
      tournamentId: "",
      competitionName: "",
      sportName: "",
      homeTeam: "",
      awayTeam: "",
      date: "",
      time: "",
      venue: "",
    });
  };

  // Handle Score Submit
  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFixtureForScore) return;
    recordMatchResult(selectedFixtureForScore, homeScore, awayScore, outcome);
    setSelectedFixtureForScore(null);
    setHomeScore("");
    setAwayScore("");
    setOutcome("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a2e26] via-[#0d5c4d] to-[#08241e] text-white p-6 sm:p-8 shadow-md">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-4 opacity-10 pointer-events-none">
          <Trophy className="h-72 w-72 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#a5f3df]">
              <Trophy className="h-3.5 w-3.5 text-[#f3b738]" />
              <span>Athletics, Tournaments &amp; Sports Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t.sports.title || "Sports Operations & Tournaments"}
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Organize sports tournaments, manage team rosters, track live scorecards, and monitor league standings.
            </p>
          </div>

          {/* Quick Metrics & Admin Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs shrink-0">
              <div className="text-center px-3 border-r border-white/20">
                <p className="text-xl font-extrabold text-[#f3b738]">{tournaments.length}</p>
                <p className="text-[10px] text-emerald-200">Tournaments</p>
              </div>
              <div className="text-center px-3 border-r border-white/20">
                <p className="text-xl font-extrabold text-white">{teams.length}</p>
                <p className="text-[10px] text-emerald-200">Squads</p>
              </div>
              <div className="text-center px-3">
                <p className="text-xl font-extrabold text-[#86efac]">{fixtures.length}</p>
                <p className="text-[10px] text-emerald-200">Fixtures</p>
              </div>
            </div>

            {/* Action Buttons: Admin Management vs Student Actions */}
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              {isAdminOrTeacher ? (
                <>
                  <Button
                    onClick={() => setActiveTab("admin_registrations")}
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-bold text-xs h-10 px-3.5 rounded-xl cursor-pointer"
                  >
                    <ClipboardCheck className="h-4 w-4 mr-1 text-[#a5f3df]" />
                    <span>Approvals Desk</span>
                  </Button>
                  <Button
                    onClick={() => setIsScheduleFixtureModalOpen(true)}
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-bold text-xs h-10 px-3.5 rounded-xl cursor-pointer"
                  >
                    <Calendar className="h-4 w-4 mr-1 text-[#a5f3df]" />
                    <span>Schedule Match</span>
                  </Button>
                  <Button
                    onClick={() => setIsCreateTournamentModalOpen(true)}
                    className="bg-[#f3b738] hover:bg-[#dfa224] text-[#0d2b26] font-black text-xs shadow-md flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl cursor-pointer"
                  >
                    <Plus className="h-4 w-4 text-[#0d2b26]" />
                    <span>{t.sports.createTournament || "New Tournament"}</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setActiveTab("registration")}
                  className="bg-[#f3b738] hover:bg-[#dfa224] text-[#0d2b26] font-black text-xs shadow-md flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-[#0d2b26]" />
                  <span>+ Register for Championship</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Admin Management vs Student) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[#e6ece8]">
        {isAdminOrTeacher ? (
          <>
            <button
              onClick={() => setActiveTab("tournaments")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "tournaments"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>Tournaments & Brackets</span>
            </button>
            <button
              onClick={() => setActiveTab("admin_registrations")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "admin_registrations"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
              }`}
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Registrations & Approvals Desk</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === "admin_registrations"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-[#0d5c4d]"
                }`}
              >
                {athleteRegistrations.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("fixtures")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "fixtures"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Fixtures & Match Scoring</span>
            </button>
            <button
              onClick={() => setActiveTab("standings")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "standings"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>League Standings</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab("tournaments")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "tournaments"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>Tournaments & Championships</span>
            </button>
            <button
              onClick={() => setActiveTab("registration")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "registration"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Online Registration</span>
            </button>
            <button
              onClick={() => setActiveTab("check_registration")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "check_registration"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Check My Registration</span>
            </button>
            <button
              onClick={() => setActiveTab("fixtures")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "fixtures"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Fixtures & Schedule</span>
            </button>
            <button
              onClick={() => setActiveTab("standings")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === "standings"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>League Standings</span>
            </button>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TOURNAMENTS & CHAMPIONSHIPS */}
      {/* ========================================================================= */}
      {activeTab === "tournaments" && (
        <div className="space-y-6">
          {/* Filters & Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e6ece8] shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tournaments, venues, trophies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0d5c4d] bg-[#fbfcfb]"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span>Sport:</span>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-[#fbfcfb] text-slate-700 text-xs font-semibold focus:outline-none"
                >
                  <option value="All">All Disciplines</option>
                  {sports.map((sp) => (
                    <option key={sp.id} value={sp.name}>
                      {sp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <span>Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-[#fbfcfb] text-slate-700 text-xs font-semibold focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="registration_open">Registration Open</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tournaments Grid */}
          {filteredTournaments.length === 0 ? (
            <Card className="border-[#e6ece8] bg-white p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-black text-[#0d2b26]">No Tournaments Found</h3>
                <p className="text-xs text-slate-500">
                  {searchQuery || selectedSport !== "All"
                    ? "Try adjusting your filters or search keywords."
                    : "No tournaments registered in this category yet."}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTournaments.map((tr) => (
                <Card
                  key={tr.id}
                  className="border-[#e6ece8] bg-white shadow-xs hover:border-[#0d5c4d]/40 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header Banner */}
                    <div className="p-5 border-b border-[#f0f4f1] bg-[#fafcfb] flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center shrink-0 border border-[#c4e9e0] shadow-xs">
                          <Trophy className="h-6 w-6 text-[#b47a16]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0d5c4d] text-white">
                              {tr.sportName}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {tr.category}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-[#0d2b26] leading-snug">
                            {tr.name}
                          </h3>
                          <p className="text-xs text-[#b47a16] font-bold flex items-center gap-1 mt-0.5">
                            <Crown className="w-3.5 h-3.5" />
                            <span>{tr.trophyTitle}</span>
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <Badge
                        variant={
                          tr.status === "ongoing"
                            ? "success"
                            : tr.status === "upcoming"
                            ? "info"
                            : tr.status === "registration_open"
                            ? "warning"
                            : "secondary"
                        }
                        className="capitalize shrink-0"
                      >
                        {tr.status.replace("_", " ")}
                      </Badge>
                    </div>

                    {/* Card Body Details */}
                    <CardContent className="p-5 space-y-4 text-xs">
                      <p className="text-slate-600 text-xs leading-relaxed">
                        {tr.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 bg-[#f8faf9] p-3 rounded-xl border border-[#eef4f1]">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Dates</span>
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#0d5c4d]" />
                            {tr.startDate} → {tr.endDate}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Format</span>
                          <span className="font-bold text-slate-700 capitalize">
                            {tr.format.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="col-span-2 space-y-0.5 pt-1 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Host Grounds</span>
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {tr.venue}
                          </span>
                        </div>
                      </div>

                      {/* Participating Squads list */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span>Participating Schools &amp; Teams ({tr.participatingTeams?.length || 0})</span>
                          {tr.currentRound && (
                            <span className="text-[#0d5c4d] bg-[#ecf8f5] px-2 py-0.5 rounded-md font-black">
                              {tr.currentRound}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pt-1">
                          {tr.participatingTeams?.map((tmName, idx) => (
                            <span
                              key={idx}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                                tmName.toLowerCase().includes("st. michael")
                                  ? "bg-emerald-50 text-[#0d5c4d] border-emerald-300 ring-1 ring-emerald-300"
                                  : "bg-white text-slate-700 border-slate-200"
                              }`}
                            >
                              {tmName}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Champion Showcase if completed */}
                      {tr.champion && (
                        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-black">
                            🏆
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-amber-700 block">
                              Defending Champion
                            </span>
                            <span className="text-xs font-black text-amber-950">{tr.champion}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 bg-[#fbfcfb] border-t border-[#eef4f1] flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSport(tr.sportName);
                        setActiveTab("fixtures");
                      }}
                      className="text-xs font-bold text-[#0d5c4d] border-[#0d5c4d]/30 hover:bg-[#ecf8f5]"
                    >
                      View Tournament Fixtures →
                    </Button>

                    {isAdminOrTeacher && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFixtureForm({
                              ...fixtureForm,
                              tournamentId: tr.id,
                              competitionName: tr.name,
                              sportName: tr.sportName,
                              venue: tr.venue
                            });
                            setIsScheduleFixtureModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-slate-700 border-slate-200 hover:bg-slate-100"
                        >
                          + Add Fixture
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTournament(tr.id)}
                          className="text-slate-400 hover:text-rose-600 hover:border-rose-300 p-2"
                          title="Delete Tournament"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MATCH FIXTURES & LIVE RESULTS (MODERN STADIUM MATCH-CENTER)        */}
      {/* ========================================================================= */}
      {activeTab === "fixtures" && (
        <MatchCenterFixturesView
          defaultFixtures={fixtures}
          isAdminOrTeacher={isAdminOrTeacher}
          onScheduleNewFixture={() => setIsScheduleFixtureModalOpen(true)}
          onRecordScore={(fixtureId: string) => setSelectedFixtureForScore(fixtureId)}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LEAGUE STANDINGS CALCULATED FROM SAVED FIXTURE RESULTS */}
      {/* ========================================================================= */}
      {activeTab === "standings" && (
        <ChampionshipStandingsView
          defaultStandings={standings}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB: ONLINE ATHLETE REGISTRATION WIZARD (10-STEP MULTI-STEP FLOW)         */}
      {/* ========================================================================= */}
      {activeTab === "registration" && (
        <SportsRegistrationWizard
          championshipSports={championshipSports}
          onRegistrationComplete={handleNewRegistration}
          onCancel={() => setActiveTab("tournaments")}
          currentUser={currentUser}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB: CHECK MY REGISTRATION (ID + PHONE SEARCH)                            */}
      {/* ========================================================================= */}
      {activeTab === "check_registration" && (
        <CheckRegistrationView
          registrations={athleteRegistrations}
          onOpenRegister={() => setActiveTab("registration")}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB: ADMIN REGISTRATIONS DESK (KPIs, MULTI-FILTERS, CSV EXPORT)           */}
      {/* ========================================================================= */}
      {activeTab === "admin_registrations" && (
        <AdminSportsRegistrationsDesk
          registrations={athleteRegistrations}
          onUpdateRegistrationStatus={handleUpdateRegStatus}
          sportsList={championshipSports}
          onAddSport={handleAddChampionshipSport}
          onAddEvent={handleAddChampionshipEvent}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE TOURNAMENT (Admin / Teacher) */}
      {/* ========================================================================= */}
      {isCreateTournamentModalOpen && (
        <Modal
          isOpen={isCreateTournamentModalOpen}
          onClose={() => setIsCreateTournamentModalOpen(false)}
          title="Create Inter-School Tournament / Championship 🏆"
          description="Publish a new school tournament with official rules, host grounds, and participating teams."
        >
          <form onSubmit={handleCreateTournament} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tournament Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. All-Island Inter-School T20 Cricket Championship 2026"
                value={tournamentForm.name}
                onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Sport Discipline *
                </label>
                <select
                  required
                  value={tournamentForm.sportName}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, sportName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                >
                  <option value="">Select a sport</option>
                  {sports.map((sp) => (
                    <option key={sp.id} value={sp.name}>{sp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Age Category / Division
                </label>
                <input
                  type="text"
                  placeholder="e.g. Under-19 Division 1 or Under-17"
                  value={tournamentForm.category}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, category: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tournament Format
                </label>
                <select
                  value={tournamentForm.format}
                  onChange={(e) =>
                    setTournamentForm({ ...tournamentForm, format: e.target.value as TournamentFormat })
                  }
                  className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                >
                  <option value="group_stage_knockout">Group Stage + Knockout</option>
                  <option value="knockout">Pure Knockout Cup</option>
                  <option value="round_robin">Round Robin League</option>
                  <option value="league">Points League</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={tournamentForm.startDate}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, startDate: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={tournamentForm.endDate}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, endDate: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Host Grounds / Stadium
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Colombo Colts Grounds & College Oval"
                  value={tournamentForm.venue}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, venue: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Trophy / Shield Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Governor's Challenge Shield"
                  value={tournamentForm.trophyTitle}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, trophyTitle: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Participating Schools &amp; Squads (Comma Separated)
              </label>
              <textarea
                rows={2}
                value={tournamentForm.participatingTeamsInput}
                onChange={(e) =>
                  setTournamentForm({ ...tournamentForm, participatingTeamsInput: e.target.value })
                }
                placeholder="Enter school or team names, separated by commas"
                className="w-full p-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#0d5c4d]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Type team names separated by commas. Each will be automatically registered into the tournament bracket.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Initial Status
                </label>
                <select
                  value={tournamentForm.status}
                  onChange={(e) =>
                    setTournamentForm({ ...tournamentForm, status: e.target.value as TournamentStatus })
                  }
                  className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="registration_open">Registration Open</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Current Stage / Round
                </label>
                <input
                  type="text"
                  placeholder="e.g. Group Stage, Quarter Finals"
                  value={tournamentForm.currentRound}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, currentRound: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tournament Overview &amp; Regulations
              </label>
              <textarea
                rows={2}
                value={tournamentForm.description}
                onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })}
                placeholder="Brief summary of tournament rules, qualifications, and live stream coverage."
                className="w-full p-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateTournamentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-black text-xs px-5 shadow-sm"
              >
                Publish &amp; Create Tournament 🏆
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SCHEDULE FIXTURE (Admin / Teacher) */}
      {/* ========================================================================= */}
      {isScheduleFixtureModalOpen && (
        <Modal
          isOpen={isScheduleFixtureModalOpen}
          onClose={() => setIsScheduleFixtureModalOpen(false)}
          title="Schedule Match Fixture 📅"
          description="Schedule a match under an existing tournament or inter-collegiate friendly."
        >
          <form onSubmit={handleScheduleFixture} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tournament (Optional)
              </label>
              <select
                value={fixtureForm.tournamentId}
                onChange={(event) => {
                  const tournament = tournaments.find((item) => item.id === event.target.value);
                  setFixtureForm({
                    ...fixtureForm,
                    tournamentId: tournament?.id || "",
                    ...(tournament ? {
                      competitionName: tournament.name,
                      sportName: tournament.sportName,
                      venue: tournament.venue,
                    } : {}),
                  });
                }}
                className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm"
              >
                <option value="">Independent fixture / friendly</option>
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>{tournament.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tournament / Competition Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. All-Island Inter-School Tier 1 Cricket Championship"
                value={fixtureForm.competitionName}
                onChange={(e) => setFixtureForm({ ...fixtureForm, competitionName: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Home Team
                </label>
                <input
                  type="text"
                  required
                  value={fixtureForm.homeTeam}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, homeTeam: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Away / Opponent Team
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trinity Central College"
                  value={fixtureForm.awayTeam}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, awayTeam: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Sport
                </label>
                <select
                  required
                  value={fixtureForm.sportName}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, sportName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none"
                >
                  <option value="">Select a sport</option>
                  {sports.map((sp) => (
                    <option key={sp.id} value={sp.name}>{sp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Match Date
                </label>
                <input
                  type="date"
                  required
                  value={fixtureForm.date}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, date: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Start Time
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter start time"
                  value={fixtureForm.time}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, time: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Venue &amp; Pitch
              </label>
              <input
                type="text"
                required
                placeholder="Enter venue"
                value={fixtureForm.venue}
                onChange={(e) => setFixtureForm({ ...fixtureForm, venue: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsScheduleFixtureModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold"
              >
                Confirm Match Schedule
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RECORD SCORE (Admin / Teacher) */}
      {/* ========================================================================= */}
      {selectedFixtureForScore && (
        <Modal
          isOpen={Boolean(selectedFixtureForScore)}
          onClose={() => setSelectedFixtureForScore(null)}
          title="Record Official Match Result"
          description="Enter match scores and outcome to update league standings."
        >
          <form onSubmit={handleScoreSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Home Score
                </label>
                <input
                  type="text"
                  required
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Away Score
                </label>
                <input
                  type="text"
                  required
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Match Outcome Summary
              </label>
              <input
                type="text"
                required
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="e.g. St. Michael Won by 17 runs"
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedFixtureForScore(null)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold">
                Publish Result
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
