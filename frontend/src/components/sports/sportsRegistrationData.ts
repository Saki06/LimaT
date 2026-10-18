export interface SchoolLocation {
  province: string;
  districts: {
    district: string;
    schools: string[];
  }[];
}

export const SRI_LANKA_SCHOOL_DATA: SchoolLocation[] = [
  {
    province: "Northern Province",
    districts: [
      {
        district: "Jaffna",
        schools: [
          "Jaffna Central College",
          "Hartley College (Point Pedro)",
          "St. John's College, Jaffna",
          "Vembadi Girls' High School",
          "Chundikuli Girls' College",
          "Jaffna Hindu College",
          "Skandavarodaya College",
          "St. Patrick's College, Jaffna",
          "Kokuvil Hindu College",
          "Mahajana College, Tellippalai"
        ]
      },
      {
        district: "Kilinochchi",
        schools: [
          "Kilinochchi Central College",
          "Kilinochchi Maha Vidyalayam",
          "St. Anthony's Maha Vidyalayam",
          "Dharmapuram Maha Vidyalayam"
        ]
      },
      {
        district: "Mullaitivu",
        schools: [
          "Mullaitivu Maha Vidyalayam",
          "Vidyananda College, Mulliyawalai",
          "Puthukkudiyiruppu Central College"
        ]
      },
      {
        district: "Vavuniya",
        schools: [
          "Vavuniya Tamil Maha Vidyalayam",
          "Vavuniya South Muslim Maha Vidyalayam",
          "Gamini Maha Vidyalayam, Vavuniya"
        ]
      },
      {
        district: "Mannar",
        schools: [
          "St. Xavier's Boys' College, Mannar",
          "St. Xavier's Girls' College, Mannar",
          "Mannar Sithyvinayagar Hindu College"
        ]
      }
    ]
  },
  {
    province: "Eastern Province",
    districts: [
      {
        district: "Batticaloa",
        schools: [
          "St. Michael's College, Batticaloa",
          "Vincent Girls' High School",
          "Shivananda National School",
          "Methodist Central College, Batticaloa"
        ]
      },
      {
        district: "Trincomalee",
        schools: [
          "St. Joseph's College, Trincomalee",
          "Sri Koneswara Hindu College",
          "Trincomalee Girls' High School"
        ]
      },
      {
        district: "Ampara",
        schools: [
          "Kalmunai Zahira College",
          "Carmel Fatima College, Kalmunai",
          "D.S. Senanayake National College, Ampara"
        ]
      }
    ]
  },
  {
    province: "Western Province",
    districts: [
      {
        district: "Colombo",
        schools: [
          "Royal College, Colombo",
          "Ananda College, Colombo",
          "Nalanda College, Colombo",
          "Visakha Vidyalaya",
          "Ladies' College, Colombo",
          "St. Joseph's College, Colombo 10",
          "St. Peter's College, Colombo 04",
          "Hindu College, Colombo 04",
          "D.S. Senanayake College",
          "Mahanama College"
        ]
      },
      {
        district: "Gampaha",
        schools: [
          "Bandaranayake College, Gampaha",
          "Holy Cross College, Gampaha",
          "Maris Stella College, Negombo"
        ]
      },
      {
        district: "Kalutara",
        schools: [
          "Kalutara Vidyalaya",
          "Holy Family Convent, Kalutara",
          "Tissa Central College"
        ]
      }
    ]
  },
  {
    province: "Central Province",
    districts: [
      {
        district: "Kandy",
        schools: [
          "Trinity College, Kandy",
          "Dharmaraja College, Kandy",
          "Kingswood College, Kandy",
          "Pushpadana Girls' College",
          "St. Anthony's College, Katugastota"
        ]
      },
      {
        district: "Matale",
        schools: [
          "St. Thomas' College, Matale",
          "Christ Church College, Matale"
        ]
      },
      {
        district: "Nuwara Eliya",
        schools: [
          "Gamini National School",
          "Good Shepherd Convent, Nuwara Eliya"
        ]
      }
    ]
  }
];

export type ChampionshipAgeBracket = "U12" | "U14" | "U15" | "U16" | "U17" | "U18" | "U19" | "Open";

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
    maxParticipants: number;
  }[];
}

export const INITIAL_CHAMPIONSHIP_SPORTS: ChampionshipSportItem[] = [
  {
    id: "sp_ath",
    name: "Athletics",
    category: "Track & Field",
    iconName: "Zap",
    description: "Sprints, middle-distance, relays, jumps and throws on international synthetic track.",
    ageGroups: ["U12", "U14", "U16", "U18", "Open"],
    gender: "all",
    isTeamSport: false,
    registrationStatus: "Open",
    events: [
      { id: "ath_100m_u16_b", name: "100m Sprint", ageCategory: "U16", gender: "Boys", fee: 500, maxParticipants: 64 },
      { id: "ath_100m_u16_g", name: "100m Sprint", ageCategory: "U16", gender: "Girls", fee: 500, maxParticipants: 64 },
      { id: "ath_100m_u18_b", name: "100m Sprint", ageCategory: "U18", gender: "Boys", fee: 500, maxParticipants: 64 },
      { id: "ath_100m_u18_g", name: "100m Sprint", ageCategory: "U18", gender: "Girls", fee: 500, maxParticipants: 64 },
      { id: "ath_200m_u16_b", name: "200m Sprint", ageCategory: "U16", gender: "Boys", fee: 500, maxParticipants: 48 },
      { id: "ath_200m_u16_g", name: "200m Sprint", ageCategory: "U16", gender: "Girls", fee: 500, maxParticipants: 48 },
      { id: "ath_400m_u18_b", name: "400m Dash", ageCategory: "U18", gender: "Boys", fee: 500, maxParticipants: 32 },
      { id: "ath_800m_open_b", name: "800m Middle Distance", ageCategory: "Open", gender: "Boys", fee: 600, maxParticipants: 24 },
      { id: "ath_lj_u16_b", name: "Long Jump", ageCategory: "U16", gender: "Boys", fee: 500, maxParticipants: 32 },
      { id: "ath_lj_u16_g", name: "Long Jump", ageCategory: "U16", gender: "Girls", fee: 500, maxParticipants: 32 },
      { id: "ath_hj_u18_b", name: "High Jump", ageCategory: "U18", gender: "Boys", fee: 500, maxParticipants: 24 },
      { id: "ath_sp_u18_b", name: "Shot Put", ageCategory: "U18", gender: "Boys", fee: 500, maxParticipants: 24 },
      { id: "ath_jav_u18_b", name: "Javelin Throw", ageCategory: "U18", gender: "Boys", fee: 500, maxParticipants: 24 }
    ]
  },
  {
    id: "sp_bad",
    name: "Badminton",
    category: "Racket Sports",
    iconName: "Activity",
    description: "National ranking points tournament featuring singles, doubles, and mixed matches.",
    ageGroups: ["U14", "U16", "U18", "Open"],
    gender: "all",
    isTeamSport: false,
    registrationStatus: "Open",
    events: [
      { id: "bad_sin_u14_b", name: "Boys Singles", ageCategory: "U14", gender: "Boys", fee: 750, maxParticipants: 32 },
      { id: "bad_sin_u14_g", name: "Girls Singles", ageCategory: "U14", gender: "Girls", fee: 750, maxParticipants: 32 },
      { id: "bad_sin_u16_b", name: "Boys Singles", ageCategory: "U16", gender: "Boys", fee: 750, maxParticipants: 32 },
      { id: "bad_sin_u16_g", name: "Girls Singles", ageCategory: "U16", gender: "Girls", fee: 750, maxParticipants: 32 },
      { id: "bad_dub_u18_b", name: "Boys Doubles", ageCategory: "U18", gender: "Boys", fee: 1200, maxParticipants: 16 },
      { id: "bad_dub_u18_g", name: "Girls Doubles", ageCategory: "U18", gender: "Girls", fee: 1200, maxParticipants: 16 },
      { id: "bad_mix_open", name: "Mixed Doubles", ageCategory: "Open", gender: "Mixed", fee: 1500, maxParticipants: 16 }
    ]
  },
  {
    id: "sp_ftb",
    name: "Football",
    category: "Team Ball Games",
    iconName: "Flame",
    description: "11-a-side and 7-a-side inter-district school knockout cup championships.",
    ageGroups: ["U14", "U16", "U18", "Open"],
    gender: "all",
    isTeamSport: true,
    registrationStatus: "Open",
    events: [
      { id: "ftb_11s_u16_b", name: "11-a-side Tournament", ageCategory: "U16", gender: "Boys", fee: 5000, maxParticipants: 16 },
      { id: "ftb_11s_u18_b", name: "11-a-side Championship", ageCategory: "U18", gender: "Boys", fee: 5000, maxParticipants: 16 },
      { id: "ftb_7s_open_b", name: "7-a-side Fast Cup", ageCategory: "Open", gender: "Boys", fee: 3500, maxParticipants: 24 },
      { id: "ftb_11s_u18_g", name: "11-a-side Girls Trophy", ageCategory: "U18", gender: "Girls", fee: 4000, maxParticipants: 12 }
    ]
  },
  {
    id: "sp_crk",
    name: "Cricket",
    category: "Bat & Ball",
    iconName: "Trophy",
    description: "T20 White-Ball Trophy and 50-Over School Premier Trophy.",
    ageGroups: ["U15", "U17", "U19", "Open"],
    gender: "all",
    isTeamSport: true,
    registrationStatus: "Open",
    events: [
      { id: "crk_t20_u17_b", name: "U17 T20 School Cup", ageCategory: "U16", gender: "Boys", fee: 6000, maxParticipants: 16 },
      { id: "crk_50o_u19_b", name: "U19 Division 1 One-Day", ageCategory: "U18", gender: "Boys", fee: 7500, maxParticipants: 16 }
    ]
  },
  {
    id: "sp_vlb",
    name: "Volleyball",
    category: "Court Team Sports",
    iconName: "Zap",
    description: "National game tournament across junior and senior provincial divisions.",
    ageGroups: ["U16", "U18", "Open"],
    gender: "all",
    isTeamSport: true,
    registrationStatus: "Open",
    events: [
      { id: "vlb_u16_b", name: "U16 Boys Championship", ageCategory: "U16", gender: "Boys", fee: 3000, maxParticipants: 16 },
      { id: "vlb_u18_b", name: "U18 Provincial Shield", ageCategory: "U18", gender: "Boys", fee: 3500, maxParticipants: 16 },
      { id: "vlb_u18_g", name: "U18 Girls Provincial Shield", ageCategory: "U18", gender: "Girls", fee: 3500, maxParticipants: 16 }
    ]
  },
  {
    id: "sp_bkb",
    name: "Basketball",
    category: "Hoops & Court",
    iconName: "Activity",
    description: "3x3 Street Slam and 5x5 Full Court School Championship.",
    ageGroups: ["U16", "U18", "Open"],
    gender: "all",
    isTeamSport: true,
    registrationStatus: "Open",
    events: [
      { id: "bkb_3x3_u18_b", name: "3x3 Street Slam", ageCategory: "U18", gender: "Boys", fee: 2000, maxParticipants: 24 },
      { id: "bkb_5x5_u18_b", name: "5x5 Championship Trophy", ageCategory: "U18", gender: "Boys", fee: 4000, maxParticipants: 16 }
    ]
  },
  {
    id: "sp_swm",
    name: "Swimming",
    category: "Aquatics",
    iconName: "Flame",
    description: "Olympic pool heats in 50m, 100m freestyle, backstroke, and medley.",
    ageGroups: ["U12", "U14", "U16", "U18", "Open"],
    gender: "all",
    isTeamSport: false,
    registrationStatus: "Open",
    events: [
      { id: "swm_50m_fr_u14_b", name: "50m Freestyle", ageCategory: "U14", gender: "Boys", fee: 800, maxParticipants: 40 },
      { id: "swm_50m_fr_u14_g", name: "50m Freestyle", ageCategory: "U14", gender: "Girls", fee: 800, maxParticipants: 40 },
      { id: "swm_100m_fr_u16_b", name: "100m Freestyle", ageCategory: "U16", gender: "Boys", fee: 800, maxParticipants: 32 },
      { id: "swm_50m_bk_u16_b", name: "50m Backstroke", ageCategory: "U16", gender: "Boys", fee: 800, maxParticipants: 32 }
    ]
  },
  {
    id: "sp_tt",
    name: "Table Tennis",
    category: "Indoor Table",
    iconName: "Activity",
    description: "Fast-paced singles and doubles matches across all grade brackets.",
    ageGroups: ["U12", "U14", "U16", "U18", "Open"],
    gender: "all",
    isTeamSport: false,
    registrationStatus: "Open",
    events: [
      { id: "tt_sin_u16_b", name: "Junior Boys Singles", ageCategory: "U16", gender: "Boys", fee: 600, maxParticipants: 32 },
      { id: "tt_sin_u16_g", name: "Junior Girls Singles", ageCategory: "U16", gender: "Girls", fee: 600, maxParticipants: 32 },
      { id: "tt_sin_open_b", name: "Open Men's Singles", ageCategory: "Open", gender: "Boys", fee: 800, maxParticipants: 32 }
    ]
  },
  {
    id: "sp_chs",
    name: "Chess",
    category: "Mind Sports",
    iconName: "Trophy",
    description: "FIDE rated classical & rapid chess tournament with age-group titles.",
    ageGroups: ["U12", "U14", "U16", "U18", "Open"],
    gender: "all",
    isTeamSport: false,
    registrationStatus: "Open",
    events: [
      { id: "chs_rap_u14", name: "Rapid Chess U14", ageCategory: "U14", gender: "All", fee: 600, maxParticipants: 64 },
      { id: "chs_rap_u18", name: "Rapid Chess U18", ageCategory: "U18", gender: "All", fee: 750, maxParticipants: 64 },
      { id: "chs_cls_open", name: "Classical Open Trophy", ageCategory: "Open", gender: "All", fee: 1000, maxParticipants: 48 }
    ]
  },
  {
    id: "sp_kar",
    name: "Karate",
    category: "Martial Arts",
    iconName: "Zap",
    description: "WKF rules Individual Kata and Weight-Category Kumite tournaments.",
    ageGroups: ["U14", "U16", "U18", "Open"],
    gender: "all",
    isTeamSport: false,
    registrationStatus: "Open",
    events: [
      { id: "kar_kata_u16_b", name: "Individual Kata U16", ageCategory: "U16", gender: "Boys", fee: 800, maxParticipants: 32 },
      { id: "kar_kum_u18_b", name: "Kumite -65kg U18", ageCategory: "U18", gender: "Boys", fee: 1000, maxParticipants: 24 },
      { id: "kar_kata_open_g", name: "Open Women's Kata", ageCategory: "Open", gender: "Girls", fee: 1000, maxParticipants: 24 }
    ]
  }
];

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
  id: string; // e.g. EZG26-ATH-000101
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
  consentTimestamp: string;
  paymentStatus: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
  totalAmount: number;
  status: "Confirmed" | "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

export const INITIAL_ATHLETE_REGISTRATIONS: StoredAthleteRegistration[] = [
  {
    id: "EZG26-ATH-000101",
    registrationNumber: "EZG26-ATH-000101",
    athleteName: "Kavinathan Sathurjan",
    firstName: "Sathurjan",
    lastName: "Kavinathan",
    dob: "2008-05-14",
    age: 17,
    gender: "Boys",
    nicOrStudentId: "200813504921",
    mobile: "0771234567",
    email: "sathurjan@gmail.com",
    province: "Northern Province",
    district: "Jaffna",
    schoolName: "Jaffna Central College",
    grade: "Grade 12",
    sports: ["Athletics", "Badminton"],
    selectedEvents: [
      { id: "ath_100m_u18_b", sportName: "Athletics", eventName: "100m Sprint", ageCategory: "U18", gender: "Boys", fee: 500 },
      { id: "ath_lj_u16_b", sportName: "Athletics", eventName: "Long Jump", ageCategory: "U16", gender: "Boys", fee: 500 },
      { id: "bad_dub_u18_b", sportName: "Badminton", eventName: "Boys Doubles", ageCategory: "U18", gender: "Boys", fee: 1200 }
    ],
    isTeamInterest: false,
    guardianName: "Mrs. K. Priyadarshani",
    guardianRelationship: "Mother",
    guardianMobile: "0779876543",
    consentTimestamp: "2026-10-10T09:30:00Z",
    paymentStatus: "PAID",
    totalAmount: 2200,
    status: "Confirmed",
    createdAt: "2026-10-10"
  },
  {
    id: "EZG26-ATH-000102",
    registrationNumber: "EZG26-ATH-000102",
    athleteName: "Thivanka Dilshan Perera",
    firstName: "Thivanka",
    lastName: "Perera",
    dob: "2009-11-20",
    age: 16,
    gender: "Boys",
    nicOrStudentId: "STU-2026-881",
    mobile: "0714567890",
    email: "thivanka.p@gmail.com",
    province: "Western Province",
    district: "Colombo",
    schoolName: "Royal College, Colombo",
    grade: "Grade 11",
    sports: ["Swimming", "Athletics"],
    selectedEvents: [
      { id: "swm_100m_fr_u16_b", sportName: "Swimming", eventName: "100m Freestyle", ageCategory: "U16", gender: "Boys", fee: 800 },
      { id: "ath_400m_u18_b", sportName: "Athletics", eventName: "400m Dash", ageCategory: "U18", gender: "Boys", fee: 500 }
    ],
    isTeamInterest: false,
    guardianName: "Mr. Sunil Perera",
    guardianRelationship: "Father",
    guardianMobile: "0712345678",
    consentTimestamp: "2026-10-11T14:15:00Z",
    paymentStatus: "PAID",
    totalAmount: 1300,
    status: "Confirmed",
    createdAt: "2026-10-11"
  },
  {
    id: "EZG26-ATH-000103",
    registrationNumber: "EZG26-ATH-000103",
    athleteName: "Niroshika Selvakumar",
    firstName: "Niroshika",
    lastName: "Selvakumar",
    dob: "2010-03-08",
    age: 15,
    gender: "Girls",
    nicOrStudentId: "STU-2026-443",
    mobile: "0763456781",
    email: "niroshika@gmail.com",
    province: "Northern Province",
    district: "Jaffna",
    schoolName: "Vembadi Girls' High School",
    grade: "Grade 10",
    sports: ["Athletics", "Badminton"],
    selectedEvents: [
      { id: "ath_100m_u16_g", sportName: "Athletics", eventName: "100m Sprint", ageCategory: "U16", gender: "Girls", fee: 500 },
      { id: "bad_sin_u16_g", sportName: "Badminton", eventName: "Girls Singles", ageCategory: "U16", gender: "Girls", fee: 750 }
    ],
    isTeamInterest: false,
    guardianName: "Mrs. S. Vasanthi",
    guardianRelationship: "Mother",
    guardianMobile: "0769988776",
    consentTimestamp: "2026-10-12T11:20:00Z",
    paymentStatus: "PENDING",
    totalAmount: 1250,
    status: "Pending",
    createdAt: "2026-10-12"
  },
  {
    id: "EZG26-ATH-000104",
    registrationNumber: "EZG26-ATH-000104",
    athleteName: "Mohamed Rilwan",
    firstName: "Mohamed",
    lastName: "Rilwan",
    dob: "2008-08-25",
    age: 17,
    gender: "Boys",
    nicOrStudentId: "200823801199",
    mobile: "0778899001",
    email: "rilwan.m@yahoo.com",
    province: "Eastern Province",
    district: "Batticaloa",
    schoolName: "St. Michael's College, Batticaloa",
    grade: "Grade 12",
    sports: ["Football"],
    selectedEvents: [
      { id: "ftb_11s_u18_b", sportName: "Football", eventName: "11-a-side Championship", ageCategory: "U18", gender: "Boys", fee: 5000 }
    ],
    isTeamInterest: true,
    teamSquad: {
      teamName: "St. Michael's Batticaloa 1st XI Squad",
      teamCode: "TEAM-SMC-4920",
      coachName: "Mr. J. Jude (Master-in-Charge)",
      coachPhone: "077 443 2211",
      isCaptainRegistration: true,
      players: [
        { id: "1", name: "Mohamed Rilwan", jerseyNumber: "10", role: "Captain / Attacking Midfield", nicOrStudentId: "200823801199" },
        { id: "2", name: "K. Jerome", jerseyNumber: "01", role: "Goalkeeper", nicOrStudentId: "200829103452" },
        { id: "3", name: "S. Prasanna", jerseyNumber: "04", role: "Center Back", nicOrStudentId: "200818209312" },
        { id: "4", name: "M. Aasik", jerseyNumber: "07", role: "Striker / Forward", nicOrStudentId: "200831002341" },
        { id: "5", name: "T. Danujan", jerseyNumber: "08", role: "Central Midfielder", nicOrStudentId: "200844201889" },
        { id: "6", name: "A. Riham", jerseyNumber: "03", role: "Left Fullback", nicOrStudentId: "200855301290" }
      ]
    },
    guardianName: "Mr. A. Mohamed",
    guardianRelationship: "Father",
    guardianMobile: "0771122334",
    consentTimestamp: "2026-10-13T08:00:00Z",
    paymentStatus: "PAID",
    totalAmount: 5000,
    status: "Approved",
    createdAt: "2026-10-13"
  }
];
