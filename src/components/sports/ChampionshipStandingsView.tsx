"use client";

import React, { useState, useMemo } from "react";
import {
  Trophy,
  Award,
  Medal,
  Flame,
  Zap,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  Shield,
  Star,
  Users,
  Target,
  Clock,
  Sparkles,
  MapPin,
  ExternalLink,
  CheckCircle2,
  XCircle,
  MinusCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Standing, Tournament, Fixture } from "@/types/lms";

// =============================================================================
// TYPES & INTERFACES FOR MULTI-SPORT TOURNAMENT STANDINGS
// =============================================================================

export type SportCategoryFilter =
  | "all_medals"
  | "football"
  | "cricket"
  | "athletics"
  | "basketball"
  | "volleyball"
  | "badminton"
  | "swimming";

export interface SchoolMedalStanding {
  id: string;
  rank: number;
  schoolName: string;
  district: string;
  province: string;
  gold: number;
  silver: number;
  bronze: number;
  totalMedals: number;
  championshipPoints: number; // Gold=5, Silver=3, Bronze=1
  dominantSports: string[];
  crestColor: string;
  recentRecord?: string;
}

export interface TeamLeagueEntry {
  id: string;
  rank: number;
  teamName: string;
  schoolName: string;
  sport: "football" | "cricket" | "basketball" | "volleyball";
  division: "Under-18" | "Under-16" | "Open";
  played: number;
  won: number;
  drawn: number;
  lost: number;
  scoredFor: number; // Goals / Runs / Points
  scoredAgainst: number;
  diffOrNrr: string; // "+12" or "+1.854" NRR
  points: number;
  form: ("W" | "D" | "L")[];
  statusText: string;
  statusType: "qualified" | "playoff" | "neutral" | "danger";
}

export interface IndividualEventAthlete {
  id: string;
  rank: number;
  athleteName: string;
  gender: "Boys" | "Girls";
  ageGroup: "U16" | "U18" | "Open";
  sport: "athletics" | "badminton" | "swimming";
  eventName: string;
  schoolName: string;
  district: string;
  timingOrScore: string;
  recordTag?: string; // "⚡ New Meet Record", "National Qualifier"
  medal: "gold" | "silver" | "bronze" | "finalist";
  pointsAwarded: number;
}

// =============================================================================
// MOCK DATA: SRI LANKA INTER-SCHOOL / ACADEMY CHAMPIONSHIP STANDINGS
// =============================================================================

export const INITIAL_SCHOOL_MEDAL_TALLY: SchoolMedalStanding[] = [
  {
    id: "sch_01",
    rank: 1,
    schoolName: "Jaffna Central College",
    district: "Jaffna",
    province: "Northern Province",
    gold: 8,
    silver: 5,
    bronze: 4,
    totalMedals: 17,
    championshipPoints: 59,
    dominantSports: ["Athletics", "Cricket", "Volleyball"],
    crestColor: "bg-blue-600 text-white",
    recentRecord: "Overall Boys Track & Field Champions 2026"
  },
  {
    id: "sch_02",
    rank: 2,
    schoolName: "St. Michael's College, Batticaloa",
    district: "Batticaloa",
    province: "Eastern Province",
    gold: 7,
    silver: 4,
    bronze: 3,
    totalMedals: 14,
    championshipPoints: 50,
    dominantSports: ["Football", "Basketball", "Athletics"],
    crestColor: "bg-emerald-700 text-white",
    recentRecord: "Eastern Province Football Champions"
  },
  {
    id: "sch_03",
    rank: 3,
    schoolName: "Royal College, Colombo",
    district: "Colombo",
    province: "Western Province",
    gold: 6,
    silver: 6,
    bronze: 5,
    totalMedals: 17,
    championshipPoints: 53,
    dominantSports: ["Swimming", "Cricket", "Badminton"],
    crestColor: "bg-amber-600 text-white",
    recentRecord: "National Aquatics Relay Gold Holders"
  },
  {
    id: "sch_04",
    rank: 4,
    schoolName: "Trinity College, Kandy",
    district: "Kandy",
    province: "Central Province",
    gold: 5,
    silver: 4,
    bronze: 6,
    totalMedals: 15,
    championshipPoints: 43,
    dominantSports: ["Cricket", "Basketball", "Swimming"],
    crestColor: "bg-red-700 text-white",
    recentRecord: "Hill Country Cricket Trophy Finalists"
  },
  {
    id: "sch_05",
    rank: 5,
    schoolName: "Hartley College (Point Pedro)",
    district: "Jaffna",
    province: "Northern Province",
    gold: 4,
    silver: 5,
    bronze: 3,
    totalMedals: 12,
    championshipPoints: 38,
    dominantSports: ["Athletics", "Chess", "Volleyball"],
    crestColor: "bg-purple-700 text-white",
    recentRecord: "Northern Province Sprint Relay Record"
  },
  {
    id: "sch_06",
    rank: 6,
    schoolName: "St. Patrick's College, Jaffna",
    district: "Jaffna",
    province: "Northern Province",
    gold: 4,
    silver: 3,
    bronze: 4,
    totalMedals: 11,
    championshipPoints: 33,
    dominantSports: ["Football", "Athletics"],
    crestColor: "bg-green-700 text-white",
    recentRecord: "Jaffna District Football Cup Winners"
  },
  {
    id: "sch_07",
    rank: 7,
    schoolName: "Vembadi Girls' High School",
    district: "Jaffna",
    province: "Northern Province",
    gold: 4,
    silver: 2,
    bronze: 5,
    totalMedals: 11,
    championshipPoints: 31,
    dominantSports: ["Badminton", "Netball", "Athletics"],
    crestColor: "bg-rose-600 text-white",
    recentRecord: "Girls Provincial Badminton Champions"
  },
  {
    id: "sch_08",
    rank: 8,
    schoolName: "St. Xavier's Boys' College, Mannar",
    district: "Mannar",
    province: "Northern Province",
    gold: 3,
    silver: 2,
    bronze: 3,
    totalMedals: 8,
    championshipPoints: 24,
    dominantSports: ["Volleyball", "Football"],
    crestColor: "bg-indigo-700 text-white"
  },
  {
    id: "sch_09",
    rank: 9,
    schoolName: "Kilinochchi Central College",
    district: "Kilinochchi",
    province: "Northern Province",
    gold: 2,
    silver: 3,
    bronze: 2,
    totalMedals: 7,
    championshipPoints: 21,
    dominantSports: ["Athletics", "Kabaddi"],
    crestColor: "bg-teal-700 text-white"
  },
  {
    id: "sch_10",
    rank: 10,
    schoolName: "Carmel Fatima College, Kalmunai",
    district: "Ampara",
    province: "Eastern Province",
    gold: 2,
    silver: 2,
    bronze: 3,
    totalMedals: 7,
    championshipPoints: 19,
    dominantSports: ["Basketball", "Cricket"],
    crestColor: "bg-cyan-700 text-white"
  }
];

export const INITIAL_TEAM_LEAGUES: TeamLeagueEntry[] = [
  // ⚽ FOOTBALL - U18 & Open
  {
    id: "fb_01",
    rank: 1,
    teamName: "St. Michael's Batticaloa XI",
    schoolName: "St. Michael's College, Batticaloa",
    sport: "football",
    division: "Under-18",
    played: 6,
    won: 5,
    drawn: 1,
    lost: 0,
    scoredFor: 18,
    scoredAgainst: 3,
    diffOrNrr: "+15",
    points: 16,
    form: ["W", "W", "W", "D", "W"],
    statusText: "Semi-Finals Qualified ✓",
    statusType: "qualified"
  },
  {
    id: "fb_02",
    rank: 2,
    teamName: "St. Patrick's Emerald Lions",
    schoolName: "St. Patrick's College, Jaffna",
    sport: "football",
    division: "Under-18",
    played: 6,
    won: 4,
    drawn: 2,
    lost: 0,
    scoredFor: 14,
    scoredAgainst: 4,
    diffOrNrr: "+10",
    points: 14,
    form: ["W", "D", "W", "W", "D"],
    statusText: "Semi-Finals Qualified ✓",
    statusType: "qualified"
  },
  {
    id: "fb_03",
    rank: 3,
    teamName: "Jaffna Central Football Club",
    schoolName: "Jaffna Central College",
    sport: "football",
    division: "Under-18",
    played: 6,
    won: 3,
    drawn: 1,
    lost: 2,
    scoredFor: 11,
    scoredAgainst: 8,
    diffOrNrr: "+3",
    points: 10,
    form: ["L", "W", "W", "D", "W"],
    statusText: "Quarter-Finals Playoff",
    statusType: "playoff"
  },
  {
    id: "fb_04",
    rank: 4,
    teamName: "St. Xavier's Coastal Strikers",
    schoolName: "St. Xavier's Boys' College, Mannar",
    sport: "football",
    division: "Under-18",
    played: 6,
    won: 2,
    drawn: 1,
    lost: 3,
    scoredFor: 8,
    scoredAgainst: 11,
    diffOrNrr: "-3",
    points: 7,
    form: ["W", "L", "D", "L", "W"],
    statusText: "Quarter-Finals Playoff",
    statusType: "playoff"
  },
  {
    id: "fb_05",
    rank: 5,
    teamName: "Methodist Central Tigers",
    schoolName: "Methodist Central College, Batticaloa",
    sport: "football",
    division: "Under-18",
    played: 6,
    won: 1,
    drawn: 1,
    lost: 4,
    scoredFor: 5,
    scoredAgainst: 14,
    diffOrNrr: "-9",
    points: 4,
    form: ["L", "D", "L", "W", "L"],
    statusText: "Group Stage Exit",
    statusType: "danger"
  },
  {
    id: "fb_06",
    rank: 6,
    teamName: "Kilinochchi Central Warriors",
    schoolName: "Kilinochchi Central College",
    sport: "football",
    division: "Under-18",
    played: 6,
    won: 0,
    drawn: 1,
    lost: 5,
    scoredFor: 3,
    scoredAgainst: 19,
    diffOrNrr: "-16",
    points: 1,
    form: ["L", "L", "L", "D", "L"],
    statusText: "Group Stage Exit",
    statusType: "danger"
  },

  // 🏏 CRICKET - U18 Super League
  {
    id: "ck_01",
    rank: 1,
    teamName: "Royal Titans Cricket Academy",
    schoolName: "Royal College, Colombo",
    sport: "cricket",
    division: "Under-18",
    played: 5,
    won: 5,
    drawn: 0,
    lost: 0,
    scoredFor: 1240,
    scoredAgainst: 890,
    diffOrNrr: "+2.140",
    points: 25,
    form: ["W", "W", "W", "W", "W"],
    statusText: "Finalists Qualified ✓",
    statusType: "qualified"
  },
  {
    id: "ck_02",
    rank: 2,
    teamName: "Trinity Lions 1st XI",
    schoolName: "Trinity College, Kandy",
    sport: "cricket",
    division: "Under-18",
    played: 5,
    won: 4,
    drawn: 0,
    lost: 1,
    scoredFor: 1180,
    scoredAgainst: 920,
    diffOrNrr: "+1.650",
    points: 20,
    form: ["W", "W", "L", "W", "W"],
    statusText: "Finalists Qualified ✓",
    statusType: "qualified"
  },
  {
    id: "ck_03",
    rank: 3,
    teamName: "Jaffna Central Invincibles",
    schoolName: "Jaffna Central College",
    sport: "cricket",
    division: "Under-18",
    played: 5,
    won: 3,
    drawn: 0,
    lost: 2,
    scoredFor: 1040,
    scoredAgainst: 980,
    diffOrNrr: "+0.450",
    points: 15,
    form: ["W", "L", "W", "W", "L"],
    statusText: "Semi-Finals Contender",
    statusType: "playoff"
  },
  {
    id: "ck_04",
    rank: 4,
    teamName: "St. John's Academy XI",
    schoolName: "St. John's College, Jaffna",
    sport: "cricket",
    division: "Under-18",
    played: 5,
    won: 2,
    drawn: 0,
    lost: 3,
    scoredFor: 910,
    scoredAgainst: 1020,
    diffOrNrr: "-0.550",
    points: 10,
    form: ["L", "W", "L", "L", "W"],
    statusText: "Semi-Finals Contender",
    statusType: "playoff"
  },
  {
    id: "ck_05",
    rank: 5,
    teamName: "Hartley College Point Mariners",
    schoolName: "Hartley College (Point Pedro)",
    sport: "cricket",
    division: "Under-18",
    played: 5,
    won: 1,
    drawn: 0,
    lost: 4,
    scoredFor: 840,
    scoredAgainst: 1110,
    diffOrNrr: "-1.320",
    points: 5,
    form: ["L", "L", "W", "L", "L"],
    statusText: "Eliminated",
    statusType: "danger"
  },

  // 🏀 BASKETBALL - Inter-School Trophy
  {
    id: "bb_01",
    rank: 1,
    teamName: "St. Michael's Cagers",
    schoolName: "St. Michael's College, Batticaloa",
    sport: "basketball",
    division: "Under-18",
    played: 4,
    won: 4,
    drawn: 0,
    lost: 0,
    scoredFor: 312,
    scoredAgainst: 220,
    diffOrNrr: "+92",
    points: 12,
    form: ["W", "W", "W", "W"],
    statusText: "Grand Finalist ✓",
    statusType: "qualified"
  },
  {
    id: "bb_02",
    rank: 2,
    teamName: "Royal Colombo Blue Cagers",
    schoolName: "Royal College, Colombo",
    sport: "basketball",
    division: "Under-18",
    played: 4,
    won: 3,
    drawn: 0,
    lost: 1,
    scoredFor: 288,
    scoredAgainst: 240,
    diffOrNrr: "+48",
    points: 9,
    form: ["W", "W", "L", "W"],
    statusText: "Grand Finalist ✓",
    statusType: "qualified"
  },
  {
    id: "bb_03",
    rank: 3,
    teamName: "Trinity Hill Dunkers",
    schoolName: "Trinity College, Kandy",
    sport: "basketball",
    division: "Under-18",
    played: 4,
    won: 1,
    drawn: 0,
    lost: 3,
    scoredFor: 235,
    scoredAgainst: 280,
    diffOrNrr: "-45",
    points: 3,
    form: ["L", "L", "W", "L"],
    statusText: "3rd Place Playoff",
    statusType: "neutral"
  },
  {
    id: "bb_04",
    rank: 4,
    teamName: "Jaffna Hindu Phoenix",
    schoolName: "Jaffna Hindu College",
    sport: "basketball",
    division: "Under-18",
    played: 4,
    won: 0,
    drawn: 0,
    lost: 4,
    scoredFor: 205,
    scoredAgainst: 300,
    diffOrNrr: "-95",
    points: 0,
    form: ["L", "L", "L", "L"],
    statusText: "3rd Place Playoff",
    statusType: "neutral"
  },

  // 🏐 VOLLEYBALL - All-Island Cup
  {
    id: "vb_01",
    rank: 1,
    teamName: "Hartley Point Spikers",
    schoolName: "Hartley College (Point Pedro)",
    sport: "volleyball",
    division: "Under-18",
    played: 4,
    won: 4,
    drawn: 0,
    lost: 0,
    scoredFor: 12, // sets won
    scoredAgainst: 2, // sets lost
    diffOrNrr: "+10 Sets",
    points: 12,
    form: ["W", "W", "W", "W"],
    statusText: "Finalists Qualified ✓",
    statusType: "qualified"
  },
  {
    id: "vb_02",
    rank: 2,
    teamName: "St. Xavier's Coastal Blockers",
    schoolName: "St. Xavier's Boys' College, Mannar",
    sport: "volleyball",
    division: "Under-18",
    played: 4,
    won: 3,
    drawn: 0,
    lost: 1,
    scoredFor: 10,
    scoredAgainst: 5,
    diffOrNrr: "+5 Sets",
    points: 9,
    form: ["W", "W", "L", "W"],
    statusText: "Finalists Qualified ✓",
    statusType: "qualified"
  },
  {
    id: "vb_03",
    rank: 3,
    teamName: "Jaffna Central Smashers",
    schoolName: "Jaffna Central College",
    sport: "volleyball",
    division: "Under-18",
    played: 4,
    won: 1,
    drawn: 0,
    lost: 3,
    scoredFor: 6,
    scoredAgainst: 9,
    diffOrNrr: "-3 Sets",
    points: 3,
    form: ["L", "L", "W", "L"],
    statusText: "Bronze Contender",
    statusType: "neutral"
  },
  {
    id: "vb_04",
    rank: 4,
    teamName: "Kilinochchi Spikers",
    schoolName: "Kilinochchi Central College",
    sport: "volleyball",
    division: "Under-18",
    played: 4,
    won: 0,
    drawn: 0,
    lost: 4,
    scoredFor: 1,
    scoredAgainst: 12,
    diffOrNrr: "-11 Sets",
    points: 0,
    form: ["L", "L", "L", "L"],
    statusText: "Eliminated",
    statusType: "danger"
  }
];

export const INITIAL_INDIVIDUAL_LEADERBOARDS: IndividualEventAthlete[] = [
  // 🏃 ATHLETICS - 100m Sprint U18 Boys
  {
    id: "ath_01",
    rank: 1,
    athleteName: "K. Thanujan",
    gender: "Boys",
    ageGroup: "U18",
    sport: "athletics",
    eventName: "100m Sprint",
    schoolName: "Jaffna Central College",
    district: "Jaffna",
    timingOrScore: "10.48s",
    recordTag: "⚡ Championship Record",
    medal: "gold",
    pointsAwarded: 5
  },
  {
    id: "ath_02",
    rank: 2,
    athleteName: "M. Rizwan",
    gender: "Boys",
    ageGroup: "U18",
    sport: "athletics",
    eventName: "100m Sprint",
    schoolName: "St. Michael's College, Batticaloa",
    district: "Batticaloa",
    timingOrScore: "10.62s",
    recordTag: "National Qualifying Standard",
    medal: "silver",
    pointsAwarded: 3
  },
  {
    id: "ath_03",
    rank: 3,
    athleteName: "S. Mithun",
    gender: "Boys",
    ageGroup: "U18",
    sport: "athletics",
    eventName: "100m Sprint",
    schoolName: "Hartley College (Point Pedro)",
    district: "Jaffna",
    timingOrScore: "10.74s",
    medal: "bronze",
    pointsAwarded: 1
  },
  {
    id: "ath_04",
    rank: 4,
    athleteName: "R. Dhananjaya",
    gender: "Boys",
    ageGroup: "U18",
    sport: "athletics",
    eventName: "100m Sprint",
    schoolName: "Royal College, Colombo",
    district: "Colombo",
    timingOrScore: "10.85s",
    medal: "finalist",
    pointsAwarded: 0
  },

  // 🏃 ATHLETICS - 200m Sprint U18 Boys
  {
    id: "ath_05",
    rank: 1,
    athleteName: "K. Thanujan",
    gender: "Boys",
    ageGroup: "U18",
    sport: "athletics",
    eventName: "200m Sprint",
    schoolName: "Jaffna Central College",
    district: "Jaffna",
    timingOrScore: "21.64s",
    recordTag: "Sprint Double Champion 🥇🥇",
    medal: "gold",
    pointsAwarded: 5
  },
  {
    id: "ath_06",
    rank: 2,
    athleteName: "S. Mithun",
    gender: "Boys",
    ageGroup: "U18",
    sport: "athletics",
    eventName: "200m Sprint",
    schoolName: "Hartley College (Point Pedro)",
    district: "Jaffna",
    timingOrScore: "21.98s",
    medal: "silver",
    pointsAwarded: 3
  },
  {
    id: "ath_07",
    rank: 3,
    athleteName: "P. Sanjeewa",
    gender: "Boys",
    ageGroup: "U18",
    sport: "athletics",
    eventName: "200m Sprint",
    schoolName: "Trinity College, Kandy",
    district: "Kandy",
    timingOrScore: "22.15s",
    medal: "bronze",
    pointsAwarded: 1
  },

  // 🏃 ATHLETICS - Long Jump U18 Boys
  {
    id: "ath_08",
    rank: 1,
    athleteName: "V. Aravindhan",
    gender: "Boys",
    ageGroup: "U18",
    sport: "athletics",
    eventName: "Long Jump",
    schoolName: "Hartley College (Point Pedro)",
    district: "Jaffna",
    timingOrScore: "7.18m",
    recordTag: "⚡ Meet Record Jump",
    medal: "gold",
    pointsAwarded: 5
  },
  {
    id: "ath_09",
    rank: 2,
    athleteName: "K. Pratheep",
    gender: "Boys",
    ageGroup: "U18",
    sport: "athletics",
    eventName: "Long Jump",
    schoolName: "Jaffna Central College",
    district: "Jaffna",
    timingOrScore: "6.94m",
    medal: "silver",
    pointsAwarded: 3
  },
  {
    id: "ath_10",
    rank: 3,
    athleteName: "A. Mohamed Akeel",
    gender: "Boys",
    ageGroup: "U18",
    sport: "athletics",
    eventName: "Long Jump",
    schoolName: "St. Michael's College, Batticaloa",
    district: "Batticaloa",
    timingOrScore: "6.81m",
    medal: "bronze",
    pointsAwarded: 1
  },

  // 🏃 ATHLETICS - Javelin Throw U18 Boys
  {
    id: "ath_11",
    rank: 1,
    athleteName: "T. Sharukshan",
    gender: "Boys",
    ageGroup: "U18",
    sport: "athletics",
    eventName: "Javelin Throw",
    schoolName: "St. Patrick's College, Jaffna",
    district: "Jaffna",
    timingOrScore: "64.25m",
    recordTag: "Gold Medal Throw",
    medal: "gold",
    pointsAwarded: 5
  },
  {
    id: "ath_12",
    rank: 2,
    athleteName: "N. Danushka",
    gender: "Boys",
    ageGroup: "U18",
    sport: "athletics",
    eventName: "Javelin Throw",
    schoolName: "Royal College, Colombo",
    district: "Colombo",
    timingOrScore: "61.80m",
    medal: "silver",
    pointsAwarded: 3
  },
  {
    id: "ath_13",
    rank: 3,
    athleteName: "G. Kirushan",
    gender: "Boys",
    ageGroup: "U18",
    sport: "athletics",
    eventName: "Javelin Throw",
    schoolName: "Kilinochchi Central College",
    district: "Kilinochchi",
    timingOrScore: "59.40m",
    medal: "bronze",
    pointsAwarded: 1
  },

  // 🏸 BADMINTON - Boys & Girls Singles
  {
    id: "bad_01",
    rank: 1,
    athleteName: "R. Bavithira",
    gender: "Girls",
    ageGroup: "U18",
    sport: "badminton",
    eventName: "Girls Singles Championship",
    schoolName: "Vembadi Girls' High School",
    district: "Jaffna",
    timingOrScore: "21-16, 21-14 (Straight Sets)",
    recordTag: "Undefeated Gold Medalist",
    medal: "gold",
    pointsAwarded: 5
  },
  {
    id: "bad_02",
    rank: 2,
    athleteName: "S. Senuri Perera",
    gender: "Girls",
    ageGroup: "U18",
    sport: "badminton",
    eventName: "Girls Singles Championship",
    schoolName: "Visakha Vidyalaya, Colombo",
    district: "Colombo",
    timingOrScore: "Runner Up",
    medal: "silver",
    pointsAwarded: 3
  },
  {
    id: "bad_03",
    rank: 3,
    athleteName: "D. Nimna Wickramasinghe",
    gender: "Girls",
    ageGroup: "U18",
    sport: "badminton",
    eventName: "Girls Singles Championship",
    schoolName: "Pushpadana Girls' College",
    district: "Kandy",
    timingOrScore: "Bronze Match Won 21-19, 21-17",
    medal: "bronze",
    pointsAwarded: 1
  },
  {
    id: "bad_04",
    rank: 1,
    athleteName: "K. Senula De Silva",
    gender: "Boys",
    ageGroup: "U18",
    sport: "badminton",
    eventName: "Boys Singles Championship",
    schoolName: "Royal College, Colombo",
    district: "Colombo",
    timingOrScore: "21-18, 19-21, 21-15",
    recordTag: "Top Seeded Champion",
    medal: "gold",
    pointsAwarded: 5
  },
  {
    id: "bad_05",
    rank: 2,
    athleteName: "T. Piratheepan",
    gender: "Boys",
    ageGroup: "U18",
    sport: "badminton",
    eventName: "Boys Singles Championship",
    schoolName: "Jaffna Central College",
    district: "Jaffna",
    timingOrScore: "Silver Finalist",
    medal: "silver",
    pointsAwarded: 3
  },

  // 🏊 SWIMMING - 50m Freestyle
  {
    id: "sw_01",
    rank: 1,
    athleteName: "Akash Wijeratne",
    gender: "Boys",
    ageGroup: "U18",
    sport: "swimming",
    eventName: "50m Freestyle",
    schoolName: "Royal College, Colombo",
    district: "Colombo",
    timingOrScore: "24.12s",
    recordTag: "⚡ Meet Record Aquatics",
    medal: "gold",
    pointsAwarded: 5
  },
  {
    id: "sw_02",
    rank: 2,
    athleteName: "Kavindu Tennakoon",
    gender: "Boys",
    ageGroup: "U18",
    sport: "swimming",
    eventName: "50m Freestyle",
    schoolName: "Trinity College, Kandy",
    district: "Kandy",
    timingOrScore: "24.89s",
    medal: "silver",
    pointsAwarded: 3
  },
  {
    id: "sw_03",
    rank: 3,
    athleteName: "S. Ketheeswaran",
    gender: "Boys",
    ageGroup: "U18",
    sport: "swimming",
    eventName: "50m Freestyle",
    schoolName: "St. Michael's College, Batticaloa",
    district: "Batticaloa",
    timingOrScore: "25.30s",
    medal: "bronze",
    pointsAwarded: 1
  }
];

// =============================================================================
// MAIN COMPONENT: CHAMPIONSHIP STANDINGS VIEW
// =============================================================================

export function ChampionshipStandingsView({
  defaultStandings = [],
  tournaments = [],
  fixtures = []
}: {
  defaultStandings?: Standing[];
  tournaments?: Tournament[];
  fixtures?: Fixture[];
}) {
  const [selectedSport, setSelectedSport] = useState<SportCategoryFilter>("all_medals");
  const [selectedDivision, setSelectedDivision] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEventName, setSelectedEventName] = useState<string>("All Events");

  // Selected School Dossier Modal
  const [inspectedSchool, setInspectedSchool] = useState<SchoolMedalStanding | null>(null);
  const [inspectedTeam, setInspectedTeam] = useState<TeamLeagueEntry | null>(null);

  // Filtered Medal Tally
  const filteredMedalTally = useMemo(() => {
    return INITIAL_SCHOOL_MEDAL_TALLY.filter((sch) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        sch.schoolName.toLowerCase().includes(q) ||
        sch.district.toLowerCase().includes(q) ||
        sch.province.toLowerCase().includes(q) ||
        sch.dominantSports.some((s) => s.toLowerCase().includes(q));

      return matchSearch;
    });
  }, [searchQuery]);

  // Filtered Team Leagues
  const filteredTeamLeagues = useMemo(() => {
    return INITIAL_TEAM_LEAGUES.filter((team) => {
      // Sport match
      if (selectedSport !== "all_medals" && team.sport !== selectedSport) {
        return false;
      }
      // Division match
      if (selectedDivision !== "All" && team.division !== selectedDivision) {
        return false;
      }
      // Search match
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = team.teamName.toLowerCase().includes(q);
        const matchSchool = team.schoolName.toLowerCase().includes(q);
        return matchName || matchSchool;
      }
      return true;
    });
  }, [selectedSport, selectedDivision, searchQuery]);

  // Filtered Individual Event Athletes
  const individualAthletes = useMemo(() => {
    return INITIAL_INDIVIDUAL_LEADERBOARDS.filter((ath) => {
      // Sport filter
      if (selectedSport !== "all_medals" && ath.sport !== selectedSport) {
        return false;
      }
      // Event filter
      if (selectedEventName !== "All Events" && ath.eventName !== selectedEventName) {
        return false;
      }
      // Search query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchAthlete = ath.athleteName.toLowerCase().includes(q);
        const matchSchool = ath.schoolName.toLowerCase().includes(q);
        const matchEvent = ath.eventName.toLowerCase().includes(q);
        const matchDistrict = ath.district.toLowerCase().includes(q);
        return matchAthlete || matchSchool || matchEvent || matchDistrict;
      }
      return true;
    });
  }, [selectedSport, selectedEventName, searchQuery]);

  // Available event names based on selected individual sport
  const availableEvents = useMemo(() => {
    const list = Array.from(
      new Set(
        INITIAL_INDIVIDUAL_LEADERBOARDS.filter((a) =>
          selectedSport === "all_medals" ? true : a.sport === selectedSport
        ).map((a) => a.eventName)
      )
    );
    return ["All Events", ...list];
  }, [selectedSport]);

  // Is current view a team sport, individual sport, or overall medal tally?
  const isTeamSport =
    selectedSport === "football" ||
    selectedSport === "cricket" ||
    selectedSport === "basketball" ||
    selectedSport === "volleyball";

  const isIndividualSport =
    selectedSport === "athletics" ||
    selectedSport === "badminton" ||
    selectedSport === "swimming";

  // CSV Export
  const handleExportCsv = () => {
    if (selectedSport === "all_medals") {
      const headers = [
        "Rank",
        "School Name",
        "District",
        "Province",
        "Gold",
        "Silver",
        "Bronze",
        "Total Medals",
        "Championship Points",
        "Dominant Sports"
      ];
      const rows = filteredMedalTally.map((s) => [
        s.rank,
        `"${s.schoolName}"`,
        `"${s.district}"`,
        `"${s.province}"`,
        s.gold,
        s.silver,
        s.bronze,
        s.totalMedals,
        s.championshipPoints,
        `"${s.dominantSports.join(", ")}"`
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `InterSchool_Championship_Medal_Tally_2026.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (isTeamSport) {
      const headers = [
        "Rank",
        "Team Name",
        "School Name",
        "Sport",
        "Division",
        "P",
        "W",
        "D",
        "L",
        "GF/RF",
        "GA/RA",
        "GD/NRR",
        "Points",
        "Status"
      ];
      const rows = filteredTeamLeagues.map((t) => [
        t.rank,
        `"${t.teamName}"`,
        `"${t.schoolName}"`,
        t.sport.toUpperCase(),
        t.division,
        t.played,
        t.won,
        t.drawn,
        t.lost,
        t.scoredFor,
        t.scoredAgainst,
        t.diffOrNrr,
        t.points,
        `"${t.statusText}"`
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `League_Standings_${selectedSport}_2026.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = [
        "Rank",
        "Athlete Name",
        "Event",
        "School Name",
        "District",
        "Result/Timing",
        "Medal",
        "Championship Points"
      ];
      const rows = individualAthletes.map((a) => [
        a.rank,
        `"${a.athleteName}"`,
        `"${a.eventName}"`,
        `"${a.schoolName}"`,
        `"${a.district}"`,
        `"${a.timingOrScore}"`,
        a.medal.toUpperCase(),
        a.pointsAwarded
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Individual_Event_Standings_${selectedSport}_2026.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* 1. HERO BANNER & KPI HIGHLIGHT CARDS                                 */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Championship Trophy Leader */}
        <div className="bg-gradient-to-br from-[#0d2b26] to-[#0a4539] text-white p-4 rounded-2xl border border-emerald-800/40 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              Overall Trophy Leader
            </p>
            <h4 className="text-sm font-extrabold text-white truncate">
              Jaffna Central College
            </h4>
            <p className="text-xs text-emerald-200/80">
              🥇 8 Gold • 59 Pts (17 Medals)
            </p>
          </div>
        </div>

        {/* Card 2: Football Premier Leader */}
        <div className="bg-white p-4 rounded-2xl border border-[#e6ece8] shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <span className="text-2xl">⚽</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Football U18 Leader
            </p>
            <h4 className="text-sm font-bold text-[#0d2b26] truncate">
              St. Michael&apos;s Batticaloa
            </h4>
            <p className="text-xs text-emerald-600 font-semibold">
              16 Pts • +15 GD (Unbeaten 5-1-0)
            </p>
          </div>
        </div>

        {/* Card 3: Cricket Super League Leader */}
        <div className="bg-white p-4 rounded-2xl border border-[#e6ece8] shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <span className="text-2xl">🏏</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Cricket Super League
            </p>
            <h4 className="text-sm font-bold text-[#0d2b26] truncate">
              Royal Titans Academy
            </h4>
            <p className="text-xs text-amber-700 font-semibold">
              25 Pts • NRR +2.140 (5/5 Wins)
            </p>
          </div>
        </div>

        {/* Card 4: Sprint & Track Star */}
        <div className="bg-white p-4 rounded-2xl border border-[#e6ece8] shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Fastest Athlete 100m
            </p>
            <h4 className="text-sm font-bold text-[#0d2b26] truncate">
              K. Thanujan (10.48s)
            </h4>
            <p className="text-xs text-purple-600 font-semibold truncate">
              Jaffna Central • ⚡ Meet Record
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. SPORT SWITCHER PILLS & TOURNAMENT FILTER CONTROLS                 */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-[#e6ece8] p-4 shadow-xs space-y-3">
        {/* Row 1: Sport Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedSport("all_medals")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedSport === "all_medals"
                ? "bg-[#0d5c4d] text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>🥇 Overall Medal Tally</span>
          </button>

          <button
            onClick={() => setSelectedSport("football")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedSport === "football"
                ? "bg-[#0d5c4d] text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
            }`}
          >
            <span>⚽ Football</span>
          </button>

          <button
            onClick={() => setSelectedSport("cricket")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedSport === "cricket"
                ? "bg-[#0d5c4d] text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
            }`}
          >
            <span>🏏 Cricket</span>
          </button>

          <button
            onClick={() => setSelectedSport("athletics")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedSport === "athletics"
                ? "bg-[#0d5c4d] text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
            }`}
          >
            <span>🏃 Athletics (Track & Field)</span>
          </button>

          <button
            onClick={() => setSelectedSport("basketball")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedSport === "basketball"
                ? "bg-[#0d5c4d] text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
            }`}
          >
            <span>🏀 Basketball</span>
          </button>

          <button
            onClick={() => setSelectedSport("volleyball")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedSport === "volleyball"
                ? "bg-[#0d5c4d] text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
            }`}
          >
            <span>🏐 Volleyball</span>
          </button>

          <button
            onClick={() => setSelectedSport("badminton")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedSport === "badminton"
                ? "bg-[#0d5c4d] text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
            }`}
          >
            <span>🏸 Badminton</span>
          </button>

          <button
            onClick={() => setSelectedSport("swimming")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedSport === "swimming"
                ? "bg-[#0d5c4d] text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200"
            }`}
          >
            <span>🏊 Swimming</span>
          </button>
        </div>

        {/* Row 2: Secondary Controls (Search, Division, Event, Print/Export) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-[#f0f4f2]">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={
                  selectedSport === "all_medals"
                    ? "Search school, district..."
                    : isTeamSport
                    ? "Search team, school..."
                    : "Search athlete, event, school..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#f8faf9] border border-[#dce5e0] rounded-xl text-xs text-[#0d2b26] placeholder:text-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white"
              />
            </div>

            {/* Division dropdown for Team Sports */}
            {isTeamSport && (
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="px-3 py-1.5 bg-[#f8faf9] border border-[#dce5e0] rounded-xl text-xs text-[#0d2b26] font-semibold focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="All">All Age Divisions</option>
                <option value="Under-18">Under-18 Championship</option>
                <option value="Under-16">Under-16 Junior Cup</option>
                <option value="Open">Open Senior League</option>
              </select>
            )}

            {/* Event dropdown for Individual Sports */}
            {isIndividualSport && (
              <select
                value={selectedEventName}
                onChange={(e) => setSelectedEventName(e.target.value)}
                className="px-3 py-1.5 bg-[#f8faf9] border border-[#dce5e0] rounded-xl text-xs text-[#0d2b26] font-semibold focus:outline-none focus:border-[#0d5c4d]"
              >
                {availableEvents.map((evt) => (
                  <option key={evt} value={evt}>
                    {evt}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Action buttons: Export CSV & Print */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="h-8 px-2.5 text-xs text-slate-600 border-[#dce5e0] hover:bg-[#ecf8f5] hover:text-[#0d5c4d] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 px-2.5 text-xs text-slate-600 border-[#dce5e0] hover:bg-[#ecf8f5] hover:text-[#0d5c4d] cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 mr-1" />
              <span>Print Bulletin</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. TABLE VIEW A: OVERALL CHAMPIONSHIP MEDAL TALLY                    */}
      {/* ===================================================================== */}
      {selectedSport === "all_medals" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#0d2b26] flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>Inter-School All-Sports Championship Medal Tally 2026</span>
              </h3>
              <p className="text-xs text-slate-500">
                Official provincial & all-island points system: Gold = 5 Pts, Silver = 3 Pts, Bronze = 1 Pt.
              </p>
            </div>
            <Badge className="bg-emerald-50 text-[#0d5c4d] border-emerald-200 text-xs">
              {filteredMedalTally.length} Schools Ranked
            </Badge>
          </div>

          <div className="bg-white rounded-2xl border border-[#e6ece8] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8faf9] border-b border-[#e6ece8] text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 w-16 text-center">Rank</th>
                    <th className="p-3.5">School / Academy</th>
                    <th className="p-3.5">District / Province</th>
                    <th className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-amber-600 font-extrabold">
                        🥇 Gold
                      </span>
                    </th>
                    <th className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-slate-600 font-extrabold">
                        🥈 Silver
                      </span>
                    </th>
                    <th className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-orange-600 font-extrabold">
                        🥉 Bronze
                      </span>
                    </th>
                    <th className="p-3.5 text-center font-bold text-slate-700">Total Medals</th>
                    <th className="p-3.5 text-center text-[#0d5c4d] font-black">
                      Total Pts
                    </th>
                    <th className="p-3.5 text-right">Dominant Disciplines</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef3f0]">
                  {filteredMedalTally.map((sch) => {
                    const isPodium = sch.rank <= 3;
                    return (
                      <tr
                        key={sch.id}
                        onClick={() => setInspectedSchool(sch)}
                        className={`hover:bg-[#ecf8f5]/40 transition-colors cursor-pointer ${
                          sch.rank === 1
                            ? "bg-amber-50/40 font-medium"
                            : sch.rank === 2
                            ? "bg-slate-50/60"
                            : sch.rank === 3
                            ? "bg-orange-50/30"
                            : ""
                        }`}
                      >
                        {/* Rank */}
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-mono font-bold text-xs ${
                              sch.rank === 1
                                ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-xs"
                                : sch.rank === 2
                                ? "bg-slate-200 text-slate-800 border border-slate-300 shadow-xs"
                                : sch.rank === 3
                                ? "bg-orange-100 text-orange-900 border border-orange-300 shadow-xs"
                                : "bg-slate-50 text-slate-600"
                            }`}
                          >
                            {sch.rank === 1 ? "🥇" : sch.rank === 2 ? "🥈" : sch.rank === 3 ? "🥉" : sch.rank}
                          </span>
                        </td>

                        {/* School Name */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${sch.crestColor}`}
                            >
                              {sch.schoolName.charAt(0)}
                            </span>
                            <div>
                              <p className="font-bold text-[#0d2b26] flex items-center gap-1.5">
                                <span>{sch.schoolName}</span>
                                {sch.rank === 1 && (
                                  <Badge className="bg-amber-100 text-amber-900 border-amber-200 text-[9px] px-1.5 py-0">
                                    🏆 Champions
                                  </Badge>
                                )}
                              </p>
                              {sch.recentRecord && (
                                <p className="text-[10px] text-emerald-700 font-medium truncate max-w-xs">
                                  {sch.recentRecord}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* District */}
                        <td className="p-3.5 text-slate-600">
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{sch.district}</span>
                            <span className="text-[10px] text-slate-400">({sch.province.replace(" Province", "")})</span>
                          </div>
                        </td>

                        {/* Gold */}
                        <td className="p-3.5 text-center font-bold text-amber-700 bg-amber-50/30">
                          {sch.gold}
                        </td>

                        {/* Silver */}
                        <td className="p-3.5 text-center font-bold text-slate-700 bg-slate-50/50">
                          {sch.silver}
                        </td>

                        {/* Bronze */}
                        <td className="p-3.5 text-center font-bold text-orange-800 bg-orange-50/20">
                          {sch.bronze}
                        </td>

                        {/* Total Medals */}
                        <td className="p-3.5 text-center font-bold text-slate-800 text-sm">
                          {sch.totalMedals}
                        </td>

                        {/* Total Championship Points */}
                        <td className="p-3.5 text-center font-black text-[#0d5c4d] text-base">
                          {sch.championshipPoints}
                        </td>

                        {/* Dominant Disciplines */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            {sch.dominantSports.map((sp) => (
                              <span
                                key={sp}
                                className="px-2 py-0.5 rounded-md bg-[#f0f4f2] text-[#0d2b26] text-[10px] font-semibold"
                              >
                                {sp}
                              </span>
                            ))}
                            <ChevronRight className="h-3.5 w-3.5 text-slate-300 ml-1" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. TABLE VIEW B: TEAM LEAGUES (FOOTBALL, CRICKET, BASKETBALL, ETC.)  */}
      {/* ===================================================================== */}
      {isTeamSport && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#0d2b26] flex items-center gap-2 capitalize">
                <Shield className="h-4 w-4 text-[#0d5c4d]" />
                <span>
                  {selectedSport} Tournament League Standings ({selectedDivision} Division)
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Top 2 teams qualify directly for Finals / Semi-Finals. Points: Win = 3 Pts (or match bonus), Draw = 1 Pt, Loss = 0.
              </p>
            </div>
            <Badge className="bg-emerald-50 text-[#0d5c4d] border-emerald-200 text-xs">
              {filteredTeamLeagues.length} Squads Active
            </Badge>
          </div>

          <div className="bg-white rounded-2xl border border-[#e6ece8] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8faf9] border-b border-[#e6ece8] text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 w-14 text-center">Pos</th>
                    <th className="p-3.5">Club / School Squad</th>
                    <th className="p-3.5 text-center">Played (P)</th>
                    <th className="p-3.5 text-center text-emerald-600">Won (W)</th>
                    <th className="p-3.5 text-center text-slate-500">Drawn (D)</th>
                    <th className="p-3.5 text-center text-rose-500">Lost (L)</th>
                    <th className="p-3.5 text-center">
                      {selectedSport === "cricket" ? "Runs For/Agst" : "GF : GA"}
                    </th>
                    <th className="p-3.5 text-center">
                      {selectedSport === "cricket" ? "Net Run Rate" : "GD"}
                    </th>
                    <th className="p-3.5 text-center">Recent Form</th>
                    <th className="p-3.5 text-center text-[#0d5c4d] font-black">Points</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef3f0]">
                  {filteredTeamLeagues.map((team, idx) => (
                    <tr
                      key={team.id}
                      onClick={() => setInspectedTeam(team)}
                      className={`hover:bg-[#ecf8f5]/40 transition-colors cursor-pointer ${
                        team.rank <= 2 ? "bg-[#ecf8f5]/20 font-medium" : ""
                      }`}
                    >
                      {/* Position */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono font-bold text-xs ${
                            team.rank === 1
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : team.rank === 2
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {team.rank}
                        </span>
                      </td>

                      {/* Team Name & School */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#0d5c4d] shrink-0" />
                          <div>
                            <p className="font-bold text-[#0d2b26]">{team.teamName}</p>
                            <p className="text-[10px] text-slate-500 truncate max-w-xs">
                              {team.schoolName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Played */}
                      <td className="p-3.5 text-center text-slate-700 font-semibold">{team.played}</td>

                      {/* Won */}
                      <td className="p-3.5 text-center font-bold text-emerald-600">{team.won}</td>

                      {/* Drawn */}
                      <td className="p-3.5 text-center text-slate-400">{team.drawn}</td>

                      {/* Lost */}
                      <td className="p-3.5 text-center text-rose-500">{team.lost}</td>

                      {/* Scored For : Against */}
                      <td className="p-3.5 text-center font-mono text-slate-600">
                        {team.scoredFor} : {team.scoredAgainst}
                      </td>

                      {/* Difference / NRR */}
                      <td
                        className={`p-3.5 text-center font-mono font-bold ${
                          team.diffOrNrr.startsWith("+")
                            ? "text-emerald-700"
                            : team.diffOrNrr.startsWith("-")
                            ? "text-rose-600"
                            : "text-slate-600"
                        }`}
                      >
                        {team.diffOrNrr}
                      </td>

                      {/* Form guide pills */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {team.form.map((res, i) => (
                            <span
                              key={i}
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white ${
                                res === "W"
                                  ? "bg-emerald-500"
                                  : res === "D"
                                  ? "bg-slate-400"
                                  : "bg-rose-500"
                              }`}
                            >
                              {res}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Points */}
                      <td className="p-3.5 text-center font-black text-[#0d5c4d] text-base">
                        {team.points}
                      </td>

                      {/* Qualification Status */}
                      <td className="p-3.5 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            team.statusType === "qualified"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : team.statusType === "playoff"
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : team.statusType === "danger"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {team.statusText}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom League Legend */}
            <div className="p-3 bg-[#f8faf9] border-t border-[#e6ece8] flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Rank 1-2: Direct Grand Finalists</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Rank 3-4: Semi-Finals Playoff</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span>Rank 5+: Group Elimination</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 italic">
                Tie-breaker: (1) Total Points, (2) Goal Difference / Net Run Rate, (3) Head-to-Head
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. TABLE VIEW C: INDIVIDUAL EVENT STANDINGS (ATHLETICS, BADMINTON...) */}
      {/* ===================================================================== */}
      {isIndividualSport && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#0d2b26] flex items-center gap-2 capitalize">
                <Medal className="h-4 w-4 text-amber-500" />
                <span>
                  {selectedSport} Individual Event Leaderboard ({selectedEventName})
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Official timings, jump measurements, and match results certified by federation technical officials.
              </p>
            </div>
            <Badge className="bg-emerald-50 text-[#0d5c4d] border-emerald-200 text-xs">
              {individualAthletes.length} Podiums Registered
            </Badge>
          </div>

          <div className="bg-white rounded-2xl border border-[#e6ece8] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8faf9] border-b border-[#e6ece8] text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 w-14 text-center">Rank</th>
                    <th className="p-3.5">Athlete / Participant</th>
                    <th className="p-3.5">Discipline / Event</th>
                    <th className="p-3.5">School / Academy</th>
                    <th className="p-3.5">District</th>
                    <th className="p-3.5 text-center">Official Result / Score</th>
                    <th className="p-3.5 text-center">Medal / Recognition</th>
                    <th className="p-3.5 text-center text-[#0d5c4d] font-black">Pts Awarded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef3f0]">
                  {individualAthletes.map((ath) => (
                    <tr
                      key={ath.id}
                      className={`hover:bg-[#ecf8f5]/40 transition-colors ${
                        ath.medal === "gold"
                          ? "bg-amber-50/40 font-medium"
                          : ath.medal === "silver"
                          ? "bg-slate-50/60"
                          : ath.medal === "bronze"
                          ? "bg-orange-50/30"
                          : ""
                      }`}
                    >
                      {/* Rank */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-mono font-bold text-xs ${
                            ath.medal === "gold"
                              ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-xs"
                              : ath.medal === "silver"
                              ? "bg-slate-200 text-slate-800 border border-slate-300 shadow-xs"
                              : ath.medal === "bronze"
                              ? "bg-orange-100 text-orange-900 border border-orange-300 shadow-xs"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {ath.medal === "gold"
                            ? "🥇"
                            : ath.medal === "silver"
                            ? "🥈"
                            : ath.medal === "bronze"
                            ? "🥉"
                            : ath.rank}
                        </span>
                      </td>

                      {/* Athlete Name */}
                      <td className="p-3.5">
                        <div>
                          <p className="font-bold text-[#0d2b26] flex items-center gap-1.5">
                            <span>{ath.athleteName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({ath.gender} • {ath.ageGroup})
                            </span>
                          </p>
                          {ath.recordTag && (
                            <p className="text-[10px] text-emerald-700 font-semibold">
                              {ath.recordTag}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Event */}
                      <td className="p-3.5 font-semibold text-[#0d5c4d]">
                        {ath.eventName}
                      </td>

                      {/* School Name */}
                      <td className="p-3.5 text-slate-700">
                        {ath.schoolName}
                      </td>

                      {/* District */}
                      <td className="p-3.5 text-slate-500">
                        {ath.district}
                      </td>

                      {/* Timing / Result */}
                      <td className="p-3.5 text-center font-mono font-bold text-[#0d2b26] bg-slate-50/50">
                        {ath.timingOrScore}
                      </td>

                      {/* Medal Tag */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            ath.medal === "gold"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : ath.medal === "silver"
                              ? "bg-slate-200 text-slate-800 border border-slate-300"
                              : ath.medal === "bronze"
                              ? "bg-orange-100 text-orange-900 border border-orange-300"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {ath.medal.toUpperCase()}
                        </span>
                      </td>

                      {/* Points Awarded */}
                      <td className="p-3.5 text-center font-black text-[#0d5c4d] text-base">
                        +{ath.pointsAwarded}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. MODAL: INSPECT SCHOOL SPORTS DOSSIER                               */}
      {/* ===================================================================== */}
      {inspectedSchool && (
        <Modal
          isOpen={true}
          onClose={() => setInspectedSchool(null)}
          title={`School Sports Profile: ${inspectedSchool.schoolName}`}
        >
          <div className="space-y-4 text-xs">
            {/* Header banner */}
            <div className="bg-gradient-to-br from-[#0d2b26] to-[#0a4539] text-white p-4 rounded-2xl flex items-center gap-4">
              <span
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 ${inspectedSchool.crestColor}`}
              >
                {inspectedSchool.schoolName.charAt(0)}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300">
                    Championship Rank #{inspectedSchool.rank}
                  </span>
                  <Badge className="bg-white/20 text-white text-[10px]">
                    {inspectedSchool.district}
                  </Badge>
                </div>
                <h3 className="text-base font-extrabold text-white">
                  {inspectedSchool.schoolName}
                </h3>
                <p className="text-xs text-emerald-100/80">
                  {inspectedSchool.province} • Inter-School Sports Federation
                </p>
              </div>
            </div>

            {/* Medals Breakdown */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-base font-black text-amber-800">{inspectedSchool.gold}</p>
                <p className="text-[10px] font-bold text-amber-700">🥇 Gold</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                <p className="text-base font-black text-slate-800">{inspectedSchool.silver}</p>
                <p className="text-[10px] font-bold text-slate-600">🥈 Silver</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                <p className="text-base font-black text-orange-900">{inspectedSchool.bronze}</p>
                <p className="text-[10px] font-bold text-orange-800">🥉 Bronze</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-base font-black text-[#0d5c4d]">
                  {inspectedSchool.championshipPoints}
                </p>
                <p className="text-[10px] font-bold text-emerald-700">Total Points</p>
              </div>
            </div>

            {/* Dominant Sports & Records */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-bold text-slate-700">Dominant Championship Disciplines:</p>
              <div className="flex flex-wrap gap-1.5">
                {inspectedSchool.dominantSports.map((sp) => (
                  <Badge key={sp} className="bg-[#0d5c4d] text-white text-xs">
                    {sp}
                  </Badge>
                ))}
              </div>
              {inspectedSchool.recentRecord && (
                <div className="pt-2 border-t border-slate-200 text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="font-semibold text-emerald-800">
                    {inspectedSchool.recentRecord}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setInspectedSchool(null)}
                className="cursor-pointer"
              >
                Close Profile
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===================================================================== */}
      {/* 7. MODAL: INSPECT SQUAD DETAILS                                       */}
      {/* ===================================================================== */}
      {inspectedTeam && (
        <Modal
          isOpen={true}
          onClose={() => setInspectedTeam(null)}
          title={`Squad Dossier: ${inspectedTeam.teamName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d2b26] to-[#0a4539] text-white">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-400 text-[#0d2b26] font-black text-[10px]">
                  Rank #{inspectedTeam.rank} in {inspectedTeam.division}
                </Badge>
                <span className="text-xs uppercase font-extrabold text-emerald-200">
                  {inspectedTeam.sport}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">
                {inspectedTeam.teamName}
              </h3>
              <p className="text-xs text-emerald-100">{inspectedTeam.schoolName}</p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm font-extrabold text-slate-800">{inspectedTeam.played}</p>
                <p className="text-[10px] text-slate-500">Played</p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-sm font-extrabold text-emerald-700">{inspectedTeam.won}</p>
                <p className="text-[10px] text-emerald-600">Won</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm font-extrabold text-slate-600">{inspectedTeam.drawn}</p>
                <p className="text-[10px] text-slate-500">Drawn</p>
              </div>
              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                <p className="text-sm font-extrabold text-rose-700">{inspectedTeam.lost}</p>
                <p className="text-[10px] text-rose-600">Lost</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-[10px]">Total Points:</p>
                <p className="text-lg font-black text-[#0d5c4d]">{inspectedTeam.points} PTS</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-[10px]">Goal Diff / Run Rate:</p>
                <p className="text-sm font-black text-emerald-700 font-mono">
                  {inspectedTeam.diffOrNrr}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setInspectedTeam(null)}
                className="cursor-pointer"
              >
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
