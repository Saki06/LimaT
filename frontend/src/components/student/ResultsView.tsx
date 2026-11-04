"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Award, MessageSquare, TrendingUp, Star, CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export function ResultsView() {
  const { submissions, currentUser, t, setCurrentView } = useApp();

  const [backendResults, setBackendResults] = useState<any[] | null>(null);
  const [backendSummary, setBackendSummary] = useState<{
    totalEvaluated: number;
    averageScore: number;
    distinctionsCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      const res = await api.students.getMyResults();
      if (res?.success && res.data?.results) {
        setBackendResults(res.data.results);
        setBackendSummary(res.data.summary);
      }
    } catch (err) {
      console.warn("Could not load backend student results:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const localSubmissions = submissions.filter(
    (s) => s.studentId === currentUser.id && (s.status === "marked" || s.status === "result_released")
  );

  const totalTasks = backendSummary
    ? backendSummary.totalEvaluated
    : localSubmissions.length;

  const avgScore = backendSummary
    ? `${backendSummary.averageScore}%`
    : localSubmissions.length > 0
    ? `${Math.round(
        localSubmissions.reduce(
          (acc, s) => acc + ((s.marksObtained || 0) / (s.maxMarks || 100)) * 100,
          0
        ) / localSubmissions.length
      )}%`
    : "N/A";

  const getAcademicStanding = (avg: number) => {
    if (avg >= 75) return "Distinction (A)";
    if (avg >= 65) return "Very Good (B)";
    if (avg >= 55) return "Credit (C)";
    if (avg >= 35) return "Ordinary Pass (S)";
    return "Referral (F)";
  };

  const standing = backendSummary
    ? getAcademicStanding(backendSummary.averageScore)
    : "Distinction (A)";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6ece8]">
        <div>
          <h1 className="text-2xl font-black text-[#0d2b26]">{t.nav.results}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review certified teacher evaluations, numerical marks, and personalized written feedback.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setCurrentView("progress")}
          className="text-xs font-bold text-[#0d5c4d] border-[#0d5c4d]/30 hover:bg-[#ecf8f5] shrink-0"
        >
          <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> View Syllabus Progress &amp; Analytics →
        </Button>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#e6ece8] bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Graded Tasks</p>
              <p className="text-2xl font-black text-[#0d2b26] mt-0.5">{totalTasks}</p>
            </div>
          </div>
        </Card>

        <Card className="border-[#e6ece8] bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Average Score</p>
              <p className="text-2xl font-black text-[#0d5c4d] mt-0.5">{avgScore}</p>
            </div>
          </div>
        </Card>

        <Card className="border-[#e6ece8] bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-[#fef7e6] text-[#b47a16] flex items-center justify-center">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Academic Standing</p>
              <p className="text-xl font-black text-[#b47a16] mt-0.5">{standing}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Graded Assignments Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
            Released Coursework Evaluations
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchResults}
            disabled={isLoading}
            className="text-xs text-slate-500 hover:text-[#0d5c4d]"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {backendResults && backendResults.length > 0 ? (
          <div className="space-y-4">
            {backendResults.map((resItem) => (
              <Card key={resItem.id} className="border-[#e6ece8] bg-white shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#e6ece8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Result Released</Badge>
                      <Badge variant="outline" className="font-bold text-[#0d5c4d] border-[#c4e9e0]">
                        Grade: {resItem.grade} ({resItem.designation})
                      </Badge>
                    </div>
                    <h3 className="text-base font-black text-[#0d2b26] mt-2">{resItem.assignmentTitle}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {resItem.subjectName} • Evaluated by {resItem.instructor} • {resItem.markedAt ? new Date(resItem.markedAt).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right">
                    <div>
                      <span className="text-3xl font-black text-[#0d5c4d]">
                        {resItem.marksObtained}
                      </span>
                      <span className="text-sm text-slate-500 font-bold"> / {resItem.maxMarks}</span>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Percentage: {resItem.percentage}%</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  {resItem.teacherFeedback && (
                    <div className="p-4 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] space-y-1.5">
                      <p className="text-xs font-bold text-[#0d5c4d] flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {t.academic.teacherFeedback}:
                      </p>
                      <p className="text-xs text-slate-800 leading-relaxed italic">
                        "{resItem.teacherFeedback}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : localSubmissions.length > 0 ? (
          <div className="space-y-4">
            {localSubmissions.map((sub) => (
              <Card key={sub.id} className="border-[#e6ece8] bg-white shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#e6ece8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <Badge variant="success">Result Released</Badge>
                    <h3 className="text-base font-black text-[#0d2b26] mt-2">{sub.assignmentTitle}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Submitted: {sub.submittedAt}</p>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right">
                    <div>
                      <span className="text-3xl font-black text-[#0d5c4d]">
                        {sub.marksObtained}
                      </span>
                      <span className="text-sm text-slate-500 font-bold"> / {sub.maxMarks}</span>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Total Marks</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase text-slate-500">Your Submitted Work:</p>
                    <p className="text-xs text-slate-700 bg-[#f8faf9] p-4 rounded-xl border border-[#e6ece8] leading-relaxed">
                      {sub.textContent}
                    </p>
                  </div>

                  {sub.teacherFeedback && (
                    <div className="p-4 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] space-y-1.5">
                      <p className="text-xs font-bold text-[#0d5c4d] flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {t.academic.teacherFeedback}:
                      </p>
                      <p className="text-xs text-slate-800 leading-relaxed italic">
                        "{sub.teacherFeedback}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-[#e6ece8] bg-white p-8 text-center">
            <p className="text-sm text-slate-500">No evaluations released yet. Keep completing your homework and assignments!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
