"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import {
  FileText,
  UploadCloud,
  Clock,
  FileCheck,
  Send,
  MessageSquare,
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  GraduationCap,
  Paperclip,
  X,
  FileCode,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const submissionSchema = z.object({
  textContent: z.string().min(10, "Please provide an answer explanation with at least 10 characters."),
  fileName: z.string().optional()
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

export function AssignmentViews() {
  const {
    assignments,
    submissions,
    currentUser,
    authUser,
    submitAssignment,
    selectedAssignmentId,
    setSelectedAssignmentId,
    addToast,
    t
  } = useApp();

  const [backendAssignments, setBackendAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "submitted" | "graded">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("Alex_Solution_AnswerSheet.pdf");
  const [selectedFileSize, setSelectedFileSize] = useState<string>("2.4 MB");
  const [selectedFileDataUrl, setSelectedFileDataUrl] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [declaredHonorCode, setDeclaredHonorCode] = useState(true);

  // Load assignments from live backend API
  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await api.assignments.getAll();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setBackendAssignments(res.data);
      }
    } catch (err) {
      console.warn("Could not load backend assignments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Merge backend data with local fallback
  const combinedAssignments = useMemo(() => {
    if (backendAssignments.length === 0) return assignments;
    return backendAssignments;
  }, [backendAssignments, assignments]);

  const currentAssignment = useMemo(() => {
    return (
      combinedAssignments.find((a) => a.id === selectedAssignmentId) ||
      combinedAssignments[0] ||
      null
    );
  }, [combinedAssignments, selectedAssignmentId]);

  // Helper to resolve student submission for an assignment
  const getSubmissionForAssignment = (asg: any) => {
    if (!asg) return null;
    // 1. From backend assignment's mySubmission
    if (asg.mySubmission) {
      return {
        id: asg.mySubmission.id,
        assignmentId: asg.id,
        studentId: asg.mySubmission.studentId || currentUser?.id || authUser?.userId,
        status: asg.mySubmission.status?.toLowerCase() || "submitted",
        marksObtained: asg.mySubmission.marksObtained,
        maxMarks: asg.maxMarks,
        teacherFeedback: asg.mySubmission.teacherFeedback,
        submittedAt: asg.mySubmission.submittedAt,
        markedAt: asg.mySubmission.markedAt,
        textContent: asg.mySubmission.textContent,
        fileAttachmentName: asg.mySubmission.fileAttachmentName,
        fileAttachmentUrl: asg.mySubmission.fileAttachmentUrl,
      };
    }
    // 2. From submissions in context
    const currentStudentId = currentUser?.id || authUser?.userId;
    const contextSub = submissions.find(
      (s) => s.assignmentId === asg.id && (s.studentId === currentStudentId || !s.studentId)
    );
    return contextSub || null;
  };

  const currentSubmission = useMemo(() => {
    return getSubmissionForAssignment(currentAssignment);
  }, [currentAssignment, submissions]);

  // Filtered list
  const filteredAssignments = useMemo(() => {
    return combinedAssignments.filter((asg) => {
      const sub = getSubmissionForAssignment(asg);

      // Status filter
      if (activeFilter === "pending") {
        if (sub && (sub.status === "submitted" || sub.status === "marked" || sub.status === "result_released")) {
          return false;
        }
      } else if (activeFilter === "submitted") {
        if (!sub || (sub.status !== "submitted" && sub.status !== "marked")) {
          return false;
        }
      } else if (activeFilter === "graded") {
        if (!sub || sub.status !== "result_released") {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = asg.title?.toLowerCase().includes(q);
        const matchesSubject = asg.subjectName?.toLowerCase().includes(q);
        const matchesTopic = asg.topicName?.toLowerCase().includes(q);
        return matchesTitle || matchesSubject || matchesTopic;
      }

      return true;
    });
  }, [combinedAssignments, activeFilter, searchQuery, submissions]);

  // Metrics
  const totalCount = combinedAssignments.length;
  const gradedCount = combinedAssignments.filter((a) => {
    const sub = getSubmissionForAssignment(a);
    return sub && sub.status === "result_released";
  }).length;
  const submittedCount = combinedAssignments.filter((a) => {
    const sub = getSubmissionForAssignment(a);
    return sub && (sub.status === "submitted" || sub.status === "marked");
  }).length;
  const pendingCount = totalCount - gradedCount - submittedCount;

  // React Hook Form for submission modal
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      textContent: currentSubmission?.textContent || "",
      fileName: selectedFileName
    }
  });

  // Keep form updated when current assignment changes
  useEffect(() => {
    if (currentSubmission?.textContent) {
      setValue("textContent", currentSubmission.textContent);
    } else {
      setValue("textContent", "");
    }
  }, [currentAssignment, currentSubmission, setValue]);

  const onSubmit = async (data: SubmissionFormData) => {
    if (!currentAssignment) return;
    setIsSubmitting(true);
    try {
      // 1. Send to backend API
      await api.assignments.submit(currentAssignment.id, {
        textContent: data.textContent,
        fileAttachmentName: selectedFileName,
        fileAttachmentUrl: selectedFileDataUrl || undefined
      });

      // 2. Update context state
      await submitAssignment(
        currentAssignment.id,
        data.textContent,
        selectedFileName,
        selectedFileDataUrl || undefined
      );

      // 3. Re-fetch fresh live assignments
      await fetchAssignments();

      setIsSubmitModalOpen(false);
      reset();
      addToast({
        type: "success",
        title: "Assignment Submitted Successfully! 🚀",
        message: "Your coursework and solution sheet have been received by your instructor."
      });
    } catch (err: any) {
      console.error("Submission error:", err);
      addToast({
        type: "error",
        title: "Submission Error",
        message: err.message || "Failed to submit assignment. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyInstructions = () => {
    if (!currentAssignment?.instructions) return;
    navigator.clipboard.writeText(currentAssignment.instructions);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    addToast({
      type: "success",
      title: "Instructions Copied",
      message: "Problem statement and rubric copied to your clipboard."
    });
  };

  const handleDownloadBrief = () => {
    addToast({
      type: "success",
      title: "Downloading Problem Brief 📥",
      message: `${currentAssignment?.attachmentName || "Assignment_Brief.pdf"} downloaded successfully.`
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      setSelectedFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);

      // Read real file content as Data URL so teacher grading desk can inspect it
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setSelectedFileDataUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);

      addToast({
        type: "info",
        title: "File Attached",
        message: `${file.name} is ready for upload.`
      });
    }
  };

  // Helper for grade label
  const getGradeScore = (marks: number, max: number) => {
    const percent = Math.round((marks / max) * 100);
    let grade = "A";
    let color = "text-emerald-700 bg-emerald-50 border-emerald-300";
    if (percent >= 75) {
      grade = "A (Distinction)";
      color = "text-emerald-700 bg-emerald-50 border-emerald-300";
    } else if (percent >= 65) {
      grade = "B (Very Good)";
      color = "text-blue-700 bg-blue-50 border-blue-300";
    } else if (percent >= 55) {
      grade = "C (Credit)";
      color = "text-amber-700 bg-amber-50 border-amber-300";
    } else if (percent >= 35) {
      grade = "S (Simple Pass)";
      color = "text-slate-700 bg-slate-100 border-slate-300";
    } else {
      grade = "F (Repeat)";
      color = "text-rose-700 bg-rose-50 border-rose-300";
    }
    return { percent, grade, color };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Header Cockpit */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#082a24] via-[#0d4a3e] to-[#0a3830] p-6 lg:p-8 text-white shadow-xl shadow-emerald-950/20">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md border border-white/15">
              <FileText className="h-3.5 w-3.5 text-emerald-300" />
              <span>Coursework &amp; Assessments</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span className="text-emerald-300 font-bold">2026/2027 Term 3</span>
            </div>

            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl text-white">
              Assignment Submissions &amp; Feedback
            </h1>
            <p className="mt-1 text-sm text-emerald-100/90 leading-relaxed">
              View all course assignments, submit your responses, and review teacher grading and personalized feedback.
            </p>

            {/* Metrics Bar */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <p className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-medium">Total Coursework</p>
                <p className="text-xl font-black text-white mt-0.5">{totalCount} <span className="text-xs font-normal text-emerald-200">Tasks</span></p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <p className="text-[11px] uppercase tracking-wider text-amber-300/80 font-medium">Pending Due</p>
                <p className="text-xl font-black text-amber-300 mt-0.5">{pendingCount} <span className="text-xs font-normal text-white">Pending</span></p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <p className="text-[11px] uppercase tracking-wider text-sky-300/80 font-medium">Under Review</p>
                <p className="text-xl font-black text-sky-200 mt-0.5">{submittedCount} <span className="text-xs font-normal text-white">Submitted</span></p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <p className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-medium">Certified Graded</p>
                <p className="text-xl font-black text-emerald-400 mt-0.5">{gradedCount} <span className="text-xs font-normal text-white">Released</span></p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <Button
              onClick={fetchAssignments}
              disabled={isLoading}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md gap-2 rounded-xl text-xs font-bold"
            >
              <RefreshCw className={`h-4 w-4 text-emerald-300 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            {currentAssignment && (
              <Button
                onClick={() => setIsSubmitModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black gap-2 rounded-xl shadow-lg shadow-emerald-500/20 text-xs"
              >
                <UploadCloud className="h-4 w-4" />
                <span>{currentSubmission ? "Resubmit Work" : "Submit Coursework"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Coursework Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Filter Pills and Search */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#e6ece8] shadow-xs space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject, title, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 pl-8 pr-3 text-xs focus:border-[#0d5c4d] focus:outline-none focus:ring-1 focus:ring-[#0d5c4d]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${activeFilter === "all"
                    ? "bg-[#0d5c4d] text-white shadow-xs"
                    : "bg-[#f4f7f5] text-slate-600 hover:bg-[#e6ece8]"
                  }`}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("pending")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${activeFilter === "pending"
                    ? "bg-amber-500 text-slate-950 shadow-xs font-extrabold"
                    : "bg-[#f4f7f5] text-slate-600 hover:bg-[#e6ece8]"
                  }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("submitted")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${activeFilter === "submitted"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-[#f4f7f5] text-slate-600 hover:bg-[#e6ece8]"
                  }`}
              >
                Review ({submittedCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("graded")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${activeFilter === "graded"
                    ? "bg-[#0d5c4d] text-white shadow-xs"
                    : "bg-[#f4f7f5] text-slate-600 hover:bg-[#e6ece8]"
                  }`}
              >
                Graded ({gradedCount})
              </button>
            </div>
          </div>

          {/* Queue List Cards */}
          {filteredAssignments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs font-bold text-slate-700">No coursework matching this filter</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Check other tabs or clear your search term.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredAssignments.map((asg) => {
                const sub = getSubmissionForAssignment(asg);
                const isSelected = currentAssignment?.id === asg.id;

                let statusBadge = (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-bold">
                    <Clock className="h-3 w-3 text-slate-400" />
                    Pending Submission
                  </span>
                );

                if (sub) {
                  if (sub.status === "result_released") {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Graded: {sub.marksObtained}/{sub.maxMarks || asg.maxMarks}
                      </span>
                    );
                  } else if (sub.status === "marked") {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 text-[10px] font-bold">
                        <Clock className="h-3 w-3 text-blue-500" />
                        Evaluated (Pending Release)
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-bold">
                        <Clock className="h-3 w-3 text-amber-500" />
                        Submitted (Under Review)
                      </span>
                    );
                  }
                }

                // Format Due Date
                let dueFormatted = asg.dueDate || "Nov 15, 2026";
                if (dueFormatted.includes("T")) {
                  dueFormatted = new Date(dueFormatted).toLocaleDateString("en-GB", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  });
                }

                return (
                  <div
                    key={asg.id}
                    onClick={() => setSelectedAssignmentId(asg.id)}
                    className={`group relative rounded-2xl border p-4 transition-all cursor-pointer ${isSelected
                        ? "bg-white border-[#0d5c4d] shadow-md ring-2 ring-[#0d5c4d]/10"
                        : "bg-white border-[#e6ece8] hover:border-[#c4e9e0] hover:shadow-sm"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#0d5c4d]">
                        {asg.subjectName || "Subject Coursework"}
                      </span>
                      {statusBadge}
                    </div>

                    <h3 className="mt-2 text-sm font-black text-[#0d2b26] line-clamp-1 group-hover:text-[#0d5c4d] transition-colors">
                      {asg.title}
                    </h3>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="font-semibold text-slate-600">Weight: {asg.maxMarks} Marks</span>
                      <span className="flex items-center gap-1 font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                        <Clock className="h-3 w-3" /> Due: {dueFormatted}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Assignment View & Teacher Feedback Cockpit (7 cols) */}
        <div className="lg:col-span-7">
          {currentAssignment ? (
            <Card className="rounded-3xl border border-[#e6ece8] bg-white shadow-sm overflow-hidden">
              <CardHeader className="p-6 pb-4 border-b border-[#e6ece8] bg-[#fbfcfb]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                      {currentAssignment.topicName || "Academic Topic"}
                    </span>
                    <span className="rounded-md bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-bold">
                      Max Marks: {currentAssignment.maxMarks}
                    </span>
                  </div>

                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                    <Clock className="h-3.5 w-3.5" />
                    Deadline: {currentAssignment.dueDate ? new Date(currentAssignment.dueDate).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }) : "Nov 15, 2026"}
                  </span>
                </div>

                <CardTitle className="text-xl font-black text-[#0d2b26] mt-3 tracking-tight">
                  {currentAssignment.title}
                </CardTitle>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
                  <div className="flex items-center gap-1.5 font-medium">
                    <GraduationCap className="h-4 w-4 text-emerald-600" />
                    <span>Specialist Faculty: {currentAssignment.teacherName || "Lead Educator"}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Instructions & Problem Statement Box */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-[#0d5c4d]" />
                      Instructions & Problem Statement
                    </h4>
                    <button
                      type="button"
                      onClick={handleCopyInstructions}
                      className="text-xs font-semibold text-slate-500 hover:text-[#0d5c4d] flex items-center gap-1 transition-colors"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{isCopied ? "Copied" : "Copy Problem"}</span>
                    </button>
                  </div>
                  <div className="text-sm text-slate-800 leading-relaxed bg-[#f8faf9] p-5 rounded-2xl border border-[#e6ece8] whitespace-pre-line font-serif">
                    {currentAssignment.instructions}
                  </div>
                </div>

                {/* Teacher Attachment Download */}
                {currentAssignment.attachmentName && (
                  <div className="p-4 rounded-2xl bg-[#f4f7f5] border border-[#e6ece8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0d5c4d] shrink-0">
                        <FileCode className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{currentAssignment.attachmentName}</p>
                        <p className="text-[11px] text-slate-500">Official Problem Set & Marking Scheme Brief</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleDownloadBrief}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-xl text-xs font-bold text-[#0d5c4d] border-[#c4e9e0] hover:bg-white"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Brief</span>
                    </Button>
                  </div>
                )}

                {/* Response / Submission / Teacher Feedback Area */}
                {currentSubmission ? (
                  <div className="space-y-4">
                    {/* Graded Result Callout */}
                    {currentSubmission.status === "result_released" ? (
                      (() => {
                        const scoreData = getGradeScore(
                          currentSubmission.marksObtained || 0,
                          currentSubmission.maxMarks || currentAssignment.maxMarks
                        );

                        return (
                          <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 p-5 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
                              <div>
                                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
                                  <Award className="h-4 w-4 text-emerald-600" />
                                  Certified Assessment Score
                                </span>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Evaluated and confirmed on {currentSubmission.markedAt ? new Date(currentSubmission.markedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }) : "Today"}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${scoreData.color}`}>
                                  {scoreData.grade}
                                </span>
                                <div className="text-right">
                                  <span className="text-3xl font-black text-[#0d5c4d]">
                                    {currentSubmission.marksObtained}
                                  </span>
                                  <span className="text-sm font-bold text-slate-500">
                                    {" "}/ {currentSubmission.maxMarks || currentAssignment.maxMarks}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Teacher's Written Feedback */}
                            {currentSubmission.teacherFeedback && (
                              <div className="rounded-xl bg-white p-4 border border-emerald-200/80 shadow-2xs space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-[#0d5c4d]">
                                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                                  <span>Instructor's Feedback:</span>
                                </div>
                                <blockquote className="text-xs text-slate-700 italic leading-relaxed pl-3 border-l-2 border-emerald-500">
                                  "{currentSubmission.teacherFeedback}"
                                </blockquote>
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      /* Under Review Callout */
                      <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              Submission Received · Under Faculty Evaluation
                            </h4>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              Submitted on {currentSubmission.submittedAt ? new Date(currentSubmission.submittedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Today"}.
                            </p>
                          </div>
                        </div>

                        <Button
                          onClick={() => setIsSubmitModalOpen(true)}
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-amber-300 text-xs font-bold text-amber-900 hover:bg-white shrink-0"
                        >
                          Update Submission
                        </Button>
                      </div>
                    )}

                    {/* Student's Submitted Content Box */}
                    <div className="rounded-2xl border border-[#e6ece8] bg-[#f8faf9] p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-[#0d5c4d]" />
                          Your Submitted Solution
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          {currentSubmission.submittedAt ? new Date(currentSubmission.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-2xs">
                        {currentSubmission.textContent}
                      </div>

                      {currentSubmission.fileAttachmentName && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#0d5c4d]">
                            <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-mono">{currentSubmission.fileAttachmentName}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-slate-600 hover:text-[#0d5c4d] gap-1"
                            onClick={() => addToast({ type: "info", title: "File Download", message: "Viewing submitted answer sheet." })}
                          >
                            <Download className="h-3 w-3" /> View
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Not Submitted State */
                  <div className="rounded-2xl border-2 border-dashed border-[#c4e9e0] bg-[#ecf8f5]/40 p-8 text-center space-y-3">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-[#0d5c4d]/10 text-[#0d5c4d] flex items-center justify-center">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#0d2b26]">
                        You haven't submitted your response for this assignment yet.
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        Type your solution working or upload your handwritten answer sheet before the deadline to receive certified faculty grading.
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="bg-[#0d5c4d] hover:bg-[#0a463b] text-white gap-2 font-bold rounded-xl shadow-md px-6 text-xs"
                    >
                      <UploadCloud className="h-4 w-4" />
                      <span>{t.academic.submitAssignment || "Submit Coursework"}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-sm font-bold text-slate-700">No assignment selected</h3>
              <p className="mt-1 text-xs text-slate-400">Choose a coursework item from the list to view instructions and submit.</p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Submission Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={t.academic.submitAssignment || "Submit Coursework"}
        description={currentAssignment?.title}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.academic.writtenAnswer || "Written Working / Solution Explanation"} <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Markdown & step-by-step math supported</span>
            </div>
            <textarea
              {...register("textContent")}
              rows={6}
              placeholder="Type your workings, equations summary, step-by-step logic, or notes to your teacher here..."
              className="w-full p-4 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white focus:ring-2 focus:ring-[#0d5c4d]/10 font-mono text-xs"
            />
            {errors.textContent && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.textContent.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.academic.uploadFile || "Attach Solution Document (PDF / Image)"}
            </label>
            <label className="border-2 border-dashed border-[#c4e9e0] hover:border-[#0d5c4d] rounded-2xl p-6 text-center cursor-pointer bg-[#ecf8f5]/40 transition-colors block">
              <input
                type="file"
                accept=".pdf,.docx,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
              <UploadCloud className="h-8 w-8 text-[#0d5c4d] mx-auto mb-2" />
              <p className="text-xs text-slate-900 font-bold">
                Selected File: <span className="text-[#0d5c4d]">{selectedFileName}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                File size: {selectedFileSize} · Click or drag to replace (Supports PDF, DOCX, PNG up to 25MB)
              </p>
            </label>
          </div>

          {/* Honor Code Declaration */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="honorCode"
              checked={declaredHonorCode}
              onChange={(e) => setDeclaredHonorCode(e.target.checked)}
              className="mt-0.5 rounded text-[#0d5c4d] focus:ring-[#0d5c4d]"
            />
            <label htmlFor="honorCode" className="text-[11px] text-slate-700 cursor-pointer leading-tight">
              I declare that this submitted response represents my own authentic academic work, prepared in accordance with the institution's examination ethics code.
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSubmitModalOpen(false)}
              className="rounded-xl text-xs"
            >
              {t.common.cancel || "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !declaredHonorCode}
              className="bg-[#0d5c4d] hover:bg-[#0a463b] text-white gap-2 font-bold rounded-xl text-xs px-5 shadow-sm"
            >
              <Send className={`h-3.5 w-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
              <span>{isSubmitting ? "Submitting Work..." : "Submit to Instructor"}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
