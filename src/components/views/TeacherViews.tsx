"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Plus,
  Send,
  MessageSquare,
  Award,
  ClipboardCheck,
  Eye,
  Bell,
  Sparkles,
  Filter,
  Check,
  BarChart3,
  Calendar,
  AlertCircle,
  ExternalLink,
  Search,
  TrendingUp,
  UploadCloud,
  Video,
  Presentation,
  FileUp,
  X,
  Link2,
  Trash2,
  Paperclip,
  Film,
  FileCheck,
  Edit3,
  Copy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { Assignment, Course, Announcement } from "@/types/lms";

interface TeacherViewsProps {
  initialTab?: "home" | "grading" | "assignments" | "analytics";
}

export function TeacherViews({ initialTab = "home" }: TeacherViewsProps) {
  const {
    courses,
    assignments,
    submissions,
    gradeSubmission,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    createLesson,
    announcements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    currentView,
    setCurrentView,
    setSelectedCourseId,
    currentUser,
    t,
    activeTenant
  } = useApp();

  // Filter courses strictly for this individual Solo Tutor's workspace
  const teacherCourses: Course[] = useMemo(() => {
    const tutorCourses = courses.filter(
      (c) => c.teacherName === currentUser?.name || c.id === "crs_math_12" || c.title.toLowerCase().includes("math")
    );
    return tutorCourses.length > 0 ? tutorCourses : courses.slice(0, 2);
  }, [courses, currentUser]);

  const [activeTab, setActiveTab] = useState<"home" | "grading" | "assignments" | "analytics">(
    currentView === "assignments"
      ? "assignments"
      : currentView === "submissions"
      ? "grading"
      : initialTab
  );

  // Sync tab if currentView changes externally from sidebar
  useEffect(() => {
    if (currentView === "assignments") {
      setActiveTab("assignments");
    } else if (currentView === "submissions") {
      setActiveTab("grading");
    } else if (currentView === "dashboard") {
      setActiveTab("home");
    }
  }, [currentView]);

  const [selectedSubId, setSelectedSubId] = useState<string>(submissions[0]?.id || "");
  const [subFilter, setSubFilter] = useState<"all" | "pending" | "marked" | "released">("pending");
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all");
  const [marksInput, setMarksInput] = useState<number>(85);
  const [feedbackInput, setFeedbackInput] = useState<string>("");

  // Modals
  const [isCreateAsgModalOpen, setIsCreateAsgModalOpen] = useState(false);
  const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);
  const [isCreateAnnouncementModalOpen, setIsCreateAnnouncementModalOpen] = useState(false);

  // Live Class Stream Modal State
  const [liveClassSession, setLiveClassSession] = useState<{
    course: string;
    courseId?: string;
    topic: string;
    time: string;
    period: string;
    classRoom: string;
    deliveryMode: "physical" | "live_online";
    meetingUrl?: string;
    meetingId?: string;
    passcode?: string;
    studentsCount: number;
    status: "completed" | "in_progress" | "upcoming";
  } | null>(null);

  const [copiedInvite, setCopiedInvite] = useState(false);

  const handleCopyInvite = (url?: string) => {
    const link = url || "https://meet.google.com/lms-math-13";
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2500);
    }
  };

  // New assignment form state
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("Unit 1: Quadratic Functions");
  const [newDueDate, setNewDueDate] = useState("2026-10-18 23:59");
  const [newMaxMarks, setNewMaxMarks] = useState(100);
  const [newInstructions, setNewInstructions] = useState("");
  const [newCourseId, setNewCourseId] = useState(courses[0]?.id || "");
  const [asgPdfFile, setAsgPdfFile] = useState<{ name: string; size: string } | null>(null);

  // Edit assignment form state
  const [isEditAsgModalOpen, setIsEditAsgModalOpen] = useState(false);
  const [editingAsgId, setEditingAsgId] = useState("");
  const [editCourseId, setEditCourseId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editTopic, setEditTopic] = useState("");
  const [editMaxMarks, setEditMaxMarks] = useState(100);
  const [editDueDate, setEditDueDate] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [editAsgPdfFile, setEditAsgPdfFile] = useState<{ name: string; size: string } | null>(null);

  // New lesson form state with full multi-format upload support
  const [lessonCourseId, setLessonCourseId] = useState(courses[0]?.id || "crs_math_12");
  const [lessonUnitId, setLessonUnitId] = useState("");
  const [lessonTopicId, setLessonTopicId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonContentType, setLessonContentType] = useState<"pdf" | "slides" | "video" | "rich_text">("pdf");
  const [lessonBody, setLessonBody] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonVideoDuration, setLessonVideoDuration] = useState("45 mins");
  const [lessonSlidesCount, setLessonSlidesCount] = useState<number>(10);
  const [uploadedMainFile, setUploadedMainFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [supplementaryFiles, setSupplementaryFiles] = useState<{ name: string; size: string; type: string }[]>([]);

  // Synchronize target units and topics based on selected course
  const currentLessonCourse = courses.find((c) => c.id === lessonCourseId) || courses[0];
  const currentUnits = currentLessonCourse?.units || [];
  const activeSelectedUnit = currentUnits.find((u) => u.id === lessonUnitId) || currentUnits[0];
  const currentTopics = activeSelectedUnit?.topics || [];
  const activeSelectedTopic = currentTopics.find((t) => t.id === lessonTopicId) || currentTopics[0];

  const handleMainFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      const fileExt = file.name.split(".").pop()?.toUpperCase() || "PDF";
      setUploadedMainFile({
        name: file.name,
        size: sizeStr,
        type: fileExt
      });
      if (!lessonTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setLessonTitle(cleanName);
      }
    }
  };

  const handleSupplementaryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      const fileExt = file.name.split(".").pop()?.toUpperCase() || "PDF";
      setSupplementaryFiles((prev) => [
        ...prev,
        { name: file.name, size: sizeStr, type: fileExt }
      ]);
    }
  };

  const removeSupplementaryFile = (index: number) => {
    setSupplementaryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // New announcement / notice form state
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annAudience, setAnnAudience] = useState("All Enrolled Students");
  const [annPriority, setAnnPriority] = useState<"normal" | "high">("normal");

  // Edit announcement / notice state
  const [editingNotice, setEditingNotice] = useState<Announcement | null>(null);
  const [isEditAnnouncementModalOpen, setIsEditAnnouncementModalOpen] = useState(false);
  const [editAnnTitle, setEditAnnTitle] = useState("");
  const [editAnnMessage, setEditAnnMessage] = useState("");
  const [editAnnAudience, setEditAnnAudience] = useState("All Enrolled Students");
  const [editAnnPriority, setEditAnnPriority] = useState<"normal" | "high">("normal");

  // View announcement modal state
  const [viewingNotice, setViewingNotice] = useState<Announcement | null>(null);

  // Filtered submissions for Grading Desk
  const filteredSubmissions = submissions.filter((s) => {
    if (assignmentFilter !== "all" && s.assignmentId !== assignmentFilter) return false;
    if (subFilter === "pending") return s.status === "submitted";
    if (subFilter === "marked") return s.status === "marked";
    if (subFilter === "released") return s.status === "result_released";
    return true;
  });

  const activeSubmission =
    submissions.find((s) => s.id === selectedSubId) || filteredSubmissions[0] || submissions[0];

  // Update inputs when active submission changes
  useEffect(() => {
    if (activeSubmission) {
      setMarksInput(activeSubmission.marksObtained ?? activeSubmission.maxMarks * 0.85);
      setFeedbackInput(activeSubmission.teacherFeedback || "");
    }
  }, [activeSubmission?.id]);

  const handleSaveGrade = (release: boolean) => {
    if (!activeSubmission) return;
    gradeSubmission(activeSubmission.id, Number(marksInput), feedbackInput, release);
  };

  const handleAsgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      setAsgPdfFile({ name: file.name, size: sizeStr });
    }
  };

  const handleEditAsgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      setEditAsgPdfFile({ name: file.name, size: sizeStr });
    }
  };

  const handleOpenEditAssignment = (asg: Assignment) => {
    setEditingAsgId(asg.id);
    setEditCourseId(asg.courseId || courses[0]?.id || "");
    setEditTitle(asg.title);
    setEditTopic(asg.topicName);
    setEditMaxMarks(asg.maxMarks);
    setEditDueDate(asg.dueDate);
    setEditInstructions(asg.instructions);
    if (asg.attachmentName) {
      setEditAsgPdfFile({ name: asg.attachmentName, size: "PDF Document" });
    } else {
      setEditAsgPdfFile(null);
    }
    setIsEditAsgModalOpen(true);
  };

  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    createAssignment({
      courseId: newCourseId || courses[0]?.id,
      title: newTitle,
      topicName: newTopic,
      dueDate: newDueDate,
      maxMarks: Number(newMaxMarks),
      instructions: newInstructions,
      attachmentName: asgPdfFile?.name
    });
    setIsCreateAsgModalOpen(false);
    setNewTitle("");
    setNewInstructions("");
    setAsgPdfFile(null);
  };

  const handleUpdateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsgId || !editTitle) return;
    updateAssignment(editingAsgId, {
      courseId: editCourseId,
      title: editTitle,
      topicName: editTopic,
      dueDate: editDueDate,
      maxMarks: Number(editMaxMarks),
      instructions: editInstructions,
      attachmentName: editAsgPdfFile ? editAsgPdfFile.name : undefined
    });
    setIsEditAsgModalOpen(false);
  };

  const handleCreateLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle) return;
    const targetCourse = courses.find((c) => c.id === lessonCourseId) || courses[0];
    const targetUnit = targetCourse.units.find((u) => u.id === lessonUnitId) || targetCourse.units[0];
    const targetTopic = targetUnit?.topics.find((t) => t.id === lessonTopicId) || targetUnit?.topics[0];

    const allAttachments = [...supplementaryFiles];
    if (uploadedMainFile) {
      allAttachments.unshift(uploadedMainFile);
    }

    let generatedBody = lessonBody;
    if (!generatedBody.trim()) {
      if (lessonContentType === "pdf") {
        generatedBody = `Official curriculum PDF study guide: ${uploadedMainFile?.name || "Curriculum_Lecture_Guide.pdf"}\n\nStudents can read and download this comprehensive reference material with worked examples and exercise problems.`;
      } else if (lessonContentType === "slides") {
        generatedBody = `Presentation Slide Deck (${lessonSlidesCount} slides)\nFile: ${uploadedMainFile?.name || "Presentation_Slides.pptx"}\n\nReview each slide deck step-by-step for key diagrams, definitions, and exam techniques.`;
      } else if (lessonContentType === "video") {
        generatedBody = `Classroom Video Recording (${lessonVideoDuration})\nVideo Link: ${lessonVideoUrl || "https://meet.google.com/class-recording"}\nFile: ${uploadedMainFile?.name || "Video Lecture"}\n\nFull HD classroom lecture covering core principles, step-by-step problem solving, and past paper proofs.`;
      } else {
        generatedBody = "Detailed lecture material, definitions, and theory study notes.";
      }
    }

    if (targetUnit && targetTopic) {
      createLesson(targetCourse.id, targetUnit.id, targetTopic.id, {
        title: lessonTitle,
        description: lessonDescription || (lessonContentType === "pdf" ? "Coursework PDF study material" : lessonContentType === "slides" ? "Classroom presentation slides" : lessonContentType === "video" ? "Classroom video recording" : "Interactive theory lecture"),
        contentType: lessonContentType,
        contentBody: generatedBody,
        videoUrl: lessonVideoUrl,
        slidesCount: lessonSlidesCount,
        attachments: allAttachments
      });
    }

    setIsCreateLessonModalOpen(false);
    setLessonTitle("");
    setLessonDescription("");
    setLessonBody("");
    setLessonVideoUrl("");
    setUploadedMainFile(null);
    setSupplementaryFiles([]);
  };

  const handleCreateAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) return;
    createAnnouncement({
      title: annTitle.trim(),
      message: annMessage.trim(),
      targetAudience: annAudience,
      priority: annPriority,
      authorName: activeTenant?.adminName || currentUser.name || "Dr. Samantha Perera",
      authorRole: "Solo Tutor"
    });
    setIsCreateAnnouncementModalOpen(false);
    setAnnTitle("");
    setAnnMessage("");
  };

  const handleOpenEditNotice = (notice: Announcement) => {
    setEditingNotice(notice);
    setEditAnnTitle(notice.title);
    setEditAnnMessage(notice.message);
    setEditAnnAudience(notice.targetAudience);
    setEditAnnPriority(notice.priority === "urgent" ? "high" : (notice.priority as any) || "normal");
    setIsEditAnnouncementModalOpen(true);
  };

  const handleEditAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice || !editAnnTitle.trim()) return;
    updateAnnouncement(editingNotice.id, {
      title: editAnnTitle.trim(),
      message: editAnnMessage.trim(),
      targetAudience: editAnnAudience,
      priority: editAnnPriority
    });
    setIsEditAnnouncementModalOpen(false);
    setEditingNotice(null);
  };

  const handleDeleteNotice = (id: string) => {
    deleteAnnouncement(id);
  };

  // Performance analytics calculation
  const gradedSubmissions = submissions.filter((s) => s.marksObtained !== undefined);
  const avgScore = gradedSubmissions.length > 0
    ? (
        gradedSubmissions.reduce(
          (sum, s) => sum + ((s.marksObtained || 0) / s.maxMarks) * 100,
          0
        ) / gradedSubmissions.length
      ).toFixed(1)
    : "84.5";

  // Today's Teaching Schedule (Timeline)
  interface ScheduleItem {
    period: string;
    time: string;
    course: string;
    courseId: string;
    topic: string;
    classRoom: string;
    deliveryMode: "physical" | "live_online";
    type: string;
    status: "completed" | "in_progress" | "upcoming";
    studentsCount: number;
    meetingUrl?: string;
    meetingId?: string;
    passcode?: string;
  }

  const todaySchedule: ScheduleItem[] = [
    {
      period: "Morning Batch",
      time: "07:30 AM – 09:00 AM",
      course: "Grade 12 Combined Mathematics",
      courseId: "crs_math_12",
      topic: "Unit 1: Quadratic Inequations & Interval Sign Analysis",
      classRoom: "Virtual Studio Classroom · Stream #CM-12",
      deliveryMode: "live_online",
      meetingUrl: "https://meet.google.com/lms-math-12",
      meetingId: "SOLO-MATH-12-AM",
      passcode: "558291",
      type: "Live Theory Lecture",
      status: "completed",
      studentsCount: 42
    },
    {
      period: "Live Masterclass",
      time: "09:30 AM – 11:00 AM",
      course: "Grade 13 Applied Mathematics",
      courseId: "crs_math_12",
      topic: "Unit 2: Differential Calculus & Curve Sketching",
      classRoom: "Tutor Live Studio · Room #MATH-A1",
      deliveryMode: "live_online",
      meetingUrl: "https://meet.google.com/lms-math-13",
      meetingId: "SOLO-MATH-LIVE-992",
      passcode: "774921",
      type: "Live Interactive Masterclass",
      status: "in_progress",
      studentsCount: 38
    },
    {
      period: "Afternoon Workshop",
      time: "04:00 PM – 05:30 PM",
      course: "Grade 12 Applied Mathematics Mechanics",
      courseId: "crs_math_12",
      topic: "Mechanics Intensive: Equilibrium Systems & Newton's Laws",
      classRoom: "Tutor Live Studio · Room #MATH-MECH",
      deliveryMode: "live_online",
      meetingUrl: "https://meet.google.com/lms-math-mech",
      meetingId: "SOLO-MATH-MECH-880",
      passcode: "419082",
      type: "Live Problem Workshop",
      status: "upcoming",
      studentsCount: 32
    },
    {
      period: "Evening Clinic",
      time: "07:30 PM – 09:00 PM",
      course: "Grade 12 Combined Mathematics",
      courseId: "crs_math_12",
      topic: "Live Doubt Clearance & Past Paper Clinic",
      classRoom: "Doubt Clearance Studio · Room #MATH-CLN",
      deliveryMode: "live_online",
      meetingUrl: "https://meet.google.com/lms-math-doubt",
      meetingId: "SOLO-MATH-CLN-410",
      passcode: "392011",
      type: "Live Tutorial Clinic",
      status: "upcoming",
      studentsCount: 24
    }
  ];

  // Sri Lanka G.C.E A/L Grade Distribution
  const gradeDistribution = [
    { grade: "A (75-100%)", count: 18, fill: "#0d5c4d" },
    { grade: "B (65-74%)", count: 12, fill: "#158066" },
    { grade: "C (55-64%)", count: 6, fill: "#f3b738" },
    { grade: "S (40-54%)", count: 3, fill: "#e59f20" },
    { grade: "W (<40%)", count: 1, fill: "#e11d48" }
  ];

  const studentRoster = [
    { name: "Sathurjan K.", index: "AL-2026-4401", class: "12-Physical Science", submitted: 2, avg: "94%", status: "Distinction" },
    { name: "Kasun Bandara", index: "AL-2026-4402", class: "12-Physical Science", submitted: 1, avg: "Pending", status: "Review" },
    { name: "Anuki Silva", index: "AL-2026-4403", class: "12-Physical Science", submitted: 2, avg: "88%", status: "Distinction" },
    { name: "Dineth Perera", index: "AL-2026-4404", class: "12-Physical Science", submitted: 2, avg: "76%", status: "Merit" },
    { name: "Tharushi Fernando", index: "AL-2026-4405", class: "12-Physical Science", submitted: 2, avg: "68%", status: "Credit" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Teacher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6ece8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0d5c4d]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d5c4d]">
              {currentView === "submissions"
                ? "Assessments & Review"
                : currentView === "assignments"
                ? "Coursework Management"
                : "Faculty Management System"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0d2b26] mt-1">
            {currentView === "submissions"
              ? "Submissions & Grading Desk"
              : currentView === "assignments"
              ? "Course Assignments"
              : "Teaching Studio · Home"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentView === "submissions"
              ? "Review student submissions, assign marks based on curriculum rubrics, and release results."
              : currentView === "assignments"
              ? "Publish and manage coursework assignments, problem sets, and submission deadlines."
              : "Overview of your classes, student performance analytics, and institutional activity."}
          </p>
        </div>

        {/* Quick Action Buttons */}
        {activeTab !== "home" && (
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => setIsCreateAnnouncementModalOpen(true)}
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-2xs cursor-pointer"
            >
              <Bell className="h-3.5 w-3.5 mr-1.5" /> Notice
            </Button>
          </div>
        )}
      </div>


      {/* HOME VIEW: TEACHER DAILY COCKPIT & OPERATIONS DASHBOARD */}
      {activeTab === "home" && (
        <div className="space-y-6">
          {/* Quick Action Hub Bar */}
          <div className="bg-gradient-to-r from-[#0d5c4d] via-[#106e5d] to-[#158066] rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                  Daily Cockpit
                </span>
                <span className="text-xs text-white/80 font-medium">Welcome back, Mr. Samantha Perera</span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">Teaching &amp; Assessment Control Center</h2>
              <p className="text-xs text-white/80 mt-0.5">
                Manage today&apos;s lectures, evaluate incoming submissions, and update your batch syllabi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                onClick={() => setIsCreateAsgModalOpen(true)}
                className="bg-white text-[#0d5c4d] hover:bg-emerald-50 font-bold text-xs shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Create Assignment
              </Button>
              <Button
                onClick={() => setIsCreateLessonModalOpen(true)}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs cursor-pointer backdrop-blur-xs"
              >
                <UploadCloud className="h-3.5 w-3.5 mr-1" /> Add Lesson
              </Button>
              <Button
                onClick={() => setIsCreateAnnouncementModalOpen(true)}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs cursor-pointer backdrop-blur-xs"
              >
                <Bell className="h-3.5 w-3.5 mr-1" /> Post Notice
              </Button>
            </div>
          </div>

          {/* Grid Layout: Left Column (Timetable & Active Classes & Submissions) + Right Column (Action Required & Doubts) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* 1. Today's Class Schedule (Timeline) */}
              <Card className="border-[#e6ece8] bg-white shadow-2xs">
                <CardHeader className="p-5 pb-3 border-b border-[#e6ece8] flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-black text-[#0d2b26]">
                        Today&apos;s Teaching Schedule &amp; Timetable
                      </CardTitle>
                      <p className="text-xs text-slate-500">
                        Today&apos;s scheduled live batch streams, interactive Google Meet sessions, and student clinics.
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs border-[#c4e9e0] text-[#0d5c4d] bg-[#ecf8f5]">
                    4 Sessions Today
                  </Badge>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {todaySchedule.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        item.status === "in_progress"
                          ? item.deliveryMode === "live_online"
                            ? "bg-rose-50/40 border-rose-200 shadow-2xs"
                            : "bg-[#ecf8f5]/60 border-[#a2dfd2] shadow-2xs"
                          : item.status === "completed"
                          ? "bg-[#f8faf9] border-[#e6ece8] opacity-80"
                          : "bg-white border-[#e6ece8] hover:border-[#b2e5d9]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {item.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : item.status === "in_progress" ? (
                            item.deliveryMode === "live_online" ? (
                              <div className="relative flex items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-400 opacity-75"></span>
                                <Video className="h-5 w-5 text-rose-600 relative" />
                              </div>
                            ) : (
                              <div className="relative flex items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
                                <Clock className="h-5 w-5 text-[#0d5c4d] relative" />
                              </div>
                            )
                          ) : (
                            <Clock className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-[#0d2b26]">{item.course}</span>

                            {/* Delivery Mode Badge */}
                            {item.deliveryMode === "live_online" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" /> Live Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                🏢 Physical Campus
                              </span>
                            )}

                            {/* Status Badge */}
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold py-0 h-4 ${
                                item.status === "in_progress"
                                  ? item.deliveryMode === "live_online"
                                    ? "bg-rose-500 text-white border-rose-500 animate-pulse"
                                    : "bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse"
                                  : item.status === "completed"
                                  ? "bg-slate-100 text-slate-600 border-slate-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {item.status === "in_progress"
                                ? "Happening Now"
                                : item.status === "completed"
                                ? "Concluded"
                                : "Upcoming"}
                            </Badge>

                            <span className="text-[11px] text-slate-500 font-mono font-medium">
                              {item.period} · {item.time}
                            </span>
                          </div>

                          <p className="text-xs font-medium text-slate-700 mt-1 flex items-center gap-1.5">
                            <span className="font-semibold text-[#0d5c4d]">{item.type}:</span> {item.topic}
                          </p>

                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <span className="font-semibold text-slate-600">Venue:</span> {item.classRoom}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> {item.studentsCount} Students
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                        {item.status === "in_progress" ? (
                          item.deliveryMode === "live_online" ? (
                            <Button
                              size="sm"
                              onClick={() => setLiveClassSession(item)}
                              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer gap-1.5 animate-pulse"
                            >
                              <Video className="h-3.5 w-3.5" /> Join Live Class →
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedCourseId(item.courseId);
                                setCurrentView("course-detail");
                              }}
                              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold shadow-2xs"
                            >
                              Class Studio →
                            </Button>
                          )
                        ) : item.status === "upcoming" ? (
                          item.deliveryMode === "live_online" ? (
                            <Button
                              size="sm"
                              onClick={() => setLiveClassSession(item)}
                              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold gap-1.5 cursor-pointer"
                            >
                              <Video className="h-3.5 w-3.5 text-rose-400" /> Start Live Stream
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCourseId(item.courseId);
                                setCurrentView("course-detail");
                              }}
                              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                            >
                              View Plan
                            </Button>
                          )
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400">Class Finished</span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 2. My Active Classes & Syllabus Coverage */}
              <Card className="border-[#e6ece8] bg-white shadow-2xs">
                <CardHeader className="p-5 pb-3 border-b border-[#e6ece8] flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-black text-[#0d2b26]">
                        My Active Batches &amp; Syllabus Coverage
                      </CardTitle>
                      <p className="text-xs text-slate-500">
                        Curriculum pacing and lecture repository across your assigned classrooms
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsCreateLessonModalOpen(true)}
                    className="text-xs text-[#0d5c4d] hover:text-[#083e34] hover:bg-[#ecf8f5] font-bold p-0 h-auto"
                  >
                    + Add Lesson
                  </Button>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teacherCourses.map((course) => {
                      const totalLessons = course.totalLessons || 12;
                      const completedLessons = course.completedLessons || 6;
                      const progressPct = Math.round((completedLessons / totalLessons) * 100);
                      const courseAsgs = assignments.filter((a) => a.courseId === course.id);

                      return (
                        <div
                          key={course.id}
                          className="p-4 rounded-xl border border-[#e6ece8] hover:border-[#b2e5d9] bg-white shadow-2xs space-y-3 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Badge variant="outline" className="text-[10px] font-mono border-slate-200 text-slate-600 mb-1">
                                {course.code} · {course.className || "A/L Section"}
                              </Badge>
                              <h4 className="text-sm font-black text-[#0d2b26] line-clamp-1">{course.title}</h4>
                              <p className="text-[11px] text-slate-500">{course.gradeName || "Advanced Level"}</p>
                            </div>
                            <div className="h-8 w-8 rounded-lg bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center shrink-0">
                              <BookOpen className="h-4 w-4" />
                            </div>
                          </div>

                          {/* Syllabus progress bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">Syllabus Covered</span>
                              <span className="font-bold text-[#0d5c4d]">{progressPct}% ({completedLessons}/{totalLessons} lessons)</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#0d5c4d] to-[#158066] rounded-full transition-all duration-500"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Stats info */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Units / Topics</span>
                              <span className="font-bold text-slate-700">{course.units?.length || 2} Units Active</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Assignments</span>
                              <span className="font-bold text-slate-700">{courseAsgs.length} Coursework Sets</span>
                            </div>
                          </div>

                          {/* Card actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedCourseId(course.id);
                                setCurrentView("course-detail");
                              }}
                              className="flex-1 bg-[#ecf8f5] hover:bg-[#d8f2ec] text-[#0d5c4d] text-xs font-bold border border-[#c4e9e0]"
                            >
                              Open Syllabus →
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setActiveTab("assignments");
                                setAssignmentFilter(course.id);
                              }}
                              className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                            >
                              Assignments
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 3. Recent Student Submissions Feed */}
              <Card className="border-[#e6ece8] bg-white shadow-2xs">
                <CardHeader className="p-5 pb-3 border-b border-[#e6ece8] flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-[#fef7e6] text-[#b47a16] flex items-center justify-center">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-black text-[#0d2b26]">
                        Recent Student Submissions Feed
                      </CardTitle>
                      <p className="text-xs text-slate-500">
                        Incoming student hand-ins awaiting marks or recently evaluated
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("grading")}
                    variant="outline"
                    className="border-[#c4e9e0] text-[#0d5c4d] font-bold text-xs hover:bg-[#ecf8f5]"
                  >
                    View All Submissions →
                  </Button>
                </CardHeader>
                <div className="divide-y divide-[#e6ece8]">
                  {submissions.slice(0, 5).map((sub) => {
                    const isPending = sub.status === "submitted";
                    const asg = assignments.find((a) => a.id === sub.assignmentId);

                    return (
                      <div
                        key={sub.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fbfcfb] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#e6ece8] text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {sub.studentName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{sub.studentName}</span>
                              <Badge
                                variant={
                                  isPending
                                    ? "warning"
                                    : sub.status === "result_released"
                                    ? "success"
                                    : "default"
                                }
                                className="text-[10px] py-0"
                              >
                                {isPending ? "Pending Review" : sub.status === "result_released" ? "Released" : "Marked"}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {asg?.title || sub.assignmentTitle || "Coursework Assignment"}
                            </p>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Submitted: {sub.submittedAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {isPending ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedSubId(sub.id);
                                setSubFilter("pending");
                                setActiveTab("grading");
                              }}
                              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold shadow-2xs"
                            >
                              Grade Now →
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-[#0d5c4d] bg-[#ecf8f5] px-2 py-0.5 rounded-md border border-[#c4e9e0]">
                                {sub.marksObtained ?? 85}/{sub.maxMarks || 100}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSubId(sub.id);
                                  setActiveTab("grading");
                                }}
                                className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
                              >
                                Review
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* 4. Learning Feed Broadcasts & Notices (Solo Tutor Feed Management) */}
              <Card className="border-[#e6ece8] bg-white shadow-2xs">
                <CardHeader className="p-5 pb-3 border-b border-[#e6ece8] flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-black text-[#0d2b26]">
                        Learning Feed Broadcasts &amp; Notices
                      </CardTitle>
                      <p className="text-xs text-slate-500">
                        Live updates and materials broadcast directly to your students&apos; Learning Feed
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsCreateAnnouncementModalOpen(true)}
                    className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs shadow-xs cursor-pointer gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Post Notice
                  </Button>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {announcements.length > 0 ? (
                    announcements.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-[#e6ece8] hover:border-[#b2e5d9] bg-white shadow-2xs space-y-2.5 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-[#0d2b26]">{item.title}</span>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                              {item.targetAudience}
                            </span>
                            {item.priority === "high" || item.priority === "urgent" ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black uppercase tracking-wider">
                                Urgent
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono shrink-0">
                            {item.publishedAt}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed whitespace-pre-line">
                          {item.message}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Author: <strong className="text-slate-800">{item.authorName}</strong>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setViewingNotice(item)}
                              className="h-7 px-2 text-xs text-slate-600 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] font-bold cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" /> View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenEditNotice(item)}
                              className="h-7 px-2 text-xs text-slate-600 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] font-bold cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteNotice(item.id)}
                              className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 font-bold cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 bg-[#fbfdfc] space-y-2">
                      <Bell className="h-6 w-6 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">No broadcast notices yet</p>
                      <p className="text-[11px] text-slate-400">Click &quot;Post Notice&quot; above to publish updates directly to your students&apos; Learning Feed.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column (4 cols) - Pending Tasks & Student Doubts & Notices */}
            <div className="lg:col-span-4 space-y-6">
              {/* Action Required / Pending Tasks */}
              <Card className="border-[#e6ece8] bg-white shadow-2xs">
                <CardHeader className="p-5 pb-3 border-b border-[#e6ece8]">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black text-[#0d2b26] flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      Action Required
                    </CardTitle>
                    <Badge variant="warning" className="text-[10px]">
                      {submissions.filter((s) => s.status === "submitted").length + 2} Tasks
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {/* Task 1: Grade submissions */}
                  <div className="p-3 rounded-xl bg-[#fef7e6] border border-[#fde4af] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#b47a16]">Grading Backlog</span>
                      <span className="text-[10px] font-bold bg-[#b47a16] text-white px-1.5 py-0.5 rounded-full">
                        Priority
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">
                      {submissions.filter((s) => s.status === "submitted").length} student submissions are waiting for your evaluation.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSubFilter("pending");
                        setActiveTab("grading");
                      }}
                      className="w-full bg-[#b47a16] hover:bg-[#925f0e] text-white text-xs font-bold mt-1"
                    >
                      Open Grading Desk
                    </Button>
                  </div>

                  {/* Task 2: Release Results */}
                  <div className="p-3 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0d5c4d]">Pending Release</span>
                      <span className="text-[10px] font-bold text-slate-500">Term 1</span>
                    </div>
                    <p className="text-xs text-slate-700">
                      Marked papers for Quadratic Functions ready to be published to student portals.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSubFilter("marked");
                        setActiveTab("grading");
                      }}
                      className="w-full border-[#0d5c4d] text-[#0d5c4d] hover:bg-[#ecf8f5] text-xs font-bold mt-1"
                    >
                      Review &amp; Release
                    </Button>
                  </div>

                  {/* Task 3: Upcoming Due Date */}
                  <div className="p-3 rounded-xl bg-[#f8faf9] border border-[#e6ece8] space-y-1">
                    <span className="text-xs font-bold text-slate-700">Upcoming Assignment Deadline</span>
                    <p className="text-xs text-slate-500">
                      &quot;Differential Calculus Problem Set&quot; due on Oct 18, 2026.
                    </p>
                  </div>
                </CardContent>
              </Card>



              {/* Solo Tutor 1-on-1 Consultation Hours Card */}
              <Card className="border-[#e6ece8] bg-white shadow-2xs">
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#0d5c4d]" />
                    <h4 className="text-xs font-extrabold text-[#0d2b26]">Online 1-on-1 Consultation Hours</h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">Monday &amp; Thursday:</span> 04:30 PM – 06:00 PM
                  </p>
                  <p className="text-xs text-slate-500">
                    Format: Virtual 1-on-1 Doubt Clearance via Google Meet &bull; Bookable via Tutor Connect.
                  </p>
                  <div className="pt-1">
                    <span className="inline-block text-[11px] font-bold text-[#0d5c4d] bg-[#ecf8f5] px-2 py-0.5 rounded border border-[#c4e9e0]">
                      Active for Enrolled Subscribers
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Submissions Review & Grading Desk (Section 6.4) */}
      {activeTab === "grading" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-extrabold text-[#0d2b26] flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-[#0d5c4d]" />
              Submissions Review & Grading Desk (Section 6.4)
            </h2>

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Assignment Filter */}
              <select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value)}
                className="h-8 px-2.5 rounded-xl bg-white border border-[#e6ece8] text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="all">All Assignments</option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <div className="flex items-center bg-white border border-[#e6ece8] rounded-xl p-0.5 shadow-2xs">
                <button
                  onClick={() => setSubFilter("pending")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    subFilter === "pending"
                      ? "bg-[#f3b738] text-slate-950 shadow-xs"
                      : "text-slate-600 hover:text-[#0d5c4d]"
                  }`}
                >
                  Pending ({submissions.filter((s) => s.status === "submitted").length})
                </button>
                <button
                  onClick={() => setSubFilter("marked")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    subFilter === "marked"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "text-slate-600 hover:text-[#0d5c4d]"
                  }`}
                >
                  Draft ({submissions.filter((s) => s.status === "marked").length})
                </button>
                <button
                  onClick={() => setSubFilter("released")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    subFilter === "released"
                      ? "bg-[#0d5c4d] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#0d5c4d]"
                  }`}
                >
                  Released ({submissions.filter((s) => s.status === "result_released").length})
                </button>
                <button
                  onClick={() => setSubFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    subFilter === "all"
                      ? "bg-[#0d5c4d] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#0d5c4d]"
                  }`}
                >
                  All ({submissions.length})
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Submissions Queue (5 cols) */}
            <div className="lg:col-span-5 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Select Student Submission ({filteredSubmissions.length})
              </p>

              {filteredSubmissions.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#e6ece8] rounded-2xl text-xs text-slate-500">
                  No submissions matching this filter.
                </div>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isSelected = activeSubmission?.id === sub.id;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubId(sub.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white border-[#0d5c4d] shadow-md ring-2 ring-[#0d5c4d]/10"
                          : "bg-white border-[#e6ece8] hover:border-[#c4e9e0] shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{sub.studentName}</span>
                        <Badge
                          variant={
                            sub.status === "result_released"
                              ? "success"
                              : sub.status === "marked"
                              ? "default"
                              : "warning"
                          }
                        >
                          {sub.status === "result_released"
                            ? "Released"
                            : sub.status === "marked"
                            ? "Draft Marked"
                            : "Pending Review"}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#0d5c4d] font-bold mt-1">
                        {sub.assignmentTitle}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                        <span>Submitted: {sub.submittedAt}</span>
                        {sub.marksObtained !== undefined && (
                          <span className="font-bold text-[#0d5c4d]">
                            Score: {sub.marksObtained}/{sub.maxMarks} (
                            {Math.round((sub.marksObtained / sub.maxMarks) * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Grading Desk & Feedback Composer (7 cols) */}
            <div className="lg:col-span-7">
              {activeSubmission ? (
                <Card className="border-[#e6ece8] bg-white shadow-2xs p-6 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#e6ece8]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-[#0d2b26]">
                          {activeSubmission.studentName}
                        </h3>
                        <Badge
                          variant={
                            activeSubmission.status === "result_released"
                              ? "success"
                              : activeSubmission.status === "marked"
                              ? "default"
                              : "warning"
                          }
                          className="text-[10px]"
                        >
                          {activeSubmission.status === "result_released"
                            ? "Marks Released"
                            : activeSubmission.status === "marked"
                            ? "Draft Saved"
                            : "Awaiting Evaluation"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activeSubmission.assignmentTitle}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono font-bold bg-[#f8faf9] border-slate-300">
                      Max: {activeSubmission.maxMarks} Marks
                    </Badge>
                  </div>

                  {/* Student's answer text and file */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Student's Submission Work:
                    </p>
                    <div className="p-4 rounded-xl bg-[#f8faf9] border border-[#e6ece8] text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {activeSubmission.textContent || "No written response text entered."}
                    </div>
                    {activeSubmission.fileAttachmentName && (
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] text-xs">
                        <div className="flex items-center gap-2 text-[#0d5c4d] font-bold">
                          <FileText className="h-4 w-4" />
                          <span>{activeSubmission.fileAttachmentName}</span>
                        </div>
                        <Button variant="outline" size="sm" className="h-7 text-xs text-[#0d5c4d] border-[#c4e9e0] hover:bg-[#ecf8f5]">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View PDF
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Teacher Marks Entry & Written Feedback */}
                  <div className="space-y-4 pt-4 border-t border-[#e6ece8]">
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Enter Marks (out of {activeSubmission.maxMarks}):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={activeSubmission.maxMarks}
                            value={marksInput}
                            onChange={(e) => setMarksInput(Number(e.target.value))}
                            className="w-28 h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 font-mono font-bold text-lg focus:outline-none focus:border-[#0d5c4d]"
                          />
                          <span className="text-xs font-bold text-slate-500">
                            / {activeSubmission.maxMarks} (
                            {Math.round((Number(marksInput) / activeSubmission.maxMarks) * 100)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {t.academic.teacherFeedback}
                      </label>
                      <textarea
                        rows={3}
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Add personalized feedback, areas of improvement, and commendations..."
                        className="w-full p-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d]"
                      />
                    </div>

                    {/* Actions: Save Draft vs Release Results */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-3">
                      <Button
                        variant="outline"
                        onClick={() => handleSaveGrade(false)}
                        className="text-xs font-bold border-slate-300 hover:bg-slate-50"
                      >
                        Save Marks as Draft
                      </Button>
                      <Button
                        onClick={() => handleSaveGrade(true)}
                        className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-2 text-xs shadow-sm"
                      >
                        <Send className="h-4 w-4" />
                        {t.academic.releaseResults}
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="p-12 text-center bg-white border border-[#e6ece8] rounded-2xl text-xs text-slate-500">
                  Select a submission from the list on the left to grade.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Course Assignments Manager (Section 6.3) */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[#0d2b26] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0d5c4d]" />
                Course Assignments Manager (Section 6.3)
              </h2>
              <p className="text-xs text-slate-500">
                Track homework tasks, deadline compliance, and launch grading sessions.
              </p>
            </div>

            <Button
              onClick={() => setIsCreateAsgModalOpen(true)}
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-1.5 text-xs shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Create Assignment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((asg) => {
              const submissionCount = submissions.filter((s) => s.assignmentId === asg.id).length;
              const pendingCount = submissions.filter(
                (s) => s.assignmentId === asg.id && s.status === "submitted"
              ).length;

              return (
                <Card key={asg.id} className="border-[#e6ece8] bg-white shadow-2xs hover:shadow-xs transition-shadow">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-bold text-[#0d5c4d] bg-[#ecf8f5] border-[#c4e9e0]">
                        {asg.topicName}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-mono font-bold">
                        {asg.maxMarks} Marks
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-black text-[#0d2b26] mt-2">
                      {asg.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-4">
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {asg.instructions}
                    </p>

                    {asg.attachmentName && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] text-xs text-[#0d5c4d]">
                        <FileText className="h-4 w-4 shrink-0 text-[#0d5c4d]" />
                        <span className="font-bold truncate flex-1">{asg.attachmentName}</span>
                        <span className="text-[10px] font-mono uppercase bg-white/80 px-2 py-0.5 rounded border border-[#c4e9e0] shrink-0">
                          Question PDF
                        </span>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-[#f8faf9] border border-[#e6ece8] space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>Submissions Progress</span>
                        <span>{submissionCount} / 35 Enrolled (80%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-[#0d5c4d] rounded-full" style={{ width: "80%" }}></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1 text-[#b47a16] font-bold">
                          <Clock className="h-3 w-3" /> Due: {asg.dueDate}
                        </span>
                        {pendingCount > 0 && (
                          <span className="text-[#b47a16] font-bold">
                            {pendingCount} Pending Review
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditAssignment(asg)}
                          className="border-[#c4e9e0] text-[#0d5c4d] hover:bg-[#ecf8f5] text-xs font-bold gap-1 cursor-pointer h-8"
                          title="Edit Assignment"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>

                        <button
                          onClick={() => {
                            if (confirm(`Remove assignment "${asg.title}"?`)) {
                              deleteAssignment(asg.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Assignment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => {
                          setAssignmentFilter(asg.id);
                          setCurrentView("submissions");
                          setActiveTab("grading");
                        }}
                        className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs gap-1.5 shadow-2xs h-8 cursor-pointer"
                      >
                        <ClipboardCheck className="h-3.5 w-3.5" /> Review Submissions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Class Performance Analytics (Section 6.5) */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-[#0d2b26] flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#0d5c4d]" />
              Class Performance Analytics (Section 6.5)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cohorts mark distributions conforming to Sri Lankan G.C.E A/L grading benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart Column (7 cols) */}
            <Card className="lg:col-span-7 border-[#e6ece8] bg-white shadow-2xs">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-sm font-black text-[#0d2b26]">
                  A/L Marks Grade Distribution (Grade 12 Physical Science)
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Breakdown of 40 enrolled candidates across benchmark bands.
                </p>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f1" />
                      <XAxis dataKey="grade" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0d2b26",
                          borderColor: "#0d2b26",
                          color: "#fff",
                          borderRadius: "12px",
                          fontSize: "12px"
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#0d5c4d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Benchmark Summary (5 cols) */}
            <Card className="lg:col-span-5 border-[#e6ece8] bg-white shadow-2xs">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-sm font-black text-[#0d2b26]">
                  Faculty Benchmark Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="p-3.5 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#0d5c4d] font-bold">Class Average</p>
                    <p className="text-xl font-black text-[#0d2b26] mt-0.5">82.4%</p>
                  </div>
                  <Badge variant="success">Above Target</Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 font-bold">On-Time Submission Rate</p>
                    <p className="text-xl font-black text-[#0d2b26] mt-0.5">94.3%</p>
                  </div>
                  <Badge variant="outline">On Track</Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-[#fef7e6] border border-[#fde4af] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#b47a16] font-bold">Students Needing Support</p>
                    <p className="text-xl font-black text-[#0d2b26] mt-0.5">2 Students</p>
                  </div>
                  <Badge variant="warning">Follow-up</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Roster Table */}
          <Card className="border-[#e6ece8] bg-white shadow-2xs">
            <CardHeader className="p-6 pb-3 border-b border-[#e6ece8]">
              <CardTitle className="text-sm font-black text-[#0d2b26]">
                Student Performance Roster
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f8faf9] text-slate-500 font-bold uppercase tracking-wider border-b border-[#e6ece8]">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Index No</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Average</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6ece8]">
                  {studentRoster.map((st, i) => (
                    <tr key={i} className="hover:bg-[#fbfcfb]">
                      <td className="py-3 px-4 font-bold text-slate-900">{st.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{st.index}</td>
                      <td className="py-3 px-4 text-slate-600">{st.class}</td>
                      <td className="py-3 px-4 text-slate-600">{st.submitted} / 2</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0d5c4d]">{st.avg}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            st.status === "Distinction"
                              ? "success"
                              : st.status === "Merit"
                              ? "default"
                              : "warning"
                          }
                        >
                          {st.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Create Assignment */}
      <Modal
        isOpen={isCreateAsgModalOpen}
        onClose={() => setIsCreateAsgModalOpen(false)}
        title="Create New Assignment"
        description="Publish problem sets, lab guides, or questions to enrolled students."
      >
        <form onSubmit={handleCreateAssignmentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Course
            </label>
            <select
              value={newCourseId}
              onChange={(e) => setNewCourseId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.className})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Assignment Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Differentiation Proofs Set 02"
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Topic Tag
              </label>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Maximum Marks
              </label>
              <input
                type="number"
                value={newMaxMarks}
                onChange={(e) => setNewMaxMarks(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Due Date & Time
            </label>
            <input
              type="text"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Instructions & Problem Description
            </label>
            <textarea
              rows={4}
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              placeholder="Detailed guidelines and formatting requirements..."
              className="w-full p-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Attach Assignment Question Paper / PDF (Optional)
            </label>
            {asgPdfFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#c4e9e0] text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <FileUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{asgPdfFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{asgPdfFile.size}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAsgPdfFile(null)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove Attachment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-[#c4e9e0] hover:border-[#0d5c4d] bg-[#f8faf9] rounded-xl cursor-pointer transition-colors group">
                <UploadCloud className="h-5 w-5 text-[#0d5c4d] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#0d2b26]">
                  Upload Assignment PDF Document (.pdf)
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleAsgFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateAsgModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold cursor-pointer">
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Assignment */}
      <Modal
        isOpen={isEditAsgModalOpen}
        onClose={() => setIsEditAsgModalOpen(false)}
        title="Edit Assignment"
        description="Update assignment problem sets, deadlines, or question paper documents."
      >
        <form onSubmit={handleUpdateAssignmentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Course
            </label>
            <select
              value={editCourseId}
              onChange={(e) => setEditCourseId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.className})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Assignment Title
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="e.g. Differentiation Proofs Set 02"
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Topic Tag
              </label>
              <input
                type="text"
                value={editTopic}
                onChange={(e) => setEditTopic(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Maximum Marks
              </label>
              <input
                type="number"
                value={editMaxMarks}
                onChange={(e) => setEditMaxMarks(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Due Date & Time
            </label>
            <input
              type="text"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Instructions & Problem Description
            </label>
            <textarea
              rows={4}
              value={editInstructions}
              onChange={(e) => setEditInstructions(e.target.value)}
              placeholder="Detailed guidelines and formatting requirements..."
              className="w-full p-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Attached Assignment Question Paper / PDF
            </label>
            {editAsgPdfFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#c4e9e0] text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <FileUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{editAsgPdfFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{editAsgPdfFile.size}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditAsgPdfFile(null)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove Attachment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-[#c4e9e0] hover:border-[#0d5c4d] bg-[#f8faf9] rounded-xl cursor-pointer transition-colors group">
                <UploadCloud className="h-5 w-5 text-[#0d5c4d] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#0d2b26]">
                  Upload / Replace Assignment PDF Document (.pdf)
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleEditAsgFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditAsgModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold cursor-pointer">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Lesson (Multi-Format: PDF, Slides, Video, Theory Notes) */}
      <Modal
        isOpen={isCreateLessonModalOpen}
        onClose={() => setIsCreateLessonModalOpen(false)}
        title="Add New Lesson to Syllabus"
        description="Upload coursework PDF documents, classroom presentation slides, or video lectures."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateLessonSubmit} className="space-y-4">
          {/* Target Course, Unit & Topic Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#f8faf9] p-3.5 rounded-2xl border border-[#e6ece8]">
            {/* Target Course */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Target Course
              </label>
              <select
                value={lessonCourseId}
                onChange={(e) => {
                  setLessonCourseId(e.target.value);
                  const crs = courses.find((c) => c.id === e.target.value);
                  if (crs && crs.units[0]) {
                    setLessonUnitId(crs.units[0].id);
                    if (crs.units[0].topics[0]) {
                      setLessonTopicId(crs.units[0].topics[0].id);
                    }
                  }
                }}
                className="w-full h-9 px-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0d5c4d]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Unit / Module */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Unit / Module
              </label>
              <select
                value={activeSelectedUnit?.id || ""}
                onChange={(e) => {
                  setLessonUnitId(e.target.value);
                  const u = currentUnits.find((unit) => unit.id === e.target.value);
                  if (u && u.topics[0]) {
                    setLessonTopicId(u.topics[0].id);
                  }
                }}
                className="w-full h-9 px-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0d5c4d]"
              >
                {currentUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Syllabus Topic */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Syllabus Topic
              </label>
              <select
                value={activeSelectedTopic?.id || ""}
                onChange={(e) => setLessonTopicId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0d5c4d]"
              >
                {currentTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lesson Title & Brief Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Lesson Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g. Lesson 4: Integration by Substitution"
                className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d]/20 focus:border-[#0d5c4d]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Short Description
              </label>
              <input
                type="text"
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                placeholder="e.g. Theory notes, worked proofs, and revision problem sheet"
                className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d]/20 focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          {/* Delivery Format Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26] mb-1.5">
              Select Lesson Delivery Format:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setLessonContentType("pdf")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  lessonContentType === "pdf"
                    ? "bg-[#ecf8f5] border-[#0d5c4d] shadow-2xs ring-1 ring-[#0d5c4d]"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <FileText className="h-4 w-4" />
                  </div>
                  {lessonContentType === "pdf" && (
                    <span className="h-2 w-2 rounded-full bg-[#0d5c4d]" />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">PDF Document</p>
                  <p className="text-[10px] text-slate-500">Worksheet / Notes</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLessonContentType("slides")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  lessonContentType === "slides"
                    ? "bg-[#ecf8f5] border-[#0d5c4d] shadow-2xs ring-1 ring-[#0d5c4d]"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Presentation className="h-4 w-4" />
                  </div>
                  {lessonContentType === "slides" && (
                    <span className="h-2 w-2 rounded-full bg-[#0d5c4d]" />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">Presentation Slides</p>
                  <p className="text-[10px] text-slate-500">PPTX / Slide Deck</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLessonContentType("video")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  lessonContentType === "video"
                    ? "bg-[#ecf8f5] border-[#0d5c4d] shadow-2xs ring-1 ring-[#0d5c4d]"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Video className="h-4 w-4" />
                  </div>
                  {lessonContentType === "video" && (
                    <span className="h-2 w-2 rounded-full bg-[#0d5c4d]" />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">Video Lecture</p>
                  <p className="text-[10px] text-slate-500">Recording / URL</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLessonContentType("rich_text")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  lessonContentType === "rich_text"
                    ? "bg-[#ecf8f5] border-[#0d5c4d] shadow-2xs ring-1 ring-[#0d5c4d]"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Layers className="h-4 w-4" />
                  </div>
                  {lessonContentType === "rich_text" && (
                    <span className="h-2 w-2 rounded-full bg-[#0d5c4d]" />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">Theory Notes</p>
                  <p className="text-[10px] text-slate-500">Rich Text &amp; Math</p>
                </div>
              </button>
            </div>
          </div>

          {/* Dynamic Content Panel by Format */}
          {lessonContentType === "pdf" && (
            <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e6ece8] space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26]">
                Upload Coursework PDF File:
              </label>

              {uploadedMainFile ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#0d2b26]">{uploadedMainFile.name}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        {uploadedMainFile.size} • Ready for classroom distribution
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedMainFile(null)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#c4e9e0] hover:border-[#0d5c4d] bg-white rounded-2xl cursor-pointer transition-colors group">
                  <UploadCloud className="h-8 w-8 text-[#0d5c4d] group-hover:scale-110 transition-transform mb-2" />
                  <p className="text-xs font-bold text-[#0d2b26]">
                    Click to browse or drag &amp; drop PDF document
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Supports .pdf textbooks, worksheets, and lecture summaries (up to 50MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleMainFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Optional Document Study Notes &amp; Highlights:
                </label>
                <textarea
                  rows={2}
                  value={lessonBody}
                  onChange={(e) => setLessonBody(e.target.value)}
                  placeholder="Outline key learning outcomes, pages to focus on, or homework exercise numbers..."
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>
          )}

          {lessonContentType === "slides" && (
            <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e6ece8] space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26]">
                  Upload Presentation Slide Deck:
                </label>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <span>Number of Slides:</span>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={lessonSlidesCount}
                    onChange={(e) => setLessonSlidesCount(Number(e.target.value))}
                    className="w-16 h-7 px-2 text-center rounded-lg border border-slate-300 text-xs font-bold focus:border-[#0d5c4d]"
                  />
                </div>
              </div>

              {uploadedMainFile ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      <Presentation className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#0d2b26]">{uploadedMainFile.name}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        {uploadedMainFile.size} • {lessonSlidesCount} Interactive Slides Loaded
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedMainFile(null)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#c4e9e0] hover:border-[#0d5c4d] bg-white rounded-2xl cursor-pointer transition-colors group">
                  <Presentation className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform mb-2" />
                  <p className="text-xs font-bold text-[#0d2b26]">
                    Click to browse or drag &amp; drop Presentation Slides
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Supports Microsoft PowerPoint (.pptx, .ppt) and PDF slide decks
                  </p>
                  <input
                    type="file"
                    accept=".pptx,.ppt,.pdf"
                    onChange={handleMainFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Slide Deck Summary &amp; Speaker Points:
                </label>
                <textarea
                  rows={2}
                  value={lessonBody}
                  onChange={(e) => setLessonBody(e.target.value)}
                  placeholder="Key slide takeaways, diagrams breakdown, and topics covered..."
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>
          )}

          {lessonContentType === "video" && (
            <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e6ece8] space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26]">
                  Video Lecture Source:
                </label>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <span>Class Duration:</span>
                  <input
                    type="text"
                    value={lessonVideoDuration}
                    onChange={(e) => setLessonVideoDuration(e.target.value)}
                    placeholder="e.g. 45 mins"
                    className="w-24 h-7 px-2 text-center rounded-lg border border-slate-300 text-xs font-bold focus:border-[#0d5c4d]"
                  />
                </div>
              </div>

              {/* Video URL Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Link2 className="h-3 w-3 text-[#0d5c4d]" />
                  Paste Online Video URL (YouTube, Vimeo, Google Drive, or Google Meet recording):
                </label>
                <input
                  type="url"
                  value={lessonVideoUrl}
                  onChange={(e) => setLessonVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://meet.google.com/xyz-record"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                — OR UPLOAD LOCAL VIDEO RECORDING —
              </div>

              {uploadedMainFile ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Film className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#0d2b26]">{uploadedMainFile.name}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        {uploadedMainFile.size} • Video uploaded &amp; ready to stream
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedMainFile(null)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#c4e9e0] hover:border-[#0d5c4d] bg-white rounded-2xl cursor-pointer transition-colors group">
                  <Video className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform mb-1" />
                  <p className="text-xs font-bold text-[#0d2b26]">
                    Click to browse or drop video file (.mp4, .webm, .mov)
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleMainFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Video Description &amp; Lecture Chapters:
                </label>
                <textarea
                  rows={2}
                  value={lessonBody}
                  onChange={(e) => setLessonBody(e.target.value)}
                  placeholder="Classroom agenda, timestamp chapters, and key problem proofs covered in the recording..."
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>
          )}

          {lessonContentType === "rich_text" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Lesson Content Body / Theory Notes
              </label>
              <textarea
                rows={5}
                value={lessonBody}
                onChange={(e) => setLessonBody(e.target.value)}
                placeholder="Enter comprehensive lecture text, key equations, derivations, and worked examples..."
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
          )}

          {/* Supplementary Attachments Bar */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0d2b26] flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5 text-[#0d5c4d]" />
                <span>Attach Supplementary Materials (Worksheets / Past Papers / PDFs):</span>
              </label>
              <label className="px-3 py-1 rounded-lg bg-[#ecf8f5] hover:bg-[#d6f2ea] text-[#0d5c4d] text-xs font-bold cursor-pointer transition-colors flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" />
                <span>Add File</span>
                <input
                  type="file"
                  onChange={handleSupplementaryFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {supplementaryFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {supplementaryFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#0d5c4d]" />
                    <span className="font-semibold text-slate-800">{file.name}</span>
                    <span className="text-[10px] text-slate-400">({file.size})</span>
                    <button
                      type="button"
                      onClick={() => removeSupplementaryFile(idx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateLessonModalOpen(false)}
              className="rounded-xl border-slate-300 font-bold text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs rounded-xl shadow-xs gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Add to Syllabus</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Announcement / Feed Update */}
      <Modal
        isOpen={isCreateAnnouncementModalOpen}
        onClose={() => setIsCreateAnnouncementModalOpen(false)}
        title="Publish Notice & Learning Feed Update"
        description="Post lecture notes, paper discussions, or batch notices directly to your students' Learning Feed."
      >
        <form onSubmit={handleCreateAnnouncementSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Notice Title
            </label>
            <input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="e.g. 2024 Provincial Model Paper Analysis & Vault Notes"
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Batch
              </label>
              <select
                value={annAudience}
                onChange={(e) => setAnnAudience(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="All Enrolled Students">All Enrolled Students</option>
                <option value="Target A/L Batch">Target A/L Batch</option>
                <option value="Revision Batch">Revision Batch</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={annPriority}
                onChange={(e) => setAnnPriority(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="normal">Standard Notice</option>
                <option value="high">High Priority / Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Message Content
            </label>
            <textarea
              rows={4}
              required
              value={annMessage}
              onChange={(e) => setAnnMessage(e.target.value)}
              placeholder="Enter lecture details, topics covered, download instructions, or live session reminders..."
              className="w-full p-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateAnnouncementModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold cursor-pointer">
              Publish to Learning Feed
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Announcement / Feed Update */}
      <Modal
        isOpen={isEditAnnouncementModalOpen}
        onClose={() => {
          setIsEditAnnouncementModalOpen(false);
          setEditingNotice(null);
        }}
        title="Edit Learning Feed Notice"
        description="Update the notice title, target batch, or content for your students."
      >
        <form onSubmit={handleEditAnnouncementSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Notice Title
            </label>
            <input
              type="text"
              required
              value={editAnnTitle}
              onChange={(e) => setEditAnnTitle(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Batch
              </label>
              <select
                value={editAnnAudience}
                onChange={(e) => setEditAnnAudience(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="All Enrolled Students">All Enrolled Students</option>
                <option value="Target A/L Batch">Target A/L Batch</option>
                <option value="Revision Batch">Revision Batch</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={editAnnPriority}
                onChange={(e) => setEditAnnPriority(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              >
                <option value="normal">Standard Notice</option>
                <option value="high">High Priority / Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Message Content
            </label>
            <textarea
              rows={4}
              required
              value={editAnnMessage}
              onChange={(e) => setEditAnnMessage(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditAnnouncementModalOpen(false);
                setEditingNotice(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold cursor-pointer">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Notice Details */}
      <Modal
        isOpen={!!viewingNotice}
        onClose={() => setViewingNotice(null)}
        title={viewingNotice?.title || "Notice Details"}
        description={`Target: ${viewingNotice?.targetAudience || "All Students"} • Published: ${viewingNotice?.publishedAt || "Recently"}`}
      >
        {viewingNotice && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#f8faf9] border border-[#e6ece8] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Author: <strong className="text-slate-800">{viewingNotice.authorName}</strong></span>
                <span className="font-mono">{viewingNotice.publishedAt}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line pt-2 border-t border-slate-200">
                {viewingNotice.message}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const noticeToEdit = viewingNotice;
                  setViewingNotice(null);
                  handleOpenEditNotice(noticeToEdit);
                }}
                className="text-xs font-bold cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Notice
              </Button>
              <Button
                size="sm"
                onClick={() => setViewingNotice(null)}
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* LIVE VIRTUAL CLASSROOM STUDIO MODAL */}
      <Modal
        isOpen={!!liveClassSession}
        onClose={() => setLiveClassSession(null)}
        title="Live Virtual Classroom Studio"
      >
        {liveClassSession && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#0d2b26] text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Live Broadcast Hub
                  </span>
                </div>
                <Badge className="bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px]">
                  1080p HD Stream
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-black text-white">{liveClassSession.course}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{liveClassSession.topic}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Time &amp; Period</span>
                  <span className="font-semibold text-white">{liveClassSession.period} ({liveClassSession.time})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Online Attendance</span>
                  <span className="font-semibold text-emerald-400">{liveClassSession.studentsCount} Students Online</span>
                </div>
              </div>
            </div>

            {/* Room Connection Details */}
            <div className="p-4 rounded-xl bg-[#f8faf9] border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Virtual Room Meeting Link</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{liveClassSession.meetingUrl || "https://meet.google.com/lms-math-13"}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyInvite(liveClassSession.meetingUrl)}
                  className="text-xs border-slate-300 text-slate-700 hover:bg-white font-bold cursor-pointer"
                >
                  {copiedInvite ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600 mr-1" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copy Link
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Room ID:</span>
                  <span className="font-mono font-bold text-slate-900">{liveClassSession.meetingId || "NWN-MATH-LIVE-992"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Host Passcode:</span>
                  <span className="font-mono font-bold text-slate-900">{liveClassSession.passcode || "774921"}</span>
                </div>
              </div>
            </div>

            {/* Live Actions */}
            <div className="space-y-2">
              <Button
                onClick={() => {
                  window.open(liveClassSession.meetingUrl || "https://meet.google.com/lms-math-13", "_blank");
                }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-sm h-11 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Video className="h-4 w-4" />
                Launch Virtual Meeting Room (Google Meet / Zoom) ↗
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (liveClassSession.courseId) {
                      setSelectedCourseId(liveClassSession.courseId);
                      setCurrentView("course-detail");
                    }
                    setLiveClassSession(null);
                  }}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                >
                  Open Syllabus &amp; Notes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLiveClassSession(null)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                >
                  Close Studio
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
