"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
  MoreVertical,
  Eye,
  Search,
  Filter,
  Users,
  GraduationCap,
  Building2,
  AlertTriangle,
  AlertCircle,
  Megaphone,
  Radio,
  FileText,
  Printer,
  ShieldCheck,
  Send,
  Lock,
  Sparkles,
  Clock,
  Globe,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Announcement } from "@/types/lms";

// Helper function to detect audience scope
export function getAudienceCategory(targetAudience: string): "all" | "teachers" | "students" {
  const lower = (targetAudience || "").toLowerCase();
  if (lower.includes("tutor") || lower.includes("teacher") || lower.includes("coach") || lower.includes("faculty") || lower.includes("staff")) {
    return "teachers";
  }
  if (
    lower.includes("student") ||
    lower.includes("subscriber") ||
    lower.includes("candidate") ||
    lower.includes("grade") ||
    lower.includes("player") ||
    lower.includes("squad")
  ) {
    return "students";
  }
  return "all";
}

export function AnnouncementsView() {
  const { announcements, t, currentRole, currentUser, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useApp();
  const isAdmin = currentRole === "admin";
  const isTeacher = currentRole === "teacher";
  const isStudent = currentRole === "student";

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAudience, setFilterAudience] = useState<string>("all");

  // Expandable cards
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // 3-dot menu dropdown state
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Editor Modal State (Create / Edit)
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    message: "",
    targetAudience: "Platform-Wide (Everyone)",
    priority: "normal" as Announcement["priority"]
  });

  // Preview Modal State
  const [previewCircular, setPreviewCircular] = useState<Announcement | null>(null);

  // Delete Confirmation Modal State
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

  // Available audience choices for publishing
  const audienceOptions = [
    { value: "Platform-Wide (Everyone)", label: "Platform-Wide (Everyone)", desc: "Visible to all students, solo tutors, coaches & admins" },
    { value: "Solo Tutors & Coaches", label: "Solo Tutors & Coaches", desc: "Confidential notices, payout updates & tutor guidelines" },
    { value: "Students & Subscribers", label: "Students & Subscribers", desc: "Course materials, subscription alerts & student notices" },
    { value: "Sports Squad & Coaches", label: "Sports Squad & Coaches", desc: "Tournament fixtures, match schedules & athletic updates" },
    { value: "Parents & Guardians", label: "Parents & Guardians", desc: "Subscription invoices & progress reports" }
  ];

  // Open Create Modal
  const openCreate = () => {
    setEditingAnnouncement(null);
    setDraft({
      title: "",
      message: "",
      targetAudience: "Platform-Wide (Everyone)",
      priority: "normal"
    });
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const openEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setDraft({
      title: announcement.title,
      message: announcement.message,
      targetAudience: announcement.targetAudience,
      priority: announcement.priority
    });
    setIsEditorOpen(true);
  };

  // Submit Save Announcement
  const saveAnnouncement = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingAnnouncement) {
      updateAnnouncement(editingAnnouncement.id, draft);
    } else {
      createAnnouncement(draft);
    }
    setIsEditorOpen(false);
  };

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Audience counts for admin metrics
  const totalCount = announcements.length;
  const urgentHighCount = announcements.filter(
    (a) => a.priority === "urgent" || a.priority === "high"
  ).length;
  const wholeSchoolCount = announcements.filter((a) => getAudienceCategory(a.targetAudience) === "all").length;
  const teachersCount = announcements.filter((a) => getAudienceCategory(a.targetAudience) === "teachers").length;
  const studentsCount = announcements.filter((a) => getAudienceCategory(a.targetAudience) === "students").length;

  // Filtered announcements based on role permissions and filters
  const visibleAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const audienceCategory = getAudienceCategory(ann.targetAudience);

      // Role-based visibility security:
      // If student: strictly exclude announcements targeted exclusively to "Teachers Only"
      if (isStudent && audienceCategory === "teachers") {
        return false;
      }

      // Priority filter
      if (filterPriority !== "all" && ann.priority !== filterPriority) {
        return false;
      }

      // Audience filter
      if (filterAudience !== "all") {
        if (filterAudience === "common" && audienceCategory !== "all") return false;
        if (filterAudience === "teachers" && audienceCategory !== "teachers") return false;
        if (filterAudience === "students" && audienceCategory !== "students") return false;
      }

      // Search keyword filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = ann.title.toLowerCase().includes(query);
        const matchMsg = ann.message.toLowerCase().includes(query);
        const matchAuthor = ann.authorName.toLowerCase().includes(query);
        const matchAudience = ann.targetAudience.toLowerCase().includes(query);
        if (!matchTitle && !matchMsg && !matchAuthor && !matchAudience) {
          return false;
        }
      }

      return true;
    });
  }, [announcements, isStudent, filterPriority, filterAudience, searchQuery]);

  // Priority Badge Helper
  const renderPriorityBadge = (priority: Announcement["priority"]) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
            Urgent Notice
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            High Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-[#0d5c4d] border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0d5c4d]" />
            Official Notice
          </span>
        );
    }
  };

  // Audience Badge Helper
  const renderAudienceBadge = (targetAudience: string) => {
    const cat = getAudienceCategory(targetAudience);
    if (cat === "teachers") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Lock className="h-3.5 w-3.5 text-indigo-600" />
          Solo Tutors & Coaches
        </span>
      );
    }
    if (cat === "students") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
          <GraduationCap className="h-3.5 w-3.5 text-sky-600" />
          {targetAudience}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0]">
        <Globe className="h-3.5 w-3.5 text-[#0d5c4d]" />
        Platform-Wide
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & BROADCAST OVERVIEW STATS (ADMIN SPECIAL VIEW) */}
      {/* ============================================================ */}
      {isAdmin ? (
        <div className="space-y-5">
          {/* Admin Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e6ece8]">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-[#0d5c4d] text-white flex items-center justify-center shadow-md">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#0d2b26] flex items-center gap-2">
                    Platform Announcements
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Broadcast platform-wide updates, tutor guidelines, student notices, and system alerts.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={openCreate}
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold h-10 px-4 rounded-xl shadow-sm gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Publish Announcement
              </Button>
            </div>
          </div>

          {/* Broadcast Overview KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Total Announcements */}
            <Card className="border-[#e6ece8] bg-white shadow-2xs hover:shadow-xs transition-shadow">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#0d2b26] leading-none">{totalCount}</p>
                  <p className="text-xs font-bold text-slate-500 mt-1">Total Announcements</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Active platform broadcasts</p>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: High / Urgent Alerts */}
            <Card className="border-[#e6ece8] bg-white shadow-2xs hover:shadow-xs transition-shadow">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-rose-600 leading-none">{urgentHighCount}</p>
                  <p className="text-xs font-bold text-slate-500 mt-1">Active High & Urgent Alerts</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Priority broadcasts highlighted in feeds</p>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Audience Reach Breakdown */}
            <Card className="border-[#e6ece8] bg-white shadow-2xs hover:shadow-xs transition-shadow">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-[#fef7e6] text-[#b47a16] flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-600">Audience Reach</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#ecf8f5] text-[#0d5c4d]">
                      <Globe className="h-3 w-3" /> {wholeSchoolCount} All Users
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      <Lock className="h-3 w-3" /> {teachersCount} Tutors
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700">
                      <GraduationCap className="h-3 w-3" /> {studentsCount} Students
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Standard Header for Students & Teachers */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6ece8]">
          <div>
            <h1 className="text-2xl font-black text-[#0d2b26] flex items-center gap-2">
              <Bell className="h-6 w-6 text-[#0d5c4d]" />
              Platform Announcements
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Official platform updates, tutor notices, tournament schedules, and system alerts.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. SEARCH & ADVANCED FILTER CONTROLS BAR */}
      {/* ============================================================ */}
      <div className="bg-white p-4 rounded-2xl border border-[#e6ece8] shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements by title, keyword, or author..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#f8faf9] border border-[#e2eae5] text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d] transition-all"
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

          {/* Priority Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Priority:</span>
            <div className="flex items-center bg-[#f8faf9] border border-[#e2eae5] rounded-xl p-1 shadow-2xs">
              {[
                { id: "all", label: "All" },
                { id: "urgent", label: "Urgent" },
                { id: "high", label: "High" },
                { id: "normal", label: "Normal" }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilterPriority(p.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterPriority === p.id
                      ? "bg-[#0d5c4d] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#0d5c4d]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Target Audience Filter Tabs */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Audience Reach:</span>

          <button
            onClick={() => setFilterAudience("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterAudience === "all"
                ? "bg-[#0d2b26] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Broadcasts ({announcements.length})
          </button>

          <button
            onClick={() => setFilterAudience("common")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterAudience === "common"
                ? "bg-[#0d5c4d] text-white"
                : "bg-[#ecf8f5] text-[#0d5c4d] hover:bg-[#d8f2eb]"
            }`}
          >
            <Globe className="h-3 w-3" />
            Platform-Wide ({wholeSchoolCount})
          </button>

          {/* Solo Tutors tab */}
          {(!isStudent || isAdmin) && (
            <button
              onClick={() => setFilterAudience("teachers")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterAudience === "teachers"
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              }`}
            >
              <Lock className="h-3 w-3" />
              Solo Tutors & Coaches ({teachersCount})
            </button>
          )}

          {/* Students Only tab */}
          <button
            onClick={() => setFilterAudience("students")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterAudience === "students"
                ? "bg-sky-600 text-white"
                : "bg-sky-50 text-sky-700 hover:bg-sky-100"
            }`}
          >
            <GraduationCap className="h-3 w-3" />
            Students & Subscribers ({studentsCount})
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. ANNOUNCEMENTS LIST / CARDS FEED */}
      {/* ============================================================ */}
      <div className="space-y-4">
        {visibleAnnouncements.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#e6ece8] shadow-2xs space-y-3">
            <div className="h-12 w-12 rounded-full bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center mx-auto">
              <Megaphone className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#0d2b26]">No Announcements Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No announcements match your current search query or filter criteria. Try adjusting the audience or priority filter.
            </p>
            {isAdmin && (
              <Button onClick={openCreate} className="mt-2 bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold">
                <Plus className="h-3.5 w-3.5 mr-1" /> Create Announcement
              </Button>
            )}
          </div>
        ) : (
          visibleAnnouncements.map((ann) => {
            const isLong = ann.message.length > 220 || ann.message.includes("\n\n");
            const isExpanded = expandedIds[ann.id] ?? false;

            return (
              <Card
                key={ann.id}
                className="border-[#e6ece8] bg-white shadow-xs hover:border-[#b2e5d9] transition-all overflow-hidden"
              >
                {/* Card Header */}
                <CardHeader className="p-5 pb-3 border-b border-[#f0f4f1] space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    {/* Audience & Priority Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {renderAudienceBadge(ann.targetAudience)}
                      {renderPriorityBadge(ann.priority)}
                    </div>

                    {/* Right side: Timestamp & 3-Dot Action Menu */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {ann.publishedAt}
                      </span>

                      {/* 3-Dot Menu */}
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionMenuId(openActionMenuId === ann.id ? null : ann.id);
                          }}
                          className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Floating Action Dropdown */}
                        {openActionMenuId === ann.id && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setOpenActionMenuId(null)}
                            />
                            <div className="absolute right-0 top-9 z-30 w-48 rounded-xl bg-white border border-[#e2eae5] shadow-lg py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left">
                              {/* Option 1: Preview Announcement */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  setPreviewCircular(ann);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] transition-colors cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-[#0d5c4d]" />
                                <span>Preview Bulletin</span>
                              </button>

                              {/* Admin Management options: Edit & Delete */}
                              {isAdmin && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      openEdit(ann);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] transition-colors cursor-pointer"
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-[#0d5c4d]" />
                                    <span>Edit Announcement</span>
                                  </button>

                                  <div className="h-px bg-slate-100 my-1" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      setAnnouncementToDelete(ann);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                    <span>Delete Announcement</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <CardTitle
                    className="text-lg font-black text-[#0d2b26] cursor-pointer hover:text-[#0d5c4d] transition-colors"
                    onClick={() => setPreviewCircular(ann)}
                  >
                    {ann.title}
                  </CardTitle>
                </CardHeader>

                {/* Card Body */}
                <CardContent className="p-5 space-y-4">
                  <div className="text-sm text-slate-700 leading-relaxed">
                    <div className={`whitespace-pre-line space-y-2 ${!isExpanded && isLong ? "line-clamp-3" : ""}`}>
                      {ann.message}
                    </div>

                    {isLong && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(ann.id)}
                        className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-[#0d5c4d] hover:text-[#083e34] hover:underline cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3.5 w-3.5" /> Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" /> Read Full Announcement / Detailed Notice
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#f0f4f1] text-xs text-slate-500">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-[#ecf8f5] text-[#0d5c4d] font-bold text-xs flex items-center justify-center border border-[#c4e9e0]">
                        {ann.authorName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">{ann.authorName}</span>
                        <span className="text-[11px] text-slate-400 ml-1.5 font-medium">({ann.authorRole})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#0d5c4d] font-bold flex items-center gap-1 bg-[#ecf8f5] px-2 py-0.5 rounded-md border border-[#c4e9e0]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#0d5c4d]" />
                        Verified Platform Notice
                      </span>

                      <button
                        type="button"
                        onClick={() => setPreviewCircular(ann)}
                        className="text-xs font-bold text-[#0d5c4d] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" /> Official Bulletin
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. ANNOUNCEMENT PUBLISHING MODAL (CREATE / EDIT) */}
      {/* ============================================================ */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingAnnouncement ? "Edit Platform Announcement" : "Publish New Platform Announcement"}
        description="Broadcast an official platform notice, tutor update, or student bulletin."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={saveAnnouncement} className="space-y-4 pt-2">
          {/* Announcement Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Announcement Title <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="e.g. Platform Upgrade: Interactive Whiteboard & Payout Cycle"
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          {/* Target Audience & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Audience */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Audience <span className="text-rose-500">*</span>
              </label>
              <select
                value={draft.targetAudience}
                onChange={(e) => setDraft({ ...draft, targetAudience: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              >
                {audienceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {audienceOptions.find((o) => o.value === draft.targetAudience)?.desc || "Designated announcement recipients"}
              </p>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={draft.priority}
                onChange={(e) => setDraft({ ...draft, priority: e.target.value as Announcement["priority"] })}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="normal">Normal (Routine Notice)</option>
                <option value="high">High (Featured Announcement)</option>
                <option value="urgent">Urgent (Immediate Attention)</option>
              </select>
              <div className="mt-1.5 flex items-center gap-1 text-[11px]">
                {draft.priority === "urgent" && (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Broadcasts with prominent red urgency banner
                  </span>
                )}
                {draft.priority === "high" && (
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Highlights on student & tutor dashboard feeds
                  </span>
                )}
                {draft.priority === "normal" && (
                  <span className="text-slate-500">Standard notice in announcement feed</span>
                )}
              </div>
            </div>
          </div>

          {/* Announcement Message */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Official Message / Notice Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={draft.message}
              onChange={(e) => setDraft({ ...draft, message: e.target.value })}
              placeholder="Draft your announcement body text with bullet points, session timings, and guidelines..."
              className="w-full p-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0d5c4d] leading-relaxed resize-y"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-2">
              <Send className="h-4 w-4" />
              {editingAnnouncement ? "Save Changes" : "Broadcast Announcement"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* 5. OFFICIAL ANNOUNCEMENT BULLETIN PREVIEW MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(previewCircular)}
        onClose={() => setPreviewCircular(null)}
        title="Official Announcement Bulletin"
        description="Formatted official bulletin view of this platform broadcast."
        maxWidth="max-w-2xl"
      >
        {previewCircular && (
          <div className="space-y-5 pt-1">
            {/* Printable Formal Institutional Letterhead Card */}
            <div className="p-6 rounded-2xl bg-white border-2 border-[#d8e6df] shadow-xs space-y-4 font-sans text-slate-900">
              {/* Letterhead Header */}
              <div className="text-center pb-4 border-b-2 border-[#0d5c4d] relative">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="h-8 w-8 rounded-lg bg-[#0d5c4d] text-white flex items-center justify-center font-black text-sm">
                    EP
                  </div>
                  <h2 className="text-base font-black tracking-wider uppercase text-[#0d2b26]">
                    EduPlatform Network
                  </h2>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Central Administration & Academic Operations Desk
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Ref: EP/NOTICE/2026-{previewCircular.id.replace("ann_", "0")} &bull; Dispatched: {previewCircular.publishedAt}
                </p>
              </div>

              {/* Notice Metadata Band */}
              <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-[#f8faf9] border border-slate-200">
                <div>
                  <span className="font-bold text-slate-500 text-[10px] uppercase block">Addressed To:</span>
                  <span className="font-bold text-[#0d5c4d]">{previewCircular.targetAudience}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-500 text-[10px] uppercase block">Priority Rating:</span>
                  <span className="capitalize font-black text-slate-800">{previewCircular.priority} Priority</span>
                </div>
              </div>

              {/* Notice Subject */}
              <div>
                <h3 className="text-base font-black text-[#0d2b26] leading-snug">
                  SUBJECT: {previewCircular.title.toUpperCase()}
                </h3>
              </div>

              {/* Notice Message */}
              <div className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-normal py-2">
                {previewCircular.message}
              </div>

              {/* Official Sign-off Stamp */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-[#0d5c4d]">Digitally Verified Notice</div>
                  <p className="text-[10px] text-slate-500">EduPlatform Central Administration System</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs text-slate-900">{previewCircular.authorName}</p>
                  <p className="text-[11px] text-slate-500">{previewCircular.authorRole}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2 text-xs font-bold"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" /> Print / Save PDF
              </Button>

              <div className="flex gap-2">
                {isAdmin && (
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs font-bold"
                    onClick={() => {
                      const cur = previewCircular;
                      setPreviewCircular(null);
                      openEdit(cur);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit Announcement
                  </Button>
                )}
                <Button
                  type="button"
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold"
                  onClick={() => setPreviewCircular(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* 6. DELETE CONFIRMATION DIALOG */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(announcementToDelete)}
        onClose={() => setAnnouncementToDelete(null)}
        title="Delete Platform Announcement"
        description="Are you sure you want to retract and delete this announcement from the platform?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-2">
          {announcementToDelete && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
              <p className="font-bold">{announcementToDelete.title}</p>
              <p className="text-[11px] text-rose-700 mt-1">
                Audience: {announcementToDelete.targetAudience} &bull; Priority: {announcementToDelete.priority}
              </p>
            </div>
          )}

          <p className="text-xs text-slate-500">
            This will immediately remove the notice from tutor and student boards across the platform.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setAnnouncementToDelete(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (announcementToDelete) deleteAnnouncement(announcementToDelete.id);
                setAnnouncementToDelete(null);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Delete Announcement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
