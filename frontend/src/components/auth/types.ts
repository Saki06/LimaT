export type SupportedRole = "student" | "parent" | "teacher" | "admin" | "super_admin";
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
    email: "student@apex.edu",
    detail: "2026 A/L Combined Maths",
    school: "Apex Science Academy"
  },
  parent: {
    name: "Robert Morgan",
    email: "parent@apex.edu",
    detail: "Parent of Alex Morgan (Fee & Attendance)",
    school: "Apex Science Academy"
  },
  teacher: {
    name: "Sarah Jenkins",
    email: "teacher@apex.edu",
    detail: "Master Tutor & Course Creator",
    school: "Apex Science Academy"
  },
  admin: {
    name: "Class Operations Admin",
    email: "admin@apex.edu",
    detail: "School Desk Administration",
    school: "Apex Science Academy"
  },
  super_admin: {
    name: "Chief Administrator",
    email: "superadmin@apex.edu",
    detail: "Global Multi-Tenant Platform Control",
    school: "Apex Academy Global (SaaS Platform)"
  }
};
