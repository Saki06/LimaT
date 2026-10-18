"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  FileText,
  UploadCloud,
  Clock,
  FileCheck,
  Send,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const submissionSchema = z.object({
  textContent: z.string().min(10, "Please provide an answer with at least 10 characters."),
  fileName: z.string().optional()
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

export function AssignmentViews() {
  const {
    assignments,
    submissions,
    currentUser,
    submitAssignment,
    selectedAssignmentId,
    setSelectedAssignmentId,
    t
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "graded">("all");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("My_Solution_AnswerSheet.pdf");

  const currentAssignment =
    assignments.find((a) => a.id === selectedAssignmentId) || assignments[0];

  const studentSubmission = submissions.find(
    (s) => s.assignmentId === currentAssignment?.id && s.studentId === currentUser.id
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      textContent: studentSubmission?.textContent || "",
      fileName: studentSubmission?.fileAttachmentName || "My_Solution_AnswerSheet.pdf"
    }
  });

  const onSubmit = (data: SubmissionFormData) => {
    if (!currentAssignment) return;
    submitAssignment(currentAssignment.id, data.textContent, selectedFileName);
    setIsSubmitModalOpen(false);
    reset();
  };

  const filteredAssignments = assignments.filter((asg) => {
    const sub = submissions.find(
      (s) => s.assignmentId === asg.id && s.studentId === currentUser.id
    );
    if (activeFilter === "pending") return !sub || sub.status === "not_submitted";
    if (activeFilter === "graded") return sub && sub.status === "result_released";
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6ece8]">
        <div>
          <h1 className="text-2xl font-black text-[#0d2b26]">{t.nav.assignments}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete and upload problem sets, laboratory records, and essay coursework.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-white border border-[#e6ece8] rounded-2xl p-1 shadow-2xs">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "all"
                ? "bg-[#0d5c4d] text-white shadow-xs"
                : "text-slate-600 hover:text-[#0d5c4d]"
            }`}
          >
            All ({assignments.length})
          </button>
          <button
            onClick={() => setActiveFilter("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "pending"
                ? "bg-[#f3b738] text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-[#0d5c4d]"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveFilter("graded")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "graded"
                ? "bg-[#0d5c4d] text-white shadow-xs"
                : "text-slate-600 hover:text-[#0d5c4d]"
            }`}
          >
            Graded
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Assignment List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Coursework Queue ({filteredAssignments.length})
          </p>

          <div className="space-y-2.5">
            {filteredAssignments.map((asg) => {
              const sub = submissions.find(
                (s) => s.assignmentId === asg.id && s.studentId === currentUser.id
              );
              const isSelected = selectedAssignmentId === asg.id;

              let statusVariant: "warning" | "info" | "success" | "destructive" = "warning";
              let statusText = "Pending Submission";

              if (sub) {
                if (sub.status === "result_released") {
                  statusVariant = "success";
                  statusText = `Graded (${sub.marksObtained}/${sub.maxMarks})`;
                } else if (sub.status === "marked") {
                  statusVariant = "info";
                  statusText = "Marked (Pending Release)";
                } else {
                  statusVariant = "info";
                  statusText = "Submitted";
                }
              }

              return (
                <div
                  key={asg.id}
                  onClick={() => setSelectedAssignmentId(asg.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-[#0d5c4d] shadow-md ring-2 ring-[#0d5c4d]/10"
                      : "bg-white border-[#e6ece8] hover:border-[#c4e9e0] shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0d5c4d]">
                      {asg.subjectName}
                    </span>
                    <Badge variant={statusVariant}>{statusText}</Badge>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#0d2b26] mt-2 line-clamp-1">
                    {asg.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2.5 border-t border-[#f0f4f1]">
                    <span>Weight: {asg.maxMarks} Marks</span>
                    <span className="text-[#b47a16] font-mono font-bold">Due: {asg.dueDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Assignment View & Submissions Drawer (7 cols) */}
        <div className="lg:col-span-7">
          {currentAssignment && (
            <Card className="border-[#e6ece8] bg-white shadow-xs overflow-hidden">
              <CardHeader className="p-6 pb-4 border-b border-[#e6ece8]">
                <div className="flex items-center justify-between">
                  <Badge variant="success">
                    {currentAssignment.topicName}
                  </Badge>
                  <span className="text-xs font-bold text-slate-700">
                    Max Marks: {currentAssignment.maxMarks}
                  </span>
                </div>
                <CardTitle className="text-xl font-black text-[#0d2b26] mt-2">
                  {currentAssignment.title}
                </CardTitle>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Clock className="h-3.5 w-3.5 text-[#b47a16]" />
                    Deadline: {currentAssignment.dueDate}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Instructions */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Instructions & Problem Statement
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-[#f8faf9] p-5 rounded-2xl border border-[#e6ece8]">
                    {currentAssignment.instructions}
                  </p>
                </div>

                {/* Teacher attachment if any */}
                {currentAssignment.attachmentName && (
                  <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e6ece8] flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs text-slate-800">
                      <FileText className="h-4 w-4 text-[#0d5c4d]" />
                      <span className="font-bold">{currentAssignment.attachmentName}</span>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-[#0d5c4d] border-[#c4e9e0]">
                      Download Brief
                    </Button>
                  </div>
                )}

                {/* Submission Status Box */}
                {studentSubmission ? (
                  <div className="p-6 rounded-2xl bg-[#f8faf9] border border-[#e6ece8] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-[#0d2b26] flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-[#0d5c4d]" />
                        Your Submitted Response
                      </h4>
                      <Badge
                        variant={
                          studentSubmission.status === "result_released"
                            ? "success"
                            : "info"
                        }
                      >
                        {studentSubmission.status === "result_released"
                          ? "Graded & Released"
                          : "Submitted"}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-4 rounded-xl border border-[#e6ece8] whitespace-pre-wrap leading-relaxed shadow-2xs">
                      {studentSubmission.textContent}
                    </p>

                    {studentSubmission.fileAttachmentName && (
                      <div className="flex items-center gap-2 text-xs text-[#0d5c4d] font-mono font-bold">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{studentSubmission.fileAttachmentName}</span>
                      </div>
                    )}

                    {/* If Results Released: Show Marks + Written Feedback */}
                    {studentSubmission.status === "result_released" && (
                      <div className="mt-4 p-5 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0d5c4d] uppercase tracking-wider">
                            Certified Assessment Score
                          </span>
                          <span className="text-2xl font-black text-[#0d5c4d]">
                            {studentSubmission.marksObtained} / {studentSubmission.maxMarks}
                          </span>
                        </div>
                        {studentSubmission.teacherFeedback && (
                          <div className="pt-2.5 border-t border-[#c4e9e0] text-xs text-[#0d5c4d]">
                            <p className="font-bold flex items-center gap-1.5 mb-1">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Teacher's Written Feedback:
                            </p>
                            <p className="italic text-slate-700">"{studentSubmission.teacherFeedback}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-[#ecf8f5] border border-[#c4e9e0] text-center space-y-3.5">
                    <p className="text-sm text-[#0d2b26] font-bold">
                      You haven't submitted your response for this assignment yet.
                    </p>
                    <Button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="bg-[#0d5c4d] hover:bg-[#083e34] text-white gap-2 font-bold shadow-sm"
                    >
                      <UploadCloud className="h-4 w-4" />
                      {t.academic.submitAssignment}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Submission Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={t.academic.submitAssignment}
        description={currentAssignment?.title}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.academic.writtenAnswer} <span className="text-rose-500">*</span>
            </label>
            <textarea
              {...register("textContent")}
              rows={5}
              placeholder="Type your workings, equations summary, or explanation here..."
              className="w-full p-4 rounded-xl bg-[#f8faf9] border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:bg-white focus:ring-2 focus:ring-[#0d5c4d]/10"
            />
            {errors.textContent && (
              <p className="text-xs text-rose-500 mt-1">{errors.textContent.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.academic.uploadFile} (Simulated Dropzone)
            </label>
            <div className="border-2 border-dashed border-[#c4e9e0] hover:border-[#0d5c4d] rounded-2xl p-6 text-center cursor-pointer bg-[#ecf8f5]/40 transition-colors">
              <UploadCloud className="h-8 w-8 text-[#0d5c4d] mx-auto mb-2" />
              <p className="text-xs text-slate-900 font-bold">
                Selected File: <span className="text-[#0d5c4d]">{selectedFileName}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Supports PDF, DOCX, PNG up to 25MB</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSubmitModalOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white gap-2 font-bold shadow-sm"
            >
              <Send className="h-4 w-4" />
              {t.common.submit}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
