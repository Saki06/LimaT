"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { initialExams, initialExamTermResult } from "@/data/mockData";
import { ExamItem } from "@/types/lms";
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  FileText,
  Award,
  Download,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Printer,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Send,
  UploadCloud,
  Check,
  Flame,
  Info
} from "lucide-react";

export function ExamViews() {
  const { currentUser, t, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<"timetable" | "hall" | "results">("timetable");
  const [selectedExam, setSelectedExam] = useState<ExamItem>(initialExams[0]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [writtenAnswers, setWrittenAnswers] = useState<Record<string, string>>({});
  const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [isHallTicketModalOpen, setIsHallTicketModalOpen] = useState(false);

  const handleDownloadHallTicket = () => {
    addToast({
      type: "success",
      title: "Hall Ticket Downloaded",
      message: "Official Examination Admission Card (PDF) has been saved."
    });
    setIsHallTicketModalOpen(true);
  };

  const handleDownloadTranscript = () => {
    addToast({
      type: "success",
      title: "Transcript Downloaded",
      message: "Certified Academic Transcript with Z-Score downloaded."
    });
  };

  const handleSubmitExam = () => {
    if (!isDeclarationChecked) {
      addToast({
        type: "warning",
        title: "Declaration Required",
        message: "Please certify the candidate integrity statement before submitting."
      });
      return;
    }

    setIsExamSubmitted(true);
    addToast({
      type: "success",
      title: "Examination Script Submitted!",
      message: "Your official answers have been registered and sealed for invigilator review."
    });
  };

  return (
    <div className="space-y-6">
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
              <span>G.C.E. Advanced Level</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Formal Examination Center
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Timetables, official admission cards, structured examination papers (Part A & B),
              and certified term transcripts with Z-Score rankings.
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
              {initialExams[0].candidateIndexNo}
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-100/90 border-t border-white/10 gap-3">
              <span>{currentUser.name}</span>
              <button
                onClick={handleDownloadHallTicket}
                className="font-bold underline hover:text-white flex items-center gap-1"
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "timetable"
                ? "bg-white text-[#0d5c4d] shadow-sm"
                : "text-emerald-100 hover:text-white hover:bg-white/10"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Examination Timetable</span>
          </button>

          <button
            onClick={() => setActiveTab("hall")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "results"
                ? "bg-white text-[#0d5c4d] shadow-sm"
                : "text-emerald-100 hover:text-white hover:bg-white/10"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Official Term Transcripts</span>
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
                Second Term Final Examination Schedule · Grade 12
              </h2>
              <p className="text-xs text-slate-500">
                Official dates, session timings, assigned examination halls, and invigilator details.
              </p>
            </div>
            <button
              onClick={handleDownloadHallTicket}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#d6dfd9] text-[#0d5c4d] hover:bg-[#ecf8f5] font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
            >
              <Printer className="h-4 w-4" />
              <span>Print Hall Admission Pass</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialExams.map((exam) => (
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
                    3 Hours
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
                      <p className="text-[10px] text-slate-400">Time</p>
                      <p className="font-bold">{exam.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Allocated Venue</p>
                      <p className="font-bold line-clamp-1">{exam.hallName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <UserCheck className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Seat Number</p>
                      <p className="font-bold text-[#0d5c4d]">{exam.seatNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#f0f4f1] text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Invigilator: <span className="text-slate-600 font-semibold">{exam.invigilator}</span>
                  </span>

                  <button
                    onClick={() => {
                      setSelectedExam(exam);
                      setActiveTab("hall");
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <span>Open Exam Hall</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. FORMAL EXAMINATION HALL (TAKE EXAM / SIMULATED PAPERS) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "hall" && (
        <div className="space-y-6">
          {/* Active Exam Bar */}
          <div className="bg-white rounded-2xl border border-[#e6ece8] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px] uppercase animate-pulse">
                  Examination Session Active
                </span>
                <span className="text-xs font-semibold text-slate-500">{selectedExam.subject}</span>
              </div>
              <h2 className="text-lg font-extrabold text-[#0d2b26] mt-1">{selectedExam.title}</h2>
              <p className="text-xs text-slate-500">
                Index: <span className="font-mono font-bold text-[#0d5c4d]">{selectedExam.candidateIndexNo}</span> ·{" "}
                {selectedExam.hallName} ({selectedExam.seatNumber})
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-3 bg-[#fbf5e8] border border-[#fae59e] rounded-xl px-4 py-2.5 text-[#92600b] shrink-0">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider">Remaining Time</p>
                <p className="text-lg font-mono font-extrabold text-[#7a4e04]">02:44:18</p>
              </div>
            </div>
          </div>

          {/* Exam Parts & Questions */}
          {selectedExam.parts && selectedExam.parts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Question Navigation Drawer */}
              <div className="bg-white rounded-2xl border border-[#e6ece8] p-5 shadow-xs space-y-4 lg:col-span-1 h-fit">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Examination Paper Navigation
                </h3>

                {selectedExam.parts.map((part, pIdx) => (
                  <div key={pIdx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-1">
                      <span>{part.partName}</span>
                      <span className="text-[#0d5c4d] font-mono">{part.allocatedMarks} M</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {part.questions.map((q, qIdx) => {
                        const isAnswered = Boolean(writtenAnswers[`q_${q.questionNo}`]);
                        const isCurrent = activeQuestionIndex === qIdx;

                        return (
                          <button
                            key={q.questionNo}
                            onClick={() => setActiveQuestionIndex(qIdx)}
                            className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                              isCurrent
                                ? "bg-[#0d5c4d] text-white border-[#0d5c4d] shadow-sm"
                                : isAnswered
                                ? "bg-[#ecf8f5] text-[#0d5c4d] border-[#b2e5d9]"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            Q{q.questionNo}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Candidate Integrity Checklist */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDeclarationChecked}
                      onChange={(e) => setIsDeclarationChecked(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-[#0d5c4d] focus:ring-[#0d5c4d]"
                    />
                    <span className="text-[11px] leading-relaxed">
                      I certify that all answers submitted are my own authentic work in compliance with
                      the examination rules.
                    </span>
                  </label>

                  <button
                    onClick={handleSubmitExam}
                    disabled={isExamSubmitted}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isExamSubmitted ? "Script Submitted & Sealed" : "Submit Examination Script"}</span>
                  </button>
                </div>
              </div>

              {/* Question & Answer Script Area */}
              <div className="bg-white rounded-2xl border border-[#e6ece8] p-6 shadow-xs space-y-5 lg:col-span-2">
                {(() => {
                  const part = selectedExam.parts?.[0];
                  const q = part?.questions?.[activeQuestionIndex];
                  if (!part || !q) return null;

                  return (
                    <>
                      <div className="border-b border-[#eef3f0] pb-3 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#0d5c4d]">
                            {part.partName}
                          </span>
                          <h3 className="font-extrabold text-base text-[#0d2b26] mt-0.5">
                            Question {q.questionNo}: {q.questionTitle}
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-[#ecf8f5] text-[#0d5c4d] font-bold text-xs">
                          {q.marks} Marks
                        </span>
                      </div>

                      <div className="bg-[#f8faf8] p-4 rounded-xl border border-[#eef3f0] text-xs font-mono text-slate-800 leading-relaxed">
                        {q.text}
                      </div>

                      {/* Answer Response Box */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <label className="font-bold text-slate-700">Candidate Working & Solution:</label>
                          <span className="text-slate-400 text-[11px]">Type mathematical steps or formulas</span>
                        </div>
                        <textarea
                          rows={7}
                          placeholder="Provide clear step-by-step derivations, equations, and final answers..."
                          value={writtenAnswers[`q_${q.questionNo}`] || ""}
                          onChange={(e) =>
                            setWrittenAnswers({
                              ...writtenAnswers,
                              [`q_${q.questionNo}`]: e.target.value
                            })
                          }
                          className="w-full p-4 rounded-xl border border-[#d6dfd9] text-xs font-mono bg-[#fbfcfb] focus:ring-2 focus:ring-[#0d5c4d]/20 focus:border-[#0d5c4d]"
                        />
                      </div>

                      {/* Upload Scanned Handwriting Sheet */}
                      <div className="border-2 border-dashed border-[#c4e9e0] bg-[#f6f9f7] rounded-xl p-4 text-center space-y-1">
                        <UploadCloud className="h-5 w-5 text-[#0d5c4d] mx-auto" />
                        <p className="font-bold text-xs text-[#0d2b26]">
                          Attach Handwritten Answer Sheet (Photo / PDF)
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Drag and drop photos of physical graph sheets or written answer pages.
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-[#d6dfd9] p-12 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-[#0d2b26]">Paper Ready for Examination Hall</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Physical examination scripts will be administered inside {selectedExam.hallName}.
                Candidate must bring printed admission card.
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
                Certified Academic Transcript & G.C.E. Advanced Level Evaluation
              </h2>
              <p className="text-xs text-slate-500">
                Official statement of marks, standardized Z-Scores, district rankings, and examiner remarks.
              </p>
            </div>
            <button
              onClick={handleDownloadTranscript}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-md transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Official Transcript (PDF)</span>
            </button>
          </div>

          {/* Transcript KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-[#e6ece8] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Standardized Z-Score</span>
              <p className="text-2xl font-extrabold text-[#0d5c4d] mt-1 font-mono">
                {initialExamTermResult.zScore.toFixed(4)}
              </p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">National Benchmark A/L</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#e6ece8] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">District Merit Rank</span>
              <p className="text-2xl font-extrabold text-[#0d2b26] mt-1 font-mono">
                #{initialExamTermResult.districtRank}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Colombo Educational District</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#e6ece8] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">All-Island Rank</span>
              <p className="text-2xl font-extrabold text-[#0d2b26] mt-1 font-mono">
                #{initialExamTermResult.islandRank}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Physical Science Stream</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#e6ece8] shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Term Evaluation GPA</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1 font-mono">
                {initialExamTermResult.gpa.toFixed(2)}
              </p>
              <p className="text-[10px] text-amber-700 font-bold mt-1">First Class Standing</p>
            </div>
          </div>

          {/* Official Grade Table */}
          <div className="bg-white rounded-2xl border border-[#e6ece8] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#f8faf8] border-b border-[#e6ece8] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#0d2b26]">
                  {initialExamTermResult.termTitle}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Candidate: <span className="font-bold">{initialExamTermResult.candidateName}</span> (
                  {initialExamTermResult.indexNumber})
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Issued: {initialExamTermResult.issuedDate}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fcfdfc] border-b border-[#e6ece8] text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Marks (100)</th>
                    <th className="py-3 px-4">Official Grade</th>
                    <th className="py-3 px-4">Class Rank</th>
                    <th className="py-3 px-4">Examiner Faculty Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6ece8]">
                  {initialExamTermResult.subjects.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-[#fbfcfb]">
                      <td className="py-3 px-4 font-bold text-[#0d2b26]">{sub.subjectName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{sub.marksObtained}%</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                          Grade {sub.grade} (Distinction)
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">Rank #{sub.rankInClass}</td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">{sub.teacherRemark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#fbfcfb] border-t border-[#e6ece8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="h-4 w-4 text-[#0d5c4d]" />
                <span className="italic">{initialExamTermResult.principalRemark}</span>
              </div>
              <span className="font-mono text-slate-400 text-[10px]">SEAL OF ACADEMIC REGISTRAR</span>
            </div>
          </div>
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
                  G.C.E. Advanced Level Term 2 Evaluation
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
                <span className="text-slate-400">Index Number:</span>
                <span className="font-mono font-bold text-[#0d5c4d]">
                  {initialExams[0].candidateIndexNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Examination Center:</span>
                <span className="font-bold text-slate-700">{initialExams[0].hallName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Allocated Seat:</span>
                <span className="font-bold text-slate-700">{initialExams[0].seatNumber}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              Candidate must present this signed admission slip along with the official student identity
              card at the entry gate.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsHallTicketModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs transition-colors"
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
