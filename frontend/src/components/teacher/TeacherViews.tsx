"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
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
  Copy,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  GraduationCap,
  CheckCheck,
  HelpCircle,
  RotateCcw,
  Lock,
  Globe,
  RefreshCw
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
import { Assignment, Course, Announcement, Quiz, QuizQuestion, LibraryResource } from "@/types/lms";
import { QuizBuilderModal } from "./QuizBuilderModal";
import { ResourceUploadModal } from "./ResourceUploadModal";

interface TeacherViewsProps {
  initialTab?: "home" | "grading" | "assignments" | "analytics";
  initialSubTab?: "assignments" | "quizzes" | "resources";
}

export function TeacherViews({ initialTab = "home", initialSubTab = "assignments" }: TeacherViewsProps) {
  const {
    courses,
    assignments,
    submissions,
    fetchAssignments,
    fetchSubmissions,
    gradeSubmission,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    createLesson,
    quizzes,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    fetchQuizzes,
    setSelectedQuizId,
    announcements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    currentView,
    setCurrentView,
    setSelectedCourseId,
    currentUser,
    t,
    activeTenant,
    libraryResources,
    createLibraryResource,
    updateLibraryResource,
    deleteLibraryResource,
    recordResourceView,
    recordResourceDownload,
    fetchLibraryResources
  } = useApp();

  // Filter courses strictly for this individual Tutor's workspace
  const teacherCourses: Course[] = useMemo(() => {
    const isGlobalAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";
    if (isGlobalAdmin) return courses;
    return courses.filter(
      (c) =>
        (c.teacherId && currentUser?.id && c.teacherId === currentUser.id) ||
        (c.teacherName && currentUser?.name && c.teacherName.toLowerCase() === currentUser.name.toLowerCase())
    );
  }, [courses, currentUser]);

  const [activeTab, setActiveTab] = useState<"home" | "grading" | "assignments" | "analytics">(
    currentView === "assignments" || currentView === "quizzes" || currentView === "resources" || currentView === "materials" || currentView === "library"
      ? "assignments"
      : currentView === "submissions"
      ? "grading"
      : initialTab
  );

  const [courseworkSubTab, setCourseworkSubTab] = useState<"assignments" | "quizzes" | "resources">(
    initialSubTab || (currentView === "quizzes" ? "quizzes" : currentView === "resources" || currentView === "materials" || currentView === "library" ? "resources" : "assignments")
  );
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState<Quiz | null>(null);
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  const [previewResult, setPreviewResult] = useState<{ score: number; totalMarks: number } | null>(null);
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  // Resources & Tutes State
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<LibraryResource | null>(null);
  const [inspectingResource, setInspectingResource] = useState<LibraryResource | null>(null);
  const [resourceTypeFilter, setResourceTypeFilter] = useState<"all" | "tute" | "past_paper" | "book">("all");
  const [resourceVisibilityFilter, setResourceVisibilityFilter] = useState<"all" | "public" | "subscribers_only">("all");
  const [resourceSearch, setResourceSearch] = useState<string>("");
  const [resourceViewerTab, setResourceViewerTab] = useState<"document" | "marking" | "toc">("document");
  const [resourceViewerPage, setResourceViewerPage] = useState<number>(1);
  const [resourceViewerZoom, setResourceViewerZoom] = useState<number>(100);
  const [isRefreshingResources, setIsRefreshingResources] = useState(false);
  const [isRefreshingQuizzes, setIsRefreshingQuizzes] = useState(false);

  // Sync tab if currentView changes externally from sidebar
  useEffect(() => {
    if (currentView === "assignments") {
      setActiveTab("assignments");
      setCourseworkSubTab("assignments");
    } else if (currentView === "quizzes") {
      setActiveTab("assignments");
      setCourseworkSubTab("quizzes");
    } else if (currentView === "resources" || currentView === "materials" || currentView === "library" || currentView === "tutes") {
      setActiveTab("assignments");
      setCourseworkSubTab("resources");
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
  const [searchStudent, setSearchStudent] = useState<string>("");
  const [isAnswerSheetModalOpen, setIsAnswerSheetModalOpen] = useState(false);
  const [docZoom, setDocZoom] = useState<number>(100);

  // Modals
  const [isCreateAsgModalOpen, setIsCreateAsgModalOpen] = useState(false);
  const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);
  const [isCreateAnnouncementModalOpen, setIsCreateAnnouncementModalOpen] = useState(false);

  // Live Teacher Dashboard State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

  const loadTeacherDashboard = async () => {
    try {
      setIsDashboardLoading(true);
      const res = await api.teachers.getDashboard();
      if (res && res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.warn("Could not load teacher dashboard from backend:", err);
    } finally {
      setIsDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "home") {
      loadTeacherDashboard();
    }
  }, [activeTab]);

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
  const [customTopic, setCustomTopic] = useState("");
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
  const [editCustomTopic, setEditCustomTopic] = useState("");
  const [editMaxMarks, setEditMaxMarks] = useState(100);
  const [editDueDate, setEditDueDate] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [editAsgPdfFile, setEditAsgPdfFile] = useState<{ name: string; size: string } | null>(null);

  // Dynamically extract syllabus units & topics for the chosen assignment course
  const currentAsgCourse = courses.find((c) => c.id === newCourseId) || courses[0];
  const asgAvailableTopics = useMemo(() => {
    if (!currentAsgCourse?.units || currentAsgCourse.units.length === 0) return [];
    return currentAsgCourse.units.flatMap((u) =>
      u.topics.map((t) => `${u.title} • ${t.title}`)
    );
  }, [currentAsgCourse]);

  const currentEditAsgCourse = courses.find((c) => c.id === editCourseId) || courses[0];
  const editAsgAvailableTopics = useMemo(() => {
    if (!currentEditAsgCourse?.units || currentEditAsgCourse.units.length === 0) return [];
    return currentEditAsgCourse.units.flatMap((u) =>
      u.topics.map((t) => `${u.title} • ${t.title}`)
    );
  }, [currentEditAsgCourse]);

  // Filter study materials & past papers uploaded by or belonging to this teacher
  const myTeacherResources: LibraryResource[] = useMemo(() => {
    return libraryResources.filter((r) => {
      const isAuthor =
        r.author === currentUser?.name ||
        r.teacherId === currentUser?.id ||
        Boolean(r.isOwner);
      const isSubjectMatch = teacherCourses.some(
        (c) =>
          c.subjectId === r.subject ||
          c.title.toLowerCase().includes(r.subject.toLowerCase()) ||
          r.subject.toLowerCase().includes(c.title.toLowerCase())
      );
      return isAuthor || isSubjectMatch || r.id.startsWith("lib_") || r.id.startsWith("tute_") || r.id.startsWith("pp_");
    });
  }, [libraryResources, currentUser, teacherCourses]);

  const filteredTeacherResources: LibraryResource[] = useMemo(() => {
    return myTeacherResources.filter((r) => {
      if (resourceTypeFilter !== "all" && r.resourceType !== resourceTypeFilter) return false;
      if (resourceVisibilityFilter !== "all" && r.visibility !== resourceVisibilityFilter) return false;
      if (resourceSearch.trim()) {
        const q = resourceSearch.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          (r.topic && r.topic.toLowerCase().includes(q)) ||
          r.subject.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.year && String(r.year).includes(q))
        );
      }
      return true;
    });
  }, [myTeacherResources, resourceTypeFilter, resourceVisibilityFilter, resourceSearch]);

  const handleDownloadResource = (resource: LibraryResource) => {
    recordResourceDownload(resource.id);
    const sampleContent = `========================================================\n` +
      `${resource.title.toUpperCase()}\n` +
      `Subject: ${resource.subject} | Type: ${resource.resourceType.toUpperCase()}\n` +
      `Author: ${resource.author} | Year: ${resource.year || '2025/2026'}\n` +
      `Access: ${resource.visibility === 'subscribers_only' ? 'Subscribers Only' : 'Public'}\n` +
      `========================================================\n\n` +
      `Description:\n${resource.description}\n\n` +
      (resource.markingSchemeNotes ? `Marking Scheme Notes:\n${resource.markingSchemeNotes}\n\n` : '') +
      `Table of Contents:\n` +
      (resource.tableOfContents?.map((t) => `- Page ${t.page}: ${t.title}`).join('\n') || '- Section 1: Theory Notes\n- Section 2: Model Questions') +
      `\n\n[Certified by LMS Educator Faculty]`;

    const blob = new Blob([sampleContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // New lesson form state with full multi-format upload support
  const [lessonCourseId, setLessonCourseId] = useState(courses[0]?.id || "");
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

  const QUICK_FEEDBACK_PILLS = [
    "🌟 Excellent derivation with clear step-by-step mathematical working!",
    "👍 Good attempt; please double-check calculations in question 2.",
    "🔍 Formula applied correctly, but final units or graph notation are missing.",
    "⚠️ Partially correct. Please revisit syllabus unit theory before the exam.",
    "📝 Incomplete submission. Please resubmit the remaining questions.",
  ];

  const getALGrade = (score: number, max: number) => {
    const pct = max > 0 ? (score / max) * 100 : 0;
    if (pct >= 75) return { grade: "A", label: "Distinction", color: "text-emerald-700 bg-emerald-50 border-emerald-300" };
    if (pct >= 65) return { grade: "B", label: "Very Good", color: "text-blue-700 bg-blue-50 border-blue-300" };
    if (pct >= 55) return { grade: "C", label: "Credit", color: "text-amber-700 bg-amber-50 border-amber-300" };
    if (pct >= 35) return { grade: "S", label: "Ordinary Pass", color: "text-orange-700 bg-orange-50 border-orange-300" };
    return { grade: "F", label: "Referral / Weak", color: "text-rose-700 bg-rose-50 border-rose-300" };
  };

  // Filtered submissions for Grading Desk
  const filteredSubmissions = submissions.filter((s) => {
    if (assignmentFilter !== "all" && s.assignmentId !== assignmentFilter) return false;
    if (searchStudent.trim() && !s.studentName.toLowerCase().includes(searchStudent.toLowerCase())) return false;
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
      setMarksInput(activeSubmission.marksObtained ?? Math.round(activeSubmission.maxMarks * 0.85));
      setFeedbackInput(activeSubmission.teacherFeedback || "");
    }
  }, [activeSubmission?.id]);

  const handleSaveGrade = (release: boolean) => {
    if (!activeSubmission) return;
    gradeSubmission(activeSubmission.id, Number(marksInput), feedbackInput, release);
  };

  const handleGradeAndNext = (release: boolean) => {
    if (!activeSubmission) return;
    gradeSubmission(activeSubmission.id, Number(marksInput), feedbackInput, release);
    const currentIndex = filteredSubmissions.findIndex((s) => s.id === activeSubmission.id);
    if (currentIndex >= 0 && currentIndex < filteredSubmissions.length - 1) {
      setSelectedSubId(filteredSubmissions[currentIndex + 1].id);
    }
  };

  const handleBatchRelease = () => {
    const draftSubs = submissions.filter((s) => s.status === "marked");
    if (draftSubs.length === 0) return;
    draftSubs.forEach((sub) => {
      gradeSubmission(
        sub.id,
        sub.marksObtained ?? Math.round(sub.maxMarks * 0.75),
        sub.teacherFeedback || "Evaluated by tutor.",
        true
      );
    });
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
    const targetCourse = courses.find((c) => c.id === newCourseId) || courses[0];
    const finalTopic = newTopic === "__custom__" ? customTopic || "General Topic" : newTopic;
    createAssignment({
      courseId: targetCourse?.id || courses[0]?.id,
      subjectName: targetCourse?.title || "Combined Mathematics",
      title: newTitle,
      topicName: finalTopic,
      dueDate: newDueDate,
      maxMarks: Number(newMaxMarks),
      instructions: newInstructions,
      attachmentName: asgPdfFile?.name
    });
    setIsCreateAsgModalOpen(false);
    setNewTitle("");
    setNewInstructions("");
    setCustomTopic("");
    setAsgPdfFile(null);
  };

  const handleUpdateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsgId || !editTitle) return;
    const targetCourse = courses.find((c) => c.id === editCourseId) || courses[0];
    const finalTopic = editTopic === "__custom__" ? editCustomTopic || "General Topic" : editTopic;
    updateAssignment(editingAsgId, {
      courseId: targetCourse?.id || editCourseId,
      subjectName: targetCourse?.title,
      title: editTitle,
      topicName: finalTopic,
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
      authorRole: "Tutor"
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

  const todaySchedule: ScheduleItem[] = [];

  // Sri Lanka G.C.E A/L Grade Distribution (Calculated from real submissions)
  const gradeDistribution = useMemo(() => {
    let a = 0, b = 0, c = 0, s = 0, w = 0;
    submissions.forEach((sub) => {
      if (sub.marksObtained != null) {
        const score = (Number(sub.marksObtained) / (Number(sub.maxMarks) || 100)) * 100;
        if (!isNaN(score)) {
          if (score >= 75) a++;
          else if (score >= 65) b++;
          else if (score >= 55) c++;
          else if (score >= 40) s++;
          else w++;
        }
      }
    });
    return [
      { grade: "A (75-100%)", count: a, fill: "#0d5c4d" },
      { grade: "B (65-74%)", count: b, fill: "#158066" },
      { grade: "C (55-64%)", count: c, fill: "#f3b738" },
      { grade: "S (40-54%)", count: s, fill: "#e59f20" },
      { grade: "W (<40%)", count: w, fill: "#e11d48" }
    ];
  }, [submissions]);

  const studentRoster = useMemo(() => {
    const studentMap = new Map<string, { name: string; index: string; class: string; submitted: number; totalScore: number; gradedCount: number }>();
    submissions.forEach((sub) => {
      const studentId = sub.studentId || sub.studentName || "student";
      const existing = studentMap.get(studentId) || {
        name: sub.studentName || "Student",
        index: sub.studentId?.slice(-8).toUpperCase() || "STU-001",
        class: sub.assignmentTitle || "Enrolled Course",
        submitted: 0,
        totalScore: 0,
        gradedCount: 0,
      };
      existing.submitted += 1;
      if (sub.marksObtained != null) {
        const score = (Number(sub.marksObtained) / (Number(sub.maxMarks) || 100)) * 100;
        if (!isNaN(score)) {
          existing.totalScore += score;
          existing.gradedCount += 1;
        }
      }
      studentMap.set(studentId, existing);
    });

    return Array.from(studentMap.values()).map((st) => {
      const avg = st.gradedCount > 0 ? Math.round(st.totalScore / st.gradedCount) : null;
      let status = "Enrolled";
      if (avg !== null) {
        if (avg >= 75) status = "Distinction";
        else if (avg >= 65) status = "Merit";
        else if (avg >= 55) status = "Credit";
        else status = "Pass";
      }
      return {
        name: st.name,
        index: st.index,
        class: st.class,
        submitted: st.submitted,
        avg: avg !== null ? `${avg}%` : "Pending",
        status,
      };
    });
  }, [submissions]);

  const benchmarkStats = useMemo(() => {
    if (submissions.length === 0) {
      return { classAvg: "N/A", onTimeRate: "N/A", needingSupport: 0 };
    }
    let totalScore = 0;
    let gradedCount = 0;
    let onTimeCount = 0;
    let needingSupport = 0;

    submissions.forEach((s) => {
      if (s.marksObtained != null) {
        const score = (Number(s.marksObtained) / (Number(s.maxMarks) || 100)) * 100;
        if (!isNaN(score)) {
          totalScore += score;
          gradedCount += 1;
          if (score < 50) needingSupport += 1;
        }
      }
      if (s.status !== "not_submitted") {
        onTimeCount += 1;
      }
    });

    const classAvg = gradedCount > 0 ? `${(totalScore / gradedCount).toFixed(1)}%` : "N/A";
    const onTimeRate = `${((onTimeCount / submissions.length) * 100).toFixed(1)}%`;

    return { classAvg, onTimeRate, needingSupport };
  }, [submissions]);

  // Executive Overview KPIs (Powered by live cloud database)
  const totalEnrolledStudents = dashboardData?.kpis?.totalEnrolledStudents ?? 0;
  const activeBatchesCount = dashboardData?.kpis?.activeBatchesCount ?? teacherCourses.length;
  const pendingReviewsCount = dashboardData?.kpis?.pendingReviewsCount ?? submissions.filter((s) => s.status === "submitted").length;

  const currentSchedule: ScheduleItem[] = dashboardData?.todaySchedule || [];

  const liveSessionsTodayCount = dashboardData?.kpis?.liveSessionsTodayCount ?? currentSchedule.length;
  const liveNowSession = currentSchedule.find((s) => s.status === "in_progress");

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
                : currentView === "assignments" || currentView === "quizzes"
                ? (courseworkSubTab === "quizzes" ? "MCQ & Exam Arena" : "Coursework Management")
                : "Faculty Management System"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0d2b26] mt-1">
            {currentView === "submissions"
              ? "Submissions & Grading Desk"
              : currentView === "assignments" || currentView === "quizzes"
              ? (courseworkSubTab === "quizzes" ? "Interactive MCQ Quizzes" : "Course Assignments")
              : "Teaching Studio · Home"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentView === "submissions"
              ? "Review student submissions, assign marks based on curriculum rubrics, and release results."
              : currentView === "assignments" || currentView === "quizzes"
              ? (courseworkSubTab === "quizzes" ? "Build, test, and publish interactive multiple choice diagnostic quizzes." : "Publish and manage coursework assignments, problem sets, and submission deadlines.")
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
                <span className="text-xs text-white/80 font-medium">
                  Welcome back, {currentUser?.name || "Mr. Samantha Perera"}
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">Teaching &amp; Assessment Control Center</h2>
              <p className="text-xs text-white/80 mt-0.5">
                Manage today&apos;s lectures, evaluate incoming submissions, and update your batch syllabi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                onClick={() => loadTeacherDashboard()}
                disabled={isDashboardLoading}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs cursor-pointer backdrop-blur-xs flex items-center gap-1.5"
                title="Refresh Studio Dashboard from Cloud Database"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isDashboardLoading ? "animate-spin" : ""}`} />
                {isDashboardLoading ? "Refreshing..." : "Refresh"}
              </Button>
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

          {/* Top 4 Executive KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Enrolled Students */}
            <Card 
              onClick={() => setCurrentView("connect")}
              className="border-[#e6ece8] bg-white hover:border-[#a2dfd2] hover:bg-emerald-50/20 transition-all duration-200 shadow-2xs hover:shadow-xs group cursor-pointer"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Total Enrolled Students
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#0d2b26]">
                      {totalEnrolledStudents}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
                      +12 this term
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#0d5c4d] font-semibold flex items-center gap-1">
                    View Subscribers Roster <ChevronRight className="h-3 w-3" />
                  </p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Active Batches */}
            <Card 
              onClick={() => {
                if (teacherCourses[0]?.id) {
                  setSelectedCourseId(teacherCourses[0].id);
                  setCurrentView("course-detail");
                }
              }}
              className="border-[#e6ece8] bg-white hover:border-[#a2dfd2] transition-all duration-200 shadow-2xs hover:shadow-xs group cursor-pointer"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Active Batches
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#0d2b26]">
                      {activeBatchesCount}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-semibold text-teal-700 bg-teal-50 border-teal-200">
                      A/L Curricula
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    Avg. 68% Syllabus covered <ChevronRight className="h-3 w-3 text-slate-400" />
                  </p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Pending Reviews */}
            <Card 
              onClick={() => {
                setSubFilter("pending");
                setActiveTab("grading");
              }}
              className="border-[#e6ece8] bg-white hover:border-amber-300 hover:bg-amber-50/20 transition-all duration-200 shadow-2xs hover:shadow-xs group cursor-pointer"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Pending Reviews
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-900">
                      {pendingReviewsCount}
                    </span>
                    <Badge variant="warning" className="text-[10px] font-bold">
                      Needs Marking
                    </Badge>
                  </div>
                  <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                    Open Grading Desk <ChevronRight className="h-3 w-3" />
                  </p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-[#fef7e6] text-[#b47a16] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Today's Live Sessions */}
            <Card 
              onClick={() => {
                if (liveNowSession) {
                  setLiveClassSession(liveNowSession);
                } else if (currentSchedule[0]) {
                  setLiveClassSession(currentSchedule[0]);
                }
              }}
              className="border-[#e6ece8] bg-white hover:border-rose-300 hover:bg-rose-50/20 transition-all duration-200 shadow-2xs hover:shadow-xs group cursor-pointer"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Today&apos;s Live Sessions
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-rose-950">
                      {liveSessionsTodayCount}
                    </span>
                    {liveNowSession ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" /> Live Now
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-slate-600 border-slate-200">
                        Scheduled
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                    {liveNowSession ? "Join Live Stream" : "View Timetable"} <ChevronRight className="h-3 w-3" />
                  </p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Video className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
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
                    {liveSessionsTodayCount} Sessions Today
                  </Badge>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {currentSchedule.map((item, idx) => (
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
                  {currentSchedule.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No live sessions or lectures scheduled for today.
                    </div>
                  )}
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

              {/* 4. Learning Feed Broadcasts & Notices (Tutor Feed Management) */}
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



              {/* Tutor 1-on-1 Consultation Hours Card */}
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
      {activeTab === "grading" && (() => {
        const totalSubs = submissions.length;
        const pendingCount = submissions.filter((s) => s.status === "submitted").length;
        const draftCount = submissions.filter((s) => s.status === "marked").length;
        const releasedCount = submissions.filter((s) => s.status === "result_released").length;
        const evaluatedSubs = submissions.filter((s) => s.marksObtained !== undefined);
        const avgScore = evaluatedSubs.length > 0
          ? Math.round(evaluatedSubs.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0) / evaluatedSubs.length)
          : 0;

        return (
          <div className="space-y-5">
            {/* Header & Batch Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
              <div>
                <h2 className="text-xl font-black text-[#0d2b26] flex items-center gap-2.5">
                  <ClipboardCheck className="h-6 w-6 text-[#0d5c4d]" />
                  Submissions Review &amp; Grading Desk
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluate student answer scripts, assign marks against G.C.E A/L benchmarks, and release official results.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await fetchSubmissions?.();
                    await fetchAssignments?.();
                  }}
                  className="h-9 px-3 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:text-[#0d5c4d] hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Refresh Submissions from Cloud Database"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-[#0d5c4d]" />
                  Refresh
                </Button>

                {draftCount > 0 && (
                  <Button
                    onClick={handleBatchRelease}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all animate-in fade-in"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Release All Graded Drafts ({draftCount})
                  </Button>
                )}
              </div>
            </div>

            {/* Quick KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-white border border-[#e6ece8] shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Received</span>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-2xl font-black text-slate-900">{totalSubs}</span>
                  <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200">Submissions</Badge>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">Pending Evaluation</span>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-2xl font-black text-amber-900">{pendingCount}</span>
                  <Badge variant="warning" className="text-[10px] bg-[#f3b738] text-slate-950 font-black">Needs Review</Badge>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">Draft Saved</span>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-2xl font-black text-blue-900">{draftCount}</span>
                  <Badge variant="default" className="text-[10px] bg-blue-600 text-white">Unreleased</Badge>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">Class Average</span>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-2xl font-black text-emerald-900">{avgScore}%</span>
                  <Badge variant="success" className="text-[10px] bg-[#0d5c4d] text-white font-bold">A/L Cohort</Badge>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-3 bg-white border border-[#e6ece8] rounded-2xl shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Assignment Filter */}
                <select
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                >
                  <option value="all">📚 All Course Assignments ({assignments.length})</option>
                  {assignments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.subjectName || "A/L"})
                    </option>
                  ))}
                </select>

                {/* Status Tabs */}
                <div className="flex items-center bg-[#f0f4f2] p-1 rounded-xl">
                  <button
                    onClick={() => setSubFilter("pending")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      subFilter === "pending"
                        ? "bg-[#f3b738] text-slate-950 shadow-xs"
                        : "text-slate-600 hover:text-[#0d5c4d]"
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    onClick={() => setSubFilter("marked")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      subFilter === "marked"
                        ? "bg-slate-800 text-white shadow-xs"
                        : "text-slate-600 hover:text-[#0d5c4d]"
                    }`}
                  >
                    Draft ({draftCount})
                  </button>
                  <button
                    onClick={() => setSubFilter("released")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      subFilter === "released"
                        ? "bg-[#0d5c4d] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#0d5c4d]"
                    }`}
                  >
                    Released ({releasedCount})
                  </button>
                  <button
                    onClick={() => setSubFilter("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      subFilter === "all"
                        ? "bg-[#0d5c4d] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#0d5c4d]"
                    }`}
                  >
                    All ({totalSubs})
                  </button>
                </div>
              </div>

              {/* Search Student Input */}
              <div className="relative min-w-[240px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter student name..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full h-9 pl-9 pr-8 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d]"
                />
                {searchStudent && (
                  <button
                    onClick={() => setSearchStudent("")}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Main Submissions Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Submissions Queue (5 cols) */}
              <div className="lg:col-span-5 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Submissions Queue ({filteredSubmissions.length})
                  </p>
                  <span className="text-[11px] text-slate-400">Click to evaluate</span>
                </div>

                {filteredSubmissions.length === 0 ? (
                  <div className="p-10 text-center bg-white border border-[#e6ece8] rounded-2xl text-xs text-slate-500">
                    <ClipboardCheck className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    No submissions matching this filter or search query.
                  </div>
                ) : (
                  filteredSubmissions.map((sub) => {
                    const isSelected = activeSubmission?.id === sub.id;
                    const gradeInfo = sub.marksObtained !== undefined ? getALGrade(sub.marksObtained, sub.maxMarks) : null;
                    const initials = sub.studentName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubId(sub.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-white border-[#0d5c4d] shadow-md ring-2 ring-[#0d5c4d]/15 -translate-y-0.5"
                            : "bg-white border-[#e6ece8] hover:border-[#c4e9e0] hover:bg-[#fafcfb] shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected ? "bg-[#0d5c4d] text-white" : "bg-[#ecf8f5] text-[#0d5c4d]"
                          }`}>
                            {initials}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-black text-slate-900 truncate">{sub.studentName}</span>
                              <Badge
                                variant={
                                  sub.status === "result_released"
                                    ? "success"
                                    : sub.status === "marked"
                                    ? "default"
                                    : "warning"
                                }
                                className="text-[10px] shrink-0"
                              >
                                {sub.status === "result_released"
                                  ? "Released"
                                  : sub.status === "marked"
                                  ? "Draft Saved"
                                  : "Pending Review"}
                              </Badge>
                            </div>

                            <p className="text-[11px] text-[#0d5c4d] font-bold truncate mt-0.5">
                              {sub.assignmentTitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {sub.submittedAt}
                          </span>

                          {sub.marksObtained !== undefined && gradeInfo ? (
                            <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] border ${gradeInfo.color}`}>
                              {sub.marksObtained}/{sub.maxMarks} • {gradeInfo.grade} ({gradeInfo.label})
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold text-[10px] flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Awaiting Marks
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Grading Desk & Feedback Composer (7 cols) */}
              <div className="lg:col-span-7">
                {activeSubmission ? (
                  <Card className="border-[#e6ece8] bg-white shadow-2xs p-6 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e6ece8]">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#0d5c4d] to-[#1a7f6c] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                          {activeSubmission.studentName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
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
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            {activeSubmission.assignmentTitle} &bull; Submitted: {activeSubmission.submittedAt}
                          </p>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-xs font-mono font-bold bg-[#f8faf9] border-slate-300 self-start sm:self-auto">
                        Max Marks: {activeSubmission.maxMarks}
                      </Badge>
                    </div>

                    {/* Student's answer text and file */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-[#0d5c4d]" />
                          Student's Submitted Work &amp; Solution:
                        </p>
                        {activeSubmission.textContent && (
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(activeSubmission.textContent || "");
                            }}
                            className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                        )}
                      </div>

                      <div className="p-4 rounded-xl bg-[#f8faf9] border border-[#e6ece8] text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                        {activeSubmission.textContent || "No written response text was entered. Please inspect attached answer sheet file below."}
                      </div>

                      {activeSubmission.fileAttachmentName && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] gap-2">
                          <div className="flex items-center gap-2.5 text-[#0d5c4d] font-bold text-xs min-w-0">
                            <div className="p-2 rounded-lg bg-white border border-[#c4e9e0] shadow-2xs shrink-0">
                              <FileCheck className="h-4 w-4 text-[#0d5c4d]" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-slate-900 font-black">{activeSubmission.fileAttachmentName}</p>
                              <span className="text-[10px] text-slate-500 font-normal">Candidate Solution Answer Sheet &bull; PDF Document</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDocZoom(100);
                                setIsAnswerSheetModalOpen(true);
                              }}
                              className="h-8 text-xs font-bold text-[#0d5c4d] border-[#c4e9e0] hover:bg-white bg-white/70 cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" /> Inspect Answer Sheet
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Teacher Marks Entry, Sri Lankan A/L Grade & Quick Feedback */}
                    <div className="space-y-4 pt-4 border-t border-[#e6ece8]">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <GraduationCap className="h-4 w-4 text-[#0d5c4d]" />
                            Marks &amp; A/L Grade Classification:
                          </label>

                          {/* Calculated Grade Badge */}
                          {(() => {
                            const currentGrade = getALGrade(Number(marksInput), activeSubmission.maxMarks);
                            return (
                              <span className={`px-2.5 py-0.5 rounded-lg font-bold text-xs border ${currentGrade.color}`}>
                                Grade: {currentGrade.grade} ({currentGrade.label})
                              </span>
                            );
                          })()}
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          {/* Number Input */}
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={activeSubmission.maxMarks}
                              value={marksInput}
                              onChange={(e) => setMarksInput(Math.min(activeSubmission.maxMarks, Math.max(0, Number(e.target.value))))}
                              className="w-24 h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-slate-900 font-mono font-black text-xl focus:outline-none focus:border-[#0d5c4d]"
                            />
                            <span className="text-xs font-bold text-slate-500">
                              / {activeSubmission.maxMarks}
                            </span>
                          </div>

                          {/* Interactive Range Slider */}
                          <div className="flex-1 flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={activeSubmission.maxMarks}
                              value={marksInput}
                              onChange={(e) => setMarksInput(Number(e.target.value))}
                              className="flex-1 accent-[#0d5c4d] h-2 bg-slate-200 rounded-lg cursor-pointer"
                            />
                            <span className="font-mono font-bold text-xs text-[#0d5c4d] w-12 text-right">
                              {Math.round((Number(marksInput) / activeSubmission.maxMarks) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Feedback Presets */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Quick Feedback Presets (1-Click Insert):
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_FEEDBACK_PILLS.map((pill, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFeedbackInput((prev) =>
                                  prev ? `${prev} ${pill}` : pill
                                );
                              }}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#f0f4f2] text-slate-700 hover:bg-[#ecf8f5] hover:text-[#0d5c4d] border border-slate-200 transition-colors text-left cursor-pointer"
                            >
                              {pill}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Feedback Textarea */}
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

                      {/* Actions: Save Draft vs Release Results vs Save & Next */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <Button
                          variant="outline"
                          onClick={() => handleSaveGrade(false)}
                          className="text-xs font-bold border-slate-300 hover:bg-slate-50 cursor-pointer"
                        >
                          Save Marks as Draft
                        </Button>

                        <div className="flex items-center gap-2.5">
                          <Button
                            variant="outline"
                            onClick={() => handleGradeAndNext(false)}
                            className="text-xs font-bold border-[#c4e9e0] text-[#0d5c4d] hover:bg-[#ecf8f5] cursor-pointer"
                          >
                            Save &amp; Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>

                          <Button
                            onClick={() => handleSaveGrade(true)}
                            className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-2 text-xs shadow-sm cursor-pointer"
                          >
                            <Send className="h-4 w-4" />
                            {t.academic.releaseResults}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="p-12 text-center bg-white border border-[#e6ece8] rounded-2xl text-xs text-slate-500">
                    <ClipboardCheck className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    Select a student submission from the queue on the left to grade.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 2: Course Assignments & Quizzes Manager */}
      {activeTab === "assignments" && (
        <div className="space-y-5">
          {/* SubTab Segmented Controller: Assignments vs Quizzes vs Resources */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-[#f8faf9] border border-[#e6ece8] rounded-2xl">
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setCourseworkSubTab("assignments")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  courseworkSubTab === "assignments"
                    ? "bg-[#0d5c4d] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Written Assignments ({assignments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setCourseworkSubTab("quizzes")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  courseworkSubTab === "quizzes"
                    ? "bg-[#0d5c4d] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Online Quizzes & MCQs ({quizzes.length})</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  courseworkSubTab === "quizzes" ? "bg-white/20 text-white" : "bg-[#ecf8f5] text-[#0d5c4d]"
                }`}>
                  Interactive
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCourseworkSubTab("resources")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  courseworkSubTab === "resources"
                    ? "bg-[#0d5c4d] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Tutes & Study Materials ({myTeacherResources.length})</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  courseworkSubTab === "resources" ? "bg-white/20 text-white" : "bg-[#ecf8f5] text-[#0d5c4d]"
                }`}>
                  Hub
                </span>
              </button>
            </div>

            {courseworkSubTab === "assignments" ? (
              <Button
                onClick={() => setIsCreateAsgModalOpen(true)}
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-1.5 text-xs shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Create Assignment
              </Button>
            ) : courseworkSubTab === "quizzes" ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    setIsRefreshingQuizzes(true);
                    await fetchQuizzes();
                    setIsRefreshingQuizzes(false);
                  }}
                  disabled={isRefreshingQuizzes}
                  className="border-[#0d5c4d]/30 text-[#0d5c4d] hover:bg-[#0d5c4d]/10 font-bold gap-1.5 text-xs shadow-2xs h-8 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingQuizzes ? "animate-spin" : ""}`} />
                  {isRefreshingQuizzes ? "Refreshing..." : "Refresh"}
                </Button>
                <Button
                  onClick={() => {
                    setQuizToEdit(null);
                    setIsQuizModalOpen(true);
                  }}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-1.5 text-xs shadow-xs cursor-pointer h-8"
                >
                  <Plus className="h-3.5 w-3.5" /> Create MCQ Quiz
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    setIsRefreshingResources(true);
                    await fetchLibraryResources();
                    setIsRefreshingResources(false);
                  }}
                  disabled={isRefreshingResources}
                  className="border-[#0d5c4d]/30 text-[#0d5c4d] hover:bg-[#0d5c4d]/10 font-bold gap-1.5 text-xs shadow-2xs h-8 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingResources ? "animate-spin" : ""}`} />
                  {isRefreshingResources ? "Refreshing..." : "Refresh"}
                </Button>
                <Button
                  onClick={() => {
                    setResourceToEdit(null);
                    setIsResourceModalOpen(true);
                  }}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-1.5 text-xs shadow-xs cursor-pointer h-8"
                >
                  <UploadCloud className="h-3.5 w-3.5" /> Upload Material
                </Button>
              </div>
            )}
          </div>

          {/* SUB-VIEW 1: Written Assignments */}
          {courseworkSubTab === "assignments" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-[#0d2b26] flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#0d5c4d]" />
                    Course Assignments Manager
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track homework tasks, deadline compliance, and launch grading sessions.
                  </p>
                </div>
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
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-[#0d5c4d] bg-[#ecf8f5] border border-[#c4e9e0] px-2.5 py-0.5 rounded-full">
                              📚 {asg.subjectName || "Combined Mathematics"}
                            </span>
                            <Badge variant="outline" className="text-[10px] font-bold text-slate-700 bg-slate-50 border-slate-200">
                              {asg.topicName}
                            </Badge>
                          </div>
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

          {/* SUB-VIEW 2: Online Quizzes & MCQ Arena */}
          {courseworkSubTab === "quizzes" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-[#0d2b26] flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[#0d5c4d]" />
                    Online Quizzes & Timed Examination Arena
                  </h2>
                  <p className="text-xs text-slate-500">
                    Construct automated multiple-choice tests, inspect answer keys, and simulate candidate tests.
                  </p>
                </div>
              </div>

              {quizzes.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white space-y-3">
                  <div className="p-3 bg-[#ecf8f5] text-[#0d5c4d] rounded-full w-fit mx-auto">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No Online Quizzes Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Create your first interactive MCQ quiz with automated grading and instant rationale.
                  </p>
                  <Button
                    onClick={() => {
                      setQuizToEdit(null);
                      setIsQuizModalOpen(true);
                    }}
                    className="bg-[#0d5c4d] text-white font-bold text-xs"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Create First Quiz
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizzes.map((quiz) => {
                    const isExpanded = expandedQuizId === quiz.id;

                    return (
                      <Card key={quiz.id} className="border-[#e6ece8] bg-white shadow-2xs hover:shadow-xs transition-shadow">
                        <CardHeader className="p-5 pb-3">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-xs font-black text-[#0d5c4d] bg-[#ecf8f5] border border-[#c4e9e0] px-2.5 py-0.5 rounded-full">
                              📚 {quiz.subjectName || "Combined Mathematics"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant={quiz.status === "published" ? "success" : "secondary"}
                                className="text-[10px] uppercase font-bold"
                              >
                                {quiz.status === "published" ? "🟢 Published" : "🟡 Draft"}
                              </Badge>
                              <Badge variant="outline" className="text-xs font-mono font-bold">
                                {quiz.totalMarks} Marks
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="text-base font-black text-[#0d2b26] mt-2">
                            {quiz.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 pt-0 space-y-4">
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {quiz.instructions}
                          </p>

                          {/* Metric stats pills */}
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8]">
                              <span className="text-slate-400 block text-[10px] font-bold uppercase">Time Limit</span>
                              <span className="font-bold text-[#b47a16] flex items-center justify-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" /> {quiz.durationMinutes}m
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8]">
                              <span className="text-slate-400 block text-[10px] font-bold uppercase">Questions</span>
                              <span className="font-bold text-slate-800 mt-0.5 block">
                                {quiz.totalQuestions || quiz.questions.length} MCQs
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8]">
                              <span className="text-slate-400 block text-[10px] font-bold uppercase">Due Date</span>
                              <span className="font-bold text-slate-700 text-[11px] mt-0.5 block truncate">
                                {quiz.dueDate ? quiz.dueDate.split(" ")[0] : "No limit"}
                              </span>
                            </div>
                          </div>

                          {/* Cohort attempts & average banner */}
                          {quiz.attempts && quiz.attempts.length > 0 && (
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] text-xs">
                              <span className="text-[#0d5c4d] font-black flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                <span>{quiz.attempts.length} Candidates Submitted</span>
                              </span>
                              <span className="font-mono font-black text-slate-800 text-xs">
                                Cohort Avg: {Math.round(quiz.attempts.reduce((acc, a) => acc + a.percentage, 0) / quiz.attempts.length)}%
                              </span>
                            </div>
                          )}

                          {/* Question list preview toggle */}
                          <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                            <button
                              type="button"
                              onClick={() => setExpandedQuizId(isExpanded ? null : quiz.id)}
                              className="w-full px-3 py-2 text-xs font-bold text-slate-700 flex items-center justify-between hover:bg-slate-100/70 cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <HelpCircle className="h-3.5 w-3.5 text-[#0d5c4d]" />
                                Inspect Questions &amp; Answer Keys ({quiz.questions.length})
                              </span>
                              <span className="text-slate-400 text-[10px]">
                                {isExpanded ? "▲ Hide" : "▼ Preview"}
                              </span>
                            </button>

                            {isExpanded && (
                              <div className="p-3 pt-0 space-y-2 border-t border-slate-200/60 max-h-60 overflow-y-auto">
                                {quiz.questions.map((q, qIdx) => (
                                  <div
                                    key={q.id || qIdx}
                                    className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-[#0d5c4d]">
                                        Q{qIdx + 1}. {q.type.toUpperCase()} ({q.marks} Marks)
                                      </span>
                                      <span className="text-[10px] font-mono text-emerald-700 font-bold">
                                        Answer:{" "}
                                        {Array.isArray(q.correctAnswer)
                                          ? q.correctAnswer.map((idx) => String.fromCharCode(65 + Number(idx))).join(", ")
                                          : typeof q.correctAnswer === "number"
                                          ? `Choice ${String.fromCharCode(65 + q.correctAnswer)}`
                                          : String(q.correctAnswer)}
                                      </span>
                                    </div>
                                    <p className="font-medium text-slate-800 line-clamp-2">
                                      {q.questionText}
                                    </p>
                                    {q.options && q.options.length > 0 && (
                                      <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                                        {q.options.map((opt, oIdx) => {
                                          const isOptionCorrect = Array.isArray(q.correctAnswer)
                                            ? q.correctAnswer.map(Number).includes(oIdx)
                                            : oIdx === Number(q.correctAnswer);

                                          return (
                                            <div
                                              key={oIdx}
                                              className={`px-2 py-0.5 rounded text-[10px] truncate ${
                                                isOptionCorrect
                                                  ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                                                  : "text-slate-500"
                                              }`}
                                            >
                                              {String.fromCharCode(65 + oIdx)}. {opt}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {q.explanation && (
                                      <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-100">
                                        Rationale: {q.explanation}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action Footer */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setQuizToEdit(quiz);
                                  setIsQuizModalOpen(true);
                                }}
                                className="border-[#c4e9e0] text-[#0d5c4d] hover:bg-[#ecf8f5] text-xs font-bold gap-1 cursor-pointer h-8"
                                title="Edit Quiz Questions"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </Button>

                              <button
                                onClick={() => {
                                  if (confirm(`Delete quiz "${quiz.title}"?`)) {
                                    deleteQuiz(quiz.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Quiz"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <Button
                              size="sm"
                              onClick={() => {
                                setPreviewQuiz(quiz);
                                setPreviewAnswers({});
                                setPreviewResult(null);
                              }}
                              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs gap-1.5 shadow-2xs h-8 cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" /> Test as Student
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 3: Tutes & Study Materials Hub */}
          {courseworkSubTab === "resources" && (
            <div className="space-y-5">
              {/* Hub Intro & Header */}
              <div>
                <h2 className="text-base font-extrabold text-[#0d2b26] flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#0d5c4d]" />
                  Resource &amp; Tute Upload Hub
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish class tutes, past papers, model exams, and revision guides. Set access controls (Public or Subscribers Only).
                </p>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-[#e6ece8] shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Materials</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-black text-[#0d2b26]">{myTeacherResources.length}</span>
                    <Badge variant="outline" className="text-[10px] font-bold text-[#0d5c4d] bg-[#ecf8f5] border-[#c4e9e0]">
                      Active
                    </Badge>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#e6ece8] shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Class Tutes</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-black text-[#0d5c4d]">
                      {myTeacherResources.filter((r) => r.resourceType === "tute").length}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Handouts</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#e6ece8] shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Past Papers & Models</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-black text-amber-600">
                      {myTeacherResources.filter((r) => r.resourceType === "past_paper").length}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Exam Sets</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#e6ece8] shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Subscribers-Only</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-black text-slate-800">
                      {myTeacherResources.filter((r) => r.visibility === "subscribers_only").length}
                    </span>
                    <Badge variant="warning" className="text-[10px]">
                      🔒 Protected
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="p-3 bg-white border border-[#e6ece8] rounded-2xl shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Search box */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={resourceSearch}
                      onChange={(e) => setResourceSearch(e.target.value)}
                      placeholder="Search by title, syllabus topic, year (e.g. 2025), or subject..."
                      className="w-full pl-9 pr-8 h-9 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    />
                    {resourceSearch && (
                      <button
                        onClick={() => setResourceSearch("")}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Visibility Filter */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-500">Access:</span>
                    <select
                      value={resourceVisibilityFilter}
                      onChange={(e) => setResourceVisibilityFilter(e.target.value as any)}
                      className="h-9 px-3 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d]"
                    >
                      <option value="all">All Access Levels</option>
                      <option value="public">🌐 Public Access</option>
                      <option value="subscribers_only">🔒 Subscribers Only</option>
                    </select>
                  </div>
                </div>

                {/* Type pills filter */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Type:</span>
                  {[
                    { id: "all", label: "All Items", count: myTeacherResources.length },
                    {
                      id: "tute",
                      label: "📝 Class Tutes",
                      count: myTeacherResources.filter((r) => r.resourceType === "tute").length
                    },
                    {
                      id: "past_paper",
                      label: "📑 Past Papers & Model Exams",
                      count: myTeacherResources.filter((r) => r.resourceType === "past_paper").length
                    },
                    {
                      id: "book",
                      label: "📖 Books & Guides",
                      count: myTeacherResources.filter((r) => r.resourceType === "book").length
                    }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setResourceTypeFilter(tab.id as any)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        resourceTypeFilter === tab.id
                          ? "bg-[#0d5c4d] text-white shadow-xs"
                          : "bg-[#f8faf9] text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Resource Card Grid */}
              {filteredTeacherResources.length === 0 ? (
                <div className="p-10 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white space-y-3">
                  <div className="p-3 bg-[#ecf8f5] text-[#0d5c4d] rounded-full w-fit mx-auto">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No Study Materials Found</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {resourceSearch || resourceTypeFilter !== "all" || resourceVisibilityFilter !== "all"
                      ? "No materials match the chosen filter criteria. Try clearing the search or switching types."
                      : "Upload your first PDF tute, model exam paper, or study guide for your students."}
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {(resourceSearch || resourceTypeFilter !== "all" || resourceVisibilityFilter !== "all") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setResourceSearch("");
                          setResourceTypeFilter("all");
                          setResourceVisibilityFilter("all");
                        }}
                        className="text-xs font-bold"
                      >
                        Clear Filters
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => {
                        setResourceToEdit(null);
                        setIsResourceModalOpen(true);
                      }}
                      className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs"
                    >
                      <UploadCloud className="h-3.5 w-3.5 mr-1" /> Upload Material
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTeacherResources.map((res) => {
                    const isTute = res.resourceType === "tute";
                    const isPastPaper = res.resourceType === "past_paper";
                    const isSubscribersOnly = res.visibility === "subscribers_only";

                    return (
                      <Card
                        key={res.id}
                        className="border-[#e6ece8] bg-white shadow-2xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
                      >
                        {/* Cover Image Banner */}
                        <div className="relative h-32 w-full bg-slate-900 overflow-hidden">
                          <img
                            src={res.coverImage || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80"}
                            alt={res.title}
                            className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs border border-white/20">
                              {isTute ? "📝 Class Tute" : isPastPaper ? "📑 Past Paper" : "📖 Study Guide"}
                            </span>

                            <Badge
                              variant={isSubscribersOnly ? "warning" : "success"}
                              className="text-[10px] font-bold shadow-xs backdrop-blur-xs"
                            >
                              {isSubscribersOnly ? "🔒 Subscribers" : "🌐 Public"}
                            </Badge>
                          </div>

                          {/* Bottom info on banner */}
                          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-bold">
                            <span className="truncate max-w-[180px] bg-[#0d5c4d]/90 px-2 py-0.5 rounded-md backdrop-blur-xs border border-white/10">
                              📚 {res.subject}
                            </span>
                            {res.year && (
                              <span className="bg-amber-500/90 text-white px-2 py-0.5 rounded-md font-mono text-[10px]">
                                {res.year} A/L
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Content Body */}
                        <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            {res.topic && (
                              <p className="text-[11px] font-bold text-[#0d5c4d] truncate">
                                📌 {res.topic}
                              </p>
                            )}

                            <h3 className="text-sm font-black text-[#0d2b26] line-clamp-2 leading-snug" title={res.title}>
                              {res.title}
                            </h3>

                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {res.description || "Curriculum-aligned lecture guide with worked solutions."}
                            </p>

                            {/* Past Paper Specific Badges */}
                            {isPastPaper && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {res.medium && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                                    🗣️ {res.medium} Medium
                                  </span>
                                )}
                                {res.paperPart && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                                    {res.paperPart}
                                  </span>
                                )}
                                {res.hasMarkingScheme && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-0.5">
                                    <Check className="h-3 w-3" /> Marking Scheme
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Specs and stats pill */}
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                              <span className="font-mono text-slate-500 font-semibold">
                                {res.fileType || "PDF"} &bull; {res.fileSize || "4.2 MB"} &bull; {res.pageCount || 20} Pages
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="flex items-center gap-0.5" title="Student Views">
                                  <Eye className="h-3 w-3 text-slate-400" /> {res.viewsCount || 0}
                                </span>
                                <span className="flex items-center gap-0.5 text-[#0d5c4d] font-bold" title="Downloads">
                                  <Download className="h-3 w-3" /> {res.downloadsCount || 0}
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Actions Footer */}
                          <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  recordResourceView(res.id);
                                  setInspectingResource(res);
                                  setResourceViewerPage(1);
                                  setResourceViewerTab("document");
                                }}
                                className="h-7 text-xs font-bold text-[#0d5c4d] border-[#c4e9e0] hover:bg-[#ecf8f5] px-2 cursor-pointer"
                                title="Inspect & Read Document"
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" /> Read
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setResourceToEdit(res);
                                  setIsResourceModalOpen(true);
                                }}
                                className="h-7 text-xs font-bold text-slate-700 hover:bg-slate-50 px-2 cursor-pointer"
                                title="Edit Material"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete material "${res.title}" from library?`)) {
                                    deleteLibraryResource(res.id);
                                  }
                                }}
                                className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Material"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <Button
                              size="sm"
                              onClick={() => handleDownloadResource(res)}
                              className="h-7 text-xs font-bold bg-[#0d5c4d] hover:bg-[#083e34] text-white gap-1 px-2.5 cursor-pointer shadow-2xs"
                              title="Download File"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
                  Marks Grade Distribution
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Breakdown of evaluated student submissions across benchmark bands.
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
                    <p className="text-xl font-black text-[#0d2b26] mt-0.5">{benchmarkStats.classAvg}</p>
                  </div>
                  <Badge variant={benchmarkStats.classAvg !== "N/A" ? "success" : "outline"}>
                    {benchmarkStats.classAvg !== "N/A" ? "Live Calculated" : "No Data"}
                  </Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 font-bold">On-Time Submission Rate</p>
                    <p className="text-xl font-black text-[#0d2b26] mt-0.5">{benchmarkStats.onTimeRate}</p>
                  </div>
                  <Badge variant="outline">Submissions</Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-[#fef7e6] border border-[#fde4af] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#b47a16] font-bold">Students Needing Support</p>
                    <p className="text-xl font-black text-[#0d2b26] mt-0.5">{benchmarkStats.needingSupport} Students</p>
                  </div>
                  <Badge variant={benchmarkStats.needingSupport > 0 ? "warning" : "outline"}>
                    {benchmarkStats.needingSupport > 0 ? "Follow-up" : "Normal"}
                  </Badge>
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
                      <td className="py-3 px-4 text-slate-600">{st.submitted}</td>
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
                  {studentRoster.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                        No student submission records available yet.
                      </td>
                    </tr>
                  )}
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
          {/* Subject / Course & Syllabus Topic Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Subject / Course <span className="text-rose-500">*</span>
              </label>
              <select
                value={newCourseId}
                onChange={(e) => {
                  setNewCourseId(e.target.value);
                  const selectedC = courses.find((c) => c.id === e.target.value);
                  if (selectedC?.units?.[0]?.topics?.[0]) {
                    setNewTopic(`${selectedC.units[0].title} • ${selectedC.units[0].topics[0].title}`);
                  }
                }}
                className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    📚 {c.title} ({c.code || c.className || "A/L"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Syllabus Unit / Topic
              </label>
              {asgAvailableTopics.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                  >
                    {asgAvailableTopics.map((topStr) => (
                      <option key={topStr} value={topStr}>
                        {topStr}
                      </option>
                    ))}
                    <option value="__custom__">✍️ Other / Custom Topic...</option>
                  </select>
                  {newTopic === "__custom__" && (
                    <input
                      type="text"
                      required
                      placeholder="Type custom topic name..."
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-amber-50/50 border border-amber-300 text-xs text-slate-900"
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Unit 1: Quadratic Functions"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Assignment Title <span className="text-rose-500">*</span>
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
                Maximum Marks
              </label>
              <input
                type="number"
                value={newMaxMarks}
                onChange={(e) => setNewMaxMarks(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Due Date &amp; Time
              </label>
              <input
                type="text"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
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
          {/* Subject / Course & Syllabus Topic Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Subject / Course <span className="text-rose-500">*</span>
              </label>
              <select
                value={editCourseId}
                onChange={(e) => {
                  setEditCourseId(e.target.value);
                  const selectedC = courses.find((c) => c.id === e.target.value);
                  if (selectedC?.units?.[0]?.topics?.[0]) {
                    setEditTopic(`${selectedC.units[0].title} • ${selectedC.units[0].topics[0].title}`);
                  }
                }}
                className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    📚 {c.title} ({c.code || c.className || "A/L"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Syllabus Unit / Topic
              </label>
              {editAsgAvailableTopics.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={editTopic}
                    onChange={(e) => setEditTopic(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                  >
                    {editAsgAvailableTopics.map((topStr) => (
                      <option key={topStr} value={topStr}>
                        {topStr}
                      </option>
                    ))}
                    <option value="__custom__">✍️ Other / Custom Topic...</option>
                  </select>
                  {editTopic === "__custom__" && (
                    <input
                      type="text"
                      required
                      placeholder="Type custom topic name..."
                      value={editCustomTopic}
                      onChange={(e) => setEditCustomTopic(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-amber-50/50 border border-amber-300 text-xs text-slate-900"
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  placeholder="e.g. Unit 1: Quadratic Functions"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Assignment Title <span className="text-rose-500">*</span>
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
                Maximum Marks
              </label>
              <input
                type="number"
                value={editMaxMarks}
                onChange={(e) => setEditMaxMarks(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Due Date &amp; Time
              </label>
              <input
                type="text"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
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

      {/* Modal: Student Answer Sheet Inspector */}
      <Modal
        isOpen={isAnswerSheetModalOpen}
        onClose={() => setIsAnswerSheetModalOpen(false)}
        title="Candidate Answer Script Inspector"
        description={`${activeSubmission?.studentName || "Student"} • ${activeSubmission?.assignmentTitle || "Assignment"}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          {/* Top toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 text-white rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
                📄 {activeSubmission?.fileAttachmentName || "Solution_Paper.pdf"}
              </span>
              <span className="text-xs text-slate-400">Page 1 of 2</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDocZoom((z) => Math.max(70, z - 10))}
                className="h-7 text-xs border-slate-700 bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
              >
                <ZoomOut className="h-3.5 w-3.5 mr-1" /> Zoom Out
              </Button>
              <span className="text-xs font-mono font-bold text-emerald-400 px-1">{docZoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDocZoom((z) => Math.min(150, z + 10))}
                className="h-7 text-xs border-slate-700 bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
              >
                <ZoomIn className="h-3.5 w-3.5 mr-1" /> Zoom In
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (activeSubmission?.fileAttachmentUrl) {
                    window.open(activeSubmission.fileAttachmentUrl, "_blank");
                  } else {
                    window.alert("Downloading candidate answer sheet PDF...");
                  }
                }}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold ml-2 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 mr-1" /> Download
              </Button>
            </div>
          </div>

          {/* Simulated Answer Sheet Paper Canvas */}
          <div className="overflow-x-auto p-4 bg-slate-100 rounded-2xl flex justify-center">
            <div
              style={{ transform: `scale(${docZoom / 100})`, transformOrigin: "top center", transition: "transform 0.15s ease-out" }}
              className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200 p-8 space-y-6 text-slate-900"
            >
              {/* Paper Header */}
              <div className="border-b-2 border-slate-900 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black tracking-wide uppercase">General Certificate of Education (Advanced Level)</h4>
                    <p className="text-xs font-bold text-slate-600">Department of Examinations, Sri Lanka &bull; Candidate Script</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold bg-slate-100 border border-slate-300 px-2 py-1 rounded">
                      INDEX: {activeSubmission?.studentId?.substring(0, 8).toUpperCase() || "2026-AL-0442"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-700">
                  <div><strong>Candidate Name:</strong> {activeSubmission?.studentName}</div>
                  <div><strong>Subject:</strong> {assignments.find((a) => a.id === activeSubmission?.assignmentId)?.subjectName || "Combined Mathematics"}</div>
                  <div><strong>Assignment:</strong> {activeSubmission?.assignmentTitle}</div>
                  <div><strong>Submitted At:</strong> {activeSubmission?.submittedAt}</div>
                </div>
              </div>

              {/* Simulated Mathematical Solution Content */}
              <div className="space-y-4 font-mono text-xs leading-relaxed text-slate-800">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-bold text-slate-900 mb-1 font-sans">Part A — Question 01 [Calculus / Integration]:</p>
                  <p>Given the curve equation: y = x² &bull; sin(2x)</p>
                  <p>Applying the product rule of differentiation: dy/dx = u(dv/dx) + v(du/dx)</p>
                  <p className="pl-4 text-emerald-800 font-bold">&rArr; dy/dx = x² &bull; [2 cos(2x)] + sin(2x) &bull; [2x]</p>
                  <p className="pl-4 text-emerald-800 font-bold">&rArr; dy/dx = 2x [ x &bull; cos(2x) + sin(2x) ] &check; (Correct working step)</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-bold text-slate-900 mb-1 font-sans">Part B — Question 02 [Definite Integral Solution]:</p>
                  <p>&int;₀^(&pi;/2) x &bull; cos(x) dx</p>
                  <p>Using Integration by Parts: &int; u v' dx = u v - &int; u' v dx</p>
                  <p>Let u = x &rArr; du = dx ; dv = cos(x) dx &rArr; v = sin(x)</p>
                  <p className="pl-4">&rArr; [x &bull; sin(x)]₀^(&pi;/2) - &int;₀^(&pi;/2) sin(x) dx</p>
                  <p className="pl-4 text-emerald-800 font-bold">&rArr; (&pi;/2 &bull; 1 - 0) - [ -cos(x) ]₀^(&pi;/2) = &pi;/2 - 1 &check; (Full Marks)</p>
                </div>

                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-amber-50/50 text-slate-600 text-center">
                  <p className="text-[11px] font-sans">
                    End of Candidate Answer Sheet Script &bull; Verified in LMS Submission Vault
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setIsAnswerSheetModalOpen(false)}
              className="text-xs font-bold border-slate-300"
            >
              Close Inspector
            </Button>
          </div>
        </div>
      </Modal>

      {/* QUIZ BUILDER MODAL */}
      <QuizBuilderModal
        isOpen={isQuizModalOpen}
        onClose={() => {
          setIsQuizModalOpen(false);
          setQuizToEdit(null);
        }}
        quizToEdit={quizToEdit}
        courses={teacherCourses}
        onSave={(data) => {
          if (quizToEdit) {
            updateQuiz(quizToEdit.id, data);
          } else {
            createQuiz(data);
          }
        }}
      />

      {/* TUTOR TEST PREVIEW MODAL */}
      {previewQuiz && (
        <Modal
          isOpen={Boolean(previewQuiz)}
          onClose={() => {
            setPreviewQuiz(null);
            setPreviewResult(null);
          }}
          title={
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#ecf8f5] text-[#0d5c4d]">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#0d2b26]">
                  Candidate Exam Simulation & Diagnostic Preview
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Testing "{previewQuiz.title}" as an enrolled student.
                </p>
              </div>
            </div>
          }
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf9] border border-[#e6ece8] text-xs font-bold">
              <span className="text-[#0d5c4d]">📚 {previewQuiz.subjectName}</span>
              <span className="text-slate-600">⏱️ {previewQuiz.durationMinutes} Minutes</span>
              <span className="text-slate-800">🏆 {previewQuiz.totalMarks} Total Marks</span>
            </div>

            {previewResult ? (
              <div className="p-6 rounded-2xl bg-[#ecf8f5] border border-[#c4e9e0] text-center space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0d5c4d]">
                  Instant Automated Result
                </span>
                <p className="text-3xl font-black text-[#0d5c4d]">
                  Score: {previewResult.score} / {previewResult.totalMarks}
                </p>
                <p className="text-xs text-slate-600">
                  {Math.round((previewResult.score / previewResult.totalMarks) * 100)}% Proficiency Benchmark
                </p>
                <Button
                  onClick={() => {
                    setPreviewAnswers({});
                    setPreviewResult(null);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-[#c4e9e0] text-[#0d5c4d] text-xs font-bold"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {previewQuiz.questions.map((q, idx) => (
                  <div key={q.id || idx} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0d5c4d]">
                        Question {idx + 1} of {previewQuiz.questions.length}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {q.marks} Marks
                      </span>
                    </div>

                    <p className="text-xs font-bold text-[#0d2b26] leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* Question Options or Text Inputs */}
                    {(q.type === "mcq" || q.type === "true_false") && (
                      <div className="space-y-1.5 pt-1">
                        {q.options?.map((opt, optIdx) => {
                          const isChosen = previewAnswers[q.id] === optIdx;

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() =>
                                setPreviewAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: optIdx
                                }))
                              }
                              className={`w-full text-left p-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 border transition-all cursor-pointer ${
                                isChosen
                                  ? "bg-[#ecf8f5] border-[#0d5c4d] text-[#0d5c4d] font-bold"
                                  : "bg-[#f8faf9] border-slate-200 hover:border-slate-300 text-slate-700"
                              }`}
                            >
                              <span
                                className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  isChosen ? "bg-[#0d5c4d] text-white" : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {q.type === "multi_select" && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] text-slate-500 font-medium">☑️ Select all that apply:</p>
                        {q.options?.map((opt, optIdx) => {
                          const currArr: number[] = Array.isArray(previewAnswers[q.id])
                            ? (previewAnswers[q.id] as number[])
                            : [];
                          const isChosen = currArr.includes(optIdx);

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                const nextArr = isChosen
                                  ? currArr.filter((i) => i !== optIdx)
                                  : [...currArr, optIdx];
                                setPreviewAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: nextArr
                                }));
                              }}
                              className={`w-full text-left p-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 border transition-all cursor-pointer ${
                                isChosen
                                  ? "bg-[#ecf8f5] border-[#0d5c4d] text-[#0d5c4d] font-bold"
                                  : "bg-[#f8faf9] border-slate-200 hover:border-slate-300 text-slate-700"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChosen}
                                readOnly
                                className="h-4 w-4 rounded text-[#0d5c4d] pointer-events-none"
                              />
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {(q.type === "short_answer" || q.type === "numerical") && (
                      <div className="pt-1">
                        <input
                          type={q.type === "numerical" ? "number" : "text"}
                          value={String(previewAnswers[q.id] ?? "")}
                          onChange={(e) =>
                            setPreviewAnswers((prev) => ({
                              ...prev,
                              [q.id]: e.target.value
                            }))
                          }
                          placeholder={
                            q.type === "numerical" ? "Enter numerical value..." : "Type answer phrase..."
                          }
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] font-semibold text-slate-800 bg-white"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPreviewQuiz(null);
                  setPreviewResult(null);
                }}
                className="text-xs font-bold"
              >
                Close Simulation
              </Button>

              {!previewResult && (
                <Button
                  size="sm"
                  onClick={() => {
                    let score = 0;
                    previewQuiz.questions.forEach((q) => {
                      const studentAns = previewAnswers[q.id];
                      if (studentAns !== undefined && studentAns !== null && studentAns !== "") {
                        const marks = Number(q.marks) || 10;
                        if (q.type === "short_answer" || q.type === "numerical") {
                          if (
                            String(studentAns).trim().toLowerCase() ===
                            String(q.correctAnswer).trim().toLowerCase()
                          ) {
                            score += marks;
                          }
                        } else if (q.type === "multi_select") {
                          const correctArr = Array.isArray(q.correctAnswer)
                            ? q.correctAnswer.map(String).sort()
                            : [String(q.correctAnswer)];
                          const studentArr = Array.isArray(studentAns)
                            ? (studentAns as any[]).map(String).sort()
                            : [String(studentAns)];
                          if (
                            studentArr.length === correctArr.length &&
                            studentArr.every((v, i) => v === correctArr[i])
                          ) {
                            score += marks;
                          }
                        } else {
                          if (String(studentAns) === String(q.correctAnswer)) {
                            score += marks;
                          }
                        }
                      }
                    });
                    setPreviewResult({ score, totalMarks: previewQuiz.totalMarks });
                  }}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Evaluate Test Attempt
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Upload & Edit Resource */}
      <ResourceUploadModal
        isOpen={isResourceModalOpen}
        onClose={() => {
          setIsResourceModalOpen(false);
          setResourceToEdit(null);
        }}
        resourceToEdit={resourceToEdit}
        courses={teacherCourses}
        onSave={(data, publish) => {
          if (resourceToEdit) {
            updateLibraryResource(resourceToEdit.id, {
              ...data,
              status: publish ? "published" : "draft"
            });
          } else {
            createLibraryResource({
              ...data,
              status: publish ? "published" : "draft",
              author: currentUser?.name || "Tutor Faculty",
              teacherId: currentUser?.id
            });
          }
          setIsResourceModalOpen(false);
          setResourceToEdit(null);
        }}
      />

      {/* Modal: Interactive Document Reader & Inspection */}
      {inspectingResource && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingResource(null)}
          title={
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#ecf8f5] text-[#0d5c4d]">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="truncate max-w-[400px]">{inspectingResource.title}</span>
              <Badge
                variant={inspectingResource.visibility === "subscribers_only" ? "warning" : "success"}
                className="text-[10px]"
              >
                {inspectingResource.visibility === "subscribers_only" ? "🔒 Subscribers Only" : "🌐 Public"}
              </Badge>
            </div>
          }
          size="xl"
        >
          <div className="space-y-4">
            {/* Toolbar: Sub-tabs (Document Reader vs Marking Scheme vs Table of Contents) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-[#f8faf9] rounded-xl border border-slate-200">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setResourceViewerTab("document")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    resourceViewerTab === "document"
                      ? "bg-[#0d5c4d] text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  📄 Document Pages
                </button>

                {inspectingResource.hasMarkingScheme && (
                  <button
                    type="button"
                    onClick={() => setResourceViewerTab("marking")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                      resourceViewerTab === "marking"
                        ? "bg-[#0d5c4d] text-white"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span>📑 Marking Scheme &amp; Answers</span>
                    <Badge variant="success" className="text-[9px] px-1 py-0">
                      Verified
                    </Badge>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setResourceViewerTab("toc")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    resourceViewerTab === "toc"
                      ? "bg-[#0d5c4d] text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  📑 Table of Contents
                </button>
              </div>

              {/* Zoom & Page Stepper */}
              {resourceViewerTab === "document" && (
                <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setResourceViewerZoom((z) => Math.max(75, z - 10))}
                      className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-mono font-bold text-[11px] w-10 text-center">{resourceViewerZoom}%</span>
                    <button
                      onClick={() => setResourceViewerZoom((z) => Math.min(150, z + 10))}
                      className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                    <button
                      disabled={resourceViewerPage <= 1}
                      onClick={() => setResourceViewerPage((p) => Math.max(1, p - 1))}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    >
                      ◀
                    </button>
                    <span className="font-mono text-[11px] font-bold">
                      Page {resourceViewerPage} of {inspectingResource.pageCount || 20}
                    </span>
                    <button
                      disabled={resourceViewerPage >= (inspectingResource.pageCount || 20)}
                      onClick={() => setResourceViewerPage((p) => Math.min(inspectingResource.pageCount || 20, p + 1))}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* TAB 1: Document Page Reader Preview */}
            {resourceViewerTab === "document" && (
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 overflow-y-auto max-h-[500px] flex justify-center">
                <div
                  className="bg-white rounded-xl shadow-md border border-slate-300 p-8 text-slate-900 transition-all font-serif"
                  style={{
                    width: `${Math.round(620 * (resourceViewerZoom / 100))}px`,
                    minHeight: "750px"
                  }}
                >
                  {/* Institutional Header */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-sans font-black tracking-widest text-slate-500">
                        SRI LANKA G.C.E. (A/L) EDUCATIONAL WORKSPACE &bull; ADVANCED LEVEL
                      </p>
                      <h2 className="text-xl font-black font-sans text-slate-900 mt-1">
                        {inspectingResource.subject}
                      </h2>
                      {inspectingResource.topic && (
                        <p className="text-xs font-sans font-bold text-[#0d5c4d] mt-0.5">
                          {inspectingResource.topic}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-xs font-sans">
                      <span className="font-mono font-black text-slate-800 block">
                        {inspectingResource.year ? `${inspectingResource.year} Examination` : "Curriculum Tute"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {inspectingResource.resourceType.toUpperCase()} &bull; Page {resourceViewerPage}
                      </span>
                    </div>
                  </div>

                  {/* Document Page Simulated Content */}
                  <div className="space-y-6 text-sm text-slate-800 leading-relaxed font-sans">
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                      <span className="font-bold text-amber-900 uppercase tracking-wide block">
                        Instructor Overview &amp; Study Objective:
                      </span>
                      <p className="text-amber-800">
                        {inspectingResource.description ||
                          "This document presents verified mathematical derivations, theorems, and model problems intended to prepare candidates for examination mastery."}
                      </p>
                    </div>

                    {/* Problem / Section Sample */}
                    <div className="space-y-3 font-mono text-xs">
                      <p className="font-bold text-[#0d2b26] font-sans text-sm">
                        Section {resourceViewerPage}: Structured Problem Formulation &amp; Analysis
                      </p>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <p className="font-bold text-slate-700">Problem {resourceViewerPage}.1:</p>
                        <p className="text-slate-800 italic font-serif text-sm">
                          {inspectingResource.subject.toLowerCase().includes("math")
                            ? `Let f(x) = ax² + bx + c, where a ≠ 0 and roots are α, β. Prove that α + β = -b/a and αβ = c/a. Hence, find the cubic equation whose roots are α², β² and α + β.`
                            : inspectingResource.subject.toLowerCase().includes("phys")
                            ? `A uniform solid sphere of mass M and radius R rolls without slipping down an inclined plane of angle θ. Calculate the linear acceleration and the frictional force acting at the point of contact.`
                            : `Examine the reaction kinetics and thermodynamic equilibrium of the system at temperature T = 298K. Determine the reaction quotient Q and compare with Kc.`}
                        </p>
                      </div>

                      <div className="p-4 bg-[#ecf8f5] rounded-xl border border-[#c4e9e0] space-y-2">
                        <p className="font-bold text-[#0d5c4d] font-sans text-xs">
                          Faculty Solution &amp; Step-by-Step Derivation:
                        </p>
                        <p className="text-slate-800 text-xs font-sans leading-relaxed">
                          Applying standard algebraic decomposition and symmetric polynomial transformations:
                          <br />
                          1. Express sum of roots: S = (α² + β²) + (α + β) = (α + β)² - 2αβ + (α + β).
                          <br />
                          2. Express pairwise products and constant term: P = α²β²(α + β).
                          <br />
                          3. Substitute given coefficients and verify discriminants Δ &gt; 0.
                        </p>
                      </div>
                    </div>

                    {/* Watermark / Footer */}
                    <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-sans">
                      <span>Author: {inspectingResource.author}</span>
                      <span>Sri Lankan National Examination Portal</span>
                      <span>Page {resourceViewerPage} of {inspectingResource.pageCount || 20}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Marking Scheme & Model Answers */}
            {resourceViewerTab === "marking" && (
              <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4 max-h-[500px] overflow-y-auto">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    <span className="font-black text-emerald-950">
                      Official Marking Scheme &amp; Evaluation Guide
                    </span>
                  </div>
                  <p className="text-emerald-800">
                    {inspectingResource.markingSchemeNotes ||
                      "Detailed marks allocation scheme prepared strictly adhering to Department of Examinations conventions."}
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      section: "Part A — Question 1 (Algebra)",
                      step1: "Correct setup of quadratic discriminant formula: Δ = b² - 4ac",
                      marks1: "03 Marks (Method)",
                      step2: "Condition for real and distinct roots Δ > 0 correctly established",
                      marks2: "04 Marks (Accuracy)",
                      step3: "Final simplified inequality correctly derived and bounded",
                      marks3: "03 Marks (Final)"
                    },
                    {
                      section: "Part A — Question 2 (Calculus)",
                      step1: "First derivative f'(x) found using chain rule",
                      marks1: "04 Marks (Method)",
                      step2: "Critical stationary points set to zero and solved",
                      marks2: "03 Marks (Accuracy)",
                      step3: "Second derivative test applied to verify local maximum",
                      marks3: "03 Marks (Conclusion)"
                    }
                  ].map((rubric, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs space-y-2">
                      <p className="font-black text-[#0d2b26]">{rubric.section}</p>
                      <div className="space-y-1.5 pl-2 border-l-2 border-[#0d5c4d]">
                        <div className="flex items-center justify-between text-slate-700">
                          <span>&bull; {rubric.step1}</span>
                          <span className="font-mono font-bold text-[#0d5c4d]">{rubric.marks1}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span>&bull; {rubric.step2}</span>
                          <span className="font-mono font-bold text-[#0d5c4d]">{rubric.marks2}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span>&bull; {rubric.step3}</span>
                          <span className="font-mono font-bold text-[#0d5c4d]">{rubric.marks3}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Table of Contents */}
            {resourceViewerTab === "toc" && (
              <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 max-h-[500px] overflow-y-auto">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Curriculum Table of Contents &amp; Sections:
                </h4>
                <div className="divide-y divide-slate-100">
                  {(inspectingResource.tableOfContents && inspectingResource.tableOfContents.length > 0
                    ? inspectingResource.tableOfContents
                    : [
                        { title: "Unit Overview, Formula Sheet & Definitions", page: 1 },
                        { title: "Standard Problem Set & Worked Examples", page: 5 },
                        { title: "Past Examination Questions (2018 - 2024)", page: 12 },
                        { title: "Speed Drill Model Questions & Solutions", page: 18 }
                      ]
                  ).map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setResourceViewerPage(item.page);
                        setResourceViewerTab("document");
                      }}
                      className="w-full py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg text-left cursor-pointer transition-colors"
                    >
                      <span className="text-xs font-bold text-slate-800">
                        {i + 1}. {item.title}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#0d5c4d] bg-[#ecf8f5] px-2.5 py-0.5 rounded-full">
                        Page {item.page} &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectingResource(null)}
                className="text-xs font-bold"
              >
                Close Viewer
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDownloadResource(inspectingResource)}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Download Full Document
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
