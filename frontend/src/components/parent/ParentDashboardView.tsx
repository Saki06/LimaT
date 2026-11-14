"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import type {
  TuitionInvoice,
  TutorPaperMarkRecord,
  TutorAnnouncement,
  ParentLeaveRequest,
  ParentChildProfile
} from "@/types/parent";
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
  LayoutGrid,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";

type ParentTab = "overview" | "tuition_classes" | "fees" | "progress" | "circulars";
type ParentChildrenResponse = {
  success: boolean;
  data: Partial<ParentChildProfile>[];
  message?: string;
};

const EMPTY_PARENT_CHILD: ParentChildProfile = {
  id: "",
  name: "",
  grade: "",
  avatarText: "",
  overallAverage: 0,
  classRank: 0,
  totalStudents: 0,
  enrolments: [],
  invoices: [],
  paperMarks: [],
  announcements: [],
  monthlyInvestmentLkr: 0,
  pendingSlipsCount: 0,
};

const EMPTY_CHILD_PROFILE: ParentChildProfile = {
  id: "",
  studentId: "",
  name: "No Student Linked",
  admissionNo: "—",
  grade: "Link Student ID",
  classSection: "—",
  avatarText: "ST",
  schoolName: "LimaT Learning Portal",
  enrolledSinceYear: new Date().getFullYear().toString(),
  admissionGrade: "—",
  currentStage: "—",
  cumulativeCareerAverage: 0,
  totalYearsEnrolled: 0,
  classTeacher: "—",
  classTeacherEmail: "",
  classTeacherPhone: "",
  attendanceRate: 0,
  presentDays: 0,
  totalDays: 0,
  overallAverage: 0,
  classRank: 0,
  totalStudents: 0,
  upcomingExamsCount: 0,
  hallTicketNo: "—",
  nextExamDate: "",
  nextExamName: "",
  monthlyInvestmentLkr: 0,
  activeEnrolmentsCount: 0,
  pendingSlipsCount: 0,
  enrolments: [],
  invoices: [],
  announcements: [],
  paperMarks: [],
  attendanceLogs: [],
} as unknown as ParentChildProfile;

export function ParentDashboardView() {
  const { currentView, setCurrentView, addToast } = useApp();

  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [childrenList, setChildrenList] = useState<ParentChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const currentMonthStr = useMemo(
    () => new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    []
  );
  const todayIsoStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [isLinkChildModalOpen, setIsLinkChildModalOpen] = useState<boolean>(false);
  const [linkStudentInput, setLinkStudentInput] = useState<string>("");
  const [isLinkingStudent, setIsLinkingStudent] = useState<boolean>(false);

  const fetchParentData = async (showToast = false) => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const res = (await api.parents.getMyChildren()) as ParentChildrenResponse;
      if (!res?.success || !Array.isArray(res.data)) {
        throw new Error(res?.message || "The parent records response was invalid.");
      }

      const children = res.data.map((child) => {
        const enrolments = Array.isArray(child.enrolments) ? child.enrolments : [];
        const invoices = Array.isArray(child.invoices) ? child.invoices : [];

        return {
          ...EMPTY_PARENT_CHILD,
          ...child,
          id: child.id || "",
          name: child.name || "Student",
          grade: child.grade || "",
          avatarText: child.avatarText || "",
          enrolments,
          invoices,
          paperMarks: Array.isArray(child.paperMarks) ? child.paperMarks : [],
          announcements: Array.isArray(child.announcements) ? child.announcements : [],
          monthlyInvestmentLkr:
            child.monthlyInvestmentLkr ??
            enrolments.reduce((total, enrolment) => total + enrolment.monthlyFeeLkr, 0),
          pendingSlipsCount:
            child.pendingSlipsCount ?? invoices.filter((invoice) => invoice.status === "under_review").length,
        };
      });

      setChildrenList(children);
      if (!children.some((child) => child.id === selectedChildId)) {
        setSelectedChildId(children[0]?.id || "");
      }
      if (showToast) {
        addToast({
          type: "success",
          title: "Parent Portal Refreshed",
          message: "Updated live attendance, marks, and tuition pass status."
        });
      }
    } catch (err) {
      console.warn("Could not load backend parent children:", err);
      setLoadError(err instanceof Error ? err.message : "Could not load linked student records.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchParentData(false);
  }, []);

  const handleLinkChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkStudentInput.trim()) {
      addToast({
        type: "warning",
        title: "Student ID Required",
        message: "Please enter your child's Student ID (e.g. STU-1234), mobile number, or email."
      });
      return;
    }

    try {
      setIsLinkingStudent(true);
      const res = await api.parents.linkChild(linkStudentInput.trim());
      if (!res?.success) {
        addToast({
          type: "error",
          title: "Could Not Link Student",
          message: res?.message || "No student found matching that Student ID or mobile number."
        });
        return;
      }

      addToast({
        type: "success",
        title: "Student Linked!",
        message: res.message || "Student profile linked to your Parent Portal."
      });
      setLinkStudentInput("");
      setIsLinkChildModalOpen(false);
      await fetchParentData(false);
    } catch (err) {
      addToast({
        type: "error",
        title: "Error Linking Student",
        message: err instanceof Error ? err.message : "Failed to link student."
      });
    } finally {
      setIsLinkingStudent(false);
    }
  };

  const activeChild =
    childrenList.find((c) => c.id === selectedChildId) ||
    childrenList[0] ||
    EMPTY_CHILD_PROFILE;

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
    return Array.from(new Set((activeChild.paperMarks || []).map((p) => p.subject)));
  }, [activeChild.paperMarks]);

  // Filtered papers
  const filteredPapers = useMemo(() => {
    const marks = activeChild.paperMarks || [];
    if (paperSubjectFilter === "all") return marks;
    return marks.filter(
      (p) => p.subject.toLowerCase() === paperSubjectFilter.toLowerCase()
    );
  }, [activeChild.paperMarks, paperSubjectFilter]);

  // Leave Requests state
  const [leaveRequests, setLeaveRequests] = useState<ParentLeaveRequest[]>([]);
  const [leaveTutor, setLeaveTutor] = useState(activeChild.enrolments[0]?.teacherName || "");
  const [leaveDate, setLeaveDate] = useState(todayIsoStr);
  const [leaveReason, setLeaveReason] = useState<ParentLeaveRequest["reason"]>("School Exam Clashing");
  const [leaveNote, setLeaveNote] = useState("");

  // Deposit Slip Upload Form State
  const [depositTutor, setDepositTutor] = useState(activeChild.enrolments[0]?.teacherName || "");
  const [depositMonth, setDepositMonth] = useState(currentMonthStr);
  const [depositAmount, setDepositAmount] = useState(activeChild.enrolments[0]?.monthlyFeeLkr || 0);
  const [depositBank, setDepositBank] = useState("Commercial Bank of Ceylon");
  const [depositBranch, setDepositBranch] = useState("");
  const [depositRefNumber, setDepositRefNumber] = useState("");
  const [depositDate, setDepositDate] = useState(todayIsoStr);
  const [slipFileName, setSlipFileName] = useState("Bank_Deposit_Slip_Receipt.jpg");

  // Invoices list state (allow live additions when parent uploads bank slip)
  const [invoices, setInvoices] = useState<TuitionInvoice[]>(activeChild.invoices || []);

  // Sync invoices when active child changes
  React.useEffect(() => {
    setInvoices(activeChild.invoices || []);
    if ((activeChild.enrolments || []).length > 0) {
      setDepositTutor(activeChild.enrolments[0].teacherName);
      setDepositAmount(activeChild.enrolments[0].monthlyFeeLkr);
      setLeaveTutor(activeChild.enrolments[0].teacherName);
    } else {
      setDepositTutor("");
      setDepositAmount(0);
      setLeaveTutor("");
    }
  }, [activeChild]);

  // Handle Bank Slip Submission
  const handleDepositSubmit = async (e: React.FormEvent) => {
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

    try {
      await api.parents.submitDepositSlip({
        childId: activeChild.id,
        slipRefNumber: depositRefNumber.trim().toUpperCase(),
        bankName: depositBank,
        branchName: depositBranch,
        depositedDate: depositDate,
        amountLkr: Number(depositAmount),
        slipImageUrl: "/images/mock_slips/sample_slip.jpg",
        tutorName: depositTutor,
      });
    } catch (err) {
      console.warn("Backend deposit slip submission skipped:", err);
    }
  };

  // Handle Leave Note Submission
  const handleLeaveSubmit = async (e: React.FormEvent) => {
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

    try {
      await api.parents.submitLeaveRequest({
        childId: activeChild.id,
        startDate: leaveDate,
        endDate: leaveDate,
        reason: leaveReason,
        note: leaveNote.trim(),
        tutorName: leaveTutor,
      });
    } catch (err) {
      console.warn("Backend leave request submission skipped:", err);
    }
  };

  if (childrenList.length === 0) {
    return (
      <div className="rounded-3xl border border-[#e6ece8] bg-white p-8 text-center shadow-xs">
        <h1 className="text-xl font-black text-[#0d2b26]">Parent &amp; Guardian Portal</h1>
        <p className="mt-2 text-sm text-slate-600" role={loadError ? "alert" : "status"}>
          {isLoading
            ? "Loading linked student records..."
            : loadError || "No linked students were found for this parent account."}
        </p>
        {!isLoading && (
          <button
            type="button"
            onClick={() => fetchParentData(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0d5c4d] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a473b] disabled:opacity-60"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    );
  }

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
              {childrenList.length === 0 ? (
                <span className="px-3 py-1.5 rounded-xl bg-white/10 text-emerald-100 text-xs font-semibold">
                  No linked students yet
                </span>
              ) : (
                childrenList.map((child) => {
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
                          {child.admissionNo || child.grade}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}

              <button
                type="button"
                onClick={() => setIsLinkChildModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f3b738] hover:bg-[#e5a92a] text-slate-950 text-xs font-black transition-all cursor-pointer shrink-0"
                title="Link a Child Student Account"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Link Student</span>
              </button>
            </div>

            {/* Live Refresh Button */}
            <button
              type="button"
              onClick={() => fetchParentData(true)}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer flex items-center justify-center shrink-0 self-center"
              title="Refresh Children Records"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {childrenList.length === 0 && !isLoading && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#c4e9e0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-[#0d2b26]">
              No Student Account Linked Yet
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              Link your child&apos;s student profile using their unique Student ID (e.g., <code className="font-mono font-bold text-[#0d5c4d]">STU-1234</code>), mobile number, or email address to view their real enrolled tutors, live classes, fee invoices, and paper marks.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsLinkChildModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-black shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4 text-[#f3b738]" />
            <span>Link Child Student ID</span>
          </button>
        </div>
      )}

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

            {/* Card 2: Monthly Tuition Fee */}
            <div className="bg-white rounded-2xl p-5 border border-[#e6ece8] shadow-xs hover:border-[#0d5c4d]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Tuition Fee</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <CreditCard className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#0d2b26]">
                    LKR {(
                      activeChild.monthlyInvestmentLkr ??
                      (activeChild.enrolments || []).reduce((sum, e) => sum + (Number(e.monthlyFeeLkr) || 0), 0)
                    ).toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    / month
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Status:{" "}
                  {(activeChild.pendingSlipsCount ?? 0) > 0
                    ? `${activeChild.pendingSlipsCount} Slip(s) Under Review`
                    : (activeChild.enrolments || []).length > 0
                    ? "All Paid & Active"
                    : "No Active Subscriptions"}
                </p>
              </div>
            </div>

            {/* Card 3: Assignments & Marks Performance */}
            <div className="bg-white rounded-2xl p-5 border border-[#e6ece8] shadow-xs hover:border-[#0d5c4d]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assignments &amp; Marks Average</span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <Award className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#0d2b26]">{activeChild.overallAverage ?? 0}%</span>
                  {(activeChild.paperMarks || []).length > 0 ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {(activeChild.paperMarks || []).length} Graded
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      No Marks Yet
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {(activeChild.paperMarks || []).length > 0
                    ? `Across ${(activeChild.paperMarks || []).length} graded assignments`
                    : "Marks appear once assignments are graded by the tutor"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Shortcuts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {activeChild.enrolments.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-[#fbfdfc] text-center space-y-1">
                <p className="text-sm font-bold text-slate-700">No Live Classes Scheduled Yet</p>
                <p className="text-xs text-slate-500">
                  Once {activeChild.name} enrolls in a course or tuition package, upcoming live sessions will appear here.
                </p>
              </div>
            ) : (
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
                      {enrol.meetingUrl && enrol.meetingUrl !== "#" ? (
                        <a
                          href={enrol.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-black text-[#0d5c4d] hover:underline flex items-center gap-1"
                        >
                          <span>Join Link</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">No Link Yet</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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

            {activeChild.enrolments.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-[#fbfdfc] text-center space-y-2">
                <p className="text-sm font-bold text-slate-700">No Enrolled Tuition Masterclasses</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {activeChild.name} has not enrolled in any courses or monthly packages yet.
                </p>
              </div>
            ) : (
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
                        <span className="text-slate-500">Latest Assignment Score:</span>
                        <span className="font-black text-[#0d5c4d]">
                          {enrol.latestPaperMark > 0 ? `${enrol.latestPaperMark}/${enrol.latestPaperMax}` : "No assignment graded yet"}
                        </span>
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
            )}
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

          {activeChild.enrolments.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700">No Active Masterclass Cohorts</p>
              <p className="text-xs text-slate-500">
                No enrolled tutors found for {activeChild.name}.
              </p>
            </div>
          ) : (
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
                      {enrol.meetingUrl && enrol.meetingUrl !== "#" ? (
                        <a
                          href={enrol.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg bg-[#0d5c4d] text-white text-xs font-bold hover:bg-[#0a483c] flex items-center gap-1"
                        >
                          <span>Join</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">Not Scheduled</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Direct Contact:</span>
                    <span className="font-bold text-slate-800">{enrol.tutorPhone}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Attendance:</span>
                    <span className="font-black text-[#0d5c4d]">{enrol.attendanceRate}% ({enrol.attendedSessions}/{enrol.totalSessions})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
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
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 px-4 text-center text-slate-500">
                        No tuition invoices or bank deposit slips recorded yet.
                      </td>
                    </tr>
                  ) : (
                  invoices.map((inv) => (
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
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* ========================================================= */}
      {/* TAB 5: ASSIGNMENTS & ASSESSMENT MARKS                     */}
      {/* ========================================================= */}
      {activeTab === "progress" && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="bg-white rounded-3xl p-6 border border-[#e6ece8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-[#0d5c4d]">
                  <Award className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-black text-[#0d2b26]">Assignments &amp; Assessment Marks</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Graded assignments, scores, and tutor feedback for {activeChild.name}
              </p>
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
                All Subjects ({(activeChild.paperMarks || []).length})
              </button>
              {availablePaperSubjects.map((sub) => {
                const count = (activeChild.paperMarks || []).filter((p) => p.subject === sub).length;
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
                <span className="text-slate-500 font-normal">Average Score:</span>
                <span className="font-black text-[#0d2b26]">
                  {(
                    filteredPapers.reduce((acc, p) => acc + (p.maxScore > 0 ? (p.score / p.maxScore) * 100 : p.score), 0) /
                    (filteredPapers.length || 1)
                  ).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                <span className="text-slate-500 font-normal">Graded Count:</span>
                <span className="font-black text-amber-800">
                  {filteredPapers.length}
                </span>
              </div>
            </div>
          </div>

          {/* ASSIGNMENTS & MARKS TABLE */}
          <div className="bg-white rounded-3xl p-6 border border-[#e6ece8] shadow-xs space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f4f7f5] text-slate-700 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Assignment Title</th>
                    <th className="py-3 px-4">Subject &amp; Tutor</th>
                    <th className="py-3 px-4 text-center">Marks</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                    <th className="py-3 px-4">Tutor Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredPapers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 px-4 text-center text-slate-500">
                        No graded assignments recorded yet for {activeChild.name}.
                      </td>
                    </tr>
                  ) : (
                    filteredPapers.map((paper) => (
                      <tr key={paper.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-900">{paper.date}</span>
                        </td>

                        {/* Title */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
                          <p className="line-clamp-2">{paper.title}</p>
                        </td>

                        {/* Tutor & Subject */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-[#0d5c4d] block">{paper.subject}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{paper.tutorName}</span>
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
                              style={{ width: `${Math.min(100, (paper.score / (paper.maxScore || 100)) * 100)}%` }}
                            />
                          </div>
                        </td>

                        {/* Grade Badge */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-md bg-[#ecf8f5] text-[#0d5c4d] font-black text-xs">
                            Grade {paper.grade}
                          </span>
                        </td>

                        {/* Tutor Feedback */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-slate-600 line-clamp-2 text-xs">
                              {paper.tutorFeedback || "Completed & graded by tutor."}
                            </p>
                            <button
                              type="button"
                              onClick={() => setSelectedPaperModal(paper)}
                              className="px-3 py-1.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                            >
                              <FileText className="h-3 w-3" />
                              <span>View</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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

          {(activeChild.announcements || []).length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700">No Announcements Posted Yet</p>
              <p className="text-xs text-slate-500">
                Official circulars and educator notices will appear here once published.
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(activeChild.announcements || []).map((ann) => (
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
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 0: LINK A CHILD STUDENT PROFILE                     */}
      {/* ========================================================= */}
      <Modal
        isOpen={isLinkChildModalOpen}
        onClose={() => setIsLinkChildModalOpen(false)}
        title="Link Your Child's Student Account"
        description="Enter your child's Student ID (e.g. STU-1234), registered mobile number, or email address."
      >
        <form onSubmit={handleLinkChildSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Child&apos;s Student ID, Mobile Number, or Email *
            </label>
            <input
              type="text"
              value={linkStudentInput}
              onChange={(e) => setLinkStudentInput(e.target.value)}
              placeholder="e.g. STU-1234 or 0771234567"
              required
              className="w-full h-10 px-3 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsLinkChildModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLinkingStudent}
              className="px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-black cursor-pointer disabled:opacity-50"
            >
              {isLinkingStudent ? "Linking..." : "Link Student"}
            </button>
          </div>
        </form>
      </Modal>

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
      {/* MODAL 5: ASSIGNMENT EVALUATION & TUTOR FEEDBACK           */}
      {/* ========================================================= */}
      {selectedPaperModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPaperModal(null)}
          title="Assignment Evaluation &amp; Tutor Feedback"
          description={`Graded by ${selectedPaperModal.tutorName} (${selectedPaperModal.subject})`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-5 text-xs">
            <div className="p-5 rounded-2xl bg-white border-2 border-[#0d5c4d]/20 relative overflow-hidden shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-[#ecf8f5] text-[#0d5c4d] font-black text-xs">
                    {selectedPaperModal.subject}
                  </span>
                  <h3 className="text-base font-black text-[#0d2b26] mt-1">{selectedPaperModal.title}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    Student: {activeChild.name} • Date: {selectedPaperModal.date}
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

              {/* Tutor Personalized Feedback Quote Block */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span>Tutor Feedback:</span>
                </div>
                <p className="text-xs italic leading-relaxed text-slate-700 font-medium pl-3 border-l-2 border-amber-400">
                  &ldquo;{selectedPaperModal.tutorFeedback || "Completed and graded by tutor."}&rdquo;
                </p>
                <div className="text-right pt-1">
                  <span className="text-[11px] font-bold text-slate-600">— {selectedPaperModal.tutorName}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
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
        </Modal>
      )}
    </div>
  );
}
