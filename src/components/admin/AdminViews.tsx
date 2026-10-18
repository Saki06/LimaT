"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApp } from "@/context/AppContext";
import { useAdmin, useCreateStaff, useHubFlags, useHubSettings, useSetStaffStatus, useStaff, useSubscriptions, useTeacherHubs, useUpdateStaff } from "@/context/AdminContext";
import { AdminRecordStatus, AdminStaffRecord, StaffInput, ConnectTeacher, TutorPackage } from "@/types/lms";
import { initialConnectTeachers, initialTutorPackages } from "@/data/connectMockData";
import {
  Building2,
  Users,
  School,
  Plus,
  BookOpen,
  Shield,
  Settings,
  Bell,
  Search,
  Edit,
  Eye,
  GraduationCap,
  UserCheck,
  Globe,
  Calendar,
  Activity,
  Database,
  MoreHorizontal,
  MoreVertical,
  Trash2,
  ArrowUpDown,
  Download,
  X,
  Trophy,
  CheckCircle2,
  Lock,
  Unlock,
  Package,
  CreditCard,
  Video,
  ExternalLink,
  Star,
  DollarSign,
  Check,
  Sparkles,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

interface AdminViewsProps {
  initialTab?: "overview" | "schools" | "classes" | "subjects" | "users" | "settings" | "staff" | "connect";
}

function currentTabForView(initialTab: NonNullable<AdminViewsProps["initialTab"]>) {
  return initialTab;
}

export function AdminViews({ initialTab = "overview" }: AdminViewsProps) {
  const {
    schools,
    grades,
    classes,
    subjects,
    courses,
    events,
    announcements,
    teams,
    currentView,
    createSchool,
    createClass,
    createSubject,
    updateSubject,
    deleteSubject,
    currentUser,
    setCurrentView,
    addToast
  } = useApp();
  const staff = useStaff();
  const teacherHubs = useTeacherHubs();
  const subscriptions = useSubscriptions();
  const hubFlags = useHubFlags();
  const hubSettings = useHubSettings();
  const { setHubStatus, actOnHubFlag, removeSubscription, updateHubSettings } = useAdmin();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const setStaffStatus = useSetStaffStatus();
  const [now] = useState(() => Date.now());

  const activeAdminTab = currentView === "schools" ? "schools" :
    currentView === "classes" ? "classes" :
    currentView === "subjects" ? "subjects" :
    currentView === "users" ? "users" :
    currentView === "settings" || currentView === "admin_settings" ? "settings" :
    currentView === "staff_teachers" || currentView === "staff_coaches" ? "staff" :
    currentView === "connect_admin" ? "connect" :
    currentTabForView(initialTab);

  // School modal state
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [province, setProvince] = useState("Western");
  const [principal, setPrincipal] = useState("");

  // Class modal state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [gradeId, setGradeId] = useState("grd_12");
  const [classTeacher, setClassTeacher] = useState("Mr. Samantha Perera");

  // Subject modal state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectGradeId, setSubjectGradeId] = useState("grd_12");

  // Subject 3-dot menu and edit/delete states
  const [openSubjectMenuId, setOpenSubjectMenuId] = useState<string | null>(null);
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<import("@/types/lms").Subject | null>(null);
  const [editSubjectName, setEditSubjectName] = useState("");
  const [editSubjectCode, setEditSubjectCode] = useState("");
  const [editSubjectGradeId, setEditSubjectGradeId] = useState("grd_12");
  const [deletingSubject, setDeletingSubject] = useState<import("@/types/lms").Subject | null>(null);

  const handleOpenEditSubject = (sub: import("@/types/lms").Subject) => {
    setEditingSubject(sub);
    setEditSubjectName(sub.name);
    setEditSubjectCode(sub.code);
    setEditSubjectGradeId(sub.gradeId || "grd_12");
    setIsEditSubjectModalOpen(true);
  };

  const handleSaveEditSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    const grade = grades.find((g) => g.id === editSubjectGradeId);
    updateSubject(editingSubject.id, {
      name: editSubjectName,
      code: editSubjectCode,
      gradeId: editSubjectGradeId,
      gradeName: grade?.name || "Grade 12"
    });
    setIsEditSubjectModalOpen(false);
    setEditingSubject(null);
  };

  const handleConfirmDeleteSubject = () => {
    if (!deletingSubject) return;
    deleteSubject(deletingSubject.id);
    setDeletingSubject(null);
  };

  // User search
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "student" | "teacher" | "admin">("all");
  const [staffSearch, setStaffSearch] = useState("");
  const [staffRoleFilter, setStaffRoleFilter] = useState<"coach" | "teacher">("coach");
  const [staffStatusFilter, setStaffStatusFilter] = useState<"all" | AdminRecordStatus>("all");
  const [staffSubjectFilter, setStaffSubjectFilter] = useState("all");
  const [staffSort, setStaffSort] = useState<"name" | "status">("name");
  const [staffPage, setStaffPage] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState<AdminStaffRecord | null>(null);
  const [staffDrawerTab, setStaffDrawerTab] = useState("profile");
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminStaffRecord | null>(null);
  const [staffMenuId, setStaffMenuId] = useState<string | null>(null);
  const [confirmStaff, setConfirmStaff] = useState<AdminStaffRecord | null>(null);
  const [hubTab, setHubTab] = useState<"overview" | "hubs" | "moderation" | "settings">("overview");
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
  const [hubReason, setHubReason] = useState("");
  const [hubAction, setHubAction] = useState<"pause" | "suspend" | "flag" | "hide" | "remove" | "warn" | "dismiss" | null>(null);
  const [hubSettingsDraft, setHubSettingsDraft] = useState(hubSettings);
  const hubSettingsSchema = z.object({
    enabled: z.boolean(),
    approvalRequired: z.boolean(),
    allowDirectMessages: z.boolean(),
    maxSubscribersPerTeacher: z.number().int().positive().optional()
  });
  const activeHub = teacherHubs.find((hub) => hub.id === selectedHubId);
  const hubSubscriptions = subscriptions.filter((subscription) => subscription.teacherId === activeHub?.teacherId && subscription.status !== "removed");

  const staffSchema = z.object({
    role: z.enum(["teacher", "coach"]),
    name: z.string().min(2, "Name is required"),
    photo: z.string().optional(),
    staffId: z.string().min(2, "Staff ID is required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().regex(/^\+?[0-9 ()-]{7,}$/, "Enter a valid phone number"),
    gender: z.enum(["female", "male", "other"]),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    joiningDate: z.string().min(1, "Joining date is required"),
    status: z.enum(["active", "on_leave", "resigned", "inactive"]),
    qualification: z.string().optional(),
    subjects: z.string().optional(),
    classes: z.string().optional(),
    classTeacherOf: z.string().optional(),
    medium: z.enum(["english", "tamil", "sinhala"]).optional(),
    sports: z.string().optional(),
    teams: z.string().optional(),
    certification: z.string().optional(),
    availability: z.string().optional()
  });
  type StaffFormValues = z.infer<typeof staffSchema>;
  const staffForm = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { role: "teacher", gender: "other", status: "active", subjects: "", classes: "", sports: "", teams: "", medium: "english" }
  });

  // Settings & SaaS Platform Monetization State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [enrollmentOpen, setEnrollmentOpen] = useState(true);
  const [defaultLocale, setDefaultLocale] = useState("en");
  const [platformCommissionRate, setPlatformCommissionRate] = useState<number>(10);
  const [tutorPayoutCycle, setTutorPayoutCycle] = useState<string>("monthly");
  const [minPayoutThreshold, setMinPayoutThreshold] = useState<number>(5000);
  const [allowDirectBankSlip, setAllowDirectBankSlip] = useState<boolean>(true);
  const [allowOnlineCardPayment, setAllowOnlineCardPayment] = useState<boolean>(true);
  const [allowTutorSelfRegistration, setAllowTutorSelfRegistration] = useState<boolean>(true);
  const [requirePackageApproval, setRequirePackageApproval] = useState<boolean>(false);
  const [currencySymbol, setCurrencySymbol] = useState<string>("LKR");
  const [minPackagePrice, setMinPackagePrice] = useState<number>(1000);
  const [maxPackagePrice, setMaxPackagePrice] = useState<number>(50000);

  // Platform user directory state & mock records
  const [platformUsers, setPlatformUsers] = useState([
    {
      id: "usr_admin_01",
      name: "Dr. K. Rajasingham",
      email: "principal@school.lk",
      role: "admin",
      school: "St. Michael High School",
      grade: "Administration Staff",
      status: "Active",
      lastLogin: "2026-10-01 08:15",
      enrolledTutors: [] as string[],
      subscriptionStatus: "Platform Admin"
    },
    {
      id: "usr_student_01",
      name: "Sathurjan K.",
      email: "sathurjan@school.lk",
      role: "student",
      school: "Colombo Hindu College",
      grade: "Grade 12 - Physical Science",
      status: "Active",
      lastLogin: "2026-10-01 06:50",
      enrolledTutors: ["Ms. Kavitha Rajan (Combined Maths)", "Mr. Thuvaragan S. (Physics)"],
      subscriptionStatus: "Active Paid (2 Tutors)"
    },
    {
      id: "usr_student_02",
      name: "Kasun Bandara",
      email: "kasun.b@school.lk",
      role: "student",
      school: "St. Michael High School",
      grade: "Grade 12 - Physical Science",
      status: "Active",
      lastLogin: "2026-09-30 18:05",
      enrolledTutors: ["Ms. Kavitha Rajan (Combined Maths)"],
      subscriptionStatus: "Active Paid (1 Tutor)"
    },
    {
      id: "usr_student_03",
      name: "Anuki Silva",
      email: "anuki.s@school.lk",
      role: "student",
      school: "Royal Academy Colombo",
      grade: "Grade 13 - Biological Science",
      status: "Active",
      lastLogin: "2026-10-01 07:12",
      enrolledTutors: ["Dr. Sarath Perera (Chemistry)", "Mrs. Shanthi Mohan (Biology)"],
      subscriptionStatus: "Active Paid (2 Tutors)"
    },
    {
      id: "usr_student_04",
      name: "Dineth Perera",
      email: "dineth.p@school.lk",
      role: "student",
      school: "Trinity Central College",
      grade: "Grade 12 - Technology & ICT",
      status: "Active",
      lastLogin: "2026-09-28 16:30",
      enrolledTutors: ["Mr. Ketheesan K. (ICT & Computing)"],
      subscriptionStatus: "Active Paid (1 Tutor)"
    },
    {
      id: "usr_student_05",
      name: "Tharushi Fernando",
      email: "tharushi.f@school.lk",
      role: "student",
      school: "Hillwood Central College",
      grade: "Grade 11 - G.C.E. O/L",
      status: "Active",
      lastLogin: "2026-09-30 14:10",
      enrolledTutors: [] as string[],
      subscriptionStatus: "Free Student"
    },
    {
      id: "usr_teacher_01",
      name: "Ms. Kavitha Rajan",
      email: "kavitha.rajan@limat.lk",
      role: "teacher",
      school: "Independent Tutor Studio",
      grade: "Faculty - Combined Mathematics",
      status: "Active",
      lastLogin: "2026-10-01 07:30",
      enrolledTutors: [] as string[],
      subscriptionStatus: "Tutor (284 Students)"
    },
    {
      id: "usr_teacher_02",
      name: "Mr. Thuvaragan S.",
      email: "thuvaragan.s@limat.lk",
      role: "teacher",
      school: "Independent Tutor Studio",
      grade: "Faculty - Physics",
      status: "Active",
      lastLogin: "2026-09-30 15:20",
      enrolledTutors: [] as string[],
      subscriptionStatus: "Tutor (197 Students)"
    }
  ]);

  // Tutors Management State
  const [soloTutors, setSoloTutors] = useState<ConnectTeacher[]>(initialConnectTeachers);
  const [tutorPackages, setTutorPackages] = useState<TutorPackage[]>(initialTutorPackages);
  const [staffSubTab, setStaffSubTab] = useState<"solo_tutors" | "coaches">("solo_tutors");
  const [tutorSearch, setTutorSearch] = useState("");
  const [tutorSubjectFilter, setTutorSubjectFilter] = useState("all");
  const [tutorStatusFilter, setTutorStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [selectedTutorForView, setSelectedTutorForView] = useState<ConnectTeacher | null>(null);
  const [selectedTutorForEdit, setSelectedTutorForEdit] = useState<ConnectTeacher | null>(null);
  const [isAddTutorModalOpen, setIsAddTutorModalOpen] = useState(false);
  const [deletingTutor, setDeletingTutor] = useState<ConnectTeacher | null>(null);

  const initialNewTutorForm = {
    name: "",
    title: "Mathematics Specialist • Grade 12 & A/L",
    subject: "Combined Mathematics",
    monthlyFee: 2500,
    meetUrl: "https://meet.google.com/new-tutor-live",
    bio: "Passionate educator with structured lessons and past paper breakdowns.",
    qualifications: "B.Sc. (Hons), Dip. in Education",
    verified: true
  };
  const [newTutorForm, setNewTutorForm] = useState(initialNewTutorForm);

  // Student Dossier & Manual Enroll states
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<typeof platformUsers[0] | null>(null);
  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState<typeof platformUsers[0] | null>(null);
  const [manualEnrollTutorName, setManualEnrollTutorName] = useState("Ms. Kavitha Rajan (Combined Maths)");
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    email: "",
    school: "Colombo Hindu College",
    grade: "Grade 12 - Physical Science",
    enrolledTutor: "Ms. Kavitha Rajan (Combined Maths)"
  });

  // Filtered Tutors
  const filteredSoloTutors = useMemo(() => {
    return soloTutors.filter((t) => {
      const matchSearch =
        !tutorSearch.trim() ||
        t.name.toLowerCase().includes(tutorSearch.toLowerCase()) ||
        t.subject.toLowerCase().includes(tutorSearch.toLowerCase()) ||
        t.qualifications.toLowerCase().includes(tutorSearch.toLowerCase());
      const matchSubject = tutorSubjectFilter === "all" || t.subject.toLowerCase().includes(tutorSubjectFilter.toLowerCase());
      const matchStatus = tutorStatusFilter === "all" || (tutorStatusFilter === "active" ? t.verified : !t.verified);
      return matchSearch && matchSubject && matchStatus;
    });
  }, [soloTutors, tutorSearch, tutorSubjectFilter, tutorStatusFilter]);

  const handleToggleTutorVerification = (tutorId: string) => {
    setSoloTutors((prev) =>
      prev.map((t) => (t.id === tutorId ? { ...t, verified: !t.verified } : t))
    );
    const t = soloTutors.find((item) => item.id === tutorId);
    addToast({
      type: "success",
      title: "Tutor Status Updated",
      message: `${t?.name || "Tutor"} verification badge is now ${!t?.verified ? "VERIFIED ✓" : "UNVERIFIED"}.`
    });
  };

  const handleToggleTutorSuspension = (tutorId: string) => {
    setSoloTutors((prev) =>
      prev.map((t) => (t.id === tutorId ? { ...t, rating: t.rating > 0 ? 0 : 4.9 } : t))
    );
    const t = soloTutors.find((item) => item.id === tutorId);
    const isNowSuspended = (t?.rating || 0) > 0;
    addToast({
      type: isNowSuspended ? "warning" : "success",
      title: "Account Status Changed",
      message: `${t?.name || "Tutor"} has been ${isNowSuspended ? "Suspended" : "Activated"}.`
    });
  };

  const handleSaveAddTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTutorForm.name.trim()) return;
    const newTutor: ConnectTeacher = {
      id: `ct_${Date.now()}`,
      name: newTutorForm.name.trim(),
      initials: newTutorForm.name.split(" ").map((w) => w[0]).join("").toUpperCase().substring(0, 2),
      avatarColor: "bg-[#0d5c4d]",
      verified: newTutorForm.verified,
      title: newTutorForm.title,
      subject: newTutorForm.subject,
      studentsCount: 0,
      lessonsCount: 12,
      liveClassesCount: 3,
      monthlyFee: Number(newTutorForm.monthlyFee) || 2500,
      currency: "LKR",
      rating: 5.0,
      tags: [newTutorForm.subject, "A/L Revision", "Theory"],
      meetUrl: newTutorForm.meetUrl,
      bio: newTutorForm.bio,
      qualifications: newTutorForm.qualifications
    };
    setSoloTutors((prev) => [newTutor, ...prev]);
    setIsAddTutorModalOpen(false);
    setNewTutorForm(initialNewTutorForm);
    addToast({ type: "success", title: "Tutor Registered!", message: `${newTutor.name} is now enrolled in the LMS.` });
  };

  const handleConfirmDeleteTutor = () => {
    if (!deletingTutor) return;
    setSoloTutors((prev) => prev.filter((t) => t.id !== deletingTutor.id));
    setDeletingTutor(null);
    addToast({ type: "info", title: "Tutor Removed", message: "Tutor profile deleted from platform." });
  };

  const handleManualEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForEnroll) return;
    setPlatformUsers((prev) =>
      prev.map((u) => {
        if (u.id === selectedStudentForEnroll.id) {
          const currentTutors = u.enrolledTutors || [];
          const updated = currentTutors.includes(manualEnrollTutorName)
            ? currentTutors
            : [...currentTutors, manualEnrollTutorName];
          return {
            ...u,
            enrolledTutors: updated,
            subscriptionStatus: `Active Paid (${updated.length} Tutors)`
          };
        }
        return u;
      })
    );
    setSelectedStudentForEnroll(null);
    addToast({
      type: "success",
      title: "Enrollment Confirmed",
      message: `Enrolled ${selectedStudentForEnroll.name} into ${manualEnrollTutorName}!`
    });
  };

  const handleSaveAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name.trim() || !newStudentForm.email.trim()) return;
    const newStud = {
      id: `usr_student_${Date.now()}`,
      name: newStudentForm.name.trim(),
      email: newStudentForm.email.trim(),
      role: "student" as const,
      school: newStudentForm.school,
      grade: newStudentForm.grade,
      status: "Active",
      lastLogin: "Just now",
      enrolledTutors: newStudentForm.enrolledTutor ? [newStudentForm.enrolledTutor] : [],
      subscriptionStatus: newStudentForm.enrolledTutor ? "Active Paid (1 Tutor)" : "Free Student"
    };
    setPlatformUsers((prev) => [newStud, ...prev]);
    setIsAddStudentModalOpen(false);
    setNewStudentForm({
      name: "",
      email: "",
      school: "Colombo Hindu College",
      grade: "Grade 12 - Physical Science",
      enrolledTutor: "Ms. Kavitha Rajan (Combined Maths)"
    });
    addToast({ type: "success", title: "Student Registered", message: `${newStud.name} added to student directory!` });
  };

  // User 3-dot menu and action states
  const [openUserMenuId, setOpenUserMenuId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<typeof platformUsers[0] | null>(null);
  const [editingUser, setEditingUser] = useState<typeof platformUsers[0] | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState<"student" | "teacher" | "admin">("student");
  const [editUserSchool, setEditUserSchool] = useState("");
  const [editUserStatus, setEditUserStatus] = useState("Active");
  const [deletingUser, setDeletingUser] = useState<typeof platformUsers[0] | null>(null);

  const handleOpenEditUser = (user: typeof platformUsers[0]) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role as "student" | "teacher" | "admin");
    setEditUserSchool(user.school);
    setEditUserStatus(user.status);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setPlatformUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: editUserName,
              email: editUserEmail,
              role: editUserRole,
              school: editUserSchool,
              status: editUserStatus
            }
          : u
      )
    );
    setEditingUser(null);
    addToast({ type: "success", title: "User Details Updated Successfully!" });
  };

  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return;
    setPlatformUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    setDeletingUser(null);
    addToast({ type: "info", title: "User Account Removed Successfully" });
  };

  const filteredUsers = platformUsers.filter((u) => {
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    const matchesSearch =
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredStaff = staff.filter((member) => {
    const matchesRole = member.role === staffRoleFilter;
    const query = staffSearch.toLowerCase();
    const matchesStatus = staffStatusFilter === "all" || member.status === staffStatusFilter;
    const matchesSubject = staffSubjectFilter === "all" ||
      (staffRoleFilter === "teacher" ? member.subjects?.includes(staffSubjectFilter) : member.sport === staffSubjectFilter);
    return matchesRole && matchesStatus && matchesSubject && (!query ||
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.staffId.toLowerCase().includes(query));
  }).sort((a, b) => staffSort === "status" ? a.status.localeCompare(b.status) : a.name.localeCompare(b.name));
  const staffPageSize = 10;
  const staffPageCount = Math.max(1, Math.ceil(filteredStaff.length / staffPageSize));
  const pagedStaff = filteredStaff.slice((staffPage - 1) * staffPageSize, staffPage * staffPageSize);
  const staffSubjects = Array.from(new Set(staff.filter((member) => member.role === "teacher").flatMap((member) => member.subjects || [])));
  const staffSports = Array.from(new Set(staff.filter((member) => member.role === "coach").map((member) => member.sport).filter((sport): sport is string => Boolean(sport))));

  const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);
  const totalTeachers = schools.reduce((sum, s) => sum + s.teacherCount, 0);

  const handleCreateSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName) return;
    createSchool({
      name: schoolName,
      code: schoolCode,
      district,
      province,
      principal,
      studentCount: 850,
      teacherCount: 50
    });
    setIsSchoolModalOpen(false);
    setSchoolName("");
    setSchoolCode("");
    setPrincipal("");
  };

  const handleCreateClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className) return;
    const g = grades.find((gr) => gr.id === gradeId);
    createClass({
      name: className,
      gradeId,
      gradeName: g?.name || "Grade 12"
    });
    setIsClassModalOpen(false);
    setClassName("");
  };

  const handleCreateSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName) return;
    const g = grades.find((gr) => gr.id === subjectGradeId);
    createSubject({
      name: subjectName,
      code: subjectCode || "SUB-01",
      gradeId: subjectGradeId,
      gradeName: g?.name || "Grade 12 (A/L)"
    });
    setIsSubjectModalOpen(false);
    setSubjectName("");
    setSubjectCode("");
  };

  const openStaffForm = (member?: AdminStaffRecord) => {
    setEditingStaff(member || null);
    staffForm.reset(member ? {
      role: member.role, name: member.name, photo: member.photo, staffId: member.staffId, email: member.email,
      phone: member.phone || "", gender: member.gender || "other", dateOfBirth: member.dateOfBirth || "",
      joiningDate: member.joiningDate || "", status: member.status, qualification: member.qualification || "",
      subjects: member.subjects?.join(", ") || "", classes: member.classes?.join(", ") || "",
      classTeacherOf: member.classTeacherOf || "", medium: member.medium || "english",
      sports: member.sport || "", teams: member.teams?.join(", ") || "",
      certification: member.certification || "", availability: member.availability || ""
    } : { role: staffRoleFilter, name: "", photo: "", staffId: "", email: "", phone: "", gender: "other", dateOfBirth: "", joiningDate: "", status: "active", qualification: "", subjects: "", classes: "", classTeacherOf: "", medium: "english", sports: "", teams: "", certification: "", availability: "" });
    setIsStaffModalOpen(true);
  };

  const submitStaffForm = (values: StaffFormValues) => {
    const input: StaffInput = {
      ...values,
      subjects: values.subjects?.split(",").map((item) => item.trim()).filter(Boolean) || [],
      classes: values.classes?.split(",").map((item) => item.trim()).filter(Boolean) || [],
      sports: values.sports?.split(",").map((item) => item.trim()).filter(Boolean) || [],
      teams: values.teams?.split(",").map((item) => item.trim()).filter(Boolean) || []
    };
    const result = editingStaff ? updateStaff(editingStaff.id, input) : createStaff(input);
    if (!result.ok) {
      addToast({ type: "error", title: "Unable to save staff", message: result.error });
      return;
    }
    addToast({ type: "success", title: editingStaff ? "Staff updated" : "Staff added" });
    setIsStaffModalOpen(false);
  };

  const exportStaffCsv = () => {
    const csv = [["Name", "Staff ID", "Email", "Role", "Status"], ...filteredStaff.map((member) => [member.name, member.staffId, member.email, member.role, member.status])].map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `${currentUser.schoolName.replace(/\s+/g, "-").toLowerCase()}-staff.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Legacy admin header remains for the non-staff administration screens. */}
      {!["staff", "subjects", "users", "settings", "connect"].includes(activeAdminTab) && <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6ece8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#f3b738]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#b47a16]">
              Multi-School Administration
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0d2b26] mt-1">Administrator Control Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure schools, academic curricula, grade streams, faculty allocations, and system permissions.
          </p>
        </div>

      </div>}

      {/* TAB: Dashboard Overview */}
      {activeAdminTab === "overview" && (
        <div className="space-y-6">
          {/* SaaS Operational Quick-Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tutors Card */}
            <Card className="border-[#c4e9e0] bg-linear-to-br from-[#f2fbf8] to-white shadow-2xs hover:shadow-xs transition-shadow">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-[#0d5c4d] text-white flex items-center justify-center shadow-xs">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <Badge variant="success" className="text-[10px] font-bold">
                    {soloTutors.filter((t) => t.verified).length} Verified
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#0d2b26]">{soloTutors.length}</p>
                  <p className="text-xs font-bold text-[#0d5c4d] mt-0.5">Tutors Hub (தனிப்பட்ட ஆசிரியர்கள்)</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Manage tutor verification, fee packages, Google Meet classroom links, and subscriber counts.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#e2eae5]">
                  <Button
                    size="sm"
                    onClick={() => {
                      setCurrentView("staff_teachers");
                      setStaffSubTab("solo_tutors");
                    }}
                    className="w-full bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold"
                  >
                    Manage Tutors →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Students & Subscriptions Card */}
            <Card className="border-[#f3e5c8] bg-linear-to-br from-[#fefbf2] to-white shadow-2xs hover:shadow-xs transition-shadow">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-[#b47a16] text-white flex items-center justify-center shadow-xs">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <Badge variant="warning" className="text-[10px] font-bold">
                    {platformUsers.filter((u) => u.role === "student").length} Registered
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#0d2b26]">
                    {platformUsers.filter((u) => u.role === "student").length}
                  </p>
                  <p className="text-xs font-bold text-[#b47a16] mt-0.5">Student Directory (மாணவர்கள் & சந்தா)</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Oversee student tutor enrollments, activate/suspend access, and manage subscriptions.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#f2e7d3]">
                  <Button
                    size="sm"
                    onClick={() => {
                      setCurrentView("users");
                      setUserRoleFilter("student");
                    }}
                    className="w-full bg-[#b47a16] hover:bg-[#8f6010] text-white text-xs font-bold"
                  >
                    Manage Students →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sports Administration Card */}
            <Card className="border-[#c9e2fa] bg-linear-to-br from-[#f4f9ff] to-white shadow-2xs hover:shadow-xs transition-shadow">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-[#1d6fa5] text-white flex items-center justify-center shadow-xs">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-[#1d6fa5] text-[#1d6fa5]">
                    {teams.length} Teams Ready
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#0d2b26]">Sports Hub</p>
                  <p className="text-xs font-bold text-[#1d6fa5] mt-0.5">Tournaments & Scores (விளையாட்டு)</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Create inter-school tournaments, fixtures, record live match scores, and track standings.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#d8e9f8]">
                  <Button
                    size="sm"
                    onClick={() => setCurrentView("sports_admin")}
                    className="w-full bg-[#1d6fa5] hover:bg-[#145077] text-white text-xs font-bold"
                  >
                    Open Sports Admin →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* KPI Cards */}
          <div className="order-3 grid grid-cols-1 gap-3 lg:col-start-2 lg:row-start-1">

            <Card className="border-[#e6ece8] bg-white shadow-2xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Active Classes</p>
                  <p className="text-2xl font-black text-[#0d5c4d] mt-1">{classes.length}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Across {grades.length} grade levels</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
                  <School className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e6ece8] bg-white shadow-2xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Total Students</p>
                  <p className="text-2xl font-black text-[#b47a16] mt-1">{totalStudents}</p>
                  <p className="text-[10px] text-[#b47a16] font-bold mt-0.5">Enrolled across all streams</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-[#fef7e6] text-[#b47a16] flex items-center justify-center">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e6ece8] bg-white shadow-2xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Tutors</p>
                  <p className="text-2xl font-black text-[#0d5c4d] mt-1">{soloTutors.length}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{soloTutors.filter((t) => t.verified).length} verified instructors</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
                  <UserCheck className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Health Summary */}
          <div className="order-1 grid grid-cols-1 gap-6 lg:col-start-1 lg:row-start-1">
            <Card className="border-[#e6ece8] bg-white shadow-2xs">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-sm font-black text-[#0d2b26]">
                  Platform Operational Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3.5">
                <div className="p-3.5 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Activity className="h-4 w-4 text-[#0d5c4d]" />
                    <div>
                      <p className="text-xs font-bold text-[#0d5c4d]">System Uptime</p>
                      <p className="text-[10px] text-slate-500">SLA: 99.9% compliance</p>
                    </div>
                  </div>
                  <Badge variant="success">99.97%</Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Database className="h-4 w-4 text-slate-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Active Courses</p>
                      <p className="text-[10px] text-slate-500">Courses published across all schools</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono">{courses.length}</Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Upcoming Events</p>
                      <p className="text-[10px] text-slate-500">Events published for students</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {events.filter((e) => e.status === "published").length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Summary Tables Row */}
          <div className="order-2 grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-start-1 lg:row-start-2">
            {/* Recent Announcements */}
            <Card className="border-[#e6ece8] bg-white shadow-2xs">
              <CardHeader className="p-5 pb-3 border-b border-[#e6ece8]">
                <CardTitle className="text-sm font-black text-[#0d2b26] flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#0d5c4d]" />
                  Recent Announcements ({announcements.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {announcements.slice(0, 3).map((ann, i) => (
                  <div
                    key={ann.id}
                    className={`flex items-center justify-between p-4 text-xs ${
                      i < 2 ? "border-b border-[#e6ece8]" : ""
                    } hover:bg-[#f8faf9]`}
                  >
                    <div>
                      <p className="font-bold text-slate-900">{ann.title}</p>
                      <p className="text-slate-500 mt-0.5">{ann.publishedAt} — {ann.targetAudience}</p>
                    </div>
                    <Badge variant={ann.priority === "high" ? "warning" : "success"} className="text-[10px]">
                      {ann.priority === "high" ? "Urgent" : "Standard"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Sports Teams Summary */}
            <Card className="border-[#e6ece8] bg-white shadow-2xs">
              <CardHeader className="p-5 pb-3 border-b border-[#e6ece8]">
                <CardTitle className="text-sm font-black text-[#0d2b26] flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#0d5c4d]" />
                  Active Sports Teams ({teams.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {teams.slice(0, 3).map((team, i) => (
                  <div
                    key={team.id}
                    className={`flex items-center justify-between p-4 text-xs ${
                      i < 2 ? "border-b border-[#e6ece8]" : ""
                    } hover:bg-[#f8faf9]`}
                  >
                    <div>
                      <p className="font-bold text-slate-900">{team.name}</p>
                      <p className="text-slate-500 mt-0.5">Coach: {team.coachName} · {team.playersCount} Players</p>
                    </div>
                    <Badge variant={team.status === "active" ? "success" : "default"} className="text-[10px]">
                      {team.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      )}

      {/* TAB: Schools Setup */}
      {activeAdminTab === "schools" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#0d2b26] flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#0d5c4d]" />
                Registered School Campuses
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-school institutions connected to the LimaT Smart Book platform.
              </p>
            </div>
            <Button
              onClick={() => setIsSchoolModalOpen(true)}
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-2 text-xs shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add School
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schools.map((sch) => (
              <Card key={sch.id} className="border-[#e6ece8] bg-white shadow-2xs hover:shadow-xs transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="success" className="text-[10px] font-bold">{sch.code}</Badge>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Globe className="h-3 w-3" />
                      <span>{sch.district}, {sch.province} Province</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#0d2b26]">{sch.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Principal: {sch.principal}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#f0f4f1]">
                    <div className="text-center p-2 rounded-xl bg-[#ecf8f5]">
                      <p className="text-lg font-black text-[#0d5c4d]">{sch.studentCount}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Students</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-[#fef7e6]">
                      <p className="text-lg font-black text-[#b47a16]">{sch.teacherCount}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Teachers</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-[#f8faf9]">
                      <p className="text-lg font-black text-slate-700">
                        {classes.filter((c) => c.gradeName.includes("12")).length}
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold">Classes</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button variant="outline" className="text-xs font-bold border-[#c4e9e0] text-[#0d5c4d] hover:bg-[#ecf8f5] h-8">
                      <Eye className="h-3 w-3 mr-1" /> View Details
                    </Button>
                    <Button variant="outline" className="text-xs font-bold h-8">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Classes & Grades */}
      {activeAdminTab === "classes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#0d2b26] flex items-center gap-2">
                <School className="h-5 w-5 text-[#0d5c4d]" />
                Academic Streams & Classes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure G.C.E O/L and A/L grade-level streams and allocate class teachers.
              </p>
            </div>
            <Button
              onClick={() => setIsClassModalOpen(true)}
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-2 text-xs shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Create Class
            </Button>
          </div>

          {/* Grade Level Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {grades.map((g) => {
              const gradeClasses = classes.filter((c) => c.gradeId === g.id);
              const totalStudentsInGrade = gradeClasses.reduce((sum, c) => sum + c.studentCount, 0);

              return (
                <Card key={g.id} className="border-[#e6ece8] bg-white shadow-2xs">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono text-[#0d5c4d] bg-[#ecf8f5] border-[#c4e9e0] text-xs">
                        {g.code}
                      </Badge>
                      <span className="text-xs text-slate-400">{gradeClasses.length} classes</span>
                    </div>
                    <h3 className="text-sm font-black text-[#0d2b26] mt-2">{g.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{totalStudentsInGrade} enrolled students</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Classes Table */}
          <Card className="border-[#e6ece8] bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e6ece8] bg-[#f8faf9] text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <th className="p-4">Class Name</th>
                    <th className="p-4">Grade Level</th>
                    <th className="p-4">Class Teacher</th>
                    <th className="p-4">Enrolled Students</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6ece8] text-slate-700">
                  {classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-[#fbfcfb] transition-colors">
                      <td className="p-4 font-bold text-[#0d2b26]">{cls.name}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px] font-mono">{cls.gradeName}</Badge>
                      </td>
                      <td className="p-4 text-[#0d5c4d] font-bold">{cls.classTeacherName}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{cls.studentCount}</span>
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0d5c4d] rounded-full"
                              style={{ width: `${Math.min((cls.studentCount / 50) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="success" className="text-[10px]">Active</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="outline" size="sm" className="h-7 text-xs font-bold">
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB: Manage Tutors & Sports Coaches */}
      {activeAdminTab === "staff" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4 border-b border-[#e6ece8] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#b47a16]">
                {staffSubTab === "solo_tutors" ? "LimaT Independent Tutor Network" : "LimaT Athletics & Sports Coaching"}
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#0d2b26]">
                {staffSubTab === "solo_tutors" ? "Tutors Management (தனிப்பட்ட ஆசிரியர்கள்)" : "Sports Coaches Management (விளையாட்டு பயிற்றுநர்கள்)"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {staffSubTab === "solo_tutors"
                  ? "Oversee independent tutors, verification badges, monthly fee packages, Google Meet classrooms, and active subscribers."
                  : "Manage dedicated athletic coaches, sports disciplines, team assignments, and coaching rosters."}
              </p>
            </div>
            <div className="flex gap-2">
              {staffSubTab === "solo_tutors" ? (
                <Button
                  onClick={() => setIsAddTutorModalOpen(true)}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-2 text-xs shadow-xs"
                >
                  <Plus className="h-4 w-4" /> Enroll New Tutor
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={exportStaffCsv}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                  </Button>
                  <Button onClick={() => openStaffForm()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Sports Coach
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Subtab Selector */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStaffSubTab("solo_tutors")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                staffSubTab === "solo_tutors"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-[#ecf8f5] border border-slate-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Tutors ({soloTutors.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStaffSubTab("coaches");
                setCurrentView("staff_coaches");
                setStaffPage(1);
              }}
              className={`rounded-full px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                staffSubTab === "coaches"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-[#ecf8f5] border border-slate-200"
              }`}
            >
              <Trophy className="h-3.5 w-3.5" /> Sports Coaches ({staff.filter((m) => m.role === "coach").length})
            </button>
          </div>

          {/* SUBTAB 1: TUTORS DIRECTORY & CONTROLS */}
          {staffSubTab === "solo_tutors" && (
            <div className="space-y-4">
              {/* Quick KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="border-[#e6ece8] bg-white p-3.5 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Active Tutors</p>
                  <p className="text-xl font-black text-[#0d2b26] mt-0.5">{soloTutors.length}</p>
                </Card>
                <Card className="border-[#e6ece8] bg-white p-3.5 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Verified Badges</p>
                  <p className="text-xl font-black text-[#0d5c4d] mt-0.5">
                    {soloTutors.filter((t) => t.verified).length}
                  </p>
                </Card>
                <Card className="border-[#e6ece8] bg-white p-3.5 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Subscribers</p>
                  <p className="text-xl font-black text-[#b47a16] mt-0.5">
                    {soloTutors.reduce((acc, t) => acc + t.studentsCount, 0)}
                  </p>
                </Card>
                <Card className="border-[#e6ece8] bg-white p-3.5 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Average Rating</p>
                  <p className="text-xl font-black text-[#0d2b26] mt-0.5 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9
                  </p>
                </Card>
              </div>

              {/* Filters Bar */}
              <Card className="border-[#e6ece8] bg-white shadow-2xs">
                <div className="p-3.5 flex flex-col md:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={tutorSearch}
                      onChange={(e) => tutorSearch !== e.target.value && setTutorSearch(e.target.value)}
                      placeholder="Search tutor name, subject, degree..."
                      className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-[#f8faf9] text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <select
                      value={tutorSubjectFilter}
                      onChange={(e) => setTutorSubjectFilter(e.target.value)}
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-[#0d5c4d]"
                    >
                      <option value="all">All Subjects</option>
                      <option value="Combined Mathematics">Combined Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Information & Communication Technology">ICT</option>
                    </select>

                    <select
                      value={tutorStatusFilter}
                      onChange={(e) => setTutorStatusFilter(e.target.value as "all" | "active" | "suspended")}
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-[#0d5c4d]"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Verified Badged Only</option>
                      <option value="suspended">Unverified / Pending</option>
                    </select>
                  </div>
                </div>

                {/* Tutors Table */}
                <div className="overflow-x-auto border-t border-[#e6ece8]">
                  <table className="w-full min-w-[840px] text-left text-xs">
                    <thead className="bg-[#f8faf9] text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="p-3.5">Tutor Profile</th>
                        <th className="p-3.5">Subject & Bio</th>
                        <th className="p-3.5">Monthly Fee & Meet Room</th>
                        <th className="p-3.5">Students & Rating</th>
                        <th className="p-3.5">Verification</th>
                        <th className="p-3.5 text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e6ece8] text-slate-700">
                      {filteredSoloTutors.map((tutor) => {
                        const isSuspended = tutor.rating === 0;
                        return (
                          <tr key={tutor.id} className="hover:bg-[#fbfcfb] transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-9 w-9 rounded-xl ${tutor.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                                >
                                  {tutor.initials}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                    <span>{tutor.name}</span>
                                    {tutor.verified && (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-[#0d5c4d] fill-[#ecf8f5]" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 line-clamp-1">{tutor.title}</p>
                                  <p className="text-[10px] text-slate-400">{tutor.qualifications}</p>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <Badge variant="outline" className="text-[10px] font-bold text-[#0d5c4d] border-[#c4e9e0] bg-[#ecf8f5]">
                                {tutor.subject}
                              </Badge>
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 max-w-xs">{tutor.bio}</p>
                            </td>

                            <td className="p-3.5">
                              <p className="font-extrabold text-[#0d2b26] text-xs">
                                LKR {tutor.monthlyFee.toLocaleString()}
                                <span className="text-[10px] text-slate-400 font-normal"> / month</span>
                              </p>
                              {tutor.meetUrl ? (
                                <a
                                  href={tutor.meetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1d6fa5] hover:underline mt-0.5"
                                >
                                  <Video className="h-3 w-3" /> Live Meet Link
                                </a>
                              ) : (
                                <span className="text-[10px] text-slate-400">No meet URL</span>
                              )}
                            </td>

                            <td className="p-3.5">
                              <p className="font-bold text-slate-900">{tutor.studentsCount} Students</p>
                              <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-0.5">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {tutor.rating > 0 ? tutor.rating.toFixed(1) : "Suspended"}
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className="space-y-1">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    tutor.verified
                                      ? "bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0]"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {tutor.verified ? "Verified ✓" : "Pending"}
                                </span>
                                {isSuspended && (
                                  <span className="block text-[10px] font-bold text-rose-600">
                                    ● Account Suspended
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedTutorForView(tutor)}
                                  className="h-7 px-2 text-[11px] font-bold text-slate-700"
                                  title="View Packages & Subscribers"
                                >
                                  <Package className="h-3 w-3 mr-1 text-[#0d5c4d]" /> Packages
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleTutorVerification(tutor.id)}
                                  className={`h-7 px-2 text-[11px] font-bold ${
                                    tutor.verified ? "text-amber-700 hover:text-amber-800" : "text-[#0d5c4d] hover:text-[#083e34]"
                                  }`}
                                  title={tutor.verified ? "Remove Verification Badge" : "Grant Verified Badge"}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  {tutor.verified ? "Unverify" : "Verify"}
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleTutorSuspension(tutor.id)}
                                  className={`h-7 px-2 text-[11px] font-bold ${
                                    isSuspended ? "text-[#0d5c4d]" : "text-rose-600"
                                  }`}
                                  title={isSuspended ? "Re-activate Tutor" : "Suspend Tutor"}
                                >
                                  {isSuspended ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeletingTutor(tutor)}
                                  className="h-7 px-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                                  title="Delete Tutor Profile"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredSoloTutors.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500">
                            No tutors matching your criteria found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* SUBTAB 2 & 3: INSTITUTIONAL STAFF (TEACHERS & COACHES) */}
          {staffSubTab !== "solo_tutors" && (
            <Card className="overflow-visible border-[#e6ece8] bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[#e6ece8] p-4 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={staffSearch}
                    onChange={(event) => {
                      setStaffSearch(event.target.value);
                      setStaffPage(1);
                    }}
                    placeholder="Search name, email or staff ID..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/20"
                  />
                </div>
                <select
                  value={staffStatusFilter}
                  onChange={(event) => {
                    setStaffStatusFilter(event.target.value as "all" | AdminRecordStatus);
                    setStaffPage(1);
                  }}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#0d5c4d]"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="on_leave">On leave</option>
                  <option value="resigned">Resigned</option>
                </select>
                <select
                  value={staffSubjectFilter}
                  onChange={(event) => {
                    setStaffSubjectFilter(event.target.value);
                    setStaffPage(1);
                  }}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#0d5c4d]"
                >
                  <option value="all">All sports</option>
                  {staffSports.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setStaffSort(staffSort === "name" ? "status" : "name")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  <ArrowUpDown className="h-4 w-4" /> Sort
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="sticky top-0 z-10 border-b border-[#e6ece8] bg-[#f8faf9] text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-bold">Coach Name</th>
                      <th className="px-5 py-4 font-bold">Sport Discipline</th>
                      <th className="px-5 py-4 font-bold">Assigned Teams</th>
                      <th className="px-5 py-4 font-bold">Status</th>
                      <th className="px-5 py-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2ef]">
                    {pagedStaff.map((member: AdminStaffRecord) => (
                      <tr
                        key={member.id}
                        onClick={() => {
                          setSelectedStaff(member);
                          setStaffDrawerTab("profile");
                        }}
                        className="cursor-pointer transition-colors hover:bg-[#f8faf9]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecf8f5] font-black text-[#0d5c4d]">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{member.name}</p>
                              <p className="text-xs text-slate-500">{member.email}</p>
                              <p className="text-[11px] text-slate-400">{member.staffId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {member.sport && (
                              <span className="rounded-full bg-[#ecf8f5] px-2 py-1 text-xs font-semibold text-[#0d5c4d]">
                                {member.sport}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {member.teams?.map((value) => (
                              <span
                                key={value}
                                className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
                              >
                                {value}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge
                            variant={
                              member.status === "active"
                                ? "success"
                                : member.status === "on_leave"
                                ? "warning"
                                : "destructive"
                            }
                          >
                            <span className="mr-1">●</span>
                            {member.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td
                          className="relative px-5 py-4 text-right"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setStaffMenuId(staffMenuId === member.id ? null : member.id)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {staffMenuId === member.id && (
                            <div className="absolute right-5 top-12 z-20 w-36 rounded-xl border border-[#e6ece8] bg-white p-1 text-left shadow-lg">
                              <button
                                className="block w-full rounded-lg px-3 py-2 text-xs hover:bg-slate-50"
                                onClick={() => {
                                  setSelectedStaff(member);
                                  setStaffMenuId(null);
                                }}
                              >
                                View
                              </button>
                              <button
                                className="block w-full rounded-lg px-3 py-2 text-xs hover:bg-slate-50"
                                onClick={() => {
                                  openStaffForm(member);
                                  setStaffMenuId(null);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="block w-full rounded-lg px-3 py-2 text-xs hover:bg-slate-50"
                                onClick={() =>
                                  addToast({
                                    type: "info",
                                    title: "Assignment",
                                    message: `Assign ${member.name} to teams.`
                                  })
                                }
                              >
                                Assign
                              </button>
                              <button
                                className="block w-full rounded-lg px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                                onClick={() => {
                                  setConfirmStaff(member);
                                  setStaffMenuId(null);
                                }}
                              >
                                Deactivate
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!pagedStaff.length && (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                          No sports coaches found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-[#e6ece8] px-5 py-3 text-xs text-slate-500">
                <span>{filteredStaff.length} sports coaches</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={staffPage === 1}
                    onClick={() => setStaffPage((page) => page - 1)}
                    className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span>
                    Page {staffPage} of {staffPageCount}
                  </span>
                  <button
                    disabled={staffPage === staffPageCount}
                    onClick={() => setStaffPage((page) => page + 1)}
                    className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB: Admin Connect Hub */}
      {activeAdminTab === "connect" && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 border-b border-[#e6ece8] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wider text-[#b47a16]">{currentUser.schoolName}</p><h2 className="mt-1 text-2xl font-black text-[#0d2b26]">Admin Connect Hub</h2><p className="mt-1 text-sm text-slate-500">Oversee teacher hubs, subscriptions and community safety.</p></div>
            <div className="flex flex-wrap gap-2">{(["overview", "hubs", "moderation", "settings"] as const).map((tab) => <button key={tab} type="button" onClick={() => setHubTab(tab)} className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${hubTab === tab ? "bg-[#0d5c4d] text-white" : "bg-white text-slate-600 hover:bg-[#ecf8f5]"}`}>{tab === "hubs" ? "Teacher hubs" : tab}</button>)}</div>
          </div>

          {hubTab === "overview" && <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Teachers with active hubs", teacherHubs.filter((hub) => hub.status === "active").length],
                ["Total subscriptions", subscriptions.filter((item) => item.status === "active").length],
                ["New this week", subscriptions.filter((item) => now - new Date(item.subscribedDate).getTime() < 7 * 86400000).length],
                ["Flagged items", hubFlags.filter((flag) => flag.status === "open").length]
              ].map(([label, value]) => <Card key={label as string} className="p-5"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-3 text-3xl font-black text-[#0d2b26]">{value}</p></Card>)}
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="p-5"><h3 className="text-sm font-black text-[#0d2b26]">Subscriptions over time</h3><div className="mt-5 flex h-40 items-end gap-3 border-b border-l border-[#e6ece8] px-4">{[35, 52, 44, 68, 58, 82, 76].map((height, index) => <div key={index} className="flex-1 rounded-t-lg bg-[#0d8b71] transition-all hover:bg-[#f3b738]" style={{ height: `${height}%` }} />)}</div><div className="mt-2 flex justify-between text-[10px] text-slate-400"><span>Sep 30</span><span>Oct 6</span></div></Card>
              <Card className="p-5"><h3 className="text-sm font-black text-[#0d2b26]">Top teachers by subscribers</h3><div className="mt-4 space-y-3">{teacherHubs.sort((a, b) => b.subscriberCount - a.subscriberCount).slice(0, 4).map((hub) => <div key={hub.id} className="flex items-center justify-between rounded-xl bg-[#f8faf9] p-3"><span className="text-sm font-bold text-slate-700">{hub.teacherName}</span><Badge variant="success">{hub.subscriberCount}</Badge></div>)}</div></Card>
            </div>
          </div>}

          {hubTab === "hubs" && <Card className="overflow-visible">
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-[#e6ece8] bg-[#f8faf9] text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Teacher</th><th className="px-5 py-4">Subjects</th><th className="px-5 py-4">Subscribers</th><th className="px-5 py-4">Posts this month</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Actions</th></tr></thead><tbody className="divide-y divide-[#eef2ef]">{teacherHubs.map((hub) => <tr key={hub.id} onClick={() => setSelectedHubId(hub.id)} className="cursor-pointer hover:bg-[#f8faf9]"><td className="px-5 py-4 font-bold">{hub.teacherName}</td><td className="px-5 py-4">{hub.subjects.join(", ")}</td><td className="px-5 py-4">{hub.subscriberCount}</td><td className="px-5 py-4">{hub.postsThisMonth}</td><td className="px-5 py-4"><Badge variant={hub.status === "active" ? "success" : hub.status === "paused" ? "warning" : "destructive"}>{hub.status}</Badge></td><td className="px-5 py-4" onClick={(event) => event.stopPropagation()}><div className="flex gap-2"><button type="button" className="text-xs font-bold text-[#0d5c4d]" onClick={() => { setSelectedHubId(hub.id); setHubAction(hub.status === "active" ? "pause" : "suspend"); }}> {hub.status === "active" ? "Pause" : "Suspend"} </button><button type="button" className="text-xs font-bold text-rose-600" onClick={() => { setSelectedHubId(hub.id); setHubAction("suspend"); }}>Suspend</button></div></td></tr>)}</tbody></table></div>
          </Card>}

          {hubTab === "moderation" && <Card className="p-5"><div className="space-y-3">{hubFlags.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No flagged items.</p>}{hubFlags.map((flag) => <div key={flag.id} className="flex flex-col gap-3 rounded-xl border border-[#e6ece8] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-[#0d2b26]">{flag.teacherName} · {flag.contentType}</p><p className="mt-1 text-sm text-slate-600">{flag.content}</p><p className="mt-1 text-xs text-slate-400">{flag.reason} · {flag.createdAt}</p></div>{flag.status === "open" ? <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => { setSelectedHubId(flag.id); setHubAction("dismiss"); }}>Dismiss</Button><Button size="sm" variant="outline" onClick={() => { setSelectedHubId(flag.id); setHubAction("hide"); }}>Hide</Button><Button size="sm" variant="destructive" onClick={() => { setSelectedHubId(flag.id); setHubAction("remove"); }}>Remove</Button><Button size="sm" variant="gold" onClick={() => { setSelectedHubId(flag.id); setHubAction("warn"); }}>Warn teacher</Button></div> : <Badge variant="secondary">{flag.status}</Badge>}</div>)}</div></Card>}

          {hubTab === "settings" && <Card className="max-w-2xl p-6"><h3 className="text-base font-black text-[#0d2b26]">Hub rules for {currentUser.schoolName}</h3><div className="mt-5 space-y-4">{[["enabled", "Enable Connect Hub"], ["approvalRequired", "Require approval for new subscriptions"], ["allowDirectMessages", "Allow direct messages"]].map(([key, label]) => <label key={key} className="flex items-center justify-between rounded-xl border border-[#e6ece8] p-4 text-sm font-bold text-slate-700"><span>{label}</span><input type="checkbox" checked={hubSettingsDraft[key as keyof typeof hubSettingsDraft] as boolean} onChange={(event) => setHubSettingsDraft({ ...hubSettingsDraft, [key]: event.target.checked })} className="h-4 w-4 accent-[#0d5c4d]" /></label>)}<label className="block text-sm font-bold text-slate-700">Maximum subscribers per teacher<input type="number" min="1" value={hubSettingsDraft.maxSubscribersPerTeacher || ""} onChange={(event) => setHubSettingsDraft({ ...hubSettingsDraft, maxSubscribersPerTeacher: event.target.value ? Number(event.target.value) : undefined })} className="mt-2 h-10 w-full rounded-xl border border-slate-200 px-3" placeholder="Unlimited" /></label><Button onClick={() => { const result = hubSettingsSchema.safeParse(hubSettingsDraft); if (!result.success) { addToast({ type: "error", title: "Invalid hub settings" }); return; } updateHubSettings(hubSettingsDraft); addToast({ type: "success", title: "Connect Hub settings saved" }); }}>Save settings</Button></div></Card>}
        </div>
      )}

      {/* TAB: User Directory */}
      {activeAdminTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[#0d2b26] flex items-center gap-2">
                <Users className="h-5 w-5 text-[#0d5c4d]" />
                Platform User & Student Directory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage student subscriptions, tutor enrollments, teaching staff, and administrator accounts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users..."
                  className="h-8 pl-8 pr-3 rounded-xl bg-white border border-[#e6ece8] text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d] w-48"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center bg-white border border-[#e6ece8] rounded-xl p-0.5 shadow-2xs">
                {(["all", "student", "teacher", "admin"] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all capitalize ${
                      userRoleFilter === role
                        ? "bg-[#0d5c4d] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#0d5c4d]"
                    }`}
                  >
                    {role === "teacher" ? "Tutors" : role}
                  </button>
                ))}
              </div>

              {/* Register Student Button */}
              <Button
                size="sm"
                onClick={() => setIsAddStudentModalOpen(true)}
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-1 text-xs shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Register Student
              </Button>
            </div>
          </div>

          {/* Role Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-[#e6ece8] bg-white shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-[#0d2b26]">
                    {platformUsers.filter((u) => u.role === "student").length}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold">Students Registered</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#e6ece8] bg-white shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#fef7e6] text-[#b47a16] flex items-center justify-center">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-[#0d2b26]">
                    {soloTutors.length}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold">Tutors</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#e6ece8] bg-white shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#f8faf9] text-slate-700 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-black text-[#0d2b26]">
                    {platformUsers.filter((u) => u.role === "admin").length}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold">Administrators</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="border-[#e6ece8] bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[840px]">
                <thead>
                  <tr className="border-b border-[#e6ece8] bg-[#f8faf9] text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <th className="p-4">User Profile</th>
                    <th className="p-4">Stream & School</th>
                    <th className="p-4">Role & Subscription</th>
                    <th className="p-4">Enrolled Tutors</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6ece8]">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#fbfcfb] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center font-bold text-xs shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{user.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{user.grade || "General Stream"}</p>
                        <p className="text-[11px] text-slate-500">{user.school}</p>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          <Badge
                            variant={
                              user.role === "admin"
                                ? "default"
                                : user.role === "teacher"
                                ? "warning"
                                : "success"
                            }
                            className="text-[10px] capitalize"
                          >
                            {user.role === "teacher" ? "Tutor" : user.role}
                          </Badge>
                          {user.subscriptionStatus && (
                            <span
                              className={`block text-[10px] font-bold ${
                                user.subscriptionStatus.includes("Active Paid")
                                  ? "text-[#0d5c4d]"
                                  : "text-slate-500"
                              }`}
                            >
                              {user.subscriptionStatus}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        {user.role === "student" ? (
                          user.enrolledTutors && user.enrolledTutors.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {user.enrolledTutors.map((tName, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-[10px] border-[#c4e9e0] bg-[#ecf8f5] text-[#0d5c4d] font-semibold"
                                >
                                  {tName}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No enrolled tutors</span>
                          )
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                            user.status === "Active" ? "text-[#0d5c4d]" : "text-slate-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.status === "Active" ? "bg-[#0d5c4d]" : "bg-slate-300"
                            }`}
                          ></span>
                          {user.status}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user.lastLogin}</p>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.role === "student" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedStudentForEnroll(user)}
                                className="h-7 px-2 text-[11px] font-bold text-[#0d5c4d] border-[#c4e9e0] hover:bg-[#ecf8f5]"
                                title="Enroll student in Tutor class"
                              >
                                <Plus className="h-3 w-3 mr-1" /> Enroll
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedStudentForDossier(user)}
                                className="h-7 px-2 text-[11px] font-bold text-slate-700"
                                title="View Student Dossier & Subscription history"
                              >
                                <Eye className="h-3 w-3 mr-1" /> Dossier
                              </Button>
                            </>
                          )}

                          {/* 3-Dot Action Menu */}
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenUserMenuId(openUserMenuId === user.id ? null : user.id);
                              }}
                              className="h-7 w-7 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="User actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {openUserMenuId === user.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-20"
                                  onClick={() => setOpenUserMenuId(null)}
                                />

                                <div className="absolute right-0 top-8 z-30 w-36 rounded-xl bg-white border border-[#e2eae5] shadow-lg py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenUserMenuId(null);
                                      if (user.role === "student") {
                                        setSelectedStudentForDossier(user);
                                      } else {
                                        setViewingUser(user);
                                      }
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] transition-colors cursor-pointer"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-[#0d5c4d]" />
                                    <span>View Profile</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenUserMenuId(null);
                                      handleOpenEditUser(user);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] transition-colors cursor-pointer"
                                  >
                                    <Edit className="h-3.5 w-3.5 text-[#0d5c4d]" />
                                    <span>Edit</span>
                                  </button>

                                  <div className="h-px bg-slate-100 my-1" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenUserMenuId(null);
                                      setDeletingUser(user);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB: Platform Monetization & Settings */}
      {activeAdminTab === "settings" && (
        <div className="space-y-6 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6ece8]">
            <div>
              <h2 className="text-xl font-black text-[#0d2b26] flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#0d5c4d] text-white flex items-center justify-center shadow-xs">
                  <CreditCard className="h-5 w-5" />
                </div>
                Platform Monetization & Settings
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure tutor commissions, student package checkout gateways, payout cycles, and marketplace policies.
              </p>
            </div>

            <Button
              onClick={() => {
                addToast({
                  type: "success",
                  title: "Platform Settings Saved",
                  message: "Monetization rates and marketplace configuration updated successfully."
                });
              }}
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold h-9 px-4 rounded-xl text-xs gap-2 shadow-xs cursor-pointer"
            >
              <Check className="h-4 w-4" /> Save Configuration
            </Button>
          </div>

          {/* Section 1: Monetization & Revenue Commission Rules */}
          <Card className="border-[#e6ece8] bg-white shadow-2xs">
            <CardHeader className="p-5 pb-3 border-b border-[#e6ece8] bg-[#fbfdfc] rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black text-[#0d2b26] flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#0d5c4d]" />
                    Tutor Package Monetization & Revenue Split
                  </CardTitle>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    How student subscription fees are collected and split between Tutors and the Platform.
                  </p>
                </div>
                <Badge variant="success" className="text-[10px] font-bold">
                  SaaS Revenue Engine
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Commission Percentage Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Platform Commission Fee (%)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Platform service deduction applied when students purchase tutor packages.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={platformCommissionRate}
                      onChange={(e) => setPlatformCommissionRate(Math.max(0, Math.min(50, Number(e.target.value))))}
                      className="h-10 w-28 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm font-black text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                    />
                    <span className="text-sm font-black text-[#0d5c4d]">% Platform Fee</span>
                    <span className="text-xs text-slate-400 font-bold">({100 - platformCommissionRate}% to Tutor)</span>
                  </div>
                </div>

                {/* Live Split Calculation Preview Card */}
                <div className="p-3.5 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] space-y-1.5">
                  <p className="text-[11px] font-bold text-[#0d5c4d] uppercase tracking-wider">Revenue Split Preview (Rs. 5,000 Package):</p>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Tutor Payout:</span>
                    <span className="text-[#0d5c4d] font-black font-mono">
                      Rs. {(5000 * ((100 - platformCommissionRate) / 100)).toLocaleString()} ({100 - platformCommissionRate}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Platform Commission:</span>
                    <span className="font-mono text-slate-700">
                      Rs. {(5000 * (platformCommissionRate / 100)).toLocaleString()} ({platformCommissionRate}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#e6ece8]" />

              {/* Payout Schedule & Threshold Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Payout Cycle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tutor Payout Schedule
                  </label>
                  <select
                    value={tutorPayoutCycle}
                    onChange={(e) => setTutorPayoutCycle(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                  >
                    <option value="weekly">Weekly (Every Monday)</option>
                    <option value="biweekly">Bi-Weekly (Every 14 Days)</option>
                    <option value="monthly">Monthly (Last Day of Month)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Disbursement timing for verified earnings</p>
                </div>

                {/* Minimum Payout Threshold */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Minimum Payout Threshold
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={minPayoutThreshold}
                      onChange={(e) => setMinPayoutThreshold(Number(e.target.value))}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Min balance needed for bank transfer</p>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Platform Currency
                  </label>
                  <select
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                  >
                    <option value="LKR">LKR (Sri Lankan Rupee - Rs.)</option>
                    <option value="USD">USD (US Dollar - $)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Primary billing and pricing currency</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Student Payment Methods & Package Limits */}
          <Card className="border-[#e6ece8] bg-white shadow-2xs">
            <CardHeader className="p-5 pb-3 border-b border-[#e6ece8] bg-[#fbfdfc] rounded-t-xl">
              <CardTitle className="text-sm font-black text-[#0d2b26] flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#0d5c4d]" />
                Student Checkout & Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Online Card Payment Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e6ece8] bg-[#fbfcfb]">
                <div>
                  <p className="text-xs font-bold text-slate-800">Online Card & Mobile Payments (Instant Activation)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Students pay with Visa, Mastercard, Genie, FriMi, or Koko. Immediate access granted to tutor circle.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowOnlineCardPayment(!allowOnlineCardPayment)}
                  className={`h-7 w-13 rounded-full p-1 transition-colors cursor-pointer ${
                    allowOnlineCardPayment ? "bg-[#0d5c4d]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      allowOnlineCardPayment ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Direct Bank Deposit Slip Upload Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e6ece8] bg-[#fbfcfb]">
                <div>
                  <p className="text-xs font-bold text-slate-800">Bank Transfer & ATM Deposit Slip Verification</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Allow students without debit cards to upload bank transfer receipts for manual tutor verification.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowDirectBankSlip(!allowDirectBankSlip)}
                  className={`h-7 w-13 rounded-full p-1 transition-colors cursor-pointer ${
                    allowDirectBankSlip ? "bg-[#0d5c4d]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      allowDirectBankSlip ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Pricing Guardrails */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Minimum Allowed Package Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      min={500}
                      step={500}
                      value={minPackagePrice}
                      onChange={(e) => setMinPackagePrice(Number(e.target.value))}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Prevents low spam pricing</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Maximum Allowed Package Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      min={5000}
                      step={1000}
                      value={maxPackagePrice}
                      onChange={(e) => setMaxPackagePrice(Number(e.target.value))}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Upper limit for monthly package plans</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Tutor Onboarding & Studio Policies */}
          <Card className="border-[#e6ece8] bg-white shadow-2xs">
            <CardHeader className="p-5 pb-3 border-b border-[#e6ece8] bg-[#fbfdfc] rounded-t-xl">
              <CardTitle className="text-sm font-black text-[#0d2b26] flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#0d5c4d]" />
                Tutor Studio & Marketplace Governance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Tutor Self-Registration Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e6ece8] bg-[#fbfcfb]">
                <div>
                  <p className="text-xs font-bold text-slate-800">Tutor Self-Registration & Profile Creation</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Allow independent educators to sign up, build their teaching profile, add subjects, and set fee packages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowTutorSelfRegistration(!allowTutorSelfRegistration)}
                  className={`h-7 w-13 rounded-full p-1 transition-colors cursor-pointer ${
                    allowTutorSelfRegistration ? "bg-[#0d5c4d]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      allowTutorSelfRegistration ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Package Approval Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#e6ece8] bg-[#fbfcfb]">
                <div>
                  <p className="text-xs font-bold text-slate-800">Require Admin Approval for New Packages</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {requirePackageApproval
                      ? "Enabled: Packages require admin review before appearing in student browse directory."
                      : "Instant Publishing: Tutors can publish fee packages directly without waiting for admin review."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRequirePackageApproval(!requirePackageApproval)}
                  className={`h-7 w-13 rounded-full p-1 transition-colors cursor-pointer ${
                    requirePackageApproval ? "bg-[#0d5c4d]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      requirePackageApproval ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: General Platform Controls */}
          <Card className="border-[#e6ece8] bg-white shadow-2xs">
            <CardHeader className="p-5 pb-3 border-b border-[#e6ece8] bg-[#fbfdfc] rounded-t-xl">
              <CardTitle className="text-sm font-black text-[#0d2b26] flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#0d5c4d]" />
                General Platform Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Platform Name */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">Platform Brand Name</p>
                  <p className="text-[10px] text-slate-500">The branded marketplace name visible across all portals</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#0d5c4d]">EduPlatform SaaS · Tutor Network</span>
                  <Badge variant="outline" className="text-[10px] font-bold">Production</Badge>
                </div>
              </div>

              <div className="h-px bg-[#e6ece8]" />

              {/* Default Language */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">Default Interface Language</p>
                  <p className="text-[10px] text-slate-500">Primary interface language for new users</p>
                </div>
                <select
                  value={defaultLocale}
                  onChange={(e) => setDefaultLocale(e.target.value)}
                  className="h-8 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                >
                  <option value="en">English</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="si">සිංහල (Sinhala)</option>
                </select>
              </div>

              <div className="h-px bg-[#e6ece8]" />

              {/* Student Enrollment Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">Student Self-Registration</p>
                  <p className="text-[10px] text-slate-500">Allow new students to create accounts and subscribe to tutors</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnrollmentOpen(!enrollmentOpen)}
                  className={`h-7 w-13 rounded-full p-1 transition-colors cursor-pointer ${
                    enrollmentOpen ? "bg-[#0d5c4d]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      enrollmentOpen ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="h-px bg-[#e6ece8]" />

              {/* Maintenance Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">Emergency Maintenance Mode</p>
                  <p className="text-[10px] text-slate-500">Temporarily disable student & tutor portal access during server updates</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`h-7 w-13 rounded-full p-1 transition-colors cursor-pointer ${
                    maintenanceMode ? "bg-rose-500" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      maintenanceMode ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Cloud Security & Data Protection */}
          <Card className="border-[#e6ece8] bg-white shadow-2xs">
            <CardHeader className="p-5 pb-3 border-b border-[#e6ece8] bg-[#fbfdfc] rounded-t-xl">
              <CardTitle className="text-sm font-black text-[#0d2b26] flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#0d5c4d]" />
                Cloud Security & Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">Bank-Grade Payment Encryption</p>
                  <p className="text-[10px] text-slate-500">PCI-DSS Level 1 compliant card checkout tokenization</p>
                </div>
                <Badge variant="success" className="text-[10px]">Active &bull; TLS 1.3</Badge>
              </div>

              <div className="h-px bg-[#e6ece8]" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">Automated Cloud Backups</p>
                  <p className="text-[10px] text-slate-500">Real-time database snapshots & point-in-time recovery</p>
                </div>
                <Badge variant="success" className="text-[10px]">Daily at 02:00 AM UTC</Badge>
              </div>

              <div className="h-px bg-[#e6ece8]" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">Student & Tutor Privacy Compliance</p>
                  <p className="text-[10px] text-slate-500">Secure end-to-end data isolation and privacy protection</p>
                </div>
                <Badge variant="success" className="text-[10px]">Compliant</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Create School */}
      <Modal
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        title="Register New School"
        description="Add a new educational institution to the multi-school LimaT Smart Book platform."
      >
        <form onSubmit={handleCreateSchoolSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              School Name
            </label>
            <input
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Colombo Central College"
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                School Code
              </label>
              <input
                type="text"
                required
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                placeholder="CCC-08"
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                District
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Province
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="Western">Western</option>
                <option value="Central">Central</option>
                <option value="Southern">Southern</option>
                <option value="Northern">Northern</option>
                <option value="Eastern">Eastern</option>
                <option value="North Western">North Western</option>
                <option value="North Central">North Central</option>
                <option value="Uva">Uva</option>
                <option value="Sabaragamuwa">Sabaragamuwa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Principal Name
              </label>
              <input
                type="text"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="Mr. / Mrs. / Dr."
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsSchoolModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold">
              Register School
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Class */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title="Create New Class"
        description="Add an academic class stream to a grade level."
      >
        <form onSubmit={handleCreateClassSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Class Name
            </label>
            <input
              type="text"
              required
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. 12-Commerce"
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Grade Level
              </label>
              <select
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Class Teacher
              </label>
              <input
                type="text"
                value={classTeacher}
                onChange={(e) => setClassTeacher(e.target.value)}
                placeholder="Teacher name"
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsClassModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold">
              Save Class
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} title={`${editingStaff ? "Edit" : "Add"} ${staffRoleFilter === "coach" ? "Coach" : "Teacher"}`} description="Keep staff records accurate for your school." maxWidth="max-w-3xl">
        <form onSubmit={staffForm.handleSubmit(submitStaffForm)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ["name", "Name", "text"], ["staffId", "Staff ID", "text"], ["email", "Email", "email"], ["phone", "Phone", "tel"], ["dateOfBirth", "Date of birth", "date"], ["joiningDate", "Joining date", "date"]
            ] as const).map(([name, label, type]) => <div key={name}><label className="mb-1 block text-xs font-bold text-slate-700">{label}</label><input type={type} {...staffForm.register(name)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#0d5c4d]" />{staffForm.formState.errors[name] && <p className="mt-1 text-xs text-rose-600">{staffForm.formState.errors[name]?.message}</p>}</div>)}
            <div><label className="mb-1 block text-xs font-bold text-slate-700">Gender</label><select {...staffForm.register("gender")} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></div>
            <div><label className="mb-1 block text-xs font-bold text-slate-700">Status</label><select {...staffForm.register("status")} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"><option value="active">Active</option><option value="on_leave">On leave</option><option value="resigned">Resigned</option></select></div>
          </div>
          <div className="rounded-xl bg-[#f8faf9] p-4"><p className="mb-3 text-xs font-black uppercase tracking-wide text-[#0d5c4d]">{staffRoleFilter === "coach" ? "Sports & teams" : "Subjects & classes"}</p><div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1 block text-xs font-bold text-slate-700">{staffRoleFilter === "coach" ? "Sports" : "Subjects"} <span className="font-normal text-slate-400">(comma separated)</span></label><input {...staffForm.register(staffRoleFilter === "coach" ? "sports" : "subjects")} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></div><div><label className="mb-1 block text-xs font-bold text-slate-700">Teams / Classes <span className="font-normal text-slate-400">(comma separated)</span></label><input {...staffForm.register(staffRoleFilter === "coach" ? "teams" : "classes")} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></div></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1 block text-xs font-bold text-slate-700">{staffRoleFilter === "coach" ? "Certification" : "Qualification"}</label><input {...staffForm.register(staffRoleFilter === "coach" ? "certification" : "qualification")} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm" /></div><div><label className="mb-1 block text-xs font-bold text-slate-700">{staffRoleFilter === "coach" ? "Availability" : "Medium"}</label>{staffRoleFilter === "coach" ? <input {...staffForm.register("availability")} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm" /> : <select {...staffForm.register("medium")} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"><option value="english">English</option><option value="tamil">Tamil</option><option value="sinhala">Sinhala</option></select>}</div></div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><Button type="button" variant="outline" onClick={() => setIsStaffModalOpen(false)}>Cancel</Button><Button type="submit">{editingStaff ? "Save changes" : "Add staff"}</Button></div>
        </form>
      </Modal>

      {selectedStaff && <div className="fixed inset-0 z-50"><button type="button" aria-label="Close staff drawer" onClick={() => setSelectedStaff(null)} className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" /><aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between border-b border-[#e6ece8] pb-5"><div><p className="text-xs font-bold uppercase tracking-wide text-[#b47a16]">{selectedStaff.role === "coach" ? "Coach" : "Teacher"}</p><h2 className="mt-1 text-xl font-black text-[#0d2b26]">{selectedStaff.name}</h2><p className="text-sm text-slate-500">{selectedStaff.email}</p></div><button type="button" onClick={() => setSelectedStaff(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-5 flex gap-2">{(selectedStaff.role === "coach" ? ["profile", "sports", "schedule", "connect"] : ["profile", "subjects", "workload", "connect"]).map((tab) => <button key={tab} type="button" onClick={() => setStaffDrawerTab(tab)} className={`rounded-full px-3 py-2 text-xs font-bold capitalize ${staffDrawerTab === tab ? "bg-[#0d5c4d] text-white" : "bg-slate-100 text-slate-600"}`}>{tab === "subjects" ? "Subjects & Classes" : tab === "sports" ? "Sports & Teams" : tab}</button>)}</div><div className="mt-6 space-y-4">{staffDrawerTab === "profile" && <div className="grid gap-3 sm:grid-cols-2"><div><p className="text-xs text-slate-500">Staff ID</p><p className="font-bold">{selectedStaff.staffId}</p></div><div><p className="text-xs text-slate-500">Phone</p><p className="font-bold">{selectedStaff.phone || "Not provided"}</p></div><div><p className="text-xs text-slate-500">Joining date</p><p className="font-bold">{selectedStaff.joiningDate || "Not provided"}</p></div><div><p className="text-xs text-slate-500">Status</p><Badge variant={selectedStaff.status === "active" ? "success" : "warning"}>{selectedStaff.status.replace("_", " ")}</Badge></div></div>}{staffDrawerTab === "subjects" && <div><p className="mb-2 text-sm font-black">Subjects & Classes</p><p className="text-sm text-slate-600">{selectedStaff.subjects?.join(", ") || "No subjects assigned"}</p><p className="mt-4 text-sm text-slate-600">{selectedStaff.classes?.join(", ") || "No classes assigned"}</p></div>}{staffDrawerTab === "sports" && <div><p className="mb-2 text-sm font-black">Sports & Teams</p><p className="text-sm text-slate-600">{selectedStaff.sport || "No sport assigned"}</p><p className="mt-4 text-sm text-slate-600">{selectedStaff.teams?.join(", ") || "No teams assigned"}</p></div>}{staffDrawerTab === "workload" && <div><p className="text-sm font-black">Current workload</p><p className="mt-2 text-4xl font-black text-[#0d5c4d]">{selectedStaff.workload}%</p></div>}{staffDrawerTab === "schedule" && <div><p className="text-sm font-black">Availability</p><p className="mt-2 text-sm text-slate-600">{selectedStaff.availability || "Schedule not provided"}</p></div>}{staffDrawerTab === "connect" && <div><p className="text-sm font-black">Connect activity</p><p className="mt-2 text-sm text-slate-600">Hub oversight is available in Admin Connect Hub. Teacher activity and subscriber records remain school-scoped.</p></div>}</div></aside></div>}

      {hubAction && <Modal isOpen={Boolean(hubAction)} onClose={() => { setHubAction(null); setHubReason(""); }} title="Confirm Connect Hub action" description="A reason is required and the action is recorded in the audit log."><textarea value={hubReason} onChange={(event) => setHubReason(event.target.value)} placeholder="Reason" className="min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm" /><div className="mt-4 flex justify-end gap-3"><Button variant="outline" onClick={() => setHubAction(null)}>Cancel</Button><Button onClick={() => { if (!hubReason.trim()) { addToast({ type: "error", title: "Reason required" }); return; } if (hubAction === "pause" || hubAction === "suspend") setHubStatus(selectedHubId || "", hubAction === "pause" ? "paused" : "suspended", hubReason); else if (hubAction === "hide" || hubAction === "remove" || hubAction === "warn" || hubAction === "dismiss") actOnHubFlag(selectedHubId || "", hubAction, hubReason); setHubAction(null); setHubReason(""); addToast({ type: "success", title: "Connect action recorded" }); }}>Confirm</Button></div></Modal>}

      {selectedHubId && activeHub && !hubAction && <Modal isOpen={Boolean(selectedHubId)} onClose={() => setSelectedHubId(null)} title={`${activeHub.teacherName} subscribers`} description={`${hubSubscriptions.length} subscribers`}><div className="space-y-3">{hubSubscriptions.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No subscribers.</p>}{hubSubscriptions.map((subscription) => <div key={subscription.id} className="flex items-center justify-between rounded-xl border border-[#e6ece8] p-3"><div><p className="text-sm font-bold">{subscription.studentName}</p><p className="text-xs text-slate-500">{subscription.grade} · {subscription.subscribedDate}</p></div><Button size="sm" variant="outline" onClick={() => removeSubscription(subscription.id, "Removed by administrator")}>Remove</Button></div>)}</div></Modal>}

      <Modal isOpen={Boolean(confirmStaff)} onClose={() => setConfirmStaff(null)} title="Deactivate staff member" description="This keeps the record for audit history and prevents deletion."><div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setConfirmStaff(null)}>Cancel</Button><Button variant="destructive" onClick={() => { if (confirmStaff) { setStaffStatus(confirmStaff.id, "inactive"); addToast({ type: "success", title: "Staff deactivated" }); setConfirmStaff(null); } }}>Deactivate</Button></div></Modal>

      {/* View User Details Modal */}
      <Modal
        isOpen={Boolean(viewingUser)}
        onClose={() => setViewingUser(null)}
        title="User Account Details"
        description="Comprehensive profile credentials and platform activity."
      >
        {viewingUser && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#ecf8f5] border border-[#c4e9e0]">
              <div className="h-12 w-12 rounded-full bg-[#0d5c4d] text-white flex items-center justify-center font-black text-lg">
                {viewingUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-black text-[#0d2b26]">{viewingUser.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{viewingUser.email}</p>
              </div>
              <Badge
                variant={
                  viewingUser.role === "admin"
                    ? "default"
                    : viewingUser.role === "teacher"
                    ? "warning"
                    : "success"
                }
                className="ml-auto capitalize text-xs font-bold"
              >
                {viewingUser.role}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Institution</p>
                <p className="font-bold text-slate-900 mt-0.5">{viewingUser.school}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Account Status</p>
                <p className="font-bold text-[#0d5c4d] mt-0.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#0d5c4d]" />
                  {viewingUser.status}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Last Authenticated Session</p>
                <p className="font-mono text-slate-700 mt-0.5">{viewingUser.lastLogin}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setViewingUser(null)}>
                Close
              </Button>
              <Button
                type="button"
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold"
                onClick={() => {
                  const target = viewingUser;
                  setViewingUser(null);
                  handleOpenEditUser(target);
                }}
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title="Edit User Profile"
        description="Update user account information, institutional role, and status."
      >
        <form onSubmit={handleSaveEditUser} className="space-y-4 pt-2">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editUserName}
                onChange={(e) => setEditUserName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={editUserEmail}
                onChange={(e) => setEditUserEmail(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Platform Role</label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value as "student" | "teacher" | "admin")}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                <select
                  value={editUserStatus}
                  onChange={(e) => setEditUserStatus(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned School / Campus</label>
              <input
                type="text"
                required
                value={editUserSchool}
                onChange={(e) => setEditUserSchool(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        title="Delete User Account"
        description="Are you sure you want to remove this user from the platform directory?"
      >
        <div className="space-y-4 pt-2">
          {deletingUser && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
              <p className="font-bold">{deletingUser.name}</p>
              <p className="text-[11px] text-rose-700 mt-0.5">{deletingUser.email} &bull; {deletingUser.school}</p>
            </div>
          )}

          <p className="text-xs text-slate-500">
            This will revoke their authentication credentials and access permissions across the system.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setDeletingUser(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDeleteUser}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 1: VIEW TUTOR PACKAGES & SUBSCRIBERS                          */}
      {/* =================================================================== */}
      <Modal
        isOpen={Boolean(selectedTutorForView)}
        onClose={() => setSelectedTutorForView(null)}
        title="Tutor Packages & Subscription Details"
        description="Review tuition fee tiers, live meeting rooms, and subscriber breakdown."
      >
        {selectedTutorForView && (
          <div className="space-y-4 pt-2">
            {/* Tutor Header Card */}
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#ecf8f5] border border-[#c4e9e0]">
              <div
                className={`h-12 w-12 rounded-xl ${selectedTutorForView.avatarColor} text-white flex items-center justify-center font-black text-base shadow-xs`}
              >
                {selectedTutorForView.initials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[#0d2b26]">{selectedTutorForView.name}</h3>
                  {selectedTutorForView.verified && (
                    <Badge variant="success" className="text-[10px] font-bold">
                      Verified Tutor ✓
                    </Badge>
                  )}
                </div>
                <p className="text-xs font-semibold text-[#0d5c4d]">{selectedTutorForView.subject}</p>
                <p className="text-[11px] text-slate-500">{selectedTutorForView.qualifications}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400">Monthly Plan</p>
                <p className="text-lg font-black text-[#0d2b26]">
                  LKR {selectedTutorForView.monthlyFee.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Live Meeting Link */}
            {selectedTutorForView.meetUrl && (
              <div className="p-3 rounded-xl bg-[#f4f9ff] border border-[#c9e2fa] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <Video className="h-4 w-4 text-[#1d6fa5]" />
                  <span className="font-bold text-[#1d6fa5]">Google Meet Virtual Classroom:</span>
                  <span className="font-mono text-slate-600 truncate max-w-[200px]">
                    {selectedTutorForView.meetUrl}
                  </span>
                </div>
                <a
                  href={selectedTutorForView.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-[#1d6fa5] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#145077]"
                >
                  <ExternalLink className="h-3 w-3" /> Test Room
                </a>
              </div>
            )}

            {/* Packages List */}
            <div>
              <h4 className="text-xs font-extrabold text-[#0d2b26] uppercase tracking-wider mb-2">
                Published Fee Packages ({tutorPackages.filter((p) => p.teacherId === selectedTutorForView.id).length || 2} Plans)
              </h4>
              <div className="space-y-2">
                {tutorPackages
                  .filter((p) => p.teacherId === selectedTutorForView.id)
                  .map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#0d5c4d] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-black text-slate-900 text-xs">{pkg.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{pkg.description}</p>
                        </div>
                        <Badge variant="outline" className="font-black text-[#0d5c4d] border-[#c4e9e0] bg-[#ecf8f5] text-xs">
                          LKR {pkg.monthlyFeeLkr.toLocaleString()} / {pkg.billingCycle}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {pkg.features.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            <Check className="h-2.5 w-2.5 text-[#0d5c4d]" />
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                {tutorPackages.filter((p) => p.teacherId === selectedTutorForView.id).length === 0 && (
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-slate-900 text-xs">Monthly Comprehensive Plan</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Includes live stream lectures, weekly problem sets, and discussion forum.
                        </p>
                      </div>
                      <Badge variant="outline" className="font-black text-[#0d5c4d] border-[#c4e9e0] bg-[#ecf8f5] text-xs">
                        LKR {selectedTutorForView.monthlyFee.toLocaleString()} / month
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subscriber & Revenue Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Subscribers</p>
                <p className="text-lg font-black text-[#0d2b26] mt-0.5">
                  {selectedTutorForView.studentsCount} Students
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#fefbf2] border border-[#f3e5c8] text-xs">
                <p className="text-[10px] font-bold text-[#b47a16] uppercase">Est. Monthly Platform GMV</p>
                <p className="text-lg font-black text-[#b47a16] mt-0.5">
                  LKR {(selectedTutorForView.studentsCount * selectedTutorForView.monthlyFee).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setSelectedTutorForView(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 2: REGISTER NEW TUTOR                                        */}
      {/* =================================================================== */}
      <Modal
        isOpen={isAddTutorModalOpen}
        onClose={() => setIsAddTutorModalOpen(false)}
        title="Enroll New Tutor"
        description="Register an independent tutor profile with custom subject and monthly fees."
      >
        <form onSubmit={handleSaveAddTutor} className="space-y-4 pt-2">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tutor Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. A. Sivakumar"
                value={newTutorForm.name}
                onChange={(e) => setNewTutorForm({ ...newTutorForm, name: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Specialization *</label>
                <select
                  value={newTutorForm.subject}
                  onChange={(e) => setNewTutorForm({ ...newTutorForm, subject: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                >
                  <option value="Combined Mathematics">Combined Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Information & Communication Technology">ICT</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Business Studies">Business Studies</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Subscription Fee (LKR) *</label>
                <input
                  type="number"
                  required
                  min="500"
                  step="100"
                  value={newTutorForm.monthlyFee}
                  onChange={(e) => setNewTutorForm({ ...newTutorForm, monthlyFee: Number(e.target.value) })}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Qualifications</label>
              <input
                type="text"
                placeholder="e.g. B.Sc. Engineering (Hons) University of Moratuwa"
                value={newTutorForm.qualifications}
                onChange={(e) => setNewTutorForm({ ...newTutorForm, qualifications: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Google Meet Classroom URL</label>
              <input
                type="url"
                placeholder="https://meet.google.com/abc-defg-hij"
                value={newTutorForm.meetUrl}
                onChange={(e) => setNewTutorForm({ ...newTutorForm, meetUrl: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Biography / Course Overview</label>
              <textarea
                rows={3}
                placeholder="Write a brief description of the tutor's methodology and curriculum coverage..."
                value={newTutorForm.bio}
                onChange={(e) => setNewTutorForm({ ...newTutorForm, bio: e.target.value })}
                className="w-full p-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0]">
              <input
                type="checkbox"
                id="verifiedCheck"
                checked={newTutorForm.verified}
                onChange={(e) => setNewTutorForm({ ...newTutorForm, verified: e.target.checked })}
                className="h-4 w-4 accent-[#0d5c4d] rounded cursor-pointer"
              />
              <label htmlFor="verifiedCheck" className="text-xs font-bold text-[#0d5c4d] cursor-pointer">
                Grant Verified Badge (சரிபார்க்கப்பட்ட ஆசிரியர் பேட்ஜ்)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddTutorModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold">
              Enroll Tutor
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 3: DELETE TUTOR CONFIRMATION                                  */}
      {/* =================================================================== */}
      <Modal
        isOpen={Boolean(deletingTutor)}
        onClose={() => setDeletingTutor(null)}
        title="Remove Tutor"
        description="Are you sure you want to delete this tutor from the platform?"
      >
        <div className="space-y-4 pt-2">
          {deletingTutor && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
              <p className="font-bold">{deletingTutor.name}</p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                {deletingTutor.subject} &bull; {deletingTutor.studentsCount} Active Students
              </p>
            </div>
          )}

          <p className="text-xs text-slate-500">
            Deleting this tutor will delist their profile and disconnect their fee subscription packages.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setDeletingTutor(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDeleteTutor}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Delete Tutor
            </Button>
          </div>
        </div>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 4: STUDENT DOSSIER & ENROLLED CLASSES                         */}
      {/* =================================================================== */}
      <Modal
        isOpen={Boolean(selectedStudentForDossier)}
        onClose={() => setSelectedStudentForDossier(null)}
        title="Student Profile & Enrollment Dossier"
        description="View enrolled tutors, academic stream, and active subscriptions."
      >
        {selectedStudentForDossier && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#ecf8f5] border border-[#c4e9e0]">
              <div className="h-12 w-12 rounded-full bg-[#0d5c4d] text-white flex items-center justify-center font-black text-lg">
                {selectedStudentForDossier.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-[#0d2b26]">{selectedStudentForDossier.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedStudentForDossier.email}</p>
                <p className="text-[11px] font-semibold text-[#0d5c4d] mt-0.5">
                  {selectedStudentForDossier.grade || "Grade 12"} &bull; {selectedStudentForDossier.school}
                </p>
              </div>
              <Badge variant="success" className="text-xs font-bold">
                {selectedStudentForDossier.subscriptionStatus || "Active"}
              </Badge>
            </div>

            {/* Enrolled Tutors Section */}
            <div>
              <h4 className="text-xs font-extrabold text-[#0d2b26] uppercase tracking-wider mb-2">
                Enrolled Tutors & Subscriptions
              </h4>
              <div className="space-y-2">
                {selectedStudentForDossier.enrolledTutors && selectedStudentForDossier.enrolledTutors.length > 0 ? (
                  selectedStudentForDossier.enrolledTutors.map((tName, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{tName}</p>
                          <p className="text-[10px] text-slate-400">Monthly Paid Subscription &bull; Full Access</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold text-[#0d5c4d] border-[#c4e9e0]">
                        Active
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    This student is not yet enrolled with any tutor.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <Button
                type="button"
                size="sm"
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold"
                onClick={() => {
                  const target = selectedStudentForDossier;
                  setSelectedStudentForDossier(null);
                  setSelectedStudentForEnroll(target);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Enroll in Another Tutor
              </Button>
              <Button type="button" variant="outline" onClick={() => setSelectedStudentForDossier(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 5: MANUAL ENROLL STUDENT IN TUTOR                            */}
      {/* =================================================================== */}
      <Modal
        isOpen={Boolean(selectedStudentForEnroll)}
        onClose={() => setSelectedStudentForEnroll(null)}
        title="Manual Student Enrollment"
        description="Enroll student directly into an independent tutor course."
      >
        {selectedStudentForEnroll && (
          <form onSubmit={handleManualEnrollSubmit} className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Selected Student</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedStudentForEnroll.name}</p>
              <p className="text-slate-500 font-mono text-[11px]">{selectedStudentForEnroll.email}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Choose Tutor to Enroll In *
              </label>
              <select
                value={manualEnrollTutorName}
                onChange={(e) => setManualEnrollTutorName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              >
                {soloTutors.map((t) => (
                  <option key={t.id} value={`${t.name} (${t.subject})`}>
                    {t.name} — {t.subject} (LKR {t.monthlyFee.toLocaleString()}/mo)
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] text-xs text-[#0d5c4d]">
              <p className="font-bold flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Instant Access Granted
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                The student will immediately gain access to the tutor&apos;s lesson resources, Google Meet live classes, and study circle.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setSelectedStudentForEnroll(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold">
                Confirm Enrollment
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 6: REGISTER NEW STUDENT                                      */}
      {/* =================================================================== */}
      <Modal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        title="Register New Student"
        description="Add a new student profile and allocate to a tutor curriculum."
      >
        <form onSubmit={handleSaveAddStudent} className="space-y-4 pt-2">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. S. Arulchelvam"
                value={newStudentForm.name}
                onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="student@school.lk"
                value={newStudentForm.email}
                onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">School / Institution</label>
                <input
                  type="text"
                  value={newStudentForm.school}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, school: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Stream</label>
                <select
                  value={newStudentForm.grade}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, grade: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
                >
                  <option value="Grade 12 - Physical Science">Grade 12 - Physical Science</option>
                  <option value="Grade 12 - Biological Science">Grade 12 - Biological Science</option>
                  <option value="Grade 13 - Physical Science">Grade 13 - Physical Science</option>
                  <option value="Grade 13 - Commerce">Grade 13 - Commerce</option>
                  <option value="Grade 13 - Technology">Grade 13 - Technology</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assign Initial Tutor (Optional)
              </label>
              <select
                value={newStudentForm.enrolledTutor}
                onChange={(e) => setNewStudentForm({ ...newStudentForm, enrolledTutor: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="">None (Free Tier)</option>
                {soloTutors.map((t) => (
                  <option key={t.id} value={`${t.name} (${t.subject})`}>
                    {t.name} — {t.subject} (LKR {t.monthlyFee.toLocaleString()}/mo)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddStudentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold">
              Register Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
