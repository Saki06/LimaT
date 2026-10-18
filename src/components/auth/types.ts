export type SupportedRole = "student" | "parent" | "teacher" | "admin";
export type AuthDisplayMode = "closed" | "drawer" | "fullpage";
export type AuthTab = "login" | "signup";

export interface RolePreset {
  name: string;
  email: string;
  detail: string;
  school: string;
}

export const ROLE_PRESET_CREDENTIALS: Record<SupportedRole, RolePreset> = {
  student: {
    name: "Sathurjan K.",
    email: "student@soloclass.lk",
    detail: "2026 A/L Combined Maths",
    school: "Apex Science Academy"
  },
  parent: {
    name: "Mrs. Priyadarshani Kulatunga",
    email: "parent@soloclass.lk",
    detail: "Parent of Sathurjan K. (Fee & Attendance)",
    school: "Apex Science Academy"
  },
  teacher: {
    name: "Dr. K. Arulnesan",
    email: "tutor@soloclass.lk",
    detail: "Master Tutor & Course Creator",
    school: "Apex Science Academy"
  },
  admin: {
    name: "Class Operations Admin",
    email: "admin@soloclass.lk",
    detail: "Tuition Desk Administration",
    school: "Apex Science Academy"
  }
};
