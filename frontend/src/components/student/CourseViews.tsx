"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  FileText,
  PlayCircle,
  Layers,
  Presentation,
  Check,
  ArrowRight,
  ArrowLeft,
  FileUp,
  Download,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lesson } from "@/types/lms";

export function CourseViews() {
  const {
    courses,
    selectedCourseId,
    setSelectedCourseId,
    selectedLessonId,
    setSelectedLessonId,
    markLessonComplete,
    currentUser,
    t
  } = useApp();

  const [isInsideSyllabus, setIsInsideSyllabus] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"text" | "slides" | "video" | "pdf">("text");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);
  const [expandedUnitId, setExpandedUnitId] = useState<string>("unt_m1");

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Flatten all lessons in order to calculate next and prev navigation
  const allCourseLessons: { lesson: Lesson; unitTitle: string; topicTitle: string }[] = [];
  currentCourse.units.forEach((unit) => {
    unit.topics.forEach((topic) => {
      topic.lessons.forEach((lesson) => {
        allCourseLessons.push({
          lesson,
          unitTitle: unit.title,
          topicTitle: topic.title
        });
      });
    });
  });

  const activeIndex = allCourseLessons.findIndex((item) => item.lesson.id === selectedLessonId);
  const currentItem = activeIndex >= 0 ? allCourseLessons[activeIndex] : allCourseLessons[0];
  const activeLesson = currentItem?.lesson;
  const activeUnitTitle = currentItem?.unitTitle;
  const activeTopicTitle = currentItem?.topicTitle;

  const prevItem = activeIndex > 0 ? allCourseLessons[activeIndex - 1] : null;
  const nextItem =
    activeIndex >= 0 && activeIndex < allCourseLessons.length - 1
      ? allCourseLessons[activeIndex + 1]
      : null;

  const isCompleted = activeLesson?.completedByStudentIds.includes(currentUser.id);

  const handleMarkCompleteAndNext = (lessonId: string) => {
    markLessonComplete(lessonId);
    if (nextItem) {
      setSelectedLessonId(nextItem.lesson.id);
    }
  };

  const handleOpenCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    const targetCourse = courses.find((c) => c.id === courseId);
    if (targetCourse?.units[0]?.topics[0]?.lessons[0]) {
      setSelectedLessonId(targetCourse.units[0].topics[0].lessons[0].id);
      setExpandedUnitId(targetCourse.units[0].id);
    }
    setIsInsideSyllabus(true);
  };

  useEffect(() => {
    if (activeLesson) {
      if (activeLesson.contentType === "pdf") {
        setActiveTab("pdf");
      } else if (activeLesson.contentType === "slides") {
        setActiveTab("slides");
      } else if (activeLesson.contentType === "video") {
        setActiveTab("video");
      } else {
        setActiveTab("text");
      }
      setCurrentSlideIndex(1);
    }
  }, [activeLesson?.id, activeLesson?.contentType]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {!isInsideSyllabus ? (
        /* ================================================================= */
        /* VIEW 1: ENROLLED SUBJECTS & CONTINUE LEARNING OVERVIEW            */
        /* ================================================================= */
        <div className="space-y-6">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6ece8]">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
                <span>G.C.E. Advanced Level</span>
                <span>•</span>
                <span>Physical Science Stream</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0d2b26] tracking-tight">
                My Learning &amp; Course Syllabus
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Select any enrolled subject below to explore its structured syllabus units, topics, and interactive lessons.
              </p>
            </div>

            <span className="px-3.5 py-1.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0] text-xs font-bold self-start sm:self-auto shadow-2xs">
              {courses.length} Active Subjects
            </span>
          </div>

          {/* Subjects Grid (Clean 3-column grid for 6 subjects) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => {
              const pct = Math.round((course.completedLessons / course.totalLessons) * 100);
              const totalUnits = course.units.length;
              let totalTopics = 0;
              course.units.forEach((u) => {
                totalTopics += u.topics.length;
              });

              return (
                <div
                  key={course.id}
                  onClick={() => handleOpenCourse(course.id)}
                  className="rounded-3xl border border-[#e2eae5] bg-white hover:border-[#b2e5d9] transition-all group overflow-hidden shadow-xs hover:shadow-lg flex flex-col justify-between cursor-pointer"
                >
                  <div className="h-2 bg-[#0d5c4d]" />
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-[#ecf8f5] text-[#0d5c4d] font-mono font-bold text-xs border border-[#c4e9e0]">
                        {course.code}
                      </span>
                      <span className="text-xs font-black text-[#0d5c4d]">
                        {pct}% Completed
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-[#0d2b26] group-hover:text-[#0d5c4d] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Instructor: <span className="font-semibold text-slate-700">{course.teacherName}</span>
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="w-full bg-[#eef3f0] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#0d5c4d] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>{course.completedLessons} of {course.totalLessons} lessons finished</span>
                        <span>{course.totalLessons - course.completedLessons} remaining</span>
                      </div>
                    </div>

                    {/* Structure Indicators */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-100 flex items-center gap-2">
                        <Layers className="h-4 w-4 text-[#0d5c4d]" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Syllabus</p>
                          <p className="font-bold text-[#0d2b26]">{totalUnits} Units ({totalTopics} Topics)</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-100 flex items-center gap-2">
                        <Presentation className="h-4 w-4 text-[#0d5c4d]" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Materials</p>
                          <p className="font-bold text-[#0d2b26]">Slides &amp; Video Recordings</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCourse(course.id);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all group-hover:shadow-md cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Open Syllabus Structure</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Academic Stream Overview Footer */}
          <div className="p-5 rounded-2xl bg-[#f6fbf9] border border-[#c4e9e0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                <strong className="text-[#0d2b26]">Curriculum:</strong> Sri Lanka National G.C.E. Advanced Level (2024 - 2026 Examination)
              </span>
            </div>
            <span className="text-[11px] text-[#0d5c4d] font-bold">
              Total Lessons Across Stream: 48 Lessons (19 Completed ✓)
            </span>
          </div>
        </div>
      ) : (
        /* ================================================================= */
        /* VIEW 2: SYLLABUS STRUCTURE & LESSON READER VIEW                   */
        /* ================================================================= */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Breadcrumb Navigation & Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6ece8]">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsInsideSyllabus(false)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0d5c4d] hover:text-[#083e34] transition-colors cursor-pointer group"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>← Back to All Subjects</span>
              </button>
              <h1 className="text-xl sm:text-2xl font-black text-[#0d2b26] mt-1 flex items-center gap-2">
                <span>{currentCourse.title}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] font-mono font-bold">
                  {currentCourse.code}
                </span>
              </h1>
              <p className="text-xs text-slate-500">Instructor: {currentCourse.teacherName} • {currentCourse.className}</p>
            </div>

            {/* Quick Switcher between Subjects */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleOpenCourse(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCourseId === c.id
                      ? "bg-[#0d5c4d] text-white shadow-sm"
                      : "bg-white text-slate-700 hover:text-[#0d5c4d] border border-[#e6ece8] shadow-2xs"
                  }`}
                >
                  {c.code}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid: Left Syllabus Accordion | Right Lesson Reader */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Syllabus Hierarchy (Subject -> Unit -> Topic -> Lesson) (4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-extrabold text-[#0d2b26] flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Syllabus Hierarchy</span>
                </h2>
                <span className="text-xs text-slate-500 font-semibold">
                  {currentCourse.units.length} Units
                </span>
              </div>

              <div className="space-y-2">
                {currentCourse.units.map((unit) => {
                  const isExpanded = expandedUnitId === unit.id;
                  const unitLessonsCount = unit.topics.reduce(
                    (acc, t) => acc + t.lessons.length,
                    0
                  );

                  return (
                    <div
                      key={unit.id}
                      className="rounded-2xl border border-[#e6ece8] bg-white overflow-hidden shadow-2xs transition-all"
                    >
                      <button
                        onClick={() =>
                          setExpandedUnitId((prev) => (prev === unit.id ? "" : unit.id))
                        }
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-[#f8faf9] transition-colors"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-[#0d5c4d] uppercase tracking-wider">
                            Unit {unit.order}
                          </span>
                          <h3 className="text-xs font-extrabold text-[#0d2b26] leading-tight">
                            {unit.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {unitLessonsCount} lessons
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-3 pt-0 space-y-3 border-t border-[#f0f4f1] bg-[#fbfdfc]">
                          {unit.topics.map((topic) => (
                            <div key={topic.id} className="space-y-1 pt-2">
                              <p className="text-[11px] font-bold text-slate-500 px-2 uppercase tracking-wide">
                                {topic.title}
                              </p>
                              <div className="space-y-1">
                                {topic.lessons.map((lesson) => {
                                  const isSelected = selectedLessonId === lesson.id;
                                  const isDone = lesson.completedByStudentIds.includes(
                                    currentUser.id
                                  );

                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() => setSelectedLessonId(lesson.id)}
                                      className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all ${
                                        isSelected
                                          ? "bg-[#ecf8f5] text-[#0d5c4d] shadow-2xs font-bold"
                                          : "text-slate-600 hover:bg-slate-100/70"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 truncate">
                                        {isDone ? (
                                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                        ) : (
                                          <Circle className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                                        )}
                                        <span className="truncate">{lesson.title}</span>
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-normal shrink-0">
                                        {lesson.slidesCount ? `${lesson.slidesCount * 2}m` : "15m"}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Rich Lesson Viewer (8 Cols) */}
            <div className="lg:col-span-8">
              {activeLesson ? (
                <Card className="border-[#e6ece8] bg-white shadow-xs overflow-hidden">
                  <CardHeader className="p-6 border-b border-[#e6ece8] bg-[#fcfdfc]">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                      <span className="text-slate-500 font-medium">
                        {activeUnitTitle} • {activeTopicTitle}
                      </span>
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <Badge variant="success" className="gap-1 text-[11px] font-bold">
                            <Check className="h-3 w-3" /> Completed
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleMarkCompleteAndNext(activeLesson.id)}
                            className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold gap-1.5 shadow-2xs"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Mark as Complete</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    <CardTitle className="text-xl sm:text-2xl font-black text-[#0d2b26] mt-2">
                      {activeLesson.title}
                    </CardTitle>

                    {/* Format Switcher Tabs: Text vs PDF vs Slides vs Video */}
                    <div className="flex items-center gap-2 pt-4 flex-wrap">
                      <button
                        onClick={() => setActiveTab("text")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activeTab === "text"
                            ? "bg-[#0d5c4d] text-white shadow-2xs"
                            : "bg-[#f0f4f1] text-slate-600 hover:bg-[#e4ece6]"
                        }`}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Interactive Theory</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("pdf")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activeTab === "pdf"
                            ? "bg-[#0d5c4d] text-white shadow-2xs"
                            : "bg-[#f0f4f1] text-slate-600 hover:bg-[#e4ece6]"
                        }`}
                      >
                        <FileUp className="h-3.5 w-3.5" />
                        <span>PDF & Worksheets</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("slides")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activeTab === "slides"
                            ? "bg-[#0d5c4d] text-white shadow-2xs"
                            : "bg-[#f0f4f1] text-slate-600 hover:bg-[#e4ece6]"
                        }`}
                      >
                        <Presentation className="h-3.5 w-3.5" />
                        <span>Classroom Slides</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("video")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activeTab === "video"
                            ? "bg-[#0d5c4d] text-white shadow-2xs"
                            : "bg-[#f0f4f1] text-slate-600 hover:bg-[#e4ece6]"
                        }`}
                      >
                        <PlayCircle className="h-3.5 w-3.5" />
                        <span>Video Lecture</span>
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Content View Modes */}
                    {activeTab === "text" && (
                      <div className="prose max-w-none text-slate-700 leading-relaxed text-sm whitespace-pre-line font-sans">
                        {activeLesson.contentBody}
                      </div>
                    )}

                    {activeTab === "pdf" && (
                      <div className="rounded-2xl border border-[#c4e9e0] bg-[#f8fbf9] p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#e2eae5] shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] flex items-center justify-center text-[#0d5c4d] shrink-0">
                              <FileUp className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[#0d2b26]">
                                {activeLesson.title}.pdf
                              </h4>
                              <p className="text-xs text-slate-500">
                                Official Lecture Handout &bull; Verified Syllabus PDF
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                alert(`Downloading official PDF for: ${activeLesson.title}`);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download PDF</span>
                            </button>
                          </div>
                        </div>

                        {/* Interactive Reader / Excerpt Container */}
                        <div className="p-6 rounded-xl bg-white border border-[#e2eae5] space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
                            <span className="font-semibold uppercase tracking-wider text-[11px] text-[#0d5c4d]">
                              Embedded Lesson Notes / Summary
                            </span>
                            <span className="font-mono">Page 1 of Document</span>
                          </div>
                          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                            {activeLesson.contentBody || "Comprehensive syllabus theory, derivation notes, and worked problems attached in the PDF above."}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "slides" && (
                      <div className="space-y-4">
                        <div className="aspect-video w-full rounded-2xl bg-[#0d2b26] text-white p-8 flex flex-col justify-between shadow-md relative overflow-hidden">
                          <div className="flex items-center justify-between text-xs text-emerald-300">
                            <span className="font-bold tracking-wider uppercase">
                              {currentCourse.title} • SLIDE {currentSlideIndex} OF {activeLesson.slidesCount || 5}
                            </span>
                            <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                              Official Notes
                            </span>
                          </div>

                          <div className="space-y-3 max-w-xl">
                            <h3 className="text-2xl font-black text-white">
                              Key Principles: {activeLesson.title}
                            </h3>
                            <p className="text-sm text-emerald-100/90 leading-relaxed">
                              &ldquo;Mastering the fundamental derivations and their step-by-step
                              applications ensures high marks in Part A and Part B of the A/L
                              examination.&rdquo;
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/15 text-xs">
                            <span className="text-emerald-200">
                              Prepared by {currentCourse.teacherName}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                disabled={currentSlideIndex <= 1}
                                onClick={() => setCurrentSlideIndex((prev) => prev - 1)}
                                className="px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white font-bold"
                              >
                                Prev Slide
                              </button>
                              <button
                                disabled={currentSlideIndex >= (activeLesson.slidesCount || 5)}
                                onClick={() => setCurrentSlideIndex((prev) => prev + 1)}
                                className="px-2.5 py-1 rounded bg-[#f3b738] hover:bg-[#e0a424] disabled:opacity-30 text-slate-950 font-bold"
                              >
                                Next Slide
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "video" && (
                      <div className="rounded-2xl border border-[#e6ece8] bg-[#f8faf9] p-6 text-center space-y-4">
                        <div className="h-64 rounded-xl bg-[#0d2b26] flex flex-col items-center justify-center relative group cursor-pointer overflow-hidden shadow-xs">
                          <div className="h-16 w-16 rounded-full bg-[#f3b738] flex items-center justify-center text-slate-950 shadow-lg group-hover:scale-110 transition-transform">
                            <PlayCircle className="h-10 w-10 text-slate-950 fill-current" />
                          </div>
                          <span className="absolute bottom-3 left-4 text-xs font-semibold text-white bg-black/60 px-2.5 py-1 rounded-lg">
                            42:15 • Full HD Classroom Recording
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 bg-white p-3 rounded-xl border border-[#e2eae5]">
                          <span className="font-medium">
                            Video Lecture recorded by {currentCourse.teacherName}
                          </span>
                          {activeLesson.videoUrl && (
                            <a
                              href={activeLesson.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ecf8f5] hover:bg-[#d6f0ea] text-[#0d5c4d] font-bold border border-[#c4e9e0] transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Open Lecture Stream</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#e6ece8] space-y-2">
                        <p className="text-xs font-extrabold text-[#0d2b26] uppercase tracking-wider">
                          Attached Resources &amp; Study Materials:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {activeLesson.attachments.map((att, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf9] border border-[#e6ece8] text-xs"
                            >
                              <div className="flex items-center gap-2 text-slate-800 font-medium">
                                <FileText className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                                <span className="truncate max-w-[200px]">{att.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono font-bold shrink-0">
                                {att.size}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Syllabus Progression Bar */}
                    <div className="flex items-center justify-between pt-6 border-t border-[#e6ece8]">
                      {prevItem ? (
                        <button
                          onClick={() => setSelectedLessonId(prevItem.lesson.id)}
                          className="text-xs font-bold text-slate-600 hover:text-[#0d5c4d] flex items-center gap-1.5"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          <span>Previous: {prevItem.lesson.title}</span>
                        </button>
                      ) : <div />}

                      {nextItem && (
                        <button
                          onClick={() => setSelectedLessonId(nextItem.lesson.id)}
                          className="text-xs font-bold text-[#0d5c4d] hover:text-[#083e34] flex items-center gap-1.5"
                        >
                          <span>Next: {nextItem.lesson.title}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="p-12 text-center text-slate-400 border border-dashed border-[#e6ece8] rounded-2xl bg-white">
                  Select a lesson from the syllabus on the left to begin learning.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
