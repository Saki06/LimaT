"use client";

import React, { useMemo, useState } from "react";
import { Calendar, Clock, MapPin, Search, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fixture } from "@/types/lms";

export type MatchStatusFilter = "all" | "live" | "upcoming" | "completed";

const statusLabels: Record<Fixture["status"], string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
};

export function MatchCenterFixturesView({
  defaultFixtures = [],
  isAdminOrTeacher = false,
  onScheduleNewFixture,
  onRecordScore,
}: {
  defaultFixtures?: Fixture[];
  isAdminOrTeacher?: boolean;
  onScheduleNewFixture?: () => void;
  onRecordScore?: (fixtureId: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<MatchStatusFilter>("all");
  const [selectedSport, setSelectedSport] = useState("All sports");
  const [searchQuery, setSearchQuery] = useState("");

  const sportOptions = useMemo(
    () => ["All sports", ...Array.from(new Set(defaultFixtures.map((fixture) => fixture.sportName)))],
    [defaultFixtures],
  );
  const visibleFixtures = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return [...defaultFixtures]
      .filter((fixture) => selectedSport === "All sports" || fixture.sportName === selectedSport)
      .filter((fixture) => {
        if (statusFilter === "live") return fixture.status === "in_progress";
        if (statusFilter === "upcoming") return fixture.status === "scheduled";
        if (statusFilter === "completed") return fixture.status === "completed";
        return true;
      })
      .filter((fixture) => {
        if (!query) return true;
        return [
          fixture.sportName,
          fixture.homeTeam,
          fixture.awayTeam,
          fixture.competitionName,
          fixture.venue,
        ].some((value) => value.toLowerCase().includes(query));
      })
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [defaultFixtures, searchQuery, selectedSport, statusFilter]);

  const counts = useMemo(
    () => ({
      all: defaultFixtures.length,
      live: defaultFixtures.filter((fixture) => fixture.status === "in_progress").length,
      upcoming: defaultFixtures.filter((fixture) => fixture.status === "scheduled").length,
      completed: defaultFixtures.filter((fixture) => fixture.status === "completed").length,
    }),
    [defaultFixtures],
  );

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-[#0d2b26]">
            <Trophy className="h-5 w-5 text-[#0d5c4d]" />
            Fixtures & Results
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Fixtures and scores saved for your school sports competitions.
          </p>
        </div>
        {isAdminOrTeacher && onScheduleNewFixture && (
          <Button onClick={onScheduleNewFixture}>Schedule fixture</Button>
        )}
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#e6ece8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {([
            ["all", "All", counts.all],
            ["live", "In progress", counts.live],
            ["upcoming", "Upcoming", counts.upcoming],
            ["completed", "Completed", counts.completed],
          ] as const).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`rounded-lg px-3 py-2 text-xs font-bold ${
                statusFilter === key
                  ? "bg-[#0d5c4d] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search fixtures"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm sm:w-56"
            />
          </label>
          <select
            value={selectedSport}
            onChange={(event) => setSelectedSport(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            {sportOptions.map((sport) => <option key={sport}>{sport}</option>)}
          </select>
        </div>
      </div>

      {visibleFixtures.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Calendar className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-bold text-slate-700">No fixtures found</p>
          <p className="mt-1 text-sm text-slate-500">
            {defaultFixtures.length === 0
              ? "Fixtures will appear here after they are scheduled."
              : "Try changing the filters or search terms."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {visibleFixtures.map((fixture) => (
            <article key={fixture.id} className="rounded-2xl border border-[#e6ece8] bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#0d5c4d]">
                    {fixture.competitionName}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{fixture.sportName}</p>
                </div>
                <Badge variant={fixture.status === "completed" ? "outline" : fixture.status === "in_progress" ? "destructive" : "secondary"}>
                  {statusLabels[fixture.status]}
                </Badge>
              </div>
              <div className="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                <p className="font-bold text-slate-800">{fixture.homeTeam}</p>
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-lg font-black text-[#0d2b26]">
                  {fixture.result ? `${fixture.result.homeScore} - ${fixture.result.awayScore}` : "vs"}
                </div>
                <p className="font-bold text-slate-800">{fixture.awayTeam}</p>
              </div>
              {fixture.result?.outcome && (
                <p className="mb-3 text-center text-xs text-slate-500">{fixture.result.outcome}</p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{fixture.date}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{fixture.time}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{fixture.venue}</span>
              </div>
              {isAdminOrTeacher && fixture.status !== "completed" && onRecordScore && (
                <div className="mt-3 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => onRecordScore(fixture.id)}>
                    Record result
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
