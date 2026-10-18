"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Plus,
  Edit3,
  Search,
  Filter,
  CheckCircle2,
  Activity,
  Flame,
  Shield,
  Eye,
  ArrowRight,
  Sparkles,
  Info,
  ChevronRight,
  Zap,
  Medal,
  Users,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Fixture } from "@/types/lms";

// =============================================================================
// TYPES & DATA STRUCTURES: TEAM FIXTURES & INDIVIDUAL EVENT HEATS
// =============================================================================

export type MatchStatusFilter = "all" | "live" | "upcoming" | "completed";
export type EventTypeFilter = "all" | "team" | "individual";

export interface ExtendedMatchFixture extends Fixture {
  liveMinuteOrOver?: string;
  roundName?: string;
  homeDistrict?: string;
  awayDistrict?: string;
  homeColor?: string;
  awayColor?: string;
  scorersOrSummary?: string;
  pitchReferee?: string;
}

export interface IndividualAthleteParticipant {
  laneOrRank: number;
  athleteName: string;
  schoolName: string;
  district: string;
  schoolColor?: string;
  timingOrResult?: string;
  isWinnerOrMedal?: "gold" | "silver" | "bronze";
  recordTag?: string;
}

export interface IndividualEventSchedule {
  id: string;
  isIndividual: true;
  sportName: "Athletics" | "Swimming" | "Badminton";
  competitionName: string;
  eventName: string; // e.g. "100m Sprint U18 Boys (Grand Final)"
  division: string; // "Under-18", "Under-16", "Open"
  gender: "Boys" | "Girls" | "Mixed";
  date: string;
  time: string;
  venue: string;
  status: "scheduled" | "in_progress" | "completed";
  liveStatusText?: string;
  participants: IndividualAthleteParticipant[];
  outcomeSummary?: string;
  certifiedRecord?: string;
  chiefJudge?: string;
}

// Helper to get initials
function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
}

// =============================================================================
// MOCK DATA: TEAM TOURNAMENT FIXTURES
// =============================================================================

export const ENRICHED_CHAMPIONSHIP_FIXTURES: ExtendedMatchFixture[] = [
  // 1. 🔴 LIVE MATCH: Football U18 Grand Clash
  {
    id: "fix_live_01",
    teamId: "tm_fb_01",
    sportName: "Football",
    competitionName: "Inter-School Provincial Championship Cup",
    roundName: "Super 8 Knockout",
    homeTeam: "St. Michael's Batticaloa",
    awayTeam: "St. Patrick's Jaffna",
    homeDistrict: "Batticaloa",
    awayDistrict: "Jaffna",
    homeColor: "bg-emerald-700 text-white",
    awayColor: "bg-green-700 text-white",
    date: new Date().toISOString().substring(0, 10), // Today
    time: "03:30 PM",
    venue: "Weber Stadium, Batticaloa",
    status: "in_progress",
    liveMinuteOrOver: "68' Min (2nd Half)",
    scorersOrSummary: "⚽ Goals: K. Thanujan 24', M. Rizwan 58' | S. Mithun 41'",
    pitchReferee: "Chief Referee: K. Sellathurai (FIFA Certified)",
    result: {
      homeScore: "2",
      awayScore: "1",
      outcome: "St. Michael's leads 2 - 1 with 22 minutes remaining",
      recordedAt: new Date().toISOString()
    }
  },

  // 2. 🔴 LIVE MATCH: Cricket Super League
  {
    id: "fix_live_02",
    teamId: "tm_ck_01",
    sportName: "Cricket",
    competitionName: "All-Island Inter-Academy Super League 2026",
    roundName: "Group Stage • 50 Overs",
    homeTeam: "Jaffna Central Invincibles",
    awayTeam: "St. John's Academy",
    homeDistrict: "Jaffna",
    awayDistrict: "Jaffna",
    homeColor: "bg-blue-700 text-white",
    awayColor: "bg-sky-700 text-white",
    date: new Date().toISOString().substring(0, 10), // Today
    time: "09:30 AM",
    venue: "Jaffna Central College Oval",
    status: "in_progress",
    liveMinuteOrOver: "36.4 Overs (2nd Innings)",
    scorersOrSummary: "🏏 Target 220: Jaffna Central 182/4 (Need 38 runs from 80 balls)",
    pitchReferee: "Umpires: T. Vasanthan & R. Dharmasena",
    result: {
      homeScore: "182/4 (36.4 ov)",
      awayScore: "219 all out (48.1 ov)",
      outcome: "Jaffna Central requires 38 runs to win with 6 wickets in hand",
      recordedAt: new Date().toISOString()
    }
  },

  // 3. 🔴 LIVE MATCH: Basketball Championship
  {
    id: "fix_live_03",
    teamId: "tm_bb_01",
    sportName: "Basketball",
    competitionName: "All-Island Schools Basketball Challenge",
    roundName: "Semi-Final 1",
    homeTeam: "St. Michael's Cagers",
    awayTeam: "Royal Colombo Blue Cagers",
    homeDistrict: "Batticaloa",
    awayDistrict: "Colombo",
    homeColor: "bg-amber-600 text-white",
    awayColor: "bg-blue-600 text-white",
    date: new Date().toISOString().substring(0, 10), // Today
    time: "04:30 PM",
    venue: "Sugathadasa Indoor Stadium, Colombo",
    status: "in_progress",
    liveMinuteOrOver: "Q3 • 04:12",
    scorersOrSummary: "🏀 3-Pointers: A. Rizwan (3), K. Senula (2)",
    pitchReferee: "Lead Official: M. Jayawardena",
    result: {
      homeScore: "58",
      awayScore: "54",
      outcome: "Batticaloa holding a 4-point lead in the 3rd quarter",
      recordedAt: new Date().toISOString()
    }
  },

  // 4. ⏳ UPCOMING: Football
  {
    id: "fix_up_01",
    teamId: "tm_fb_02",
    sportName: "Football",
    competitionName: "Inter-School Provincial Championship Cup",
    roundName: "Semi-Final 2",
    homeTeam: "Hartley College Point Pedro",
    awayTeam: "St. Xavier's Boys' Mannar",
    homeDistrict: "Jaffna",
    awayDistrict: "Mannar",
    homeColor: "bg-purple-700 text-white",
    awayColor: "bg-indigo-700 text-white",
    date: new Date(Date.now() + 86400000).toISOString().substring(0, 10), // Tomorrow
    time: "03:45 PM",
    venue: "Hartley College Main Grounds, Point Pedro",
    status: "scheduled",
    liveMinuteOrOver: "Tomorrow",
    pitchReferee: "Referee: S. Thayananthan",
    scorersOrSummary: "Winner advances to the Grand Final on Sunday"
  },

  // 5. ⏳ UPCOMING: Cricket
  {
    id: "fix_up_02",
    teamId: "tm_ck_02",
    sportName: "Cricket",
    competitionName: "National Inter-School Challenge Trophy",
    roundName: "Quarter-Final",
    homeTeam: "Royal Titans Cricket Academy",
    awayTeam: "Trinity Lions 1st XI",
    homeDistrict: "Colombo",
    awayDistrict: "Kandy",
    homeColor: "bg-amber-600 text-white",
    awayColor: "bg-red-700 text-white",
    date: new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 10), // 2 days later
    time: "09:30 AM",
    venue: "Asgiriya Stadium, Kandy",
    status: "scheduled",
    liveMinuteOrOver: "This Weekend",
    pitchReferee: "Match Referee: Roshan Mahanama",
    scorersOrSummary: "Traditional Derby: 50 Overs White-Ball Showdown"
  },

  // 6. ⏳ UPCOMING: Volleyball
  {
    id: "fix_up_03",
    teamId: "tm_vb_01",
    sportName: "Volleyball",
    competitionName: "Provincial Schools Volleyball Trophy",
    roundName: "Gold Medal Final",
    homeTeam: "Hartley Point Spikers",
    awayTeam: "St. Xavier's Coastal Blockers",
    homeDistrict: "Jaffna",
    awayDistrict: "Mannar",
    homeColor: "bg-purple-700 text-white",
    awayColor: "bg-indigo-700 text-white",
    date: new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 10),
    time: "10:00 AM",
    venue: "Mannar District Sports Complex",
    status: "scheduled",
    liveMinuteOrOver: "Upcoming Final",
    scorersOrSummary: "Best of 5 sets championship showdown"
  },

  // 7. ✅ COMPLETED: Cricket
  {
    id: "fix_comp_01",
    teamId: "tm_ck_comp",
    sportName: "Cricket",
    competitionName: "Provincial Group Stage",
    roundName: "Round 5",
    homeTeam: "Royal Titans Cricket Academy",
    awayTeam: "Trinity Sports Academy",
    homeDistrict: "Colombo",
    awayDistrict: "Kandy",
    homeColor: "bg-amber-600 text-white",
    awayColor: "bg-red-700 text-white",
    date: "2026-10-08",
    time: "09:30 AM",
    venue: "Colombo Colts Grounds",
    status: "completed",
    scorersOrSummary: "Royal Titans: 248/6 (50 ov) | Trinity: 210 all out (46.2 ov)",
    pitchReferee: "Umpires: T. Dharmasena & R. Perera",
    result: {
      homeScore: "248/6 (50 ov)",
      awayScore: "210 all out (46.2 ov)",
      outcome: "Royal Titans Won by 38 runs",
      recordedAt: "2026-10-08 17:30"
    }
  },

  // 8. ✅ COMPLETED: Football
  {
    id: "fix_comp_02",
    teamId: "tm_fb_comp",
    sportName: "Football",
    competitionName: "Jaffna District Football Cup",
    roundName: "Quarter-Final",
    homeTeam: "St. Patrick's Emerald Lions",
    awayTeam: "Kilinochchi Central Warriors",
    homeDistrict: "Jaffna",
    awayDistrict: "Kilinochchi",
    homeColor: "bg-green-700 text-white",
    awayColor: "bg-teal-700 text-white",
    date: "2026-10-10",
    time: "04:00 PM",
    venue: "St. Patrick's College Stadium, Jaffna",
    status: "completed",
    scorersOrSummary: "⚽ Goals: T. Sharukshan 12', 64' | P. Nimalan 82'",
    pitchReferee: "Chief Referee: M. Selvarajah",
    result: {
      homeScore: "3",
      awayScore: "0",
      outcome: "St. Patrick's won 3 - 0 with clean sheet",
      recordedAt: "2026-10-10 18:00"
    }
  }
];

// =============================================================================
// MOCK DATA: INDIVIDUAL SPORTS HEATS & TRACK/FIELD SCHEDULES
// =============================================================================

export const ENRICHED_INDIVIDUAL_SCHEDULES: IndividualEventSchedule[] = [
  // 1. 🏃 COMPLETED: Athletics 100m Sprint U18 Boys Grand Final
  {
    id: "ind_ath_01",
    isIndividual: true,
    sportName: "Athletics",
    competitionName: "All-Island Inter-School Athletics Championship 2026",
    eventName: "100m Sprint - Under 18 Boys (Grand Final)",
    division: "Under-18",
    gender: "Boys",
    date: new Date().toISOString().substring(0, 10), // Today
    time: "10:30 AM",
    venue: "Jaffna Central Synthetic Track (Straight 100m)",
    status: "completed",
    outcomeSummary: "🥇 K. Thanujan wins Gold in 10.48s • New Championship Record!",
    certifiedRecord: "⚡ 10.48s (Wind: +1.2 m/s)",
    chiefJudge: "Chief Starter: M. Selvanathan • Electronic Timing System",
    participants: [
      {
        laneOrRank: 1,
        athleteName: "K. Thanujan",
        schoolName: "Jaffna Central College",
        district: "Jaffna",
        timingOrResult: "10.48s (Meet Record ⚡)",
        isWinnerOrMedal: "gold",
        recordTag: "🥇 Gold Medalist"
      },
      {
        laneOrRank: 2,
        athleteName: "M. Rizwan",
        schoolName: "St. Michael's College",
        district: "Batticaloa",
        timingOrResult: "10.62s",
        isWinnerOrMedal: "silver",
        recordTag: "🥈 Silver Medalist"
      },
      {
        laneOrRank: 3,
        athleteName: "S. Mithun",
        schoolName: "Hartley College (Point Pedro)",
        district: "Jaffna",
        timingOrResult: "10.74s",
        isWinnerOrMedal: "bronze",
        recordTag: "🥉 Bronze Medalist"
      },
      {
        laneOrRank: 4,
        athleteName: "R. Dhananjaya",
        schoolName: "Royal College, Colombo",
        district: "Colombo",
        timingOrResult: "10.85s"
      },
      {
        laneOrRank: 5,
        athleteName: "P. Sanjeewa",
        schoolName: "Trinity College, Kandy",
        district: "Kandy",
        timingOrResult: "10.96s"
      }
    ]
  },

  // 2. 🔴 LIVE: Athletics 400m Dash U18 Boys Heat 1
  {
    id: "ind_ath_02",
    isIndividual: true,
    sportName: "Athletics",
    competitionName: "Provincial Youth Track & Field Meet",
    eventName: "400m Dash - Under 18 Boys (Heat 1 of 3)",
    division: "Under-18",
    gender: "Boys",
    date: new Date().toISOString().substring(0, 10), // Today
    time: "04:15 PM",
    venue: "Sugathadasa Stadium Synthetic Track, Colombo",
    status: "in_progress",
    liveStatusText: "🔴 LIVE • Gun Fired (Final Bend 300m)",
    outcomeSummary: "Top 2 from this heat qualify directly for Grand Final.",
    chiefJudge: "Track Referee: T. Jayasekara",
    participants: [
      {
        laneOrRank: 3,
        athleteName: "A. Mohamed Akeel",
        schoolName: "St. Michael's College",
        district: "Batticaloa",
        timingOrResult: "Currently Leading"
      },
      {
        laneOrRank: 4,
        athleteName: "S. Vithusan",
        schoolName: "Hartley College (Point Pedro)",
        district: "Jaffna",
        timingOrResult: "2nd Position"
      },
      {
        laneOrRank: 5,
        athleteName: "D. Pathirana",
        schoolName: "Ananda College, Colombo",
        district: "Colombo",
        timingOrResult: "3rd Position"
      },
      {
        laneOrRank: 2,
        athleteName: "K. Pratheep",
        schoolName: "Jaffna Central College",
        district: "Jaffna",
        timingOrResult: "4th Position"
      }
    ]
  },

  // 3. 🏃 COMPLETED: Long Jump U18 Boys Final
  {
    id: "ind_ath_03",
    isIndividual: true,
    sportName: "Athletics",
    competitionName: "All-Island Inter-School Athletics Championship",
    eventName: "Long Jump - Under 18 Boys (Final Flight)",
    division: "Under-18",
    gender: "Boys",
    date: "2026-10-12",
    time: "09:00 AM",
    venue: "Jaffna Athletic Grounds • Sand Pit 1",
    status: "completed",
    outcomeSummary: "🥇 V. Aravindhan jumps 7.18m for Gold • Personal Best!",
    certifiedRecord: "7.18m (Jump 4 of 6)",
    chiefJudge: "Field Chief Judge: K. Thillainathan",
    participants: [
      {
        laneOrRank: 1,
        athleteName: "V. Aravindhan",
        schoolName: "Hartley College (Point Pedro)",
        district: "Jaffna",
        timingOrResult: "7.18m ⚡ Gold",
        isWinnerOrMedal: "gold",
        recordTag: "🥇 Gold Medalist"
      },
      {
        laneOrRank: 2,
        athleteName: "K. Pratheep",
        schoolName: "Jaffna Central College",
        district: "Jaffna",
        timingOrResult: "6.94m 🥈 Silver",
        isWinnerOrMedal: "silver",
        recordTag: "🥈 Silver Medalist"
      },
      {
        laneOrRank: 3,
        athleteName: "A. Mohamed Akeel",
        schoolName: "St. Michael's College",
        district: "Batticaloa",
        timingOrResult: "6.81m 🥉 Bronze",
        isWinnerOrMedal: "bronze",
        recordTag: "🥉 Bronze Medalist"
      }
    ]
  },

  // 4. ⏳ UPCOMING: Athletics Javelin Throw U18 Boys Final
  {
    id: "ind_ath_04",
    isIndividual: true,
    sportName: "Athletics",
    competitionName: "All-Island Schools Athletics Meet 2026",
    eventName: "Javelin Throw - Under 18 Boys (Grand Final)",
    division: "Under-18",
    gender: "Boys",
    date: new Date(Date.now() + 86400000).toISOString().substring(0, 10), // Tomorrow
    time: "08:30 AM",
    venue: "Weber Stadium Field, Batticaloa",
    status: "scheduled",
    outcomeSummary: "Call room opens at 07:45 AM. 8 provincial finalists competing.",
    chiefJudge: "Throws Marshal: S. Selvarajah",
    participants: [
      {
        laneOrRank: 1,
        athleteName: "T. Sharukshan",
        schoolName: "St. Patrick's College, Jaffna",
        district: "Jaffna",
        timingOrResult: "Order #1 (Seed 64.25m)"
      },
      {
        laneOrRank: 2,
        athleteName: "N. Danushka",
        schoolName: "Royal College, Colombo",
        district: "Colombo",
        timingOrResult: "Order #2 (Seed 61.80m)"
      },
      {
        laneOrRank: 3,
        athleteName: "G. Kirushan",
        schoolName: "Kilinochchi Central College",
        district: "Kilinochchi",
        timingOrResult: "Order #3 (Seed 59.40m)"
      },
      {
        laneOrRank: 4,
        athleteName: "K. Vimalan",
        schoolName: "St. Xavier's Boys' Mannar",
        district: "Mannar",
        timingOrResult: "Order #4"
      }
    ]
  },

  // 5. 🏊 COMPLETED: Swimming 50m Freestyle Open Boys Final
  {
    id: "ind_sw_01",
    isIndividual: true,
    sportName: "Swimming",
    competitionName: "National Schools Aquatics Championship 2026",
    eventName: "50m Freestyle Swimming - Open Boys (Grand Final)",
    division: "Open",
    gender: "Boys",
    date: "2026-10-14",
    time: "11:00 AM",
    venue: "Sugathadasa Indoor Aquatics 50m Pool, Colombo",
    status: "completed",
    outcomeSummary: "🥇 Akash Wijeratne clocks 24.12s • New Meet Record!",
    certifiedRecord: "24.12s (Touch Pad Certified)",
    chiefJudge: "Aquatics Referee: Dr. C. Wickramasinghe",
    participants: [
      {
        laneOrRank: 1,
        athleteName: "Akash Wijeratne",
        schoolName: "Royal College, Colombo",
        district: "Colombo",
        timingOrResult: "24.12s ⚡ Meet Record",
        isWinnerOrMedal: "gold",
        recordTag: "🥇 Gold Medalist"
      },
      {
        laneOrRank: 2,
        athleteName: "Kavindu Tennakoon",
        schoolName: "Trinity College, Kandy",
        district: "Kandy",
        timingOrResult: "24.89s",
        isWinnerOrMedal: "silver",
        recordTag: "🥈 Silver Medalist"
      },
      {
        laneOrRank: 3,
        athleteName: "S. Ketheeswaran",
        schoolName: "St. Michael's College",
        district: "Batticaloa",
        timingOrResult: "25.30s",
        isWinnerOrMedal: "bronze",
        recordTag: "🥉 Bronze Medalist"
      },
      {
        laneOrRank: 4,
        athleteName: "M. Janagan",
        schoolName: "Jaffna Central College",
        district: "Jaffna",
        timingOrResult: "25.95s"
      }
    ]
  },

  // 6. 🏸 UPCOMING: Badminton Singles Championship Final
  {
    id: "ind_bad_01",
    isIndividual: true,
    sportName: "Badminton",
    competitionName: "All-Island Girls Badminton Championship 2026",
    eventName: "Badminton Singles - Under 18 Girls (Grand Final)",
    division: "Under-18",
    gender: "Girls",
    date: new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 10),
    time: "02:00 PM",
    venue: "Royal College Sports Complex Indoor Court 1",
    status: "scheduled",
    outcomeSummary: "Top seeded R. Bavithira vs S. Senuri Perera • Best of 3 sets",
    chiefJudge: "Tournament Umpire: K. Jayasuriya",
    participants: [
      {
        laneOrRank: 1,
        athleteName: "R. Bavithira",
        schoolName: "Vembadi Girls' High School",
        district: "Jaffna",
        timingOrResult: "Seed #1 (Undefeated)"
      },
      {
        laneOrRank: 2,
        athleteName: "S. Senuri Perera",
        schoolName: "Visakha Vidyalaya, Colombo",
        district: "Colombo",
        timingOrResult: "Seed #2 (Undefeated)"
      }
    ]
  }
];

// =============================================================================
// MAIN COMPONENT: MATCH CENTER FIXTURES VIEW (TEAMS & INDIVIDUAL SPORTS)
// =============================================================================

export function MatchCenterFixturesView({
  defaultFixtures = [],
  isAdminOrTeacher = false,
  onScheduleNewFixture,
  onRecordScore
}: {
  defaultFixtures?: Fixture[];
  isAdminOrTeacher?: boolean;
  onScheduleNewFixture?: () => void;
  onRecordScore?: (fixtureId: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<MatchStatusFilter>("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeFilter>("all");
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [inspectedMatch, setInspectedMatch] = useState<ExtendedMatchFixture | null>(null);
  const [inspectedIndividual, setInspectedIndividual] =
    useState<IndividualEventSchedule | null>(null);

  // Merge default team fixtures with mock fixtures
  const allTeamFixtures = useMemo<ExtendedMatchFixture[]>(() => {
    const map = new Map<string, ExtendedMatchFixture>();
    ENRICHED_CHAMPIONSHIP_FIXTURES.forEach((fx) => map.set(fx.id, fx));
    defaultFixtures.forEach((fx) => {
      if (map.has(fx.id)) {
        map.set(fx.id, { ...map.get(fx.id)!, ...fx });
      } else {
        map.set(fx.id, {
          ...fx,
          homeDistrict: "Local District",
          awayDistrict: "Local District",
          homeColor: "bg-[#0d5c4d] text-white",
          awayColor: "bg-slate-700 text-white"
        });
      }
    });
    return Array.from(map.values());
  }, [defaultFixtures]);

  // Combined counts for status
  const liveCount = useMemo(() => {
    const liveTeams = allTeamFixtures.filter((f) => f.status === "in_progress").length;
    const liveInd = ENRICHED_INDIVIDUAL_SCHEDULES.filter((e) => e.status === "in_progress").length;
    return liveTeams + liveInd;
  }, [allTeamFixtures]);

  const upcomingCount = useMemo(() => {
    const upTeams = allTeamFixtures.filter((f) => f.status === "scheduled").length;
    const upInd = ENRICHED_INDIVIDUAL_SCHEDULES.filter((e) => e.status === "scheduled").length;
    return upTeams + upInd;
  }, [allTeamFixtures]);

  const completedCount = useMemo(() => {
    const compTeams = allTeamFixtures.filter((f) => f.status === "completed").length;
    const compInd = ENRICHED_INDIVIDUAL_SCHEDULES.filter((e) => e.status === "completed").length;
    return compTeams + compInd;
  }, [allTeamFixtures]);

  const totalEventsCount = allTeamFixtures.length + ENRICHED_INDIVIDUAL_SCHEDULES.length;

  // Filtered team matches
  const filteredTeamMatches = useMemo(() => {
    if (eventTypeFilter === "individual") return [];

    return allTeamFixtures.filter((match) => {
      // Status filter
      if (statusFilter === "live" && match.status !== "in_progress") return false;
      if (statusFilter === "upcoming" && match.status !== "scheduled") return false;
      if (statusFilter === "completed" && match.status !== "completed") return false;

      // Sport filter
      if (
        selectedSport !== "All" &&
        match.sportName.toLowerCase() !== selectedSport.toLowerCase()
      ) {
        return false;
      }

      // Search query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchHome = match.homeTeam.toLowerCase().includes(q);
        const matchAway = match.awayTeam.toLowerCase().includes(q);
        const matchComp = match.competitionName.toLowerCase().includes(q);
        const matchVenue = match.venue.toLowerCase().includes(q);
        const matchSport = match.sportName.toLowerCase().includes(q);
        return matchHome || matchAway || matchComp || matchVenue || matchSport;
      }

      return true;
    });
  }, [allTeamFixtures, statusFilter, eventTypeFilter, selectedSport, searchQuery]);

  // Filtered individual event schedules
  const filteredIndividualEvents = useMemo(() => {
    if (eventTypeFilter === "team") return [];

    return ENRICHED_INDIVIDUAL_SCHEDULES.filter((ev) => {
      // Status filter
      if (statusFilter === "live" && ev.status !== "in_progress") return false;
      if (statusFilter === "upcoming" && ev.status !== "scheduled") return false;
      if (statusFilter === "completed" && ev.status !== "completed") return false;

      // Sport filter
      if (
        selectedSport !== "All" &&
        ev.sportName.toLowerCase() !== selectedSport.toLowerCase()
      ) {
        return false;
      }

      // Search query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchEvent = ev.eventName.toLowerCase().includes(q);
        const matchComp = ev.competitionName.toLowerCase().includes(q);
        const matchVenue = ev.venue.toLowerCase().includes(q);
        const matchSport = ev.sportName.toLowerCase().includes(q);
        const matchParticipant = ev.participants.some(
          (p) =>
            p.athleteName.toLowerCase().includes(q) ||
            p.schoolName.toLowerCase().includes(q) ||
            p.district.toLowerCase().includes(q)
        );
        return matchEvent || matchComp || matchVenue || matchSport || matchParticipant;
      }

      return true;
    });
  }, [statusFilter, eventTypeFilter, selectedSport, searchQuery]);

  const totalVisibleCount = filteredTeamMatches.length + filteredIndividualEvents.length;

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* MATCH STATUS TABS, SPORT PILLS & SEARCH CONTROLS                     */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-[#e6ece8] p-4 shadow-xs space-y-3">
        {/* Row 1: Status Switcher Tabs + Search Box */}
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-[#f0f4f2] pb-3">
          <div className="flex items-center gap-1.5 bg-[#f8faf9] p-1 rounded-xl border border-[#dce5e0]">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#0d5c4d]"
              }`}
            >
              All Events ({totalEventsCount})
            </button>
            <button
              onClick={() => setStatusFilter("live")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "live"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-rose-600 hover:bg-rose-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Live Now ({liveCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter("upcoming")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "upcoming"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#0d5c4d]"
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "completed"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#0d5c4d]"
              }`}
            >
              Results ({completedCount})
            </button>
          </div>

          {/* Search Box & Admin Schedule Button */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative min-w-[200px] flex-1">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search team, athlete, school, venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#f8faf9] border border-[#dce5e0] rounded-xl text-xs text-[#0d2b26] placeholder:text-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white"
              />
            </div>
            {isAdminOrTeacher && onScheduleNewFixture && (
              <Button
                onClick={onScheduleNewFixture}
                className="bg-[#0d5c4d] hover:bg-[#093e34] text-white font-bold text-xs h-8 px-3 rounded-xl shadow-xs shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Schedule</span>
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Event Type Switcher (All vs Team Matches vs Individual Events) */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Category:
            </span>
            <button
              onClick={() => setEventTypeFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                eventTypeFilter === "all"
                  ? "bg-[#0d2b26] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Formats
            </button>
            <button
              onClick={() => setEventTypeFilter("team")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                eventTypeFilter === "team"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Users className="h-3 w-3" />
              <span>Team Matches</span>
            </button>
            <button
              onClick={() => setEventTypeFilter("individual")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                eventTypeFilter === "individual"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <User className="h-3 w-3" />
              <span>Individual Track &amp; Field</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing {totalVisibleCount} events
          </span>
        </div>

        {/* Row 3: Sport Switcher Pills (Football, Cricket, Athletics, Swimming, etc.) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-[#f0f4f2]">
          {[
            { id: "All", label: "🏅 All Sports" },
            { id: "Football", label: "⚽ Football" },
            { id: "Cricket", label: "🏏 Cricket" },
            { id: "Athletics", label: "🏃 Athletics (Track & Field)" },
            { id: "Swimming", label: "🏊 Swimming" },
            { id: "Basketball", label: "🏀 Basketball" },
            { id: "Volleyball", label: "🏐 Volleyball" },
            { id: "Badminton", label: "🏸 Badminton" }
          ].map((sp) => (
            <button
              key={sp.id}
              onClick={() => setSelectedSport(sp.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                selectedSport.toLowerCase() === sp.id.toLowerCase()
                  ? "bg-[#ecf8f5] text-[#0d5c4d] border border-[#a5f3df] shadow-xs font-black"
                  : "bg-slate-50 text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
              }`}
            >
              <span>{sp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. EVENT CARDS LIST (TEAM FIXTURES & INDIVIDUAL HEATS)                */}
      {/* ===================================================================== */}
      <div className="space-y-4">
        {totalVisibleCount === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[#d6dfd9] space-y-2">
            <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Events Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No matches or heats match your current filter. Try selecting &ldquo;All Sports&rdquo; or clearing search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {/* ------------------------------------------------------------- */}
            {/* A. RENDER TEAM MATCHES                                         */}
            {/* ------------------------------------------------------------- */}
            {filteredTeamMatches.map((match) => {
              const isLive = match.status === "in_progress";
              const isCompleted = match.status === "completed";
              const isScheduled = match.status === "scheduled";

              return (
                <div
                  key={match.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                    isLive
                      ? "border-rose-300 ring-2 ring-rose-500/10"
                      : "border-[#e6ece8] hover:border-[#bde3d9]"
                  }`}
                >
                  {/* Top Meta Bar */}
                  <div
                    className={`px-4 py-2.5 flex items-center justify-between text-xs flex-wrap gap-2 ${
                      isLive
                        ? "bg-rose-50/70 border-b border-rose-100"
                        : "bg-[#f8faf9] border-b border-[#eef3f0]"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-[#0d2b26] flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-[#0d5c4d]" />
                        <span>{match.competitionName}</span>
                      </span>
                      {match.roundName && (
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                          {match.roundName}
                        </span>
                      )}
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {match.sportName}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {isLive && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] tracking-wide animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span>LIVE • {match.liveMinuteOrOver || "In Play"}</span>
                        </span>
                      )}

                      {isScheduled && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[10px]">
                          <Clock className="h-3 w-3 text-amber-600" />
                          <span>
                            {match.date} • {match.time}
                          </span>
                        </span>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Completed (FT)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Clean Horizontal Team Rows (FotMob / ESPN style) */}
                  <div className="p-4 sm:p-5 divide-y divide-[#f0f4f2]">
                    {/* Home Team Row */}
                    <div className="py-2.5 first:pt-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-xs shrink-0 ${
                            match.homeColor || "bg-[#0d5c4d] text-white"
                          }`}
                        >
                          {getInitials(match.homeTeam)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-sm text-[#0d2b26] truncate">
                            {match.homeTeam}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {match.homeDistrict || "School"}
                          </p>
                        </div>
                      </div>

                      {/* Home Score or Status */}
                      <div className="text-right shrink-0">
                        {match.result?.homeScore ? (
                          <span className="font-mono text-sm sm:text-base font-black text-[#0d2b26] bg-[#f8faf9] px-3 py-1 rounded-xl border border-[#dce5e0] inline-block whitespace-nowrap">
                            {match.result.homeScore}
                          </span>
                        ) : isScheduled ? (
                          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                            Home
                          </span>
                        ) : (
                          <span className="font-mono text-base font-bold text-slate-400">
                            -
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Away Team Row */}
                    <div className="py-2.5 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-xs shrink-0 ${
                            match.awayColor || "bg-slate-700 text-white"
                          }`}
                        >
                          {getInitials(match.awayTeam)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-sm text-[#0d2b26] truncate">
                            {match.awayTeam}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {match.awayDistrict || "School"}
                          </p>
                        </div>
                      </div>

                      {/* Away Score or Status */}
                      <div className="text-right shrink-0">
                        {match.result?.awayScore ? (
                          <span className="font-mono text-sm sm:text-base font-black text-[#0d2b26] bg-[#f8faf9] px-3 py-1 rounded-xl border border-[#dce5e0] inline-block whitespace-nowrap">
                            {match.result.awayScore}
                          </span>
                        ) : isScheduled ? (
                          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                            Away
                          </span>
                        ) : (
                          <span className="font-mono text-base font-bold text-slate-400">
                            -
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Outcome summary & venue strip */}
                  <div className="px-4 py-2.5 bg-[#fbfcfb] border-t border-[#eef3f0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      {match.result?.outcome ? (
                        <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-[11px]">
                          🏆 {match.result.outcome}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium text-[11px]">
                          Kick-off: {match.date} at {match.time}
                        </span>
                      )}

                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span className="truncate max-w-xs">{match.venue}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setInspectedMatch(match)}
                        className="font-bold text-[#0d5c4d] hover:text-[#083e34] flex items-center gap-1 cursor-pointer text-xs"
                      >
                        <span>Match Dossier</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>

                      {isAdminOrTeacher && onRecordScore && (
                        <Button
                          onClick={() => onRecordScore(match.id)}
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-[11px] font-bold border-[#0d5c4d] text-[#0d5c4d] hover:bg-[#ecf8f5] cursor-pointer"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          <span>{isCompleted ? "Edit Score" : "Record Score"}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ------------------------------------------------------------- */}
            {/* B. RENDER INDIVIDUAL SPORTS HEATS & TRACK/FIELD CALL-UPS       */}
            {/* ------------------------------------------------------------- */}
            {filteredIndividualEvents.map((event) => {
              const isLive = event.status === "in_progress";
              const isCompleted = event.status === "completed";
              const isScheduled = event.status === "scheduled";

              return (
                <div
                  key={event.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                    isLive
                      ? "border-rose-300 ring-2 ring-rose-500/10"
                      : "border-[#e6ece8] hover:border-[#bde3d9]"
                  }`}
                >
                  {/* Top Meta Bar */}
                  <div
                    className={`px-4 py-2.5 flex items-center justify-between text-xs flex-wrap gap-2 ${
                      isLive
                        ? "bg-rose-50/70 border-b border-rose-100"
                        : "bg-[#f8faf9] border-b border-[#eef3f0]"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-[#0d2b26] flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        <span>{event.eventName}</span>
                      </span>
                      <Badge className="bg-[#ecf8f5] text-[#0d5c4d] border-emerald-200 text-[10px] font-bold">
                        {event.sportName} • {event.division} ({event.gender})
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {isLive && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span>{event.liveStatusText || "LIVE ON TRACK"}</span>
                        </span>
                      )}

                      {isScheduled && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[10px]">
                          <Clock className="h-3 w-3 text-amber-600" />
                          <span>
                            {event.date} • {event.time}
                          </span>
                        </span>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Results Certified</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Athletes & Lane Draw Rows */}
                  <div className="p-4 sm:p-5 divide-y divide-[#f0f4f2]">
                    {event.participants.map((ath, idx) => (
                      <div
                        key={idx}
                        className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                              ath.isWinnerOrMedal === "gold"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : ath.isWinnerOrMedal === "silver"
                                ? "bg-slate-200 text-slate-800 border border-slate-300"
                                : ath.isWinnerOrMedal === "bronze"
                                ? "bg-orange-100 text-orange-900 border border-orange-300"
                                : "bg-slate-50 text-slate-500"
                            }`}
                          >
                            {ath.isWinnerOrMedal === "gold"
                              ? "🥇"
                              : ath.isWinnerOrMedal === "silver"
                              ? "🥈"
                              : ath.isWinnerOrMedal === "bronze"
                              ? "🥉"
                              : ath.laneOrRank}
                          </span>
                          <div className="min-w-0">
                            <p className="font-extrabold text-sm text-[#0d2b26] flex items-center gap-1.5 truncate">
                              <span>{ath.athleteName}</span>
                              {ath.recordTag && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  {ath.recordTag}
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {ath.schoolName} • {ath.district}
                            </p>
                          </div>
                        </div>

                        {/* Timing / Result or Lane status */}
                        <div className="text-right shrink-0">
                          {ath.timingOrResult ? (
                            <span className="font-mono text-sm sm:text-base font-black text-[#0d2b26] bg-[#f8faf9] px-3 py-1 rounded-xl border border-[#dce5e0] inline-block whitespace-nowrap">
                              {ath.timingOrResult}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                              Lane {ath.laneOrRank}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Outcome summary & venue strip */}
                  <div className="px-4 py-2.5 bg-[#fbfcfb] border-t border-[#eef3f0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      {event.outcomeSummary && (
                        <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-[11px]">
                          🏆 {event.outcomeSummary}
                        </span>
                      )}
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span className="truncate max-w-xs">{event.venue}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setInspectedIndividual(event)}
                        className="font-bold text-[#0d5c4d] hover:text-[#083e34] flex items-center gap-1 cursor-pointer text-xs"
                      >
                        <span>Event Dossier</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 4. MODAL: TEAM MATCH DOSSIER DETAILS                                  */}
      {/* ===================================================================== */}
      {inspectedMatch && (
        <Modal
          isOpen={true}
          onClose={() => setInspectedMatch(null)}
          title={`Match Dossier: ${inspectedMatch.homeTeam} vs ${inspectedMatch.awayTeam}`}
        >
          <div className="space-y-4 text-xs">
            {/* Header */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d2b26] to-[#0a4539] text-white">
              <div className="flex items-center justify-between text-[11px]">
                <Badge className="bg-amber-400 text-[#0d2b26] font-black">
                  {inspectedMatch.sportName} • {inspectedMatch.competitionName}
                </Badge>
                <span className="font-semibold text-emerald-200">
                  {inspectedMatch.status === "in_progress"
                    ? "🔴 LIVE IN PLAY"
                    : inspectedMatch.status === "completed"
                    ? "MATCH COMPLETED"
                    : "SCHEDULED FIXTURE"}
                </span>
              </div>

              {/* Clean Horizontal Team Rows inside modal */}
              <div className="py-3 space-y-2">
                <div className="flex items-center justify-between gap-3 bg-white/10 p-2.5 px-3 rounded-xl border border-white/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                      {getInitials(inspectedMatch.homeTeam)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{inspectedMatch.homeTeam}</p>
                      <p className="text-[10px] text-emerald-200">{inspectedMatch.homeDistrict}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-black text-amber-300 whitespace-nowrap">
                    {inspectedMatch.result?.homeScore ||
                      (inspectedMatch.status === "scheduled" ? "Upcoming" : "-")}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-white/10 p-2.5 px-3 rounded-xl border border-white/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                      {getInitials(inspectedMatch.awayTeam)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{inspectedMatch.awayTeam}</p>
                      <p className="text-[10px] text-emerald-200">{inspectedMatch.awayDistrict}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-black text-amber-300 whitespace-nowrap">
                    {inspectedMatch.result?.awayScore ||
                      (inspectedMatch.status === "scheduled" ? "Upcoming" : "-")}
                  </span>
                </div>
              </div>
            </div>

            {/* Stadium & Time Details */}
            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Date &amp; Kick-off</p>
                <p className="font-bold text-[#0d2b26]">
                  {inspectedMatch.date} • {inspectedMatch.time}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Stadium Venue</p>
                <p className="font-bold text-[#0d2b26]">{inspectedMatch.venue}</p>
              </div>
            </div>

            {/* Officials & Pitch */}
            {inspectedMatch.pitchReferee && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Technical Officials</p>
                <p className="font-semibold text-slate-800">{inspectedMatch.pitchReferee}</p>
              </div>
            )}

            {/* Match Outcome / Highlights */}
            {inspectedMatch.result && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                <p className="text-[10px] text-emerald-700 font-bold uppercase">Official Outcome</p>
                <p className="font-extrabold text-sm text-[#0d5c4d]">
                  {inspectedMatch.result.outcome}
                </p>
                <p className="text-[10px] text-slate-400">
                  Certified at: {inspectedMatch.result.recordedAt}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setInspectedMatch(null)}
                className="cursor-pointer"
              >
                Close Match Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===================================================================== */}
      {/* 5. MODAL: INDIVIDUAL EVENT DOSSIER DETAILS                            */}
      {/* ===================================================================== */}
      {inspectedIndividual && (
        <Modal
          isOpen={true}
          onClose={() => setInspectedIndividual(null)}
          title={`Individual Event Dossier: ${inspectedIndividual.eventName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d2b26] to-[#0a4539] text-white space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-400 text-[#0d2b26] font-black">
                  {inspectedIndividual.sportName} • {inspectedIndividual.division}
                </Badge>
                <span className="text-emerald-200 font-bold">
                  {inspectedIndividual.status === "completed"
                    ? "RESULTS CERTIFIED"
                    : inspectedIndividual.status === "in_progress"
                    ? "🔴 LIVE IN ACTION"
                    : "SCHEDULED HEAT"}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                {inspectedIndividual.eventName}
              </h3>
              <p className="text-xs text-emerald-100">
                {inspectedIndividual.competitionName}
              </p>
            </div>

            {/* Venue & Time */}
            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Scheduled Time</p>
                <p className="font-bold text-[#0d2b26]">
                  {inspectedIndividual.date} at {inspectedIndividual.time}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Track / Pit Venue</p>
                <p className="font-bold text-[#0d2b26]">{inspectedIndividual.venue}</p>
              </div>
            </div>

            {/* Full Participants List */}
            <div className="space-y-2">
              <p className="font-bold text-slate-800">
                Athletes &amp; Official Results / Call Order:
              </p>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {inspectedIndividual.participants.map((p, i) => (
                  <div
                    key={i}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-700">
                        {p.isWinnerOrMedal === "gold"
                          ? "🥇"
                          : p.isWinnerOrMedal === "silver"
                          ? "🥈"
                          : p.isWinnerOrMedal === "bronze"
                          ? "🥉"
                          : p.laneOrRank}
                      </span>
                      <div>
                        <p className="font-bold text-[#0d2b26]">{p.athleteName}</p>
                        <p className="text-[10px] text-slate-400">
                          {p.schoolName} ({p.district})
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {p.timingOrResult || `Lane ${p.laneOrRank}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {inspectedIndividual.chiefJudge && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
                {inspectedIndividual.chiefJudge}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setInspectedIndividual(null)}
                className="cursor-pointer"
              >
                Close Event Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
