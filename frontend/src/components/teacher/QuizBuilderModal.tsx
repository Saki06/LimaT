"use client";

import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  AlertCircle,
  Layers,
  Save,
  Check,
  RotateCcw,
  Copy
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course, Quiz, QuizQuestion } from "@/types/lms";

interface QuizBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizToEdit?: Quiz | null;
  courses: Course[];
  onSave: (quizData: Partial<Quiz>) => void;
}

const DEFAULT_NEW_QUESTION: QuizQuestion = {
  id: "q_new_1",
  questionText: "",
  type: "mcq",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
  marks: 10
};

export function QuizBuilderModal({
  isOpen,
  onClose,
  quizToEdit,
  courses,
  onSave
}: QuizBuilderModalProps) {
  const isEditing = Boolean(quizToEdit);

  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [subjectName, setSubjectName] = useState("Combined Mathematics");
  const [instructions, setInstructions] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [dueDate, setDueDate] = useState("2026-11-15 23:59");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { ...DEFAULT_NEW_QUESTION, id: `q_${Date.now()}_1` }
  ]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Populate form if editing
  useEffect(() => {
    if (quizToEdit) {
      setTitle(quizToEdit.title);
      setCourseId(quizToEdit.courseId);
      setSubjectName(quizToEdit.subjectName);
      setInstructions(quizToEdit.instructions);
      setDurationMinutes(quizToEdit.durationMinutes);
      setDueDate(quizToEdit.dueDate);
      setStatus(quizToEdit.status);
      setQuestions(
        quizToEdit.questions.length > 0
          ? quizToEdit.questions.map((q) => ({
              ...q,
              options: q.options || ["", "", "", ""]
            }))
          : [{ ...DEFAULT_NEW_QUESTION, id: `q_${Date.now()}_1` }]
      );
      setActiveQuestionIdx(0);
    } else {
      // Defaults for new quiz
      setTitle("");
      setCourseId(courses[0]?.id || "");
      setSubjectName(courses[0]?.title || "");
      setInstructions("All questions are mandatory. Please read each question carefully.");
      setDurationMinutes(15);
      setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
      setStatus("published");
      setQuestions([
        { ...DEFAULT_NEW_QUESTION, id: `q_${Date.now()}_1` }
      ]);
      setActiveQuestionIdx(0);
    }
    setErrorMsg(null);
  }, [quizToEdit, isOpen, courses]);

  const totalCalculatedMarks = questions.reduce(
    (sum, q) => sum + (Number(q.marks) || 10),
    0
  );

  // Update question field
  const handleUpdateCurrentQuestion = (field: keyof QuizQuestion, value: any) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== activeQuestionIdx) return q;
        return { ...q, [field]: value };
      })
    );
  };

  // Update specific option text
  const handleOptionChange = (optionIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== activeQuestionIdx) return q;
        const newOptions = [...(q.options || ["", "", "", ""])];
        newOptions[optionIdx] = val;
        return { ...q, options: newOptions };
      })
    );
  };

  // Add new question
  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q_${Date.now()}_${questions.length + 1}`,
      questionText: "",
      type: "mcq",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      explanation: "",
      marks: 10
    };
    setQuestions((prev) => [...prev, newQ]);
    setActiveQuestionIdx(questions.length);
  };

  // Duplicate current question
  const handleDuplicateQuestion = () => {
    const currentQ = questions[activeQuestionIdx];
    if (!currentQ) return;
    const duplicated: QuizQuestion = {
      ...currentQ,
      id: `q_${Date.now()}_dup`,
      questionText: `${currentQ.questionText} (Copy)`
    };
    const newQuestions = [...questions];
    newQuestions.splice(activeQuestionIdx + 1, 0, duplicated);
    setQuestions(newQuestions);
    setActiveQuestionIdx(activeQuestionIdx + 1);
  };

  // Remove question
  const handleRemoveQuestion = (idxToRemove: number) => {
    if (questions.length <= 1) {
      setErrorMsg("A quiz must have at least one question.");
      return;
    }
    const newQuestions = questions.filter((_, idx) => idx !== idxToRemove);
    setQuestions(newQuestions);
    if (activeQuestionIdx >= newQuestions.length) {
      setActiveQuestionIdx(Math.max(0, newQuestions.length - 1));
    }
  };

  // Load Math Template with all 5 question types
  const handleLoadMathTemplate = () => {
    setTitle("Combined Mathematics & Science: Comprehensive Diagnostic");
    setDurationMinutes(25);
    setQuestions([
      {
        id: `q_${Date.now()}_1`,
        questionText: "What is the derivative of f(x) = sin(2x) with respect to x?",
        type: "mcq",
        options: ["2 cos(2x)", "cos(2x)", "-2 cos(2x)", "2 sin(x) cos(x)"],
        correctAnswer: 0,
        explanation: "By chain rule: d/dx[sin(2x)] = cos(2x) * 2 = 2 cos(2x).",
        marks: 10
      },
      {
        id: `q_${Date.now()}_2`,
        questionText: "Which of the following functions are strictly increasing for all positive real numbers x > 0? (Select all that apply)",
        type: "multi_select",
        options: ["f(x) = eˣ", "f(x) = x³", "f(x) = 1/x", "f(x) = ln(x)"],
        correctAnswer: [0, 1, 3],
        explanation: "eˣ, x³, and ln(x) have strictly positive first derivatives for x > 0. Meanwhile, d/dx[1/x] = -1/x² < 0 (decreasing).",
        marks: 10
      },
      {
        id: `q_${Date.now()}_3`,
        questionText: "A square matrix A is invertible if and only if its determinant det(A) ≠ 0.",
        type: "true_false",
        options: ["True", "False"],
        correctAnswer: 0,
        explanation: "By the Invertible Matrix Theorem, a matrix has an inverse if and only if its determinant is non-zero.",
        marks: 10
      },
      {
        id: `q_${Date.now()}_4`,
        questionText: "What geometric curve is defined as the locus of all points in a plane equidistant from a fixed focus and a directrix line?",
        type: "short_answer",
        correctAnswer: "parabola",
        explanation: "By definition, a parabola has eccentricity e = 1, meaning distance to focus equals distance to directrix.",
        marks: 10
      },
      {
        id: `q_${Date.now()}_5`,
        questionText: "Calculate the exact value of 5! (5 factorial).",
        type: "numerical",
        correctAnswer: "120",
        explanation: "5! = 5 × 4 × 3 × 2 × 1 = 120.",
        marks: 10
      }
    ]);
    setActiveQuestionIdx(0);
  };

  // Form submit validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Please enter a Quiz Title.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setErrorMsg(`Question ${i + 1} has an empty question statement.`);
        setActiveQuestionIdx(i);
        return;
      }
      if (q.type === "mcq" || q.type === "multi_select") {
        const emptyOpt = q.options?.some((opt) => !opt.trim());
        if (emptyOpt) {
          setErrorMsg(`Question ${i + 1} has empty choice options. Please fill all options.`);
          setActiveQuestionIdx(i);
          return;
        }
        if (q.type === "multi_select" && (!Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0)) {
          setErrorMsg(`Question ${i + 1} must have at least one correct choice checked.`);
          setActiveQuestionIdx(i);
          return;
        }
      } else if (q.type === "short_answer" || q.type === "numerical") {
        if (!String(q.correctAnswer || "").trim()) {
          setErrorMsg(`Question ${i + 1} requires an expected correct answer key.`);
          setActiveQuestionIdx(i);
          return;
        }
      }
    }

    const payload: Partial<Quiz> = {
      title: title.trim(),
      courseId: courseId || courses[0]?.id || "",
      subjectName: subjectName || courses.find((c) => c.id === courseId)?.title || "General",
      instructions: instructions.trim() || "Follow exam instructions.",
      durationMinutes: Number(durationMinutes) || 15,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: status,
      totalQuestions: questions.length,
      totalMarks: totalCalculatedMarks,
      questions: questions.map((q, idx) => ({
        ...q,
        id: q.id || `q_${Date.now()}_${idx + 1}`,
        marks: Number(q.marks) || 10
      }))
    };

    onSave(payload);
    onClose();
  };

  const currentQ = questions[activeQuestionIdx] || questions[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#ecf8f5] text-[#0d5c4d]">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#0d2b26]">
              {isEditing ? "Edit MCQ Quiz & Questions" : "Interactive MCQ Quiz Builder"}
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Construct timed online exams with instant automated evaluation & answer rationale.
            </p>
          </div>
        </div>
      }
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Banner */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Live Metrics Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#f8faf9] border border-[#e6ece8]">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="success" className="text-xs font-bold gap-1 px-3 py-1">
              <HelpCircle className="h-3.5 w-3.5" />
              {questions.length} {questions.length === 1 ? "Question" : "Questions"}
            </Badge>
            <Badge variant="outline" className="text-xs font-bold font-mono px-3 py-1 bg-white">
              🏆 {totalCalculatedMarks} Total Marks
            </Badge>
            <Badge variant="warning" className="text-xs font-bold gap-1 px-3 py-1">
              <Clock className="h-3.5 w-3.5" />
              {durationMinutes} Minutes Limit
            </Badge>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadMathTemplate}
            className="text-xs font-bold border-[#c4e9e0] text-[#0d5c4d] hover:bg-[#ecf8f5] cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1 text-[#0d5c4d]" />
            Load Math MCQ Sample
          </Button>
        </div>

        {/* SECTION 1: QUIZ METADATA */}
        <div className="p-4 rounded-2xl bg-white border border-[#e6ece8] space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Quiz Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Speed Quiz: Quadratic Discriminant & Root Theorems"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Course / Subject</label>
              <select
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  const found = courses.find((c) => c.id === e.target.value);
                  if (found) setSubjectName(found.title);
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] bg-white text-slate-800 font-semibold"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#0d5c4d]" /> Time Limit (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] font-mono text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Submission Due Date</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] font-mono text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] bg-white text-slate-800 font-semibold"
              >
                <option value="published">🟢 Published (Live for Students)</option>
                <option value="draft">🟡 Draft (Hidden from Students)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Exam Instructions & Rules</label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. 15-minute speed evaluation. 3 Questions covering Δ rules and real-valued polynomials."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] text-slate-800"
            />
          </div>
        </div>

        {/* SECTION 2: QUESTIONS BUILDER TABS */}
        <div className="p-4 rounded-2xl bg-white border border-[#e6ece8] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {questions.map((q, idx) => (
                <button
                  key={q.id || idx}
                  type="button"
                  onClick={() => setActiveQuestionIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeQuestionIdx === idx
                      ? "bg-[#0d5c4d] text-white shadow-xs"
                      : "bg-[#f8faf9] text-slate-600 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  <span>Q{idx + 1}</span>
                  <span className="text-[10px] opacity-80">({q.marks}m)</span>
                </button>
              ))}
            </div>

            <Button
              type="button"
              size="sm"
              onClick={handleAddQuestion}
              className="bg-[#ecf8f5] text-[#0d5c4d] hover:bg-[#d6f2eb] border border-[#c4e9e0] font-bold text-xs gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Question
            </Button>
          </div>

          {/* ACTIVE QUESTION EDITOR CARD */}
          {currentQ && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#0d5c4d] bg-[#ecf8f5] px-2.5 py-1 rounded-full">
                    Question {activeQuestionIdx + 1} of {questions.length}
                  </span>

                  {/* Question Type */}
                  <select
                    value={currentQ.type}
                    onChange={(e) => {
                      const nextType = e.target.value as any;
                      handleUpdateCurrentQuestion("type", nextType);
                      if (nextType === "true_false") {
                        handleUpdateCurrentQuestion("options", ["True", "False"]);
                        handleUpdateCurrentQuestion("correctAnswer", 0);
                      } else if (nextType === "multi_select") {
                        handleUpdateCurrentQuestion(
                          "options",
                          currentQ.options && currentQ.options.length >= 2
                            ? currentQ.options
                            : ["Option A", "Option B", "Option C", "Option D"]
                        );
                        handleUpdateCurrentQuestion("correctAnswer", [0]);
                      } else if (nextType === "short_answer") {
                        handleUpdateCurrentQuestion("options", undefined);
                        handleUpdateCurrentQuestion("correctAnswer", "quadratic");
                      } else if (nextType === "numerical") {
                        handleUpdateCurrentQuestion("options", undefined);
                        handleUpdateCurrentQuestion("correctAnswer", "10");
                      } else {
                        handleUpdateCurrentQuestion(
                          "options",
                          currentQ.options && currentQ.options.length >= 2
                            ? currentQ.options
                            : ["Option A", "Option B", "Option C", "Option D"]
                        );
                        handleUpdateCurrentQuestion("correctAnswer", 0);
                      }
                    }}
                    className="text-xs font-semibold p-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="mcq">🔘 Multiple Choice (Single Correct)</option>
                    <option value="multi_select">☑️ Multiple Select (Checkboxes - Multi-Correct)</option>
                    <option value="true_false">⚖️ True / False</option>
                    <option value="short_answer">✍️ Short Answer / Fill in Blank</option>
                    <option value="numerical">🔢 Numerical Value</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <span>Marks:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={currentQ.marks}
                      onChange={(e) =>
                        handleUpdateCurrentQuestion("marks", Math.max(1, Number(e.target.value)))
                      }
                      className="w-16 text-xs p-1 rounded-lg border border-slate-300 text-center font-mono"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicateQuestion}
                    className="text-xs text-slate-600 hover:text-slate-900 border-slate-300 h-7 px-2"
                    title="Duplicate Question"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(activeQuestionIdx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Question Statement <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={currentQ.questionText}
                  onChange={(e) => handleUpdateCurrentQuestion("questionText", e.target.value)}
                  placeholder="Enter the mathematical or conceptual question here..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] font-semibold text-slate-800"
                />
              </div>

              {/* Options & Correct Answer Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>
                    {currentQ.type === "mcq"
                      ? "Answer Choices (Select radio button for the single correct answer)"
                      : currentQ.type === "multi_select"
                      ? "Answer Choices (Check all options that are correct)"
                      : currentQ.type === "true_false"
                      ? "Designate Correct Answer"
                      : currentQ.type === "short_answer"
                      ? "Expected Answer Key (Text / Term)"
                      : "Expected Numeric Value"}
                  </span>
                  <span className="text-[11px] font-normal text-emerald-700">
                    ✓ Evaluated automatically upon student submission
                  </span>
                </div>

                <div className="space-y-2">
                  {/* TYPE 1: MCQ (Single Answer) */}
                  {currentQ.type === "mcq" && (
                    <div className="space-y-2">
                      {currentQ.options?.map((opt, optIdx) => {
                        const isCorrect = Number(currentQ.correctAnswer) === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                              isCorrect
                                ? "bg-[#ecf8f5] border-[#0d5c4d] shadow-2xs"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <label className="cursor-pointer flex items-center gap-2 shrink-0">
                              <input
                                type="radio"
                                name={`correct_answer_${currentQ.id}`}
                                checked={isCorrect}
                                onChange={() => handleUpdateCurrentQuestion("correctAnswer", optIdx)}
                                className="h-4 w-4 text-[#0d5c4d] focus:ring-[#0d5c4d] cursor-pointer"
                              />
                              <span
                                className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                                  isCorrect
                                    ? "bg-[#0d5c4d] text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                            </label>

                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)} choice...`}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0d5c4d] bg-white font-medium text-slate-800"
                            />

                            {isCorrect && (
                              <span className="text-[11px] font-bold text-[#0d5c4d] shrink-0 flex items-center gap-1 pr-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TYPE 2: Multi-Select (Checkboxes) */}
                  {currentQ.type === "multi_select" && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-500 italic">
                        Students must check all correct options to receive credit.
                      </p>
                      {currentQ.options?.map((opt, optIdx) => {
                        const correctIndices = Array.isArray(currentQ.correctAnswer)
                          ? currentQ.correctAnswer.map(Number)
                          : [Number(currentQ.correctAnswer)];
                        const isChecked = correctIndices.includes(optIdx);

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                              isChecked
                                ? "bg-[#ecf8f5] border-[#0d5c4d] shadow-2xs"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <label className="cursor-pointer flex items-center gap-2 shrink-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  let nextArr: number[];
                                  if (e.target.checked) {
                                    nextArr = [...correctIndices, optIdx];
                                  } else {
                                    nextArr = correctIndices.filter((idx) => idx !== optIdx);
                                  }
                                  handleUpdateCurrentQuestion("correctAnswer", nextArr);
                                }}
                                className="h-4 w-4 rounded text-[#0d5c4d] focus:ring-[#0d5c4d] cursor-pointer"
                              />
                              <span
                                className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                                  isChecked
                                    ? "bg-[#0d5c4d] text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                            </label>

                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)} choice...`}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0d5c4d] bg-white font-medium text-slate-800"
                            />

                            {isChecked && (
                              <span className="text-[11px] font-bold text-[#0d5c4d] shrink-0 flex items-center gap-1 pr-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Correct Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TYPE 3: True / False */}
                  {currentQ.type === "true_false" && (
                    <div className="grid grid-cols-2 gap-3">
                      {["True", "False"].map((optText, tfIdx) => {
                        const isCorrect = Number(currentQ.correctAnswer) === tfIdx;
                        return (
                          <button
                            key={optText}
                            type="button"
                            onClick={() => handleUpdateCurrentQuestion("correctAnswer", tfIdx)}
                            className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-between cursor-pointer transition-all ${
                              isCorrect
                                ? "bg-[#ecf8f5] border-[#0d5c4d] text-[#0d5c4d] ring-2 ring-[#0d5c4d]"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{optText}</span>
                            {isCorrect && <CheckCircle2 className="h-4 w-4 text-[#0d5c4d]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* TYPE 4: Short Answer / Fill in Blank */}
                  {currentQ.type === "short_answer" && (
                    <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] space-y-2">
                      <p className="text-[11px] text-slate-500">
                        Type the exact keyword or short phrase students must write. Letter casing is ignored during automated grading.
                      </p>
                      <input
                        type="text"
                        value={String(currentQ.correctAnswer || "")}
                        onChange={(e) => handleUpdateCurrentQuestion("correctAnswer", e.target.value)}
                        placeholder="e.g. Parabola, 3i + 4j, Newton"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] font-bold text-slate-800 bg-white"
                      />
                    </div>
                  )}

                  {/* TYPE 5: Numerical Value */}
                  {currentQ.type === "numerical" && (
                    <div className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] space-y-2">
                      <p className="text-[11px] text-slate-500">
                        Enter the numerical number answer (integer or decimal).
                      </p>
                      <input
                        type="text"
                        value={String(currentQ.correctAnswer || "")}
                        onChange={(e) => handleUpdateCurrentQuestion("correctAnswer", e.target.value)}
                        placeholder="e.g. 42, 9.8, -15"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] font-mono font-bold text-slate-800 bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Rationale / Explanation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#0d5c4d]" />
                  Conceptual Explanation & Solution Rationale (Revealed to students after completion)
                </label>
                <textarea
                  rows={2}
                  value={currentQ.explanation || ""}
                  onChange={(e) => handleUpdateCurrentQuestion("explanation", e.target.value)}
                  placeholder="e.g. By Vieta's formulas, sum of roots = -b / a = -(-12) / 3 = 4."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] text-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              {isEditing ? "Save Quiz Changes" : "Publish Quiz to Students"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
