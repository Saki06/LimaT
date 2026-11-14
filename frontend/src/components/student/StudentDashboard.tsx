"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  Trophy,
  Calendar,
  Sparkles,
  TrendingUp,
  FileText,
  Video,
  ExternalLink,
  X,
  Filter,
  ChevronRight,
  GraduationCap,
  PlayCircle,
  Users,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function StudentDashboard() {
  const {
    currentUser,
    courses,
    assignments,
    quizzes,
    fixtures,
    events,
    announcements,
    t,
    setCurrentView,
    setSelectedCourseId,
    setSelectedLessonId,
    setSelectedAssignmentId,
    addToast,
    activeTenant
  } = useApp();

  const tutorName = activeTenant?.adminName || activeTenant?.name || "Lead Tutor";
  const tutorSubject = activeTenant?.tagline || "A/L Combined Mathematics";
  const tutorInitials =
    tutorName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SP";

  const [isLiveClassModalOpen, setIsLiveClassModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(false);

  // Fetch real-time student dashboard metrics from backend
  const fetchDashboard = async (showToast = false) => {
    try {
      setIsLoadingDashboard(true);
      const res = await api.students.getDashboardOverview();
      if (res && res.success && res.data) {
        setDashboardData(res.data);
        if (showToast) {
          addToast({
            type: "success",
            title: "Dashboard Refreshed",
            message: "Live metrics and course schedules are updated."
          });
        }
      }
    } catch (err) {
      console.warn("Using offline / context student dashboard metrics:", err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchDashboard(false);
  }, []);

  // Compute live or fallback metrics
  const enrolledCoursesCount = dashboardData?.metrics?.enrolledCoursesCount ?? courses.length;
  const upcomingLiveCount = dashboardData?.metrics?.upcomingLiveClassesCount ?? (dashboardData?.upcomingLiveClasses?.length ?? 0);
  const pendingAssignmentsCount = dashboardData?.metrics?.pendingAssignmentsCount ?? (dashboardData?.pendingAssignments?.length ?? assignments.length);
  const attendanceRate = dashboardData?.metrics?.attendanceRate ?? 100;
  const averageScore = dashboardData?.metrics?.averageScore ?? 0;

  // Active live class / Next upcoming class
  const activeLiveNow = dashboardData?.upcomingLiveClasses?.find((c: any) => c.status === "LIVE");
  const nextUpcomingLive =
    dashboardData?.upcomingLiveClasses?.find((c: any) => c.status === "SCHEDULED") ||
    dashboardData?.upcomingLiveClasses?.[0];

  // Learning Feed State
  const [activeFeedFilter, setActiveFeedFilter] = useState<string>("all");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);

  const feedPosts = useMemo(() => {
    const studentGradeStr = String((currentUser as any)?.studentProfile?.gradeLevel || (currentUser as any)?.grade || "");
    const studentGradeNum = studentGradeStr.match(/\d+/)?.[0];

    const enrolledTeacherNames: string[] = [];
    const enrolledBatchTitles: string[] = [];

    dashboardData?.enrollments?.forEach((e: any) => {
      if (e.course?.teacher?.user) {
        const u = e.course.teacher.user;
        if (u.firstName) enrolledTeacherNames.push(u.firstName.toLowerCase());
        if (u.lastName) enrolledTeacherNames.push(u.lastName.toLowerCase());
        enrolledTeacherNames.push(`${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase());
      }
      if (e.course?.title) enrolledBatchTitles.push(e.course.title.toLowerCase());
    });

    dashboardData?.activeSubscriptions?.forEach((sub: any) => {
      if (sub.package?.teacher?.user) {
        const u = sub.package.teacher.user;
        if (u.firstName) enrolledTeacherNames.push(u.firstName.toLowerCase());
        if (u.lastName) enrolledTeacherNames.push(u.lastName.toLowerCase());
        enrolledTeacherNames.push(`${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase());
      }
      if (sub.package?.title) enrolledBatchTitles.push(sub.package.title.toLowerCase());
    });

    return announcements.filter((a) => {
      if (a.targetAudience === "Tutors & Coaches") return false;

      const audienceLower = (a.targetAudience || "").toLowerCase();
      const contentLower = `${a.title} ${a.message}`.toLowerCase();

      // 1. Grade-level filtering
      const gradeMatch = audienceLower.match(/grade\s*(\d+)/i) || contentLower.match(/grade\s*(\d+)/i);
      if (gradeMatch && studentGradeNum) {
        if (gradeMatch[1] !== studentGradeNum) return false;
      }

      // 2. Teacher notices filtering
      const authorRole = (a.authorRole || "").toUpperCase();
      const isFromTeacher =
        authorRole === "TEACHER" ||
        authorRole === "TUTOR" ||
        authorRole.includes("TUTOR") ||
        authorRole.includes("TEACHER");

      if (isFromTeacher) {
        const author = (a.authorName || "").toLowerCase().trim();
        const isStudentOfTeacher = enrolledTeacherNames.some(
          (name) => name && (author.includes(name) || name.includes(author))
        );
        const isEnrolledInBatch = enrolledBatchTitles.some(
          (title) => title && (audienceLower.includes(title) || title.includes(audienceLower))
        );

        if (!isStudentOfTeacher && !isEnrolledInBatch) {
          return false;
        }
      }

      if (activeFeedFilter === "tutor") {
        return isFromTeacher;
      }

      return true;
    });
  }, [announcements, currentUser, dashboardData, activeFeedFilter]);

  const totalLessons = courses.reduce((acc, c) => acc + c.totalLessons, 0);
  const completedLessons = courses.reduce((acc, c) => acc + c.completedLessons, 0);
  const completionPercentage = Math.round((completedLessons / totalLessons) * 100) || 0;

  const handleContinueCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView("courses");
  };

  // Dynamic Time-of-day Greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 17
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Student Welcome Cockpit Banner */}
      <div className="bg-gradient-to-r from-[#0d5c4d] via-[#106e5d] to-[#158066] rounded-3xl p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
              Student Learning Cockpit
            </span>
            <span className="text-xs text-white/80 font-medium">
              {greeting}, {currentUser?.name?.split(" ")[0] || "Alex"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Track Your Curriculum &amp; Excel in Your Studies
          </h1>
          <p className="text-xs text-white/85 max-w-xl leading-relaxed">
            Stay on top of today&apos;s live lectures, test your knowledge in quiz arena, and submit assignments on schedule.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            onClick={() => setCurrentView("courses")}
            className="bg-white text-[#0d5c4d] hover:bg-emerald-50 font-extrabold text-xs shadow-xs cursor-pointer h-9 px-4 rounded-xl"
          >
            <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Continue Learning
          </Button>
          <Button
            onClick={() => setCurrentView("live_schedule")}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-xs cursor-pointer backdrop-blur-xs h-9 px-4 rounded-xl"
          >
            <Video className="h-3.5 w-3.5 mr-1.5" /> Live Schedule
          </Button>
          <Button
            onClick={() => setCurrentView("quizzes")}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-xs cursor-pointer backdrop-blur-xs h-9 px-4 rounded-xl"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Quiz Arena
          </Button>
          <Button
            onClick={() => fetchDashboard(true)}
            disabled={isLoadingDashboard}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-xs cursor-pointer backdrop-blur-xs h-9 px-3 rounded-xl"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDashboard ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Top 3 Student Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Enrolled Courses */}
        <Card
          onClick={() => setCurrentView("courses")}
          className="border-[#e6ece8] bg-white hover:border-[#a2dfd2] hover:bg-emerald-50/20 transition-all duration-200 shadow-2xs hover:shadow-xs group cursor-pointer"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Enrolled Subjects
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#0d2b26]">
                  {enrolledCoursesCount}
                </span>
                <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
                  Active
                </Badge>
              </div>
              <p className="text-[11px] text-[#0d5c4d] font-semibold flex items-center gap-1">
                View My Courses <ChevronRight className="h-3 w-3" />
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Live Video Masterclasses */}
        <Card
          onClick={() => setCurrentView("live_schedule")}
          className="border-[#e6ece8] bg-white hover:border-indigo-300 hover:bg-indigo-50/20 transition-all duration-200 shadow-2xs hover:shadow-xs group cursor-pointer"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Live Masterclasses
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#0d2b26]">
                  {upcomingLiveCount}
                </span>
                <Badge variant="outline" className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border-indigo-200">
                  Scheduled
                </Badge>
              </div>
              <p className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1">
                Open Live Studio <ChevronRight className="h-3 w-3" />
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Video className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Pending Homework / Assignments */}
        <Card
          onClick={() => setCurrentView("assignments")}
          className="border-[#e6ece8] bg-white hover:border-amber-300 hover:bg-amber-50/20 transition-all duration-200 shadow-2xs hover:shadow-xs group cursor-pointer"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pending Homework
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#0d2b26]">
                  {pendingAssignmentsCount}
                </span>
                <Badge variant="outline" className="text-[10px] font-semibold text-amber-700 bg-amber-50 border-amber-200">
                  To Submit
                </Badge>
              </div>
              <p className="text-[11px] text-[#b47a16] font-semibold flex items-center gap-1">
                View Due Dates <ChevronRight className="h-3 w-3" />
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-amber-50 text-[#b47a16] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Continue Learning + Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning Course Cards (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Live Lecture Banner (Dynamic: LIVE NOW / Upcoming Scheduled / Studio Ready) */}
          {activeLiveNow ? (
            <div className="relative overflow-hidden rounded-2xl border border-rose-300 bg-gradient-to-r from-rose-50/95 via-purple-50/60 to-white p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black uppercase tracking-wider">
                      LIVE NOW
                    </span>
                    <span className="text-xs text-rose-900/70 font-semibold">Active Session in Progress</span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      {activeLiveNow.title || activeLiveNow.course?.title || "Live Lecture Masterclass"}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      <span className="font-bold text-slate-900">
                        {activeLiveNow.teacher?.user ? `${activeLiveNow.teacher.user.firstName} ${activeLiveNow.teacher.user.lastName}` : tutorName}
                      </span> • Live Studio Broadcast
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (activeLiveNow.meetingUrl) window.open(activeLiveNow.meetingUrl, "_blank");
                    else setIsLiveClassModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white text-xs font-black shadow-md transition-all hover:scale-[1.02] shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <span>Join Class →</span>
                </button>
              </div>
            </div>
          ) : nextUpcomingLive ? (
            <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-white p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase tracking-wider">
                      Upcoming Masterclass
                    </span>
                    <span className="text-xs text-indigo-900/60 font-semibold">
                      {nextUpcomingLive.startTime ? new Date(nextUpcomingLive.startTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Scheduled Session"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-indigo-950 tracking-tight">
                      {nextUpcomingLive.title || nextUpcomingLive.course?.title || "Curriculum Masterclass"}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      <span className="font-bold text-indigo-900">
                        {nextUpcomingLive.teacher?.user ? `${nextUpcomingLive.teacher.user.firstName} ${nextUpcomingLive.teacher.user.lastName}` : tutorName}
                      </span> • Live Studio Session
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentView("live_schedule")}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-black shadow-md hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <span>View Schedule →</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-[#d6ede6] bg-gradient-to-r from-[#ecf8f5]/80 via-teal-50/40 to-white p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0d5c4d]/10 text-[#0d5c4d] text-[10px] font-black uppercase tracking-wider">
                      Live Studio
                    </span>
                    <span className="text-xs text-slate-500 font-medium">No live lectures currently in progress</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0d2b26]">
                    Interactive Live Lectures &amp; Masterclasses
                  </h3>
                  <p className="text-xs text-slate-500">
                    Check your timetable for upcoming video sessions and revision batches.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView("live_schedule")}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Live Schedule</span>
                </button>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* LEARNING FEED (Clean White & Mint Theme)                           */}
          {/* =================================================================== */}
          <div className="rounded-3xl bg-white border border-[#e2eae5] p-5 sm:p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-[#0d2b26]">
            {/* Header */}
            <div className="flex items-center justify-between relative">
              <h2 className="text-base sm:text-lg font-black text-[#0d2b26] tracking-tight flex items-center gap-2">
                <span>Learning Feed</span>
              </h2>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#f6f9f7] hover:bg-[#edf5f2] border border-[#d6ede6] text-xs font-bold text-[#0d5c4d] transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Filter className="h-3 w-3 text-[#0d5c4d]" />
                  <span>Filter</span>
                </button>

                {isFilterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-[#d6ede6] shadow-xl p-2 z-30 space-y-1 animate-in fade-in zoom-in-95">
                    {[
                      { id: "all", label: "All Posts" },
                      { id: "tutor", label: "Tutor Updates" }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setActiveFeedFilter(f.id);
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          activeFeedFilter === f.id
                            ? "bg-[#0d5c4d] text-white"
                            : "text-slate-700 hover:bg-[#ecf8f5]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Post Cards Feed */}
            <div className="space-y-3.5">
              {feedPosts.length > 0 ? (
                feedPosts.map((post) => {
                  const postAuthor = post.authorName || tutorName;
                  const authorInitials =
                    postAuthor
                      .split(" ")
                      .filter(Boolean)
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "EP";

                  return (
                    <div
                      key={post.id}
                      className="rounded-2xl bg-[#fbfdfc] hover:bg-white border border-[#e2eae5] hover:border-[#b2e5d9] p-4 sm:p-5 space-y-3 shadow-2xs hover:shadow-md transition-all"
                    >
                      {/* Author Header */}
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#0d5c4d] flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs">
                          {authorInitials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-[#0d2b26]">{postAuthor}</h4>
                            {post.priority === "high" || post.priority === "urgent" ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black uppercase tracking-wider">
                                Important
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {post.authorRole || "Official"} • {post.publishedAt || "Recently"}
                          </p>
                        </div>
                      </div>

                      {/* Body Content */}
                      <div className="space-y-1">
                        <h5 className="font-extrabold text-xs sm:text-sm text-[#0d2b26]">{post.title}</h5>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          {post.message}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                          {post.targetAudience}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0] text-[11px] font-bold">
                          {post.authorRole || "Notice"}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center rounded-2xl border border-dashed border-[#d6ede6] bg-[#fbfdfc] space-y-2">
                  <p className="text-xs font-bold text-slate-600">No active updates</p>
                  <p className="text-[11px] text-slate-400">Official updates from your registered courses will appear right here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Deadlines, Next Match, School Events */}
        <div className="space-y-4">
          {/* Active Assignments */}
          <Card className="border-[#e6ece8] bg-white">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-extrabold text-[#0d2b26] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#b47a16]" />
                Pending Assignments
              </CardTitle>
              <Badge variant="warning">
                {(dashboardData?.pendingAssignments?.length ?? assignments.length)}
              </Badge>
            </CardHeader>
            <CardContent className="p-5 pt-1 space-y-2.5">
              {(dashboardData?.pendingAssignments && dashboardData.pendingAssignments.length > 0
                ? dashboardData.pendingAssignments
                : assignments
              ).length > 0 ? (
                (dashboardData?.pendingAssignments && dashboardData.pendingAssignments.length > 0
                  ? dashboardData.pendingAssignments
                  : assignments
                ).slice(0, 5).map((asg: any) => (
                  <div
                    key={asg.id}
                    onClick={() => {
                      setSelectedAssignmentId(asg.id);
                      setCurrentView("assignments");
                    }}
                    className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] hover:border-[#0d5c4d]/50 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0d5c4d] group-hover:underline">
                        {asg.course?.title || asg.subjectName || "Assignment"}
                      </span>
                      <span className="text-[10px] text-[#b47a16] font-mono font-bold">
                        Due: {asg.dueDate ? String(asg.dueDate).split("T")[0].split(" ")[0] : "Soon"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">{asg.title}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center rounded-xl bg-[#f8faf9] border border-[#e6ece8]">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-700">All Homework Submitted!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">No pending assignments at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Live Masterclass */}
          <Card className="border-[#e6ece8] bg-white">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-extrabold text-[#0d2b26] flex items-center gap-2">
                <Video className="h-4 w-4 text-[#0d5c4d]" />
                Next Live Masterclass
              </CardTitle>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-[#0d5c4d] border border-emerald-200">
                Google Meet
              </span>
            </CardHeader>
            <CardContent className="p-5 pt-1">
              {nextUpcomingLive ? (
                <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                      {nextUpcomingLive.course?.title || nextUpcomingLive.package?.title || "Masterclass"}
                    </span>
                    <span className="text-[#0d5c4d] font-bold shrink-0">
                      {nextUpcomingLive.startTime
                        ? new Date(nextUpcomingLive.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : "Scheduled"}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#0d2b26]">{nextUpcomingLive.title || "Curriculum Lecture"}</p>
                  <p className="text-[11px] text-slate-500">
                    Instructor: {nextUpcomingLive.teacher?.user ? `${nextUpcomingLive.teacher.user.firstName} ${nextUpcomingLive.teacher.user.lastName}` : tutorName}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (nextUpcomingLive.meetingUrl) window.open(nextUpcomingLive.meetingUrl, "_blank");
                      else setIsLiveClassModalOpen(true);
                    }}
                    className="w-full mt-2 h-8 text-xs bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold cursor-pointer"
                  >
                    Join Live Stream
                  </Button>
                </div>
              ) : (
                <div className="p-4 text-center rounded-xl bg-[#f8faf9] border border-[#e6ece8] space-y-2">
                  <p className="text-xs font-bold text-slate-700">No Upcoming Live Sessions</p>
                  <p className="text-[11px] text-slate-400">Scheduled video sessions will appear here.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentView("live_schedule")}
                    className="w-full mt-1 h-8 text-xs border-[#c4e9e0] text-[#0d5c4d] font-bold hover:bg-[#ecf8f5] cursor-pointer"
                  >
                    View Timetable
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model Exam Countdown */}
          <Card className="border-[#e6ece8] bg-white">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-extrabold text-[#0d2b26] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#b47a16]" />
                Upcoming Model Exam
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-1">
              {quizzes && quizzes.length > 0 ? (
                <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] space-y-1.5">
                  <span className="text-[10px] font-bold text-[#b47a16] uppercase tracking-wider">
                    Evaluation Arena &bull; {quizzes.length} Available
                  </span>
                  <p className="text-xs font-bold text-[#0d2b26]">{quizzes[0].title}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {quizzes[0].subjectName ? `${quizzes[0].subjectName} • ` : ""}Timed evaluation test. Test your knowledge and get immediate score analytics.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentView("quizzes")}
                    className="w-full mt-2 h-8 text-xs border-[#c4e9e0] text-[#0d5c4d] font-bold hover:bg-[#ecf8f5] cursor-pointer"
                  >
                    Go to Quiz Arena
                  </Button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] space-y-1.5">
                  <span className="text-[10px] font-bold text-[#b47a16] uppercase tracking-wider">
                    Quiz &amp; Evaluation Arena
                  </span>
                  <p className="text-xs font-bold text-[#0d2b26]">Test Your Knowledge</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Take chapter quizzes and term evaluation mock tests to master your syllabus.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentView("quizzes")}
                    className="w-full mt-2 h-8 text-xs border-[#c4e9e0] text-[#0d5c4d] font-bold hover:bg-[#ecf8f5] cursor-pointer"
                  >
                    Explore Quiz Arena
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Live Classroom Modal */}
      {isLiveClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-[#0f172a] text-white rounded-3xl max-w-3xl w-full border border-slate-800 shadow-2xl overflow-hidden my-6">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase">
                  LIVE BROADCAST
                </span>
                <span className="text-xs font-bold text-slate-300">
                  {tutorSubject} — Live Masterclass ({tutorName})
                </span>
              </div>
              <button
                onClick={() => setIsLiveClassModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Simulated Live Stream Viewport */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col justify-between p-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-slate-200">
                    🔴 Live • 142 Students Connected
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-mono text-emerald-400">
                    HD 1080p • 60 FPS
                  </span>
                </div>

                <div className="text-center space-y-2 py-10">
                  <div className="h-16 w-16 rounded-full bg-[#0d5c4d] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg ring-4 ring-[#0d5c4d]/30">
                    {tutorInitials}
                  </div>
                  <div>
                    <p className="font-extrabold text-base text-white">{tutorName}</p>
                    <p className="text-xs text-emerald-300">Presenting: {tutorSubject} Masterclass</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Audio & Mic: Active</span>
                  <a
                    href={activeTenant?.googleMeetLink || "https://meet.google.com/tutor-live-session"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open in Google Meet
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
              <span>Interactive Q&A open for enrolled students</span>
              <button
                onClick={() => setIsLiveClassModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
