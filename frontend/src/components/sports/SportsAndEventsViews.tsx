"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Trophy,
  Calendar,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export function SportsAndEventsViews({ defaultTab = "sports" }: { defaultTab?: "sports" | "events" }) {
  const {
    sports,
    teams,
    fixtures,
    standings,
    events,
    currentRole,
    registerEvent,
    recordMatchResult,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<"sports" | "events">(defaultTab);
  const [selectedSport, setSelectedSport] = useState<string>("Cricket");
  const [selectedFixtureForScore, setSelectedFixtureForScore] = useState<string | null>(null);

  // Score recording modal states
  const [homeScore, setHomeScore] = useState("215/8 (50 ov)");
  const [awayScore, setAwayScore] = useState("198 all out");
  const [outcome, setOutcome] = useState("St. Michael Won by 17 runs");

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFixtureForScore) return;
    recordMatchResult(selectedFixtureForScore, homeScore, awayScore, outcome);
    setSelectedFixtureForScore(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Sports / Events Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6ece8]">
        <div>
          <h1 className="text-2xl font-black text-[#0d2b26]">
            {activeTab === "sports" ? t.sports.title : t.events.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === "sports"
              ? "Track school sports squads, match fixtures, league standings, and training schedules."
              : "Explore school-wide academic conferences, sports meets, and innovation summits."}
          </p>
        </div>

        {/* Segmented Switcher */}
        <div className="flex items-center bg-white border border-[#e6ece8] rounded-2xl p-1 shrink-0 shadow-2xs">
          <button
            onClick={() => setActiveTab("sports")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === "sports"
                ? "bg-[#0d5c4d] text-white shadow-xs"
                : "text-slate-600 hover:text-[#0d5c4d]"
            }`}
          >
            <Trophy className="h-4 w-4" />
            Sports Hub
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === "events"
                ? "bg-[#0d5c4d] text-white shadow-xs"
                : "text-slate-600 hover:text-[#0d5c4d]"
            }`}
          >
            <Calendar className="h-4 w-4" />
            School Events
          </button>
        </div>
      </div>

      {activeTab === "sports" ? (
        /* ================= Sports Hub ================= */
        <div className="space-y-6">
          {/* Sports Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {sports.map((sp) => (
              <button
                key={sp.id}
                onClick={() => setSelectedSport(sp.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSport === sp.name
                    ? "bg-[#0d5c4d] text-white shadow-xs"
                    : "bg-white text-slate-700 hover:text-[#0d5c4d] border border-[#e6ece8] shadow-2xs"
                }`}
              >
                {sp.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Teams & Roster (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2 px-1">
                <Users className="h-4 w-4 text-[#0d5c4d]" />
                Active Teams & Squads
              </h2>

              {teams
                .filter((tm) => tm.sportName === selectedSport || selectedSport === "Cricket")
                .map((team) => (
                  <Card key={team.id} className="border-[#e6ece8] bg-white shadow-xs overflow-hidden">
                    <CardHeader className="p-5 pb-2 border-b border-[#e6ece8]">
                      <div className="flex items-center justify-between">
                        <Badge variant="success">Active Squad</Badge>
                        <span className="text-xs text-slate-500 font-semibold">{team.playersCount} Players</span>
                      </div>
                      <CardTitle className="text-base font-black text-[#0d2b26] mt-1.5">
                        {team.name}
                      </CardTitle>
                      <p className="text-xs text-[#0d5c4d] font-bold">Head Coach: {team.coachName}</p>
                    </CardHeader>
                    <CardContent className="p-5 space-y-3.5">
                      <div className="p-3 rounded-xl bg-[#f8faf9] text-xs text-slate-700 border border-[#e6ece8]">
                        <p className="font-extrabold text-[#0d2b26] text-[10px] uppercase">
                          Weekly Training Schedule:
                        </p>
                        <p className="mt-1">{team.trainingSchedule}</p>
                      </div>

                      <div>
                        <p className="text-[11px] font-extrabold uppercase text-slate-500 mb-2">
                          Squad Roster:
                        </p>
                        <div className="space-y-1.5">
                          {team.players.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8faf9] text-xs text-slate-800"
                            >
                              <span className="font-bold text-[#0d2b26]">{p.name}</span>
                              <span className="text-[11px] text-slate-500">{p.position}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Right: Fixtures & League Standings (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Fixtures Schedule */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-sky-700" />
                    Match Fixtures & Results
                  </h2>
                </div>

                <div className="space-y-3">
                  {fixtures.map((fix) => (
                    <div
                      key={fix.id}
                      className="p-5 rounded-2xl bg-white border border-[#e6ece8] shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-bold text-[#0d5c4d]">{fix.competitionName}</span>
                        <Badge
                          variant={fix.status === "completed" ? "success" : "warning"}
                        >
                          {fix.status === "completed" ? "Final Result" : "Upcoming"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-sm font-black text-[#0d2b26]">{fix.homeTeam}</p>
                          {fix.result && (
                            <p className="text-xs text-[#0d5c4d] font-mono font-bold mt-0.5">
                              {fix.result.homeScore}
                            </p>
                          )}
                        </div>

                        <span className="text-xs font-bold text-slate-500 bg-[#f8faf9] px-2.5 py-1 rounded-lg border border-[#e6ece8]">
                          VS
                        </span>

                        <div className="text-right">
                          <p className="text-sm font-black text-[#0d2b26]">{fix.awayTeam}</p>
                          {fix.result && (
                            <p className="text-xs text-slate-500 font-mono mt-0.5 font-bold">
                              {fix.result.awayScore}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-[#f0f4f1] text-[11px] text-slate-500">
                        <span>📍 {fix.venue}</span>
                        <span className="font-semibold">{fix.date} • {fix.time}</span>
                      </div>

                      {/* Result summary or coach action */}
                      {fix.result ? (
                        <div className="p-3 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] text-center text-xs text-[#0d5c4d] font-extrabold">
                          🏆 {fix.result.outcome}
                        </div>
                      ) : (
                        (currentRole === "teacher" || currentRole === "admin") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedFixtureForScore(fix.id)}
                            className="w-full text-xs border-[#c4e9e0] text-[#0d5c4d] font-bold hover:bg-[#ecf8f5]"
                          >
                            Record Match Result
                          </Button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Standings Table */}
              <div className="space-y-3">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2 px-1">
                  <Award className="h-4 w-4 text-[#b47a16]" />
                  Tournament Standings
                </h2>

                <div className="overflow-x-auto rounded-2xl border border-[#e6ece8] bg-white shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#e6ece8] bg-[#f8faf9] text-slate-500 uppercase text-[10px] font-bold">
                        <th className="p-3.5">Team</th>
                        <th className="p-3.5 text-center">P</th>
                        <th className="p-3.5 text-center">W</th>
                        <th className="p-3.5 text-center">D</th>
                        <th className="p-3.5 text-center">L</th>
                        <th className="p-3.5 text-center font-bold text-[#0d5c4d]">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e6ece8]">
                      {standings.map((row, idx) => (
                        <tr
                          key={row.id}
                          className={`hover:bg-[#f6f9f7] ${
                            idx === 0 ? "bg-[#ecf8f5]/40 font-bold text-[#0d2b26]" : "text-slate-700"
                          }`}
                        >
                          <td className="p-3.5 flex items-center gap-2.5">
                            <span className="font-mono text-slate-400 font-bold">{idx + 1}</span>
                            <span className="font-bold">{row.teamName}</span>
                          </td>
                          <td className="p-3.5 text-center">{row.played}</td>
                          <td className="p-3.5 text-center text-[#0d5c4d] font-bold">{row.won}</td>
                          <td className="p-3.5 text-center text-slate-500">{row.drawn}</td>
                          <td className="p-3.5 text-center text-rose-600">{row.lost}</td>
                          <td className="p-3.5 text-center font-black text-[#0d5c4d]">{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= School Events ================= */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => {
              const capacityPct = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));

              return (
                <Card
                  key={evt.id}
                  className="border-[#e6ece8] bg-white shadow-xs overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="p-4 bg-[#fef7e6] border-b border-[#fde4af] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#b47a16] uppercase tracking-wider">
                        {evt.date}
                      </span>
                      <Badge variant="warning" className="text-[10px] uppercase">
                        {evt.audience}
                      </Badge>
                    </div>

                    <CardContent className="p-6 space-y-3.5">
                      <CardTitle className="text-base font-black text-[#0d2b26] leading-snug">
                        {evt.title}
                      </CardTitle>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {evt.description}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-[#f0f4f1] text-xs text-slate-500">
                        <p className="flex items-center gap-1.5 font-medium">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {evt.time}
                        </p>
                        <p className="flex items-center gap-1.5 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {evt.venue}
                        </p>
                      </div>

                      {/* Capacity progress */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                          <span>Registrations</span>
                          <span>
                            {evt.registeredCount} / {evt.capacity} Seats ({capacityPct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[#eef3f0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0d5c4d] rounded-full transition-all"
                            style={{ width: `${capacityPct}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-6 pt-0">
                    <Button
                      onClick={() => registerEvent(evt.id)}
                      variant={evt.isRegisteredByCurrentUser ? "secondary" : "default"}
                      className={`w-full font-bold text-xs ${
                        evt.isRegisteredByCurrentUser
                          ? "bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0]"
                          : "bg-[#0d5c4d] hover:bg-[#083e34] text-white"
                      }`}
                    >
                      {evt.isRegisteredByCurrentUser ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1.5 text-[#0d5c4d]" />
                          RSVP Confirmed (Click to Cancel)
                        </>
                      ) : (
                        "Register / RSVP Now"
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Record Match Result */}
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
    </div>
  );
}
