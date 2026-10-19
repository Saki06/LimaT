"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useHubSettings } from "@/context/AdminContext";
import { TeacherSubscriber, TutorPackage, ConnectStudyGroup } from "@/types/lms";
import { initialTeacherSubscribers, initialTutorPackages, initialConnectStudyGroups } from "@/data/connectMockData";
import { api } from "@/lib/api";
import {
  Users,
  Users2,
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock,
  Search,
  Video,
  ExternalLink,
  Copy,
  Send,
  AlertCircle,
  FileCheck,
  Calendar,
  Sparkles,
  ChevronRight,
  Filter,
  Eye,
  X,
  Building,
  GraduationCap,
  Package,
  Plus,
  Trash2,
  Edit3,
  Check,
  Layers,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

type TeacherConnectTab = "packages" | "subscribers" | "slips";

// Comprehensive Sri Lankan curriculum subjects grouped by streams
const PREDEFINED_SUBJECT_GROUPS = [
  {
    group: "A/L Science & Mathematics",
    subjects: [
      "Combined Mathematics",
      "Higher Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Agricultural Science"
    ]
  },
  {
    group: "A/L Commerce",
    subjects: [
      "Accounting",
      "Business Studies",
      "Economics",
      "Business Statistics"
    ]
  },
  {
    group: "A/L Technology Stream",
    subjects: [
      "Engineering Technology (ET)",
      "Biosystems Technology (BST)",
      "Science for Technology (SFT)",
      "Information & Communication Technology (ICT)"
    ]
  },
  {
    group: "A/L Arts & Humanities",
    subjects: [
      "Tamil Language & Literature",
      "Sinhala Language & Literature",
      "English Literature",
      "Political Science",
      "Logic & Scientific Method",
      "History",
      "Geography",
      "Media & Communication Studies",
      "Civilization (Buddhist / Hindu / Islam / Christian)"
    ]
  },
  {
    group: "G.C.E. O/L (Grades 10 – 11)",
    subjects: [
      "O/L Mathematics",
      "O/L Science",
      "O/L English",
      "O/L Tamil Language",
      "O/L Sinhala Language",
      "O/L History",
      "O/L Commerce & Accounting",
      "O/L Information Technology (ICT)",
      "O/L Health & Physical Education",
      "O/L Geography",
      "O/L Civic Education",
      "O/L Art / Music / Drama"
    ]
  },
  {
    group: "Junior Secondary (Grades 6 – 9)",
    subjects: [
      "Grade 6–9 Mathematics",
      "Grade 6–9 Science",
      "Grade 6–9 English",
      "Grade 6–9 Tamil",
      "Grade 6–9 Sinhala",
      "Grade 6–9 History",
      "Grade 6–9 Geography",
      "Grade 6–9 ICT"
    ]
  },
  {
    group: "Primary & Scholarship (Grades 1 – 5)",
    subjects: [
      "Grade 5 Scholarship (புலமைப்பரிசில்)",
      "Primary Mathematics",
      "Primary English",
      "Primary Tamil / Sinhala",
      "Environmental Studies (சுற்றாடல்)"
    ]
  },
  {
    group: "Languages & Special Skills",
    subjects: [
      "General & Spoken English",
      "French Language",
      "Japanese Language",
      "German Language",
      "Coding & Robotics",
      "Art & Graphic Design"
    ]
  }
];

const ALL_PREDEFINED_SUBJECTS = PREDEFINED_SUBJECT_GROUPS.flatMap((g) => g.subjects);

const PREDEFINED_GRADE_GROUPS = [
  {
    group: "General / Multi-Grade",
    grades: [
      "All Grades (Grades 1 – 13)",
      "Grades 10 – 13 (Secondary & A/L)",
      "Grades 6 – 9 (Junior Secondary)",
      "Grades 1 – 5 (Primary)"
    ]
  },
  {
    group: "G.C.E. A/L",
    grades: [
      "Grade 12 & 13 (A/L)",
      "Grade 13 (A/L)",
      "Grade 12 (A/L)",
      "A/L Revision (Repeaters)",
      "2025 A/L Batch",
      "2026 A/L Batch",
      "2027 A/L Batch"
    ]
  },
  {
    group: "G.C.E. O/L",
    grades: [
      "Grade 10 & 11 (O/L)",
      "Grade 11 (O/L)",
      "Grade 10 (O/L)",
      "O/L Revision"
    ]
  },
  {
    group: "Junior Secondary & Primary",
    grades: [
      "Grade 9",
      "Grade 8",
      "Grade 7",
      "Grade 6",
      "Grade 5 Scholarship",
      "Grade 4",
      "Grade 3",
      "Grade 2",
      "Grade 1"
    ]
  }
];

const ALL_PREDEFINED_GRADES = PREDEFINED_GRADE_GROUPS.flatMap((g) => g.grades);

export function TeacherConnectView() {
  const { currentUser, t, fetchCourses, setCurrentView } = useApp();
  const hubSettings = useHubSettings();
  if (!hubSettings.enabled) {
    return <Card className="p-10 text-center"><p className="text-lg font-black text-[#0d2b26]">Tutor Connect Hub is currently disabled</p><p className="mt-2 text-sm text-slate-500">Please contact platform administration.</p></Card>;
  }

  // Active tab inside Teacher Connect Hub - Default to Packages (கட்டணப் பேக்கேஜ்கள்)
  const [activeTab, setActiveTab] = useState<TeacherConnectTab>("packages");

  const mapBackendPackageToFrontend = (pkg: any): TutorPackage => ({
    id: pkg.id,
    teacherId: pkg.teacherId || "usr_teacher_01",
    title: pkg.title,
    subject: pkg.courses?.[0]?.course?.title || "Combined Mathematics",
    grade: "Grade 12 & 13 (A/L)",
    monthlyFeeLkr: pkg.price || 2500,
    billingCycle: pkg.billingCycle === "ONE_TIME" ? "Full Syllabus Pass" : "Monthly",
    description: pkg.description || "Comprehensive tuition module with live interactive classes and revision notes.",
    features: Array.isArray(pkg.features) && pkg.features.length > 0 ? pkg.features : ["Live Interactive Classes / Week", "Recorded Video Access"],
    liveClassesPerWeek: 3,
    status: pkg.isPublished ? "active" : "draft",
    enrolledCount: pkg._count?.subscriptions || 0,
    badge: pkg.price > 0 ? "POPULAR" : "FREE",
    createdAt: new Date(pkg.createdAt).toISOString().split("T")[0],
  });

  // Packages CRUD state
  const [packages, setPackages] = useState<TutorPackage[]>(initialTutorPackages);
  const [packageSearchQuery, setPackageSearchQuery] = useState("");
  const [packageStatusFilter, setPackageStatusFilter] = useState<"all" | "active" | "draft">("all");

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const res = await api.packages.getAll();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const loaded = res.data.map(mapBackendPackageToFrontend);
          setPackages((prev) => {
            const ids = new Set(loaded.map((l: any) => l.id));
            return [...loaded, ...prev.filter((p) => !ids.has(p.id))];
          });
        }
      } catch (e) {
        console.warn("Could not load backend packages:", e);
      }
    };
    loadPackages();
  }, []);

  // Package Modals
  const [isCreatePackageModalOpen, setIsCreatePackageModalOpen] = useState(false);
  const [isEditPackageModalOpen, setIsEditPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TutorPackage | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<TutorPackage | null>(null);

  // Form State
  const initialPackageForm = {
    title: "",
    subject: "Combined Mathematics",
    grade: "Grade 12 & 13 (A/L)",
    monthlyFeeLkr: 3000,
    billingCycle: "Monthly" as "Monthly" | "Term (3 Months)" | "Full Syllabus Pass",
    description: "",
    features: [
      "Live Interactive Classes / Week (Google Meet)",
      "Recorded Video Lessons Archive with 24/7 Access",
      "Printable Theory & Exercise Tutes (PDF)",
      "Monthly Model Paper Discussion & Marking"
    ],
    liveClassesPerWeek: 3,
    status: "active" as "active" | "draft",
    badge: ""
  };
  const [packageFormData, setPackageFormData] = useState(initialPackageForm);
  const [newPerkInput, setNewPerkInput] = useState("");

  // Subscribers state
  const [subscribers, setSubscribers] = useState<TeacherSubscriber[]>(initialTeacherSubscribers);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending_slip" | "expired">("all");

  // Selected slip for approval modal
  const [selectedSlipSub, setSelectedSlipSub] = useState<TeacherSubscriber | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchQuery =
        !packageSearchQuery.trim() ||
        pkg.title.toLowerCase().includes(packageSearchQuery.toLowerCase()) ||
        pkg.subject.toLowerCase().includes(packageSearchQuery.toLowerCase()) ||
        pkg.grade.toLowerCase().includes(packageSearchQuery.toLowerCase());
      const matchStatus = packageStatusFilter === "all" || pkg.status === packageStatusFilter;
      return matchQuery && matchStatus;
    });
  }, [packages, packageSearchQuery, packageStatusFilter]);

  // Total metrics
  const totalPackageRevenue = useMemo(() => {
    return packages.reduce((acc, p) => acc + (p.status === "active" ? p.enrolledCount * p.monthlyFeeLkr : 0), 0);
  }, [packages]);

  const totalEnrolledStudents = useMemo(() => {
    return packages.reduce((acc, p) => acc + (p.status === "active" ? p.enrolledCount : 0), 0);
  }, [packages]);

  // Package CRUD Handlers
  const handleOpenCreatePackage = () => {
    setPackageFormData({
      ...initialPackageForm,
      title: "",
      description: ""
    });
    setNewPerkInput("");
    setIsCreatePackageModalOpen(true);
  };

  const handleSaveCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageFormData.title.trim()) {
      showToast("Please enter a package title!");
      return;
    }

    try {
      const res = await api.packages.create({
        title: packageFormData.title.trim(),
        description: packageFormData.description.trim(),
        price: Number(packageFormData.monthlyFeeLkr) || 2500,
        billingCycle: packageFormData.billingCycle === "Full Syllabus Pass" ? "ONE_TIME" : "MONTHLY",
        durationDays: packageFormData.billingCycle === "Term (3 Months)" ? 90 : packageFormData.billingCycle === "Full Syllabus Pass" ? 365 : 30,
        features: packageFormData.features.length > 0 ? packageFormData.features : ["Live Interactive Classes / Week", "Recorded Video Access"],
        isPublished: packageFormData.status === "active",
      });

      if (res.success && res.data) {
        const newPkg = mapBackendPackageToFrontend(res.data);
        setPackages((prev) => [newPkg, ...prev]);
        setIsCreatePackageModalOpen(false);
        showToast(`Package "${newPkg.title}" saved! Subject automatically available in Syllabus Builder.`);
        if (fetchCourses) fetchCourses();
        return;
      }
    } catch (err) {
      console.warn("Backend error creating package, falling back to local state:", err);
    }

    const newPkg: TutorPackage = {
      id: `pkg_${Date.now()}`,
      teacherId: currentUser.id || "usr_teacher_01",
      title: packageFormData.title.trim(),
      subject: packageFormData.subject,
      grade: packageFormData.grade,
      monthlyFeeLkr: Number(packageFormData.monthlyFeeLkr) || 2500,
      billingCycle: packageFormData.billingCycle,
      description: packageFormData.description.trim() || "Comprehensive tuition module with live interactive classes and revision notes.",
      features: packageFormData.features.length > 0 ? packageFormData.features : ["Live Interactive Classes / Week", "Recorded Video Access"],
      liveClassesPerWeek: Number(packageFormData.liveClassesPerWeek) || 2,
      status: packageFormData.status,
      enrolledCount: 0,
      badge: packageFormData.badge.trim() || undefined,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setPackages((prev) => [newPkg, ...prev]);
    setIsCreatePackageModalOpen(false);
    showToast(`Package "${newPkg.title}" created successfully!`);
  };

  const handleOpenEditPackage = (pkg: TutorPackage) => {
    setEditingPackage(pkg);
    setPackageFormData({
      title: pkg.title,
      subject: pkg.subject,
      grade: pkg.grade,
      monthlyFeeLkr: pkg.monthlyFeeLkr,
      billingCycle: pkg.billingCycle,
      description: pkg.description,
      features: [...pkg.features],
      liveClassesPerWeek: pkg.liveClassesPerWeek,
      status: pkg.status === "archived" ? "draft" : pkg.status,
      badge: pkg.badge || ""
    });
    setNewPerkInput("");
    setIsEditPackageModalOpen(true);
  };

  const handleSaveEditPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    if (!packageFormData.title.trim()) {
      showToast("Please enter a package title!");
      return;
    }

    try {
      if (!editingPackage.id.startsWith("pkg_")) {
        await api.packages.update(editingPackage.id, {
          title: packageFormData.title.trim(),
          description: packageFormData.description.trim(),
          price: Number(packageFormData.monthlyFeeLkr),
          isPublished: packageFormData.status === "active",
          features: packageFormData.features,
        });
      }
    } catch (err) {
      console.warn("Backend error updating package:", err);
    }

    setPackages((prev) =>
      prev.map((p) =>
        p.id === editingPackage.id
          ? {
              ...p,
              title: packageFormData.title.trim(),
              subject: packageFormData.subject,
              grade: packageFormData.grade,
              monthlyFeeLkr: Number(packageFormData.monthlyFeeLkr) || p.monthlyFeeLkr,
              billingCycle: packageFormData.billingCycle,
              description: packageFormData.description.trim(),
              features: packageFormData.features,
              liveClassesPerWeek: Number(packageFormData.liveClassesPerWeek) || p.liveClassesPerWeek,
              status: packageFormData.status,
              badge: packageFormData.badge.trim() || undefined
            }
          : p
      )
    );
    setIsEditPackageModalOpen(false);
    setEditingPackage(null);
    showToast(`Package "${packageFormData.title}" updated successfully!`);
  };

  const handleOpenDeletePackage = (pkg: TutorPackage) => {
    setDeletingPackage(pkg);
  };

  const handleConfirmDeletePackage = async () => {
    if (!deletingPackage) return;
    try {
      if (!deletingPackage.id.startsWith("pkg_")) {
        await api.packages.delete(deletingPackage.id);
      }
    } catch (err) {
      console.warn("Backend error deleting package:", err);
    }
    setPackages((prev) => prev.filter((p) => p.id !== deletingPackage.id));
    showToast(`Package "${deletingPackage.title}" deleted.`);
    setDeletingPackage(null);
  };

  const handleTogglePackageStatus = (pkgId: string) => {
    setPackages((prev) =>
      prev.map((p) => {
        if (p.id === pkgId) {
          const nextStatus = p.status === "active" ? "draft" : "active";
          showToast(`Package "${p.title}" status changed to ${nextStatus.toUpperCase()}`);
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  const handleDuplicatePackage = (pkg: TutorPackage) => {
    const clone: TutorPackage = {
      ...pkg,
      id: `pkg_${Date.now()}`,
      title: `${pkg.title} (Copy)`,
      status: "draft",
      enrolledCount: 0,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setPackages((prev) => [clone, ...prev]);
    showToast(`Created duplicate draft of "${pkg.title}"`);
  };

  const handleAddPerk = () => {
    if (!newPerkInput.trim()) return;
    setPackageFormData((prev) => ({
      ...prev,
      features: [...prev.features, newPerkInput.trim()]
    }));
    setNewPerkInput("");
  };

  const handleRemovePerk = (indexToRemove: number) => {
    setPackageFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Approve bank slip
  const handleApproveSlip = (subId: string) => {
    setSubscribers((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: "active", validUntil: "2026-11-05" } : s))
    );
    const sub = subscribers.find((s) => s.id === subId);
    setSelectedSlipSub(null);
    showToast(`Bank Deposit Slip Approved! ${sub?.studentName || "Student"} subscription is now ACTIVE.`);
  };

  // Filtered subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      const matchQuery =
        !searchQuery.trim() ||
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.grade.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [subscribers, searchQuery, statusFilter]);

  // Pending slips count
  const pendingSlips = subscribers.filter((s) => s.status === "pending_slip");

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#0d5c4d] text-white shadow-2xl flex items-center gap-3 border border-[#a5f3df] animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-5 w-5 text-[#a5f3df] shrink-0" />
          <div className="text-xs">
            <p className="font-extrabold text-sm">Success</p>
            <p className="text-slate-100">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/20 rounded-lg text-white/80 cursor-pointer ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Banner: Teacher Faculty Connect Studio */}
      <Card className="border-[#c4e9e0] bg-gradient-to-br from-[#f8fbf9] via-white to-[#ecf8f5] shadow-2xs overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#0d5c4d] text-white text-[11px] font-bold uppercase tracking-wider">
                  Teaching Studio &bull; Connect Hub
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  A/L Combined Mathematics Tuition Masterclass
                </span>
              </div>
              <h1 className="text-2xl font-black text-[#0d2b26]">
                Subscribers &amp; Tuition Hub
              </h1>
              <p className="text-xs text-slate-600 max-w-2xl">
                Manage student tuition packages, track active enrolled students, and verify bank deposit payment slips.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#e6ece8] bg-white shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Active Subscribers</p>
              <p className="text-2xl font-black text-[#0d2b26] mt-1">142 Students</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">+14 new this month</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e6ece8] bg-white shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Monthly Tuition Revenue</p>
              <p className="text-2xl font-black text-[#0d5c4d] mt-1">LKR 355,000</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">LKR 2,500 / student</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border shadow-2xs ${pendingSlips.length > 0 ? "border-amber-200 bg-amber-50/40" : "border-[#e6ece8] bg-white"}`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Pending Bank Slips</p>
              <p className="text-2xl font-black text-[#b47a16] mt-1">
                {pendingSlips.length} Slips
              </p>
              <button
                onClick={() => setActiveTab("slips")}
                className="text-[10px] text-[#b47a16] hover:underline font-bold mt-0.5 cursor-pointer block"
              >
                Review &amp; approve &rarr;
              </button>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#fef7e6] text-[#b47a16] flex items-center justify-center">
              <Receipt className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e6ece8] bg-white shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Live Attendance Rate</p>
              <p className="text-2xl font-black text-[#0d2b26] mt-1">94.8%</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">High engagement</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Connect Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#c4e9e0] shadow-xs">
        <button
          onClick={() => setActiveTab("packages")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "packages"
              ? "bg-[#0d5c4d] text-white shadow-xs font-black"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Fee Packages (கட்டணப் பேக்கேஜ்கள்)</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === "packages" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
          }`}>
            {packages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("subscribers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "subscribers"
              ? "bg-[#0d5c4d] text-white shadow-xs font-black"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Subscribed Students</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === "subscribers" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
          }`}>
            {filteredSubscribers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("slips")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "slips"
              ? "bg-[#0d5c4d] text-white shadow-xs font-black"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Bank Slip Approvals</span>
          {pendingSlips.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fef7e6] text-[#b47a16]">
              {pendingSlips.length} Pending
            </span>
          )}
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 0: TUITION FEE PACKAGES CRUD (கட்டணப் பேக்கேஜ்கள் மேலாண்மை)     */}
      {/* =================================================================== */}
      {activeTab === "packages" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#e6ece8] shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#0d2b26]">Tuition &amp; Course Fee Packages</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] text-[10px] font-extrabold border border-[#c4e9e0]">
                  CRUD Studio
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure student monthly subscription tiers, pricing, live class schedules, and included perks.
              </p>
            </div>

            <Button
              onClick={handleOpenCreatePackage}
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Package</span>
            </Button>
          </div>

          {/* Quick Metrics & Search Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#e6ece8] shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search packages by title, subject, or grade..."
                value={packageSearchQuery}
                onChange={(e) => setPackageSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Status:
              </span>
              <select
                value={packageStatusFilter}
                onChange={(e) => setPackageStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="all">All Packages ({packages.length})</option>
                <option value="active">Active Only ({packages.filter((p) => p.status === "active").length})</option>
                <option value="draft">Drafts ({packages.filter((p) => p.status === "draft").length})</option>
              </select>

              <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs font-bold text-slate-600">
                <span>Revenue:</span>
                <span className="text-[#0d5c4d] font-black">LKR {totalPackageRevenue.toLocaleString()} / mo</span>
              </div>
            </div>
          </div>

          {/* Packages Grid */}
          {filteredPackages.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-white/60">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No Packages Found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No fee packages matching your filter criteria. Create a new package to start accepting student subscriptions.
              </p>
              <Button
                onClick={handleOpenCreatePackage}
                className="mt-4 bg-[#0d5c4d] text-white text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Create Package
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPackages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className="border-[#e6ece8] bg-white hover:border-[#0d5c4d]/50 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <CardHeader className="p-5 pb-3 border-b border-slate-100/80 bg-gradient-to-b from-[#f8faf9] to-white">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {pkg.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-[#fef7e6] text-[#b47a16] border border-[#fde4af] text-[10px] font-black uppercase tracking-wider">
                            ★ {pkg.badge}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            pkg.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {pkg.status}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        {pkg.createdAt}
                      </span>
                    </div>

                    <CardTitle className="text-base font-extrabold text-[#0d2b26] group-hover:text-[#0d5c4d] transition-colors leading-snug">
                      {pkg.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      {pkg.subject} &bull; <span className="text-slate-600">{pkg.grade}</span>
                    </p>
                  </CardHeader>

                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    {/* Price Banner */}
                    <div className="p-3.5 rounded-2xl bg-[#ecf8f5]/70 border border-[#c4e9e0] flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-[#0d5c4d] font-bold block">Tuition Fee</span>
                        <span className="text-2xl font-black text-[#0d5c4d] tracking-tight">
                          LKR {pkg.monthlyFeeLkr.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-white/80 px-2 py-1 rounded-lg border border-[#c4e9e0]">
                        {pkg.billingCycle}
                      </span>
                    </div>

                    {/* Live Classes Frequency */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      <Video className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                      <span>{pkg.liveClassesPerWeek} Live Interactive Lectures / Week</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>

                    {/* Features Checklist */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Included Student Perks:
                      </p>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {pkg.features.slice(0, 4).map((perk, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{perk}</span>
                          </li>
                        ))}
                        {pkg.features.length > 4 && (
                          <li className="text-[11px] text-[#0d5c4d] font-bold pl-5">
                            +{pkg.features.length - 4} more benefits
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Bottom Enrollment & Revenue Stats */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Users className="h-3.5 w-3.5 text-[#0d5c4d]" />
                        <span>{pkg.enrolledCount} Subscribed</span>
                      </div>
                      <div className="font-mono font-bold text-[#0d5c4d]">
                        LKR {(pkg.enrolledCount * pkg.monthlyFeeLkr).toLocaleString()} / mo
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="pt-2 flex items-center gap-1.5 border-t border-slate-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditPackage(pkg)}
                        className="flex-1 border-slate-200 hover:border-[#0d5c4d] hover:bg-[#ecf8f5] text-[#0d5c4d] text-xs font-bold cursor-pointer"
                        title="Edit Package Details"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicatePackage(pkg)}
                        className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                        title="Duplicate as Draft"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTogglePackageStatus(pkg.id)}
                        className={`text-xs font-bold cursor-pointer border ${
                          pkg.status === "active"
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                        title={pkg.status === "active" ? "Switch to Draft" : "Publish to Students"}
                      >
                        {pkg.status === "active" ? "Pause" : "Publish"}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDeletePackage(pkg)}
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold cursor-pointer"
                        title="Delete Package"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}



      {/* =================================================================== */}
      {/* TAB 2: SUBSCRIBED STUDENTS LIST (The Core Teacher Connect Feature)  */}
      {/* =================================================================== */}
      {activeTab === "subscribers" && (
        <div className="space-y-4">
          {/* Search & Filter Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#e6ece8] shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students by name, school, or grade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Filter:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="all">All Subscribers</option>
                <option value="active">Active (Subscribed)</option>
                <option value="pending_slip">Pending Bank Slip Approval</option>
                <option value="expired">Expired / Renewal Due</option>
              </select>
            </div>
          </div>

          {/* Subscribers Table Card */}
          <Card className="border-[#e6ece8] bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#f8faf9] border-b border-[#e6ece8] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="p-4 pl-6">Student Name &amp; School</th>
                    <th className="p-4">Grade &amp; Stream</th>
                    <th className="p-4">Plan &amp; Monthly Fee</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Valid Until</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef4f0]">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                        No subscribers matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#fcfdfc] transition-colors">
                        {/* Student Name */}
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-xl ${sub.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                              {sub.studentInitials}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{sub.studentName}</p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Building className="h-3 w-3 text-slate-400" />
                                {sub.school}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Grade */}
                        <td className="p-4 font-semibold text-slate-700">
                          <div>
                            <p>{sub.grade}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{sub.stream}</p>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="p-4">
                          <p className="font-bold text-[#0d2b26]">{sub.currency} {sub.amount.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{sub.planName}</p>
                        </td>

                        {/* Payment Method */}
                        <td className="p-4">
                          <span className="font-medium text-slate-600">{sub.paymentMethod}</span>
                          {sub.slipReference && (
                            <p className="text-[10px] font-mono text-slate-400">Ref: {sub.slipReference}</p>
                          )}
                        </td>

                        {/* Valid Until */}
                        <td className="p-4 font-mono text-[11px] text-slate-600">
                          {sub.validUntil}
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          {sub.status === "active" && (
                            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                            </Badge>
                          )}
                          {sub.status === "pending_slip" && (
                            <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold">
                              <Clock className="h-3 w-3 mr-1" /> Slip Pending
                            </Badge>
                          )}
                          {sub.status === "expired" && (
                            <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-bold">
                              Expired
                            </Badge>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {sub.status === "pending_slip" && (
                              <Button
                                size="sm"
                                onClick={() => setSelectedSlipSub(sub)}
                                className="bg-[#b47a16] hover:bg-[#8f6110] text-white text-[11px] font-bold h-7 px-2.5 shadow-2xs cursor-pointer"
                              >
                                Review Slip
                              </Button>
                            )}

                            {sub.status !== "pending_slip" && (
                              <span className="text-[11px] text-slate-500 font-semibold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
                                Attendance {sub.attendanceRate}%
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: BANK SLIP APPROVALS                                          */}
      {/* =================================================================== */}
      {activeTab === "slips" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Direct Bank Deposit Verification Desk
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Students who deposited fees directly into Bank of Ceylon (BOC) or Commercial Bank upload their deposit slip image or PDF. Review the transaction reference number and approve to instantly activate live class access.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSlips.map((sub) => (
              <Card key={sub.id} className="border-[#c4e9e0] bg-white shadow-2xs">
                <CardHeader className="p-5 pb-3 border-b border-[#e6ece8]">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                      Pending Approval
                    </span>
                    <span className="text-xs font-mono font-bold text-[#0d5c4d]">
                      {sub.currency} {sub.amount.toLocaleString()}
                    </span>
                  </div>
                  <CardTitle className="text-base font-black text-[#0d2b26] mt-2 flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg ${sub.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                      {sub.studentInitials}
                    </div>
                    <div>
                      <p>{sub.studentName}</p>
                      <p className="text-xs text-slate-500 font-normal">{sub.school}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3.5">
                  <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Bank / Channel:</span>
                      <span className="font-bold text-slate-800">{sub.paymentMethod}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Transaction Ref:</span>
                      <span className="font-mono font-bold text-[#0d5c4d]">{sub.slipReference || "BOC-TXN-994102"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Uploaded Slip Document:</span>
                      <span className="font-mono text-slate-700 underline flex items-center gap-1 cursor-pointer">
                        <FileCheck className="h-3 w-3 text-emerald-600" />
                        {sub.slipFileName || "Deposit_Slip.jpg"}
                      </span>
                    </div>
                  </div>

                  {/* Simulated Bank Slip Preview Card */}
                  <div className="p-3 rounded-xl border-2 border-dashed border-emerald-300 bg-[#ecf8f5]/40 text-center space-y-1">
                    <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                      Bank of Ceylon (BOC) Super Grade Branch Slip
                    </p>
                    <p className="text-xs text-slate-600 font-mono">
                      Acct: 70291048 &bull; Amount: LKR 2,500.00 &bull; Stamp Verified
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => showToast(`Deposit slip rejected for ${sub.studentName}. Notification sent to student.`)}
                      className="border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveSlip(sub.id)}
                      className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve &amp; Activate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}



      {/* Slip Modal Preview */}
      <Modal
        isOpen={!!selectedSlipSub}
        onClose={() => setSelectedSlipSub(null)}
        title="Review Bank Deposit Slip"
        description="Verify the bank transaction seal and activate the student's tuition subscription."
      >
        {selectedSlipSub && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Student Name:</span>
                <span className="font-bold text-slate-900">{selectedSlipSub.studentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">School &amp; Grade:</span>
                <span className="font-bold text-slate-700">{selectedSlipSub.school} ({selectedSlipSub.grade})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Enrolled Plan:</span>
                <span className="font-bold text-[#0d5c4d]">{selectedSlipSub.planName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Amount Paid:</span>
                <span className="font-mono font-bold text-slate-900">{selectedSlipSub.currency} {selectedSlipSub.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Bank Reference #:</span>
                <span className="font-mono font-bold text-emerald-800">{selectedSlipSub.slipReference || "BOC-TXN-994102"}</span>
              </div>
            </div>

            {/* Simulated Deposit Slip Mockup */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-[#c4e9e0] bg-[#ecf8f5]/50 text-center space-y-2">
              <Receipt className="h-10 w-10 text-[#0d5c4d] mx-auto" />
              <p className="text-xs font-bold text-slate-800">Bank of Ceylon Official Deposit Receipt</p>
              <p className="text-[11px] text-slate-500 font-mono">
                Branch: Colombo Super Grade &bull; Terminal ID: 88102 &bull; Stamp: VERIFIED
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedSlipSub(null)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleApproveSlip(selectedSlipSub.id)}
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve &amp; Activate
              </Button>
            </div>
          </div>
        )}
      </Modal>
      {/* =================================================================== */}
      {/* MODAL 1: CREATE NEW TUITION PACKAGE                                 */}
      {/* =================================================================== */}
      <Modal
        isOpen={isCreatePackageModalOpen}
        onClose={() => setIsCreatePackageModalOpen(false)}
        title="Create New Tuition Package"
        description="Set up a new subscription tier with custom pricing, live lectures schedule, and student perks."
      >
        <form onSubmit={handleSaveCreatePackage} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Package Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. A/L Combined Mathematics Full Masterclass"
              value={packageFormData.title}
              onChange={(e) => setPackageFormData({ ...packageFormData, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Subject</label>
                {!ALL_PREDEFINED_SUBJECTS.includes(packageFormData.subject) && (
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Custom Subject
                  </span>
                )}
              </div>
              <select
                value={ALL_PREDEFINED_SUBJECTS.includes(packageFormData.subject) ? packageFormData.subject : "__custom__"}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setPackageFormData({ ...packageFormData, subject: "" });
                  } else {
                    setPackageFormData({ ...packageFormData, subject: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              >
                {PREDEFINED_SUBJECT_GROUPS.map((grp) => (
                  <optgroup key={grp.group} label={grp.group}>
                    {grp.subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="Custom / Other">
                  <option value="__custom__">✍️ Other / Custom Subject (Type manually)...</option>
                </optgroup>
              </select>

              {(!ALL_PREDEFINED_SUBJECTS.includes(packageFormData.subject) || packageFormData.subject === "") && (
                <div className="mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input
                    type="text"
                    required
                    placeholder="Type your exact subject (e.g. History, Economics, Tamil...)"
                    value={packageFormData.subject}
                    onChange={(e) => setPackageFormData({ ...packageFormData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-amber-50/50 border-2 border-amber-300 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white shadow-2xs"
                  />
                  <p className="text-[10px] text-amber-800 mt-1">
                    💡 You can enter any custom subject or specialized course name.
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Target Grade</label>
                {!ALL_PREDEFINED_GRADES.includes(packageFormData.grade) && (
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Custom Grade
                  </span>
                )}
              </div>
              <select
                value={ALL_PREDEFINED_GRADES.includes(packageFormData.grade) ? packageFormData.grade : "__custom__"}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setPackageFormData({ ...packageFormData, grade: "" });
                  } else {
                    setPackageFormData({ ...packageFormData, grade: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              >
                {PREDEFINED_GRADE_GROUPS.map((grp) => (
                  <optgroup key={grp.group} label={grp.group}>
                    {grp.grades.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="Custom / Other">
                  <option value="__custom__">✍️ Other / Custom Grade (Type manually)...</option>
                </optgroup>
              </select>

              {(!ALL_PREDEFINED_GRADES.includes(packageFormData.grade) || packageFormData.grade === "") && (
                <div className="mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input
                    type="text"
                    required
                    placeholder="Type custom grade/batch (e.g. 2028 A/L, Open for All...)"
                    value={packageFormData.grade}
                    onChange={(e) => setPackageFormData({ ...packageFormData, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-amber-50/50 border-2 border-amber-300 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white shadow-2xs"
                  />
                  <p className="text-[10px] text-amber-800 mt-1">
                    💡 Specify your target batch, grade range, or student audience.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fee (LKR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="500"
                step="100"
                required
                value={packageFormData.monthlyFeeLkr}
                onChange={(e) => setPackageFormData({ ...packageFormData, monthlyFeeLkr: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Billing Cycle</label>
              <select
                value={packageFormData.billingCycle}
                onChange={(e) => setPackageFormData({ ...packageFormData, billingCycle: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="Monthly">Monthly</option>
                <option value="Term (3 Months)">Term (3 Months)</option>
                <option value="Full Syllabus Pass">Full Syllabus Pass</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Live Classes / Wk</label>
              <input
                type="number"
                min="1"
                max="10"
                value={packageFormData.liveClassesPerWeek}
                onChange={(e) => setPackageFormData({ ...packageFormData, liveClassesPerWeek: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Highlight Badge (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Most Popular, Best Value"
                value={packageFormData.badge}
                onChange={(e) => setPackageFormData({ ...packageFormData, badge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
              <select
                value={packageFormData.status}
                onChange={(e) => setPackageFormData({ ...packageFormData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="active">Active (Published to Marketplace)</option>
                <option value="draft">Draft (Private / Coming Soon)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Overview Description</label>
            <textarea
              rows={2}
              placeholder="Explain the curriculum depth, exam techniques, and outcomes students will receive..."
              value={packageFormData.description}
              onChange={(e) => setPackageFormData({ ...packageFormData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d] focus:bg-white resize-none"
            />
          </div>

          {/* Student Perks / Features Manager */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Included Student Perks</label>
            <div className="space-y-2 mb-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {packageFormData.features.map((perk, i) => (
                <div key={i} className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span className="line-clamp-1">{perk}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePerk(i)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                    title="Remove Perk"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add custom perk (e.g. Weekly Model Paper Discussion)..."
                value={newPerkInput}
                onChange={(e) => setNewPerkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPerk();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPerk}
                className="text-xs font-bold text-[#0d5c4d] border-[#c4e9e0] hover:bg-[#ecf8f5] cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Perk
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreatePackageModalOpen(false)}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold px-4 shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Publish Package
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 2: EDIT TUITION PACKAGE                                       */}
      {/* =================================================================== */}
      <Modal
        isOpen={isEditPackageModalOpen}
        onClose={() => {
          setIsEditPackageModalOpen(false);
          setEditingPackage(null);
        }}
        title="Edit Tuition Package"
        description="Update pricing, live lecture frequency, and curriculum perks for this tier."
      >
        <form onSubmit={handleSaveEditPackage} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Package Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={packageFormData.title}
              onChange={(e) => setPackageFormData({ ...packageFormData, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Subject</label>
                {!ALL_PREDEFINED_SUBJECTS.includes(packageFormData.subject) && (
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Custom Subject
                  </span>
                )}
              </div>
              <select
                value={ALL_PREDEFINED_SUBJECTS.includes(packageFormData.subject) ? packageFormData.subject : "__custom__"}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setPackageFormData({ ...packageFormData, subject: "" });
                  } else {
                    setPackageFormData({ ...packageFormData, subject: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              >
                {PREDEFINED_SUBJECT_GROUPS.map((grp) => (
                  <optgroup key={grp.group} label={grp.group}>
                    {grp.subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="Custom / Other">
                  <option value="__custom__">✍️ Other / Custom Subject (Type manually)...</option>
                </optgroup>
              </select>

              {(!ALL_PREDEFINED_SUBJECTS.includes(packageFormData.subject) || packageFormData.subject === "") && (
                <div className="mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input
                    type="text"
                    required
                    placeholder="Type your exact subject (e.g. History, Economics, Tamil...)"
                    value={packageFormData.subject}
                    onChange={(e) => setPackageFormData({ ...packageFormData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-amber-50/50 border-2 border-amber-300 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white shadow-2xs"
                  />
                  <p className="text-[10px] text-amber-800 mt-1">
                    💡 You can enter any custom subject or specialized course name.
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Target Grade</label>
                {!ALL_PREDEFINED_GRADES.includes(packageFormData.grade) && (
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Custom Grade
                  </span>
                )}
              </div>
              <select
                value={ALL_PREDEFINED_GRADES.includes(packageFormData.grade) ? packageFormData.grade : "__custom__"}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setPackageFormData({ ...packageFormData, grade: "" });
                  } else {
                    setPackageFormData({ ...packageFormData, grade: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              >
                {PREDEFINED_GRADE_GROUPS.map((grp) => (
                  <optgroup key={grp.group} label={grp.group}>
                    {grp.grades.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="Custom / Other">
                  <option value="__custom__">✍️ Other / Custom Grade (Type manually)...</option>
                </optgroup>
              </select>

              {(!ALL_PREDEFINED_GRADES.includes(packageFormData.grade) || packageFormData.grade === "") && (
                <div className="mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input
                    type="text"
                    required
                    placeholder="Type custom grade/batch (e.g. 2028 A/L, Open for All...)"
                    value={packageFormData.grade}
                    onChange={(e) => setPackageFormData({ ...packageFormData, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-amber-50/50 border-2 border-amber-300 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white shadow-2xs"
                  />
                  <p className="text-[10px] text-amber-800 mt-1">
                    💡 Specify your target batch, grade range, or student audience.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fee (LKR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="500"
                step="100"
                required
                value={packageFormData.monthlyFeeLkr}
                onChange={(e) => setPackageFormData({ ...packageFormData, monthlyFeeLkr: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Billing Cycle</label>
              <select
                value={packageFormData.billingCycle}
                onChange={(e) => setPackageFormData({ ...packageFormData, billingCycle: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="Monthly">Monthly</option>
                <option value="Term (3 Months)">Term (3 Months)</option>
                <option value="Full Syllabus Pass">Full Syllabus Pass</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Live Classes / Wk</label>
              <input
                type="number"
                min="1"
                max="10"
                value={packageFormData.liveClassesPerWeek}
                onChange={(e) => setPackageFormData({ ...packageFormData, liveClassesPerWeek: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Highlight Badge</label>
              <input
                type="text"
                placeholder="e.g. Most Popular"
                value={packageFormData.badge}
                onChange={(e) => setPackageFormData({ ...packageFormData, badge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={packageFormData.status}
                onChange={(e) => setPackageFormData({ ...packageFormData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="active">Active (Published)</option>
                <option value="draft">Draft (Private)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Description</label>
            <textarea
              rows={2}
              value={packageFormData.description}
              onChange={(e) => setPackageFormData({ ...packageFormData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d] focus:bg-white resize-none"
            />
          </div>

          {/* Perks list */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Included Student Perks</label>
            <div className="space-y-2 mb-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {packageFormData.features.map((perk, i) => (
                <div key={i} className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span className="line-clamp-1">{perk}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePerk(i)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add perk..."
                value={newPerkInput}
                onChange={(e) => setNewPerkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPerk();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPerk}
                className="text-xs font-bold text-[#0d5c4d] border-[#c4e9e0] hover:bg-[#ecf8f5] cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditPackageModalOpen(false);
                setEditingPackage(null);
              }}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold px-4 shadow-xs cursor-pointer"
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 3: DELETE PACKAGE CONFIRMATION                                */}
      {/* =================================================================== */}
      <Modal
        isOpen={!!deletingPackage}
        onClose={() => setDeletingPackage(null)}
        title="Delete Tuition Package"
        description="Are you sure you want to remove this tuition subscription package?"
      >
        {deletingPackage && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
              <p className="font-bold text-sm">Deleting &quot;{deletingPackage.title}&quot;</p>
              <p className="text-slate-600">
                Fee: LKR {deletingPackage.monthlyFeeLkr.toLocaleString()} / month &bull; {deletingPackage.enrolledCount} enrolled students
              </p>
              <p className="text-rose-700 font-semibold pt-1">
                Existing active students will keep access until their current billing period expires, but no new students will be able to subscribe.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingPackage(null)}
                className="text-xs font-bold"
              >
                Keep Package
              </Button>
              <Button
                onClick={handleConfirmDeletePackage}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Yes, Delete Package
              </Button>
            </div>
          </div>
        )}
      </Modal>


    </div>
  );
}
