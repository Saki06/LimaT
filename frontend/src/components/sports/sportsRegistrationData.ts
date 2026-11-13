export type ChampionshipAgeBracket =
  | "U12"
  | "U14"
  | "U15"
  | "U16"
  | "U17"
  | "U18"
  | "U19"
  | "Open";

export interface ChampionshipSportItem {
  id: string;
  name: string;
  category: string;
  iconName: string;
  description: string;
  ageGroups: ChampionshipAgeBracket[];
  gender: "boys" | "girls" | "mixed" | "all";
  isTeamSport: boolean;
  registrationStatus: "Open" | "Closing Soon" | "Closed";
  events: {
    id: string;
    name: string;
    ageCategory: ChampionshipAgeBracket;
    gender: "Boys" | "Girls" | "Mixed" | "All";
    fee: number;
    maxParticipants: number | null;
    registrationCount?: number;
    venue?: string;
    startDate?: string;
    status?: "UPCOMING" | "LIVE" | "COMPLETED" | "CANCELLED";
  }[];
}

export interface SquadPlayer {
  id: string;
  name: string;
  jerseyNumber?: string;
  role?: string;
  nicOrStudentId?: string;
}

export interface TeamSquadDetails {
  teamName: string;
  teamCode: string;
  coachName?: string;
  coachPhone?: string;
  isCaptainRegistration: boolean;
  players: SquadPlayer[];
}

export interface StoredAthleteRegistration {
  id: string;
  registrationNumber: string;
  athleteName: string;
  firstName: string;
  lastName: string;
  dob: string;
  age: number;
  gender: "Boys" | "Girls" | "Mixed";
  nicOrStudentId: string;
  mobile: string;
  email: string;
  province: string;
  district: string;
  schoolName: string;
  grade: string;
  sports: string[];
  selectedEvents: {
    id: string;
    sportName: string;
    eventName: string;
    ageCategory: string;
    gender: string;
    fee: number;
  }[];
  isTeamInterest: boolean;
  teamSquad?: TeamSquadDetails;
  guardianName?: string;
  guardianRelationship?: string;
  guardianMobile?: string;
  guardianConsent?: boolean;
  consentTimestamp: string;
  paymentStatus: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
  totalAmount: number;
  status: "Confirmed" | "Pending" | "Approved" | "Rejected";
  createdAt: string;
}
