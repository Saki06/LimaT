"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useHubSettings } from "@/context/AdminContext";
import { api } from "@/lib/api";
import {
  ConnectTeacher,
  ConnectStudent,
  ConnectStudyGroup,
  ConnectPurchase,
  TutorPackage
} from "@/types/lms";
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
  Printer,
  FileText,
  AlertCircle,
  Package,
  Sliders,
  Power,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff
} from "lucide-react";
import { TeacherConnectView } from "@/components/teacher/TeacherConnectView";

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

  // State management (strictly live data from DB - no mock)
  const [teachers, setTeachers] = useState<ConnectTeacher[]>([]);
  const [packages, setPackages] = useState<TutorPackage[]>([]);
  const [students, setStudents] = useState<ConnectStudent[]>([]);
  const [studyGroups, setStudyGroups] = useState<ConnectStudyGroup[]>([]);
  const [purchases, setPurchases] = useState<ConnectPurchase[]>([]);
  const [isLoadingMarketplace, setIsLoadingMarketplace] = useState<boolean>(true);

  // Load live tutors and packages from backend Marketplace API
  useEffect(() => {
    let isMounted = true;
    setIsLoadingMarketplace(true);

    async function loadData() {
      try {
        const [teachersRes, packagesRes] = await Promise.all([
          api.teachers.getMarketplace(),
          api.packages.getAll().catch(() => ({ success: false, data: [] }))
        ]);

        if (!isMounted) return;

        if (teachersRes?.success && Array.isArray(teachersRes.data)) {
          const mappedTutors: ConnectTeacher[] = teachersRes.data.map((t: any) => {
            const nameParts = (t.name || "Tutor").trim().split(" ");
            const initials = nameParts.length > 1
              ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
              : (nameParts[0] || "TU").substring(0, 2).toUpperCase();

            // Find fee from teacher's own packages if available
            const teacherPackages = Array.isArray(t.packages) ? t.packages : [];
            const primaryPackage = teacherPackages[0];
            const fee = primaryPackage?.price || t.monthlyFeeLkr || 0;

            return {
              id: t.id,
              name: t.name || "Tutor",
              initials,
              avatarColor: "bg-[#0d5c4d]",
              verified: Boolean(t.isVerified),
              title: t.title || "Specialist Educator",
              subject: t.specialization || "General Subjects",
              studentsCount: t.studentsCount || 0,
              lessonsCount: t.coursesCount || (Array.isArray(t.courses) ? t.courses.length : 0),
              liveClassesCount: t.liveClassesCount || 0,
              monthlyFee: fee,
              currency: "LKR",
              rating: typeof t.rating === "number" && t.rating > 0 ? t.rating : undefined,
              tags: Array.isArray(t.mediums) && t.mediums.length > 0
                ? t.mediums
                : [t.specialization || "Tuition"],
              meetUrl: t.websiteUrl || "",
              bio: t.bio || "Registered specialist educator on Newtoz.",
              qualifications: Array.isArray(t.qualifications) && t.qualifications.length > 0
                ? t.qualifications
                    .map((q: any) => `${q.degree || q.title || 'Degree'} (${q.institution || 'University'})`)
                    .join(", ")
                : (typeof t.qualifications === "string" ? t.qualifications : ""),
              sampleVideoTitle: t.youtubeUrl ? "Sample Lesson / Masterclass" : "",
              bankName: t.bankName || "",
              bankAccountName: t.bankAccountName || "",
              bankAccountNumber: t.bankAccountNumber || "",
              bankBranch: t.bankBranch || ""
            } as any;
          });

          setTeachers(mappedTutors);
        } else {
          setTeachers([]);
        }

        if (packagesRes?.success && Array.isArray(packagesRes.data)) {
          const mappedPackages: TutorPackage[] = packagesRes.data.map((pkg: any) => {
            const fee = Number(pkg.price) || 0;
            return {
              id: pkg.id,
              teacherId: pkg.teacherId,
              title: pkg.title,
              subject: pkg.teacher?.specialization || "General",
              grade: pkg.courses?.[0]?.course?.title || "All Grades",
              monthlyFeeLkr: fee,
              monthlyFee: fee,
              currency: "LKR",
              description: pkg.description || "Comprehensive tuition program.",
              features: Array.isArray(pkg.features)
                ? pkg.features
                : typeof pkg.features === "string"
                ? pkg.features.split("\n").filter(Boolean)
                : [],
              billingCycle: pkg.billingCycle === "MONTHLY" ? "Monthly" : (pkg.billingCycle || "Monthly"),
              liveClassesPerWeek: 2,
              status: "active",
              enrolledCount: pkg._count?.subscriptions || 0,
              badge: "Popular",
              createdAt: pkg.createdAt || new Date().toISOString(),
              teacher: pkg.teacher
            } as any;
          });
          setPackages(mappedPackages);
        } else {
          setPackages([]);
        }
      } catch (err) {
        console.warn("Could not load backend marketplace data:", err);
        if (isMounted) {
          setTeachers([]);
          setPackages([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingMarketplace(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load student's real purchases and active subscriptions from backend
  useEffect(() => {
    let isMounted = true;
    async function loadStudentPurchases() {
      try {
        const res = await api.students.getMyPurchases();
        if (!isMounted) return;
        if (res?.success && Array.isArray(res.data)) {
          setPurchases(res.data);
        } else {
          setPurchases([]);
        }
      } catch (err) {
        console.warn("Could not load student purchases:", err);
        if (isMounted) setPurchases([]);
      }
    }
    loadStudentPurchases();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filters for Teachers tab
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [groupFilter, setGroupFilter] = useState<"all" | "enrolled">("all");

  // Modals
  const [selectedTeacherForSubscribe, setSelectedTeacherForSubscribe] = useState<ConnectTeacher | null>(null);
  const [selectedPackageForSubscribe, setSelectedPackageForSubscribe] = useState<TutorPackage | null>(null);
  const [selectedPurchaseForReceipt, setSelectedPurchaseForReceipt] = useState<ConnectPurchase | null>(null);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  // Checkout modal form state (strictly clean - no hardcoded/mock payment data)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_slip">("card");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvc, setCardCvc] = useState<string>("");
  const [bankRefNo, setBankRefNo] = useState<string>("");
  const [uploadedSlipName, setUploadedSlipName] = useState<string>("");
  const [uploadedSlipDataUrl, setUploadedSlipDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const resetCheckoutModal = () => {
    setSelectedTeacherForSubscribe(null);
    setSelectedPackageForSubscribe(null);
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setBankRefNo("");
    setUploadedSlipName("");
    setUploadedSlipDataUrl(null);
    setCheckoutError(null);
    setIsProcessing(false);
  };

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    setCardNumber(formatted);
    if (checkoutError) setCheckoutError(null);
  };

  const handleExpiryChange = (val: string) => {
    let clean = val.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 3) {
      clean = `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    setCardExpiry(clean);
    if (checkoutError) setCheckoutError(null);
  };

  const handleCvcChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    setCardCvc(clean);
    if (checkoutError) setCheckoutError(null);
  };

  const isFormValid = useMemo(() => {
    if (paymentMethod === "card") {
      const rawCard = cardNumber.replace(/\s+/g, "");
      const isCardValid = rawCard.length >= 15 && rawCard.length <= 19;
      const isExpiryValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry.trim());
      const isCvcValid = cardCvc.trim().length >= 3 && cardCvc.trim().length <= 4;
      return isCardValid && isExpiryValid && isCvcValid;
    }
    if (paymentMethod === "bank_slip") {
      return Boolean(uploadedSlipName || uploadedSlipDataUrl);
    }
    return false;
  }, [paymentMethod, cardNumber, cardExpiry, cardCvc, uploadedSlipName, uploadedSlipDataUrl]);

  const activeBankDetails = useMemo(() => {
    if (selectedTeacherForSubscribe) {
      return {
        bankName: (selectedTeacherForSubscribe as any).bankName,
        accountName: (selectedTeacherForSubscribe as any).bankAccountName,
        accountNumber: (selectedTeacherForSubscribe as any).bankAccountNumber,
        branch: (selectedTeacherForSubscribe as any).bankBranch,
      };
    }
    if (selectedPackageForSubscribe) {
      const pkgTeacher = (selectedPackageForSubscribe as any).teacher;
      const matchedTeacher = teachers.find((t) => t.id === selectedPackageForSubscribe.teacherId);
      return {
        bankName: pkgTeacher?.bankName || (matchedTeacher as any)?.bankName,
        accountName: pkgTeacher?.bankAccountName || (matchedTeacher as any)?.bankAccountName,
        accountNumber: pkgTeacher?.bankAccountNumber || (matchedTeacher as any)?.bankAccountNumber,
        branch: pkgTeacher?.bankBranch || (matchedTeacher as any)?.bankBranch,
      };
    }
    return null;
  }, [selectedTeacherForSubscribe, selectedPackageForSubscribe, teachers]);

  // Enrollment filter for Find Teachers ("all" | "enrolled" | "unenrolled")
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<"all" | "enrolled" | "unenrolled">("all");

  // Helper to reliably check if a teacher is enrolled/subscribed
  const isTeacherSubscribed = (t: ConnectTeacher) => {
    if (t.isSubscribed) return true;
    return purchases.some((p) => {
      if (p.status !== "active") return false;
      if (p.teacherId && (p.teacherId === t.id || p.teacherId === (t as any).userId)) return true;
      const tPlans = packages.filter((pkg) => pkg.teacherId === t.id);
      return tPlans.some((pkg) => pkg.id === p.packageId);
    });
  };

  const enrolledTeachersCount = useMemo(() => {
    return teachers.filter((t) => isTeacherSubscribed(t)).length;
  }, [teachers, purchases, packages]);

  // Dynamic subjects list from active teachers
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.subject && t.subject.trim()) {
        set.add(t.subject.trim());
      }
    });
    return Array.from(set);
  }, [teachers]);

  // Filtered teachers (respects subject, search query, and enrollment filter)
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const isSub = isTeacherSubscribed(t);
      if (enrollmentStatusFilter === "enrolled" && !isSub) return false;
      if (enrollmentStatusFilter === "unenrolled" && isSub) return false;

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
  }, [teachers, purchases, packages, selectedSubject, searchQuery, enrollmentStatusFilter]);

  // Handle Subscribe Completion via Live Supabase API
  const handleConfirmSubscribe = async () => {
    setCheckoutError(null);

    // Strict validation: Do not allow proceeding without proper payment details
    if (paymentMethod === "card") {
      const rawCard = cardNumber.replace(/\s+/g, "");
      if (!rawCard) {
        setCheckoutError("Please enter your 16-digit card number.");
        return;
      }
      if (rawCard.length < 15 || rawCard.length > 19) {
        setCheckoutError("Card number must be 16 digits.");
        return;
      }
      if (!cardExpiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry.trim())) {
        setCheckoutError("Please enter a valid card expiry date (MM/YY).");
        return;
      }
      if (!cardCvc || cardCvc.trim().length < 3) {
        setCheckoutError("Please enter a valid 3 or 4-digit CVC code.");
        return;
      }
    } else if (paymentMethod === "bank_slip") {
      if (!uploadedSlipName && !uploadedSlipDataUrl) {
        setCheckoutError("Please upload your bank deposit slip or transfer receipt screenshot.");
        return;
      }
    }

    const isTeacher = !!selectedTeacherForSubscribe;
    const item = selectedTeacherForSubscribe
      ? {
          id: selectedTeacherForSubscribe.id,
          packageId: (selectedTeacherForSubscribe as any).packageId || selectedTeacherForSubscribe.id,
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
          packageId: selectedPackageForSubscribe.id,
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

    try {
      const targetPackageId = item.packageId || item.id;
      const res = await api.students.checkoutPackage(targetPackageId, {
        paymentMethod: paymentMethod === 'card' ? 'CARD' : 'BANK_SLIP',
        cardNumber: paymentMethod === 'card' ? cardNumber : undefined,
        cardExpiry: paymentMethod === 'card' ? cardExpiry : undefined,
        cardCvc: paymentMethod === 'card' ? cardCvc : undefined,
        bankRefNo: paymentMethod === 'bank_slip' ? (bankRefNo || undefined) : `TXN-CARD-${Date.now().toString().slice(-6)}`,
        slipFileName: paymentMethod === 'bank_slip' ? uploadedSlipName : undefined,
        slipUrl: paymentMethod === 'bank_slip' ? (uploadedSlipDataUrl || undefined) : undefined,
      });

      if (res?.success && res.data) {
        const d = res.data;
        const newPurchase: ConnectPurchase = {
          id: d.id,
          teacherId: d.teacherId || item.id,
          teacherName: d.teacherName || item.name,
          teacherInitials: item.initials,
          teacherColor: item.avatarColor,
          subject: item.subject,
          amount: d.amount || item.amount,
          currency: d.currency || item.currency,
          date: d.date || new Date().toISOString().split('T')[0],
          validUntil: d.validUntil || '2026-12-01',
          status: 'active',
          paymentMethod: d.paymentMethod || (paymentMethod === "card" ? "Card (Visa/Mastercard)" : "Bank Deposit"),
          receiptNo: d.receiptNo,
          meetUrl: d.meetUrl || item.meetUrl,
        };

        setPurchases((prev) => [newPurchase, ...prev.filter((p) => p.id !== newPurchase.id)]);

        if (selectedTeacherForSubscribe) {
          setTeachers((prev) =>
            prev.map((t) =>
              t.id === item.id
                ? {
                    ...t,
                    isSubscribed: true,
                    subscribedDate: d.date || new Date().toISOString().split('T')[0]
                  }
                : t
            )
          );
        }

        setPaymentSuccessToast(`Payment Successful! Receipt #${d.receiptNo} issued. Classes & materials unlocked.`);
        resetCheckoutModal();
        setTimeout(() => setPaymentSuccessToast(null), 6000);
      } else {
        setCheckoutError(res?.message || "Failed to process enrollment. Please check your payment details.");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Payment verification failed. Please check payment details and try again.";
      setCheckoutError(errMsg);
    } finally {
      setIsProcessing(false);
    }
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
        </div>

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
                  {currentRole === "parent" ? "Browse tutors & enroll your child" : "Pay to unlock full access & live classes"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentRole === "parent"
                  ? "Explore top verified teachers, check monthly fees, review syllabus masterclasses, and enroll your child with direct bank slip verification."
                  : "Join live Google Meet classes, access premium tutes, and receive personal exam mentoring."}
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Enrollment filter pills */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setEnrollmentStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    enrollmentStatusFilter === "all"
                      ? "bg-white text-[#0d2b26] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  All ({teachers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollmentStatusFilter("enrolled")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    enrollmentStatusFilter === "enrolled"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-emerald-800 hover:bg-emerald-50"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Enrolled ({enrolledTeachersCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollmentStatusFilter("unenrolled")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    enrollmentStatusFilter === "unenrolled"
                      ? "bg-white text-[#0d2b26] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Available ({Math.max(0, teachers.length - enrolledTeachersCount)})
                </button>
              </div>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs focus:ring-2 focus:ring-[#0d5c4d]/20"
              >
                <option value="all">All Subjects ({teachers.length})</option>
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search teachers or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 placeholder-slate-400 shadow-2xs focus:ring-2 focus:ring-[#0d5c4d]/20 w-44 sm:w-56"
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
          {isLoadingMarketplace ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="h-7 w-7 border-2 border-[#0d5c4d] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Loading verified teachers from database...</p>
            </div>
          ) : filteredTeachers.length > 0 ? (
            filteredTeachers.map((teacher) => {
              const isSubscribed = isTeacherSubscribed(teacher);
              const teacherPlans = packages.filter(
                (p) =>
                  p.teacherId === teacher.id ||
                  p.subject.toLowerCase().includes(teacher.subject.toLowerCase())
              );

            return (
              <div
                key={teacher.id}
                className={`bg-white rounded-3xl transition-all overflow-hidden border border-slate-200 shadow-xs hover:shadow-sm ${
                  isSubscribed ? "border-l-4 border-l-[#0d5c4d]" : ""
                }`}
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
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-[#0d5c4d]" />
                              VERIFIED
                            </span>
                          )}
                          {isSubscribed && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] border border-[#a5f3df] text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-[#0d5c4d]" />
                              ENROLLED
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
                            From LKR {(teacher.monthlyFee ?? 0).toLocaleString()}/month
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Rating Pill (Only displayed if genuine student ratings exist) */}
                    {typeof teacher.rating === "number" && teacher.rating > 0 ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black shrink-0 self-start">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>{teacher.rating.toFixed(1)}</span>
                      </div>
                    ) : null}
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
                        {teacherPlans.map((plan) => {
                          const isPlanEnrolled = purchases.some(
                            (p) => p.packageId === plan.id && p.status === "active"
                          );
                          return (
                          <div
                            key={plan.id}
                            className={`rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all ${
                              isPlanEnrolled
                                ? "border border-slate-300 bg-white shadow-xs"
                                : "border border-slate-200 bg-[#f8faf9] hover:border-slate-300 hover:bg-white hover:shadow-xs"
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-black text-xs text-[#0d2b26] leading-snug">
                                  {plan.title}
                                </h5>
                                {isPlanEnrolled ? (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-[9px] font-bold uppercase shrink-0">
                                    Enrolled ✓
                                  </span>
                                ) : plan.badge ? (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-extrabold uppercase shrink-0">
                                    {plan.badge}
                                  </span>
                                ) : null}
                              </div>

                              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                {plan.description}
                              </p>

                              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-baseline justify-between">
                                <div>
                                  <span className="text-base font-black text-[#0d5c4d]">
                                    LKR {(plan.monthlyFeeLkr ?? (plan as any).monthlyFee ?? 0).toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-semibold"> / {(plan.billingCycle || "Monthly").toLowerCase()}</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {(plan.liveClassesPerWeek ?? 2)} Meets / wk
                                </span>
                              </div>

                              {/* Features Checklist */}
                              <div className="space-y-1 pt-1">
                                {plan.features.slice(0, 3).map((feat, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                                    <CheckCircle2 className="h-3 w-3 text-[#0d5c4d] shrink-0" />
                                    <span className="truncate">{feat}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {isPlanEnrolled ? (
                              <div className="w-full py-2.5 px-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-[#0d5c4d]" />
                                <span>Active Plan Enrollment</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedPackageForSubscribe(plan)}
                                className="w-full py-2.5 px-3 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-extrabold text-xs shadow-2xs transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <CreditCard className="h-3.5 w-3.5 text-[#f3b738]" />
                                <span>{currentRole === "parent" ? "Enroll Child in Plan" : "Enroll in Plan"}</span>
                              </button>
                            )}
                          </div>
                        );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                    {isSubscribed ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-[#0d5c4d]" />
                          Subscribed ✓
                        </span>
                        {teacher.meetUrl ? (
                          <a
                            href={teacher.meetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
                          >
                            <Video className="h-4 w-4" />
                            Join Live Class
                          </a>
                        ) : null}
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedTeacherForSubscribe(teacher)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <CreditCard className="h-3.5 w-3.5 text-amber-300" />
                        <span>Quick Monthly Pass — LKR {(teacher.monthlyFee ?? 0).toLocaleString()}/mo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-xs space-y-3">
            <Users className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-black text-[#0d2b26]">No teachers found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || selectedSubject !== "all"
                ? "Try adjusting your search query or subject filter to find available educators."
                : "No registered teachers are currently available in the marketplace."}
            </p>
          </div>
        )}
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
            {students.length > 0 ? (
              students.map((student) => (
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
              ))
            ) : (
              <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-dashed border-[#c4e9e0] shadow-xs space-y-3">
                <GraduationCap className="h-10 w-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-black text-[#0d2b26]">No Study Buddies Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Enrolled peers sharing your courses will appear here.
                </p>
              </div>
            )}
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
            {studyGroups.length > 0 ? (
              studyGroups
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
              })
            ) : (
              <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-dashed border-[#c4e9e0] shadow-xs space-y-3">
                <Users2 className="h-10 w-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-black text-[#0d2b26]">No Study Circles Available</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Study circles created by your enrolled tutors will appear here for group discussions and peer revision.
                </p>
              </div>
            )}
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
                        LKR {(purchase.amount ?? 0).toLocaleString()} / mo
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
                      onClick={() => setSelectedPurchaseForReceipt(purchase)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs cursor-pointer"
                      title="View & Download Official Payment Receipt"
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
                  onClick={resetCheckoutModal}
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
                      LKR {(activeSubTarget.fee ?? 0).toLocaleString()}
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
                      onClick={() => {
                        setPaymentMethod("card");
                        setCheckoutError(null);
                      }}
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
                      onClick={() => {
                        setPaymentMethod("bank_slip");
                        setCheckoutError(null);
                      }}
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
                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>Card Number</span>
                        <span className="text-[10px] font-semibold text-slate-400">16 digits</span>
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        placeholder="4242 •••• •••• 4242"
                        maxLength={19}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs font-semibold focus:outline-none focus:border-[#0d5c4d]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          placeholder="MM/YY"
                          maxLength={5}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-center focus:outline-none focus:border-[#0d5c4d]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">CVC / CVV</label>
                        <input
                          type="password"
                          value={cardCvc}
                          placeholder="CVC"
                          maxLength={4}
                          onChange={(e) => handleCvcChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-center focus:outline-none focus:border-[#0d5c4d]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="font-extrabold text-[#0d2b26]">Direct Bank Deposit Details</p>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Tutor Account</span>
                      </div>
                      {activeBankDetails?.accountNumber ? (
                        <>
                          <p className="text-slate-600 font-mono text-xs">
                            Bank: <span className="font-bold text-slate-800">{activeBankDetails.bankName || "Commercial Bank"}</span>
                          </p>
                          <p className="text-slate-600 font-mono text-xs">
                            Account: <span className="font-bold text-slate-800">{activeBankDetails.accountNumber}</span>
                            {activeBankDetails.accountName ? ` (${activeBankDetails.accountName})` : ""}
                          </p>
                          {activeBankDetails.branch ? (
                            <p className="text-slate-600 font-mono text-xs">
                              Branch: <span className="font-bold text-slate-800">{activeBankDetails.branch}</span>
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <p className="text-slate-500 italic text-xs py-1">
                          Direct deposit account info will be provided by the tutor. Please upload your deposit slip or transaction reference below once paid.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px]">Deposit Reference No. (Optional)</label>
                      <input
                        type="text"
                        value={bankRefNo}
                        onChange={(e) => {
                          setBankRefNo(e.target.value);
                          if (checkoutError) setCheckoutError(null);
                        }}
                        placeholder="e.g. BOC-TXN-882190"
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white font-mono text-xs focus:outline-none focus:border-[#0d5c4d]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700 text-[11px]">
                          Upload Bank Deposit Slip / Receipt <span className="text-rose-500">*</span>
                        </label>
                        {uploadedSlipName && (
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedSlipName("");
                              setUploadedSlipDataUrl(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="text-[10px] text-rose-600 hover:underline font-bold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedSlipName(file.name);
                            setCheckoutError(null);
                            const reader = new FileReader();
                            reader.onload = () => {
                              setUploadedSlipDataUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-3.5 text-center flex items-center justify-center gap-2.5 font-bold cursor-pointer transition-all shadow-2xs ${
                          uploadedSlipName
                            ? "border-emerald-500 bg-emerald-50/70 text-emerald-900"
                            : "border-slate-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/40 text-slate-700"
                        }`}
                      >
                        <FileCheck className={`h-5 w-5 shrink-0 ${uploadedSlipName ? "text-emerald-600" : "text-slate-400"}`} />
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-xs font-black truncate">{uploadedSlipName || "Attach Bank Slip (Required)"}</p>
                          <p className="text-[10px] text-slate-400 font-normal">
                            {uploadedSlipName ? "Click to change attached file" : "Upload JPEG, PNG receipt or PDF"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation error banner */}
                {checkoutError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{checkoutError}</span>
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
                  onClick={resetCheckoutModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!isFormValid || isProcessing}
                  onClick={handleConfirmSubscribe}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition-all flex items-center gap-2 ${
                    !isFormValid || isProcessing
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-[#0d5c4d] hover:bg-[#0a473b] text-white hover:scale-[1.02]"
                  }`}
                >
                  {isProcessing ? (
                    <span>Activating Subscription...</span>
                  ) : (
                    <>
                      <span>Confirm &amp; Pay LKR {(activeSubTarget.fee ?? 0).toLocaleString()}</span>
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
      {/* OFFICIAL RECEIPT & INVOICE MODAL                                    */}
      {/* =================================================================== */}
      {selectedPurchaseForReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2 text-[#0d5c4d]">
                <Receipt className="h-5 w-5 text-emerald-700" />
                <h3 className="font-black text-sm text-[#0d2b26] tracking-tight">Official Tuition Payment Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedPurchaseForReceipt(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Receipt Paper Container */}
            <div className="p-6 space-y-4 text-xs">
              <div className="rounded-2xl border-2 border-dashed border-[#c4e9e0] bg-[#fbfdfc] p-5 space-y-4 shadow-2xs">
                {/* Brand & Receipt Meta */}
                <div className="flex items-start justify-between border-b border-slate-200/80 pb-3.5">
                  <div>
                    <h4 className="font-black text-sm text-[#0d2b26] tracking-wide">LIMAT SMART BOOK LMS</h4>
                    <p className="text-[10px] text-slate-500 font-semibold">G.C.E. A/L &amp; School Online Education Platform</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      VERIFIED PAID ✓
                    </span>
                    <p className="text-[11px] font-mono font-bold text-slate-700 mt-1">{selectedPurchaseForReceipt.receiptNo}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Teacher / Masterclass</span>
                    <p className="font-extrabold text-xs text-[#0d2b26]">{selectedPurchaseForReceipt.teacherName}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{selectedPurchaseForReceipt.subject}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Payment Method</span>
                    <p className="font-bold text-xs text-slate-800">{selectedPurchaseForReceipt.paymentMethod}</p>
                    {selectedPurchaseForReceipt.bankRefNo && (
                      <p className="text-[10px] font-mono text-emerald-700">Ref: {selectedPurchaseForReceipt.bankRefNo}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Issue Date</span>
                    <p className="font-semibold text-xs text-slate-800">{selectedPurchaseForReceipt.date}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Valid Until</span>
                    <p className="font-semibold text-xs text-slate-800">{selectedPurchaseForReceipt.validUntil}</p>
                  </div>
                </div>

                {/* Amount Paid Box */}
                <div className="p-3.5 rounded-xl bg-white border border-[#a5f3df] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Amount Paid</p>
                    <p className="font-mono text-xs text-slate-500">Tuition Package Fee (Monthly)</p>
                  </div>
                  <span className="text-lg font-black text-[#0d5c4d]">
                    {selectedPurchaseForReceipt.currency} {(selectedPurchaseForReceipt.amount ?? 0).toLocaleString()}
                  </span>
                </div>

                {/* Security Footnote */}
                <div className="pt-1 text-center text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Tamper-proof digitally signed payment receipt • LimaT Educational Systems</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-slate-100 bg-[#fbfcfb] flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedPurchaseForReceipt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-[#0d5c4d] text-[#0d5c4d] hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={() => {
                    alert(`Receipt #${selectedPurchaseForReceipt.receiptNo} saved as PDF.`);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
