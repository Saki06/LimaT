"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  mockChildrenProfiles,
  initialParentLeaveRequests,
  initialSchoolCirculars,
  ParentChildProfile,
  ParentLeaveRequest,
  SchoolCircular,
  SubjectGrade,
  ExamScheduleItem,
  PastTermComparison,
  AcademicYearRecord
} from "@/data/parentMockData";
import {
  Users,
  GraduationCap,
  Calendar,
  Award,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  FileCheck,
  PlusCircle,
  ExternalLink,
  Sparkles,
  Search,
  Bell,
  CheckCheck,
  MapPin,
  FileSpreadsheet,
  History,
  TrendingUp,
  Layers,
  BookmarkCheck,
  Star,
  Video,
  CreditCard
} from "lucide-react";
import { initialConnectTeachers } from "@/data/connectMockData";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export function ParentDashboardView() {
  const { currentView, setCurrentView, addToast } = useApp();

  // Child selection state
  const [selectedChildId, setSelectedChildId] = useState<string>("child_01");

  // Map currentView to internal active tab
  const getInitialTab = () => {
    switch (currentView) {
      case "report_card":
        return "report_card";
      case "exams":
      case "homework":
        return "exams";
      case "circulars":
        return "circulars";
      default:
        return "overview";
    }
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  // Sync when sidebar currentView changes
  React.useEffect(() => {
    if (["overview", "report_card", "exams", "circulars"].includes(currentView)) {
      setActiveTab(currentView);
    } else if (currentView === "dashboard") {
      setActiveTab("overview");
    }
  }, [currentView]);

  // Leave requests & children list local state
  const [leaveRequests, setLeaveRequests] = useState<ParentLeaveRequest[]>(initialParentLeaveRequests);
  const [childrenList, setChildrenList] = useState<ParentChildProfile[]>(mockChildrenProfiles);

  // Selected child object
  const activeChild = childrenList.find((c) => c.id === selectedChildId) || childrenList[0];

  // Selected Academic Year for multi-year Grade 6 to 13 dossiers
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("2026");
  const [dossierViewMode, setDossierViewMode] = useState<'term_report' | 'cumulative_transcript'>('term_report');
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);

  // Active year record
  const activeYearRecord =
    activeChild.academicJourney?.find((y) => y.year === selectedAcademicYear) ||
    activeChild.academicJourney?.[0];

  // Selected Term Report state (Support multi-term archive)
  const [selectedTermReportId, setSelectedTermReportId] = useState<string>("");

  const activeTermReport =
    (activeChild.termReports && activeChild.termReports.find((r) => r.id === selectedTermReportId)) ||
    (activeYearRecord && activeYearRecord.terms && activeYearRecord.terms[0]) ||
    (activeChild.termReports && activeChild.termReports[0]) ||
    activeChild.termReport;

  // Modals state
  const [isReportCardModalOpen, setIsReportCardModalOpen] = useState(false);
  const [isHallTicketModalOpen, setIsHallTicketModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedCircular, setSelectedCircular] = useState<SchoolCircular | null>(null);
  const [examTypeFilter, setExamTypeFilter] = useState<string>("all");

  // Leave Request Form State
  const [leaveStartDate, setLeaveStartDate] = useState("2026-10-12");
  const [leaveEndDate, setLeaveEndDate] = useState("2026-10-13");
  const [leaveReason, setLeaveReason] = useState<ParentLeaveRequest["reason"]>("Medical Illness");
  const [leaveNote, setLeaveNote] = useState("");
  const [hasMedicalSlip, setHasMedicalSlip] = useState(false);

  const handleTabChange = (tab: string) => {
    if (tab === "connect" || tab === "find_teachers") {
      setCurrentView("connect");
      return;
    }
    setActiveTab(tab);
    if (tab === "overview") {
      setCurrentView("dashboard");
    } else {
      setCurrentView(tab);
    }
  };

  const handleChildSwitch = (childId: string) => {
    setSelectedChildId(childId);
    const child = childrenList.find((c) => c.id === childId);
    if (child) {
      const firstYear = child.academicJourney?.[0]?.year || "2026";
      setSelectedAcademicYear(firstYear);
      if (child.termReports && child.termReports.length > 0) {
        setSelectedTermReportId(child.termReports[0].id);
      }
      addToast({
        type: "info",
        title: `Switched Student Profile`,
        message: `Now viewing academic records for ${child.name} (${child.grade})`
      });
    }
  };

  const handleYearSelect = (year: string) => {
    setSelectedAcademicYear(year);
    const yr = activeChild.academicJourney?.find((y) => y.year === year);
    if (yr && yr.terms.length > 0) {
      setSelectedTermReportId(yr.terms[0].id);
    }
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveNote.trim()) {
      addToast({
        type: "warning",
        title: "Reason Required",
        message: "Please enter a brief note explaining the absence."
      });
      return;
    }

    const newRequest: ParentLeaveRequest = {
      id: `leave_req_${Date.now()}`,
      childId: activeChild.id,
      childName: activeChild.name,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      reason: leaveReason,
      note: leaveNote.trim(),
      hasMedicalCertificate: hasMedicalSlip,
      status: "pending",
      submittedDate: new Date().toISOString().split("T")[0]
    };

    setLeaveRequests([newRequest, ...leaveRequests]);
    setIsLeaveModalOpen(false);
    setLeaveNote("");
    setHasMedicalSlip(false);

    addToast({
      type: "success",
      title: "Leave Note Submitted",
      message: `Absence request for ${activeChild.name} sent to ${activeChild.classTeacher} and Principal.`
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner: Parent Identity & Multi-Child Switcher */}
      <div className="rounded-3xl bg-gradient-to-r from-[#082a24] via-[#0d5c4d] to-[#14473e] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-[#167866]">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-[#f3b738]/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Parent Welcome Info */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
              <span className="text-sm">👨‍👩‍👧</span>
              <span>LimaT Smart Book • Official Parent Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Parent &amp; Guardian Portal
            </h1>
            <p className="text-sm text-emerald-100/90 max-w-xl font-medium">
              Academic &amp; Attendance Monitoring • <strong className="text-white font-bold">{activeChild.name}</strong> • {activeChild.schoolName} ({activeChild.classSection})
            </p>
          </div>

          {/* Child Switcher Selector Pills */}
          <div className="bg-black/30 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/80 px-2 sm:px-3 text-center sm:text-left shrink-0">
              Select Child:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto min-w-0 py-0.5">
              {childrenList.map((child) => {
                const isSelected = child.id === activeChild.id;
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => handleChildSwitch(child.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white text-[#082a24] shadow-lg scale-102 font-black"
                        : "bg-white/10 text-white hover:bg-white/20 hover:text-emerald-100"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center font-black text-xs ${
                        isSelected ? "bg-[#0d5c4d] text-white" : "bg-white/20 text-white"
                      }`}
                    >
                      {child.avatarText}
                    </div>
                    <div className="text-left">
                      <p className="leading-tight">{child.name}</p>
                      <p className={`text-[10px] ${isSelected ? "text-slate-600" : "text-emerald-200/80"}`}>
                        {child.grade}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Navigation Tabs inside the portal */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/15 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Executive Overview", icon: Sparkles },
            { id: "connect", label: "Find Teachers", icon: GraduationCap },
            { id: "report_card", label: "Term Report Cards", icon: Award },
            { id: "exams", label: "Term Exams & Schedules", icon: FileSpreadsheet },
            { id: "circulars", label: "School Circulars", icon: Bell }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#f3b738] text-slate-950 shadow-md font-black"
                    : "bg-white/10 text-emerald-100 hover:bg-white/20 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: EXECUTIVE OVERVIEW                                 */}
      {/* ========================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Tutor & Tuition Masterclass Banner for Active Child */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d5c4d] via-[#106b5a] to-[#083e34] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-[#167866]">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-[#f3b738] text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm text-xl">
                👨‍🏫
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                    Find Specialized Tutors for {activeChild.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#f3b738] text-slate-950 text-[10px] font-black uppercase">
                    Masterclasses
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  Browse verified teachers for {activeChild.grade}, compare monthly tuition fees, view syllabus tutes, and enroll your child with direct bank slip verification.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView("connect")}
              className="px-4 py-2 rounded-xl bg-[#f3b738] hover:bg-[#d99c25] text-slate-950 font-black text-xs transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Explore Tutors &amp; Packages</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Key Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Academic Average */}
            <div className="bg-white rounded-2xl p-5 border border-[#e6ece8] shadow-xs hover:border-[#0d5c4d]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Term GPA</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Award className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#0d2b26]">{activeChild.overallAverage}%</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Rank #{activeChild.classRank} / {activeChild.totalStudents}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">2nd Term Evaluation Performance</p>
              </div>
            </div>

            {/* Card 2: Attendance */}
            <div className="bg-white rounded-2xl p-5 border border-[#e6ece8] shadow-xs hover:border-[#0d5c4d]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Calendar className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#0d2b26]">{activeChild.attendanceRate}%</span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {activeChild.presentDays}/{activeChild.totalDays} Days
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">On-campus morning check-ins</p>
              </div>
            </div>

            {/* Card 3: Scheduled Exam Papers */}
            <div className="bg-white rounded-2xl p-5 border border-[#e6ece8] shadow-xs hover:border-[#0d5c4d]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Exam Papers</span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <FileText className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#0d2b26]">{activeChild.upcomingExamsCount} Papers</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    Term 3 Series
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Hall Ticket: <span className="font-bold text-slate-700">{activeChild.hallTicketNo}</span>
                </p>
              </div>
            </div>

            {/* Card 4: Next Major Milestone */}
            <div className="bg-white rounded-2xl p-5 border border-[#e6ece8] shadow-xs hover:border-[#0d5c4d]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Milestone</span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <Clock className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-sm font-black text-[#0d2b26] line-clamp-1">{activeChild.nextExamName}</span>
                <p className="text-xs font-bold text-indigo-600 mt-1">{activeChild.nextExamDate}</p>
              </div>
            </div>
          </div>

          {/* Quick Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setIsReportCardModalOpen(true)}
              className="p-4 rounded-2xl bg-[#ecf8f5] border border-[#c4e9e0] hover:bg-[#e0f3ee] text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#0d5c4d] text-white flex items-center justify-center font-bold">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0d2b26]">View Official Report Card</p>
                  <p className="text-xs text-slate-600">Print or download certified Term 2 PDF</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#0d5c4d] group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#0d5c4d] text-white flex items-center justify-center font-bold">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Class Teacher: {activeChild.classTeacher}</p>
                  <p className="text-xs text-slate-600">Contact: {activeChild.classTeacherPhone}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTabChange("exams")}
              className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 hover:bg-indigo-100/70 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Term Exam Timetable</p>
                  <p className="text-xs text-slate-600">Hall ticket & seat allocations</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-indigo-700 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Section: Academic Highlights */}
          <div className="bg-white rounded-3xl p-6 border border-[#e6ece8] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f4f1]">
              <div>
                <h3 className="text-base font-black text-[#0d2b26]">Term Evaluation Subject Breakdown</h3>
                <p className="text-xs text-slate-500">Official marks released by subject educators</p>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange("report_card")}
                className="text-xs font-bold text-[#0d5c4d] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Detailed Card</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {activeChild.termReport.subjects.map((sub) => (
                <div key={sub.code} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center font-black text-xs">
                      {sub.grade}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{sub.subject}</p>
                      <p className="text-xs text-slate-500">{sub.teacher}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-400">Class Average</p>
                      <p className="text-xs font-bold text-slate-600">{sub.classAverage}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-[#0d2b26]">{sub.score} / 100</p>
                      <p className="text-[10px] font-bold text-emerald-600">Grade {sub.grade}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Find Teachers & Tuition Fee Packages Showcase for Parent */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e6ece8] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-50 text-[#0d5c4d]">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-black text-[#0d2b26] tracking-tight">
                    Find Teachers &amp; Tuition Packages for {activeChild.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black uppercase">
                    Verified Tutors
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Explore verified teachers for {activeChild.grade}, compare monthly tuition fees, preview lesson videos, and enroll your child with direct bank slip verification.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentView("connect")}
                className="px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-black shadow-sm transition-all hover:scale-[1.02] flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>View All Teachers &amp; Packages</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Grid of Verified Teachers with full details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {initialConnectTeachers.slice(0, 3).map((teacher) => (
                <div
                  key={teacher.id}
                  className="rounded-2xl border border-[#c4e9e0] bg-[#fdfefe] p-5 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-12 w-12 rounded-xl ${teacher.avatarColor} text-white font-black text-base flex items-center justify-center shrink-0 shadow-2xs`}
                        >
                          {teacher.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-sm text-[#0d2b26]">
                              {teacher.name}
                            </h4>
                            {teacher.verified && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-500">
                            {teacher.subject}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-black border border-amber-200 shrink-0">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{teacher.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {teacher.bio}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 font-semibold pt-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                        {teacher.studentsCount} Students
                      </span>
                      <span>•</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                        {teacher.liveClassesCount} Live Meets/mo
                      </span>
                      <span>•</span>
                      <span className="bg-[#ecf8f5] text-[#0d5c4d] font-bold px-2 py-0.5 rounded-md">
                        {teacher.lessonsCount} Tutes
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#ecf8f5] border border-[#a5f3df] flex items-baseline justify-between">
                      <div>
                        <span className="text-lg font-black text-[#0d2b26]">
                          LKR {teacher.monthlyFee.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold"> / month</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        Live Class Pass
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentView("connect")}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-amber-300" />
                      <span>Enroll Child</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView("connect")}
                      className="py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CERTIFIED TERM PROGRESS REPORT                     */}
      {/* ========================================================= */}
      {activeTab === "report_card" && (
        <div className="space-y-6">
          {/* Clean Compact Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e6ece8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Grade/Year Dropdown + Term Pills */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Academic Year & Grade Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500 whitespace-nowrap">
                  Grade / Year:
                </label>
                <div className="relative">
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => handleYearSelect(e.target.value)}
                    className="h-10 pl-3.5 pr-8 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs font-black text-[#0d2b26] focus:outline-none focus:border-[#0d5c4d] cursor-pointer appearance-none"
                  >
                    {activeChild.academicJourney?.map((yr) => (
                      <option key={yr.id} value={yr.year}>
                        {yr.gradeLevel} ({yr.year}) {yr.year === "2026" ? "• Current" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Divider on desktop */}
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              {/* Term Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-[#f4f7f5] rounded-xl border border-slate-200/80">
                {activeYearRecord?.terms.map((term) => {
                  const isSelected = term.id === activeTermReport.id;
                  return (
                    <button
                      key={term.id}
                      type="button"
                      onClick={() => setSelectedTermReportId(term.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? "bg-[#0d5c4d] text-white shadow-xs font-black"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      }`}
                    >
                      {term.shortTermLabel.replace(/\s*\(Latest\)/i, "").replace(/^\d{4}\s*/, "")}
                      {term.isLatest && (
                        <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#f3b738]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Quick Highlights */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              {/* Standing tag */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-bold">Class Standing:</span>
                <span className="font-black text-[#0d2b26]">#{activeTermReport.classRank} / {activeTermReport.totalStudents}</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-black text-[11px]">
                  {activeTermReport.overallPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Main Clean Report Card Certificate Display */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6ece8] shadow-xs space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e6ece8]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    {activeTermReport.term}
                  </span>
                  {activeTermReport.isLatest && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#f3b738] text-slate-950 font-black text-[10px]">
                      Latest Released
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                    {activeTermReport.gradeLevel || activeYearRecord?.gradeLevel}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-[#0d2b26] mt-2">
                  Certified Academic Progress Report Card
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Issued on {activeTermReport.issueDate} • Academic Year {activeTermReport.academicYear} • Class: {activeTermReport.classSection || activeChild.classSection}
                </p>
              </div>

              {/* Student quick pill */}
              <div className="p-3 rounded-2xl bg-[#f8faf9] border border-slate-200 text-right text-xs">
                <p className="font-black text-slate-900">{activeChild.name}</p>
                <p className="text-[11px] text-slate-500">Adm: {activeChild.admissionNo} • {activeChild.schoolName}</p>
              </div>
            </div>

            {/* Subject Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#e6ece8]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f4f7f5] text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Faculty Educator</th>
                    <th className="py-3 px-4 text-center">Score / 100</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6ece8] text-slate-700 font-medium">
                  {activeTermReport.subjects.map((sub) => (
                    <tr key={sub.code} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{sub.subject}</td>
                      <td className="py-3.5 px-4 text-slate-600">{sub.teacher}</td>
                      <td className="py-3.5 px-4 text-center font-black text-sm text-[#0d2b26]">{sub.score}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#ecf8f5] text-[#0d5c4d] font-black text-xs">
                          {sub.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* ========================================================= */}
      {/* TAB 4: TERM EXAMINATIONS & EVALUATION TIMETABLES          */}
      {/* ========================================================= */}
      {activeTab === "exams" && (
        <div className="space-y-6">
          {/* Candidate Hall Ticket Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#0d2b26] to-[#082a24] p-6 sm:p-7 text-white shadow-lg border border-emerald-900/40 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Official Examination Center Allocation</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  3rd Term Summative Evaluation & Practical Series 2026
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 font-medium">
                  <span>Candidate: <strong className="text-white font-bold">{activeChild.name}</strong></span>
                  <span>•</span>
                  <span>Index: <strong className="text-white font-bold">{activeChild.admissionNo}</strong></span>
                  <span>•</span>
                  <span>Hall Ticket: <strong className="text-[#f3b738] font-black">{activeChild.hallTicketNo}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsHallTicketModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#f3b738] text-slate-950 hover:bg-[#e2a829] text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Printer className="h-4 w-4" />
                  <span>View Official Hall Ticket & Pass</span>
                </button>
              </div>
            </div>
          </div>

          {/* Past Term Historical Comparison Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeChild.pastTermsHistory.map((term, idx) => (
              <div
                key={term.termName}
                className={`p-5 rounded-3xl border transition-all ${
                  idx === 2
                    ? "bg-gradient-to-br from-amber-50 to-orange-50/40 border-amber-200/90 shadow-xs"
                    : "bg-white border-[#e6ece8] shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{term.termName}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    idx === 2 ? "bg-amber-200 text-amber-900" : "bg-[#ecf8f5] text-[#0d5c4d]"
                  }`}>
                    {idx === 2 ? "Upcoming Target" : "Released"}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-[#0d2b26]">{term.aggregateAverage}%</span>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">Rank #{term.classRank} in Class</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Attendance</p>
                    <p className="text-sm font-bold text-slate-700">{term.attendanceRate}%</p>
                  </div>
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-2 italic">{term.gradeClassification}</p>
              </div>
            ))}
          </div>

          {/* Timetable Ledger with Filter Tabs */}
          <div className="bg-white rounded-3xl p-6 border border-[#e6ece8] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-[#0d2b26]">Official Examination Papers & Seat Allotment</h3>
                <p className="text-xs text-slate-500">Authorized timetable released by the School Examination Board</p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-[#f6f9f7] p-1 rounded-xl border border-slate-200/60">
                {[
                  { id: "all", label: "All Papers" },
                  { id: "Term 3 Final Exam", label: "Term 3 Finals" },
                  { id: "Practical / Lab Exam", label: "Practicals" },
                  { id: "completed", label: "Completed" }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setExamTypeFilter(f.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      examTypeFilter === f.id
                        ? "bg-[#0d5c4d] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Examination Cards */}
            <div className="space-y-4">
              {activeChild.examSchedules
                .filter((ex) => {
                  if (examTypeFilter === "all") return true;
                  if (examTypeFilter === "completed") return ex.status === "completed";
                  return ex.examType === examTypeFilter;
                })
                .map((exam) => (
                  <div
                    key={exam.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-[#0d5c4d]/50 bg-white transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#ecf8f5] text-[#0d5c4d] font-black text-xs">
                          {exam.subject}
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Code: {exam.paperCode}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {exam.examType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {exam.status === "completed" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                            Score: {exam.obtainedScore} / {exam.maxMarks} (Grade {exam.grade})
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-base font-extrabold text-[#0d2b26]">{exam.paperName}</h4>

                    {/* Schedule Details Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#f8faf9] border border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                        <div>
                          <p className="font-bold">{exam.date}</p>
                          <p className="text-[10px] text-slate-500">{exam.day}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                        <div>
                          <p className="font-bold">{exam.timeSlot}</p>
                          <p className="text-[10px] text-slate-500">Duration: {exam.duration}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                        <div>
                          <p className="font-bold">{exam.hallNumber}</p>
                          <p className="text-[10px] text-emerald-700 font-bold">{exam.seatNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Syllabus Coverage */}
                    <div className="text-xs text-slate-600 flex items-start gap-2 pt-1">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-slate-800 font-bold">Syllabus Scope: </strong>
                        {exam.syllabusCoverage}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: SCHOOL CIRCULARS & NOTICES                         */}
      {/* ========================================================= */}
      {activeTab === "circulars" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#0d2b26]">Official School Circulars & Bulletins</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic notifications and administrative advisories dispatched by the School Secretariat
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {initialSchoolCirculars.map((circ) => (
              <div
                key={circ.id}
                className="bg-white rounded-3xl p-6 border border-[#e6ece8] shadow-xs flex flex-col justify-between hover:border-[#0d5c4d]/50 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d]">
                      {circ.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">{circ.circularNo}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#0d2b26] mt-3 group-hover:text-[#0d5c4d] transition-colors">
                    {circ.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{circ.date}</p>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">{circ.summary}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedCircular(circ)}
                    className="text-xs font-bold text-[#0d5c4d] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read Full Circular</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  {circ.attachmentName && (
                    <button
                      type="button"
                      onClick={() =>
                        addToast({
                          type: "success",
                          title: "Downloading Notice PDF",
                          message: `${circ.attachmentName} downloaded to your device.`
                        })
                      }
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      title={`Download ${circ.attachmentName}`}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: OFFICIAL PRINTABLE REPORT CARD CERTIFICATE       */}
      {/* ========================================================= */}
      <Modal
        isOpen={isReportCardModalOpen}
        onClose={() => setIsReportCardModalOpen(false)}
        title="Official Terminal Progress Report"
        description="Ministry of Education Standardised Evaluation Format"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Certificate Board */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-[#0d5c4d]/20 relative overflow-hidden">
            {/* Watermark crest background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none text-9xl font-black">
              ST. MICHAEL
            </div>

            {/* School Crest & Header */}
            <div className="text-center pb-6 border-b-2 border-slate-200">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#0d2b26] uppercase">
                {activeChild.schoolName}
              </h2>
              <p className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-widest">
                Academic Progress & Character Assessment Certificate
              </p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-[#ecf8f5] text-[#0d5c4d] text-xs font-black">
                {activeTermReport.term} • Year {activeTermReport.academicYear}
              </div>
            </div>

            {/* Student Particulars Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Student Name</span>
                <p className="font-black text-slate-900 text-sm mt-0.5">{activeChild.name}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Admission No</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{activeChild.admissionNo}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Class & Section</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {activeTermReport.classSection || activeChild.classSection}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Class Teacher</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{activeChild.classTeacher}</p>
              </div>
            </div>

            {/* Subject Scores Table */}
            <div className="my-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f4f7f5] text-slate-800 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Subject</th>
                    <th className="p-2.5 text-center">Marks (100)</th>
                    <th className="p-2.5 text-center">Grade</th>
                    <th className="p-2.5 text-center">Class Avg</th>
                    <th className="p-2.5">Teacher Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeTermReport.subjects.map((sub) => (
                    <tr key={sub.code}>
                      <td className="p-2.5 font-bold text-slate-900">{sub.subject}</td>
                      <td className="p-2.5 text-center font-black text-sm text-[#0d2b26]">{sub.score}</td>
                      <td className="p-2.5 text-center font-black text-xs text-[#0d5c4d]">{sub.grade}</td>
                      <td className="p-2.5 text-center text-slate-500">{sub.classAverage}%</td>
                      <td className="p-2.5 text-slate-600">{sub.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Overall Aggregate Strip */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-[#f8faf9] rounded-xl border border-slate-200 text-center text-xs">
              <div>
                <span className="text-slate-500 font-bold">Overall Average</span>
                <p className="text-lg font-black text-[#0d2b26] mt-0.5">{activeTermReport.overallPercentage}%</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Class Standing</span>
                <p className="text-lg font-black text-[#0d2b26] mt-0.5">
                  #{activeTermReport.classRank} / {activeTermReport.totalStudents}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Attendance</span>
                <p className="text-lg font-black text-emerald-700 mt-0.5">
                  {activeTermReport.attendancePercentage}%
                </p>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="mt-8 pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="h-8 flex items-center justify-center font-serif italic text-slate-600 font-bold">
                  {activeChild.classTeacher}
                </div>
                <div className="border-t border-slate-400 pt-1 mt-1 font-bold text-slate-700">
                  Class Teacher's Signature
                </div>
              </div>
              <div>
                <div className="h-8 flex items-center justify-center font-serif italic text-[#0d5c4d] font-bold">
                  Dr. K. Rajasingham
                </div>
                <div className="border-t border-slate-400 pt-1 mt-1 font-bold text-slate-700">
                  Principal & Rector's Seal
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsReportCardModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-800"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Certificate</span>
            </button>
            <button
              type="button"
              onClick={() => {
                addToast({
                  type: "success",
                  title: "Report Card Downloaded",
                  message: `${activeChild.name}_${(activeTermReport.shortTermLabel || "TermReport").replace(/\s+/g, "_")}_ReportCard.pdf saved.`
                });
                setIsReportCardModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#0d5c4d] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#0a483c]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Official PDF</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: SUBMIT ABSENCE / MEDICAL NOTE                    */}
      {/* ========================================================= */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Submit Digital Absence Note"
        description={`Authorising official absence for ${activeChild.name}`}
      >
        <form onSubmit={handleLeaveSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Student</label>
            <input
              type="text"
              disabled
              value={`${activeChild.name} (${activeChild.grade} - ${activeChild.admissionNo})`}
              className="w-full h-10 px-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">From Date</label>
              <input
                type="date"
                value={leaveStartDate}
                onChange={(e) => setLeaveStartDate(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">To Date</label>
              <input
                type="date"
                value={leaveEndDate}
                onChange={(e) => setLeaveEndDate(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Absence</label>
            <select
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
            >
              <option value="Medical Illness">Medical Illness / Doctor's Rest</option>
              <option value="Family Emergency">Family Emergency / Urgent Event</option>
              <option value="Religious Observation">Religious Observance</option>
              <option value="Official Competition">Official Sports / Zonal Competition</option>
              <option value="Other">Other Personal Reasons</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Explanation / Doctor's Remark</label>
            <textarea
              rows={3}
              value={leaveNote}
              onChange={(e) => setLeaveNote(e.target.value)}
              placeholder="e.g. Advised 2 days bed rest by Dr. Perera due to viral infection..."
              className="w-full p-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          {/* Medical Slip toggle */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-[#0d5c4d]" />
              <div>
                <p className="text-xs font-bold text-slate-900">Attach Medical Practitioner Certificate</p>
                <p className="text-[10px] text-slate-500">Government hospital or registered MBBS doctor slip</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={hasMedicalSlip}
              onChange={(e) => setHasMedicalSlip(e.target.checked)}
              className="h-4 w-4 text-[#0d5c4d] rounded-sm focus:ring-[#0d5c4d]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0d5c4d] text-white text-xs font-bold hover:bg-[#0a483c] shadow-xs cursor-pointer"
            >
              Submit Official Note
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: FULL CIRCULAR DETAILS                            */}
      {/* ========================================================= */}
      {selectedCircular && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCircular(null)}
          title={selectedCircular.title}
          description={`Circular ${selectedCircular.circularNo} • Issued on ${selectedCircular.date}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-600">Category: {selectedCircular.category}</span>
              <span className="font-bold text-[#0d5c4d]">Audience: {selectedCircular.targetAudience}</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-700 leading-relaxed space-y-3 font-medium">
              <p>{selectedCircular.content}</p>
            </div>

            {selectedCircular.attachmentName && (
              <div className="p-3.5 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0d5c4d]" />
                  <div>
                    <p className="font-bold text-slate-900">{selectedCircular.attachmentName}</p>
                    <p className="text-[10px] text-slate-500">{selectedCircular.attachmentSize}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addToast({
                      type: "success",
                      title: "Downloaded Attachment",
                      message: `${selectedCircular.attachmentName} downloaded.`
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0d5c4d] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#0a483c]"
                >
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </button>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setSelectedCircular(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: OFFICIAL EXAMINATION HALL TICKET & ADMISSION PASS */}
      {/* ========================================================= */}
      <Modal
        isOpen={isHallTicketModalOpen}
        onClose={() => setIsHallTicketModalOpen(false)}
        title="Official Examination Hall Ticket & Candidate Admission Pass"
        description="Term 3 Summative Assessments • Department of Examinations"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6 text-xs">
          {/* Certificate Pass */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-[#0d5c4d]/30 relative overflow-hidden shadow-sm">
            {/* Header with crest watermark */}
            <div className="text-center pb-5 border-b-2 border-slate-200">
              <h2 className="text-xl sm:text-2xl font-black text-[#0d2b26] uppercase tracking-wide">
                {activeChild.schoolName}
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Terminal Examination Board • Candidate Entry Clearance
              </p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-[#f3b738]/20 text-slate-900 border border-[#f3b738]/40 font-black text-xs">
                Admission Slip: {activeChild.hallTicketNo}
              </div>
            </div>

            {/* Candidate Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-200">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Candidate Full Name</span>
                <p className="font-black text-slate-900 text-sm mt-0.5">{activeChild.name}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Index / Admission No</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{activeChild.admissionNo}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Class & Stream</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{activeChild.classSection}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Exam Center Code</span>
                <p className="font-bold text-[#0d5c4d] text-sm mt-0.5">042-SMH (Main Wing)</p>
              </div>
            </div>

            {/* Registered Papers Table */}
            <div className="my-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f4f7f5] text-slate-800 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Date & Time</th>
                    <th className="p-2.5">Paper Code</th>
                    <th className="p-2.5">Subject & Examination Title</th>
                    <th className="p-2.5 text-center">Hall & Desk</th>
                    <th className="p-2.5 text-center">Invigilator Initials</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeChild.examSchedules.map((paper) => (
                    <tr key={paper.id}>
                      <td className="p-2.5 text-slate-900 font-bold whitespace-nowrap">
                        {paper.date}
                        <span className="block text-[10px] text-slate-500 font-normal">{paper.timeSlot}</span>
                      </td>
                      <td className="p-2.5 font-black text-[#0d5c4d]">{paper.paperCode}</td>
                      <td className="p-2.5 text-slate-800 font-bold">{paper.paperName}</td>
                      <td className="p-2.5 text-center text-slate-700 whitespace-nowrap">
                        {paper.hallNumber}
                        <span className="block text-[10px] text-emerald-700 font-bold">{paper.seatNumber}</span>
                      </td>
                      <td className="p-2.5 text-center text-slate-400 italic">
                        [___________]
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Candidate Rules Notice */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Candidate Instructions & Regulations:</p>
              <p>1. Candidates must occupy their allotted desk 15 minutes before paper commencement.</p>
              <p>2. Programmable calculators and cellular phones are strictly prohibited within examination premises.</p>
              <p>3. This physical admission slip must be produced on all examination sessions.</p>
            </div>

            {/* Signature & Seal */}
            <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="h-6 font-serif italic text-slate-700 font-bold">{activeChild.classTeacher}</div>
                <div className="border-t border-slate-300 pt-1 mt-1 font-bold text-slate-600">
                  Head of Department / Class Teacher
                </div>
              </div>
              <div>
                <div className="h-6 font-serif italic text-[#0d5c4d] font-bold">Dr. K. Rajasingham</div>
                <div className="border-t border-slate-300 pt-1 mt-1 font-bold text-slate-600">
                  Chief Supervisor & Rector
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsHallTicketModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-800"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Hall Ticket</span>
            </button>
            <button
              type="button"
              onClick={() => {
                addToast({
                  type: "success",
                  title: "Hall Ticket Downloaded",
                  message: `${activeChild.name}_Exam_Admission_Pass.pdf saved.`
                });
                setIsHallTicketModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#0d5c4d] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#0a483c]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Official PDF</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 5: OFFICIAL PERMANENT CUMULATIVE TRANSCRIPT (6-13)  */}
      {/* ========================================================= */}
      <Modal
        isOpen={isTranscriptModalOpen}
        onClose={() => setIsTranscriptModalOpen(false)}
        title="Official Permanent Cumulative Academic Transcript (Grades 6–13)"
        description="Ministry of Education & Department of Secondary Examinations Standard Record"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6 text-xs">
          <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-[#0d5c4d]/30 relative overflow-hidden shadow-sm">
            <div className="text-center pb-5 border-b-2 border-slate-200">
              <h2 className="text-xl sm:text-2xl font-black text-[#0d2b26] uppercase tracking-wide">
                {activeChild.schoolName}
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Permanent Cumulative Student Transcript & Academic Ledger (Grades 6–13)
              </p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0] font-black text-xs">
                Registration Index: {activeChild.admissionNo} • Enrolled: {activeChild.enrolledSinceYear || "Grade 6"}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-200">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Candidate Name</span>
                <p className="font-black text-slate-900 text-sm mt-0.5">{activeChild.name}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Current Stage</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{activeChild.grade} ({activeChild.currentStage})</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Career Average</span>
                <p className="font-black text-[#0d5c4d] text-sm mt-0.5">{activeChild.cumulativeCareerAverage}%</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Completed Years</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{activeChild.totalYearsEnrolled} Academic Years</p>
              </div>
            </div>

            <div className="my-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f4f7f5] text-slate-800 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Academic Year</th>
                    <th className="p-2.5">Grade & Stream</th>
                    <th className="p-2.5 text-center">Annual Average</th>
                    <th className="p-2.5 text-center">Class Rank</th>
                    <th className="p-2.5 text-center">Attendance</th>
                    <th className="p-2.5">Promotion / Clearance Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeChild.academicJourney?.map((yr) => (
                    <tr key={yr.id}>
                      <td className="p-2.5 font-black text-slate-900">{yr.year}</td>
                      <td className="p-2.5 text-slate-800 font-bold">
                        {yr.gradeLevel} - {yr.classSection}
                      </td>
                      <td className="p-2.5 text-center font-black text-[#0d2b26]">{yr.annualAverage}%</td>
                      <td className="p-2.5 text-center font-bold text-emerald-800">
                        #{yr.annualRank} / {yr.totalStudents}
                      </td>
                      <td className="p-2.5 text-center text-slate-600">{yr.attendanceRate}%</td>
                      <td className="p-2.5 text-slate-700">{yr.promotionStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="h-6 font-serif italic text-slate-700 font-bold">{activeChild.classTeacher}</div>
                <div className="border-t border-slate-300 pt-1 mt-1 font-bold text-slate-600">
                  Senior House Master / Form Teacher
                </div>
              </div>
              <div>
                <div className="h-6 font-serif italic text-[#0d5c4d] font-bold">Dr. K. Rajasingham</div>
                <div className="border-t border-slate-300 pt-1 mt-1 font-bold text-slate-600">
                  Principal & Rector (Official Seal)
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsTranscriptModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-800"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Permanent Transcript</span>
            </button>
            <button
              type="button"
              onClick={() => {
                addToast({
                  type: "success",
                  title: "Transcript Downloaded",
                  message: `${activeChild.name}_Permanent_Academic_Transcript_Grades_6_to_${activeChild.grade.replace(/\s+/g, "_")}.pdf saved.`
                });
                setIsTranscriptModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#0d5c4d] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#0a483c]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Certified PDF</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
