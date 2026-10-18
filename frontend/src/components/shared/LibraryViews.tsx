"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { LibraryResource, LibraryResourceType } from "@/types/lms";
import {
  Library,
  BookOpen,
  FileText,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Download,
  Eye,
  Plus,
  Sparkles,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Share2,
  Trash2,
  Edit3,
  Globe,
  Lock,
  Users,
  Grid,
  List,
  ChevronRight,
  ChevronLeft,
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Type,
  Sun,
  Moon,
  Coffee,
  Check,
  UploadCloud,
  Layers,
  ArrowUpRight,
  GraduationCap,
  Award,
  Trophy,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

interface LibraryViewsProps {
  initialTab?: "all" | "past_papers" | "tutes" | "books" | "saved" | "manage";
}

export function LibraryViews({ initialTab = "all" }: LibraryViewsProps) {
  const {
    currentRole,
    currentUser,
    libraryResources,
    savedResourceIds,
    toggleSaveResource,
    createLibraryResource,
    updateLibraryResource,
    deleteLibraryResource,
    recordResourceView,
    recordResourceDownload
  } = useApp();

  // Active library navigation tab
  const [activeTab, setActiveTab] = useState<"all" | "past_papers" | "tutes" | "books" | "saved" | "manage">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<"all" | "book" | "tute" | "past_paper">("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMedium, setSelectedMedium] = useState<string>("all");
  const [selectedExamType, setSelectedExamType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "rating" | "title">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals & Viewers
  const [selectedBook, setSelectedBook] = useState<LibraryResource | null>(null);
  const [selectedTute, setSelectedTute] = useState<LibraryResource | null>(null);
  const [selectedPastPaper, setSelectedPastPaper] = useState<LibraryResource | null>(null);
  const [pastPaperTab, setPastPaperTab] = useState<"question_paper" | "marking_scheme" | "timed_practice">("question_paper");
  const [practiceTimeRemaining, setPracticeTimeRemaining] = useState<number>(10800); // 3 Hours
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [activeReaderResource, setActiveReaderResource] = useState<LibraryResource | null>(null);
  const [activeViewerResource, setActiveViewerResource] = useState<LibraryResource | null>(null);

  // Teacher Upload & Management states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LibraryResource | null>(null);
  const [managementFilter, setManagementFilter] = useState<"all" | "published" | "draft" | "unpublished">("all");
  const [resourceToDelete, setResourceToDelete] = useState<LibraryResource | null>(null);

  // Reader Settings State
  const [readerTheme, setReaderTheme] = useState<"light" | "sepia" | "dark">("light");
  const [readerFontSize, setReaderFontSize] = useState<"small" | "medium" | "large">("medium");
  const [readerCurrentChapterIndex, setReaderCurrentChapterIndex] = useState(0);
  const [readerIsSidebarOpen, setReaderIsSidebarOpen] = useState(true);

  // Viewer Settings State
  const [viewerCurrentPage, setViewerCurrentPage] = useState(1);
  const [viewerZoom, setViewerZoom] = useState(100);

  // Quick subjects & categories from data
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    libraryResources.forEach((r) => subs.add(r.subject));
    return Array.from(subs);
  }, [libraryResources]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    libraryResources.forEach((r) => cats.add(r.category));
    return Array.from(cats);
  }, [libraryResources]);

  // Filtered resources for Student View
  const filteredResources = useMemo(() => {
    return libraryResources.filter((resource) => {
      // Must be published for students (or drafts/unpublished can show if teacher is viewing general library)
      if (currentRole === "student" && resource.status !== "published") {
        return false;
      }

      // Exclude past papers from general Library view
      if (initialTab !== "past_papers" && resource.resourceType === "past_paper") {
        return false;
      }
      if (initialTab === "past_papers" && resource.resourceType !== "past_paper") {
        return false;
      }

      // Tab filter
      if (activeTab === "books" && resource.resourceType !== "book") return false;
      if (activeTab === "tutes" && resource.resourceType !== "tute") return false;
      if (activeTab === "past_papers" && resource.resourceType !== "past_paper") return false;
      if (activeTab === "saved" && !savedResourceIds.includes(resource.id)) return false;

      // Type filter (within All or other tabs)
      if (selectedType !== "all" && resource.resourceType !== selectedType) return false;

      // Year filter (for past papers)
      if (selectedYear !== "all" && resource.year && resource.year.toString() !== selectedYear) return false;

      // Medium filter (for past papers)
      if (selectedMedium !== "all" && resource.medium && resource.medium !== selectedMedium && resource.medium !== "Trilingual") return false;

      // Exam Type filter (for past papers)
      if (selectedExamType !== "all" && resource.examType && resource.examType !== selectedExamType) return false;

      // Subject filter
      if (selectedSubject !== "all" && resource.subject !== selectedSubject) return false;

      // Category filter
      if (selectedCategory !== "all" && resource.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = resource.title.toLowerCase().includes(q);
        const matchesAuthor = resource.author.toLowerCase().includes(q);
        const matchesSubject = resource.subject.toLowerCase().includes(q);
        const matchesDesc = resource.description.toLowerCase().includes(q);
        const matchesTopic = resource.topic?.toLowerCase().includes(q) ?? false;
        const matchesYear = resource.year ? resource.year.toString().includes(q) : false;
        if (!matchesTitle && !matchesAuthor && !matchesSubject && !matchesDesc && !matchesTopic && !matchesYear) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "popular") return b.viewsCount + b.downloadsCount - (a.viewsCount + a.downloadsCount);
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      // default: recent
      return new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime();
    });
  }, [
    libraryResources,
    currentRole,
    activeTab,
    selectedType,
    selectedYear,
    selectedMedium,
    selectedExamType,
    selectedSubject,
    selectedCategory,
    searchQuery,
    savedResourceIds,
    sortBy
  ]);

  // Featured / Popular resources for showcase
  const popularResources = useMemo(() => {
    return [...libraryResources]
      .filter((r) => r.status === "published")
      .sort((a, b) => b.viewsCount + b.downloadsCount - (a.viewsCount + a.downloadsCount))
      .slice(0, 3);
  }, [libraryResources]);

  // Filter resources uploaded by this specific teacher (or all if admin)
  const myTeacherResources = useMemo(() => {
    if (currentRole === "admin") {
      return libraryResources;
    }
    const teacherName = (currentUser.name || "Mr. Samantha Perera").toLowerCase().trim();
    return libraryResources.filter((r) => {
      const author = (r.author || "").toLowerCase().trim();
      return (
        author === teacherName ||
        author.includes(teacherName) ||
        teacherName.includes(author) ||
        (teacherName.includes("perera") && author.includes("perera"))
      );
    });
  }, [libraryResources, currentUser.name, currentRole]);

  // Teacher Management filtered resources
  const teacherManagedResources = useMemo(() => {
    return myTeacherResources.filter((r) => {
      if (managementFilter === "published") return r.status === "published";
      if (managementFilter === "draft") return r.status === "draft";
      if (managementFilter === "unpublished") return r.status === "unpublished";
      return true;
    });
  }, [myTeacherResources, managementFilter]);

  // Practice Countdown Timer Effect
  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && practiceTimeRemaining > 0) {
      interval = setInterval(() => {
        setPracticeTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (practiceTimeRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, practiceTimeRemaining]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Open Resource Details or direct reader
  const handleOpenResource = (res: LibraryResource) => {
    recordResourceView(res.id);
    if (res.resourceType === "book") {
      setSelectedBook(res);
    } else if (res.resourceType === "past_paper") {
      setSelectedPastPaper(res);
      setPastPaperTab("question_paper");
      setPracticeTimeRemaining((res.timeAllowedMinutes || 180) * 60);
      setIsTimerRunning(false);
    } else {
      setSelectedTute(res);
    }
  };

  // Launch Reader
  const handleLaunchReader = (res: LibraryResource) => {
    setSelectedBook(null);
    setSelectedTute(null);
    setSelectedPastPaper(null);
    setActiveReaderResource(res);
    setReaderCurrentChapterIndex(0);
  };

  // Launch Viewer
  const handleLaunchViewer = (res: LibraryResource) => {
    setSelectedBook(null);
    setSelectedTute(null);
    setSelectedPastPaper(null);
    setActiveViewerResource(res);
    setViewerCurrentPage(1);
    setViewerZoom(100);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#08332b] via-[#0d5c4d] to-[#082a24] text-white p-6 sm:p-8 shadow-md">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
          <Library className="h-80 w-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#a5f3df]">
              <Sparkles className="h-3.5 w-3.5 text-[#f3b738]" />
              <span>Dedicated Educational Repository</span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span>Faculty & Author Approved</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {activeTab === "past_papers"
                ? "My Learning → Past Papers & Schemes"
                : currentRole === "teacher"
                ? "Teacher Workspace → Library"
                : currentRole === "admin"
                ? "Admin Control → Library Repository"
                : "Student Workspace → Library"}
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              {activeTab === "past_papers"
                ? "Official G.C.E. Advanced Level & Ordinary Level past exam papers, certified marking schemes, and interactive timed practice."
                : "Explore textbooks, curriculum study packs, revision tutes, and model examination papers published by Sri Lanka’s top teachers and faculty educators."}
            </p>
          </div>

          {/* Quick Action Badges & Role Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-xs">
              {initialTab === "past_papers" ? (
                <>
                  <div className="text-center px-2 border-r border-white/20">
                    <p className="text-lg font-bold text-white">
                      {libraryResources.filter((r) => r.resourceType === "past_paper").length}
                    </p>
                    <p className="text-[10px] text-emerald-200">Past Papers</p>
                  </div>
                  <div className="text-center px-2 border-r border-white/20">
                    <p className="text-lg font-bold text-[#f3b738]">
                      {libraryResources.filter((r) => r.resourceType === "past_paper" && r.examType?.includes("Advanced")).length}
                    </p>
                    <p className="text-[10px] text-emerald-200">G.C.E. A/L</p>
                  </div>
                  <div className="text-center px-2">
                    <p className="text-lg font-bold text-[#86efac]">
                      {libraryResources.filter((r) => r.resourceType === "past_paper" && r.hasMarkingScheme).length}
                    </p>
                    <p className="text-[10px] text-emerald-200">Marking Schemes</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center px-2 border-r border-white/20">
                    <p className="text-lg font-bold text-white">
                      {libraryResources.filter((r) => r.resourceType !== "past_paper").length}
                    </p>
                    <p className="text-[10px] text-emerald-200">Total Items</p>
                  </div>
                  <div className="text-center px-2 border-r border-white/20">
                    <p className="text-lg font-bold text-[#86efac]">
                      {libraryResources.filter((r) => r.resourceType === "tute").length}
                    </p>
                    <p className="text-[10px] text-emerald-200">Tutes</p>
                  </div>
                  <div className="text-center px-2">
                    <p className="text-lg font-bold text-purple-200">
                      {libraryResources.filter((r) => r.resourceType === "book").length}
                    </p>
                    <p className="text-[10px] text-emerald-200">Books</p>
                  </div>
                </>
              )}
            </div>

            {/* Teacher / Author Management Button */}
            {(currentRole === "teacher" || currentRole === "admin") && (
              <button
                onClick={() => {
                  setEditingResource(null);
                  setIsUploadModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f3b738] hover:bg-[#e0a424] text-[#0d2b26] font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                <span>Upload Resource</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="mt-8 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/10">
            {initialTab === "past_papers" ? (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-[#0d5c4d] shadow-xs">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>
                  Past Papers &amp; Schemes ({libraryResources.filter((r) => r.resourceType === "past_paper" && r.status === "published").length})
                </span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "all"
                      ? "bg-white text-[#0d5c4d] shadow-xs"
                      : "text-emerald-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  All Resources ({libraryResources.filter((r) => r.resourceType !== "past_paper" && r.status === "published").length})
                </button>
                <button
                  onClick={() => setActiveTab("tutes")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === "tutes"
                      ? "bg-white text-[#0d5c4d] shadow-xs"
                      : "text-emerald-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Tutes / Study Packs</span>
                </button>
                <button
                  onClick={() => setActiveTab("books")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === "books"
                      ? "bg-white text-[#0d5c4d] shadow-xs"
                      : "text-emerald-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Books</span>
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === "saved"
                      ? "bg-white text-[#0d5c4d] shadow-xs"
                      : "text-emerald-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>My Saved ({savedResourceIds.length})</span>
                </button>

                {/* Author / Teacher Management Tab */}
                {(currentRole === "teacher" || currentRole === "admin") && (
                  <button
                    onClick={() => setActiveTab("manage")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === "manage"
                        ? "bg-[#f3b738] text-[#0d2b26] shadow-xs"
                        : "text-[#f3b738] hover:bg-[#f3b738]/20"
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Teacher Management</span>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
              }`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RENDER VIEW: TEACHER MANAGEMENT OR STUDENT DISCOVERY */}
      {activeTab === "manage" ? (
        /* TEACHER/AUTHOR LIBRARY MANAGEMENT SECTION */
        <div className="space-y-6">
          {/* Management KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-[#e6ece8] shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold">Total Resources</span>
                <Library className="h-4 w-4 text-[#0d5c4d]" />
              </div>
              <p className="text-2xl font-extrabold text-[#0d2b26]">{myTeacherResources.length}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {myTeacherResources.filter((r) => r.status === "published").length} live in catalog
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#e6ece8] shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold">Total Student Views</span>
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#0d2b26]">
                {myTeacherResources.reduce((acc, curr) => acc + curr.viewsCount, 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">Across your uploaded materials</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#e6ece8] shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold">Downloads Recorded</span>
                <Download className="h-4 w-4 text-[#0d5c4d]" />
              </div>
              <p className="text-2xl font-extrabold text-[#0d2b26]">
                {myTeacherResources.reduce((acc, curr) => acc + curr.downloadsCount, 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Offline study access</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#e6ece8] shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold">Drafts & In-Review</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-[#0d2b26]">
                {myTeacherResources.filter((r) => r.status !== "published").length}
              </p>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">Requires publication</p>
            </div>
          </div>

          {/* Teacher Controls & Sub-tabs */}
          <div className="bg-white rounded-2xl border border-[#e6ece8] shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6ece8]">
              <div>
                <h2 className="text-base font-bold text-[#0d2b26]">
                  Teacher &amp; Author Resource Management
                </h2>
                <p className="text-xs text-slate-500">
                  Managing materials uploaded by <span className="font-semibold text-[#0d5c4d]">{currentUser.name || "Mr. Samantha Perera"}</span> ({myTeacherResources.length} resources)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingResource(null);
                    setIsUploadModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Resource</span>
                </button>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setManagementFilter("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  managementFilter === "all"
                    ? "bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0]"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                }`}
              >
                All Uploads ({myTeacherResources.length})
              </button>
              <button
                onClick={() => setManagementFilter("published")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  managementFilter === "published"
                    ? "bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0]"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                }`}
              >
                Published ({myTeacherResources.filter((r) => r.status === "published").length})
              </button>
              <button
                onClick={() => setManagementFilter("draft")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  managementFilter === "draft"
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                }`}
              >
                Draft ({myTeacherResources.filter((r) => r.status === "draft").length})
              </button>
              <button
                onClick={() => setManagementFilter("unpublished")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  managementFilter === "unpublished"
                    ? "bg-slate-200 text-slate-800 border border-slate-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                }`}
              >
                Unpublished ({myTeacherResources.filter((r) => r.status === "unpublished").length})
              </button>
            </div>

            {/* Management Table */}
            <div className="overflow-x-auto rounded-xl border border-[#e6ece8]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f6f9f7] border-b border-[#e6ece8] text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Subject & Topic</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">Uploaded Date</th>
                    <th className="py-3 px-4">Visibility</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6ece8]">
                  {teacherManagedResources.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No resources in this status category.
                      </td>
                    </tr>
                  ) : (
                    teacherManagedResources.map((res) => (
                      <tr key={res.id} className="hover:bg-[#fbfcfb] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-8 rounded overflow-hidden bg-slate-100 shrink-0 shadow-xs border border-slate-200">
                              <img
                                src={res.coverImage}
                                alt={res.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="max-w-xs">
                              <p className="font-bold text-[#0d2b26] line-clamp-1">{res.title}</p>
                              <p className="text-[11px] text-slate-400">
                                {res.fileType} · {res.fileSize} · {res.pageCount} pgs
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              res.resourceType === "book"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {res.resourceType === "book" ? "Book" : "Tute"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-700">{res.subject}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {res.topic || res.category}
                          </p>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-600">{res.author}</td>
                        <td className="py-3 px-4 text-slate-500">{res.uploadedDate}</td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium capitalize">
                            {res.visibility === "public" ? (
                              <Globe className="h-3 w-3 text-emerald-600" />
                            ) : res.visibility === "class_only" ? (
                              <Users className="h-3 w-3 text-blue-600" />
                            ) : (
                              <Lock className="h-3 w-3 text-slate-400" />
                            )}
                            {res.visibility.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              res.status === "published"
                                ? "bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0]"
                                : res.status === "draft"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview button */}
                            <button
                              onClick={() => handleOpenResource(res)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#0d5c4d] hover:bg-slate-100 transition-colors"
                              title="Preview"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {/* Publish / Unpublish Toggle */}
                            <button
                              onClick={() => {
                                const newStatus =
                                  res.status === "published" ? "unpublished" : "published";
                                updateLibraryResource(res.id, { status: newStatus });
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                res.status === "published"
                                  ? "text-emerald-600 hover:bg-emerald-50"
                                  : "text-slate-400 hover:bg-slate-100"
                              }`}
                              title={res.status === "published" ? "Unpublish" : "Publish"}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => {
                                setEditingResource(res);
                                setIsUploadModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setResourceToDelete(res)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
      ) : (
        /* STUDENT LIBRARY DISCOVERY VIEW */
        <div className="space-y-6">
          {/* SEARCH & FILTERS SECTION */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e6ece8] shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search resources by title, author, subject, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#d6dfd9] text-xs focus:outline-none focus:ring-2 focus:ring-[#0d5c4d]/20 focus:border-[#0d5c4d] bg-[#fbfcfb] placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Subject Filter */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="py-2.5 px-3 rounded-xl border border-[#d6dfd9] text-xs bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0d5c4d]/20"
              >
                <option value="all">All Subjects</option>
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2.5 px-3 rounded-xl border border-[#d6dfd9] text-xs bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0d5c4d]/20"
              >
                <option value="all">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-2.5 px-3 rounded-xl border border-[#d6dfd9] text-xs bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0d5c4d]/20"
              >
                <option value="recent">Recently Added</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>

            {/* Quick Type Filter Pills - only shown in Library, removed in pastpaper section */}
            {initialTab !== "past_papers" && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#f0f4f1] text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium mr-1">Resource Type:</span>
                  <button
                    onClick={() => setSelectedType("all")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      selectedType === "all"
                        ? "bg-[#0d5c4d] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedType("book")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      selectedType === "book"
                        ? "bg-[#0d5c4d] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <BookOpen className="h-3 w-3" />
                    <span>Books</span>
                  </button>
                  <button
                    onClick={() => setSelectedType("tute")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      selectedType === "tute"
                        ? "bg-[#0d5c4d] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <FileText className="h-3 w-3" />
                    <span>Tutes / Study Materials</span>
                  </button>
                </div>

                {/* Reset Filters button if any filter is active */}
                {(searchQuery ||
                  selectedSubject !== "all" ||
                  selectedCategory !== "all" ||
                  selectedType !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedSubject("all");
                      setSelectedCategory("all");
                      setSelectedType("all");
                    }}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Specialized Past Paper Secondary Filter Bar */}
            {(activeTab === "past_papers" || selectedType === "past_paper") && (
              <div className="pt-3 border-t border-[#f0f4f1] flex flex-wrap items-center justify-between gap-3 bg-[#f8faf9] p-3 rounded-xl border border-[#eef3f0]">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d5c4d] mr-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Past Paper Filters:</span>
                  </div>

                  {/* Year selector */}
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none"
                  >
                    <option value="all">All Exam Years</option>
                    <option value="2025">2025 (Latest)</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                  </select>

                  {/* Medium selector */}
                  <select
                    value={selectedMedium}
                    onChange={(e) => setSelectedMedium(e.target.value)}
                    className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none"
                  >
                    <option value="all">All Mediums</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="English">English Medium</option>
                    <option value="Sinhala">සිංහල (Sinhala)</option>
                  </select>

                  {/* Exam Type selector */}
                  <select
                    value={selectedExamType}
                    onChange={(e) => setSelectedExamType(e.target.value)}
                    className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none"
                  >
                    <option value="all">All Exam Levels</option>
                    <option value="G.C.E. Advanced Level">G.C.E. Advanced Level (A/L)</option>
                    <option value="G.C.E. Ordinary Level">G.C.E. Ordinary Level (O/L)</option>
                    <option value="Provincial Term Test">Provincial Model Papers</option>
                  </select>

                  {(searchQuery || selectedYear !== "all" || selectedMedium !== "all" || selectedExamType !== "all" || selectedSubject !== "all") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedSubject("all");
                        setSelectedYear("all");
                        setSelectedMedium("all");
                        setSelectedExamType("all");
                      }}
                      className="text-xs text-rose-600 font-bold hover:underline ml-2"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                <span className="text-[11px] text-slate-500 font-medium">
                  Showing {filteredResources.length} Past Papers with Marking Schemes
                </span>
              </div>
            )}
          </div>

          {/* POPULAR RESOURCES SPOTLIGHT (Shown when viewing "all" with no search query) */}
          {activeTab === "all" && !searchQuery && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0d2b26] flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#f3b738] fill-[#f3b738]" />
                  <span>Popular & Highly Rated Resources</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">Most read by students this term</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {popularResources.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => handleOpenResource(res)}
                    className="group bg-white rounded-2xl p-4 border border-[#e6ece8] shadow-xs hover:shadow-md hover:border-[#c4e9e0] transition-all cursor-pointer flex gap-4 items-center"
                  >
                    <div className="relative w-16 h-22 shrink-0 rounded-lg overflow-hidden bg-slate-100 shadow-sm border border-slate-200">
                      <img
                        src={res.coverImage}
                        alt={res.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[8px] font-bold bg-black/60 text-white uppercase">
                        {res.fileType}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#0d5c4d] bg-[#ecf8f5] px-2 py-0.5 rounded-full">
                          {res.subject}
                        </span>
                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {res.rating}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[#0d2b26] line-clamp-2 group-hover:text-[#0d5c4d] transition-colors">
                        {res.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{res.author}</p>
                      <p className="text-[10px] text-slate-400">
                        {res.viewsCount} reads · {res.downloadsCount} downloads
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAIN RESOURCES GRID / LIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>
                Showing {filteredResources.length} {filteredResources.length === 1 ? "resource" : "resources"}
              </span>
              <span>Sorted by {sortBy.replace("_", " ")}</span>
            </div>

            {filteredResources.length === 0 ? (
              /* EMPTY STATE */
              <div className="bg-white rounded-2xl border border-dashed border-[#d6dfd9] p-12 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center mx-auto">
                  <Library className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-[#0d2b26]">No Educational Resources Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  We couldn’t find any resources matching your search or filters. Try adjusting your
                  search keywords, changing subject or category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubject("all");
                    setSelectedCategory("all");
                    setSelectedType("all");
                    setActiveTab("all");
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0d5c4d] text-white text-xs font-bold hover:bg-[#0a473b] transition-colors"
                >
                  View All Resources
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredResources.map((res) => {
                  const isSaved = savedResourceIds.includes(res.id);
                  const isBook = res.resourceType === "book";
                  const isPastPaper = res.resourceType === "past_paper";

                  return (
                    <div
                      key={res.id}
                      className="group bg-white rounded-2xl border border-[#e6ece8] shadow-xs hover:shadow-lg hover:border-[#c4e9e0] transition-all flex flex-col overflow-hidden"
                    >
                      {/* Card Cover & Badges */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={res.coverImage}
                          alt={res.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span
                            className={`px-2.5 py-0.8 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                              isPastPaper
                                ? "bg-amber-500/95 text-white"
                                : isBook
                                ? "bg-purple-600/90 text-white"
                                : "bg-[#0d5c4d]/90 text-white"
                            }`}
                          >
                            {isPastPaper ? "Past Paper & Scheme" : isBook ? "Book" : "Tute"}
                          </span>

                          {/* Bookmark Action */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveResource(res.id);
                            }}
                            className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                              isSaved
                                ? "bg-[#f3b738] text-[#0d2b26] shadow-sm"
                                : "bg-black/30 hover:bg-black/50 text-white"
                            }`}
                            title={isSaved ? "Remove Bookmark" : "Save Resource"}
                          >
                            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`} />
                          </button>
                        </div>

                        {/* Bottom Overlay Meta */}
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                          <span className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
                            {res.subject}
                            {res.year && <span className="text-amber-300 font-bold">• {res.year}</span>}
                          </span>
                          <span className="font-mono text-[10px] bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded">
                            {res.medium ? `${res.medium} · ` : ""}{res.fileType}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400">
                            <span className="line-clamp-1">{res.category}</span>
                            {res.hasMarkingScheme ? (
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Scheme Included ✓
                              </span>
                            ) : (
                              <span>{res.uploadedDate}</span>
                            )}
                          </div>

                          <h4
                            onClick={() => handleOpenResource(res)}
                            className="font-bold text-sm text-[#0d2b26] line-clamp-2 hover:text-[#0d5c4d] cursor-pointer transition-colors leading-snug"
                          >
                            {res.title}
                          </h4>

                          <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                            <span className="h-5 w-5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] font-bold text-[9px] flex items-center justify-center shrink-0">
                              {res.author.charAt(0)}
                            </span>
                            <span className="line-clamp-1">{res.author}</span>
                          </p>

                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {res.description}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-[#f0f4f1] flex items-center gap-2">
                          <button
                            onClick={() => handleOpenResource(res)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-colors ${
                              isPastPaper
                                ? "bg-[#fef7e6] hover:bg-[#fde4af] text-[#b47a16]"
                                : "bg-[#ecf8f5] hover:bg-[#c4e9e0] text-[#0d5c4d]"
                            }`}
                          >
                            {isPastPaper ? (
                              <>
                                <Award className="h-3.5 w-3.5" />
                                <span>Solve &amp; View Scheme</span>
                              </>
                            ) : isBook ? (
                              <>
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>Read Book</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5" />
                                <span>View Tute</span>
                              </>
                            )}
                          </button>

                          {res.allowDownload ? (
                            <button
                              onClick={() => recordResourceDownload(res.id)}
                              className="p-2 rounded-xl border border-[#d6dfd9] hover:bg-slate-100 text-slate-600 transition-colors"
                              title="Download resource file"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <span
                              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed text-[10px] font-semibold"
                              title="Online Reading Only"
                            >
                              <Lock className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST / COMPACT VIEW */
              <div className="bg-white rounded-2xl border border-[#e6ece8] shadow-xs divide-y divide-[#e6ece8]">
                {filteredResources.map((res) => {
                  const isSaved = savedResourceIds.includes(res.id);
                  const isBook = res.resourceType === "book";

                  return (
                    <div
                      key={res.id}
                      className="p-4 hover:bg-[#fbfcfb] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          onClick={() => handleOpenResource(res)}
                          className="w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 shadow-xs border border-slate-200 cursor-pointer"
                        >
                          <img
                            src={res.coverImage}
                            alt={res.title}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isBook
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-[#ecf8f5] text-[#0d5c4d]"
                              }`}
                            >
                              {isBook ? "Book" : "Tute"}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">{res.subject}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-400">{res.category}</span>
                          </div>

                          <h4
                            onClick={() => handleOpenResource(res)}
                            className="font-bold text-sm text-[#0d2b26] hover:text-[#0d5c4d] cursor-pointer"
                          >
                            {res.title}
                          </h4>

                          <p className="text-xs text-slate-600">
                            By <span className="font-semibold">{res.author}</span> · Uploaded on{" "}
                            {res.uploadedDate}
                          </p>

                          <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                            {res.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <span className="text-xs font-mono text-slate-400 mr-2">
                          {res.fileType} ({res.fileSize})
                        </span>

                        <button
                          onClick={() => toggleSaveResource(res.id)}
                          className={`p-2 rounded-xl border transition-colors ${
                            isSaved
                              ? "bg-[#fef7e6] text-[#b47a16] border-[#fde4af]"
                              : "border-[#d6dfd9] text-slate-500 hover:bg-slate-100"
                          }`}
                          title={isSaved ? "Saved" : "Save"}
                        >
                          <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                        </button>

                        <button
                          onClick={() => handleOpenResource(res)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-xs transition-colors"
                        >
                          {res.resourceType === "past_paper" ? (
                            <Award className="h-3.5 w-3.5 text-amber-300" />
                          ) : isBook ? (
                            <BookOpen className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                          <span>
                            {res.resourceType === "past_paper"
                              ? "Solve & Scheme"
                              : isBook
                              ? "Read Book"
                              : "View Tute"}
                          </span>
                        </button>

                        {res.allowDownload && (
                          <button
                            onClick={() => recordResourceDownload(res.id)}
                            className="p-2 rounded-xl border border-[#d6dfd9] hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. BOOK DETAILS MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#e6ece8] flex items-center justify-between bg-[#fbfcfb]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[11px] uppercase tracking-wider">
                  Book Details
                </span>
                <span className="text-xs font-semibold text-slate-500">{selectedBook.subject}</span>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* 3D Book Cover Presentation */}
                <div className="w-36 h-48 sm:w-44 sm:h-60 rounded-xl overflow-hidden bg-slate-100 shadow-md border border-slate-200 shrink-0 mx-auto sm:mx-0">
                  <img
                    src={selectedBook.coverImage}
                    alt={selectedBook.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="space-y-3 flex-1">
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#0d2b26] leading-snug">
                    {selectedBook.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-[#0d5c4d]">{selectedBook.author}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">Category: {selectedBook.category}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{selectedBook.rating}</span>
                    </div>
                    <span>{selectedBook.viewsCount} Readers</span>
                    <span>{selectedBook.downloadsCount} Downloads</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {selectedBook.description}
                  </p>

                  {/* File specs table */}
                  <div className="bg-[#f6f9f7] rounded-xl p-3 grid grid-cols-3 gap-2 text-[11px] border border-[#e6ece8]">
                    <div>
                      <p className="text-slate-400">Format</p>
                      <p className="font-bold text-[#0d2b26]">{selectedBook.fileType}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">File Size</p>
                      <p className="font-bold text-[#0d2b26]">{selectedBook.fileSize}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Published</p>
                      <p className="font-bold text-[#0d2b26]">{selectedBook.uploadedDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table of Contents preview */}
              {selectedBook.tableOfContents && selectedBook.tableOfContents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Table of Contents Preview
                  </h4>
                  <div className="bg-[#fbfcfb] rounded-xl border border-[#e6ece8] divide-y divide-[#e6ece8] max-h-36 overflow-y-auto">
                    {selectedBook.tableOfContents.map((toc, idx) => (
                      <div
                        key={idx}
                        className="px-3.5 py-2 flex items-center justify-between text-xs hover:bg-[#f6f9f7] transition-colors"
                      >
                        <span className="font-semibold text-slate-700">{toc.title}</span>
                        <span className="font-mono text-slate-400 text-[11px]">Page {toc.page}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-[#e6ece8] bg-[#fbfcfb] flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => toggleSaveResource(selectedBook.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  savedResourceIds.includes(selectedBook.id)
                    ? "bg-[#fef7e6] text-[#b47a16] border-[#fde4af]"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Bookmark className="h-4 w-4" />
                <span>{savedResourceIds.includes(selectedBook.id) ? "Saved" : "Save Book"}</span>
              </button>

              <div className="flex items-center gap-3">
                {selectedBook.allowDownload && (
                  <button
                    onClick={() => recordResourceDownload(selectedBook.id)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#0d5c4d] text-[#0d5c4d] hover:bg-[#ecf8f5] font-bold text-xs transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download ({selectedBook.fileSize})</span>
                  </button>
                )}

                <button
                  onClick={() => handleLaunchReader(selectedBook)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Read Book Online</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. TUTE / STUDY MATERIAL DETAILS MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedTute && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 border-b border-[#e6ece8] flex items-center justify-between bg-[#fbfcfb]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] uppercase tracking-wider">
                  Tute & Study Material
                </span>
                <span className="text-xs font-semibold text-slate-500">{selectedTute.subject}</span>
              </div>
              <button
                onClick={() => setSelectedTute(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-32 h-44 rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200 shrink-0 mx-auto sm:mx-0">
                  <img
                    src={selectedTute.coverImage}
                    alt={selectedTute.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="space-y-2.5 flex-1">
                  <h3 className="text-lg font-extrabold text-[#0d2b26] leading-snug">
                    {selectedTute.title}
                  </h3>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#0d5c4d]">
                      Teacher/Author: <span className="font-bold">{selectedTute.author}</span>
                    </p>
                    {selectedTute.topic && (
                      <p className="text-xs text-slate-500">
                        Topic: <span className="font-medium text-slate-700">{selectedTute.topic}</span>
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedTute.description}
                  </p>

                  <div className="bg-[#f6f9f7] rounded-xl p-3 grid grid-cols-3 gap-2 text-[11px] border border-[#e6ece8]">
                    <div>
                      <p className="text-slate-400">File Type</p>
                      <p className="font-bold text-[#0d2b26]">{selectedTute.fileType}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">File Size</p>
                      <p className="font-bold text-[#0d2b26]">{selectedTute.fileSize}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Uploaded</p>
                      <p className="font-bold text-[#0d2b26]">{selectedTute.uploadedDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Highlights */}
              {selectedTute.keyHighlights && selectedTute.keyHighlights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    What’s Included in This Tute
                  </h4>
                  <div className="space-y-1.5 bg-[#fbfcfb] p-3.5 rounded-xl border border-[#e6ece8]">
                    {selectedTute.keyHighlights.map((hl, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-[#e6ece8] bg-[#fbfcfb] flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => toggleSaveResource(selectedTute.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  savedResourceIds.includes(selectedTute.id)
                    ? "bg-[#fef7e6] text-[#b47a16] border-[#fde4af]"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Bookmark className="h-4 w-4" />
                <span>{savedResourceIds.includes(selectedTute.id) ? "Saved" : "Save Tute"}</span>
              </button>

              <div className="flex items-center gap-3">
                {selectedTute.allowDownload && (
                  <button
                    onClick={() => recordResourceDownload(selectedTute.id)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#0d5c4d] text-[#0d5c4d] hover:bg-[#ecf8f5] font-bold text-xs transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Tute</span>
                  </button>
                )}

                <button
                  onClick={() => handleLaunchViewer(selectedTute)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Material</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2.5 PAST PAPER & MARKING SCHEMES INTERACTIVE MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedPastPaper && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Header */}
            <div className="p-6 border-b border-[#e6ece8] flex items-center justify-between bg-[#fbfcfb]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  Past Paper &amp; Official Scheme
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {selectedPastPaper.subject} • {selectedPastPaper.year || 2025}
                </span>
                {selectedPastPaper.medium && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {selectedPastPaper.medium} Medium
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedPastPaper(null);
                  setIsTimerRunning(false);
                }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Title & Meta Banner */}
            <div className="p-6 pb-4 bg-gradient-to-r from-[#0d5c4d]/5 to-transparent border-b border-[#eef4f1] flex flex-col sm:flex-row gap-4 items-start justify-between">
              <div className="space-y-1 flex-1">
                <h3 className="text-lg font-black text-[#0d2b26] leading-snug">
                  {selectedPastPaper.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Published by <strong className="text-slate-700">{selectedPastPaper.author}</strong> • Standard Time: {selectedPastPaper.timeAllowedMinutes || 180} Mins (3 Hours)
                </p>
              </div>

              <div className="flex items-center gap-2 self-start">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Marking Scheme Verified
                </span>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-6 pt-3 border-b border-[#eef4f1] flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setPastPaperTab("question_paper")}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  pastPaperTab === "question_paper"
                    ? "border-[#0d5c4d] text-[#0d5c4d]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Question Paper</span>
              </button>
              <button
                onClick={() => setPastPaperTab("marking_scheme")}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  pastPaperTab === "marking_scheme"
                    ? "border-[#0d5c4d] text-[#0d5c4d]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Official Marking Scheme &amp; Rubric</span>
              </button>
              <button
                onClick={() => setPastPaperTab("timed_practice")}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  pastPaperTab === "timed_practice"
                    ? "border-[#0d5c4d] text-[#0d5c4d]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Timed Practice Simulator (3h)</span>
              </button>
            </div>

            {/* Body per Tab */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              {/* TAB 1: QUESTION PAPER */}
              {pastPaperTab === "question_paper" && (
                <div className="space-y-4">
                  <p className="text-slate-600 leading-relaxed">
                    {selectedPastPaper.description}
                  </p>

                  <div className="bg-[#f8faf9] p-4 rounded-2xl border border-[#eef4f1] grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-bold uppercase block text-[9px]">Exam Year</span>
                      <span className="font-black text-[#0d2b26] text-sm">{selectedPastPaper.year || 2025}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase block text-[9px]">Language Medium</span>
                      <span className="font-black text-[#0d2b26] text-sm">{selectedPastPaper.medium || "Tamil"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase block text-[9px]">Total Pages</span>
                      <span className="font-black text-[#0d2b26] text-sm">{selectedPastPaper.pageCount} Pages</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase block text-[9px]">File Size</span>
                      <span className="font-black text-[#0d2b26] text-sm">{selectedPastPaper.fileSize}</span>
                    </div>
                  </div>

                  {selectedPastPaper.sampleContent && selectedPastPaper.sampleContent.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Question Paper Extract:
                      </h4>
                      {selectedPastPaper.sampleContent.map((sample, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                          <h5 className="font-bold text-[#0d2b26]">{sample.chapterTitle}</h5>
                          <pre className="font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                            {sample.text}
                          </pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                      Complete question paper formatted according to official Department of Examinations specifications.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MARKING SCHEME */}
              {pastPaperTab === "marking_scheme" && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Official Department Chief Examiner Marking Scheme</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {selectedPastPaper.markingSchemeNotes || "Complete mark distribution scheme showing partial marks awarded for formulas, substitution, and final numerical accuracy."}
                      </p>
                    </div>
                  </div>

                  {selectedPastPaper.sampleContent && selectedPastPaper.sampleContent.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Marking Rubric Breakdown:
                      </h4>
                      {selectedPastPaper.sampleContent.map((sample, idx) => (
                        <div key={idx} className="bg-[#fcfdfc] p-4 rounded-xl border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-[#0d5c4d]">{sample.chapterTitle}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Official Key
                            </span>
                          </div>
                          <pre className="font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-100">
                            {sample.text}
                          </pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                      Step-by-step marking scheme attached to this publication.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TIMED PRACTICE SIMULATOR */}
              {pastPaperTab === "timed_practice" && (
                <div className="space-y-4">
                  <div className="bg-[#0a2e26] text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        Examination Simulation Countdown
                      </span>
                      <p className="text-3xl font-mono font-black tracking-widest text-[#f3b738]">
                        {formatTimer(practiceTimeRemaining)}
                      </p>
                      <p className="text-xs text-emerald-200">
                        Standard Time: 3 Hours • {isTimerRunning ? "Timer Running" : "Timer Paused"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                          isTimerRunning
                            ? "bg-rose-600 hover:bg-rose-700 text-white"
                            : "bg-[#f3b738] hover:bg-[#e0a424] text-[#0d2b26]"
                        }`}
                      >
                        {isTimerRunning ? (
                          <>
                            <Pause className="w-3.5 h-3.5" /> Pause Timer
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" /> Start Exam Timer
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setIsTimerRunning(false);
                          setPracticeTimeRemaining((selectedPastPaper.timeAllowedMinutes || 180) * 60);
                        }}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Reset Timer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-slate-700 text-xs">
                      Candidate Answer Scratchpad / Working Notes:
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Type your workings, intermediate derivations, or step numbers here as you solve under timed exam conditions..."
                      className="w-full p-4 rounded-xl border border-slate-300 text-xs font-mono bg-[#fcfdfc] focus:outline-none focus:ring-2 focus:ring-[#0d5c4d]/20 focus:border-[#0d5c4d]"
                    />
                    <p className="text-[11px] text-slate-400">
                      When finished, switch to the <strong>Official Marking Scheme</strong> tab to self-evaluate and award marks for each step.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-[#e6ece8] bg-[#fbfcfb] flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => toggleSaveResource(selectedPastPaper.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  savedResourceIds.includes(selectedPastPaper.id)
                    ? "bg-[#fef7e6] text-[#b47a16] border-[#fde4af]"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Bookmark className="h-4 w-4" />
                <span>{savedResourceIds.includes(selectedPastPaper.id) ? "Saved" : "Save Paper"}</span>
              </button>

              <div className="flex items-center gap-3">
                {selectedPastPaper.allowDownload && (
                  <button
                    onClick={() => recordResourceDownload(selectedPastPaper.id)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#0d5c4d] text-[#0d5c4d] hover:bg-[#ecf8f5] font-bold text-xs transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Paper + Scheme ({selectedPastPaper.fileSize})</span>
                  </button>
                )}

                <button
                  onClick={() => handleLaunchViewer(selectedPastPaper)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
                >
                  <Eye className="h-4 w-4" />
                  <span>Open Full PDF Viewer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. INTERACTIVE DIGITAL BOOK READER MODAL */}
      {/* ------------------------------------------------------------- */}
      {activeReaderResource && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
          {/* Reader Top Bar */}
          <div
            className={`px-4 sm:px-6 py-3 border-b flex items-center justify-between transition-colors ${
              readerTheme === "dark"
                ? "bg-slate-900 border-slate-800 text-white"
                : readerTheme === "sepia"
                ? "bg-[#fbf0d9] border-[#e8d8b8] text-[#5f4b32]"
                : "bg-white border-slate-200 text-[#0d2b26]"
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveReaderResource(null)}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
                title="Exit Reader"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h3 className="font-bold text-xs sm:text-sm line-clamp-1">
                  {activeReaderResource.title}
                </h3>
                <p className="text-[10px] opacity-75">By {activeReaderResource.author}</p>
              </div>
            </div>

            {/* Reader Controls: Theme & Font Size */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Font Size controls */}
              <div className="flex items-center gap-1 bg-black/5 p-1 rounded-lg">
                <button
                  onClick={() => setReaderFontSize("small")}
                  className={`px-2 py-0.5 text-xs rounded font-bold ${
                    readerFontSize === "small" ? "bg-white shadow-xs" : "opacity-60"
                  }`}
                  title="Small Text"
                >
                  A-
                </button>
                <button
                  onClick={() => setReaderFontSize("medium")}
                  className={`px-2 py-0.5 text-xs rounded font-bold ${
                    readerFontSize === "medium" ? "bg-white shadow-xs" : "opacity-60"
                  }`}
                  title="Medium Text"
                >
                  A
                </button>
                <button
                  onClick={() => setReaderFontSize("large")}
                  className={`px-2 py-0.5 text-xs rounded font-bold ${
                    readerFontSize === "large" ? "bg-white shadow-xs" : "opacity-60"
                  }`}
                  title="Large Text"
                >
                  A+
                </button>
              </div>

              {/* Theme switch */}
              <div className="flex items-center gap-1 bg-black/5 p-1 rounded-lg">
                <button
                  onClick={() => setReaderTheme("light")}
                  className={`p-1 rounded ${readerTheme === "light" ? "bg-white shadow-xs" : "opacity-60"}`}
                  title="Light Theme"
                >
                  <Sun className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setReaderTheme("sepia")}
                  className={`p-1 rounded ${readerTheme === "sepia" ? "bg-[#e8d8b8] shadow-xs" : "opacity-60"}`}
                  title="Sepia Theme"
                >
                  <Coffee className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setReaderTheme("dark")}
                  className={`p-1 rounded ${readerTheme === "dark" ? "bg-slate-700 text-white shadow-xs" : "opacity-60"}`}
                  title="Dark Theme"
                >
                  <Moon className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActiveReaderResource(null)}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Reader Main Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Table of Contents Drawer */}
            {readerIsSidebarOpen && activeReaderResource.sampleContent && (
              <div
                className={`w-64 border-r overflow-y-auto hidden md:block p-4 space-y-2 shrink-0 ${
                  readerTheme === "dark"
                    ? "bg-slate-900 border-slate-800 text-slate-300"
                    : readerTheme === "sepia"
                    ? "bg-[#f5e7c8] border-[#e8d8b8] text-[#5f4b32]"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <h4 className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                  Contents & Chapters
                </h4>
                <div className="space-y-1">
                  {activeReaderResource.sampleContent.map((chapter, idx) => (
                    <button
                      key={idx}
                      onClick={() => setReaderCurrentChapterIndex(idx)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        readerCurrentChapterIndex === idx
                          ? "bg-[#0d5c4d] text-white shadow-xs"
                          : "hover:bg-black/5"
                      }`}
                    >
                      <p className="line-clamp-1">{chapter.chapterTitle}</p>
                      <p className="text-[10px] opacity-75 font-mono">Page {chapter.pageNumber}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reader Content Page View */}
            <div
              className={`flex-1 overflow-y-auto p-6 sm:p-12 flex justify-center ${
                readerTheme === "dark"
                  ? "bg-slate-950 text-slate-200"
                  : readerTheme === "sepia"
                  ? "bg-[#fbf0d9] text-[#4a3928]"
                  : "bg-[#f8faf8] text-[#1c2e29]"
              }`}
            >
              <div className="max-w-2xl w-full space-y-6">
                {activeReaderResource.sampleContent &&
                activeReaderResource.sampleContent[readerCurrentChapterIndex] ? (
                  <>
                    <div className="border-b pb-4 border-current/10">
                      <span className="text-[11px] font-mono opacity-60">
                        CHAPTER {readerCurrentChapterIndex + 1}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold mt-1">
                        {
                          activeReaderResource.sampleContent[readerCurrentChapterIndex]
                            .chapterTitle
                        }
                      </h2>
                    </div>

                    <div
                      className={`leading-relaxed tracking-normal font-serif ${
                        readerFontSize === "small"
                          ? "text-sm leading-6"
                          : readerFontSize === "large"
                          ? "text-lg leading-8"
                          : "text-base leading-7"
                      }`}
                    >
                      <p className="text-justify indent-6">
                        {activeReaderResource.sampleContent[readerCurrentChapterIndex].text}
                      </p>

                      <p className="mt-4 text-justify indent-6">
                        Furthermore, detailed laboratory results and model problem solutions demonstrate
                        that applying systematic principles significantly reduces student calculation
                        errors. Key formulas should always be stated clearly with respective physical
                        units before numerical substitution.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 space-y-2 opacity-60">
                    <p className="text-sm">Sample chapter preview rendered.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reader Bottom Navigation Bar */}
          <div
            className={`px-6 py-3 border-t flex items-center justify-between text-xs font-semibold ${
              readerTheme === "dark"
                ? "bg-slate-900 border-slate-800 text-slate-400"
                : readerTheme === "sepia"
                ? "bg-[#fbf0d9] border-[#e8d8b8] text-[#5f4b32]"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            <button
              disabled={readerCurrentChapterIndex === 0}
              onClick={() => setReaderCurrentChapterIndex((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-current/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Chapter</span>
            </button>

            <span>
              Chapter {readerCurrentChapterIndex + 1} of{" "}
              {activeReaderResource.sampleContent?.length || 1}
            </span>

            <button
              disabled={
                !activeReaderResource.sampleContent ||
                readerCurrentChapterIndex >= activeReaderResource.sampleContent.length - 1
              }
              onClick={() =>
                setReaderCurrentChapterIndex((prev) =>
                  Math.min(
                    (activeReaderResource.sampleContent?.length || 1) - 1,
                    prev + 1
                  )
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-current/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5"
            >
              <span>Next Chapter</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. INTERACTIVE TUTE / STUDY MATERIAL VIEWER MODAL */}
      {/* ------------------------------------------------------------- */}
      {activeViewerResource && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
          {/* Top Control Bar */}
          <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveViewerResource(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h3 className="font-bold text-sm line-clamp-1">{activeViewerResource.title}</h3>
                <p className="text-[10px] text-slate-400">
                  {activeViewerResource.subject} · {activeViewerResource.topic || "Syllabus Module"}
                </p>
              </div>
            </div>

            {/* Viewer Zoom & Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg text-xs">
                <button
                  onClick={() => setViewerZoom((z) => Math.max(75, z - 25))}
                  className="p-1 hover:text-emerald-400"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="px-1 text-[11px] font-mono">{viewerZoom}%</span>
                <button
                  onClick={() => setViewerZoom((z) => Math.min(175, z + 25))}
                  className="p-1 hover:text-emerald-400"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>

              {activeViewerResource.allowDownload && (
                <button
                  onClick={() => recordResourceDownload(activeViewerResource.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              )}

              <button
                onClick={() => setActiveViewerResource(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Document Content Simulation */}
          <div className="flex-1 bg-slate-800 overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
            <div
              style={{ transform: `scale(${viewerZoom / 100})`, transformOrigin: "top center" }}
              className="bg-white rounded-xl shadow-2xl p-8 sm:p-12 max-w-2xl w-full text-slate-800 space-y-6 transition-transform duration-150"
            >
              {/* Header on page */}
              <div className="border-b-2 border-[#0d5c4d] pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#0d5c4d]">
                    Sri Lanka Senior Secondary Education · LimaT Smart Book
                  </span>
                  <h2 className="text-xl font-extrabold text-[#0d2b26] mt-0.5">
                    {activeViewerResource.title}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700">
                    {activeViewerResource.subject}
                  </span>
                  <p className="text-[10px] text-slate-400">{activeViewerResource.uploadedDate}</p>
                </div>
              </div>

              {/* Tute Highlights Card */}
              <div className="bg-[#ecf8f5] p-4 rounded-xl border border-[#c4e9e0] space-y-2">
                <h4 className="text-xs font-bold text-[#0d5c4d] uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4" />
                  <span>Topic Objectives & Formula Summary</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {activeViewerResource.description}
                </p>
              </div>

              {/* Sample Sheet Content */}
              {activeViewerResource.sampleContent && activeViewerResource.sampleContent[0] && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#0d2b26]">
                    {activeViewerResource.sampleContent[0].chapterTitle}
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-3 font-mono">
                    <p>{activeViewerResource.sampleContent[0].text}</p>
                  </div>
                </div>
              )}

              {/* Key formulas sheet */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Verified Exam Notes
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Formulas verified under GCE curriculum framework.</li>
                  <li>Check all algebraic bounds and non-zero denominators before final steps.</li>
                  <li>Refer to teacher feedback sessions for marking scheme allocations.</li>
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                <span>Author: {activeViewerResource.author}</span>
                <span>Page 1 of {activeViewerResource.pageCount || 24}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. TEACHER UPLOAD & EDIT RESOURCE MODAL */}
      {/* ------------------------------------------------------------- */}
      {isUploadModalOpen && (
        <TeacherUploadModal
          resource={editingResource}
          availableSubjects={availableSubjects}
          onClose={() => {
            setIsUploadModalOpen(false);
            setEditingResource(null);
          }}
          onSave={(data, publish) => {
            if (editingResource) {
              updateLibraryResource(editingResource.id, {
                ...data,
                status: publish ? "published" : "draft"
              });
            } else {
              createLibraryResource({
                ...data,
                status: publish ? "published" : "draft"
              });
            }
            setIsUploadModalOpen(false);
            setEditingResource(null);
          }}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. DELETE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {resourceToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0d2b26]">Delete Library Resource?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-slate-700">"{resourceToDelete.title}"</span>? This
                will remove student access and saved bookmarks.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResourceToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteLibraryResource(resourceToDelete.id);
                  setResourceToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
              >
                Delete Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// TEACHER UPLOAD FORM COMPONENT
// =====================================================================
interface TeacherUploadModalProps {
  resource: LibraryResource | null;
  availableSubjects: string[];
  onClose: () => void;
  onSave: (data: Partial<LibraryResource>, publish: boolean) => void;
}

function TeacherUploadModal({
  resource,
  availableSubjects,
  onClose,
  onSave
}: TeacherUploadModalProps) {
  const { currentUser } = useApp();

  const [title, setTitle] = useState(resource?.title || "");
  const [resourceType, setResourceType] = useState<LibraryResourceType>(
    resource?.resourceType || "tute"
  );
  const [subject, setSubject] = useState(resource?.subject || availableSubjects[0] || "Combined Mathematics");
  const [author, setAuthor] = useState(resource?.author || currentUser.name || "Dr. Sarath Perera");
  const [description, setDescription] = useState(resource?.description || "");
  const [topic, setTopic] = useState(resource?.topic || "");
  const [category, setCategory] = useState(resource?.category || "Advanced Level");
  const [fileType, setFileType] = useState(resource?.fileType || "PDF");
  const [fileSize, setFileSize] = useState(resource?.fileSize || "4.5 MB");
  const [visibility, setVisibility] = useState<"public" | "class_only" | "private">(
    resource?.visibility || "public"
  );
  const [allowDownload, setAllowDownload] = useState<boolean>(
    resource ? resource.allowDownload : true
  );

  // Past paper specific fields
  const [year, setYear] = useState<number>(resource?.year || 2025);
  const [medium, setMedium] = useState<"Tamil" | "English" | "Sinhala" | "Trilingual" | "All">(
    resource?.medium || "Tamil"
  );
  const [examType, setExamType] = useState<
    "G.C.E. Advanced Level" | "G.C.E. Ordinary Level" | "Provincial Term Test" | "School Model Paper"
  >(resource?.examType || "G.C.E. Advanced Level");
  const [paperPart, setPaperPart] = useState<
    "Paper I (MCQ)" | "Paper II (Structured & Essay)" | "Complete Set (Paper I + II)" | "Marking Scheme"
  >(resource?.paperPart || "Complete Set (Paper I + II)");
  const [hasMarkingScheme, setHasMarkingScheme] = useState<boolean>(
    resource?.hasMarkingScheme ?? true
  );
  const [markingSchemeNotes, setMarkingSchemeNotes] = useState<string>(
    resource?.markingSchemeNotes || ""
  );
  const [timeAllowedMinutes, setTimeAllowedMinutes] = useState<number>(
    resource?.timeAllowedMinutes || 180
  );

  // Cover image preset picker
  const coverPresets = [
    {
      label: "Mathematics & Vectors",
      url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80"
    },
    {
      label: "Physics & Waves",
      url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80"
    },
    {
      label: "Chemistry Lab",
      url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80"
    },
    {
      label: "Biology & Botany",
      url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80"
    },
    {
      label: "ICT & Computing",
      url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"
    },
    {
      label: "Literature & Arts",
      url: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80"
    }
  ];

  const [coverImage, setCoverImage] = useState(
    resource?.coverImage || coverPresets[0].url
  );

  // Form error validation
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (publish: boolean) => {
    if (!title.trim()) {
      setError("Please provide a resource title.");
      return;
    }
    if (!subject.trim()) {
      setError("Please select or enter a subject.");
      return;
    }
    if (!author.trim()) {
      setError("Please specify the author/teacher name.");
      return;
    }

    setError(null);
    onSave(
      {
        title,
        resourceType,
        subject,
        author,
        description,
        topic: resourceType === "tute" ? topic : undefined,
        category: resourceType === "past_paper" ? "Past Papers & Model Exams" : category,
        coverImage,
        fileType,
        fileSize,
        visibility,
        allowDownload,
        year: resourceType === "past_paper" ? Number(year) : undefined,
        medium: resourceType === "past_paper" ? medium : undefined,
        examType: resourceType === "past_paper" ? examType : undefined,
        paperPart: resourceType === "past_paper" ? paperPart : undefined,
        hasMarkingScheme: resourceType === "past_paper" ? hasMarkingScheme : undefined,
        markingSchemeUrl: resourceType === "past_paper" && hasMarkingScheme ? "https://www.doenets.lk" : undefined,
        markingSchemePages: resourceType === "past_paper" && hasMarkingScheme ? 8 : undefined,
        markingSchemeNotes: resourceType === "past_paper" ? markingSchemeNotes : undefined,
        timeAllowedMinutes: resourceType === "past_paper" ? Number(timeAllowedMinutes) : undefined
      },
      publish
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="p-6 border-b border-[#e6ece8] flex items-center justify-between bg-[#fbfcfb]">
          <div>
            <h3 className="font-extrabold text-base text-[#0d2b26]">
              {resource ? "Edit Library Resource" : "Upload Educational Resource"}
            </h3>
            <p className="text-xs text-slate-500">
              Provide resource details, subject curriculum, and attach learning materials.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Resource Type Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Resource Type *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setResourceType("book")}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                  resourceType === "book"
                    ? "bg-purple-50/70 border-purple-300 text-purple-900 shadow-xs ring-1 ring-purple-400/30"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="h-4 w-4 text-purple-600 shrink-0" />
                <div>
                  <p className="font-bold">Book / Textbook</p>
                  <p className="text-[10px] text-slate-400">Curriculum reference</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setResourceType("tute")}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                  resourceType === "tute"
                    ? "bg-[#ecf8f5] border-[#a5f3df] text-[#0d5c4d] shadow-xs ring-1 ring-[#0d5c4d]/30"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FileText className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                <div>
                  <p className="font-bold">Tute / Material</p>
                  <p className="text-[10px] text-slate-400">Notes & cheat-sheet</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setResourceType("past_paper")}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                  resourceType === "past_paper"
                    ? "bg-amber-50/80 border-amber-300 text-amber-950 shadow-xs ring-1 ring-amber-400/40"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <GraduationCap className="h-4 w-4 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold">Past Paper & Scheme</p>
                  <p className="text-[10px] text-slate-400">Exams & marking rubric</p>
                </div>
              </button>
            </div>
          </div>

          {/* Past Paper Specific Configuration Section */}
          {resourceType === "past_paper" && (
            <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Award className="h-4 w-4 text-amber-600" />
                <span>Past Paper & Marking Scheme Details</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Exam Year *</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 bg-white text-xs font-semibold"
                  >
                    {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Medium *</label>
                  <select
                    value={medium}
                    onChange={(e) => setMedium(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 bg-white text-xs font-semibold"
                  >
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="English">English</option>
                    <option value="Sinhala">Sinhala (සිංහල)</option>
                    <option value="Trilingual">Trilingual</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Exam Level *</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 bg-white text-xs font-semibold"
                  >
                    <option value="G.C.E. Advanced Level">G.C.E. A/L</option>
                    <option value="G.C.E. Ordinary Level">G.C.E. O/L</option>
                    <option value="Provincial Term Test">Provincial / Model</option>
                    <option value="School Model Paper">School Model Paper</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Component</label>
                  <select
                    value={paperPart}
                    onChange={(e) => setPaperPart(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 bg-white text-xs font-semibold"
                  >
                    <option value="Complete Set (Paper I + II)">Both (Paper I + II)</option>
                    <option value="Paper I (MCQ)">Paper I (MCQ)</option>
                    <option value="Paper II (Structured & Essay)">Paper II (Essay)</option>
                    <option value="Marking Scheme">Marking Scheme Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-amber-200/80">
                  <input
                    type="checkbox"
                    id="hasSchemeCheckbox"
                    checked={hasMarkingScheme}
                    onChange={(e) => setHasMarkingScheme(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="hasSchemeCheckbox" className="text-[11px] font-bold text-slate-700 cursor-pointer">
                    Official Marking Scheme Attached
                  </label>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-amber-200/80">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-700">Timer:</span>
                  <input
                    type="number"
                    value={timeAllowedMinutes}
                    onChange={(e) => setTimeAllowedMinutes(Number(e.target.value))}
                    min={30}
                    max={360}
                    step={15}
                    className="w-16 px-2 py-0.5 rounded border border-slate-200 text-xs font-bold text-center"
                  />
                  <span className="text-[11px] text-slate-500">mins (practice)</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-[11px]">
                  Chief Examiner / Scheme Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Department of Examinations official marking scheme with step marks and common student errors."
                  value={markingSchemeNotes}
                  onChange={(e) => setMarkingSchemeNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-amber-200 bg-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Resource Title *</label>
            <input
              type="text"
              placeholder={
                resourceType === "past_paper"
                  ? "e.g. 2025 G.C.E. A/L Combined Mathematics Past Paper & Scheme"
                  : "e.g. Mechanics & Circular Motion Comprehensive Revision"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6dfd9] text-xs focus:ring-2 focus:ring-[#0d5c4d]/20 focus:border-[#0d5c4d] bg-[#fbfcfb]"
            />
          </div>

          {/* Subject & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Subject *</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#d6dfd9] text-xs bg-white text-slate-700 font-semibold focus:ring-2 focus:ring-[#0d5c4d]/20"
              >
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
                <option value="General Science">General Science</option>
                <option value="Economics">Economics</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Author / Teacher *</label>
              <input
                type="text"
                placeholder={resourceType === "past_paper" ? "Department of Examinations, Sri Lanka" : "Author Name"}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6dfd9] text-xs bg-[#fbfcfb] focus:ring-2 focus:ring-[#0d5c4d]/20"
              />
            </div>
          </div>

          {/* Topic (for Tutes) and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resourceType === "tute" && (
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Topic / Module</label>
                <input
                  type="text"
                  placeholder="e.g. Unit 3: Rotational Mechanics"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d6dfd9] text-xs bg-[#fbfcfb] focus:ring-2 focus:ring-[#0d5c4d]/20"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#d6dfd9] text-xs bg-white text-slate-700 font-semibold focus:ring-2 focus:ring-[#0d5c4d]/20"
              >
                <option value="Advanced Level">Advanced Level</option>
                <option value="Ordinary Level">Ordinary Level</option>
                <option value="STEM & Computing">STEM & Computing</option>
                <option value="Tute & Problem Pack">Tute & Problem Pack</option>
                <option value="Past Papers & Model Exams">Past Papers & Model Exams</option>
                <option value="Reference & Handbook">Reference & Handbook</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="Outline what students will learn, problem types covered, and study advice..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#d6dfd9] text-xs bg-[#fbfcfb] focus:ring-2 focus:ring-[#0d5c4d]/20"
            />
          </div>

          {/* Cover Image Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Cover Thumbnail</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {coverPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverImage(preset.url)}
                  className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                    coverImage === preset.url
                      ? "border-[#0d5c4d] shadow-sm ring-2 ring-[#0d5c4d]/30"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="h-full w-full object-cover"
                  />
                  {coverImage === preset.url && (
                    <span className="absolute inset-0 bg-[#0d5c4d]/30 flex items-center justify-center text-white">
                      <Check className="h-4 w-4 drop-shadow" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Resource File Upload Simulation */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Resource File *</label>
            <div className="border-2 border-dashed border-[#c4e9e0] bg-[#f6f9f7] rounded-xl p-4 text-center space-y-1">
              <UploadCloud className="h-6 w-6 text-[#0d5c4d] mx-auto" />
              <p className="font-bold text-[#0d2b26]">File Attached & Ready</p>
              <p className="text-[10px] text-slate-400">
                Format: {fileType} · Allocated: {fileSize}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] text-slate-500 font-semibold">Format:</span>
              {(["PDF", "EPUB", "DOCX"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFileType(fmt)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    fileType === fmt
                      ? "bg-[#0d5c4d] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility & Permissions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#e6ece8]">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#d6dfd9] text-xs bg-white text-slate-700 font-semibold"
              >
                <option value="public">Public (All Students)</option>
                <option value="class_only">Enrolled Classes Only</option>
                <option value="private">Private (Author Only)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="allowDownloadCheck"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                className="h-4 w-4 text-[#0d5c4d] rounded border-slate-300 focus:ring-[#0d5c4d]"
              />
              <label htmlFor="allowDownloadCheck" className="text-xs font-semibold text-slate-700">
                Permit Offline Download
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#e6ece8] bg-[#fbfcfb] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2.5 rounded-xl border border-[#d6dfd9] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-5 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
            >
              Publish Resource
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
