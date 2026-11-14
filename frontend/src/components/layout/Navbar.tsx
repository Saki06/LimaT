"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Bell,
  Search,
  Menu,
  Sparkles,
  ChevronDown,
  X,
  CheckCheck,
  CheckCircle2,
  FileText,
  LogOut,
  BookOpen,
  GraduationCap,
  Library,
  Video,
  Trophy,
  User,
  Home,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Announcement } from "@/types/lms";

export function Navbar({ onToggleMobileSidebar }: { onToggleMobileSidebar: () => void }) {
  const {
    currentRole,
    currentUser,
    t,
    announcements,
    courses,
    assignments,
    quizzes,
    libraryResources,
    setSelectedCourseId,
    setSelectedAssignmentId,
    setSelectedQuizId,
    setCurrentView,
    setIsLanding,
    setLandingPortal,
    logoutUser
  } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>([]);
  const [selectedAnnouncementModal, setSelectedAnnouncementModal] = useState<Announcement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { activeTenant } = useApp();

  const readStorageKey = `lms_read_announcements_${currentUser?.id || currentRole || "guest"}`;

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(readStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setReadAnnouncementIds(parsed);
          return;
        }
      }
    } catch {
      // ignore storage parse error
    }
    setReadAnnouncementIds([]);
  }, [readStorageKey]);

  const markAnnouncementsRead = (idsToMark: string[]) => {
    setReadAnnouncementIds((prev) => {
      const merged = Array.from(new Set([...prev, ...idsToMark]));
      if (typeof window !== "undefined") {
        localStorage.setItem(readStorageKey, JSON.stringify(merged));
      }
      return merged;
    });
  };

  const unreadCount = React.useMemo(
    () => announcements.filter((a) => !readAnnouncementIds.includes(a.id)).length,
    [announcements, readAnnouncementIds]
  );
  const hasUnread = unreadCount > 0;

  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: string;
      onSelect: () => void;
    }> = [];

    // 1. Navigation pages matching current role
    const navPages =
      currentRole === "student"
        ? [
            { id: "nav-dashboard", title: "Dashboard", subtitle: "Student Overview & Schedule", view: "dashboard" },
            { id: "nav-connect", title: "Find Teachers & Tutors", subtitle: "Browse & Subscribe to Tutors", view: "connect" },
            { id: "nav-live", title: "Live Video Classes", subtitle: "Join Live & Upcoming Sessions", view: "live_schedule" },
            { id: "nav-courses", title: "Syllabus & Lessons", subtitle: "Enrolled Courses & Units", view: "courses" },
            { id: "nav-assignments", title: "Assignments", subtitle: "Homework & Submissions", view: "assignments" },
            { id: "nav-quizzes", title: "Exams & Online Quizzes", subtitle: "Timed MCQ Practice Tests", view: "quizzes" },
            { id: "nav-pastpapers", title: "Past Papers", subtitle: "Term & Exam Past Papers", view: "past_papers" },
            { id: "nav-library", title: "Library & Study Notes", subtitle: "Books, Tutes & Resources", view: "library" },
            { id: "nav-notices", title: "Notice Board & Circulars", subtitle: "Official Announcements", view: "announcements" },
            { id: "nav-sports", title: "My Sports & Tournaments", subtitle: "Championships & Registrations", view: "sports_tournaments" },
            { id: "nav-profile", title: "My Profile", subtitle: "Personal & Academic Settings", view: "profile" },
          ]
        : currentRole === "teacher"
        ? [
            { id: "nav-dashboard", title: "Tutor Studio Overview", subtitle: "Teaching Dashboard", view: "dashboard" },
            { id: "nav-live", title: "Live Video Classes", subtitle: "Schedule & Broadcast Classes", view: "live_schedule" },
            { id: "nav-connect", title: "Packages & Subscribers", subtitle: "Manage Student Subscriptions", view: "connect" },
            { id: "nav-syllabus", title: "Packages & Syllabus", subtitle: "Course Units & Lessons", view: "syllabus" },
            { id: "nav-assignments", title: "Assignments", subtitle: "Create & Manage Assignments", view: "assignments" },
            { id: "nav-quizzes", title: "Online Quizzes (MCQ)", subtitle: "Create & Manage Exams", view: "quizzes" },
            { id: "nav-submissions", title: "Student Submissions", subtitle: "Grade & Review Work", view: "submissions" },
            { id: "nav-library", title: "Past Papers & Tutes", subtitle: "Upload Study Resources", view: "library" },
            { id: "nav-profile", title: "Tutor Profile & Studio", subtitle: "Educator Settings", view: "profile" },
          ]
        : [
            { id: "nav-dashboard", title: "Dashboard Overview", subtitle: "Main Portal View", view: "dashboard" },
            { id: "nav-notices", title: "Announcements & Notices", subtitle: "Circulars & Alerts", view: "announcements" },
            { id: "nav-profile", title: "My Profile", subtitle: "Account Settings", view: "profile" },
          ];

    navPages.forEach((p) => {
      if (p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)) {
        items.push({
          id: p.id,
          title: p.title,
          subtitle: p.subtitle,
          category: "Page",
          onSelect: () => setCurrentView(p.view),
        });
      }
    });

    // 2. Courses
    courses.forEach((c) => {
      if (
        c.title?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.teacherName?.toLowerCase().includes(q)
      ) {
        items.push({
          id: `course-${c.id}`,
          title: c.title,
          subtitle: `${c.code || "Course"} • ${c.teacherName || "Tutor"}`,
          category: "Course",
          onSelect: () => {
            setSelectedCourseId(c.id);
            setCurrentView(currentRole === "teacher" ? "syllabus" : "courses");
          },
        });
      }
    });

    // 3. Assignments
    assignments.forEach((a) => {
      if (
        a.title?.toLowerCase().includes(q) ||
        a.subjectName?.toLowerCase().includes(q) ||
        a.topicName?.toLowerCase().includes(q)
      ) {
        items.push({
          id: `assign-${a.id}`,
          title: a.title,
          subtitle: `${a.subjectName} • ${a.topicName || "Assignment"}`,
          category: "Assignment",
          onSelect: () => {
            setSelectedAssignmentId(a.id);
            setCurrentView("assignments");
          },
        });
      }
    });

    // 4. Quizzes / Exams
    quizzes.forEach((qz) => {
      if (
        qz.title?.toLowerCase().includes(q) ||
        qz.subjectName?.toLowerCase().includes(q)
      ) {
        items.push({
          id: `quiz-${qz.id}`,
          title: qz.title,
          subtitle: `${qz.subjectName || "Exam"} • ${qz.durationMinutes || 30} mins`,
          category: "Exam",
          onSelect: () => {
            setSelectedQuizId(qz.id);
            setCurrentView("quizzes");
          },
        });
      }
    });

    // 5. Library & Past Papers
    libraryResources.forEach((res) => {
      if (
        res.title?.toLowerCase().includes(q) ||
        res.subject?.toLowerCase().includes(q) ||
        res.author?.toLowerCase().includes(q)
      ) {
        items.push({
          id: `lib-${res.id}`,
          title: res.title,
          subtitle: `${res.subject || "Resource"} • ${res.category || "Library"}`,
          category: "Library",
          onSelect: () => {
            setCurrentView(
              String(res.category || "").toLowerCase().includes("paper") ? "past_papers" : "library"
            );
          },
        });
      }
    });

    // 6. Announcements
    announcements.forEach((ann) => {
      if (
        ann.title?.toLowerCase().includes(q) ||
        ann.message?.toLowerCase().includes(q)
      ) {
        items.push({
          id: `ann-${ann.id}`,
          title: ann.title,
          subtitle: `${ann.authorName || "Notice"} • ${ann.publishedAt || ""}`,
          category: "Notice",
          onSelect: () => {
            setSelectedAnnouncementModal(ann);
          },
        });
      }
    });

    return items.slice(0, 8);
  }, [
    searchQuery,
    currentRole,
    courses,
    assignments,
    quizzes,
    libraryResources,
    announcements,
    setCurrentView,
    setSelectedCourseId,
    setSelectedAssignmentId,
    setSelectedQuizId,
  ]);

  return (
    <header className="h-16 sm:h-20 border-b border-[#e6ece8] bg-white px-3 sm:px-8 flex items-center justify-between shrink-0 z-50 select-none relative">
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Newtoz Brand & Tozy Winged Mascot - Click to All Portals Landing */}
        <div
          onClick={() => {
            setIsLanding(true);
            setLandingPortal("gateway");
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0"
          title="Return to All Portals (Landing Page)"
        >
          {/* Tozy Winged Mascot Logo */}
          <div className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-emerald-300 to-amber-300 p-0.5 shadow-sm group-hover:scale-105 transition-all shrink-0 ring-2 ring-emerald-500/20">
            <img
              src="/images/tozy_icon.jpg"
              alt="Tozy - Newtoz Mascot"
              className="w-full h-full object-cover rounded-[14px] bg-white"
            />
            <span className="absolute -top-1 -right-1 text-xs animate-bounce pointer-events-none">✨</span>
          </div>
          <div className="min-w-0">
            <span className="font-black text-base sm:text-xl tracking-tight text-[#0d2b26] block leading-tight">
              Newtoz
            </span>
            <p className="text-[9px] uppercase tracking-widest text-[#0d5c4d] font-black hidden sm:block">
              Shape Your Future
            </p>
          </div>
        </div>
      </div>

      {/* Center Search (Hidden in Parent Portal) */}
      {currentRole !== "parent" && (
        <div className="hidden md:flex items-center max-w-sm w-full mx-6 relative">
        <div className="relative w-full z-50">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsSearchOpen(false);
              } else if (e.key === "Enter" && searchResults.length > 0) {
                e.preventDefault();
                searchResults[0].onSelect();
                setIsSearchOpen(false);
                setSearchQuery("");
              }
            }}
            placeholder={t.common.search}
            className="w-full h-10 pl-10 pr-8 rounded-xl bg-[#f6f9f7] border border-[#e2e8e4] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white focus:ring-2 focus:ring-[#0d5c4d]/10 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {isSearchOpen && searchQuery.trim().length > 0 && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsSearchOpen(false)}
            />
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        item.onSelect();
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-[#ecf8f5] transition-colors text-left group cursor-pointer"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#0d5c4d] truncate">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-[#0d5c4d] border border-slate-200/70 shrink-0">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-6 px-4 text-center text-xs text-slate-500">
                  No matching courses, pages, assignments, or resources found for &ldquo;{searchQuery}&rdquo;.
                </div>
              )}
            </div>
          </>
        )}
        </div>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
              showNotifications
                ? "bg-[#ecf8f5] text-[#0d5c4d] border-[#c4e9e0]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent hover:border-slate-200"
            }`}
            title="Notifications & Announcements"
          >
            <Bell className="h-4 w-4" />
            {hasUnread && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#f3b738] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <>
              {/* Backdrop for click outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />

              {/* Notification Popover Panel */}
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-96 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-sm text-[#0d2b26]">
                      {t.nav.announcements || "Notifications"}
                    </p>
                    {hasUnread && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {hasUnread && (
                      <button
                        type="button"
                        onClick={() => markAnnouncementsRead(announcements.map((a) => a.id))}
                        className="text-[10px] text-[#0d5c4d] font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <CheckCheck className="h-3 w-3" />
                        <span>Mark read</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {announcements.length > 0 ? (
                    announcements.map((a) => {
                      const isUnreadItem = !readAnnouncementIds.includes(a.id);
                      return (
                        <div
                          key={a.id}
                          onClick={() => {
                            markAnnouncementsRead([a.id]);
                            setSelectedAnnouncementModal(a);
                            setShowNotifications(false);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                            isUnreadItem
                              ? "bg-[#f4fbf8] border-[#bce6d9] hover:bg-[#eaf7f2]"
                              : "bg-[#f8faf9] border-[#e6ece8] hover:bg-[#edf5f2] hover:border-[#b2e5d9]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {isUnreadItem && (
                                <span className="h-2 w-2 rounded-full bg-[#0d5c4d] shrink-0" />
                              )}
                              <p className="text-xs font-bold text-slate-900 group-hover:text-[#0d5c4d] transition-colors line-clamp-1">
                                {a.title}
                              </p>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">{a.publishedAt}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                            {a.message}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 px-3 text-center space-y-1">
                      <Bell className="h-6 w-6 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">No announcements yet</p>
                      <p className="text-[11px] text-slate-400">
                        You&apos;re all caught up! New notices for your grade or classes will appear here.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {announcements.length > 0 ? "Click any to view full details" : "Official Notice Board"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView(currentRole === "parent" ? "circulars" : "announcements");
                      setShowNotifications(false);
                    }}
                    className="text-xs font-bold text-[#0d5c4d] hover:text-[#083e34] hover:underline cursor-pointer"
                  >
                    View All →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Card - Clickable to open Profile */}
        <button
          type="button"
          onClick={() => setCurrentView("profile")}
          className="flex items-center gap-2.5 pl-3 border-l border-slate-200 group cursor-pointer text-left focus:outline-none"
          title="View & Edit Profile"
        >
          <div className="h-9 w-9 rounded-xl bg-[#0d5c4d] group-hover:bg-[#0a473b] group-hover:scale-105 flex items-center justify-center font-bold text-xs text-white shadow-sm transition-all ring-2 ring-transparent group-hover:ring-[#0d5c4d]/20 overflow-hidden shrink-0">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-full w-full object-cover"
              />
            ) : (
              currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"
            )}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-900 group-hover:text-[#0d5c4d] transition-colors leading-none">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 leading-none">
              {currentUser.role === "student" ? (currentUser.grade || "Student") : currentUser.role} · <span className="text-[#0d5c4d] font-semibold">View Profile</span>
            </p>
          </div>
        </button>

        {/* Exit / Log Out to Startup Landing Page */}
        <button
          type="button"
          onClick={() => logoutUser()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer shadow-2xs ml-1"
          title="Sign out & return to LimaT Smart Book startup page"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>

      {/* INDIVIDUAL ANNOUNCEMENT DETAIL MODAL */}
      <Modal
        isOpen={!!selectedAnnouncementModal}
        onClose={() => setSelectedAnnouncementModal(null)}
        title="Official Circular & Notice"
      >
        {selectedAnnouncementModal && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Badge
                  variant={selectedAnnouncementModal.priority === "high" ? "warning" : "success"}
                  className="text-[10px] uppercase font-bold"
                >
                  {selectedAnnouncementModal.priority === "high" ? "Urgent / Important" : "Official Notice"}
                </Badge>
                <span className="text-xs text-slate-500">• {selectedAnnouncementModal.targetAudience}</span>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-400">
                {selectedAnnouncementModal.publishedAt}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-[#0d2b26]">
                {selectedAnnouncementModal.title}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e6ece8] text-sm text-slate-800 leading-relaxed whitespace-pre-line space-y-2 max-h-[50vh] overflow-y-auto">
              {selectedAnnouncementModal.message}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#f0f4f1] text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <div className="h-7 w-7 rounded-full bg-[#ecf8f5] text-[#0d5c4d] font-bold text-xs flex items-center justify-center">
                  {selectedAnnouncementModal.authorName.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-800">{selectedAnnouncementModal.authorName}</span>
                  <span className="text-[11px] text-slate-400 ml-1">({selectedAnnouncementModal.authorRole})</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAnnouncementModal(null);
                    setCurrentView(currentRole === "parent" ? "circulars" : "announcements");
                  }}
                  className="text-xs font-bold text-[#0d5c4d] hover:underline cursor-pointer"
                >
                  All Circulars Feed →
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncementModal(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </header>
  );
}
