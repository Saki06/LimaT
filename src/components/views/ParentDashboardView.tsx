"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  mockChildrenProfiles,
  initialParentLeaveRequests,
  ChildTuitionEnrolment,
  TuitionInvoice,
  LiveClassAttendanceLog,
  TutorPaperMarkRecord,
  TutorAnnouncement,
  ParentLeaveRequest,
  ParentChildProfile
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
  Star,
  Video,
  CreditCard,
  UploadCloud,
  Check,
  X,
  Share2,
  Radio,
  FileUp,
  ArrowRight,
  Table,
  LayoutGrid
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

type ParentTab = "overview" | "tuition_classes" | "fees" | "progress" | "circulars";

export function ParentDashboardView() {
  const { currentView, setCurrentView, addToast } = useApp();

  // Child selection state (Child 1: Sathurjan K. - A/L 2026, Child 2: Ananya K. - Grade 8)
  const [selectedChildId, setSelectedChildId] = useState<string>("child_01");
  const [childrenList, setChildrenList] = useState<ParentChildProfile[]>(mockChildrenProfiles);

  const activeChild = childrenList.find((c) => c.id === selectedChildId) || childrenList[0];

  // Map currentView to internal active tab
  const getInitialTab = (): ParentTab => {
    switch (currentView) {
      case "tuition_classes":
        return "tuition_classes";
      case "fees":
        return "fees";
      case "progress":
        return "progress";
      case "circulars":
        return "circulars";
      default:
        return "overview";
    }
  };

  const [activeTab, setActiveTab] = useState<ParentTab>(getInitialTab);

  // Sync when sidebar currentView changes externally
  React.useEffect(() => {
    if (["tuition_classes", "fees", "progress", "circulars"].includes(currentView)) {
      setActiveTab(currentView as ParentTab);
    } else if (currentView === "dashboard") {
      setActiveTab("overview");
    }
  }, [currentView]);

  const handleTabChange = (tab: ParentTab) => {
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
      addToast({
        type: "info",
        title: "Switched Student Profile",
        message: `Now viewing tuition records for ${child.name} (${child.grade})`
      });
    }
  };

  // Modals state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<TuitionInvoice | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<TutorAnnouncement | null>(null);
  const [selectedPaperModal, setSelectedPaperModal] = useState<TutorPaperMarkRecord | null>(null);

  // Paper Marks View & Filter States
  const [paperSubjectFilter, setPaperSubjectFilter] = useState<string>("all");
  const [paperViewMode, setPaperViewMode] = useState<"table" | "cards">("table");

  // Dynamic subjects list for paper marks filter
  const availablePaperSubjects = useMemo(() => {
    return Array.from(new Set(activeChild.paperMarks.map((p) => p.subject)));
  }, [activeChild.paperMarks]);

  // Filtered papers
  const filteredPapers = useMemo(() => {
    if (paperSubjectFilter === "all") return activeChild.paperMarks;
    return activeChild.paperMarks.filter(
      (p) => p.subject.toLowerCase() === paperSubjectFilter.toLowerCase()
    );
  }, [activeChild.paperMarks, paperSubjectFilter]);

  // Leave Requests state
  const [leaveRequests, setLeaveRequests] = useState<ParentLeaveRequest[]>(initialParentLeaveRequests);
  const [leaveTutor, setLeaveTutor] = useState(activeChild.enrolments[0]?.teacherName || "Dr. Samantha Perera");
  const [leaveDate, setLeaveDate] = useState("2026-10-20");
  const [leaveReason, setLeaveReason] = useState<ParentLeaveRequest["reason"]>("School Exam Clashing");
  const [leaveNote, setLeaveNote] = useState("");

  // Deposit Slip Upload Form State
  const [depositTutor, setDepositTutor] = useState(activeChild.enrolments[0]?.teacherName || "Dr. Samantha Perera");
  const [depositMonth, setDepositMonth] = useState("October 2026");
  const [depositAmount, setDepositAmount] = useState(activeChild.enrolments[0]?.monthlyFeeLkr || 3500);
  const [depositBank, setDepositBank] = useState("Commercial Bank of Ceylon");
  const [depositBranch, setDepositBranch] = useState("Colombo Main Branch");
  const [depositRefNumber, setDepositRefNumber] = useState("");
  const [depositDate, setDepositDate] = useState("2026-10-14");
  const [slipFileName, setSlipFileName] = useState("Bank_Deposit_Slip_Receipt.jpg");

  // Invoices list state (allow live additions when parent uploads bank slip)
  const [invoices, setInvoices] = useState<TuitionInvoice[]>(activeChild.invoices);

  // Sync invoices when active child changes
  React.useEffect(() => {
    setInvoices(activeChild.invoices);
    if (activeChild.enrolments.length > 0) {
      setDepositTutor(activeChild.enrolments[0].teacherName);
      setDepositAmount(activeChild.enrolments[0].monthlyFeeLkr);
      setLeaveTutor(activeChild.enrolments[0].teacherName);
    }
  }, [activeChild]);

  // Handle Bank Slip Submission
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositRefNumber.trim()) {
      addToast({
        type: "warning",
        title: "Reference Number Required",
        message: "Please enter the bank slip or transaction reference number."
      });
      return;
    }

    const newInvoice: TuitionInvoice = {
      id: `inv_new_${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      childId: activeChild.id,
      childName: activeChild.name,
      teacherName: depositTutor,
      subject: activeChild.enrolments.find((e) => e.teacherName === depositTutor)?.subject || "Tuition Subject",
      month: depositMonth,
      amountLkr: Number(depositAmount),
      status: "under_review",
      paymentMethod: "bank_slip",
      slipRefNumber: depositRefNumber.trim().toUpperCase(),
      bankName: depositBank,
      branchName: depositBranch,
      depositedDate: depositDate,
      slipImageUrl: "/images/mock_slips/sample_slip.jpg",
      tutorNotes: "Deposit slip submitted via Parent Portal. Awaiting tutor assistant clearance."
    };

    setInvoices([newInvoice, ...invoices]);
    setIsDepositModalOpen(false);
    setDepositRefNumber("");

    addToast({
      type: "success",
      title: "Bank Deposit Slip Uploaded!",
      message: `Deposit slip of LKR ${depositAmount.toLocaleString()} submitted to ${depositTutor}. Temporary class access unlocked!`
    });
  };

  // Handle Leave Note Submission
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveNote.trim()) {
      addToast({
        type: "warning",
        title: "Note Required",
        message: "Please provide a brief reason for missing the live class."
      });
      return;
    }

    const newReq: ParentLeaveRequest = {
      id: `leave_${Date.now()}`,
      childId: activeChild.id,
      childName: activeChild.name,
      tutorName: leaveTutor,
      startDate: leaveDate,
      endDate: leaveDate,
      reason: leaveReason,
      note: leaveNote.trim(),
      hasMedicalCertificate: false,
      status: "pending",
      submittedDate: new Date().toISOString().split("T")[0]
    };

    setLeaveRequests([newReq, ...leaveRequests]);
    setIsLeaveModalOpen(false);
    setLeaveNote("");

    addToast({
      type: "success",
      title: "Notice Dispatched to Tutor",
      message: `Absence request for ${leaveDate} submitted to ${leaveTutor}. Class recording validity will be extended.`
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* ========================================================= */}
      {/* TOP BANNER: SOLO TUTOR SAAS PARENT COMMAND CENTER         */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-[#082a24] via-[#0d5c4d] to-[#14473e] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-[#167866]">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-[#f3b738]/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Identity & Portal Title */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
              <span className="text-sm">👨‍👩‍👧</span>
              <span>LimaT Tutor SaaS • Parent &amp; Guardian Command Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Tuition Batches &amp; Fee Tracking
            </h1>
            <p className="text-sm text-emerald-100/90 max-w-xl font-medium">
              Real-time monitoring of enrolled masterclasses, monthly bank slip clearances, and live Google Meet attendance for <strong className="text-white font-bold">{activeChild.name}</strong> ({activeChild.grade}).
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
                        {child.grade.split(" ")[0]} {child.grade.split(" ")[1]}
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
            { id: "tuition_classes", label: "Enrolled Tutors", icon: GraduationCap, badge: `${activeChild.enrolments.length}` },
            { id: "fees", label: "Fees & Bank Slips", icon: CreditCard, badge: activeChild.pendingSlipsCount > 0 ? "1 Review" : undefined },
            { id: "progress", label: "Paper Marks & Feedback", icon: Award },
            { id: "circulars", label: "Tutor Announcements", icon: Bell }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as ParentTab)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#f3b738] text-slate-950 shadow-md font-black"
                    : "bg-white/10 text-emerald-100 hover:bg-white/20 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                      isActive ? "bg-slate-950 text-white" : "bg-[#f3b738] text-slate-950"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
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
          {/* Key Executive KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Active Tutors */}
            <div className="bg-white rounded-2xl p-5 border border-[#e6ece8] shadow-xs hover:border-[#0d5c4d]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Tuition Tutors</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-[#0d5c4d]">
                  <GraduationCap className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#0d2b26]">{activeChild.enrolments.length} Tutors</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active Cohorts
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Theory &amp; Model Paper Batches</p>
              </div>
            </div>

            {/* Card 2: Monthly Tuition Investment */}
            <div className="bg-white rounded-2xl p-5 border border-[#e6ece8] shadow-xs hover:border-[#0d5c4d]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Investment</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <CreditCard className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#0d2b26]">LKR {activeChild.monthlyInvestmentLkr.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    / month
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Status: {activeChild.pendingSlipsCount > 0 ? "1 Slip Under Review" : "All Paid & Active"}
                </p>
              </div>
            </div>

            {/* Card 3: Paper Class Performance */}
            <div className="bg-white rounded-2xl p-5 border border-[#e6ece8] shadow-xs hover:border-[#0d5c4d]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paper Class Average</span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <Award className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#0d2b26]">{activeChild.overallAverage}%</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Batch Rank #{activeChild.classRank}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Ranked out of {activeChild.totalStudents} candidates</p>
              </div>
            </div>
          </div>

          {/* Quick Action Shortcuts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setIsDepositModalOpen(true)}
              className="p-4 rounded-2xl bg-[#ecf8f5] border border-[#c4e9e0] hover:bg-[#e0f3ee] text-left transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#0d5c4d] text-white flex items-center justify-center font-bold">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0d2b26]">Upload Bank Deposit Slip</p>
                  <p className="text-xs text-slate-600">Submit BOC, ComBank or HNB receipt</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#0d5c4d] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(true)}
              className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/70 text-left transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Notify Tutor of Absence</p>
                  <p className="text-xs text-slate-600">Request recording access extension</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-700 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("fees")}
              className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 hover:bg-indigo-100/70 text-left transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Invoices &amp; Receipts Ledger</p>
                  <p className="text-xs text-slate-600">View tax vouchers &amp; clearance status</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-indigo-700 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Upcoming Live Masterclasses Schedule Strip */}
          <div className="bg-white rounded-3xl p-6 border border-[#e6ece8] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-[#0d2b26]">Upcoming Live Online Classes for {activeChild.name}</h3>
                <p className="text-xs text-slate-500">Live lecture schedule with 1-click meeting access and WhatsApp updates</p>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange("tuition_classes")}
                className="text-xs font-bold text-[#0d5c4d] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Enrolled Tutors</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeChild.enrolments.map((enrol) => (
                <div
                  key={enrol.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-[#fbfdfc] hover:border-[#0d5c4d]/50 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0d5c4d] bg-[#ecf8f5] px-2 py-0.5 rounded-md">
                      {enrol.subject}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                      <Video className="h-3 w-3 text-purple-600" />
                      <span>{enrol.platform}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-[#0d2b26]">{enrol.teacherName}</h4>
                    <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-1">{enrol.nextSessionTopic}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      <span>{enrol.nextSessionDate}</span>
                    </span>
                    <a
                      href={enrol.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-black text-[#0d5c4d] hover:underline flex items-center gap-1"
                    >
                      <span>Join Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Tutors Detailed Enrolment Cards */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e6ece8] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#0d2b26]">Enrolled Tuition Masterclasses</h3>
                <p className="text-xs text-slate-500">Current course packages, fees, and clearance status</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView("connect")}
                className="px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-black shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#f3b738]" />
                <span>Find &amp; Add More Tutors</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeChild.enrolments.map((enrol) => (
                <div
                  key={enrol.id}
                  className="rounded-2xl border border-[#c4e9e0] bg-[#fdfefe] p-5 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-11 w-11 rounded-xl ${enrol.avatarColor} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs`}
                        >
                          {enrol.initials}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#0d2b26]">{enrol.teacherName}</h4>
                          <p className="text-xs font-semibold text-slate-500">{enrol.subject}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          enrol.feeStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : enrol.feeStatus === "pending_slip"
                            ? "bg-amber-100 text-amber-800 animate-pulse"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {enrol.feeStatus === "paid" ? "Paid & Active" : enrol.feeStatus === "pending_slip" ? "Slip In Review" : "Overdue"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {enrol.packageName}
                    </p>

                    <div className="p-3 rounded-xl bg-[#f6f9f7] border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Monthly Fee:</span>
                        <span className="font-black text-[#0d2b26]">LKR {enrol.monthlyFeeLkr.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Access Valid:</span>
                        <span className="font-bold text-slate-700">{enrol.validUntil}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Attendance:</span>
                        <span className="font-black text-emerald-700">{enrol.attendanceRate}% ({enrol.attendedSessions}/{enrol.totalSessions} Sessions)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Latest Paper Score:</span>
                        <span className="font-black text-[#0d5c4d]">{enrol.latestPaperMark}/100 (Rank #{enrol.batchRank})</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    {enrol.feeStatus === "pending_slip" ? (
                      <button
                        type="button"
                        onClick={() => handleTabChange("fees")}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Slip Status</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setDepositTutor(enrol.teacherName);
                          setDepositAmount(enrol.monthlyFeeLkr);
                          setIsDepositModalOpen(true);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <UploadCloud className="h-3.5 w-3.5 text-amber-300" />
                        <span>Upload Next Slip</span>
                      </button>
                    )}

                    {enrol.whatsappGroupUrl && (
                      <a
                        href={enrol.whatsappGroupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-xl border border-slate-200 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition-colors flex items-center gap-1"
                        title="Tutor WhatsApp Community"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ENROLLED TUTORS & BATCH DETAILS                    */}
      {/* ========================================================= */}
      {activeTab === "tuition_classes" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#e6ece8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0d2b26]">Active Masterclass Cohorts</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed roster of individual educators, live schedules, and syllabus packages for {activeChild.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDepositModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-black shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <UploadCloud className="h-4 w-4 text-[#f3b738]" />
              <span>Submit Monthly Deposit Slip</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {activeChild.enrolments.map((enrol) => (
              <div
                key={enrol.id}
                className="bg-white rounded-3xl p-6 border border-[#e6ece8] shadow-xs hover:border-[#0d5c4d]/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-2xl ${enrol.avatarColor} text-white font-black text-base flex items-center justify-center shadow-xs`}>
                        {enrol.initials}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-[#0d2b26]">{enrol.teacherName}</h3>
                        <p className="text-xs font-bold text-slate-500">{enrol.subject}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-[#f8faf9] border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">Enrolled Cohort</p>
                      <p className="font-extrabold text-slate-900 mt-0.5">{enrol.batch}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#f8faf9] border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">Live Lecture Schedule</p>
                      <p className="font-bold text-[#0d5c4d] mt-0.5">{enrol.liveClassSchedule}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#f8faf9] border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase">Platform Link</p>
                        <p className="font-bold text-slate-800">{enrol.platform}</p>
                      </div>
                      <a
                        href={enrol.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-[#0d5c4d] text-white text-xs font-bold hover:bg-[#0a483c] flex items-center gap-1"
                      >
                        <span>Join</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Direct Phone:</span>
                    <span className="font-bold text-slate-800">{enrol.tutorPhone}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Batch Standing:</span>
                    <span className="font-black text-[#0d5c4d]">Rank #{enrol.batchRank} / {enrol.batchTotalStudents}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: FEES, INVOICES & BANK DEPOSIT SLIPS                */}
      {/* ========================================================= */}
      {activeTab === "fees" && (
        <div className="space-y-6">
          {/* Tuition Fee Clearance Overview Card */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#0d2b26] to-[#082a24] p-6 sm:p-7 text-white shadow-lg border border-emerald-900/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Tuition Subscription &amp; Bank Slip Clearance</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Monthly Tuition Payment Ledger
                </h2>
                <p className="text-xs text-slate-300 font-medium max-w-xl">
                  Bank deposit slips uploaded by parents are verified by tutors to ensure uninterrupted access to live streams, tute couriers, and model paper grading.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#f3b738] text-slate-950 hover:bg-[#e2a829] text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload Bank Deposit Slip</span>
                </button>
              </div>
            </div>
          </div>

          {/* Invoices & Receipts Ledger Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e6ece8] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-[#0d2b26]">Official Invoices &amp; Verified Slips</h3>
                <p className="text-xs text-slate-500">Historical records of bank deposits, online cards, and tutor approvals</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f4f7f5] text-slate-700 font-black uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Tutor &amp; Subject</th>
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Bank / Slip Ref</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-900">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">{inv.teacherName}</span>
                        <span className="block text-[10px] text-slate-500">{inv.subject}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{inv.month}</td>
                      <td className="py-3.5 px-4 font-black text-[#0d2b26]">LKR {inv.amountLkr.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                          {inv.paymentMethod.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-700">{inv.slipRefNumber || "N/A"}</span>
                        {inv.bankName && <span className="block text-[10px] text-slate-500">{inv.bankName}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            inv.status === "cleared"
                              ? "bg-emerald-100 text-emerald-800"
                              : inv.status === "under_review"
                              ? "bg-amber-100 text-amber-800 animate-pulse"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {inv.status === "cleared" ? "Cleared" : inv.status === "under_review" ? "Under Review" : "Overdue"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsReceiptModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-[#ecf8f5] text-[#0d5c4d] font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Voucher</span>
                        </button>
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
      {/* TAB 5: PAPER CLASS MARKS & HOMEWORK (NEW FORMAT)          */}
      {/* ========================================================= */}
      {activeTab === "progress" && (
        <div className="space-y-6">
          {/* Header Controls: Title, View Switcher, and Analytics */}
          <div className="bg-white rounded-3xl p-6 border border-[#e6ece8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-[#0d5c4d]">
                  <Award className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-black text-[#0d2b26]">Tutor Model Papers &amp; Gradebook Ledger</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  Batch Evaluated
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Verified marks, comparative cohort rankings, and personalized educator feedback for {activeChild.name}
              </p>
            </div>

            {/* View Mode Toggle: Gradebook Table vs Cards */}
            <div className="flex items-center gap-1.5 p-1 bg-[#f4f7f5] rounded-xl border border-slate-200/80 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setPaperViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  paperViewMode === "table"
                    ? "bg-[#0d5c4d] text-white shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Table className="h-3.5 w-3.5" />
                <span>Gradebook Table</span>
              </button>
              <button
                type="button"
                onClick={() => setPaperViewMode("cards")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  paperViewMode === "cards"
                    ? "bg-[#0d5c4d] text-white shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Assessment Cards</span>
              </button>
            </div>
          </div>

          {/* Subject Filter Pills & Quick Analytics Strip */}
          <div className="bg-white rounded-2xl p-4 border border-[#e6ece8] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Subject Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setPaperSubjectFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  paperSubjectFilter === "all"
                    ? "bg-[#0d5c4d] text-white shadow-xs font-black"
                    : "bg-[#f4f7f5] text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Subjects ({activeChild.paperMarks.length})
              </button>
              {availablePaperSubjects.map((sub) => {
                const count = activeChild.paperMarks.filter((p) => p.subject === sub).length;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setPaperSubjectFilter(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      paperSubjectFilter.toLowerCase() === sub.toLowerCase()
                        ? "bg-[#0d5c4d] text-white shadow-xs font-black"
                        : "bg-[#f4f7f5] text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {sub} ({count})
                  </button>
                );
              })}
            </div>

            {/* Quick Metrics Tag Strip */}
            <div className="flex items-center gap-3 text-xs self-end lg:self-auto shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                <span className="text-slate-500 font-normal">Filtered Avg:</span>
                <span className="font-black text-[#0d2b26]">
                  {(
                    filteredPapers.reduce((acc, p) => acc + p.score, 0) / (filteredPapers.length || 1)
                  ).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                <span className="text-slate-500 font-normal">Top Score:</span>
                <span className="font-black text-amber-800">
                  {Math.max(...filteredPapers.map((p) => p.score), 0)} / 100
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* FORMAT A: GRADEBOOK TABLE VIEW (HIGH DENSITY LEDGER)    */}
          {/* ======================================================= */}
          {paperViewMode === "table" && (
            <div className="bg-white rounded-3xl p-6 border border-[#e6ece8] shadow-xs space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f4f7f5] text-slate-700 font-black uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Date &amp; Paper Code</th>
                      <th className="py-3 px-4">Assessment Title</th>
                      <th className="py-3 px-4">Educator / Subject</th>
                      <th className="py-3 px-4 text-center">Score / 100</th>
                      <th className="py-3 px-4 text-center">Grade</th>
                      <th className="py-3 px-4 text-center">Batch Benchmark</th>
                      <th className="py-3 px-4 text-center">Batch Rank</th>
                      <th className="py-3 px-4 text-right">Educator Rubric</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredPapers.map((paper) => {
                      const diff = paper.score - paper.batchAverage;
                      return (
                        <tr key={paper.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Date & Code */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-bold text-slate-900 block">{paper.date}</span>
                            <span className="inline-block px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 mt-0.5">
                              {paper.paperCode}
                            </span>
                          </td>

                          {/* Title */}
                          <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
                            <p className="line-clamp-2">{paper.title}</p>
                          </td>

                          {/* Tutor & Subject */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-bold text-[#0d5c4d] block">{paper.tutorName}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">{paper.subject}</span>
                          </td>

                          {/* Score & Visual Bar */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="text-base font-black text-[#0d2b26]">{paper.score}</span>
                            <span className="text-[10px] text-slate-400 font-bold"> / {paper.maxScore}</span>
                            <div className="w-20 mx-auto bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full rounded-full ${
                                  paper.score >= 85 ? "bg-emerald-500" : paper.score >= 70 ? "bg-blue-500" : "bg-amber-500"
                                }`}
                                style={{ width: `${(paper.score / paper.maxScore) * 100}%` }}
                              />
                            </div>
                          </td>

                          {/* Grade Badge */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-[#ecf8f5] text-[#0d5c4d] font-black text-xs">
                              Grade {paper.grade}
                            </span>
                          </td>

                          {/* Batch Benchmark */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <TrendingUp className="h-3 w-3" />
                              <span>+{diff}% vs Avg</span>
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              (Batch Avg: {paper.batchAverage}%)
                            </span>
                          </td>

                          {/* Batch Rank */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="font-black text-[#0d2b26] text-xs">#{paper.rank}</span>
                            <span className="text-[10px] text-slate-500 font-semibold"> / {paper.batchTotal}</span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedPaperModal(paper)}
                              className="px-3 py-1.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <FileText className="h-3 w-3" />
                              <span>Inspect Feedback</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* FORMAT B: ASSESSMENT CARDS VIEW (ANALYTIC TILES)       */}
          {/* ======================================================= */}
          {paperViewMode === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredPapers.map((paper) => {
                const diff = paper.score - paper.batchAverage;
                return (
                  <div
                    key={paper.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#0d5c4d]/50 transition-all space-y-4 shadow-xs"
                  >
                    {/* Top Code & Score Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#ecf8f5] text-[#0d5c4d] font-black text-xs">
                            {paper.subject}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {paper.paperCode}
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-[#0d2b26] leading-snug pt-1">
                          {paper.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold">
                          Educator: {paper.tutorName} • Date: {paper.date}
                        </p>
                      </div>

                      {/* Big Score Dial */}
                      <div className="text-right shrink-0 p-3 rounded-2xl bg-[#f8faf9] border border-slate-200">
                        <span className="text-2xl font-black text-[#0d2b26]">{paper.score}</span>
                        <span className="text-xs text-slate-500 font-bold"> / {paper.maxScore}</span>
                        <span className="block text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 text-center">
                          Grade {paper.grade}
                        </span>
                      </div>
                    </div>

                    {/* Cohort Comparison Bar Gauge */}
                    <div className="p-3.5 rounded-2xl bg-[#f4f7f5] border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-600">Cohort Comparison</span>
                        <span className="text-emerald-700 font-black">+{diff}% Above Batch Average</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-[#0d5c4d] h-full rounded-full transition-all"
                          style={{ width: `${(paper.score / paper.maxScore) * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-0.5">
                        <span>Batch Average: {paper.batchAverage}%</span>
                        <span>Standing: Rank #{paper.rank} of {paper.batchTotal}</span>
                        <span>Highest: {paper.highestScore}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: TUTOR ANNOUNCEMENTS & CIRCULARS                    */}
      {/* ========================================================= */}
      {activeTab === "circulars" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#e6ece8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0d2b26]">Tutor Announcements &amp; Broadcasts</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official notices, courier dispatches, and schedule shifts dispatched by educators
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeChild.announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white rounded-3xl p-6 border border-[#e6ece8] shadow-xs flex flex-col justify-between hover:border-[#0d5c4d]/50 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ann.priority === "urgent" ? "bg-red-100 text-red-800" : "bg-[#ecf8f5] text-[#0d5c4d]"
                      }`}
                    >
                      {ann.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">{ann.date}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#0d2b26] mt-3 group-hover:text-[#0d5c4d] transition-colors">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">Instructor: {ann.tutorName} ({ann.subject})</p>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">{ann.content}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedAnnouncement(ann)}
                    className="text-xs font-bold text-[#0d5c4d] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read Full Notice</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: UPLOAD BANK DEPOSIT SLIP                         */}
      {/* ========================================================= */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title="Upload Bank Deposit Slip / Transfer Receipt"
        description={`Submit proof of monthly tuition fee payment for ${activeChild.name}`}
      >
        <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Enrolled Educator / Masterclass</label>
            <select
              value={depositTutor}
              onChange={(e) => {
                setDepositTutor(e.target.value);
                const match = activeChild.enrolments.find((en) => en.teacherName === e.target.value);
                if (match) setDepositAmount(match.monthlyFeeLkr);
              }}
              className="w-full h-10 px-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
            >
              {activeChild.enrolments.map((en) => (
                <option key={en.id} value={en.teacherName}>
                  {en.teacherName} — {en.subject} (LKR {en.monthlyFeeLkr.toLocaleString()}/mo)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fee Month</label>
              <select
                value={depositMonth}
                onChange={(e) => setDepositMonth(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="October 2026">October 2026</option>
                <option value="November 2026">November 2026</option>
                <option value="December 2026">December 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (LKR)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                required
                className="w-full h-10 px-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs font-black text-[#0d2b26] focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deposited Bank</label>
              <select
                value={depositBank}
                onChange={(e) => setDepositBank(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="Commercial Bank of Ceylon">Commercial Bank of Ceylon</option>
                <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
                <option value="Hatton National Bank (HNB)">Hatton National Bank (HNB)</option>
                <option value="Sampath Bank PLC">Sampath Bank PLC</option>
                <option value="Peoples Bank">Peoples Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Branch Name</label>
              <input
                type="text"
                value={depositBranch}
                onChange={(e) => setDepositBranch(e.target.value)}
                required
                placeholder="e.g. Kollupitiya, Jaffna City"
                className="w-full h-10 px-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Slip / Ref Number</label>
              <input
                type="text"
                value={depositRefNumber}
                onChange={(e) => setDepositRefNumber(e.target.value)}
                required
                placeholder="e.g. BOC-441920 or COMM-9842"
                className="w-full h-10 px-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Deposit</label>
              <input
                type="date"
                value={depositDate}
                onChange={(e) => setDepositDate(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          {/* Deposit Slip Attachment Simulator */}
          <div className="p-4 rounded-xl bg-[#f4f7f5] border-2 border-dashed border-[#c4e9e0] text-center space-y-1">
            <UploadCloud className="h-6 w-6 text-[#0d5c4d] mx-auto" />
            <p className="font-bold text-slate-800 text-xs">Receipt Image Selected: {slipFileName}</p>
            <p className="text-[10px] text-slate-500">Supports PNG, JPG, or PDF bank vouchers</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDepositModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a483c] text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Submit Slip for Clearance</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: NOTIFY TUTOR OF ABSENCE                          */}
      {/* ========================================================= */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Notify Tutor of Live Class Absence"
        description={`Inform the educator regarding session absence for ${activeChild.name}`}
      >
        <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Educator</label>
            <select
              value={leaveTutor}
              onChange={(e) => setLeaveTutor(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
            >
              {activeChild.enrolments.map((en) => (
                <option key={en.id} value={en.teacherName}>
                  {en.teacherName} ({en.subject})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Session Date</label>
              <input
                type="date"
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason</label>
              <select
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="School Exam Clashing">School Exam Clashing</option>
                <option value="Medical Illness">Medical Illness / Doctor's Rest</option>
                <option value="Family Emergency">Family Emergency</option>
                <option value="Religious Observation">Religious Observance</option>
                <option value="Other">Other Personal Reasons</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Brief Explanation for Educator</label>
            <textarea
              rows={3}
              value={leaveNote}
              onChange={(e) => setLeaveNote(e.target.value)}
              placeholder="e.g. Has school term exam tomorrow morning, requesting 7-day video recording extension..."
              className="w-full p-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a483c] text-white text-xs font-black shadow-xs cursor-pointer"
            >
              Submit Notice to Educator
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: OFFICIAL TUITION VOUCHER / RECEIPT               */}
      {/* ========================================================= */}
      {selectedInvoice && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Official Tuition Payment Receipt &amp; Clearance Voucher"
          description="LimaT Solo Educator Masterclass Network"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-xs">
            <div className="p-6 rounded-2xl bg-white border-2 border-[#0d5c4d]/20 relative overflow-hidden shadow-xs">
              <div className="text-center pb-4 border-b border-slate-200">
                <h3 className="text-xl font-black text-[#0d2b26] uppercase">
                  {selectedInvoice.teacherName} Masterclass Studio
                </h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Official Student Monthly Tuition Receipt
                </p>
                <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] font-black text-xs">
                  Invoice Ref: {selectedInvoice.invoiceNumber}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Student Name</span>
                  <p className="font-black text-slate-900 text-sm mt-0.5">{selectedInvoice.childName}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Subject &amp; Package</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedInvoice.subject}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Tuition Month</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedInvoice.month}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Bank Ref / Auth</span>
                  <p className="font-bold text-[#0d5c4d] text-sm mt-0.5">{selectedInvoice.slipRefNumber || "N/A"}</p>
                </div>
              </div>

              <div className="p-4 bg-[#f8faf9] rounded-xl border border-slate-200 flex items-center justify-between my-4">
                <div>
                  <span className="text-slate-500 font-bold">Total Tuition Fee Cleared</span>
                  <p className="text-2xl font-black text-[#0d2b26]">LKR {selectedInvoice.amountLkr.toLocaleString()}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
                  {selectedInvoice.status === "cleared" ? "Paid & Verified" : "Under Review"}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 text-center italic">
                Valid for unlimited access to online Google Meet / Zoom lectures, tute couriers, and model paper marking.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
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
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  addToast({
                    type: "success",
                    title: "Receipt Downloaded",
                    message: `${selectedInvoice.invoiceNumber}_Receipt.pdf saved to your device.`
                  });
                  setIsReceiptModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#0d5c4d] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#0a483c]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: FULL ANNOUNCEMENT DETAILS                        */}
      {/* ========================================================= */}
      {selectedAnnouncement && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAnnouncement(null)}
          title={selectedAnnouncement.title}
          description={`From ${selectedAnnouncement.tutorName} (${selectedAnnouncement.subject}) • ${selectedAnnouncement.date}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-700 leading-relaxed space-y-3 font-medium">
              <p>{selectedAnnouncement.content}</p>
            </div>

            {selectedAnnouncement.attachmentName && (
              <div className="p-3.5 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0d5c4d]" />
                  <div>
                    <p className="font-bold text-slate-900">{selectedAnnouncement.attachmentName}</p>
                    <p className="text-[10px] text-slate-500">{selectedAnnouncement.attachmentSize}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addToast({
                      type: "success",
                      title: "Downloaded Attachment",
                      message: `${selectedAnnouncement.attachmentName} downloaded.`
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0d5c4d] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#0a483c] cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </button>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: PAPER EVALUATION & EDUCATOR RUBRIC DETAILS        */}
      {/* ========================================================= */}
      {selectedPaperModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPaperModal(null)}
          title="Model Paper Assessment &amp; Rubric Breakdown"
          description={`${selectedPaperModal.paperCode} • Released by ${selectedPaperModal.tutorName} (${selectedPaperModal.subject})`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Certificate Header */}
            <div className="p-5 rounded-2xl bg-white border-2 border-[#0d5c4d]/20 relative overflow-hidden shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#ecf8f5] text-[#0d5c4d] font-black text-xs">
                      {selectedPaperModal.subject}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {selectedPaperModal.paperCode}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#0d2b26] mt-1">{selectedPaperModal.title}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    Evaluated for: {activeChild.name} • Assessment Date: {selectedPaperModal.date}
                  </p>
                </div>

                <div className="text-right p-3 rounded-xl bg-[#f8faf9] border border-slate-200 shrink-0">
                  <span className="text-2xl font-black text-[#0d2b26]">{selectedPaperModal.score}</span>
                  <span className="text-xs text-slate-500 font-bold"> / {selectedPaperModal.maxScore}</span>
                  <span className="block text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mt-1 text-center">
                    Grade {selectedPaperModal.grade}
                  </span>
                </div>
              </div>

              {/* Cohort Benchmark Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#f6f9f7] rounded-xl border border-slate-200 text-center">
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Child Score</span>
                  <p className="text-base font-black text-[#0d2b26] mt-0.5">{selectedPaperModal.score}%</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Batch Average</span>
                  <p className="text-base font-black text-slate-700 mt-0.5">{selectedPaperModal.batchAverage}%</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Batch Standing</span>
                  <p className="text-base font-black text-[#0d5c4d] mt-0.5">
                    Rank #{selectedPaperModal.rank} / {selectedPaperModal.batchTotal}
                  </p>
                </div>
              </div>

              {/* Tutor Personalized Feedback Quote Block */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span>Educator's Detailed Rubric &amp; Feedback:</span>
                </div>
                <p className="text-xs italic leading-relaxed text-slate-700 font-medium pl-3 border-l-2 border-amber-400">
                  "{selectedPaperModal.tutorFeedback}"
                </p>
                <div className="text-right pt-1">
                  <span className="text-[11px] font-bold text-slate-600">— {selectedPaperModal.tutorName}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() =>
                  addToast({
                    type: "success",
                    title: "Downloading Model Paper",
                    message: `${selectedPaperModal.paperCode}_Model_Paper.pdf saved to device.`
                  })
                }
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#0d5c4d]" />
                <span>Download Paper &amp; Scheme PDF</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Marksheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPaperModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
