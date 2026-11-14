"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
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
  ExternalLink,
  Plus,
  Package,
  Calendar,
  Sparkles,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Lesson, Course, SyllabusUnit } from "@/types/lms";

export function CourseViews() {
  const {
    selectedCourseId,
    setSelectedCourseId,
    selectedLessonId,
    setSelectedLessonId,
    markLessonComplete,
    currentUser,
    addToast,
    setCurrentView,
    t
  } = useApp();

  const [isInsideSyllabus, setIsInsideSyllabus] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"text" | "slides" | "video" | "pdf">("text");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);
  const [expandedUnitId, setExpandedUnitId] = useState<string>("");

  // Live Backend Courses & Package Subscriptions State
  const [backendCourses, setBackendCourses] = useState<any[]>([]);
  const [studentPackages, setStudentPackages] = useState<any[]>([]);
  const [activeViewTab, setActiveViewTab] = useState<"courses" | "packages">("courses");
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [allCatalogCourses, setAllCatalogCourses] = useState<any[]>([]);
  const [isEnrollingId, setIsEnrollingId] = useState<string | null>(null);

  // Fetch student courses & subscribed packages from backend
  useEffect(() => {
    let isMounted = true;
    const fetchCoursesAndPackages = async () => {
      try {
        const [coursesRes, packagesRes] = await Promise.all([
          api.students.getMyCourses(),
          api.students.getMyPackages(),
        ]);
        if (isMounted) {
          if (coursesRes.success && Array.isArray(coursesRes.data)) {
            setBackendCourses(coursesRes.data);
          }
          if (packagesRes.success && Array.isArray(packagesRes.data)) {
            setStudentPackages(packagesRes.data);
          }
        }
      } catch (err) {
        console.warn("Could not load student courses/packages:", err);
      }
    };
    fetchCoursesAndPackages();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch catalog when opening enrollment modal
  const handleOpenEnrollModal = async () => {
    setIsEnrollModalOpen(true);
    try {
      const res = await api.courses.getAll();
      if (res.success && Array.isArray(res.data)) {
        setAllCatalogCourses(res.data);
      }
    } catch (err) {
      console.warn("Could not load catalog courses:", err);
    }
  };

  const handleEnrollCourse = async (courseId: string) => {
    try {
      setIsEnrollingId(courseId);
      const res = await api.students.enrollCourse(courseId);
      if (res.success) {
        addToast({
          type: "success",
          title: "Course Enrollment",
          message: res.message || "Enrolled successfully in course!",
        });
        // Refresh courses
        const refreshed = await api.students.getMyCourses();
        if (refreshed.success && Array.isArray(refreshed.data)) {
          setBackendCourses(refreshed.data);
        }
        setIsEnrollModalOpen(false);
      } else {
        addToast({
          type: "error",
          title: "Enrollment Failed",
          message: res.message || "Failed to enroll in course",
        });
      }
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Enrollment Error",
        message: err.message || "Error enrolling in course",
      });
    } finally {
      setIsEnrollingId(null);
    }
  };

  const studentGrade = (currentUser as any)?.gradeLevel || currentUser?.grade || "Academic Curriculum";
  const studentSection = (currentUser as any)?.section || currentUser?.class;

  // Convert real enrolled courses from backend to frontend Course format
  const enrolledCourses: Course[] = useMemo(() => {
    if (!Array.isArray(backendCourses)) return [];
    return backendCourses.map((c: any) => {
      const teacherName = c.teacher?.user
        ? `${c.teacher.user.firstName} ${c.teacher.user.lastName || ""}`.trim()
        : "Assigned Tutor";

      let syllabusObj: any = c.syllabus;
      if (typeof syllabusObj === "string") {
        try {
          syllabusObj = JSON.parse(syllabusObj);
        } catch {
          syllabusObj = null;
        }
      }

      const units: SyllabusUnit[] = Array.isArray(syllabusObj?.units)
        ? syllabusObj.units
        : [];

      let totalLessons = 0;
      let completedLessons = 0;
      units.forEach((u) => {
        u.topics?.forEach((t) => {
          totalLessons += t.lessons?.length || 0;
          t.lessons?.forEach((l) => {
            if (currentUser?.id && l.completedByStudentIds?.includes(currentUser.id)) {
              completedLessons += 1;
            }
          });
        });
      });

      return {
        id: c.id,
        subjectId: c.id,
        title: c.title,
        code: c.code,
        teacherId: c.teacher?.userId || c.teacher?.user?.id || c.teacherId || "tutor",
        teacherName,
        gradeName: studentGrade || "Active Batch",
        className: "Online Cohort",
        bannerColor: "#0d5c4d",
        units,
        totalLessons,
        completedLessons,
      };
    });
  }, [backendCourses, currentUser?.id, studentGrade]);

  const currentCourse = enrolledCourses.find((c) => c.id === selectedCourseId) || enrolledCourses[0] || null;

  // Flatten all lessons in order to calculate next and prev navigation
  const allCourseLessons: { lesson: Lesson; unitTitle: string; topicTitle: string }[] = useMemo(() => {
    const list: { lesson: Lesson; unitTitle: string; topicTitle: string }[] = [];
    if (currentCourse && currentCourse.units) {
      currentCourse.units.forEach((unit) => {
        unit.topics?.forEach((topic) => {
          topic.lessons?.forEach((lesson) => {
            list.push({
              lesson,
              unitTitle: unit.title,
              topicTitle: topic.title,
            });
          });
        });
      });
    }
    return list;
  }, [currentCourse]);

  const activeIndex = allCourseLessons.findIndex((item) => item.lesson.id === selectedLessonId);
  const currentItem = activeIndex >= 0 ? allCourseLessons[activeIndex] : (allCourseLessons[0] || null);
  const activeLesson = currentItem?.lesson;
  const activeUnitTitle = currentItem?.unitTitle;
  const activeTopicTitle = currentItem?.topicTitle;

  const prevItem = activeIndex > 0 ? allCourseLessons[activeIndex - 1] : null;
  const nextItem =
    activeIndex >= 0 && activeIndex < allCourseLessons.length - 1
      ? allCourseLessons[activeIndex + 1]
      : null;

  const isCompleted = activeLesson?.completedByStudentIds?.includes(currentUser.id);

  const handleMarkCompleteAndNext = (lessonId: string) => {
    markLessonComplete(lessonId);
    if (nextItem) {
      setSelectedLessonId(nextItem.lesson.id);
    }
  };

  const handleOpenCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    const targetCourse = enrolledCourses.find((c) => c.id === courseId);
    if (targetCourse?.units?.[0]?.topics?.[0]?.lessons?.[0]) {
      setSelectedLessonId(targetCourse.units[0].topics[0].lessons[0].id);
      setExpandedUnitId(targetCourse.units[0].id);
    } else if (targetCourse?.units?.[0]) {
      setSelectedLessonId(null);
      setExpandedUnitId(targetCourse.units[0].id);
    } else {
      setSelectedLessonId(null);
      setExpandedUnitId("");
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

  const totalStreamLessons = enrolledCourses.reduce((acc, c) => acc + c.totalLessons, 0);
  const totalStreamCompleted = enrolledCourses.reduce((acc, c) => acc + c.completedLessons, 0);

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
                <span>{studentGrade}</span>
                {studentSection && (
                  <>
                    <span>•</span>
                    <span>{studentSection}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0d2b26] tracking-tight">
                My Learning &amp; Course Syllabus
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Explore structured syllabus units, topics, and interactive lessons for all your enrolled courses.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                onClick={handleOpenEnrollModal}
                className="bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-extrabold text-xs shadow-xs cursor-pointer rounded-xl h-9 px-4"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Enroll in Course
              </Button>
              <Button
                onClick={() => setCurrentView("connect")}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-2xs cursor-pointer rounded-xl h-9 px-4"
              >
                <Package className="h-3.5 w-3.5 mr-1 text-[#b47a16]" /> Find Tutors
              </Button>
            </div>
          </div>

          {/* Sub-Tabs: Courses vs Packages */}
          <div className="flex items-center gap-2 border-b border-[#e2eae5] pb-2">
            <button
              onClick={() => setActiveViewTab("courses")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeViewTab === "courses"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "text-slate-600 hover:bg-[#ecf8f5]"
                }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Enrolled Courses ({enrolledCourses.length})</span>
            </button>
            <button
              onClick={() => setActiveViewTab("packages")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeViewTab === "packages"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "text-slate-600 hover:bg-[#ecf8f5]"
                }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Tuition Packages ({studentPackages.length})</span>
            </button>
          </div>

          {/* Content Switching based on activeViewTab */}
          {activeViewTab === "courses" ? (
            enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {enrolledCourses.map((course) => {
                  const pct = course.totalLessons > 0 ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0;
                  const totalUnits = course.units.length;
                  let totalTopics = 0;
                  course.units.forEach((u) => {
                    totalTopics += (u.topics?.length || 0);
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
                            <span>{Math.max(0, course.totalLessons - course.completedLessons)} remaining</span>
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
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Lessons</p>
                              <p className="font-bold text-[#0d2b26]">{course.totalLessons} Lessons</p>
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
            ) : (
              <div className="p-12 text-center rounded-3xl border border-dashed border-[#d6ede6] bg-[#fbfdfc] space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-[#0d5c4d] flex items-center justify-center mx-auto">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-base font-extrabold text-[#0d2b26]">No Enrolled Courses Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You are not enrolled in any curriculum courses yet. Browse available courses to enroll, or subscribe to tutor packages.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    onClick={handleOpenEnrollModal}
                    className="bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Enroll in Course
                  </Button>
                  <Button
                    onClick={() => setCurrentView("connect")}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    <Package className="h-4 w-4 mr-1.5 text-[#b47a16]" /> Find Tutors
                  </Button>
                </div>
              </div>
            )
          ) : (
            /* Subscribed Tuition Packages View */
            <div className="space-y-4">
              {studentPackages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {studentPackages.map((sub: any) => {
                    const pkg = sub.package;
                    const teacher = pkg?.teacher?.user;
                    const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "Specialist Tutor";
                    const isExpiringSoon = sub.endDate && new Date(sub.endDate).getTime() - Date.now() < 7 * 86400000;

                    return (
                      <div
                        key={sub.id}
                        className="rounded-3xl border border-[#e2eae5] bg-white hover:border-[#b47a16]/40 transition-all p-6 space-y-4 shadow-xs hover:shadow-md flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-[#b47a16] font-mono font-bold text-xs border border-amber-200">
                              LKR {pkg?.price?.toLocaleString() || "0"} / {pkg?.billingCycle?.toLowerCase() || "monthly"}
                            </span>
                            <Badge
                              variant={sub.status === "ACTIVE" ? "default" : "destructive"}
                              className="text-[10px] font-bold"
                            >
                              {sub.status}
                            </Badge>
                          </div>

                          <div>
                            <h3 className="text-lg font-black text-[#0d2b26]">{pkg?.title}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Tutor: <span className="font-semibold text-slate-800">{teacherName}</span>
                            </p>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {pkg?.description || "Tuition package with interactive live classes, revision notes, and exam discussions."}
                          </p>

                          <div className="p-3 rounded-2xl bg-[#f8faf9] border border-slate-100 space-y-1 text-xs">
                            <div className="flex items-center justify-between text-slate-500">
                              <span>Subscription Started:</span>
                              <span className="font-semibold text-slate-700">
                                {new Date(sub.startDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-500">
                              <span>Valid Until:</span>
                              <span className={`font-semibold ${isExpiringSoon ? "text-rose-600 font-bold" : "text-emerald-700"}`}>
                                {new Date(sub.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => setCurrentView("live_schedule")}
                          className="w-full bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold rounded-xl h-10 shadow-xs cursor-pointer"
                        >
                          <PlayCircle className="h-4 w-4 mr-1.5" /> Go to Live Sessions
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl border border-dashed border-[#d6ede6] bg-[#fbfdfc] space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 text-[#b47a16] flex items-center justify-center mx-auto">
                    <Package className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#0d2b26]">No Active Tuition Packages</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You have not subscribed to any teacher tuition packages yet. Explore leading specialist educators to join live interactive masterclasses.
                  </p>
                  <Button
                    onClick={() => setCurrentView("connect")}
                    className="bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    <Users className="h-4 w-4 mr-1.5" /> Find &amp; Subscribe to Tutors
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Academic Stream Overview Footer */}
          <div className="p-5 rounded-2xl bg-[#f6fbf9] border border-[#c4e9e0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                <strong className="text-[#0d2b26]">Enrolled Curriculum:</strong> {studentGrade}
              </span>
            </div>
            <span className="text-[11px] text-[#0d5c4d] font-bold">
              Total Lessons Across Courses: {totalStreamLessons} Lessons ({totalStreamCompleted} Completed ✓)
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
                <span>{currentCourse?.title || "Course Syllabus"}</span>
                {currentCourse?.code && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] font-mono font-bold">
                    {currentCourse.code}
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500">Instructor: {currentCourse?.teacherName || "Assigned Tutor"}</p>
            </div>

            {/* Quick Switcher between Subjects */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {enrolledCourses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleOpenCourse(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${selectedCourseId === c.id
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
                  {currentCourse?.units?.length || 0} Units
                </span>
              </div>

              {currentCourse && currentCourse.units && currentCourse.units.length > 0 ? (
                <div className="space-y-2">
                  {currentCourse.units.map((unit) => {
                    const isExpanded = expandedUnitId === unit.id;
                    const unitLessonsCount = (unit.topics || []).reduce(
                      (acc, t) => acc + (t.lessons?.length || 0),
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
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#f8faf9] transition-colors cursor-pointer"
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
                            {unit.topics && unit.topics.length > 0 ? (
                              unit.topics.map((topic) => (
                                <div key={topic.id} className="space-y-1 pt-2">
                                  <p className="text-[11px] font-bold text-slate-500 px-2 uppercase tracking-wide">
                                    {topic.title}
                                  </p>
                                  <div className="space-y-1">
                                    {topic.lessons && topic.lessons.length > 0 ? (
                                      topic.lessons.map((lesson) => {
                                        const isSelected = selectedLessonId === lesson.id;
                                        const isDone = lesson.completedByStudentIds?.includes(
                                          currentUser.id
                                        );

                                        return (
                                          <button
                                            key={lesson.id}
                                            onClick={() => setSelectedLessonId(lesson.id)}
                                            className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${isSelected
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
                                      })
                                    ) : (
                                      <p className="text-[11px] text-slate-400 italic px-2 py-1">
                                        No lessons in this topic yet.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-[11px] text-slate-400 italic p-2">
                                No topics in this unit yet.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-dashed border-[#e6ece8]">
                  No syllabus units published by the instructor yet.
                </div>
              )}
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
                            className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
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
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "text"
                            ? "bg-[#0d5c4d] text-white shadow-2xs"
                            : "bg-[#f0f4f1] text-slate-600 hover:bg-[#e4ece6]"
                          }`}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Interactive Theory</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("pdf")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "pdf"
                            ? "bg-[#0d5c4d] text-white shadow-2xs"
                            : "bg-[#f0f4f1] text-slate-600 hover:bg-[#e4ece6]"
                          }`}
                      >
                        <FileUp className="h-3.5 w-3.5" />
                        <span>PDF &amp; Worksheets</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("slides")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "slides"
                            ? "bg-[#0d5c4d] text-white shadow-2xs"
                            : "bg-[#f0f4f1] text-slate-600 hover:bg-[#e4ece6]"
                          }`}
                      >
                        <Presentation className="h-3.5 w-3.5" />
                        <span>Classroom Slides</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("video")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "video"
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
                        {activeLesson.contentBody || activeLesson.description || "Lesson content will appear here."}
                      </div>
                    )}

                    {activeTab === "pdf" && (
                      <div className="rounded-2xl border border-[#c4e9e0] bg-[#f8fbf9] p-6 space-y-4">
                        {activeLesson.attachments && activeLesson.attachments.some((a) => a.type === "PDF" || a.name?.toLowerCase().endsWith(".pdf")) ? (
                          activeLesson.attachments
                            .filter((a) => a.type === "PDF" || a.name?.toLowerCase().endsWith(".pdf"))
                            .map((att, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#e2eae5] shadow-xs"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] flex items-center justify-center text-[#0d5c4d] shrink-0">
                                    <FileUp className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-[#0d2b26]">
                                      {att.name}
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                      Official Handout &bull; {att.size || "PDF Document"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {att.url ? (
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      <span>Download PDF</span>
                                    </a>
                                  ) : (
                                    <span className="text-xs text-slate-400">Attached</span>
                                  )}
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-[#e2eae5]">
                            No PDF handout uploaded for this lesson yet.
                          </div>
                        )}

                        {/* Interactive Reader / Excerpt Container */}
                        <div className="p-6 rounded-xl bg-white border border-[#e2eae5] space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
                            <span className="font-semibold uppercase tracking-wider text-[11px] text-[#0d5c4d]">
                              Lesson Content / Summary
                            </span>
                          </div>
                          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                            {activeLesson.contentBody || activeLesson.description || "Course study notes and worked problems for this lesson."}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "slides" && (
                      <div className="space-y-4">
                        <div className="aspect-video w-full rounded-2xl bg-[#0d2b26] text-white p-8 flex flex-col justify-between shadow-md relative overflow-hidden">
                          <div className="flex items-center justify-between text-xs text-emerald-300">
                            <span className="font-bold tracking-wider uppercase">
                              {currentCourse?.title} • SLIDE {currentSlideIndex} OF {activeLesson.slidesCount || 3}
                            </span>
                            <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                              Official Notes
                            </span>
                          </div>

                          <div className="space-y-3 max-w-xl">
                            <h3 className="text-xl sm:text-2xl font-black text-white">
                              {activeLesson.title}
                            </h3>
                            <p className="text-sm text-emerald-100/90 leading-relaxed whitespace-pre-line line-clamp-4">
                              {activeLesson.description || activeLesson.contentBody || "Lecture slides and essential study notes for this lesson."}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/15 text-xs">
                            <span className="text-emerald-200">
                              Instructor: {currentCourse?.teacherName || "Assigned Tutor"}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                disabled={currentSlideIndex <= 1}
                                onClick={() => setCurrentSlideIndex((prev) => prev - 1)}
                                className="px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white font-bold cursor-pointer"
                              >
                                Prev Slide
                              </button>
                              <button
                                disabled={currentSlideIndex >= (activeLesson.slidesCount || 3)}
                                onClick={() => setCurrentSlideIndex((prev) => prev + 1)}
                                className="px-2.5 py-1 rounded bg-[#f3b738] hover:bg-[#e0a424] disabled:opacity-30 text-slate-950 font-bold cursor-pointer"
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
                        {activeLesson.videoUrl ? (
                          <div className="h-64 rounded-xl bg-[#0d2b26] flex flex-col items-center justify-center relative group overflow-hidden shadow-xs">
                            <a
                              href={activeLesson.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-16 w-16 rounded-full bg-[#f3b738] flex items-center justify-center text-slate-950 shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                            >
                              <PlayCircle className="h-10 w-10 text-slate-950 fill-current" />
                            </a>
                            <span className="absolute bottom-3 left-4 text-xs font-semibold text-white bg-black/60 px-2.5 py-1 rounded-lg">
                              {activeLesson.videoDuration || "Classroom Recording"}
                            </span>
                          </div>
                        ) : (
                          <div className="h-48 rounded-xl bg-[#f0f4f1] border border-dashed border-[#c4e9e0] flex flex-col items-center justify-center text-slate-400 p-6 space-y-2">
                            <PlayCircle className="h-10 w-10 text-slate-300" />
                            <p className="text-xs font-semibold text-slate-600">No Video Recording Available</p>
                            <p className="text-[11px] text-slate-400">The instructor has not uploaded a video recording for this lesson yet.</p>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 bg-white p-3 rounded-xl border border-[#e2eae5]">
                          <span className="font-medium">
                            Instructor: {currentCourse?.teacherName || "Assigned Tutor"}
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
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-slate-500 font-mono font-bold">
                                  {att.size}
                                </span>
                                {att.url && (
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#0d5c4d] hover:text-[#0a473b] p-1"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
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
                          className="text-xs font-bold text-slate-600 hover:text-[#0d5c4d] flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          <span>Previous: {prevItem.lesson.title}</span>
                        </button>
                      ) : <div />}

                      {nextItem && (
                        <button
                          onClick={() => setSelectedLessonId(nextItem.lesson.id)}
                          className="text-xs font-bold text-[#0d5c4d] hover:text-[#083e34] flex items-center gap-1.5 cursor-pointer"
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

      {/* Self-Enroll in Course Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll in Available Courses"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <p className="text-xs text-slate-500">
            Browse through courses offered across your institution and self-enroll to access curriculum lessons, syllabus units, and handouts.
          </p>

          <div className="space-y-3">
            {allCatalogCourses.length > 0 ? (
              allCatalogCourses.map((catalogCourse) => {
                const isAlreadyEnrolled = enrolledCourses.some(
                  (c) => c.id === catalogCourse.id || c.code === catalogCourse.code
                );

                return (
                  <div
                    key={catalogCourse.id}
                    className="p-4 rounded-2xl border border-[#e2eae5] bg-[#fbfdfc] hover:bg-white flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#ecf8f5] text-[#0d5c4d] font-mono font-bold text-[11px] border border-[#c4e9e0]">
                          {catalogCourse.code}
                        </span>
                        <h4 className="text-sm font-black text-[#0d2b26]">{catalogCourse.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        Instructor:{" "}
                        {catalogCourse.teacher?.user
                          ? `${catalogCourse.teacher.user.firstName} ${catalogCourse.teacher.user.lastName}`
                          : "Faculty Member"}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      disabled={isAlreadyEnrolled || isEnrollingId === catalogCourse.id}
                      onClick={() => handleEnrollCourse(catalogCourse.id)}
                      className={`text-xs font-bold rounded-xl h-8.5 px-3.5 shrink-0 ${isAlreadyEnrolled
                          ? "bg-slate-100 text-slate-400 border border-slate-200"
                          : "bg-[#0d5c4d] hover:bg-[#0a473b] text-white cursor-pointer"
                        }`}
                    >
                      {isEnrollingId === catalogCourse.id
                        ? "Enrolling..."
                        : isAlreadyEnrolled
                          ? "Enrolled ✓"
                          : "Enroll Now"}
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Loading available course catalog...
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
