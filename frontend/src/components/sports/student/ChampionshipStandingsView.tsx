"use client";

import { useMemo, useState } from "react";
import { Download, Printer, Search, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SportsStandingRecord } from "@/lib/api";

export function ChampionshipStandingsView({
  defaultStandings = [],
  status,
  onRetry,
}: {
  defaultStandings?: SportsStandingRecord[];
  status: "loading" | "ready" | "error";
  onRetry: () => Promise<void>;
}) {
  const [selectedSport, setSelectedSport] = useState("All sports");
  const [searchQuery, setSearchQuery] = useState("");

  const sports = useMemo(
    () => ["All sports", ...Array.from(new Set(defaultStandings.map((standing) => standing.sport)))],
    [defaultStandings],
  );
  const filteredStandings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return defaultStandings
      .filter((standing) => selectedSport === "All sports" || standing.sport === selectedSport)
      .filter(
        (standing) =>
          !query ||
          standing.teamName.toLowerCase().includes(query) ||
          standing.schoolName.toLowerCase().includes(query) ||
          standing.groupKey.toLowerCase().includes(query),
      )
      .sort((a, b) => a.groupKey.localeCompare(b.groupKey) || a.rank - b.rank);
  }, [defaultStandings, searchQuery, selectedSport]);

  const handleExport = () => {
    const rows = [
      ["Position", "Team", "School", "Sport", "Competition", "Played", "Won", "Drawn", "Lost", "For", "Against", "Difference", "Points"],
      ...filteredStandings.map((standing) => [
        standing.rank, standing.teamName, standing.schoolName, standing.sport,
        standing.groupKey, standing.played, standing.won, standing.drawn,
        standing.lost, standing.scoredFor, standing.scoredAgainst,
        standing.diffOrNrr, standing.points,
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => {
      const text = String(value);
      const safe = typeof value === "string" && /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""')}"`;
    }).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "league-standings.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-[#0d2b26]">
            <Trophy className="h-5 w-5 text-[#0d5c4d]" />
            League Standings
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Standings are calculated from completed fixture results. Wins earn 3 points and draws earn 1.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={status !== "ready" || filteredStandings.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={status !== "ready" || filteredStandings.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative">
          <span className="sr-only">Search teams, schools, or competitions</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search teams or competition"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm sm:w-64"
          />
        </label>
        <label>
          <span className="sr-only">Filter by sport</span>
          <select
            value={selectedSport}
            onChange={(event) => setSelectedSport(event.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            {sports.map((sport) => <option key={sport}>{sport}</option>)}
          </select>
        </label>
      </div>

      {status === "loading" ? (
        <p role="status" className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading standings...
        </p>
      ) : status === "error" ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-white p-10 text-center">
          <p className="font-bold text-slate-700">Unable to load standings</p>
          <p className="mt-1 text-sm text-slate-500">Check your connection and try again.</p>
          <button type="button" onClick={() => void onRetry()} className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
            Retry
          </button>
        </div>
      ) : filteredStandings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Trophy className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-bold text-slate-700">
            {defaultStandings.length === 0 ? "No standings available yet" : "No standings match your filters"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {defaultStandings.length === 0
              ? "Schedule fixtures and record completed match results to calculate league standings."
              : "Try a different search or sport."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#e6ece8] bg-white shadow-xs">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#f8faf9] text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="p-3 text-center">Pos</th>
                <th className="p-3">Team / Competition</th>
                <th className="p-3 text-center">P</th>
                <th className="p-3 text-center">W</th>
                <th className="p-3 text-center">D</th>
                <th className="p-3 text-center">L</th>
                <th className="p-3 text-center">For / Against</th>
                <th className="p-3 text-center">Diff</th>
                <th className="p-3 text-center">Form</th>
                <th className="p-3 text-center">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStandings.map((standing) => (
                <tr key={standing.id} className="hover:bg-slate-50">
                  <td className="p-3 text-center font-black">{standing.rank}</td>
                  <td className="p-3">
                    <p className="font-bold text-slate-800">{standing.teamName}</p>
                    <p className="text-xs text-slate-500">{standing.groupKey}</p>
                  </td>
                  <td className="p-3 text-center">{standing.played}</td>
                  <td className="p-3 text-center text-emerald-700">{standing.won}</td>
                  <td className="p-3 text-center">{standing.drawn}</td>
                  <td className="p-3 text-center text-rose-600">{standing.lost}</td>
                  <td className="p-3 text-center">{standing.scoredFor} / {standing.scoredAgainst}</td>
                  <td className="p-3 text-center">{standing.diffOrNrr}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1">
                      {standing.form.map((result, index) => (
                        <Badge
                          key={`${standing.id}-${index}`}
                          variant={result === "W" ? "success" : result === "L" ? "destructive" : "outline"}
                        >
                          {result}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center font-black text-[#0d5c4d]">{standing.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
