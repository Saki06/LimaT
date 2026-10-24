"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Home,
  BookOpen,
  FileText,
  HelpCircle,
  Award,
  Trophy,
  Calendar,
  Bell,
  Users,
  User,
  Layers,
  Settings,
  School,
  ClipboardCheck,
  Building2,
  Library,
  GraduationCap,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Flame,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  Bookmark,
  Link2,
  Video,
  Sliders,
  CreditCard,
  Shield,
  Package,
  UserCheck,
  Globe,
  Sparkles,
  X,
  Search
} from "lucide-react";

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavSubItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "warning" | "default" | "gold";
  group?: string;
  children?: NavSubItem[];
}

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const { currentRole, currentView, setCurrentView, t, submissions, isFeatureEnabled } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    my_learning: true,
    school_life: false,
    sports: true
  });
  const [selectedStreakDate, setSelectedStreakDate] = useState<number>(2);
  const [miniCalMonth, setMiniCalMonth] = useState<number>(9); // 9 = October
  const [miniCalYear, setMiniCalYear] = useState<number>(2026);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const pendingSubmissionsCount = submissions.filter(
    (s) => s.status === "submitted"
  ).length;

  const handleNavClick = (view: string) => {
    setCurrentView(view);
    onCloseMobile();
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Structured Nav with Groups
  const rawStudentNav: NavItem[] = [
    // Core Learning Group
    { id: "dashboard", label: t.nav.dashboard, icon: Home, group: "Core Learning" },
    ...(isFeatureEnabled("tuition_subscriptions") && isFeatureEnabled("find_teachers")
      ? [
          {
            id: "connect",
            label: "Find Teachers",
            icon: GraduationCap,
            badge: "Tutors",
            badgeVariant: "gold" as const,
            group: "Core Learning"
          }
        ]
      : []),
    ...(isFeatureEnabled("live_broadcast_studio")
      ? [
          {
            id: "live_schedule",
            label: "Live Video Classes",
            icon: Video,
            badge: "Live",
            badgeVariant: "gold" as const,
            group: "Core Learning"
          }
        ]
      : []),
    {
      id: "my_learning",
      label: t.nav.myLearning || "My Learning",
      icon: BookOpen,
      group: "Core Learning",
      children: [
        ...(isFeatureEnabled("syllabus_builder")
          ? [{ id: "courses", label: "Syllabus & Lessons", icon: BookOpen }]
          : []),
        ...(isFeatureEnabled("assignments_grading")
          ? [
              {
                id: "assignments",
                label: t.nav.assignments,
                icon: FileText,
                badge: "2 Active"
              },
              { id: "quizzes", label: t.nav.quizzes, icon: GraduationCap }
            ]
          : []),
        ...(isFeatureEnabled("past_papers_library")
          ? [
              {
                id: "past_papers",
                label: t.nav.pastPapers || "Past Papers",
                icon: Layers,
                badge: "Archive"
              }
            ]
          : [])
      ]
    },
    ...(isFeatureEnabled("past_papers_library")
      ? [
          {
            id: "library",
            label: t.nav.library || "Library",
            icon: Library,
            badge: "Hub",
            badgeVariant: "default" as const,
            group: "Core Learning"
          }
        ]
      : []),

    // Sports & Tournaments with Sub-headings
    {
      id: "sports",
      label: "My Sports",
      icon: Trophy,
      badgeVariant: "gold" as const,
      group: "Sports & Academy",
      children: [
        {
          id: "sports_tournaments",
          label: "Tournaments & Championships",
          icon: Trophy,
          badge: "Live"
        },
        {
          id: "sports_registration",
          label: "Online Registration",
          icon: Sparkles,
          badge: "Open"
        },
        {
          id: "sports_check",
          label: "Check My Registration",
          icon: Search
        },
        {
          id: "sports_fixtures",
          label: "Fixtures & Schedule",
          icon: Calendar
        },
        {
          id: "sports_standings",
          label: "League Standings",
          icon: TrendingUp
        }
      ]
    },

    // Account & Profile
    { id: "profile", label: "My Profile", icon: User, group: "Personal Account" }
  ];

  const rawTeacherNav: NavItem[] = [
    { id: "dashboard", label: "Tutor Studio Overview", icon: Home, group: "Teaching Studio" },

    ...(isFeatureEnabled("live_broadcast_studio")
      ? [
          {
            id: "live_schedule",
            label: "Live Video Classes",
            icon: Video,
            badge: "Live",
            badgeVariant: "default" as const,
            group: "Teaching Studio"
          }
        ]
      : []),
    ...(isFeatureEnabled("tuition_subscriptions") || isFeatureEnabled("bank_slip_approvals")
      ? [
          {
            id: "connect",
            label: "Packages & Subscribers",
            icon: Package,
            badge: "Packages",
            badgeVariant: "gold" as const,
            group: "Teaching Studio"
          }
        ]
      : []),
    ...(isFeatureEnabled("syllabus_builder")
      ? [{ id: "syllabus", label: "Packages & Syllabus", icon: Layers, group: "Teaching Studio" }]
      : []),
    ...(isFeatureEnabled("assignments_grading")
      ? [
          { id: "assignments", label: t.nav.assignments, icon: FileText, group: "Assessments & Review" },
          {
            id: "submissions",
            label: t.nav.submissions,
            icon: ClipboardCheck,
            badge: pendingSubmissionsCount > 0 ? `${pendingSubmissionsCount} Pending` : undefined,
            badgeVariant: "warning" as const,
            group: "Assessments & Review"
          }
        ]
      : []),
    ...(isFeatureEnabled("past_papers_library")
      ? [
          {
            id: "library",
            label: "Past Papers & Tutes",
            icon: Library,
            badge: "Author",
            badgeVariant: "gold" as const,
            group: "Assessments & Review"
          }
        ]
      : []),
    // Personal Account & Studio Profile
    { id: "profile", label: "Tutor Profile & Studio", icon: User, group: "Personal Account" }
  ];

  const adminNav: NavItem[] = [
    { id: "dashboard", label: "Tutor Admin Overview", icon: Home, group: "Tutor Operations" },
    ...(isFeatureEnabled("batch_management")
      ? [
          {
            id: "classes",
            label: "Batches & Attendance",
            icon: Users,
            badge: "Active",
            badgeVariant: "gold" as const,
            group: "Tutor Operations"
          },
          {
            id: "announcements",
            label: "Class Notices & Alerts",
            icon: Bell,
            group: "Tutor Operations"
          }
        ]
      : []),
    ...(isFeatureEnabled("tuition_subscriptions")
      ? [
          {
            id: "users",
            label: "Student Directory & Billing",
            icon: UserCheck,
            badge: "Paid",
            badgeVariant: "default" as const,
            group: "Tuition & Billing"
          },
          {
            id: "connect_admin",
            label: "Tuition Fees & Bank Slips",
            icon: CreditCard,
            group: "Tuition & Billing"
          }
        ]
      : []),
    ...(isFeatureEnabled("tutor_branding")
      ? [
          {
            id: "admin_settings",
            label: "Branding, Domain & WhatsApp",
            icon: Globe,
            badge: "Custom Domain",
            badgeVariant: "gold" as const,
            group: "Tutor Branding"
          }
        ]
      : []),
    // Sports & Championship Registrations Admin Desk
    {
      id: "sports",
      label: "Sports Tournaments & Leagues",
      icon: Trophy,
      badge: "Admin Desk",
      badgeVariant: "gold" as const,
      group: "Campus & Sports",
      children: [
        {
          id: "sports_tournaments",
          label: "Manage Tournaments",
          icon: Trophy,
          badge: "Setup"
        },
        {
          id: "sports_registrations",
          label: "Registrations & Approvals",
          icon: ClipboardCheck,
          badge: "Desk"
        },
        {
          id: "sports_fixtures",
          label: "Fixtures & Live Scoring",
          icon: Calendar,
          badge: "Scorecard"
        },
        {
          id: "sports_standings",
          label: "League Standings",
          icon: TrendingUp
        }
      ]
    }
  ];

  const superAdminNav: NavItem[] = [
    { id: "dashboard", label: "Master Dashboard", icon: Home, group: "Platform Owner" },
    {
      id: "super_admin_tenants",
      label: "Client Tenants",
      icon: Building2,
      badge: "Directory",
      badgeVariant: "gold",
      group: "Platform Owner"
    },
    {
      id: "super_admin_matrix",
      label: "Feature Flags",
      icon: Sliders,
      badge: "Matrix",
      badgeVariant: "default",
      group: "Platform Owner"
    },
    {
      id: "super_admin_pricing",
      label: "SaaS Packages",
      icon: CreditCard,
      badge: "Pricing",
      group: "Platform Owner"
    }
  ];

  const parentNav: NavItem[] = [
    { id: "dashboard", label: "Tuition Overview", icon: Home, group: "Parent Portal" },
    { id: "tuition_classes", label: "Enrolled Tutors", icon: GraduationCap, badge: "3 Active", badgeVariant: "gold" as const, group: "Tuition & Academics" },
    { id: "fees", label: "Fees & Bank Slips", icon: CreditCard, badge: "1 Review", badgeVariant: "warning" as const, group: "Tuition & Billing" },
    { id: "progress", label: "Model Paper Marks", icon: Award, group: "Monitoring & Logs" },
    { id: "circulars", label: "Tutor Announcements", icon: Bell, badge: "Notice", badgeVariant: "default" as const, group: "Communication" },
    {
      id: "connect",
      label: "Find More Tutors",
      icon: Sparkles,
      badge: "Explore",
      badgeVariant: "gold" as const,
      group: "Tuition Marketplace"
    }
  ];

  const currentNavItems: NavItem[] = {
    student: rawStudentNav,
    teacher: rawTeacherNav,
    admin: adminNav,
    super_admin: superAdminNav,
    parent: parentNav
  }[currentRole] || rawStudentNav;

  // Group items by their section
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, NavItem[]> = {};
    currentNavItems.forEach((item: NavItem) => {
      const g = item.group || "General";
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    });
    return groups;
  }, [currentNavItems]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* FLOATING GLASS ISLAND ASIDE - Full Length & No Cramped Scrolling */}
      <aside
        className={`fixed lg:static inset-y-0 lg:inset-auto left-0 z-50 lg:z-30 flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "w-20" : "w-[285px]"} h-full py-0 lg:py-2.5 pl-0 lg:pl-3 pr-0`}
      >
        <div className="h-full w-full rounded-none lg:rounded-3xl bg-white border-r lg:border border-[#e2eae5] shadow-[0_16px_40px_-12px_rgba(13,92,77,0.12),0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/5 flex flex-col overflow-hidden relative transition-all">
          {/* Top Glass Header & Collapse / Close Toggle */}
          <div className="p-3 pb-2 border-b border-[#eef4f0] flex items-center justify-between bg-white shrink-0">
            {!isCollapsed && (
              <div className="flex items-center gap-2 pl-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d5c4d]/80">
                  {currentRole} Workspace
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 ml-auto">
              {/* Collapse / Expand Toggle Button (Desktop) */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`hidden lg:flex p-1.5 rounded-xl hover:bg-[#ecf8f5] text-slate-400 hover:text-[#0d5c4d] transition-colors ${
                  isCollapsed ? "mx-auto" : ""
                }`}
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>

              {/* Close Button (Mobile Drawer) */}
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                title="Close Sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation List Area - Full length with clean spacing */}
          <div
            className="flex-1 overflow-y-auto px-2.5 py-2 space-y-2.5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {Object.entries(groupedItems).map(([groupTitle, items], gIdx) => (
              <div key={groupTitle} className="space-y-1">
                {/* Section Group Header */}
                {!isCollapsed ? (
                  <div className="px-3 pt-1 pb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400/90 flex items-center justify-between">
                    <span>{groupTitle}</span>
                    <span className="h-px flex-1 ml-2 bg-slate-100" />
                  </div>
                ) : gIdx > 0 ? (
                  <div className="h-px w-6 mx-auto my-2 bg-slate-200" />
                ) : null}

                {/* Nav Items in this group */}
                {items.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = item.children && item.children.length > 0;
                  const isChildActive = hasChildren && item.children?.some((c) => c.id === currentView);
                  const isActive = currentView === item.id || isChildActive;
                  const isGroupOpen = openGroups[item.id] ?? true;

                  if (hasChildren && !isCollapsed) {
                    return (
                      <div key={item.id} className="space-y-1 pt-0.5">
                        <button
                          onClick={() => toggleGroup(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all group ${
                            isChildActive
                              ? "bg-[#ecf8f5]/80 text-[#0d5c4d]"
                              : "text-slate-600 hover:text-[#0d5c4d] hover:bg-[#f6f9f7]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                                isChildActive ? "text-[#0d5c4d]" : "text-slate-400 group-hover:text-[#0d5c4d]"
                              }`}
                            />
                            <span>{item.label}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-semibold px-1.5 py-0.2 rounded-md bg-slate-100">
                              {item.children?.length}
                            </span>
                            {isGroupOpen ? (
                              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            )}
                          </div>
                        </button>

                        {/* Sub-items Tree */}
                        {isGroupOpen && (
                          <div className="pl-4 ml-3 border-l-2 border-[#e2eae4] space-y-0.5 pt-0.5">
                            {item.children?.map((child, index) => {
                              const ChildIcon = child.icon;
                              const isSubActive = currentView === child.id;
                              const isLast = index === (item.children?.length ?? 0) - 1;

                              return (
                                <button
                                  key={child.id}
                                  onClick={() => handleNavClick(child.id)}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                                    isSubActive
                                      ? "bg-[#ecf8f5] text-[#0d5c4d] font-bold shadow-xs border border-[#c4e9e0]"
                                      : "text-slate-500 hover:text-[#0d5c4d] hover:bg-[#f6f9f7]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="text-slate-300 text-[10px] font-mono select-none">
                                      {isLast ? "└──" : "├──"}
                                    </span>
                                    <ChildIcon
                                      className={`h-3.5 w-3.5 transition-colors shrink-0 ${
                                        isSubActive ? "text-[#0d5c4d]" : "text-slate-400"
                                      }`}
                                    />
                                    <span className="truncate">{child.label}</span>
                                  </div>

                                  {child.badge && (
                                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-[#fef7e6] text-[#b47a16] border border-[#fde4af] ml-auto shrink-0">
                                      {child.badge}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Standard Button Item (Expanded or Collapsed)
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (hasChildren && item.children && item.children.length > 0) {
                          handleNavClick(item.children[0].id);
                        } else {
                          handleNavClick(item.id);
                        }
                      }}
                      className={`w-full flex items-center text-left ${
                        isCollapsed ? "justify-center p-2.5" : "justify-between px-2.5 py-2"
                      } rounded-xl text-xs font-bold transition-all group relative ${
                        isActive
                          ? "bg-gradient-to-r from-[#ecf8f5] to-white text-[#0d5c4d] border border-[#b2e5d9] shadow-[0_2px_10px_rgba(13,92,77,0.06)]"
                          : "text-slate-600 hover:text-[#0d5c4d] hover:bg-[#f6f9f7] hover:translate-x-0.5 border border-transparent"
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {/* Active Indicator Bar on the Left */}
                      {isActive && (
                        <span className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-[#0d5c4d] shadow-[0_0_8px_rgba(13,92,77,0.5)]" />
                      )}

                      <div className="flex items-center gap-2.5 min-w-0 text-left">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-all group-hover:scale-110 ${
                            isActive
                              ? "text-[#0d5c4d]"
                              : "text-slate-400 group-hover:text-[#0d5c4d]"
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="text-left font-bold leading-tight">
                            {item.label}
                          </span>
                        )}
                      </div>

                      {/* Badge if present and not collapsed */}
                      {!isCollapsed && item.badge && (
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 whitespace-nowrap ${
                            item.badgeVariant === "warning"
                              ? "bg-[#fef7e6] text-[#b47a16] border border-[#fde4af]"
                              : item.badgeVariant === "gold"
                              ? "bg-[#fff9e6] text-[#92600b] border border-[#fae59e]"
                              : "bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Mini indicator dot when collapsed and active */}
                      {isCollapsed && isActive && (
                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#0d5c4d]" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* TRENDING BOTTOM MINI-WIDGET (Student Study Streak / Quick Info) */}
          <div className="p-2.5 border-t border-[#eef4f0] bg-white shrink-0">
            {!isCollapsed ? (
              <div className="rounded-2xl p-2.5 bg-gradient-to-br from-[#f6fbf9] to-[#edf7f4] border border-[#d6ede6] text-[11px] text-slate-600 shadow-2xs">
                {currentRole === "student" ? (
                  !isCalendarOpen ? (
                    /* COMPACT STUDY STREAK CARD - Preserves vertical length for all menu options */
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-amber-100/80 border border-amber-200/60 flex items-center justify-center shrink-0">
                          <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#0d2b26] flex items-center gap-1 leading-tight">
                            7d Streak Active
                          </p>
                          <p className="text-[9.5px] text-slate-500">October 2026</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCalendarOpen(true)}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#0d5c4d] bg-white border border-[#c4e9e0] hover:bg-[#ecf8f5] transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Expand Calendar"
                      >
                        <Calendar className="h-3 w-3" />
                        <span>Calendar</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    /* EXPANDED MINI CALENDAR WIDGET */
                    <div className="space-y-2">
                      {/* Mini Calendar Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#0d5c4d]" />
                          <span className="font-extrabold text-[#0d2b26] text-xs">
                            {miniCalMonth === 9 ? "October 2026" : miniCalMonth === 8 ? "September 2026" : "November 2026"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMiniCalMonth((prev) => (prev > 0 ? prev - 1 : 11));
                            }}
                            className="p-1 rounded-md hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors"
                            title="Previous Month"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMiniCalMonth((prev) => (prev < 11 ? prev + 1 : 0));
                            }}
                            className="p-1 rounded-md hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors"
                            title="Next Month"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsCalendarOpen(false)}
                            className="ml-1 p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Minimize Calendar"
                          >
                            <ChevronDown className="h-3 w-3 rotate-180" />
                          </button>
                        </div>
                      </div>

                      {/* Day of Week Headers */}
                      <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-slate-400 uppercase">
                        <span>Su</span>
                        <span>Mo</span>
                        <span>Tu</span>
                        <span>We</span>
                        <span>Th</span>
                        <span>Fr</span>
                        <span>Sa</span>
                      </div>

                      {/* Date Cells Grid */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {[27, 28, 29, 30].map((d) => (
                          <span key={`prev-${d}`} className="h-5 flex items-center justify-center text-[9px] text-slate-300 select-none">
                            {d}
                          </span>
                        ))}
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                          const isToday = d === 2;
                          const isSelected = selectedStreakDate === d;
                          const hasStreak = [25, 26, 27, 28, 29, 30, 1].includes(d);
                          const hasEvent = [4, 12, 15, 22].includes(d);

                          return (
                            <button
                              key={`oct-${d}`}
                              type="button"
                              onClick={() => {
                                setSelectedStreakDate(d);
                              }}
                              className={`h-5 w-full rounded-md flex flex-col items-center justify-center text-[9.5px] transition-all relative group cursor-pointer ${
                                isToday
                                  ? "bg-[#0d5c4d] text-white font-black shadow-xs ring-1 ring-[#0d5c4d]/30"
                                  : isSelected
                                  ? "bg-[#d8efe8] text-[#0d5c4d] font-bold"
                                  : hasStreak
                                  ? "bg-[#ecf8f5] text-[#0d5c4d] font-semibold hover:bg-[#def3ed]"
                                  : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                              }`}
                              title={`October ${d}, 2026 ${isToday ? "(Today)" : ""} ${hasStreak ? "• 2+ Hrs Studied" : ""} ${hasEvent ? "• Event Scheduled" : ""}`}
                            >
                              <span>{d}</span>
                              {hasEvent && !isToday && (
                                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-amber-500" />
                              )}
                              {hasStreak && !isToday && !hasEvent && (
                                <span className="absolute bottom-0.5 h-0.5 w-1.5 rounded-full bg-emerald-500/60" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Mini Calendar Footer Info */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[9.5px]">
                        <span className="font-bold text-[#0d5c4d] flex items-center gap-1">
                          <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span>7d Streak Active</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsCalendarOpen(false)}
                          className="text-[9.5px] font-bold text-[#0d5c4d] hover:underline cursor-pointer"
                        >
                          Collapse ▴
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <img
                        src="/images/tozy_icon.jpg"
                        alt="Tozy"
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-400"
                      />
                      <p className="font-black text-xs text-[#0d2b26]">
                        Newtoz • <span className="text-[#0d5c4d] font-bold">Shape Your Future</span>
                      </p>
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-500">
                      Guided by Tozy 🐘🪽 • <span className="font-semibold text-emerald-700">newtoz.com</span>
                    </p>
                  </>
                )}
              </div>
            ) : (
              /* Mini collapsed badge */
              <div
                className="flex items-center justify-center p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200"
                title="7-Day Study Streak Active"
              >
                <Flame className="h-4 w-4 fill-current text-amber-500" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
