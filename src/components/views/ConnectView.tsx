"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { useHubSettings } from "@/context/AdminContext";
import {
  ConnectTeacher,
  ConnectStudent,
  ConnectStudyGroup,
  ConnectPurchase,
  TutorPackage
} from "@/types/lms";
import {
  initialConnectTeachers,
  initialConnectStudents,
  initialConnectStudyGroups,
  initialConnectPurchases,
  initialTutorPackages
} from "@/data/connectMockData";
import {
  Users,
  GraduationCap,
  Users2,
  Receipt,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  Star,
  Video,
  BookOpen,
  Calendar,
  CreditCard,
  Building,
  UploadCloud,
  FileCheck,
  ChevronRight,
  ExternalLink,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Download,
  AlertCircle,
  Package,
  Sliders,
  Power,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff
} from "lucide-react";
import { TeacherConnectView } from "@/components/views/TeacherConnectView";

type ConnectTab = "teachers" | "purchases" | "groups" | "students";

export function ConnectView() {
  const {
    currentUser,
    currentRole,
    setCurrentView,
    isFeatureEnabled,
    updateTenantFeature,
    activeTenant,
    addToast
  } = useApp();
  const hubSettings = useHubSettings();

  // Feature Flags for Find Teachers & its 3 Sub-Options
  const isConnectModuleEnabled = isFeatureEnabled("find_teachers") && isFeatureEnabled("tuition_subscriptions");
  const isFindTeachersTabEnabled = isFeatureEnabled("sub_connect_find_teachers");
  const isSubscriptionsTabEnabled = isFeatureEnabled("sub_connect_subscriptions");
  const isStudyGroupsTabEnabled = isFeatureEnabled("sub_connect_study_groups");
  const hasAnyTabEnabled = isFindTeachersTabEnabled || isSubscriptionsTabEnabled || isStudyGroupsTabEnabled;

  // Quick Controls Drawer state
  const [showFeatureControls, setShowFeatureControls] = useState<boolean>(false);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<ConnectTab>("teachers");

  // Keep activeTab in sync with enabled options
  React.useEffect(() => {
    if (activeTab === "teachers" && !isFindTeachersTabEnabled) {
      if (isSubscriptionsTabEnabled) setActiveTab("purchases");
      else if (isStudyGroupsTabEnabled) setActiveTab("groups");
    } else if (activeTab === "purchases" && !isSubscriptionsTabEnabled) {
      if (isFindTeachersTabEnabled) setActiveTab("teachers");
      else if (isStudyGroupsTabEnabled) setActiveTab("groups");
    } else if (activeTab === "groups" && !isStudyGroupsTabEnabled) {
      if (isFindTeachersTabEnabled) setActiveTab("teachers");
      else if (isSubscriptionsTabEnabled) setActiveTab("purchases");
    }
  }, [activeTab, isFindTeachersTabEnabled, isSubscriptionsTabEnabled, isStudyGroupsTabEnabled]);

  // State management
  const [teachers, setTeachers] = useState<ConnectTeacher[]>(initialConnectTeachers);
  const [packages, setPackages] = useState<TutorPackage[]>(initialTutorPackages);
  const [students, setStudents] = useState<ConnectStudent[]>(initialConnectStudents);
  const [studyGroups, setStudyGroups] = useState<ConnectStudyGroup[]>(initialConnectStudyGroups);
  const [purchases, setPurchases] = useState<ConnectPurchase[]>(initialConnectPurchases);

  // Filters for Teachers tab
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [groupFilter, setGroupFilter] = useState<"all" | "enrolled">("all");

  // Modals
  const [selectedTeacherForSubscribe, setSelectedTeacherForSubscribe] = useState<ConnectTeacher | null>(null);
  const [selectedPackageForSubscribe, setSelectedPackageForSubscribe] = useState<TutorPackage | null>(null);
  const [selectedTeacherForPreview, setSelectedTeacherForPreview] = useState<ConnectTeacher | null>(null);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  // Checkout modal form state
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_slip">("card");
  const [cardNumber, setCardNumber] = useState<string>("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState<string>("08/28");
  const [cardCvc, setCardCvc] = useState<string>("892");
  const [bankRefNo, setBankRefNo] = useState<string>("BOC-TXN-882190");
  const [slipAttached, setSlipAttached] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSubject =
        selectedSubject === "all" ||
        t.subject.toLowerCase().includes(selectedSubject.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(selectedSubject.toLowerCase()));
      const matchQuery =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSubject && matchQuery;
    });
  }, [teachers, selectedSubject, searchQuery]);

  // Handle Subscribe Completion
  const handleConfirmSubscribe = () => {
    const isTeacher = !!selectedTeacherForSubscribe;
    const item = selectedTeacherForSubscribe
      ? {
          id: selectedTeacherForSubscribe.id,
          name: selectedTeacherForSubscribe.name,
          initials: selectedTeacherForSubscribe.initials,
          avatarColor: selectedTeacherForSubscribe.avatarColor,
          subject: selectedTeacherForSubscribe.subject,
          amount: selectedTeacherForSubscribe.monthlyFee,
          currency: selectedTeacherForSubscribe.currency,
          meetUrl: selectedTeacherForSubscribe.meetUrl
        }
      : selectedPackageForSubscribe
      ? {
          id: selectedPackageForSubscribe.id,
          name: selectedPackageForSubscribe.title,
          initials: selectedPackageForSubscribe.subject.substring(0, 2).toUpperCase(),
          avatarColor: "bg-[#0d5c4d]",
          subject: selectedPackageForSubscribe.subject,
          amount: selectedPackageForSubscribe.monthlyFeeLkr,
          currency: "LKR",
          meetUrl: "https://meet.google.com/limat-math-master"
        }
      : null;

    if (!item) return;
    setIsProcessing(true);

    setTimeout(() => {
      if (selectedTeacherForSubscribe) {
        setTeachers((prev) =>
          prev.map((t) =>
            t.id === item.id
              ? {
                  ...t,
                  isSubscribed: true,
                  subscribedDate: hubSettings.approvalRequired ? "Pending approval" : "2026-10-01"
                }
              : t
          )
        );
      }

      // Add to Purchases list
      const newPurchase: ConnectPurchase = {
        id: `pur_${Date.now()}`,
        teacherId: item.id,
        teacherName: item.name,
        teacherInitials: item.initials,
        teacherColor: item.avatarColor,
        subject: item.subject,
        amount: item.amount,
        currency: item.currency,
        date: "2026-10-01",
        validUntil: "2026-11-01",
        status: "active",
        paymentMethod: paymentMethod === "card" ? "Card (Visa/Mastercard)" : "Bank Deposit (Commercial Bank)",
        receiptNo: `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        meetUrl: item.meetUrl
      };
      setPurchases((prev) => [newPurchase, ...prev]);

      setIsProcessing(false);
      setSelectedTeacherForSubscribe(null);
      setSelectedPackageForSubscribe(null);
      setPaymentSuccessToast(`Successfully enrolled in ${item.name}! Live classes & materials unlocked for student.`);
      setTimeout(() => setPaymentSuccessToast(null), 5000);
    }, 900);
  };

  // Toggle Buddy in Students tab
  const handleToggleBuddy = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, isBuddy: !s.isBuddy } : s))
    );
  };

  // Toggle Study Group
  const handleToggleJoinGroup = (groupId: string) => {
    setStudyGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              isJoined: !g.isJoined,
              membersCount: g.isJoined ? g.membersCount - 1 : g.membersCount + 1
            }
          : g
      )
    );
  };

  // Handle toggling feature on the active tenant
  const handleToggleFeature = (featureKey: string, currentVal: boolean, label: string) => {
    if (!activeTenant) return;
    const nextVal = !currentVal;
    updateTenantFeature(activeTenant.id, featureKey, nextVal);
    // If enabling sub-option but parent module is disabled, enable parent module too
    if (nextVal && !isConnectModuleEnabled && featureKey !== "find_teachers") {
      updateTenantFeature(activeTenant.id, "find_teachers", true);
      updateTenantFeature(activeTenant.id, "tuition_subscriptions", true);
    }
    addToast({
      type: nextVal ? "success" : "info",
      title: nextVal ? "Feature Enabled" : "Feature Disabled",
      message: `"${label}" has been ${nextVal ? "ENABLED" : "DISABLED"} for ${activeTenant.name}.`
    });
  };

  // Keep all hooks above these role-specific returns so hook order never changes.
  if (currentRole === "teacher") {
    return <TeacherConnectView />;
  }

  // If Find Teachers module is globally disabled by Super Admin or Tenant Config
  if (!hubSettings.enabled || !isConnectModuleEnabled) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <div className="rounded-3xl border border-[#c4e9e0] bg-white p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#0d2b26]">Find Teachers Option is Currently Disabled</h2>
          <p className="mt-2 text-xs text-slate-500 max-w-lg mx-auto">
            The Find Teachers &amp; Tuition Connect module is turned off for <strong>{activeTenant?.name || "this workspace"}</strong>. You can re-enable it from the Super Admin Sub-Feature Matrix or click the button below.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                if (activeTenant) {
                  updateTenantFeature(activeTenant.id, "find_teachers", true);
                  updateTenantFeature(activeTenant.id, "tuition_subscriptions", true);
                  addToast({
                    type: "success",
                    title: "Feature Re-Enabled",
                    message: `Find Teachers option re-enabled for ${activeTenant.name}!`
                  });
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#093f34] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Power className="w-4 h-4 text-emerald-300" />
              <span>Enable Find Teachers Option Now</span>
            </button>
            <button
              onClick={() => setCurrentView("dashboard")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Toast Notification */}
      {paymentSuccessToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#0d5c4d] text-white shadow-2xl flex items-center gap-3 border border-[#a5f3df] animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-5 w-5 text-[#a5f3df] shrink-0" />
          <div className="text-xs">
            <p className="font-extrabold text-sm">Access Granted!</p>
            <p className="text-slate-200">{paymentSuccessToast}</p>
          </div>
          <button
            onClick={() => setPaymentSuccessToast(null)}
            className="p-1 hover:bg-white/20 rounded-lg text-white/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Parent Child Context Banner */}
      {currentRole === "parent" && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#0d5c4d] via-[#116b5a] to-[#09473b] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-[#177a67]">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#f3b738] text-slate-950 font-black flex items-center justify-center text-xl shrink-0 shadow-xs">
              👨‍👧
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base text-white">
                  Parent Mode: Reviewing Teachers for <strong>Sathurjan K.</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#f3b738] text-slate-950 text-[10px] font-black uppercase">
                  Grade 12 Physical Science
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Browse verified solo teachers and monthly fee packages. Enrolling here immediately unlocks live Google Meet classes and monthly tutes in your child's student portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedSubject("Combined Mathematics")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSubject === "Combined Mathematics"
                  ? "bg-[#f3b738] text-slate-950 font-black"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
            >
              Maths
            </button>
            <button
              onClick={() => setSelectedSubject("Physics")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSubject === "Physics"
                  ? "bg-[#f3b738] text-slate-950 font-black"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
            >
              Physics
            </button>
            <button
              onClick={() => setSelectedSubject("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSubject === "all"
                  ? "bg-[#f3b738] text-slate-950 font-black"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
            >
              All Subjects
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Sub-tabs */}
      <div className="space-y-4">
        {/* Navigation Tabs Bar + Feature Controls Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#c4e9e0] shadow-xs">
            {isFindTeachersTabEnabled && (
              <button
                onClick={() => setActiveTab("teachers")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "teachers"
                    ? "bg-[#0d5c4d] text-white shadow-sm ring-1 ring-[#0d5c4d]/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Find Teachers</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === "teachers" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {teachers.length}
                </span>
              </button>
            )}

            {isSubscriptionsTabEnabled && (
              <button
                onClick={() => setActiveTab("purchases")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "purchases"
                    ? "bg-[#0d5c4d] text-white shadow-sm ring-1 ring-[#0d5c4d]/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Receipt className="h-4 w-4" />
                <span>Subscriptions &amp; Invoices</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === "purchases" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {purchases.length}
                </span>
              </button>
            )}

            {isStudyGroupsTabEnabled && (
              <button
                onClick={() => setActiveTab("groups")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "groups"
                    ? "bg-[#0d5c4d] text-white shadow-sm ring-1 ring-[#0d5c4d]/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Users2 className="h-4 w-4" />
                <span>Study Groups</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === "groups" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {studyGroups.length}
                </span>
              </button>
            )}

            {!hasAnyTabEnabled && (
              <span className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                ⚠️ All 3 Tabs Disabled
              </span>
            )}
          </div>

          {/* Quick Toggle Controller Button */}
          <button
            onClick={() => setShowFeatureControls((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${
              showFeatureControls
                ? "bg-[#0d5c4d] text-white border-[#0d5c4d] shadow-xs"
                : "bg-white text-slate-700 border-[#c4e9e0] hover:bg-slate-50 shadow-2xs"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Configure Options</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
              showFeatureControls ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900 border border-amber-200"
            }`}>
              4 Switches
            </span>
          </button>
        </div>

        {/* Feature Controls Dropdown Panel */}
        {showFeatureControls && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#0d2b26] text-white shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#a5f3df]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Student Workspace: Find Teachers &amp; Sub-Options Feature Controls
                </h4>
              </div>
              <span className="text-[11px] text-slate-300 font-medium">
                Workspace: <strong>{activeTenant?.name || "Active Workspace"}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Main Sidebar Toggle */}
              <div className={`p-3 rounded-xl border transition-all ${
                isConnectModuleEnabled ? "bg-slate-800/80 border-emerald-500/50" : "bg-slate-900/60 border-slate-700 opacity-70"
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Find Teachers Menu</span>
                  </span>
                  <button
                    onClick={() => handleToggleFeature("find_teachers", isConnectModuleEnabled, "Find Teachers Sidebar Menu")}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isConnectModuleEnabled ? "bg-emerald-500" : "bg-slate-600"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isConnectModuleEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Student Sidebar navigation menu item
                </p>
                <div className="mt-2 text-[10px] font-bold">
                  {isConnectModuleEnabled ? (
                    <span className="text-emerald-400">● Visible in Student Sidebar</span>
                  ) : (
                    <span className="text-rose-400">○ Hidden from Sidebar</span>
                  )}
                </div>
              </div>

              {/* Option 1: Find Teachers Tab */}
              <div className={`p-3 rounded-xl border transition-all ${
                isFindTeachersTabEnabled ? "bg-slate-800/80 border-emerald-500/50" : "bg-slate-900/60 border-slate-700 opacity-70"
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-amber-400" />
                    <span>Option 1: Tutors Tab</span>
                  </span>
                  <button
                    onClick={() => handleToggleFeature("sub_connect_find_teachers", isFindTeachersTabEnabled, "Option 1: Find Teachers Tab")}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isFindTeachersTabEnabled ? "bg-emerald-500" : "bg-slate-600"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isFindTeachersTabEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Tutor profiles, subjects &amp; lesson packages
                </p>
                <div className="mt-2 text-[10px] font-bold">
                  {isFindTeachersTabEnabled ? (
                    <span className="text-emerald-400">● Enabled</span>
                  ) : (
                    <span className="text-rose-400">○ Disabled</span>
                  )}
                </div>
              </div>

              {/* Option 2: Subscriptions Tab */}
              <div className={`p-3 rounded-xl border transition-all ${
                isSubscriptionsTabEnabled ? "bg-slate-800/80 border-emerald-500/50" : "bg-slate-900/60 border-slate-700 opacity-70"
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5 text-blue-400" />
                    <span>Option 2: Invoices Tab</span>
                  </span>
                  <button
                    onClick={() => handleToggleFeature("sub_connect_subscriptions", isSubscriptionsTabEnabled, "Option 2: Subscriptions & Invoices Tab")}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isSubscriptionsTabEnabled ? "bg-emerald-500" : "bg-slate-600"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isSubscriptionsTabEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Active paid plans &amp; official receipt downloads
                </p>
                <div className="mt-2 text-[10px] font-bold">
                  {isSubscriptionsTabEnabled ? (
                    <span className="text-emerald-400">● Enabled</span>
                  ) : (
                    <span className="text-rose-400">○ Disabled</span>
                  )}
                </div>
              </div>

              {/* Option 3: Study Groups Tab */}
              <div className={`p-3 rounded-xl border transition-all ${
                isStudyGroupsTabEnabled ? "bg-slate-800/80 border-emerald-500/50" : "bg-slate-900/60 border-slate-700 opacity-70"
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <Users2 className="h-3.5 w-3.5 text-purple-400" />
                    <span>Option 3: Study Circles</span>
                  </span>
                  <button
                    onClick={() => handleToggleFeature("sub_connect_study_groups", isStudyGroupsTabEnabled, "Option 3: Peer Study Groups Tab")}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isStudyGroupsTabEnabled ? "bg-emerald-500" : "bg-slate-600"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isStudyGroupsTabEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Peer study rooms &amp; Google Meet discussions
                </p>
                <div className="mt-2 text-[10px] font-bold">
                  {isStudyGroupsTabEnabled ? (
                    <span className="text-emerald-400">● Enabled</span>
                  ) : (
                    <span className="text-rose-400">○ Disabled</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* When none of the 3 tabs are enabled */}
        {!hasAnyTabEnabled && (
          <div className="p-8 sm:p-10 rounded-3xl bg-amber-50/70 border border-amber-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-950">All 3 Find Teachers Sub-Options Are Currently Disabled</h3>
              <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
                Option 1 (Find Teachers), Option 2 (Subscriptions), and Option 3 (Study Groups) are currently disabled. You can re-enable any of them using the buttons below:
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => handleToggleFeature("sub_connect_find_teachers", false, "Option 1: Find Teachers Tab")}
                className="px-3.5 py-2 rounded-xl bg-[#0d5c4d] text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-[#093f34]"
              >
                + Enable Option 1 (Find Teachers)
              </button>
              <button
                onClick={() => handleToggleFeature("sub_connect_subscriptions", false, "Option 2: Subscriptions & Invoices Tab")}
                className="px-3.5 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-blue-800"
              >
                + Enable Option 2 (Subscriptions & Invoices)
              </button>
              <button
                onClick={() => handleToggleFeature("sub_connect_study_groups", false, "Option 3: Peer Study Groups Tab")}
                className="px-3.5 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-purple-800"
              >
                + Enable Option 3 (Study Groups)
              </button>
            </div>
          </div>
        )}

        {/* Tab 1 Header: Find Teachers & Search Bar */}
        {activeTab === "teachers" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#0d2b26] tracking-tight">
                  Find Teachers
                </h1>
                <span className="text-xs font-medium text-slate-500">
                  {currentRole === "parent" ? "Browse solo tutors & enroll your child" : "Pay to unlock full access & live classes"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentRole === "parent"
                  ? "Explore top verified teachers, check monthly fees, review syllabus masterclasses, and enroll your child with direct bank slip verification."
                  : "Join live Google Meet classes, access premium tutes, and receive personal exam mentoring."}
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2.5">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-[#c4e9e0] bg-white text-xs font-semibold text-slate-700 shadow-2xs focus:ring-2 focus:ring-[#0d5c4d]/20"
              >
                <option value="all">All Subjects</option>
                <option value="Combined Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Information & Communication Technology">ICT</option>
                <option value="Biology">Biology</option>
              </select>

              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search teachers or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3.5 py-2 rounded-xl border border-[#c4e9e0] bg-white text-xs text-slate-700 placeholder-slate-400 shadow-2xs focus:ring-2 focus:ring-[#0d5c4d]/20 w-44 sm:w-56"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: TEACHERS MARKETPLACE & CONTENT PAYWALL (Mockup Replication)  */}
      {/* =================================================================== */}
      {activeTab === "teachers" && (
        <div className="space-y-5">
          {filteredTeachers.map((teacher) => {
            const isSubscribed = teacher.isSubscribed;
            const teacherPlans = packages.filter(
              (p) =>
                p.teacherId === teacher.id ||
                p.subject.toLowerCase().includes(teacher.subject.toLowerCase())
            );

            return (
              <div
                key={teacher.id}
                className="bg-white rounded-3xl border border-[#c4e9e0] shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Teacher Profile Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: Avatar + Details */}
                    <div className="flex items-start gap-4">
                      {/* Initials Avatar */}
                      <div
                        className={`h-14 w-14 rounded-2xl ${teacher.avatarColor} text-white font-black text-xl flex items-center justify-center shrink-0 shadow-sm`}
                      >
                        {teacher.initials}
                      </div>

                      {/* Name & Title */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-black text-[#0d2b26] tracking-tight">
                            {teacher.name}
                          </h3>
                          {teacher.verified && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              VERIFIED
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-slate-500">
                          {teacher.title}
                        </p>

                        {/* Metrics Row */}
                        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap pt-1">
                          <span className="font-bold text-slate-800">
                            {teacher.studentsCount} <span className="font-normal text-slate-500">students</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-bold text-slate-800">
                            {teacher.lessonsCount} <span className="font-normal text-slate-500">lessons</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-bold text-slate-800">
                            {teacher.liveClassesCount} <span className="font-normal text-slate-500">live classes</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-black text-[#0d5c4d] bg-[#ecf8f5] px-2 py-0.5 rounded-md">
                            From LKR {teacher.monthlyFee.toLocaleString()}/month
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Rating Pill */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black shrink-0 self-start">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span>{teacher.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Bio & Tags */}
                  <div className="mt-3.5 space-y-2">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {teacher.bio}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {teacher.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Teacher's Available Subscription Plans / Packages */}
                  {teacherPlans.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-[#0d5c4d]" />
                          <h4 className="font-extrabold text-xs text-[#0d2b26] uppercase tracking-wider">
                            Teacher's Subscription Packages &amp; Plans ({teacherPlans.length})
                          </h4>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {currentRole === "parent" ? "Choose a plan to enroll your child" : "Select a plan to subscribe"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {teacherPlans.map((plan) => (
                          <div
                            key={plan.id}
                            className="rounded-2xl border border-[#c4e9e0] bg-[#f8faf9] p-4 flex flex-col justify-between space-y-3 hover:border-[#0d5c4d]/50 hover:bg-white hover:shadow-xs transition-all"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-black text-xs text-[#0d2b26] leading-snug">
                                  {plan.title}
                                </h5>
                                {plan.badge && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-extrabold uppercase shrink-0">
                                    {plan.badge}
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                {plan.description}
                              </p>

                              <div className="p-2.5 rounded-xl bg-white border border-[#c4e9e0]/80 flex items-baseline justify-between">
                                <div>
                                  <span className="text-base font-black text-[#0d5c4d]">
                                    LKR {plan.monthlyFeeLkr.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-semibold"> / {plan.billingCycle.toLowerCase()}</span>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-800 bg-[#ecf8f5] px-2 py-0.5 rounded-md">
                                  {plan.liveClassesPerWeek} Meets / wk
                                </span>
                              </div>

                              {/* Features Checklist */}
                              <div className="space-y-1 pt-1">
                                {plan.features.slice(0, 3).map((feat, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                                    <span className="truncate">{feat}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedPackageForSubscribe(plan)}
                              className="w-full py-2.5 px-3 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-extrabold text-xs shadow-2xs transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CreditCard className="h-3.5 w-3.5 text-[#f3b738]" />
                              <span>{currentRole === "parent" ? "Enroll Child in Plan" : "Enroll in Plan"}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4">
                    <button
                      onClick={() => setSelectedTeacherForPreview(teacher)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Preview Demo Lesson &amp; Bio
                    </button>

                    {isSubscribed ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Subscribed ✓
                        </span>
                        <a
                          href={teacher.meetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
                        >
                          <Video className="h-4 w-4" />
                          Join Live Class
                        </a>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedTeacherForSubscribe(teacher)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <CreditCard className="h-3.5 w-3.5 text-amber-300" />
                        <span>Quick Monthly Pass — LKR {teacher.monthlyFee.toLocaleString()}/mo</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Paywall / Unlocked Container */}
                {isSubscribed && (
                  <div className="p-4 sm:p-5 bg-gradient-to-b from-[#f8faf9] to-[#f0f5f3] border-t border-[#c4e9e0]">
                    <div className="rounded-2xl bg-white border border-[#a5f3df] p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-[#0d5c4d]">
                          <Unlock className="h-5 w-5 text-emerald-600" />
                          <h4 className="font-extrabold text-sm text-[#0d2b26]">
                            Full Content Unlocked &amp; Ready
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Active Subscription
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold">
                          Renews: Nov 01, 2026
                        </span>
                      </div>

                      {/* Unlocked Resources Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <a
                          href={teacher.meetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 flex items-center gap-3 transition-colors group"
                        >
                          <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Video className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-emerald-950 group-hover:text-emerald-700 flex items-center gap-1">
                              Google Meet Live Class <ExternalLink className="h-3 w-3" />
                            </p>
                            <p className="text-[10px] text-emerald-700 font-mono truncate max-w-[140px]">
                              {teacher.meetUrl.replace("https://", "")}
                            </p>
                          </div>
                        </a>

                        <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-slate-900">
                              {teacher.lessonsCount} Lesson Archive
                            </p>
                            <p className="text-[10px] text-slate-500">HD Recordings &amp; Tutes Unlocked</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: STUDENTS DIRECTORY (Peer Networking)                         */}
      {/* =================================================================== */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-black text-[#0d2b26]">Batch Students & Study Partners</h2>
              <p className="text-xs text-slate-500">Find classmates and A/L study buddies to revise together.</p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {students.filter((s) => s.isBuddy).length} Study Buddies Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-2xl border border-[#c4e9e0] p-5 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`h-12 w-12 rounded-xl ${student.avatarColor} text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-2xs relative`}
                  >
                    {student.initials}
                    <span
                      className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                        student.status === "online"
                          ? "bg-emerald-500"
                          : student.status === "in_study"
                          ? "bg-amber-500"
                          : "bg-slate-300"
                      }`}
                    />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[#0d2b26]">{student.name}</h4>
                      {student.isBuddy && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Buddy ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {student.grade} • {student.stream} ({student.school})
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      {student.subjects.map((sub) => (
                        <span
                          key={sub}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-semibold text-slate-600"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleBuddy(student.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      student.isBuddy
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-[#0d5c4d] text-white hover:bg-[#0a473b]"
                    }`}
                  >
                    {student.isBuddy ? "Connected" : "+ Connect"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: STUDY GROUPS (Teacher-Exclusive Study Circles)               */}
      {/* =================================================================== */}
      {activeTab === "groups" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#0d2b26]">Teacher-Created Study Circles</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] text-[10px] font-extrabold border border-[#c4e9e0]">
                  Subscribers Exclusive
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Each circle is created by your course tutors for peer problem-solving, past paper discussions, and live doubt clearance.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setGroupFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  groupFilter === "all"
                    ? "bg-[#0d5c4d] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                All Circles ({studyGroups.length})
              </button>
              <button
                type="button"
                onClick={() => setGroupFilter("enrolled")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  groupFilter === "enrolled"
                    ? "bg-[#0d5c4d] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                My Subscribed Teachers Only
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyGroups
              .filter((group) => {
                if (groupFilter !== "enrolled") return true;
                const isSubscribedToTeacher =
                  teachers.some((t) => t.id === group.teacherId && t.isSubscribed) ||
                  purchases.some((p) => p.teacherId === group.teacherId && p.status === "active");
                return isSubscribedToTeacher;
              })
              .map((group) => {
                const targetTeacher = teachers.find((t) => t.id === group.teacherId);
                const isSubscribedToTeacher =
                  teachers.some((t) => t.id === group.teacherId && t.isSubscribed) ||
                  purchases.some((p) => p.teacherId === group.teacherId && p.status === "active");

                return (
                  <div
                    key={group.id}
                    className={`bg-white rounded-3xl border transition-all p-6 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden ${
                      isSubscribedToTeacher
                        ? "border-[#c4e9e0] hover:border-[#0d5c4d]/50 hover:shadow-md"
                        : "border-slate-200/90 bg-slate-50/40"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Teacher Creator Header */}
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`h-7 w-7 rounded-lg ${
                              targetTeacher?.avatarColor || "bg-[#0d5c4d]"
                            } text-white font-extrabold text-[11px] flex items-center justify-center shrink-0`}
                          >
                            {targetTeacher?.initials || group.teacherName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              Created By Teacher
                            </p>
                            <p className="font-extrabold text-xs text-[#0d2b26]">
                              {group.teacherName}
                            </p>
                          </div>
                        </div>

                        {/* Subscription Access Badge */}
                        {isSubscribedToTeacher ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Subscribed Access ✓
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-black flex items-center gap-1">
                            <Lock className="h-3 w-3 text-amber-700" />
                            Requires Subscription
                          </span>
                        )}
                      </div>

                      {/* Group Title & Details */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#ecf8f5] text-[#0d5c4d] text-[10px] font-bold">
                            {group.subject}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {group.membersCount} / {group.maxMembers} Students
                          </span>
                        </div>
                        <h3 className="font-black text-base text-[#0d2b26]">{group.name}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">{group.description}</p>
                      </div>
                    </div>

                    {/* Schedule & Topic Card */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-1.5 text-xs shadow-2xs">
                      <p className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>Current Topic:</span> <span className="font-semibold text-slate-800">{group.activeTopic}</span>
                      </p>
                      <p className="text-slate-500 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Schedule:</span> <span className="font-medium text-slate-700">{group.schedule}</span>
                      </p>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="pt-2">
                      {isSubscribedToTeacher ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleJoinGroup(group.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              group.isJoined
                                ? "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-transparent"
                                : "bg-[#0d5c4d] hover:bg-[#0a473b] text-white shadow-xs"
                            }`}
                          >
                            {group.isJoined ? "Joined Circle ✓ (Leave)" : "Join Study Circle"}
                          </button>

                          {group.isJoined && group.meetUrl && (
                            <a
                              href={group.meetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Video className="h-3.5 w-3.5" />
                              <span>Open Discussion Room</span>
                              <ExternalLink className="h-3 w-3 opacity-80" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                          <p className="text-[11px] text-amber-900 leading-snug">
                            🔒 <strong>Subscribers Only:</strong> This study circle is exclusively for students enrolled in <strong>{group.teacherName}</strong>'s subscription package.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (targetTeacher) {
                                setSelectedTeacherForSubscribe(targetTeacher);
                              } else {
                                setActiveTab("teachers");
                              }
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CreditCard className="h-3.5 w-3.5 text-[#f3b738]" />
                            <span>Subscribe to {group.teacherName} to Unlock</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}



      {/* =================================================================== */}
      {/* TAB 5: MY PURCHASES & INVOICES                                      */}
      {/* =================================================================== */}
      {activeTab === "purchases" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-black text-[#0d2b26]">My Active Subscriptions & Invoices</h2>
              <p className="text-xs text-slate-500">Track paid teachers, monthly renewal dates, and payment receipts.</p>
            </div>
          </div>

          {purchases.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <Receipt className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-600">No active subscriptions yet</p>
              <p className="text-xs text-slate-400">Subscribe to any teacher from the Teachers tab to unlock classes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-white rounded-2xl border border-[#c4e9e0] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-xl ${purchase.teacherColor} text-white font-extrabold text-base flex items-center justify-center shrink-0`}
                    >
                      {purchase.teacherInitials}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-[#0d2b26]">
                          {purchase.teacherName}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                          ACTIVE PLAN
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{purchase.subject}</p>
                      <p className="text-[11px] text-slate-400">
                        Paid via {purchase.paymentMethod} • Receipt: <span className="font-mono text-slate-600">{purchase.receiptNo}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right sm:border-r border-slate-200 sm:pr-4">
                      <p className="font-black text-sm text-[#0d5c4d]">
                        LKR {purchase.amount.toLocaleString()} / mo
                      </p>
                      <p className="text-[10px] text-slate-400">Next renewal: {purchase.validUntil}</p>
                    </div>

                    <a
                      href={purchase.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Join Meet
                    </a>

                    <button
                      onClick={() => alert(`Downloading official invoice receipt #${purchase.receiptNo} for LKR ${purchase.amount}`)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs"
                      title="Download Invoice PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* CHECKOUT / SUBSCRIPTION MODAL                                       */}
      {/* =================================================================== */}
      {(selectedTeacherForSubscribe || selectedPackageForSubscribe) && (() => {
        const activeSubTarget = selectedTeacherForSubscribe
          ? {
              name: selectedTeacherForSubscribe.name,
              subject: selectedTeacherForSubscribe.subject,
              fee: selectedTeacherForSubscribe.monthlyFee,
              badge: "Solo Teacher Pass"
            }
          : selectedPackageForSubscribe
          ? {
              name: selectedPackageForSubscribe.title,
              subject: selectedPackageForSubscribe.subject,
              fee: selectedPackageForSubscribe.monthlyFeeLkr,
              badge: selectedPackageForSubscribe.grade
            }
          : null;

        if (!activeSubTarget) return null;

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#fbfcfb]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {activeSubTarget.badge}
                  </span>
                  <h3 className="font-black text-base text-[#0d2b26] mt-1">
                    Enroll in {activeSubTarget.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeSubTarget.subject} • Full curriculum &amp; live Google Meet access
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTeacherForSubscribe(null);
                    setSelectedPackageForSubscribe(null);
                  }}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 text-xs">
                {/* Parent Confirmation Notice */}
                {currentRole === "parent" && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-xs">Parent Enrollment Confirmation</p>
                      <p className="text-[11px] text-emerald-800">
                        Enrolling child: <strong>Sathurjan K. (Grade 12 - Physical Science)</strong>. All live links and materials will be automatically linked to their student profile.
                      </p>
                    </div>
                  </div>
                )}

                {/* Plan Summary Card */}
                <div className="p-4 rounded-2xl bg-[#ecf8f5] border border-[#a5f3df] flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-[#0d5c4d] uppercase tracking-wider">
                      Total Due Today
                    </p>
                    <p className="text-2xl font-black text-[#0d2b26]">
                      LKR {activeSubTarget.fee.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500"> / month</span>
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-600 font-semibold space-y-0.5">
                    <p>✓ Live Meets Included</p>
                    <p>✓ Complete Tute Pack</p>
                    <p>✓ 1-on-1 Q&amp;A Doubt Support</p>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="font-extrabold text-slate-700">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-xl border flex flex-col items-start gap-1.5 transition-all text-left ${
                        paymentMethod === "card"
                          ? "bg-white border-[#0d5c4d] shadow-sm ring-2 ring-[#0d5c4d]/20 text-[#0d2b26]"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <CreditCard className="h-4 w-4 text-[#0d5c4d]" />
                        <span>Card / Online</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Visa, Mastercard, FriMi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank_slip")}
                      className={`p-3 rounded-xl border flex flex-col items-start gap-1.5 transition-all text-left ${
                        paymentMethod === "bank_slip"
                          ? "bg-white border-[#0d5c4d] shadow-sm ring-2 ring-[#0d5c4d]/20 text-[#0d2b26]"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Building className="h-4 w-4 text-emerald-700" />
                        <span>Bank Slip Upload</span>
                      </div>
                      <span className="text-[10px] text-slate-400">BOC, Commercial Bank</span>
                    </button>
                  </div>
                </div>

                {/* Payment Details form depending on method */}
                {paymentMethod === "card" ? (
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">CVC / CVV</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-center"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-1">
                      <p className="font-extrabold text-[#0d2b26]">Direct Bank Deposit Details</p>
                      <p className="text-slate-600 font-mono text-[11px]">
                        Bank: <span className="font-bold">Commercial Bank of Ceylon</span>
                      </p>
                      <p className="text-slate-600 font-mono text-[11px]">
                        Account: <span className="font-bold">80019284019</span> (LimaT Smart Book)
                      </p>
                      <p className="text-slate-600 font-mono text-[11px]">
                        Branch: <span className="font-bold">Colombo City Center</span>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px]">Deposit Reference No.</label>
                      <input
                        type="text"
                        value={bankRefNo}
                        onChange={(e) => setBankRefNo(e.target.value)}
                        placeholder="e.g. BOC-TXN-882190"
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white font-mono text-xs"
                      />
                    </div>

                    <div className="border border-dashed border-emerald-400 bg-white rounded-xl p-3 text-center flex items-center justify-center gap-2 text-emerald-800 font-bold">
                      <FileCheck className="h-4 w-4 text-emerald-600" />
                      <span>Deposit Slip Attached (deposit_slip.pdf)</span>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 text-center">
                  🔒 Secure 256-bit SSL encrypted. Cancel anytime before your next monthly billing cycle.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-[#fbfcfb] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeacherForSubscribe(null);
                    setSelectedPackageForSubscribe(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmSubscribe}
                  className="px-5 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-black text-xs shadow-md transition-all hover:scale-[1.02] flex items-center gap-2"
                >
                  {isProcessing ? (
                    <span>Activating Subscription...</span>
                  ) : (
                    <>
                      <span>Confirm &amp; Pay LKR {activeSubTarget.fee.toLocaleString()}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =================================================================== */}
      {/* TEACHER PREVIEW MODAL                                               */}
      {/* =================================================================== */}
      {selectedTeacherForPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#fbfcfb]">
              <div className="flex items-center gap-3">
                <div
                  className={`h-11 w-11 rounded-xl ${selectedTeacherForPreview.avatarColor} text-white font-black text-base flex items-center justify-center`}
                >
                  {selectedTeacherForPreview.initials}
                </div>
                <div>
                  <h3 className="font-black text-base text-[#0d2b26]">
                    {selectedTeacherForPreview.name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedTeacherForPreview.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeacherForPreview(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <p className="font-extrabold text-slate-800">Teacher Biography</p>
                <p className="text-slate-600 leading-relaxed">{selectedTeacherForPreview.bio}</p>
              </div>

              <div className="space-y-1">
                <p className="font-extrabold text-slate-800">Qualifications & Honours</p>
                <p className="text-slate-600">{selectedTeacherForPreview.qualifications}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Video className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Free Demo Lesson Preview</span>
                </p>
                <p className="text-slate-600 font-semibold">{selectedTeacherForPreview.sampleVideoTitle}</p>
                <div className="aspect-video rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-slate-700 transition-colors">
                  ▶ Play 5-Min Concept Preview
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-[#fbfcfb] flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  const teacher = selectedTeacherForPreview;
                  setSelectedTeacherForPreview(null);
                  setSelectedTeacherForSubscribe(teacher);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-black shadow-sm"
              >
                Subscribe — LKR {selectedTeacherForPreview.monthlyFee.toLocaleString()}/mo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
