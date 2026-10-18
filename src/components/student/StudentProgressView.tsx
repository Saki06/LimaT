"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Target,
  Flame,
  Zap,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  Star,
  Layers,
  ArrowUpRight,
  Activity,
  Check,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  ShieldCheck,
  Compass
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

export function StudentProgressView() {
  const {
    currentUser,
    courses,
    submissions,
    t,
    setCurrentView,
    setSelectedCourseId
  } = useApp();

  const [timeframe, setTimeframe] = useState<"week" | "month">("week");
  const [expandedSubject, setExpandedSubject] = useState<string | null>("c1");

  // Study hours data for Recharts
  const weeklyStudyData = [
    { day: "Mon", theory: 2.2, practice: 1.5, total: 3.7 },
    { day: "Tue", theory: 1.8, practice: 2.0, total: 3.8 },
    { day: "Wed", theory: 2.5, practice: 2.3, total: 4.8 },
    { day: "Thu", theory: 1.5, practice: 1.8, total: 3.3 },
    { day: "Fri", theory: 3.0, practice: 1.2, total: 4.2 },
    { day: "Sat", theory: 2.8, practice: 2.5, total: 5.3 },
    { day: "Sun", theory: 1.2, practice: 1.5, total: 2.7 }
  ];

  // Subject syllabus milestone data
  const subjectMilestones = [
    {
      id: "c1",
      name: "Combined Mathematics",
      code: "MATH-AL-12",
      icon: "📐",
      progress: 84,
      totalTopics: 18,
      completedTopics: 15,
      studyHours: 42,
      status: "Ahead of Schedule",
      statusColor: "success",
      topics: [
        { title: "Differential Calculus & Tangents", status: "completed", score: "96%" },
        { title: "Integral Calculus & Areas", status: "completed", score: "92%" },
        { title: "Trigonometric Identities & Equations", status: "completed", score: "90%" },
        { title: "Vector Algebra & 3D Geometry", status: "in_progress", progress: 65 },
        { title: "Dynamics & Relative Motion", status: "upcoming", progress: 0 }
      ]
    },
    {
      id: "c2",
      name: "Physics (Theory & Practical)",
      code: "PHYS-AL-12",
      icon: "⚡",
      progress: 76,
      totalTopics: 16,
      completedTopics: 12,
      studyHours: 38,
      status: "On Track",
      statusColor: "default",
      topics: [
        { title: "Newtonian Mechanics & Momentum", status: "completed", score: "94%" },
        { title: "Wave Optics & Oscillations", status: "completed", score: "88%" },
        { title: "Thermodynamics & Heat Engines", status: "in_progress", progress: 70 },
        { title: "Current Electricity & Circuits", status: "in_progress", progress: 40 },
        { title: "Atomic & Nuclear Physics", status: "upcoming", progress: 0 }
      ]
    },
    {
      id: "c3",
      name: "Chemistry",
      code: "CHEM-AL-12",
      icon: "🧪",
      progress: 68,
      totalTopics: 15,
      completedTopics: 10,
      studyHours: 32,
      status: "Needs Revision",
      statusColor: "warning",
      topics: [
        { title: "Atomic Structure & Periodic Trends", status: "completed", score: "88%" },
        { title: "Chemical Equilibrium & Le Chatelier", status: "completed", score: "82%" },
        { title: "Organic Functional Groups & Synthesis", status: "in_progress", progress: 55 },
        { title: "Electrochemistry & Redox Cells", status: "upcoming", progress: 0 },
        { title: "Inorganic Coordination Compounds", status: "upcoming", progress: 0 }
      ]
    },
    {
      id: "c4",
      name: "Information & Communication Tech",
      code: "ICT-AL-12",
      icon: "💻",
      progress: 92,
      totalTopics: 14,
      completedTopics: 13,
      studyHours: 45,
      status: "Mastery Level",
      statusColor: "success",
      topics: [
        { title: "Relational Database Design & SQL", status: "completed", score: "98%" },
        { title: "Data Structures & Python Algorithms", status: "completed", score: "95%" },
        { title: "Web Development & HTTP Protocol", status: "completed", score: "94%" },
        { title: "Computer Networks & Security", status: "in_progress", progress: 85 }
      ]
    }
  ];

  // Competency skills matrix
  const competencies = [
    { skill: "Analytical Problem Solving", level: 94, grade: "Exceptional", color: "bg-[#0d5c4d]" },
    { skill: "Theoretical Recall & Concepts", level: 88, grade: "Proficient", color: "bg-[#0e7490]" },
    { skill: "Exam Timing & Velocity", level: 82, grade: "Good", color: "bg-[#b47a16]" },
    { skill: "Assignment Punctuality & Effort", level: 98, grade: "Flawless", color: "bg-[#15803d]" },
    { skill: "Practical / Lab Rigor", level: 86, grade: "Proficient", color: "bg-[#6366f1]" }
  ];

  // Milestone Badges
  const badges = [
    {
      id: "b1",
      title: "Calculus Virtuoso",
      desc: "Scored >90% in 5 consecutive calculus tests",
      icon: "🏆",
      earned: true,
      earnedDate: "Sep 22, 2026",
      category: "Maths"
    },
    {
      id: "b2",
      title: "14-Day Focus Streak",
      desc: "Studied continuous 14 days without missing a session",
      icon: "🔥",
      earned: true,
      earnedDate: "Active Now",
      category: "Dedication"
    },
    {
      id: "b3",
      title: "Fast Solver",
      desc: "Completed Physics Assessment in top 10% speed bracket",
      icon: "⚡",
      earned: true,
      earnedDate: "Sep 15, 2026",
      category: "Velocity"
    },
    {
      id: "b4",
      title: "Digital Scholar",
      desc: "Accessed & completed 25+ digital library reference modules",
      icon: "📚",
      earned: true,
      earnedDate: "Sep 28, 2026",
      category: "Research"
    },
    {
      id: "b5",
      title: "Perfect GPA 4.0 Club",
      desc: "Maintain over 90% aggregate score in all science subjects",
      icon: "🎯",
      earned: false,
      progress: "88% / 90%",
      category: "Academic Target"
    },
    {
      id: "b6",
      title: "Organic Chemistry Guru",
      desc: "Solve all 40 reaction mechanism worksheets with >85%",
      icon: "🧪",
      earned: false,
      progress: "28 / 40 solved",
      category: "Chemistry"
    }
  ];

  // Actionable targets
  const recommendedGoals = [
    {
      title: "Revise Organic Chemistry Functional Groups",
      subject: "Chemistry",
      tag: "Priority Revision",
      timeEst: "45 mins",
      dueDate: "Tomorrow"
    },
    {
      title: "Complete Vector Algebra Worksheet #4",
      subject: "Combined Mathematics",
      tag: "Practice Set",
      timeEst: "60 mins",
      dueDate: "In 2 days"
    },
    {
      title: "Attempt Computer Networks Practice Quiz",
      subject: "ICT",
      tag: "Mock Assessment",
      timeEst: "30 mins",
      dueDate: "Oct 04"
    }
  ];

  const handleGoToCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView("courses");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d5c4d] via-[#106b5a] to-[#147966] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full pointer-events-none blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-bold tracking-wide backdrop-blur-sm">
                Term 2 • Academic Year 2026
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 14-Day Streak
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t.nav.progress || "Student Progress"} &amp; Analytics
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Track your cumulative syllabus milestones, weekly study velocity, cognitive skill competencies, and term target trajectory.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => setCurrentView("exams")}
              className="bg-white/10 hover:bg-white/20 text-white border-white/25 text-xs font-bold"
            >
              View Exam Transcripts →
            </Button>
            <Button
              onClick={() => setCurrentView("courses")}
              className="bg-white text-[#0d5c4d] hover:bg-emerald-50 text-xs font-black shadow-sm"
            >
              Resume Learning
            </Button>
          </div>
        </div>
      </div>

      {/* High-Level Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Syllabus */}
        <Card className="border-[#e6ece8] bg-white p-5 shadow-xs hover:border-[#0d5c4d]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Curriculum Progress</span>
            <div className="w-9 h-9 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#0d2b26]">78%</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +6% this mo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">50 of 63 chapters completed</p>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-[#0d5c4d] h-full rounded-full transition-all duration-700" style={{ width: "78%" }} />
            </div>
          </div>
        </Card>

        {/* Metric 2: Study Hours */}
        <Card className="border-[#e6ece8] bg-white p-5 shadow-xs hover:border-[#0d5c4d]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Study Time This Week</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#0d2b26]">27.8 hrs</span>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                +14% vs goal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Daily average: ~3.9 hours</p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-sky-600 h-full rounded-full transition-all duration-700" style={{ width: "88%" }} />
            </div>
          </div>
        </Card>

        {/* Metric 3: Academic GPA / Rank */}
        <Card className="border-[#e6ece8] bg-white p-5 shadow-xs hover:border-[#0d5c4d]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Term GPA</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#b47a16]">3.92</span>
              <span className="text-xs font-bold text-slate-400">/ 4.00</span>
            </div>
            <p className="text-xs text-emerald-700 font-semibold mt-1">Class Rank #3 (Top 5%)</p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-700" style={{ width: "94%" }} />
            </div>
          </div>
        </Card>

        {/* Metric 4: Focus Streak */}
        <Card className="border-[#e6ece8] bg-white p-5 shadow-xs hover:border-[#0d5c4d]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Learning Streak</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-orange-600">14 Days</span>
              <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                🔥 Hot
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Personal Best: 21 days</p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-orange-500 h-full rounded-full transition-all duration-700" style={{ width: "66%" }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Chart & Competencies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Study Velocity Chart */}
        <Card className="lg:col-span-2 border-[#e6ece8] bg-white shadow-xs">
          <CardHeader className="p-5 border-b border-[#e6ece8] flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-[#0d2b26] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0d5c4d]" /> Weekly Study Velocity &amp; Focus Hours
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Hours spent daily on theory reading vs problem practice
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                onClick={() => setTimeframe("week")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeframe === "week" ? "bg-white text-[#0d5c4d] shadow-xs" : "hover:text-slate-900"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeframe("month")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeframe === "month" ? "bg-white text-[#0d5c4d] shadow-xs" : "hover:text-slate-900"
                }`}
              >
                Month Trend
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStudyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d2b26",
                      borderColor: "#0d2b26",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                    formatter={(val: any, name: any) => [`${val} hrs`, name === "theory" ? "Theory & Reading" : "Practice & Exams"]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs font-semibold text-slate-600">
                        {value === "theory" ? "Theory & Lessons" : "Problem Solving & Tests"}
                      </span>
                    )}
                  />
                  <Bar dataKey="theory" fill="#0d5c4d" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="practice" fill="#44a08d" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#e6ece8] text-center">
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-[11px] text-slate-500 font-semibold block">Peak Focus Day</span>
                <span className="text-sm font-black text-[#0d2b26]">Wednesday (4.8h)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-[11px] text-slate-500 font-semibold block">Weekly Target</span>
                <span className="text-sm font-black text-emerald-700">24h / 20h (120%)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-[11px] text-slate-500 font-semibold block">Theory : Practice</span>
                <span className="text-sm font-black text-[#0d2b26]">53% : 47%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Cognitive Competency Matrix */}
        <Card className="border-[#e6ece8] bg-white shadow-xs">
          <CardHeader className="p-5 border-b border-[#e6ece8]">
            <CardTitle className="text-base font-black text-[#0d2b26] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#0d5c4d]" /> Subject Mastery &amp; Skills
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluated by teacher rubrics and quiz velocity
            </p>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {competencies.map((c) => (
              <div key={c.skill} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{c.skill}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{c.grade}</span>
                    <span className="font-black text-[#0d2b26]">{c.level}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${c.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${c.level}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="p-3 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] text-[#0d5c4d] text-xs space-y-1 mt-4">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0" /> Academic Advisor Note
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-900">
                Strongest in quantitative problem solving. Recommend spending 30 mins more on theoretical chemical definitions before midterm exams.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Subject-wise Syllabus Progress */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-[#0d2b26] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0d5c4d]" /> Subject Syllabus Progress &amp; Chapters
            </h2>
            <p className="text-xs text-slate-500">
              Check completion of specific curriculum units, chapter test scores, and upcoming study modules.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {subjectMilestones.map((subject) => {
            const isExpanded = expandedSubject === subject.id;
            return (
              <Card
                key={subject.id}
                className="border-[#e6ece8] bg-white shadow-xs overflow-hidden transition-all"
              >
                {/* Subject Summary Header */}
                <div
                  onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#ecf8f5] text-2xl flex items-center justify-center shrink-0 border border-[#c4e9e0]">
                      {subject.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-[#0d2b26]">{subject.name}</h3>
                        <Badge
                          variant={
                            subject.statusColor === "success"
                              ? "success"
                              : subject.statusColor === "warning"
                              ? "warning"
                              : "default"
                          }
                          className="text-[10px]"
                        >
                          {subject.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Code: {subject.code} • {subject.completedTopics} of {subject.totalTopics} Chapters Completed • {subject.studyHours}h logged
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:justify-end">
                    <div className="w-36 text-right sm:text-left">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500 font-bold">Completion</span>
                        <span className="font-black text-[#0d5c4d]">{subject.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0d5c4d] h-full rounded-full transition-all duration-700"
                          style={{ width: `${subject.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGoToCourse(subject.id);
                        }}
                        className="text-xs font-bold text-[#0d5c4d] border-[#0d5c4d]/30 hover:bg-[#ecf8f5]"
                      >
                        Study <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Button>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-700 p-1"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Topic Milestones */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-[#e6ece8] bg-[#f8faf9]/50 animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 pt-3">
                      Curriculum Unit Breakdown:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {subject.topics.map((topic, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white rounded-xl border border-[#e6ece8] flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5">
                            {topic.status === "completed" ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : topic.status === "in_progress" ? (
                              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold text-xs">
                                •
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 text-xs">
                                ○
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-slate-800">{topic.title}</p>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {topic.status === "completed"
                                  ? "Mastered • Score: " + topic.score
                                  : topic.status === "in_progress"
                                  ? `In Progress (${topic.progress}%)`
                                  : "Scheduled Next"}
                              </span>
                            </div>
                          </div>

                          {topic.status === "in_progress" && (
                            <Badge variant="warning" className="text-[10px] shrink-0">
                              Active
                            </Badge>
                          )}
                          {topic.status === "completed" && (
                            <Badge variant="success" className="text-[10px] shrink-0">
                              {topic.score}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Gamified Achievements & Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#0d2b26] flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Academic Achievements &amp; Milestones
            </h2>
            <p className="text-xs text-slate-500">
              Badges earned through consistent practice, high test marks, and study streak milestones.
            </p>
          </div>
          <Badge variant="warning" className="text-xs font-bold px-3 py-1">
            4 / 6 Badges Unlocked
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {badges.map((badge) => (
            <Card
              key={badge.id}
              className={`p-4 border transition-all ${
                badge.earned
                  ? "bg-white border-[#e6ece8] hover:border-amber-400/50 shadow-xs"
                  : "bg-slate-50/60 border-dashed border-slate-200 opacity-75"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    badge.earned ? "bg-amber-50 border border-amber-200 shadow-xs" : "bg-slate-100 grayscale"
                  }`}
                >
                  {badge.icon}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-[#0d2b26]">{badge.title}</span>
                    {badge.earned ? (
                      <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-full">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{badge.desc}</p>
                  <p className="text-[10px] font-semibold text-slate-400">
                    {badge.earned ? `Achieved: ${badge.earnedDate}` : `Progress: ${badge.progress}`}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Plan & Recommended Next Steps */}
      <Card className="border-[#e6ece8] bg-white shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-black text-[#0d2b26] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Recommended Study Steps for This Week
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized roadmap to reach your Term 2 target of 85%+ syllabus completion.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView("assignments")}
            className="text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            All Assignments ({submissions.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendedGoals.map((goal, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-[#e6ece8] bg-[#f8faf9] flex flex-col justify-between hover:border-[#0d5c4d]/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-2">
                  <span className="text-[#0d5c4d]">{goal.subject}</span>
                  <Badge variant="warning" className="text-[9px]">{goal.tag}</Badge>
                </div>
                <h4 className="text-xs font-black text-[#0d2b26] group-hover:text-[#0d5c4d] transition-colors leading-snug">
                  {goal.title}
                </h4>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mt-4 pt-3 border-t border-[#e6ece8]">
                <span>Est: {goal.timeEst}</span>
                <span className="text-emerald-700 font-bold">{goal.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
