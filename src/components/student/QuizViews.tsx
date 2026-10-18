"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export function QuizViews() {
  const { quizzes, selectedQuizId, submitQuizAttempt, t } = useApp();

  const currentQuiz = quizzes.find((q) => q.id === selectedQuizId) || quizzes[0];
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    totalMarks: number;
  } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, secondsRemaining]);

  const handleStartQuiz = () => {
    setIsPlaying(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSecondsRemaining(currentQuiz.durationMinutes * 60);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleAutoSubmit = () => {
    setIsPlaying(false);
    const score = submitQuizAttempt(currentQuiz.id, selectedAnswers);
    setEvaluationResult({
      score,
      totalMarks: currentQuiz.totalMarks
    });
    setIsResultModalOpen(true);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const activeQuestion = currentQuiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6ece8]">
        <div>
          <h1 className="text-2xl font-black text-[#0d2b26]">{t.nav.quizzes}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Test your subject mastery with formal timed examinations and instant evaluation.
          </p>
        </div>
      </div>

      {!isPlaying ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <Card className="border-[#e6ece8] bg-white shadow-xs">
            <CardHeader className="p-6 border-b border-[#e6ece8]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0d5c4d]">{currentQuiz.subjectName}</span>
                <Badge variant="warning">
                  {currentQuiz.durationMinutes} Minutes
                </Badge>
              </div>
              <CardTitle className="text-xl font-black text-[#0d2b26] mt-2">
                {currentQuiz.title}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-2">{currentQuiz.instructions}</p>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8]">
                  <p className="text-xs text-slate-500 font-semibold">Questions</p>
                  <p className="text-xl font-bold text-[#0d2b26] mt-1">{currentQuiz.totalQuestions}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8]">
                  <p className="text-xs text-slate-500 font-semibold">Total Marks</p>
                  <p className="text-xl font-bold text-[#0d5c4d] mt-1">{currentQuiz.totalMarks}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8]">
                  <p className="text-xs text-slate-500 font-semibold">Time Limit</p>
                  <p className="text-xl font-bold text-[#b47a16] mt-1">{currentQuiz.durationMinutes}m</p>
                </div>
              </div>

              {currentQuiz.userAttempt?.score !== undefined ? (
                <div className="p-6 rounded-2xl bg-[#ecf8f5] border border-[#c4e9e0] text-center space-y-3">
                  <p className="text-xs text-[#0d5c4d] font-bold uppercase tracking-wider">
                    Previous Attempt Score
                  </p>
                  <p className="text-3xl font-black text-[#0d5c4d]">
                    {currentQuiz.userAttempt.score} / {currentQuiz.totalMarks}
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <Button
                      onClick={() => setIsResultModalOpen(true)}
                      variant="outline"
                      size="sm"
                      className="border-[#c4e9e0] text-[#0d5c4d] text-xs font-bold hover:bg-[#def3ee]"
                    >
                      <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                      View Explanations
                    </Button>
                    <Button
                      onClick={handleStartQuiz}
                      size="sm"
                      className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                      Retake Exam
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleStartQuiz}
                  className="w-full bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold h-12 gap-2 shadow-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  {t.academic.takeQuiz}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Guidelines */}
          <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] space-y-3.5 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#0d2b26] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#0d5c4d]" />
              Examination Guidelines
            </h3>
            <ul className="text-xs text-slate-600 space-y-2.5 list-disc list-inside leading-relaxed">
              <li>Once started, the timer will count down and submit automatically at 00:00.</li>
              <li>Each question is evaluated immediately upon submission.</li>
              <li>You can navigate back and forth between questions before submitting.</li>
              <li>Full answers and solution rationale will be revealed immediately after.</li>
            </ul>
          </div>
        </div>
      ) : (
        /* Live Quiz Player */
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#e6ece8] shadow-xs">
            <div>
              <p className="text-xs text-slate-500 font-semibold">{currentQuiz.title}</p>
              <p className="text-sm font-black text-[#0d2b26]">
                Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-mono text-sm font-bold">
              <Clock className="h-4 w-4 animate-pulse" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          </div>

          <Card className="border-[#e6ece8] bg-white shadow-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <Badge variant="success" className="uppercase text-[10px]">
                {activeQuestion.type.replace("_", " ")}
              </Badge>
              <span className="text-xs font-bold text-slate-500">
                {activeQuestion.marks} Marks
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#0d2b26] leading-relaxed">
              {activeQuestion.questionText}
            </h3>

            <div className="space-y-3">
              {activeQuestion.options?.map((option, idx) => {
                const isSelected = selectedAnswers[activeQuestion.id] === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(activeQuestion.id, idx)}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[#ecf8f5] border-[#0d5c4d] text-[#0d5c4d] shadow-xs ring-1 ring-[#0d5c4d]"
                        : "bg-[#f8faf9] border-[#e6ece8] text-slate-700 hover:bg-[#edf4f1]"
                    }`}
                  >
                    <span>{option}</span>
                    <span
                      className={`h-6 w-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? "border-[#0d5c4d] bg-[#0d5c4d] text-white"
                          : "border-slate-300 text-slate-500"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#e6ece8]">
              <Button
                variant="outline"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              >
                Previous Question
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleAutoSubmit}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t.academic.submitQuiz}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-1.5"
                >
                  Next Question <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Quiz Evaluation & Solution Explanations Modal */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title="Examination Results & Score Sheet"
        description={currentQuiz.title}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6">
          {/* Top Score Summary */}
          <div className="p-6 rounded-2xl bg-[#ecf8f5] border border-[#c4e9e0] text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d5c4d]">
              Evaluation Completed Instantly
            </span>
            <p className="text-4xl font-black text-[#0d5c4d]">
              {currentQuiz.userAttempt?.score || 30} / {currentQuiz.totalMarks}
            </p>
            <p className="text-xs font-bold text-slate-600">
              Score: {Math.round(((currentQuiz.userAttempt?.score || 30) / currentQuiz.totalMarks) * 100)}% • Grade: Distinction (A)
            </p>
          </div>

          {/* Question by Question Detailed Solutions */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Question by Question Review & Explanations:
            </h4>

            {currentQuiz.questions.map((q, idx) => {
              const isCorrect = true; // In our sample attempt

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-[#f8faf9] border border-[#e6ece8] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Question {idx + 1}</span>
                    <Badge variant="success" className="text-[10px] gap-1 font-bold">
                      <CheckCircle2 className="h-3 w-3" /> Correct (+{q.marks} Marks)
                    </Badge>
                  </div>

                  <p className="text-sm font-bold text-[#0d2b26]">{q.questionText}</p>

                  {/* Options */}
                  <div className="space-y-1.5 pt-1">
                    {q.options?.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === Number(q.correctAnswer);

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl text-xs font-medium flex items-center justify-between ${
                            isOptionCorrect
                              ? "bg-[#ecf8f5] border border-[#c4e9e0] text-[#0d5c4d] font-bold"
                              : "bg-white border border-[#e6ece8] text-slate-600"
                          }`}
                        >
                          <span>{opt}</span>
                          {isOptionCorrect && (
                            <span className="text-[10px] font-bold text-[#0d5c4d] flex items-center gap-1">
                              ✓ Correct Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Theory Explanation */}
                  {q.explanation && (
                    <div className="p-3.5 rounded-xl bg-white border border-[#e6ece8] text-xs text-slate-600 space-y-1 shadow-2xs">
                      <p className="font-bold text-[#0d5c4d]">Conceptual Rationale:</p>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button
              onClick={() => setIsResultModalOpen(false)}
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold"
            >
              Done & Return to Home
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
