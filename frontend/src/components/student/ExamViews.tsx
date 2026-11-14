"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import {
  GraduationCap,
  Calendar,
  Clock,
  FileText,
  Award,
  Download,
  CheckCircle2,
  ShieldCheck,
  Printer,
  Sparkles,
  UploadCloud,
  Check,
  Send,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExamViews() {
  const { currentUser, t, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<"timetable" | "hall" | "results">("timetable");
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [writtenAnswers, setWrittenAnswers] = useState<Record<string, string>>({});
  const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [isHallTicketModalOpen, setIsHallTicketModalOpen] = useState(false);

  const [backendAssignments, setBackendAssignments] = useState<any[]>([]);
  const [backendResults, setBackendResults] = useState<any[]>([]);
  const [backendSummary, setBackendSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const candidateIndexNo =
    (currentUser as any)?.studentIdNo ||
    (currentUser as any)?.indexNumber ||
    `STU-${(currentUser?.id || "9904").slice(0, 6).toUpperCase()}`;

  const studentGrade =
    (currentUser as any)?.gradeLevel ||
    currentUser?.grade ||
    "Academic Evaluation";

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [asgRes, resRes] = await Promise.all([
          api.assignments.getAll(),
          api.students.getMyResults(),
        ]);
        if (isMounted) {
          if (asgRes?.success && Array.isArray(asgRes.data)) {
            setBackendAssignments(asgRes.data);
          }
          if (resRes?.success && resRes.data) {
            if (Array.isArray(resRes.data.results)) {
              setBackendResults(resRes.data.results);
            }
            if (resRes.data.summary) {
              setBackendSummary(resRes.data.summary);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load exam data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Transform real coursework & assessments into exam schedule items
  const scheduledExams = useMemo(() => {
    return backendAssignments.map((asg) => {
      const formattedDate = asg.dueDate
        ? new Date(asg.dueDate).toLocaleDateString("en-GB", {
            month: "short",
            day: "numeric",
            year: "numeric"
          })
        : "Open Schedule";

      return {
        id: asg.id,
        title: asg.title,
        subject: asg.subjectName || "Subject Assessment",
        grade: studentGrade,
        date: formattedDate,
        time: "Official Session Window",
        durationMinutes: 120,
        hallName: "Apex Exam Portal",
        seatNumber: "Web Proctored Session",
        invigilator: asg.teacherName || "Assigned Faculty",
        totalMarks: asg.maxMarks || 100,
        status: asg.mySubmission ? "completed" : "upcoming",
        instructions: asg.instructions || "Follow standard examination integrity guidelines.",
        attachmentName: asg.attachmentName,
        attachmentUrl: asg.attachmentUrl,
      };
    });
  }, [backendAssignments, studentGrade]);

  const selectedExam = scheduledExams.find((e) => e.id === selectedExamId) || scheduledExams[0] || null;

  const handleDownloadHallTicket = () => {
    addToast({
      type: "success",
      title: "Admission Card Ready",
      message: "Official Examination Hall Pass has been generated."
    });
    setIsHallTicketModalOpen(true);
  };

  const handleDownloadTranscript = () => {
    addToast({
      type: "info",
      title: "Academic Transcript",
      message: "Certified academic transcript ready for download."
    });
  };

  const handleSubmitExam = async () => {
    if (!selectedExam) return;
    if (!isDeclarationChecked) {
      addToast({
        type: "warning",
        title: "Declaration Required",
        message: "Please certify the candidate integrity statement before submitting."
      });
      return;
    }

    setIsExamSubmitted(true);
    const answersText = Object.entries(writtenAnswers)
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join("\n\n");

    try {
      await api.assignments.submit(selectedExam.id, {
        textContent: answersText || "Candidate examination response submitted through online exam hall.",
        fileAttachmentName: `Exam_Script_${selectedExam.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
      });
      addToast({
        type: "success",
        title: "Examination Script Submitted! 🚀",
        message: "Your official answers have been registered and sealed for faculty review."
      });
    } catch (e: any) {
      addToast({
        type: "error",
        title: "Submission Error",
        message: e.message || "Failed to submit examination script."
      });
    }
  };

  // Results calculation
  const evaluatedCount = backendResults.length;
  const averagePercentage = evaluatedCount > 0
    ? backendSummary?.averageScore || Math.round(backendResults.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / evaluatedCount)
    : 0;
  const distinctionsCount = backendResults.filter((r) => r.grade === "A").length;
  const calculatedGPA = evaluatedCount > 0
    ? (averagePercentage / 25).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Candidate Index ID Badge */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2f27] via-[#0d5c4d] to-[#06211b] text-white p-6 sm:p-8 shadow-md">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-6 opacity-10 pointer-events-none">
          <GraduationCap className="h-72 w-72 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#a5f3df]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#f3b738]" />
              <span>Official Examination Board</span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span>{studentGrade}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Formal Examination Center
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Examination schedules, admission passes, live paper submissions, and certified term transcripts with authentic teacher evaluation.
            </p>
          </div>

          {/* Candidate Index Badge Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-emerald-200 text-[11px] uppercase font-bold tracking-wider">
                Candidate Index No
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#f3b738] text-[#0d2b26] text-[10px] font-extrabold">
                VERIFIED
              </span>
            </div>
            <p className="text-lg font-mono font-extrabold text-white tracking-wider">
              {candidateIndexNo}
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-100/90 border-t border-white/10 gap-3">
              <span>{currentUser.name}</span>
              <button
                onClick={handleDownloadHallTicket}
                className="font-bold underline hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3 w-3" />
                <span>Admission Pass</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="mt-8 pt-4 border-t border-white/15 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("timetable")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "timetable"
                ? "bg-white text-[#0d5c4d] shadow-sm"
                : "text-emerald-100 hover:text-white hover:bg-white/10"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Examination Timetable ({scheduledExams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("hall")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "hall"
                ? "bg-white text-[#0d5c4d] shadow-sm"
                : "text-emerald-100 hover:text-white hover:bg-white/10"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Active Examination Hall</span>
          </button>

          <button
            onClick={() => setActiveTab("results")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "results"
                ? "bg-white text-[#0d5c4d] shadow-sm"
                : "text-emerald-100 hover:text-white hover:bg-white/10"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Official Term Transcripts ({evaluatedCount})</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. TIMETABLE TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "timetable" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#0d2b26]">
                Examination Schedule · {studentGrade}
              </h2>
              <p className="text-xs text-slate-500">
                Official dates, session timings, assigned examination halls, and invigilator details.
              </p>
            </div>
            <button
              onClick={handleDownloadHallTicket}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#d6dfd9] text-[#0d5c4d] hover:bg-[#ecf8f5] font-bold text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print Hall Admission Pass</span>
            </button>
          </div>

          {scheduledExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scheduledExams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl border border-[#e6ece8] p-5 shadow-xs hover:shadow-md hover:border-[#c4e9e0] transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] text-[10px] font-bold uppercase tracking-wider">
                        {exam.subject}
                      </span>
                      <h3 className="font-extrabold text-sm text-[#0d2b26] mt-1.5 leading-snug">
                        {exam.title}
                      </h3>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-extrabold text-[11px] border border-amber-200 shrink-0">
                      {exam.durationMinutes / 60} Hours
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#f8faf8] p-3 rounded-xl border border-[#eef3f0]">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400">Date</p>
                        <p className="font-bold">{exam.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400">Time Window</p>
                        <p className="font-bold">{exam.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <ShieldCheck className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400">Venue</p>
                        <p className="font-bold line-clamp-1">{exam.hallName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <GraduationCap className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400">Faculty</p>
                        <p className="font-bold line-clamp-1">{exam.invigilator}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">
                      Weight: <strong className="text-slate-800">{exam.totalMarks} Marks</strong>
                    </span>

                    <button
                      onClick={() => {
                        setSelectedExamId(exam.id);
                        setActiveTab("hall");
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Enter Examination Hall →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl border border-dashed border-[#d6ede6] bg-[#fbfdfc] space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-[#0d5c4d] flex items-center justify-center mx-auto">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#0d2b26]">No Formal Examinations Scheduled</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                There are no upcoming examination sessions scheduled for your cohort at this time. Check back when your course instructors publish upcoming assessments.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. FORMAL EXAMINATION HALL (TAKE EXAM / SUBMIT PAPERS) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "hall" && (
        <div className="space-y-6">
          {selectedExam ? (
            <>
              {/* Active Exam Bar */}
              <div className="bg-white rounded-2xl border border-[#e6ece8] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase">
                      Examination Session
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{selectedExam.subject}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-[#0d2b26] mt-1">{selectedExam.title}</h2>
                  <p className="text-xs text-slate-500">
                    Index: <span className="font-mono font-bold text-[#0d5c4d]">{candidateIndexNo}</span> ·{" "}
                    {selectedExam.hallName} ({selectedExam.seatNumber})
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-[#f0f8f5] border border-[#c4e9e0] rounded-xl px-4 py-2.5 text-[#0d5c4d] shrink-0">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider">Exam Status</p>
                    <p className="text-sm font-bold text-[#0d5c4d]">Authentic Session</p>
                  </div>
                </div>
              </div>

              {/* Instructions & Working Area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white rounded-2xl border border-[#e6ece8] p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-[#0d5c4d]" />
                    Examination Instructions
                  </h3>
                  <div className="p-4 rounded-xl bg-[#f8faf9] border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedExam.instructions}
                  </div>

                  {selectedExam.attachmentName && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <span className="font-medium text-slate-700 truncate max-w-[200px]">{selectedExam.attachmentName}</span>
                      {selectedExam.attachmentUrl && (
                        <a
                          href={selectedExam.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0d5c4d] font-bold hover:underline"
                        >
                          View Brief
                        </a>
                      )}
                    </div>
                  )}

                  {/* Candidate Integrity Checklist */}
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDeclarationChecked}
                        onChange={(e) => setIsDeclarationChecked(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-[#0d5c4d] focus:ring-[#0d5c4d]"
                      />
                      <span className="text-[11px] leading-relaxed">
                        I certify that all answers submitted represent my authentic academic work in accordance with examination ethics.
                      </span>
                    </label>

                    <Button
                      onClick={handleSubmitExam}
                      disabled={isExamSubmitted || !isDeclarationChecked}
                      className="w-full bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      <Send className="h-4 w-4 mr-1.5" />
                      <span>{isExamSubmitted ? "Script Submitted & Sealed ✓" : "Submit Examination Script"}</span>
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-8 bg-white rounded-2xl border border-[#e6ece8] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-[#0d2b26]">Candidate Solution Script</h3>
                    <span className="text-xs text-slate-400 font-mono">Max: {selectedExam.totalMarks} Marks</span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Written Working &amp; Explanations:
                    </label>
                    <textarea
                      rows={10}
                      placeholder="Type your workings, equations summary, step-by-step solutions, or answers here..."
                      value={writtenAnswers["main"] || ""}
                      onChange={(e) => setWrittenAnswers({ ...writtenAnswers, main: e.target.value })}
                      className="w-full p-4 rounded-xl border border-slate-200 text-xs font-mono bg-[#fbfcfb] focus:ring-2 focus:ring-[#0d5c4d]/20 focus:border-[#0d5c4d]"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-[#d6dfd9] p-12 text-center space-y-3">
              <FileText className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-[#0d2b26]">No Examination Paper Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Please select a scheduled paper from the Examination Timetable to enter the hall and begin your submission.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. OFFICIAL TERM RESULTS & CERTIFIED TRANSCRIPTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "results" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#0d2b26]">
                Certified Academic Transcript · {studentGrade}
              </h2>
              <p className="text-xs text-slate-500">
                Official statement of marks, term grades, and certified instructor feedback.
              </p>
            </div>
            {evaluatedCount > 0 && (
              <button
                onClick={handleDownloadTranscript}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Official Transcript (PDF)</span>
              </button>
            )}
          </div>

          {/* Transcript Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-[#e6ece8] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Evaluated Coursework</span>
              <p className="text-2xl font-extrabold text-[#0d5c4d] mt-1 font-mono">
                {evaluatedCount}
              </p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">Official Submissions</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#e6ece8] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Average Percentage</span>
              <p className="text-2xl font-extrabold text-[#0d2b26] mt-1 font-mono">
                {averagePercentage}%
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Overall Academic Performance</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#e6ece8] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Distinctions Count</span>
              <p className="text-2xl font-extrabold text-[#0d2b26] mt-1 font-mono">
                {distinctionsCount}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Grade A Achieved</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#e6ece8] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Evaluation GPA</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1 font-mono">
                {calculatedGPA}
              </p>
              <p className="text-[10px] text-amber-700 font-bold mt-1">
                {averagePercentage >= 75 ? "First Class Standing" : "Passing Standing"}
              </p>
            </div>
          </div>

          {/* Official Grade Table */}
          {evaluatedCount > 0 ? (
            <div className="bg-white rounded-2xl border border-[#e6ece8] shadow-xs overflow-hidden">
              <div className="p-4 bg-[#f8faf8] border-b border-[#e6ece8] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0d2b26]">
                    Official Statement of Results
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Candidate: <span className="font-bold">{currentUser.name}</span> ({candidateIndexNo})
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Verified Academic Record
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fcfdfc] border-b border-[#e6ece8] text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Subject / Coursework</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Official Grade</th>
                      <th className="py-3 px-4">Evaluated Date</th>
                      <th className="py-3 px-4">Examiner Faculty Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6ece8]">
                    {backendResults.map((r, idx) => (
                      <tr key={idx} className="hover:bg-[#fbfcfb]">
                        <td className="py-3 px-4 font-bold text-[#0d2b26]">{r.subjectName || r.assignmentTitle}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {r.marksObtained} / {r.maxMarks} ({r.percentage}%)
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${
                            r.grade === "A" ? "bg-emerald-100 text-emerald-800" :
                            r.grade === "B" ? "bg-blue-100 text-blue-800" :
                            r.grade === "C" ? "bg-amber-100 text-amber-800" :
                            "bg-slate-100 text-slate-800"
                          }`}>
                            Grade {r.grade} ({r.designation || "Pass"})
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                          {r.markedAt ? new Date(r.markedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">{r.teacherFeedback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-[#fbfcfb] border-t border-[#e6ece8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-[#0d5c4d]" />
                  <span className="italic">Certified evaluation record issued by academic registry.</span>
                </div>
                <span className="font-mono text-slate-400 text-[10px]">SEAL OF ACADEMIC REGISTRAR</span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl border border-dashed border-[#d6ede6] bg-[#fbfdfc] space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#0d2b26]">No Certified Results Released Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You do not have any certified examination or coursework results published yet. Once your instructors mark your submitted papers, your official statement of marks will be released here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* HALL TICKET MODAL */}
      {isHallTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="border-b-2 border-[#0d5c4d] pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d5c4d]">
                  Official Examination Admission Card (Hall Ticket)
                </span>
                <h3 className="font-extrabold text-base text-[#0d2b26]">
                  {studentGrade} Evaluation Session
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#ecf8f5] text-[#0d5c4d] font-bold text-xs">
                VERIFIED PASS
              </span>
            </div>

            <div className="bg-[#f8faf8] p-4 rounded-xl border border-[#eef3f0] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate Name:</span>
                <span className="font-bold text-[#0d2b26]">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate Index:</span>
                <span className="font-mono font-bold text-[#0d5c4d]">{candidateIndexNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Examination Center:</span>
                <span className="font-bold text-slate-700">Apex LMS Online Examination Portal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Allocated Mode:</span>
                <span className="font-bold text-slate-700">Web Proctored Assessment</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              Candidate must present this signed admission slip along with the official student identity card at the entry gate or online session check.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsHallTicketModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
