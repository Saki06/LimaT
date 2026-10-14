"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  User,
  MapPin,
  BookOpen,
  GraduationCap,
  School,
  Edit3,
  Save,
  Check,
  Users,
  CheckCircle2,
  Camera,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Copy,
  Printer,
  Calendar,
  Clock,
  Download,
  FileCheck,
  UserCheck,
  ShieldCheck,
  Trophy,
  Award,
  Activity,
  Medal,
  Zap,
  Briefcase,
  Video,
  ExternalLink,
  DollarSign,
  Building2,
  Sliders,
  CreditCard
} from "lucide-react";
import { initialExams, initialExamTermResult } from "@/data/mockData";

type ProfileTab =
  | "personal"
  | "academic"
  | "timetable"
  | "transcripts"
  | "sports"
  | "teaching"
  | "qualifications"
  | "schedule"
  | "responsibilities";

export function ProfileView() {
  const { currentUser, currentRole, setCurrentView, addToast, courses, setSelectedCourseId } = useApp();

  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleContinueCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView("courses");
  };

  const handleDownloadHallTicket = () => {
    addToast({
      type: "success",
      title: "Hall Ticket Downloaded",
      message: "Official Examination Admission Card & Timetable (PDF) has been saved."
    });
  };

  const handleDownloadTranscript = () => {
    addToast({
      type: "success",
      title: "Transcript Downloaded",
      message: "Certified Official Academic Transcript with Z-Score downloaded."
    });
  };

  const handleDownloadSportsCertificate = () => {
    addToast({
      type: "success",
      title: "Sports Portfolio Downloaded",
      message: "Official Athletic Achievement Record & College Colors Transcript (PDF) has been saved."
    });
  };

  // Editable Profile State based on role
  const defaultProfile = useMemo(() => {
    if (currentRole === "teacher") {
      return {
        name: currentUser.name || "Mr. Samantha Perera",
        fullName: "Samantha Priyantha Perera",
        preferredName: "Samantha",
        studentId: "TCH-2026-0042",
        indexNumber: "SLTS-REG/2012/4482",
        email: currentUser.email || "samantha.p@school.lk",
        phone: "+94 77 456 7890",
        altPhone: "+94 11 234 5678",
        dob: "1984-06-18",
        gender: "Male",
        bloodGroup: "B+",
        medium: "English, Sinhala & Tamil",
        address: "No. 18, Havelock Road, Havelock Town",
        city: "Colombo 05",
        district: "Colombo",
        province: "Western Province",
        postalCode: "00500",
        bio: "Lead Specialist Educator & Department Chair for Combined Mathematics (A/L). 14 years of teaching excellence preparing students for G.C.E. Advanced Level with distinction.",
        schoolName: (currentUser.schoolName && currentUser.schoolName !== "St. Michael High School") ? currentUser.schoolName : "LimaT Independent Tuition & Masterclasses",
        schoolCode: "LMT-COLOMBO",
        grade: "A/L Faculty (Grade 12 & 13)",
        classRoom: "Advanced Level Mathematics Faculty",
        stream: "Combined Mathematics & Pure Sciences",
        academicYear: "Faculty Member (2012 - Present)",
        house: "Lions Sports Academy Mentor",
        classTeacher: "Head of Faculty (Mathematics)",
        admittedDate: "September 2012",
        attendanceRate: "99.1%",
        gpa: "Faculty Rating 4.9/5.0",
        guardianName: "Mrs. Malini Perera",
        guardianRelationship: "Spouse (Next of Kin)",
        guardianPhone: "+94 77 987 6543",
        guardianEmail: "malini.perera@gmail.com",
        guardianOccupation: "Senior Banking Executive",
        motherName: "M. Perera",
        motherPhone: "+94 11 234 5678",
        emergencyContact: "Faculty Support (+94 11 258 0042)",
        transportMode: "Faculty Parking (Pass #FC-42)",
        healthNotes: "Normal health clearance. First-aid certified.",
        extracurricular: "Master-in-Charge Mathematics Olympiad, Senior Chess Club Patron"
      };
    }

    if (currentRole === "parent") {
      return {
        name: currentUser.name || "Mrs. Priyadarshani Kulatunga",
        fullName: "Priyadarshani Kulatunga",
        preferredName: "Priya",
        studentId: "PAR-2026-012",
        indexNumber: "PAR/NIC-786542190V",
        email: currentUser.email || "priya.k@gmail.com",
        phone: "+94 77 345 6789",
        altPhone: "+94 11 289 1234",
        dob: "1982-11-24",
        gender: "Female",
        bloodGroup: "A+",
        medium: "English & Sinhala",
        address: "No. 42, Temple Road, Wellawatte",
        city: "Colombo 06",
        district: "Colombo",
        province: "Western Province",
        postalCode: "00600",
        bio: "Parent & Guardian of Sathurjan K. (Physical Science A/L Masterclass Batch). Active member of the Masterclass Parent-Mentor Council.",
        schoolName: (currentUser.schoolName && currentUser.schoolName !== "St. Michael High School") ? currentUser.schoolName : "LimaT Independent Tuition & Masterclasses",
        schoolCode: "LMT-COLOMBO",
        grade: "Registered Parent Council Member",
        classRoom: "Guardian of Enrolled Student",
        stream: "Parent-Mentor Council",
        academicYear: "2024 - Present",
        house: "Lions Sports Academy Supporter",
        classTeacher: "Dr. Samantha Perera & Eng. K. Thanushan",
        admittedDate: "January 2024",
        attendanceRate: "100% PTM Attendance",
        gpa: "Verified Guardian Status",
        guardianName: "Mrs. Priyadarshani Kulatunga",
        guardianRelationship: "Mother",
        guardianPhone: "+94 77 345 6789",
        guardianEmail: "priya.k@gmail.com",
        guardianOccupation: "Chartered Accountant & Finance Director",
        motherName: "P. Kulatunga",
        motherPhone: "+94 77 345 6789",
        emergencyContact: "Mr. K. Kulatunga (+94 71 888 4321)",
        transportMode: "Private Vehicle Pickup",
        healthNotes: "Verified emergency contacts on file.",
        extracurricular: "School Development Fund Committee, Annual Sports Meet Organizer"
      };
    }

    if (currentRole === "super_admin") {
      return {
        name: currentUser.name || "SaaS Platform Owner",
        fullName: "LimaT Platform Owner & Chief Director",
        preferredName: "Super Admin",
        studentId: "ROOT-SAAS-001",
        indexNumber: "SAAS-ROOT/DIR-01",
        email: currentUser.email || "director@limat.lk",
        phone: "+94 77 123 4567",
        altPhone: "+94 11 200 4455",
        dob: "1982-01-01",
        gender: "Male",
        bloodGroup: "O+",
        medium: "English, Sinhala & Tamil",
        address: "LimaT Headquarters, Colombo Technology Park",
        city: "Colombo 02",
        district: "Colombo",
        province: "Western Province",
        postalCode: "00200",
        bio: "Master Platform Owner & SaaS System Director with root privileges. Controlling multi-tenant deployments, tenant billing, global feature matrix toggles, and creator ecosystems across Sri Lanka.",
        schoolName: currentUser.schoolName || "LimaT Multi-Tenant Creator Platform",
        schoolCode: "LIMAT-GLOBAL",
        grade: "Platform Director Level",
        classRoom: "Global SaaS Control Center",
        stream: "Enterprise Multi-Tenant Cloud SaaS Engine",
        academicYear: "Active Production (2025 - 2028)",
        house: "Master Operations",
        classTeacher: "Chief Platform Architect",
        admittedDate: "January 2025",
        attendanceRate: "99.98% SLA",
        gpa: "v2.4.0 Multi-Tenant Engine",
        guardianName: "Platform Security Directorate",
        guardianRelationship: "Two-Factor Master Key",
        guardianPhone: "+94 77 123 4567",
        guardianEmail: "security@limat.lk",
        guardianOccupation: "Cloud Infrastructure Directorate",
        motherName: "LimaT Cloud",
        motherPhone: "+94 11 200 4455",
        emergencyContact: "Emergency DevOps NOC (+94 77 999 0000)",
        transportMode: "Direct Cloud Console",
        healthNotes: "Root credentials verified. ISO 27001 compliant.",
        extracurricular: "Global Tenant Onboarding, SaaS Monetization, AI Studio Scaling"
      };
    }

    return {
      name: currentUser.name || "Sathurjan K.",
      fullName: "Sathurjan Kandasamy",
      preferredName: "Sathu",
      studentId: "STU-2026-0842",
      indexNumber: "AL/2026/89421",
      email: currentUser.email || "sathurjan@gmail.com",
      phone: "+94 77 123 4567",
      altPhone: "+94 11 234 5678",
      dob: "2008-03-14",
      gender: "Male",
      bloodGroup: "O+",
      medium: "English & Tamil",
      address: "No. 42, Temple Road, Wellawatte",
      city: "Colombo 06",
      district: "Colombo",
      province: "Western Province",
      postalCode: "00600",
      bio: "Passionate Advanced Level Physical Science student preparing for G.C.E. A/L under leading private educators in Pure Maths, Quantum Physics, Chemistry and Software Architecture.",
      schoolName: (currentUser.schoolName && currentUser.schoolName !== "St. Michael High School") ? currentUser.schoolName : "LimaT Independent Tuition & Masterclasses",
      schoolCode: "LMT-COLOMBO",
      grade: (currentUser.grade && currentUser.grade !== "Grade 12") ? currentUser.grade : "Grade 12 (A/L 2026/2027)",
      classRoom: (currentUser.class && currentUser.class !== "12-Physical Science") ? currentUser.class : "Physical Science A/L Masterclass Batch",
      stream: "Physical Science (G.C.E. Advanced Level)",
      academicYear: "Batch 2026 - 2027",
      house: "Lions Sports & Athletics Academy",
      classTeacher: "Dr. Samantha Perera (Lead Combined Maths Specialist)",
      admittedDate: "January 2024",
      attendanceRate: "96.4%",
      gpa: "3.84 / 4.0",
      guardianName: "K. Kandasamy",
      guardianRelationship: "Father",
      guardianPhone: "+94 71 888 4321",
      guardianEmail: "kandasamy.k@gmail.com",
      guardianOccupation: "Chartered Civil Engineer",
      motherName: "S. Kandasamy",
      motherPhone: "+94 77 555 8912",
      emergencyContact: "K. Kandasamy (+94 71 888 4321)",
      transportMode: "Independent Transport / Online Live Stream",
      healthNotes: "No known allergies. Normal athletic health clearance.",
      extracurricular: "Vice Captain Lions Cricket 1st XI, Senior Athletic Squad, Science Club"
    };
  }, [currentRole, currentUser]);

  const [profileData, setProfileData] = useState(defaultProfile);

  useEffect(() => {
    setProfileData(defaultProfile);
    if (currentRole === "teacher") {
      if (!["personal", "teaching", "schedule"].includes(activeTab)) {
        setActiveTab("personal");
      }
    } else if (currentRole === "super_admin") {
      setActiveTab("personal");
    } else {
      if (!["personal", "academic", "timetable", "transcripts", "sports"].includes(activeTab)) {
        setActiveTab("personal");
      }
    }
  }, [defaultProfile, currentRole]);

  const [avatarPreset, setAvatarPreset] = useState<string>("default");
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<
    "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
  >("Monday");

  const handleCopyId = () => {
    navigator.clipboard?.writeText(profileData.studentId);
    setCopiedId(true);
    addToast({
      type: "info",
      title: "ID Copied",
      message: `${currentRole === "teacher" ? "Tutor ID " : ""}${profileData.studentId} copied to clipboard.`
    });
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadTeacherDossier = () => {
    addToast({
      type: "success",
      title: "Tutor Profile & Portfolio Downloaded",
      message: "Verified Tutor Profile, Credentials & Course Catalog (PDF) has been saved."
    });
  };

  const handleDownloadTeacherTimetable = () => {
    addToast({
      type: "success",
      title: "Live Class Schedule Downloaded",
      message: "Weekly Live Streaming Timetable & Google Meet Session Links (PDF) has been saved."
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    addToast({
      type: "success",
      title: "Profile Saved",
      message: "Your profile information has been successfully updated!"
    });
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <button
              onClick={() => setCurrentView("dashboard")}
              className="hover:text-[#0d5c4d] transition-colors flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-bold text-[#0d5c4d] capitalize">
              {currentRole} Profile
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0d2b26] tracking-tight">
            User Profile &amp; Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your personal identity, academic records, and institutional credentials.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#d6ede6] hover:bg-[#f6fbf9] text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 shadow-2xs"
            title="Print or Save Profile Record as PDF"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print Record</span>
          </button>

          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-sm shadow-[#0d5c4d]/20"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-sm shadow-[#0d5c4d]/20"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Hero Card */}
      <div className="relative rounded-3xl bg-white border border-[#e2eae5] p-5 sm:p-7 shadow-[0_12px_32px_-8px_rgba(13,92,77,0.08)] overflow-hidden">
        {/* Background decorative gradient */}
        <div className="absolute top-0 right-0 w-96 h-36 bg-gradient-to-l from-[#ecf8f5] via-[#f4faf7]/60 to-transparent pointer-events-none rounded-tr-3xl" />
        <div className="absolute top-3 right-4 sm:top-5 sm:right-6 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0] text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {currentRole === "teacher" ? "Senior Faculty Member · Active Service" : "Active Enrolled · Term 2"}
          </span>
        </div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-6">
          {/* Avatar with preset selection & edit indicator */}
          <div className="relative group shrink-0">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-gradient-to-br from-[#0d5c4d] to-[#16423b] flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-lg shadow-[#0d5c4d]/25 border-4 border-white ring-2 ring-[#0d5c4d]/10">
              {profileData.name.charAt(0)}
            </div>
            {isEditing && (
              <button
                type="button"
                className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-full bg-[#f3b738] text-slate-900 flex items-center justify-center shadow-md border-2 border-white hover:scale-105 transition-transform"
                title="Change Avatar Photo"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-[#0d2b26]">
                {profileData.fullName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#fef7e6] text-[#b47a16] border border-[#fde4af] text-[11px] font-bold capitalize">
                {currentRole === "teacher"
                  ? "Verified Tutor & Creator"
                  : currentRole === "super_admin"
                  ? "Master Super Admin • Platform Owner"
                  : currentRole}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                {profileData.stream}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              {profileData.bio}
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <School className="h-3.5 w-3.5 text-[#0d5c4d]" />
                <span className="font-semibold text-slate-700">
                  {currentRole === "teacher"
                    ? "Online Tutor Studio & LMS"
                    : currentRole === "super_admin"
                    ? "Global Multi-Tenant SaaS Platform"
                    : profileData.schoolName}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[#0d5c4d]" />
                <span>{profileData.classRoom}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#0d5c4d]" />
                <span>{profileData.city}, Sri Lanka</span>
              </div>
              <button
                onClick={handleCopyId}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors font-mono font-bold text-[11px] text-slate-700 cursor-pointer"
                title={
                  currentRole === "teacher"
                    ? "Click to copy Tutor ID"
                    : currentRole === "super_admin"
                    ? "Click to copy Master Root ID"
                    : "Click to copy Student ID"
                }
              >
                <span>
                  {currentRole === "teacher"
                    ? `Tutor ID: ${profileData.studentId}`
                    : currentRole === "super_admin"
                    ? `Root ID: ${profileData.studentId}`
                    : `ID: ${profileData.studentId}`}
                </span>
                {copiedId ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Performance Indicators */}
        {currentRole === "teacher" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled Subscribers</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-black text-[#0d5c4d]">142 Students</span>
                <span className="text-[10px] text-emerald-600 font-bold">Across 4 Batches</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Gross Revenue</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-black text-amber-600 font-mono">Rs. 639,000</span>
                <span className="text-[10px] text-slate-500 font-semibold">90% Tutor Payout</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Weekly Live Hours</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-black text-[#0d2b26]">14 Hours</span>
                <span className="text-[10px] text-emerald-600 font-bold">Google Meet Active</span>
              </div>
            </div>
          </div>
        ) : currentRole === "super_admin" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Client Tenants</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-black text-[#0d5c4d]">4 Active Clients</span>
                <span className="text-[10px] text-emerald-600 font-bold">Schools, Tutors &amp; Academies</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly SaaS MRR</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-black text-amber-600 font-mono">LKR 448,000</span>
                <span className="text-[10px] text-slate-500 font-semibold">Recurring Platform Revenue</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Platform Students</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-black text-[#0d2b26]">9,942 Students</span>
                <span className="text-[10px] text-emerald-600 font-bold">Across All Tenant Databases</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>


      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {(currentRole === "teacher"
          ? [
              { id: "personal", label: "Tutor Studio Profile", icon: User },
              { id: "teaching", label: "Active Batches & Study Packages", icon: BookOpen },
              { id: "schedule", label: "Live Class Schedule & Meet", icon: Calendar }
            ]
          : currentRole === "super_admin"
          ? [
              { id: "personal", label: "Platform Director Credentials", icon: User }
            ]
          : [
              { id: "personal", label: "Personal Details", icon: User },
              { id: "academic", label: "Academic & Subjects", icon: GraduationCap },
              { id: "timetable", label: "Online Assessment Schedule", icon: Calendar },
              { id: "transcripts", label: "Tutor Progress Reports", icon: FileCheck },
              { id: "sports", label: "Sports & Achievements", icon: Trophy }
            ]
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProfileTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#0d5c4d] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] border border-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: PERSONAL DETAILS                                            */}
      {/* =================================================================== */}
      {activeTab === "personal" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <User className="h-4 w-4 text-[#0d5c4d]" />
                  <span>
                    {currentRole === "teacher"
                      ? "Faculty Official Identification"
                      : currentRole === "super_admin"
                      ? "Platform Directorate Master Credentials"
                      : "General Information"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentRole === "teacher"
                    ? "Official personal identification and Ministry of Education service registration."
                    : currentRole === "super_admin"
                    ? "Master administrator credentials, root authority, and global tenant control specifications."
                    : "Official personal identification as registered with the Ministry of Education."}
                </p>
              </div>
              {isEditing && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Editing Mode Active
                </span>
              )}
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Legal Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.fullName}
                  </p>
                )}
              </div>

              {/* Preferred Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Display / Preferred Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.name}
                  </p>
                )}
              </div>

              {/* Student ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher"
                    ? "Teacher Service / Faculty ID"
                    : currentRole === "super_admin"
                    ? "Platform Master Root ID"
                    : "Student Admission / Reg Number"}
                </label>
                <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-mono font-bold text-[#0d5c4d]">
                  {profileData.studentId}
                </p>
              </div>

              {/* G.C.E. A/L Index Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher"
                    ? "Sri Lanka Teachers' Service (SLTS) Reg Number"
                    : currentRole === "super_admin"
                    ? "Master Root Authority Identifier"
                    : "Exam Index Number (A/L 2026)"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.indexNumber}
                    onChange={(e) => setProfileData({ ...profileData, indexNumber: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-mono font-semibold text-slate-900">
                    {profileData.indexNumber}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address (Institutional)</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10"
                  />
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    <span>{profileData.email}</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Mobile Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.phone}
                  </p>
                )}
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                    />
                  ) : (
                    <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                      {profileData.dob}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Gender</label>
                  {isEditing ? (
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                      {profileData.gender}
                    </p>
                  )}
                </div>
              </div>

              {/* Medium & Blood Group */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Medium of Study</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.medium}
                      onChange={(e) => setProfileData({ ...profileData, medium: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs"
                    />
                  ) : (
                    <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                      {profileData.medium}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Blood Group</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.bloodGroup}
                      onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-bold text-red-600"
                    />
                  ) : (
                    <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-bold text-red-600">
                      {profileData.bloodGroup}
                    </p>
                  )}
                </div>
              </div>

              {/* Residential Address */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Residential Street Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.address}, {profileData.city}, {profileData.district}, {profileData.province}
                  </p>
                )}
              </div>

              {/* Bio Statement */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Personal Statement / Bio</label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d] leading-relaxed"
                  />
                ) : (
                  <p className="p-3 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {profileData.bio}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* TEACHER QUALIFICATIONS & ACCREDITATIONS (Embedded inside Faculty Profile & Info) */}
          {currentRole === "teacher" && (
            <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#0d5c4d]" />
                    <span>Academic Degrees, Professional Accreditations &amp; Licensing</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified university credentials, post-graduate education diplomas, and Ministry examiner licenses.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTeacherDossier}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-md transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Faculty Dossier (PDF)</span>
                </button>
              </div>

              {/* Higher Education Degrees */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#0d2b26] flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#0d5c4d]" />
                  <span>University Degrees &amp; Higher Education</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      degree: "Bachelor of Science (B.Sc. Special) in Mathematics",
                      institution: "University of Colombo, Sri Lanka",
                      honors: "First Class Honours (GPA: 3.92 / 4.0)",
                      year: "Class of 2008",
                      details: "Pure Mathematics, Real Analysis, Complex Variables, Abstract Algebra & Numerical Methods."
                    },
                    {
                      degree: "Post Graduate Diploma in Education (PGDE)",
                      institution: "National Institute of Education (NIE), Maharagama",
                      honors: "Passed with Distinction",
                      year: "Class of 2014",
                      details: "Secondary & Collegiate STEM Pedagogy, Educational Psychology, Curriculum Formulation & Evaluation."
                    },
                    {
                      degree: "Master of Science (M.Sc.) in Applied Mathematics",
                      institution: "University of Peradeniya",
                      honors: "Thesis Distinction",
                      year: "Class of 2018",
                      details: "Thesis: Numerical Modeling of Partial Differential Equations & Boundary Value Simulations."
                    }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-[#0d5c4d] bg-[#ecf8f5] px-2 py-0.5 rounded-full border border-[#c4e9e0]">
                          {item.year}
                        </span>
                        <h5 className="font-black text-sm text-[#0d2b26] leading-snug">{item.degree}</h5>
                        <p className="text-xs font-semibold text-slate-700">{item.institution}</p>
                        <p className="text-xs text-amber-700 font-bold">{item.honors}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 leading-relaxed">
                        {item.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Government Licensing & Accreditations */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-sm text-[#0d2b26] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Professional Licensing &amp; National Accreditations</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Sri Lanka Teachers' Service (SLTS) Class 1 Senior Educator",
                      issuer: "Ministry of Education, Isurupaya, Battaramulla",
                      regNo: "SLTS-REG/2012/4482",
                      status: "Active & Permanent Pensionable Service · 14 Years Seniority",
                      badge: "SLTS Class 1",
                      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200"
                    },
                    {
                      title: "G.C.E. Advanced Level Chief Examiner & Paper Setter Accreditation",
                      issuer: "Department of Examinations, Pelawatte, Battaramulla",
                      regNo: "EXAM-AL/MTH-P03",
                      status: "Supervising Examiner · Combined Mathematics Paper Evaluation Panel 03",
                      badge: "Chief Examiner",
                      badgeColor: "bg-blue-50 text-blue-800 border-blue-200"
                    },
                    {
                      title: "National STEM Pedagogical Master Trainer & Digital Lead",
                      issuer: "UNESCO & National Education Commission (NEC)",
                      regNo: "STEM-LK/2021/88",
                      status: "Accredited Master Facilitator for Advanced Collegiate Mathematics Instruction",
                      badge: "Master Trainer",
                      badgeColor: "bg-purple-50 text-purple-800 border-purple-200"
                    },
                    {
                      title: "Provincial Teaching Excellence & Mentorship Award (2023)",
                      issuer: "Western Provincial Department of Education",
                      regNo: "WP-EDU/AWARD/2023",
                      status: "Awarded for 98% Distinction Rate in A/L Combined Mathematics Examination",
                      badge: "Provincial Award",
                      badgeColor: "bg-amber-50 text-amber-800 border-amber-200"
                    }
                  ].map((lic, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white border border-[#e6ece8] shadow-2xs hover:shadow-xs transition-shadow space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${lic.badgeColor}`}>
                            {lic.badge}
                          </span>
                          <h5 className="font-extrabold text-sm text-[#0d2b26] mt-1.5 leading-snug">{lic.title}</h5>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 shrink-0">
                          {lic.regNo}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium">{lic.issuer}</p>

                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold pt-2 border-t border-slate-100">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>{lic.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NEXT OF KIN & EMERGENCY LIAISON CARD (Teacher) / PARENT & GUARDIAN CARD (Student) / PLATFORM CLOUD OPERATIONS (Super Admin) */}
          {currentRole === "super_admin" ? (
            <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#0d5c4d]" />
                    <span>Multi-Tenant Cloud Operations &amp; Infrastructure</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Root infrastructure health, live tenant nodes, and platform-level master management.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                  Cluster Status: Optimal (99.98% SLA)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Cloud Region</p>
                  <p className="text-sm font-extrabold text-slate-900">AWS Colombo &amp; Singapore</p>
                  <p className="text-[11px] text-slate-500">Cloudflare Edge CDN Active</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Clearance</p>
                  <p className="text-sm font-extrabold text-[#0d5c4d]">Tier-1 Root Authority</p>
                  <p className="text-[11px] text-slate-500">2FA Master Key Enforced</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Engine Version</p>
                  <p className="text-sm font-extrabold text-slate-900">v2.4.0 Multi-Tenant Engine</p>
                  <p className="text-[11px] text-slate-500">Automated Daily Backups</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView("super_admin_tenants")}
                  className="px-4 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Open Client Tenants Directory</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView("super_admin_matrix")}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sliders className="h-4 w-4" />
                  <span>Configure Granular Feature Matrix</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView("super_admin_pricing")}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>SaaS Packages &amp; Pricing</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#0d5c4d]" />
                    <span>
                      {currentRole === "teacher"
                        ? "Next of Kin & Emergency Liaison"
                        : "Parent & Guardian Information"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentRole === "teacher"
                      ? "Official contact information for institutional welfare, emergency liaison, and faculty benefits."
                      : "Contact information for emergencies, parent-teacher conferences, and academic communications."}
                  </p>
                </div>
                {isEditing && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Editing Mode Active
                  </span>
                )}
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Primary Contact Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher" ? "Next of Kin Full Name" : "Primary Guardian Name"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.guardianName}
                    onChange={(e) => setProfileData({ ...profileData, guardianName: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.guardianName}
                  </p>
                )}
              </div>

              {/* Relationship */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher" ? "Relationship to Faculty Member" : "Relationship to Student"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.guardianRelationship}
                    onChange={(e) => setProfileData({ ...profileData, guardianRelationship: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.guardianRelationship}
                  </p>
                )}
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher" ? "Primary Contact Phone" : "Primary Contact Phone"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.guardianPhone}
                    onChange={(e) => setProfileData({ ...profileData, guardianPhone: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    <span>{profileData.guardianPhone}</span>
                    <a
                      href={`tel:${profileData.guardianPhone}`}
                      className="text-[10px] text-[#0d5c4d] font-bold hover:underline"
                    >
                      {currentRole === "teacher" ? "Call Next of Kin" : "Call Guardian"}
                    </a>
                  </div>
                )}
              </div>

              {/* Contact Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher" ? "Contact Email Address" : "Guardian Email"}
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.guardianEmail}
                    onChange={(e) => setProfileData({ ...profileData, guardianEmail: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.guardianEmail}
                  </p>
                )}
              </div>

              {/* Occupation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher" ? "Occupation / Workplace" : "Guardian Occupation / Workplace"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.guardianOccupation}
                    onChange={(e) => setProfileData({ ...profileData, guardianOccupation: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.guardianOccupation}
                  </p>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher" ? "Faculty Welfare & Emergency Liaison (24/7)" : "Emergency Contact (24/7)"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-900">
                    {profileData.emergencyContact}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )}

      {/* =================================================================== */}
      {/* TEACHER TAB 2: ACTIVE BATCHES & STUDY PACKAGES                      */}
      {/* =================================================================== */}
      {currentRole === "teacher" && activeTab === "teaching" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Active Study Packages &amp; Teaching Batches</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Published subscription packages, enrolled student counts, monthly fee metrics, and syllabus delivery.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentView("teaching")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Launch Teaching Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Workload Metric KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Packages</span>
                <p className="text-2xl font-black text-[#0d5c4d] mt-1 font-mono">4 Packages</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-1">Open for Enrolment</p>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subscribed Students</span>
                <p className="text-2xl font-black text-[#0d2b26] mt-1 font-mono">142 Students</p>
                <p className="text-[10px] text-slate-500 mt-1">Across 4 Active Cohorts</p>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Live Delivery</span>
                <p className="text-2xl font-black text-[#0d2b26] mt-1 font-mono">14 Hours</p>
                <p className="text-[10px] text-slate-500 mt-1">Google Meet &amp; Studio</p>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Batch Gross</span>
                <p className="text-2xl font-black text-amber-600 mt-1 font-mono">Rs. 639,000</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-1">90% Tutor Payout Share</p>
              </div>
            </div>

            {/* Active Study Packages Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#0d2b26]">Published Packages &amp; Cohort Deliverables</h4>
                <span className="text-[11px] font-semibold text-slate-500">Auto-billed monthly per subscriber</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Combined Mathematics 2026 (Pure & Applied Theory)",
                    code: "CMATH-26",
                    tier: "A/L 2026 Comprehensive Theory",
                    students: 48,
                    fee: "Rs. 4,500 / mo",
                    monthlyGross: "Rs. 216,000 / mo",
                    delivery: "Google Meet Live Studio & HD Recordings",
                    schedule: "Mon & Wed · 06:30 PM - 08:30 PM",
                    progress: 76,
                    unitsDone: 9,
                    unitsTotal: 12,
                    badgeColor: "border-indigo-200 bg-indigo-50/50 text-indigo-800"
                  },
                  {
                    title: "Pure Mathematics 2025 (Fast-Track Paper Class)",
                    code: "PMATH-25",
                    tier: "A/L 2025 Revision & Model Papers",
                    students: 42,
                    fee: "Rs. 3,500 / mo",
                    monthlyGross: "Rs. 147,000 / mo",
                    delivery: "Timed Exam Walkthrough & Video Solutions",
                    schedule: "Tue & Thu · 07:00 PM - 09:00 PM",
                    progress: 88,
                    unitsDone: 14,
                    unitsTotal: 16,
                    badgeColor: "border-emerald-200 bg-emerald-50/50 text-emerald-800"
                  },
                  {
                    title: "Applied Mathematics Mechanics & Dynamics Bootcamp",
                    code: "AMATH-26",
                    tier: "Mechanics Intensive Topic Series",
                    students: 32,
                    fee: "Rs. 4,000 / mo",
                    monthlyGross: "Rs. 128,000 / mo",
                    delivery: "Interactive Problem Solving & Whiteboard",
                    schedule: "Saturday Morning · 08:30 AM - 11:30 AM",
                    progress: 70,
                    unitsDone: 7,
                    unitsTotal: 10,
                    badgeColor: "border-blue-200 bg-blue-50/50 text-blue-800"
                  },
                  {
                    title: "G.C.E. A/L Top Rankers Model Paper Masterclass",
                    code: "MC-BOOST",
                    tier: "Elite Island-Rank Booster",
                    students: 20,
                    fee: "Rs. 5,000 / mo",
                    monthlyGross: "Rs. 100,000 / mo",
                    delivery: "Curated Challenge Sets & Individual Feedback",
                    schedule: "Sunday Evening · 06:00 PM - 09:00 PM",
                    progress: 92,
                    unitsDone: 11,
                    unitsTotal: 12,
                    badgeColor: "border-amber-200 bg-amber-50/50 text-amber-800"
                  }
                ].map((course, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-[#e6ece8] bg-[#fcfdfc] hover:border-[#b2e5d9] hover:shadow-xs transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${course.badgeColor}`}>
                            {course.code}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">{course.tier}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-[#0d2b26] mt-1.5">{course.title}</h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-black text-[#0d5c4d] block">
                          {course.fee}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {course.students} Subscribers
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs bg-white p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly Package Gross</span>
                        <p className="font-bold text-[#0d2b26] font-mono">{course.monthlyGross}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Delivery Format</span>
                        <p className="font-semibold text-slate-800 line-clamp-1">{course.delivery}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Live Online Time Slot</span>
                        <p className="font-bold text-[#0d5c4d]">{course.schedule}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Syllabus Completion</span>
                        <span className="font-bold text-[#0d5c4d]">
                          {course.unitsDone} of {course.unitsTotal} Units ({course.progress}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0d5c4d] to-[#147a66] rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => setCurrentView("syllabus_builder")}
                        className="text-[11px] font-bold text-[#0d5c4d] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Manage Syllabus &amp; Notes</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentView("assignments")}
                        className="text-[11px] font-bold text-slate-600 hover:text-[#0d5c4d] transition-colors cursor-pointer"
                      >
                        Submissions &amp; Coursework &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TEACHER TAB 3: LIVE CLASS SCHEDULE & MEET LINKS                     */}
      {/* =================================================================== */}
      {currentRole === "teacher" && activeTab === "schedule" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Weekly Live Class Schedule &amp; Online Studio Sessions</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Day-by-day live stream timetable, interactive doubt clearing clinics, and Google Meet room access.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadTeacherTimetable}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#d6dfd9] text-[#0d5c4d] hover:bg-[#ecf8f5] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Download Live Schedule</span>
                </button>
              </div>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const).map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedScheduleDay(day)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedScheduleDay === day
                      ? "bg-[#0d5c4d] text-white shadow-xs"
                      : "bg-[#f8faf9] text-slate-600 hover:bg-[#ecf8f5] border border-slate-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Day Schedule Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-[#f6fbf9] border border-[#c4e9e0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#0d5c4d]">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-bold">Active Live Schedule for {selectedScheduleDay} · Online Teaching Studio</span>
              </div>
              <span className="font-mono font-bold text-[11px] bg-white px-2.5 py-1 rounded-full border border-[#b2e5d9] self-start sm:self-auto">
                Studio Streaming Active
              </span>
            </div>

            {/* Live Session Cards */}
            <div className="space-y-3">
              {[
                ...(selectedScheduleDay === "Monday"
                  ? [
                      {
                        time: "06:30 PM - 08:30 PM",
                        subject: "Combined Mathematics - Differential Calculus & Real Analysis",
                        cohort: "Batch CMATH-26 · 48 Enrolled Subscribers",
                        type: "Live Theory Lecture",
                        platform: "Google Meet Live Studio",
                        meetCode: "meet.google.com/cmt-26-live",
                        isLive: true
                      },
                      {
                        time: "08:45 PM - 09:30 PM",
                        subject: "1-on-1 Student Doubt Clearing & Homework Review",
                        cohort: "Open Office Hours · All Active Subscribers",
                        type: "Interactive Clinic",
                        platform: "Google Meet Video Room",
                        meetCode: "meet.google.com/tutor-doubt-hub",
                        isLive: false
                      }
                    ]
                  : selectedScheduleDay === "Tuesday"
                  ? [
                      {
                        time: "07:00 PM - 09:00 PM",
                        subject: "Pure Mathematics - 2025 A/L Model Paper Discussion & Time Strategy",
                        cohort: "Batch PMATH-25 · 42 Enrolled Subscribers",
                        type: "Live Paper Class",
                        platform: "Google Meet Live Studio",
                        meetCode: "meet.google.com/pmt-25-paper",
                        isLive: true
                      }
                    ]
                  : selectedScheduleDay === "Wednesday"
                  ? [
                      {
                        time: "06:30 PM - 08:30 PM",
                        subject: "Combined Mathematics - Calculus Tutorial & Complex Problem Sets",
                        cohort: "Batch CMATH-26 · 48 Enrolled Subscribers",
                        type: "Live Problem Solving",
                        platform: "Google Meet Live Studio",
                        meetCode: "meet.google.com/cmt-26-live",
                        isLive: true
                      },
                      {
                        time: "08:40 PM - 09:15 PM",
                        subject: "Homework Grading, Solution Upload & PDF Releases",
                        cohort: "LMS Content Management",
                        type: "Portal Update",
                        platform: "Tutor Content Studio",
                        meetCode: "",
                        isLive: false
                      }
                    ]
                  : selectedScheduleDay === "Thursday"
                  ? [
                      {
                        time: "07:00 PM - 09:00 PM",
                        subject: "Pure Mathematics - Trigonometry & Complex Numbers Workshop",
                        cohort: "Batch PMATH-25 · 42 Enrolled Subscribers",
                        type: "Masterclass Workshop",
                        platform: "Google Meet Live Studio",
                        meetCode: "meet.google.com/pmt-25-paper",
                        isLive: true
                      }
                    ]
                  : selectedScheduleDay === "Friday"
                  ? [
                      {
                        time: "06:30 PM - 07:45 PM",
                        subject: "Weekly Mathematics Olympiad & Advanced Challenge Seminar",
                        cohort: "Elite Challenge Cohort · Top Rankers",
                        type: "Special Masterclass",
                        platform: "Google Meet Live Studio",
                        meetCode: "meet.google.com/mth-olym-live",
                        isLive: true
                      },
                      {
                        time: "08:00 PM - 09:00 PM",
                        subject: "Study Notes, Video Recording Archival & Week 08 Wrap-up",
                        cohort: "All Enrolled Batches",
                        type: "Content Production",
                        platform: "LMS Cloud Vault",
                        meetCode: "",
                        isLive: false
                      }
                    ]
                  : selectedScheduleDay === "Saturday"
                  ? [
                      {
                        time: "08:30 AM - 11:30 AM",
                        subject: "Applied Mathematics - Mechanics, Equilibrium & Circular Motion Bootcamp",
                        cohort: "Batch AMATH-26 · 32 Enrolled Subscribers",
                        type: "3-Hour Intensive",
                        platform: "Google Meet Live Studio",
                        meetCode: "meet.google.com/amt-26-mech",
                        isLive: true
                      }
                    ]
                  : [
                      {
                        time: "06:00 PM - 09:00 PM",
                        subject: "Top Rankers Model Paper Masterclass - Island Rank Problem Clinic",
                        cohort: "Batch MC-BOOST · 20 Enrolled Subscribers",
                        type: "Elite Masterclass",
                        platform: "Google Meet Live Studio",
                        meetCode: "meet.google.com/mc-boost-live",
                        isLive: true
                      }
                    ])
              ].map((slot, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-[#e6ece8] bg-white hover:border-[#b2e5d9] shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="h-12 w-28 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex flex-col items-center justify-center font-bold shrink-0">
                      <span className="text-[11px] font-black">{slot.type}</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5">{slot.time}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-[#0d2b26]">{slot.subject}</span>
                        {slot.isLive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Session
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Target: <span className="font-semibold text-slate-700">{slot.cohort}</span> · Platform:{" "}
                        <span className="font-semibold text-[#0d5c4d]">{slot.platform}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                    {slot.meetCode ? (
                      <a
                        href={`https://${slot.meetCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Launch Google Meet</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCurrentView("content_vault")}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <span>Open Vault</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STUDENT TABS (Only for student / parent roles)                      */}
      {/* =================================================================== */}
      {currentRole !== "teacher" && (
        <>
          {/* TAB 2: ACADEMIC & SUBJECTS                                         */}
          {activeTab === "academic" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            <div>
              <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#0d5c4d]" />
                <span>Enrolled Curriculum &amp; Faculty Mentors</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current term academic load, class assignment, and instructor details.
              </p>
            </div>

            {/* Tuition Hub & Stream Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tuition Ecosystem</span>
                <p className="font-black text-sm text-[#0d2b26]">{profileData.schoolName}</p>
                <p className="text-[11px] text-slate-500">Center Code: {profileData.schoolCode} · Colombo</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Masterclass Cohort</span>
                <p className="font-black text-sm text-[#0d2b26]">{profileData.classRoom}</p>
                <p className="text-[11px] text-slate-500">{profileData.stream}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lead Academic Mentor</span>
                <p className="font-black text-sm text-[#0d2b26]">{profileData.classTeacher}</p>
                <p className="text-[11px] text-slate-500">Senior Faculty &bull; Pure &amp; Applied Maths</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Syllabus Cycle</span>
                <p className="font-black text-sm text-[#0d2b26]">A/L 2026/2027 Full Syllabus Pass</p>
                <p className="text-[11px] text-emerald-600 font-semibold">Active Masterclass Subscription</p>
              </div>
            </div>

            {/* Enrolled Subjects List */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-sm text-[#0d2b26]">Active Subjects</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    name: "Combined Mathematics",
                    code: "CM-AL-2026",
                    teacher: "Dr. Samantha Perera",
                    progress: "Module 7 of 10 Complete",
                    grade: "A+ (94)",
                    color: "border-emerald-200 bg-emerald-50/40"
                  },
                  {
                    name: "Physics (Theory & Practicals)",
                    code: "PHY-AL-2026",
                    teacher: "Eng. K. Thanushan",
                    progress: "Module 6 of 10 Complete",
                    grade: "A (88)",
                    color: "border-blue-200 bg-blue-50/40"
                  },
                  {
                    name: "Chemistry",
                    code: "CHEM-AL-2026",
                    teacher: "Dr. Nilmini Silva",
                    progress: "Module 6 of 10 Complete",
                    grade: "A (91)",
                    color: "border-purple-200 bg-purple-50/40"
                  },
                  {
                    name: "Information & Communication Technology",
                    code: "ICT-AL-2026",
                    teacher: "Eng. S. Wickramasinghe",
                    progress: "Module 8 of 10 Complete",
                    grade: "A+ (96)",
                    color: "border-amber-200 bg-amber-50/40"
                  }
                ].map((subject, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border ${subject.color} flex items-center justify-between transition-all hover:shadow-xs`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">{subject.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{subject.code}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Lead Educator: {subject.teacher}</p>
                      <p className="text-[10px] text-emerald-700 font-bold">{subject.progress}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-[#0d5c4d] bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                        {subject.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB: ONLINE ASSESSMENT SCHEDULE & MODEL PAPERS                     */}
      {/* =================================================================== */}
      {activeTab === "timetable" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Online Masterclass Assessments &amp; Model Paper Schedule</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled online model paper dates, timed portal submission windows, proctoring details, and live mentor discussion slots.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] font-bold text-xs border border-[#b2e5d9] self-start sm:self-auto">
                <Video className="h-3.5 w-3.5" />
                <span>Live Online Proctored</span>
              </div>
            </div>

            {/* Candidate Online Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-[#f6fbf9] border border-[#c4e9e0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#0d5c4d]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-bold">Candidate Index: {profileData.indexNumber || "LMT-2026-12A-042"}</span>
                <span className="hidden sm:inline text-slate-400">|</span>
                <span className="hidden sm:inline text-slate-600">Online Submission Timer Active &bull; Upload scanned PDF scripts</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#b2e5d9] font-extrabold text-[10px] text-[#0d5c4d] shadow-2xs self-start sm:self-auto">
                Webcam &amp; Portal Monitored ✓
              </span>
            </div>

            {/* Exams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialExams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-[#fcfdfc] rounded-2xl border border-[#e6ece8] p-5 shadow-2xs hover:shadow-md hover:border-[#b2e5d9] transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] text-[10px] font-bold uppercase tracking-wider">
                        {exam.subject}
                      </span>
                      <h4 className="font-extrabold text-sm text-[#0d2b26] mt-1.5 leading-snug">
                        {exam.title}
                      </h4>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-extrabold text-[11px] border border-amber-200 shrink-0">
                      {exam.durationMinutes / 60} Hours
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-[#eef3f0]">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Date</p>
                        <p className="font-bold">{exam.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Time Window</p>
                        <p className="font-bold">{exam.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Video className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Exam Platform</p>
                        <p className="font-bold line-clamp-1">{exam.hallName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <ShieldCheck className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Mode</p>
                        <p className="font-bold text-[#0d5c4d]">{exam.seatNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#f0f4f1] text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Conducting Mentor: <span className="text-slate-800 font-bold">{exam.invigilator}</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Online Scheduled ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB: TUTOR PROGRESS REPORTS & ASSESSMENT CARDS                     */}
      {/* =================================================================== */}
      {activeTab === "transcripts" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Solo Tutor Assessment Reports &amp; Progress Cards</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Individual mock paper evaluations, personalized mentor remarks, cohort ranks, and verified teacher feedback from each enrolled tutor.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] text-xs font-bold border border-[#b2e5d9]">
                  4 Enrolled Tutors Active
                </span>
              </div>
            </div>

            {/* Individual Solo Tutor Progress Cards Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0d2b26] flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Enrolled Solo Tutors &bull; Monthly Progress &amp; Assessment Reports</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">May 2026 Evaluation Cycle</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    subject: "Combined Mathematics",
                    tutorName: "Dr. Samantha Perera",
                    tutorTitle: "Lead Combined Maths Specialist · Pure & Applied",
                    tutorAvatar: "SP",
                    assessmentTitle: "Differential Calculus & Vector Mechanics Mock Paper",
                    marks: 89,
                    grade: "A",
                    batchRank: 2,
                    totalStudents: 120
                  },
                  {
                    subject: "Physics",
                    tutorName: "Eng. K. Thanushan",
                    tutorTitle: "Lead Physics Specialist & Engineer · Mechanics & Optics",
                    tutorAvatar: "KT",
                    assessmentTitle: "Rotational Dynamics & Wave Mechanics Evaluation",
                    marks: 85,
                    grade: "A",
                    batchRank: 4,
                    totalStudents: 95
                  },
                  {
                    subject: "Chemistry",
                    tutorName: "Dr. Nilmini Silva",
                    tutorTitle: "Doctor of Chemistry & Lead Educator · Physical & Inorganic",
                    tutorAvatar: "NS",
                    assessmentTitle: "Ionic Equilibrium & Organic Reaction Mechanisms",
                    marks: 78,
                    grade: "A",
                    batchRank: 7,
                    totalStudents: 110
                  },
                  {
                    subject: "Information Technology",
                    tutorName: "Eng. S. Wickramasinghe",
                    tutorTitle: "Lead Systems Architect & ICT Faculty · Algorithms & Database",
                    tutorAvatar: "SW",
                    assessmentTitle: "Python Programming & Relational Database Design",
                    marks: 94,
                    grade: "A",
                    batchRank: 1,
                    totalStudents: 85
                  }
                ].map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-[#fcfdfc] rounded-2xl border border-[#e2eae5] p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-[#b2e5d9] transition-all space-y-3"
                  >
                    {/* Tutor Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] font-black text-sm flex items-center justify-center border border-[#b2e5d9] shrink-0">
                          {card.tutorAvatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] text-[10px] font-extrabold uppercase">
                              {card.subject}
                            </span>
                            {card.batchRank === 1 && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                                Batch Topper ★
                              </span>
                            )}
                          </div>
                          <h5 className="font-extrabold text-sm text-[#0d2b26] mt-0.5">
                            {card.tutorName}
                          </h5>
                          <p className="text-[10px] text-slate-500">{card.tutorTitle}</p>
                        </div>
                      </div>

                      {/* Grade Badge */}
                      <div className="text-right shrink-0">
                        <span className="inline-block px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-black text-base border border-emerald-200">
                          {card.grade}
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Grade</p>
                      </div>
                    </div>

                    {/* Assessment & Marks Details */}
                    <div className="bg-white p-3 rounded-xl border border-[#edf3f0] flex items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Assessment</p>
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {card.assessmentTitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="bg-[#f8faf9] px-3 py-1.5 rounded-lg border border-slate-100 text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Marks</p>
                          <p className="font-black text-sm text-[#0d5c4d]">{card.marks}</p>
                        </div>
                        <div className="bg-[#f8faf9] px-3 py-1.5 rounded-lg border border-slate-100 text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Batch Rank</p>
                          <p className="font-black text-sm text-slate-800">
                            #{card.batchRank}{" "}
                            <span className="text-[10px] font-normal text-slate-400">/ {card.totalStudents}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer / Verification */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="font-bold text-slate-700">Verified by {card.tutorName}</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Signed &amp; Approved ✓
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB: SPORTS & ATHLETIC ACHIEVEMENTS RECORD                         */}
      {/* =================================================================== */}
      {activeTab === "sports" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Student Athletic Portfolio &amp; Sports Achievement Records</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified institutional sports credentials, tournament records, representative honours, and fitness certifications.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadSportsCertificate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-md transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Sports Record (PDF)</span>
              </button>
            </div>

            {/* Top Athletic Metrics / Honours Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Sport</span>
                <p className="text-lg font-black text-[#0d5c4d] mt-1">Cricket (First XI)</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">Vice Captain</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Jersey #07</span>
                </div>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academy Honours</span>
                <p className="text-lg font-black text-[#0d2b26] mt-1">Double Colorsman</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-1">Cricket &amp; Track Athletics</p>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Career Medals</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-black text-amber-600 font-mono">12</p>
                  <span className="text-[11px] font-bold text-slate-600">Medals Won</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">6 Gold • 4 Silver • 2 Bronze</p>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fitness Level</span>
                <p className="text-lg font-black text-[#0d5c4d] mt-1 font-mono">Grade A+ (Elite)</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-1">Yo-Yo IR1: Level 19.4 • Fit</p>
              </div>
            </div>

            {/* Active Teams & Squad Roster Enrollment */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0d2b26] flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-[#0d5c4d]" />
                <span>Enrolled Teams &amp; Squad Rosters</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Team 1: Cricket */}
                <div className="p-4 rounded-2xl bg-[#fcfdfc] border border-[#e2eae5] hover:border-[#b2e5d9] transition-all space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold">
                        Major Sport
                      </span>
                      <h5 className="font-extrabold text-sm text-[#0d2b26] mt-1">Lions Academy First XI Cricket</h5>
                    </div>
                    <span className="text-xl">🏏</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><span className="font-bold text-slate-800">Role:</span> All-Rounder / Vice Captain</p>
                    <p><span className="font-bold text-slate-800">Specialty:</span> Right-Hand Bat, Right-Arm Medium Fast</p>
                    <p><span className="font-bold text-slate-800">Coach:</span> Coach Samantha Perera</p>
                    <p><span className="font-bold text-slate-800">Schedule:</span> Mon, Wed, Fri (3:30 - 5:30 PM)</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-bold">16 Appearances</span>
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">Active Captaincy ✓</span>
                  </div>
                </div>

                {/* Team 2: Athletics */}
                <div className="p-4 rounded-2xl bg-[#fcfdfc] border border-[#e2eae5] hover:border-[#b2e5d9] transition-all space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold">
                        Track &amp; Field
                      </span>
                      <h5 className="font-extrabold text-sm text-[#0d2b26] mt-1">Lions Senior Track &amp; Sprint Squad</h5>
                    </div>
                    <span className="text-xl">🏃</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><span className="font-bold text-slate-800">Events:</span> 100m, 200m &amp; 4x100m Relay Anchor</p>
                    <p><span className="font-bold text-slate-800">Personal Best:</span> 100m: 11.02s | 200m: 22.45s</p>
                    <p><span className="font-bold text-slate-800">Coach:</span> Coach M. Faizal</p>
                    <p><span className="font-bold text-slate-800">Schedule:</span> Tue, Thu (6:00 - 7:30 AM)</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-bold">National Qualifier</span>
                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold">Championship Record Holder</span>
                  </div>
                </div>

                {/* Team 3: Inter-House */}
                <div className="p-4 rounded-2xl bg-[#fcfdfc] border border-[#e2eae5] hover:border-[#b2e5d9] transition-all space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-extrabold">
                        Academy League
                      </span>
                      <h5 className="font-extrabold text-sm text-[#0d2b26] mt-1">Lions Academy Gold Squad</h5>
                    </div>
                    <span className="text-xl">🏆</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><span className="font-bold text-slate-800">Role:</span> Senior Academy Sports Captain</p>
                    <p><span className="font-bold text-slate-800">Meet Points:</span> 28 Individual Championship Points</p>
                    <p><span className="font-bold text-slate-800">Squad Mentor:</span> Eng. K. Thanushan</p>
                    <p><span className="font-bold text-slate-800">Squad Rank:</span> 1st Place Overall (2026)</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-purple-700 font-bold">Best Senior Athlete</span>
                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold">Academy Shield ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Tournament Achievements & Medals Table */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0d2b26] flex items-center gap-1.5">
                <Medal className="h-3.5 w-3.5 text-amber-500" />
                <span>Official Tournament Achievements &amp; Medal Records</span>
              </h4>

              <div className="bg-white rounded-2xl border border-[#e6ece8] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fcfdfc] border-b border-[#e6ece8] text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Event / Tournament</th>
                        <th className="py-3 px-4">Sport</th>
                        <th className="py-3 px-4 text-center">Medal / Award</th>
                        <th className="py-3 px-4">Level</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Performance Highlights</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f4f1]">
                      {[
                        {
                          tournament: "All-Island Academy & Club Tier 1 Tournament (Finals)",
                          sport: "Cricket",
                          medal: "Gold Medal & Man of the Match",
                          medalType: "gold",
                          level: "National Tier 1",
                          date: "Sept 2026",
                          highlights: "Scored 78* (62 balls) & took 4/28 vs Colombo CC. Lions Academy won by 38 runs."
                        },
                        {
                          tournament: "Sri Lanka All-Island Academy Athletics Meet",
                          sport: "Athletics",
                          medal: "Gold Medal (New Record)",
                          medalType: "gold",
                          level: "All-Island National",
                          date: "July 2025",
                          highlights: "4x100m Relay Anchor Leg (Championship Record: 42.18s)."
                        },
                        {
                          tournament: "Western Provincial Track & Field Championship",
                          sport: "Athletics",
                          medal: "Silver Medal",
                          medalType: "silver",
                          level: "Provincial",
                          date: "Aug 2025",
                          highlights: "200m Sprint Final: 22.45 seconds (PB)."
                        },
                        {
                          tournament: "Lions Sports Academy Annual Awards Night 2025/2026",
                          sport: "Multi-Sport",
                          medal: "Academy Double Colors Award",
                          medalType: "colors",
                          level: "Institutional",
                          date: "Feb 2026",
                          highlights: "Honoured with Lions Golden Emblem for cricket and sprint athletics excellence."
                        },
                        {
                          tournament: "Annual Academy Championship League",
                          sport: "Athletics",
                          medal: "Senior Champion Trophy",
                          medalType: "trophy",
                          level: "Academy League",
                          date: "Feb 2026",
                          highlights: "Gold in 100m, Gold in 200m, Gold in 4x100m Relay. Total 28 Points for Lions Gold Squad."
                        },
                        {
                          tournament: "All-Island Junior Badminton Championship",
                          sport: "Badminton",
                          medal: "Bronze Medal",
                          medalType: "bronze",
                          level: "National Junior",
                          date: "Nov 2024",
                          highlights: "Under-16 Boys Doubles Semi-Finalist."
                        }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#f9fbf9] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{item.tournament}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ecf8f5] text-[#0d5c4d]">
                              {item.sport}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                item.medalType === "gold"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : item.medalType === "silver"
                                  ? "bg-slate-200 text-slate-800 border border-slate-300"
                                  : item.medalType === "colors"
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                  : item.medalType === "trophy"
                                  ? "bg-purple-100 text-purple-900 border border-purple-300"
                                  : "bg-orange-100 text-orange-900 border border-orange-300"
                              }`}
                            >
                              {item.medal}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-semibold">{item.level}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{item.date}</td>
                          <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs">{item.highlights}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Fitness, Biometrics & Coach Clearance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Biometrics */}
              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#0d2b26] flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-[#0d5c4d]" />
                    <span>Physical Biometrics &amp; Conditioning</span>
                  </h5>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                    Medical Fit ✓
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Height / Weight</p>
                    <p className="font-black text-[#0d2b26] mt-0.5">178 cm / 68 kg</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Yo-Yo Test</p>
                    <p className="font-black text-[#0d5c4d] mt-0.5">Level 19.4</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">VO2 Max</p>
                    <p className="font-black text-amber-600 mt-0.5">58.2 ml/kg</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-200/60">
                  <p>• Medical Examiner: <span className="font-bold text-slate-700">Dr. H. Wickremasinghe, MBBS</span> (Sports Medicine Board)</p>
                  <p>• Clearance Validity: <span className="font-bold text-slate-700">Full Academic Year 2026/2027</span></p>
                </div>
              </div>

              {/* Coach Endorsement */}
              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-3 flex flex-col justify-between">
                <div>
                  <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#0d2b26] flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0d5c4d]" />
                    <span>Head Coach &amp; Academy Director Endorsement</span>
                  </h5>
                  <p className="text-xs text-slate-600 italic mt-2 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    &ldquo;Sathurjan is an exemplary natural leader on the field. His tactical awareness as Vice Captain in our Lions First XI cricket squad and explosive anchor leg in athletics reflect exceptional dedication, balancing top physical fitness with academic brilliance.&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                  <span className="font-bold text-slate-700">Coach Samantha Perera (Academy Sports Director)</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-[#c4e9e0] text-[#0d5c4d] font-bold">
                    Official Stamp Verified ✓
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
