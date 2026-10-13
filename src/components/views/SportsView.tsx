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
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Tournament, TournamentFormat, TournamentStatus, Fixture } from "@/types/lms";
import { SportsRegistrationWizard } from "@/components/sports/SportsRegistrationWizard";
import { CheckRegistrationView } from "@/components/sports/CheckRegistrationView";
import { AdminSportsRegistrationsDesk } from "@/components/sports/AdminSportsRegistrationsDesk";
import {
  INITIAL_CHAMPIONSHIP_SPORTS,
  INITIAL_ATHLETE_REGISTRATIONS,
  ChampionshipSportItem,
  StoredAthleteRegistration
} from "@/components/sports/sportsRegistrationData";

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
    fixtures,
    standings,
    tournaments = [],
    createTournament,
    updateTournament,
    deleteTournament,
    createFixture,
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
  const [athleteRegistrations, setAthleteRegistrations] = useState<StoredAthleteRegistration[]>(
    INITIAL_ATHLETE_REGISTRATIONS
  );
  const [championshipSports, setChampionshipSports] = useState<ChampionshipSportItem[]>(
    INITIAL_CHAMPIONSHIP_SPORTS
  );

  const handleNewRegistration = (newRecord: StoredAthleteRegistration) => {
    setAthleteRegistrations((prev) => [newRecord, ...prev]);
    addToast({
      type: "success",
      title: "Championship Registration Confirmed!",
      message: `Entry Pass ${newRecord.registrationNumber} issued for ${newRecord.athleteName}.`
    });
  };

  const handleUpdateRegStatus = (
    id: string,
    newStatus: "Confirmed" | "Pending" | "Approved" | "Rejected"
  ) => {
    setAthleteRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    addToast({
      type: "info",
      title: "Participant Status Updated",
      message: `Registration ${id} set to ${newStatus}.`
    });
  };

  const handleAddChampionshipSport = (newSport: ChampionshipSportItem) => {
    setChampionshipSports((prev) => [...prev, newSport]);
    addToast({
      type: "success",
      title: "New Sport Added",
      message: `${newSport.name} published to championship registry.`
    });
  };

  const handleAddChampionshipEvent = (
    sportId: string,
    newEvent: any
  ) => {
    setChampionshipSports((prev) =>
      prev.map((s) => (s.id === sportId ? { ...s, events: [...s.events, newEvent] } : s))
    );
    addToast({
      type: "success",
      title: "New Event Published",
      message: `${newEvent.name} added to sports schedule.`
    });
  };

  // Modals state
  const [isCreateTournamentModalOpen, setIsCreateTournamentModalOpen] = useState(false);
  const [isScheduleFixtureModalOpen, setIsScheduleFixtureModalOpen] = useState(false);
  const [selectedFixtureForScore, setSelectedFixtureForScore] = useState<string | null>(null);

  // Tournament Form State
  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    sportName: "Cricket",
    category: "Under-19 Division 1",
    format: "group_stage_knockout" as TournamentFormat,
    startDate: "",
    endDate: "",
    venue: "",
    organizer: "Sri Lanka Inter-Academy Sports Board",
    trophyTitle: "",
    participatingTeamsInput: "Lions Cricket Academy, Trinity Sports Club, Royal Titans Academy, Apex Warriors",
    status: "upcoming" as TournamentStatus,
    currentRound: "Round 1 / Group Stage",
    description: "",
    rules: "Standard federation rules, 50 overs white-ball format or standard match duration."
  });

  // Schedule Fixture Form State
  const [fixtureForm, setFixtureForm] = useState({
    competitionName: "",
    sportName: "Cricket",
    homeTeam: "Lions Cricket Academy",
    awayTeam: "",
    date: "",
    time: "09:30 AM",
    venue: "City Sports Complex"
  });

  // Score recording modal states
  const [homeScore, setHomeScore] = useState("215/8 (50 ov)");
  const [awayScore, setAwayScore] = useState("198 all out");
  const [outcome, setOutcome] = useState("Lions Academy Won by 17 runs");

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
    if (!tournamentForm.name.trim()) return;

    const teamsArray = tournamentForm.participatingTeamsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const sportObj = sports.find((s) => s.name === tournamentForm.sportName);

    createTournament({
      name: tournamentForm.name,
      sportId: sportObj ? sportObj.id : "sp_cricket",
      sportName: tournamentForm.sportName,
      category: tournamentForm.category,
      format: tournamentForm.format,
      startDate: tournamentForm.startDate || new Date().toISOString().substring(0, 10),
      endDate: tournamentForm.endDate || "2026-11-20",
      venue: tournamentForm.venue || "National Sports Complex",
      organizer: tournamentForm.organizer,
      trophyTitle: tournamentForm.trophyTitle || `${tournamentForm.name} Trophy`,
      participatingTeams: teamsArray.length > 0 ? teamsArray : ["St. Michael High School", "Trinity Central College"],
      teamsCount: teamsArray.length || 8,
      status: tournamentForm.status,
      currentRound: tournamentForm.currentRound,
      description: tournamentForm.description || `Premier inter-school tournament for ${tournamentForm.sportName}.`,
      rules: tournamentForm.rules
    });

    setIsCreateTournamentModalOpen(false);
    // Reset form
    setTournamentForm({
      name: "",
      sportName: "Cricket",
      category: "Under-19 Division 1",
      format: "group_stage_knockout",
      startDate: "",
      endDate: "",
      venue: "",
      organizer: "Sri Lanka Schools Sports Association",
      trophyTitle: "",
      participatingTeamsInput: "St. Michael High School, Trinity Central College, Royal Academy Colombo, Ananda College",
      status: "upcoming",
      currentRound: "Round 1 / Group Stage",
      description: "",
      rules: "Standard federation rules, 50 overs white-ball format or standard match duration."
    });
  };

  // Handle Schedule Fixture Submit
  const handleScheduleFixture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixtureForm.homeTeam || !fixtureForm.awayTeam) return;

    createFixture({
      competitionName: fixtureForm.competitionName || "Inter-School Tournament",
      sportName: fixtureForm.sportName,
      homeTeam: fixtureForm.homeTeam,
      awayTeam: fixtureForm.awayTeam,
      date: fixtureForm.date || new Date().toISOString().substring(0, 10),
      time: fixtureForm.time || "09:30 AM",
      venue: fixtureForm.venue || "College Oval",
      status: "scheduled"
    });

    setIsScheduleFixtureModalOpen(false);
  };

  // Handle Score Submit
  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFixtureForScore) return;
    recordMatchResult(selectedFixtureForScore, homeScore, awayScore, outcome);
    setSelectedFixtureForScore(null);
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

            {/* Action Buttons: Register for Sports + Admin Actions */}
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Button
                onClick={() => setActiveTab("registration")}
                className="bg-[#f3b738] hover:bg-[#dfa224] text-[#0d2b26] font-black text-xs shadow-md flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-[#0d2b26]" />
                <span>+ Register for Championship</span>
              </Button>

              {isAdminOrTeacher && (
                <Button
                  onClick={() => setIsCreateTournamentModalOpen(true)}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-bold text-xs h-10 px-3.5 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>{t.sports.createTournament || "New Tournament"}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="mt-8 pt-4 border-t border-white/15 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab("tournaments")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "tournaments"
                  ? "bg-white text-[#0d5c4d] shadow-sm scale-102"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>{t.sports.tournaments || "Tournaments"}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
                {tournaments.length}
              </span>
            </button>

            {/* Online Registration Wizard Tab */}
            <button
              onClick={() => setActiveTab("registration")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "registration"
                  ? "bg-white text-[#0d5c4d] shadow-sm scale-102 font-black"
                  : "bg-[#f3b738] text-slate-950 font-black hover:bg-[#dfa224]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-slate-950" />
              <span>Online Registration</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-800 text-white font-mono">
                10-Step
              </span>
            </button>

            {/* Check My Registration Tab */}
            <button
              onClick={() => setActiveTab("check_registration")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "check_registration"
                  ? "bg-white text-[#0d5c4d] shadow-sm scale-102"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Check My Registration</span>
            </button>

            {/* Admin Registrations Desk Tab */}
            {isAdminOrTeacher && (
              <button
                onClick={() => setActiveTab("admin_registrations")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "admin_registrations"
                    ? "bg-white text-[#0d5c4d] shadow-sm scale-102"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                <span>Registrations Desk</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-bold">
                  {athleteRegistrations.length}
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("fixtures")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "fixtures"
                  ? "bg-white text-[#0d5c4d] shadow-sm scale-102"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>{t.sports.fixtures || "Match Fixtures"}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
                {fixtures.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("standings")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "standings"
                  ? "bg-white text-[#0d5c4d] shadow-sm scale-102"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>{t.sports.standings || "League Table"}</span>
            </button>
          </div>

          {/* Quick Sport Filter Dropdown / Pills */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-200/80 font-semibold hidden sm:inline">Sport:</span>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="bg-white/15 border border-white/25 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
            >
              <option value="All" className="text-slate-900">All Disciplines</option>
              {sports.map((sp) => (
                <option key={sp.id} value={sp.name} className="text-slate-900">
                  {sp.name}
                </option>
              ))}
            </select>
          </div>
        </div>
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
      {/* TAB 2: MATCH FIXTURES & LIVE RESULTS */}
      {/* ========================================================================= */}
      {activeTab === "fixtures" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0d2b26] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#0d5c4d]" />
                <span>Inter-School Match Schedule &amp; Scorecards</span>
              </h3>
              <p className="text-xs text-slate-500">
                Official fixtures organized across ongoing tournaments and school friendly ties.
              </p>
            </div>

            {isAdminOrTeacher && (
              <Button
                onClick={() => setIsScheduleFixtureModalOpen(true)}
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-black h-9 px-4 rounded-xl shadow-xs self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Schedule Match Fixture
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {filteredFixtures.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#d6dfd9] text-slate-400 text-xs">
                No fixtures found under {selectedSport}.
              </div>
            ) : (
              filteredFixtures.map((fx) => (
                <div
                  key={fx.id}
                  className="bg-white rounded-2xl border border-[#e6ece8] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#c4e9e0] transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#ecf8f5] text-[#0d5c4d]">
                        {fx.competitionName}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {fx.date} • {fx.time}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {fx.sportName}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-sm font-extrabold text-[#0d2b26]">
                      <span className="text-slate-900">{fx.homeTeam}</span>
                      <span className="text-slate-300 font-normal">vs</span>
                      <span className="text-slate-900">{fx.awayTeam}</span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{fx.venue}</span>
                    </p>

                    {fx.result && (
                      <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold space-y-0.5">
                        <p>
                          {fx.homeTeam}: {fx.result.homeScore} | {fx.awayTeam}: {fx.result.awayScore}
                        </p>
                        <p className="text-[11px] font-bold text-emerald-700">
                          Outcome: {fx.result.outcome}
                        </p>
                      </div>
                    )}
                  </div>

                  {isAdminOrTeacher && (
                    <Button
                      onClick={() => setSelectedFixtureForScore(fx.id)}
                      variant="outline"
                      className="border-[#0d5c4d] text-[#0d5c4d] hover:bg-[#ecf8f5] text-xs font-bold shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                      Record Scores
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LEAGUE STANDINGS */}
      {/* ========================================================================= */}
      {activeTab === "standings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0d2b26] flex items-center gap-2">
              <Award className="h-4 w-4 text-[#0d5c4d]" />
              <span>Inter-School League Championship Points</span>
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-[#e6ece8] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8faf9] border-b border-[#e6ece8] text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3.5">Position / Team</th>
                  <th className="p-3.5 text-center">Played (P)</th>
                  <th className="p-3.5 text-center">Won (W)</th>
                  <th className="p-3.5 text-center">Drawn (D)</th>
                  <th className="p-3.5 text-center">Lost (L)</th>
                  <th className="p-3.5 text-center text-[#0d5c4d]">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef3f0]">
                {standings.map((st, idx) => (
                  <tr
                    key={st.id}
                    className={`hover:bg-[#fbfcfb] ${
                      idx === 0 ? "bg-[#ecf8f5]/40 font-bold" : ""
                    }`}
                  >
                    <td className="p-3.5 flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                          idx === 0
                            ? "bg-amber-100 text-amber-800"
                            : idx === 1
                            ? "bg-slate-200 text-slate-700"
                            : idx === 2
                            ? "bg-orange-100 text-orange-800"
                            : "bg-slate-50 text-slate-400"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-bold text-[#0d2b26]">{st.teamName}</span>
                    </td>
                    <td className="p-3.5 text-center text-slate-600">{st.played}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-600">{st.won}</td>
                    <td className="p-3.5 text-center text-slate-400">{st.drawn}</td>
                    <td className="p-3.5 text-center text-rose-500">{st.lost}</td>
                    <td className="p-3.5 text-center font-black text-[#0d5c4d] text-sm">
                      {st.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: ONLINE ATHLETE REGISTRATION WIZARD (10-STEP MULTI-STEP FLOW)         */}
      {/* ========================================================================= */}
      {activeTab === "registration" && (
        <SportsRegistrationWizard
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
                  value={tournamentForm.sportName}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, sportName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                >
                  {sports.map((sp) => (
                    <option key={sp.id} value={sp.name}>{sp.name}</option>
                  ))}
                  <option value="Basketball">Basketball</option>
                  <option value="Football (Soccer)">Football (Soccer)</option>
                  <option value="Badminton">Badminton</option>
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
                placeholder="St. Michael High School, Trinity Central College, Royal Academy Colombo, Ananda College"
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
                  value={fixtureForm.sportName}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, sportName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none"
                >
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
                  placeholder="09:30 AM"
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
                placeholder="College Main Oval Grounds"
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
