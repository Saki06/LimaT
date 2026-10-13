"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
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
  Filter
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

  const tutorName = activeTenant?.adminName || activeTenant?.name || "Dr. Samantha Perera";
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

  // Learning Feed State
  const [activeFeedFilter, setActiveFeedFilter] = useState<string>("all");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);

  const feedPosts = useMemo(() => {
    return announcements.filter((a) => {
      if (a.targetAudience === "Solo Tutors & Coaches") return false;
      return true;
    });
  }, [announcements]);


  const totalLessons = courses.reduce((acc, c) => acc + c.totalLessons, 0);
  const completedLessons = courses.reduce((acc, c) => acc + c.completedLessons, 0);
  const completionPercentage = Math.round((completedLessons / totalLessons) * 100) || 0;


  const handleContinueCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView("courses");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">


      {/* Main Grid: Continue Learning + Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning Course Cards (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* LIVE NOW Class Alert Bar (Indigo & Violet Gradient Theme) */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-white p-4 sm:p-5 shadow-xs">
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
                  <span className="text-xs text-indigo-900/60 font-semibold">Started 12 mins ago</span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-indigo-950 tracking-tight">
                    {tutorSubject} — Live Masterclass
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    <span className="font-bold text-indigo-900">{tutorName}</span> • Solo Masterclass • 142 watching
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsLiveClassModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-black shadow-md hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span>Join Class →</span>
              </button>
            </div>
          </div>

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
                feedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl bg-[#fbfdfc] hover:bg-white border border-[#e2eae5] hover:border-[#b2e5d9] p-4 sm:p-5 space-y-3 shadow-2xs hover:shadow-md transition-all"
                  >
                    {/* Author Header */}
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#0d5c4d] flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs">
                        {tutorInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-[#0d2b26]">{post.authorName || tutorName}</h4>
                          {post.priority === "high" || post.priority === "urgent" ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black uppercase tracking-wider">
                              Important
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {tutorSubject} • {post.publishedAt}
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
                        {tutorSubject}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center rounded-2xl border border-dashed border-[#d6ede6] bg-[#fbfdfc] space-y-2">
                  <p className="text-xs font-bold text-slate-600">No active updates</p>
                  <p className="text-[11px] text-slate-400">Updates posted by your tutor will appear right here.</p>
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
              <Badge variant="warning">{assignments.length}</Badge>
            </CardHeader>
            <CardContent className="p-5 pt-1 space-y-2.5">
              {assignments.map((asg) => (
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
                      {asg.subjectName}
                    </span>
                    <span className="text-[10px] text-[#b47a16] font-mono font-bold">
                      Due: {asg.dueDate.split(" ")[0]}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">{asg.title}</p>
                </div>
              ))}
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
              <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{tutorSubject}</span>
                  <span className="text-[#0d5c4d] font-bold">Tomorrow • 7:30 PM</span>
                </div>
                <p className="text-xs font-bold text-[#0d2b26]">Definite Integrals & Area Under Curves</p>
                <p className="text-[11px] text-slate-500">Instructor: {tutorName}</p>
                <Button
                  size="sm"
                  onClick={() => setIsLiveClassModalOpen(true)}
                  className="w-full mt-2 h-8 text-xs bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold cursor-pointer"
                >
                  Join Live Stream
                </Button>
              </div>
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
              <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] space-y-1.5">
                <span className="text-[10px] font-bold text-[#b47a16] uppercase tracking-wider">
                  Saturday, 7:00 PM • 3 Days Left
                </span>
                <p className="text-xs font-bold text-[#0d2b26]">Term Evaluation Paper — 100 Marks</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Timed evaluation covering Units 1 to 5. Solutions will be discussed live right after submission.
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
