"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  LocaleCode,
  DeviceViewMode,
  User,
  School,
  GradeLevel,
  SchoolClass,
  TimetableEntry,
  Subject,
  Course,
  SyllabusUnit,
  Topic,
  Lesson,
  Assignment,
  StudentSubmission,
  Quiz,
  Sport,
  SportsTeam,
  Fixture,
  Standing,
  Tournament,
  SchoolEvent,
  Announcement,
  LibraryResource
} from '@/types/lms';
import { Tenant, TenantFeature, TenantType } from '@/types/tenant';
import { INITIAL_TENANTS, TENANT_PRESETS } from '@/data/tenantMockData';
import {
  mockUsers,
  initialSchools,
  initialGrades,
  initialClasses,
  initialSubjects,
  initialCourses,
  initialAssignments,
  initialSubmissions,
  initialQuizzes,
  initialSports,
  initialTeams,
  initialFixtures,
  initialStandings,
  initialTournaments,
  initialEvents,
  initialAnnouncements,
  initialLibraryResources
} from '@/data/mockData';
import { getTranslation } from '@/lib/i18n';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: User;
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  deviceMode: DeviceViewMode;
  setDeviceMode: (mode: DeviceViewMode) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  isLanding: boolean;
  setIsLanding: (isLanding: boolean) => void;
  landingPortal: 'gateway' | 'student' | 'parent' | 'staff';
  setLandingPortal: (portal: 'gateway' | 'student' | 'parent' | 'staff') => void;
  t: ReturnType<typeof getTranslation>;

  // Data Collections
  schools: School[];
  grades: GradeLevel[];
  classes: SchoolClass[];
  timetable: TimetableEntry[];
  subjects: Subject[];
  courses: Course[];
  assignments: Assignment[];
  submissions: StudentSubmission[];
  quizzes: Quiz[];
  sports: Sport[];
  teams: SportsTeam[];
  fixtures: Fixture[];
  standings: Standing[];
  tournaments: Tournament[];
  events: SchoolEvent[];
  announcements: Announcement[];
  libraryResources: LibraryResource[];
  savedResourceIds: string[];

  // Active selections
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  selectedLessonId: string | null;
  setSelectedLessonId: (id: string | null) => void;
  selectedAssignmentId: string | null;
  setSelectedAssignmentId: (id: string | null) => void;
  selectedQuizId: string | null;
  setSelectedQuizId: (id: string | null) => void;

  // Actions
  markLessonComplete: (lessonId: string) => void;
  submitAssignment: (assignmentId: string, text: string, fileName?: string) => void;
  gradeSubmission: (submissionId: string, marks: number, feedback: string, release: boolean) => void;
  submitQuizAttempt: (quizId: string, answers: Record<string, number | string>) => number;
  registerEvent: (eventId: string) => void;
  createTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
  updateTimetableEntry: (id: string, updates: Omit<TimetableEntry, 'id'>) => void;
  deleteTimetableEntry: (id: string) => void;
  updateEvent: (id: string, updates: Partial<Omit<SchoolEvent, 'id'>>) => void;
  recordMatchResult: (fixtureId: string, homeScore: string, awayScore: string, outcome: string) => void;
  createTournament: (tournament: Partial<Tournament>) => void;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;
  createFixture: (fixture: Partial<Fixture>) => void;
  createAssignment: (assignment: Partial<Assignment>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  createUnit: (courseId: string, unitTitle: string) => string;
  updateUnit: (courseId: string, unitId: string, updates: { title?: string; order?: number }) => void;
  createTopic: (courseId: string, unitId: string, topicTitle: string, description?: string) => string;
  updateTopic: (courseId: string, unitId: string, topicId: string, updates: { title?: string; description?: string }) => void;
  deleteUnit: (courseId: string, unitId: string) => void;
  deleteTopic: (courseId: string, unitId: string, topicId: string) => void;
  createLesson: (courseId: string, unitId: string, topicId: string, lesson: Partial<Lesson>) => void;
  updateLesson: (
    courseId: string,
    unitId: string,
    topicId: string,
    lessonId: string,
    updates: Partial<Lesson>,
    newUnitId?: string,
    newTopicId?: string
  ) => void;
  deleteLesson: (courseId: string, unitId: string, topicId: string, lessonId: string) => void;
  createAnnouncement: (announcement: Partial<Announcement>) => void;
  updateAnnouncement: (id: string, updates: Partial<Omit<Announcement, 'id'>>) => void;
  deleteAnnouncement: (id: string) => void;
  createSchool: (school: Partial<School>) => void;
  createClass: (schoolClass: Partial<SchoolClass>) => void;
  createSubject: (subject: Partial<Subject>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  createEvent: (event: Partial<SchoolEvent>) => void;
  toggleSaveResource: (resourceId: string) => void;
  createLibraryResource: (resource: Partial<LibraryResource>) => void;
  updateLibraryResource: (id: string, updates: Partial<LibraryResource>) => void;
  deleteLibraryResource: (id: string) => void;
  recordResourceView: (id: string) => void;
  recordResourceDownload: (id: string) => void;

  // Multi-Tenant SaaS State
  tenants: Tenant[];
  activeTenantId: string;
  activeTenant: Tenant;
  setActiveTenantId: (id: string) => void;
  updateTenantFeature: (tenantId: string, feature: string, enabled: boolean) => void;
  applyTenantPreset: (tenantId: string, presetId: string) => void;
  addTenant: (tenant: Tenant) => void;
  updateTenant: (tenant: Tenant) => void;
  deleteTenant: (tenantId: string) => void;
  isFeatureEnabled: (feature: string) => boolean;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [locale, setLocale] = useState<LocaleCode>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [deviceMode, setDeviceMode] = useState<DeviceViewMode>('responsive');
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isLanding, setIsLanding] = useState<boolean>(true);
  const [landingPortal, setLandingPortal] = useState<'gateway' | 'student' | 'parent' | 'staff'>('gateway');

  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [grades, setGrades] = useState<GradeLevel[]>(initialGrades);
  const [classes, setClasses] = useState<SchoolClass[]>(initialClasses);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(initialSubmissions);
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [sports, setSports] = useState<Sport[]>(initialSports);
  const [teams, setTeams] = useState<SportsTeam[]>(initialTeams);
  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures);
  const [standings, setStandings] = useState<Standing[]>(initialStandings);
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
  const [events, setEvents] = useState<SchoolEvent[]>(initialEvents);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [libraryResources, setLibraryResources] = useState<LibraryResource[]>(initialLibraryResources);
  const [savedResourceIds, setSavedResourceIds] = useState<string[]>(['lib_bk_01', 'lib_tut_01']);

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>('crs_math_12');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>('les_m1_1_1');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>('asg_01');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>('qz_01');

  // Multi-Tenant SaaS State
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [activeTenantId, setActiveTenantId] = useState<string>(INITIAL_TENANTS[0].id);

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  const updateTenantFeature = (tenantId: string, feature: string, enabled: boolean) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          return {
            ...t,
            enabledFeatures: {
              ...t.enabledFeatures,
              [feature]: enabled
            }
          };
        }
        return t;
      })
    );
  };

  const applyTenantPreset = (tenantId: string, presetId: string) => {
    const preset = TENANT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          return {
            ...t,
            type: preset.type,
            enabledFeatures: { ...preset.features }
          };
        }
        return t;
      })
    );
  };

  const addTenant = (tenant: Tenant) => {
    setTenants((prev) => [tenant, ...prev]);
  };

  const updateTenant = (updated: Tenant) => {
    setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteTenant = (tenantId: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== tenantId));
    if (activeTenantId === tenantId && tenants.length > 1) {
      const remaining = tenants.filter((t) => t.id !== tenantId);
      setActiveTenantId(remaining[0].id);
    }
  };

  const isFeatureEnabled = (feature: string): boolean => {
    if (!activeTenant || !activeTenant.enabledFeatures) return true;
    return activeTenant.enabledFeatures[feature] ?? true;
  };

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const t = getTranslation(locale);
  const currentUser = mockUsers[currentRole];

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Switch role reset default views
  useEffect(() => {
    setCurrentView('dashboard');
  }, [currentRole]);

  // Mark lesson as complete
  const markLessonComplete = (lessonId: string) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        let updatedCourse = false;
        const newUnits = course.units.map((unit) => ({
          ...unit,
          topics: unit.topics.map((topic) => ({
            ...topic,
            lessons: topic.lessons.map((lesson) => {
              if (lesson.id === lessonId) {
                updatedCourse = true;
                const completed = lesson.completedByStudentIds.includes(currentUser.id)
                  ? lesson.completedByStudentIds
                  : [...lesson.completedByStudentIds, currentUser.id];
                return { ...lesson, completedByStudentIds: completed };
              }
              return lesson;
            })
          }))
        }));

        if (updatedCourse) {
          return {
            ...course,
            units: newUnits,
            completedLessons: Math.min(course.totalLessons, course.completedLessons + 1)
          };
        }
        return course;
      })
    );
    addToast({
      type: 'success',
      title: t.academic.lessonCompletedNotice,
      message: 'Progress recorded to your academic dashboard.'
    });
  };

  // Student submits assignment
  const submitAssignment = (assignmentId: string, text: string, fileName?: string) => {
    const asg = assignments.find((a) => a.id === assignmentId);
    const existingIndex = submissions.findIndex(
      (s) => s.assignmentId === assignmentId && s.studentId === currentUser.id
    );

    const newSub: StudentSubmission = {
      id: existingIndex >= 0 ? submissions[existingIndex].id : `sub_${Date.now()}`,
      assignmentId,
      assignmentTitle: asg?.title || 'Assignment',
      studentId: currentUser.id,
      studentName: currentUser.name,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'submitted',
      textContent: text,
      fileAttachmentName: fileName || 'Student_Submission.pdf',
      maxMarks: asg?.maxMarks || 100
    };

    if (existingIndex >= 0) {
      setSubmissions((prev) => prev.map((s, idx) => (idx === existingIndex ? newSub : s)));
    } else {
      setSubmissions((prev) => [newSub, ...prev]);
    }

    addToast({
      type: 'success',
      title: 'Assignment Submitted!',
      message: 'Your work has been submitted to your teacher for marking.'
    });
  };

  // Teacher grades submission and releases results
  const gradeSubmission = (
    submissionId: string,
    marks: number,
    feedback: string,
    release: boolean
  ) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            marksObtained: marks,
            teacherFeedback: feedback,
            status: release ? 'result_released' : 'marked',
            markedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
        }
        return sub;
      })
    );

    addToast({
      type: 'success',
      title: release ? t.academic.releaseConfirm : 'Marks Saved as Draft',
      message: release
        ? `Marks (${marks}) released to student.`
        : 'Marks stored. Ready to release.'
    });
  };

  // Student submits quiz attempt
  const submitQuizAttempt = (
    quizId: string,
    answers: Record<string, number | string>
  ) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) return 0;

    let score = 0;
    quiz.questions.forEach((q) => {
      const studentAns = answers[q.id];
      if (studentAns !== undefined && String(studentAns) === String(q.correctAnswer)) {
        score += q.marks;
      }
    });

    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id === quizId) {
          return {
            ...q,
            userAttempt: {
              status: 'result_released',
              score,
              completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          };
        }
        return q;
      })
    );

    addToast({
      type: 'success',
      title: 'Quiz Evaluated Instantly!',
      message: `You scored ${score} / ${quiz.totalMarks} marks.`
    });

    return score;
  };

  // Event RSVP
  const registerEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          const isReg = !evt.isRegisteredByCurrentUser;
          return {
            ...evt,
            isRegisteredByCurrentUser: isReg,
            registeredCount: isReg ? evt.registeredCount + 1 : evt.registeredCount - 1
          };
        }
        return evt;
      })
    );

    addToast({
      type: 'success',
      title: 'Event Registration Updated',
      message: 'Your participation status has been updated in school records.'
    });
  };

  const createTimetableEntry = (entry: Omit<TimetableEntry, 'id'>) => {
    setTimetable((previous) => [...previous, { ...entry, id: `tt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` }]);
    addToast({ type: 'success', title: 'Timetable period added', message: 'The scheduled period has been saved.' });
  };

  const updateTimetableEntry = (id: string, updates: Omit<TimetableEntry, 'id'>) => {
    setTimetable((previous) => previous.map((entry) => entry.id === id ? { ...updates, id } : entry));
    addToast({ type: 'success', title: 'Timetable period updated', message: 'The schedule changes have been saved.' });
  };

  const deleteTimetableEntry = (id: string) => {
    setTimetable((previous) => previous.filter((entry) => entry.id !== id));
    addToast({ type: 'success', title: 'Timetable period removed', message: 'The scheduled period has been deleted.' });
  };

  const updateEvent = (id: string, updates: Partial<Omit<SchoolEvent, 'id'>>) => {
    setEvents((prev) =>
      prev.map((event) => event.id === id ? { ...event, ...updates } : event)
    );
    addToast({ type: 'success', title: 'Event Updated', message: 'Event details saved successfully.' });
  };

  // Sports Match Result
  const recordMatchResult = (
    fixtureId: string,
    homeScore: string,
    awayScore: string,
    outcome: string
  ) => {
    setFixtures((prev) =>
      prev.map((fix) => {
        if (fix.id === fixtureId) {
          return {
            ...fix,
            status: 'completed',
            result: {
              homeScore,
              awayScore,
              outcome,
              recordedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          };
        }
        return fix;
      })
    );

    addToast({
      type: 'success',
      title: 'Match Result Recorded & Published',
      message: 'Standings table has been updated automatically.'
    });
  };

  // Tournament Management
  const createTournament = (tr: Partial<Tournament>) => {
    const newTr: Tournament = {
      id: `tr_${Date.now()}`,
      name: tr.name || 'New Inter-School Championship',
      sportId: tr.sportId || 'sp_cricket',
      sportName: tr.sportName || 'Cricket',
      category: tr.category || 'Under-19 Division 1',
      format: tr.format || 'knockout',
      startDate: tr.startDate || new Date().toISOString().substring(0, 10),
      endDate: tr.endDate || '2026-11-15',
      venue: tr.venue || 'College Main Oval',
      organizer: tr.organizer || 'School Sports Council',
      teamsCount: tr.participatingTeams?.length || tr.teamsCount || 8,
      participatingTeams:
        tr.participatingTeams && tr.participatingTeams.length > 0
          ? tr.participatingTeams
          : [
              'St. Michael High School',
              'Trinity Central College',
              'Royal Academy Colombo',
              'Ananda College'
            ],
      status: tr.status || 'upcoming',
      trophyTitle: tr.trophyTitle || 'Championship Trophy',
      description:
        tr.description ||
        'Official Inter-School tournament administered under national athletic standards.',
      rules:
        tr.rules ||
        'Standard national inter-school federation regulations and safety guidelines apply.',
      currentRound: tr.currentRound || 'Group Stage'
    };

    setTournaments((prev) => [newTr, ...prev]);
    addToast({
      type: 'success',
      title: 'Tournament Created & Published 🏆',
      message: `${newTr.name} is now live with ${newTr.participatingTeams.length} participating squads.`
    });
  };

  const updateTournament = (id: string, updates: Partial<Tournament>) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    addToast({
      type: 'success',
      title: 'Tournament Updated',
      message: 'Tournament specifications and stages have been updated.'
    });
  };

  const deleteTournament = (id: string) => {
    setTournaments((prev) => prev.filter((t) => t.id !== id));
    addToast({
      type: 'warning',
      title: 'Tournament Deleted',
      message: 'Tournament has been removed from records.'
    });
  };

  const createFixture = (fx: Partial<Fixture>) => {
    const newFx: Fixture = {
      id: `fix_${Date.now()}`,
      teamId: fx.teamId || 'tm_cricket_1st',
      sportName: fx.sportName || 'Cricket',
      homeTeam: fx.homeTeam || 'St. Michael High School',
      awayTeam: fx.awayTeam || 'Opponent College',
      date: fx.date || new Date().toISOString().substring(0, 10),
      time: fx.time || '10:00 AM',
      venue: fx.venue || 'College Main Grounds',
      competitionName: fx.competitionName || 'Inter-School Championship',
      status: fx.status || 'scheduled'
    };
    setFixtures((prev) => [newFx, ...prev]);
    addToast({
      type: 'success',
      title: 'Match Fixture Scheduled 📅',
      message: `${newFx.homeTeam} vs ${newFx.awayTeam} scheduled at ${newFx.venue}.`
    });
  };

  const createAssignment = (asg: Partial<Assignment>) => {
    const newAsg: Assignment = {
      id: `asg_${Date.now()}`,
      courseId: asg.courseId || 'crs_math_12',
      subjectName: asg.subjectName || 'Combined Mathematics',
      title: asg.title || 'New Assignment',
      instructions: asg.instructions || 'Follow problem set guidelines.',
      topicName: asg.topicName || 'General Topic',
      maxMarks: asg.maxMarks || 100,
      dueDate: asg.dueDate || '2026-10-15 23:59',
      status: 'published',
      attachmentName: asg.attachmentName,
      submissionsCount: 0,
      pendingReviewCount: 0
    };
    setAssignments((prev) => [newAsg, ...prev]);
    addToast({
      type: 'success',
      title: 'Assignment Created & Published',
      message: 'All enrolled students can now view and submit this assignment.'
    });
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    addToast({
      type: 'success',
      title: 'Assignment Updated!',
      message: 'Assignment details and attachments saved successfully.'
    });
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    addToast({
      type: 'info',
      title: 'Assignment Removed',
      message: 'Assignment deleted successfully.'
    });
  };

  const createSchool = (sch: Partial<School>) => {
    const newSch: School = {
      id: `sch_${Date.now()}`,
      name: sch.name || 'New College',
      code: sch.code || 'COL-001',
      district: sch.district || 'Colombo',
      province: sch.province || 'Western',
      principal: sch.principal || 'Principal',
      studentCount: sch.studentCount || 500,
      teacherCount: sch.teacherCount || 35
    };
    setSchools((prev) => [...prev, newSch]);
    addToast({ type: 'success', title: 'School Registered Successfully!' });
  };

  const createClass = (cls: Partial<SchoolClass>) => {
    const newCls: SchoolClass = {
      id: `cls_${Date.now()}`,
      name: cls.name || 'New Class',
      gradeId: cls.gradeId || 'grd_12',
      gradeName: cls.gradeName || 'Grade 12',
      classTeacherId: 'usr_teacher_01',
      classTeacherName: 'Mr. Samantha Perera',
      studentCount: 35
    };
    setClasses((prev) => [...prev, newCls]);
    addToast({ type: 'success', title: 'Class Created Successfully!' });
  };

  const createSubject = (sub: Partial<Subject>) => {
    const newSub: Subject = {
      id: `sub_${Date.now()}`,
      name: sub.name || 'New Subject',
      code: sub.code || 'SUB-01',
      gradeId: sub.gradeId || 'grd_12',
      gradeName: sub.gradeName || 'Grade 12',
      color: 'from-blue-600 to-indigo-700'
    };
    setSubjects((prev) => [...prev, newSub]);
    addToast({ type: 'success', title: 'Subject Added to Curriculum!' });
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    addToast({ type: 'success', title: 'Subject Details Updated Successfully!' });
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    addToast({ type: 'info', title: 'Subject Removed from Curriculum' });
  };

  const createEvent = (evt: Partial<SchoolEvent>) => {
    const newEvt: SchoolEvent = {
      id: `evt_${Date.now()}`,
      title: evt.title || 'New School Event',
      description: evt.description || 'Event description and activities.',
      date: evt.date || '2026-11-10',
      time: evt.time || '09:00 AM - 02:00 PM',
      venue: evt.venue || 'College Auditorium',
      organizer: evt.organizer || 'Event Committee',
      capacity: evt.capacity || 500,
      registeredCount: 0,
      audience: evt.audience || 'all',
      status: 'published'
    };
    setEvents((prev) => [newEvt, ...prev]);
    addToast({ type: 'success', title: 'Event Created Successfully!' });
  };

  const createUnit = (courseId: string, unitTitle: string): string => {
    const newUnitId = `unt_${Date.now()}`;
    const newTopicId = `top_${Date.now()}`;
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const newUnit: SyllabusUnit = {
          id: newUnitId,
          subjectId: c.subjectId,
          title: unitTitle,
          order: c.units.length + 1,
          topics: [
            {
              id: newTopicId,
              unitId: newUnitId,
              title: 'Topic 1: Overview & Foundation',
              description: '',
              order: 1,
              lessons: []
            }
          ]
        };
        return {
          ...c,
          units: [...c.units, newUnit]
        };
      })
    );
    addToast({
      type: 'success',
      title: 'Unit Added to Syllabus!',
      message: `"${unitTitle}" created successfully.`
    });
    return newUnitId;
  };

  const updateUnit = (courseId: string, unitId: string, updates: { title?: string; order?: number }) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          units: c.units.map((u) => {
            if (u.id !== unitId) return u;
            return {
              ...u,
              ...(updates.title !== undefined ? { title: updates.title } : {}),
              ...(updates.order !== undefined ? { order: updates.order } : {})
            };
          })
        };
      })
    );
    addToast({
      type: 'success',
      title: 'Unit Updated!',
      message: 'Unit details saved successfully.'
    });
  };

  const createTopic = (courseId: string, unitId: string, topicTitle: string, description?: string): string => {
    const newTopicId = `top_${Date.now()}`;
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          units: c.units.map((u) => {
            if (u.id !== unitId) return u;
            const newTopic: Topic = {
              id: newTopicId,
              unitId: u.id,
              title: topicTitle,
              description: description || '',
              order: u.topics.length + 1,
              lessons: []
            };
            return {
              ...u,
              topics: [...u.topics, newTopic]
            };
          })
        };
      })
    );
    addToast({
      type: 'success',
      title: 'Topic Added to Unit!',
      message: `"${topicTitle}" created successfully.`
    });
    return newTopicId;
  };

  const updateTopic = (courseId: string, unitId: string, topicId: string, updates: { title?: string; description?: string }) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          units: c.units.map((u) => {
            if (u.id !== unitId) return u;
            return {
              ...u,
              topics: u.topics.map((t) => {
                if (t.id !== topicId) return t;
                return {
                  ...t,
                  ...(updates.title !== undefined ? { title: updates.title } : {}),
                  ...(updates.description !== undefined ? { description: updates.description } : {})
                };
              })
            };
          })
        };
      })
    );
    addToast({
      type: 'success',
      title: 'Topic Updated!',
      message: 'Topic details saved successfully.'
    });
  };

  const deleteUnit = (courseId: string, unitId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const targetUnit = c.units.find((u) => u.id === unitId);
        let removedLessons = 0;
        targetUnit?.topics.forEach((t) => {
          removedLessons += t.lessons.length;
        });
        return {
          ...c,
          totalLessons: Math.max(0, c.totalLessons - removedLessons),
          units: c.units.filter((u) => u.id !== unitId)
        };
      })
    );
    addToast({
      type: 'info',
      title: 'Unit Removed',
      message: 'Unit deleted from syllabus.'
    });
  };

  const deleteTopic = (courseId: string, unitId: string, topicId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          units: c.units.map((u) => {
            if (u.id !== unitId) return u;
            const targetTopic = u.topics.find((t) => t.id === topicId);
            const removedLessons = targetTopic ? targetTopic.lessons.length : 0;
            return {
              ...u,
              topics: u.topics.filter((t) => t.id !== topicId)
            };
          })
        };
      })
    );
    addToast({
      type: 'info',
      title: 'Topic Removed',
      message: 'Topic deleted from unit.'
    });
  };

  const createLesson = (courseId: string, unitId: string, topicId: string, lesson: Partial<Lesson>) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          totalLessons: c.totalLessons + 1,
          units: c.units.map((u) => {
            if (u.id !== unitId) return u;
            return {
              ...u,
              topics: u.topics.map((t) => {
                if (t.id !== topicId) return t;
                const newLes: Lesson = {
                  id: `les_${Date.now()}`,
                  topicId: t.id,
                  title: lesson.title || 'New Lesson',
                  description: lesson.description || '',
                  order: t.lessons.length + 1,
                  status: lesson.status || 'published',
                  contentType: lesson.contentType || 'rich_text',
                  contentBody: lesson.contentBody || 'Lecture content and study notes.',
                  videoUrl: lesson.videoUrl,
                  slidesCount: lesson.slidesCount || 5,
                  attachments: lesson.attachments || [],
                  completedByStudentIds: []
                };
                return {
                  ...t,
                  lessons: [...t.lessons, newLes]
                };
              })
            };
          })
        };
      })
    );
    addToast({
      type: 'success',
      title: 'Lesson Added to Syllabus!',
      message: 'Lesson is now available to students.'
    });
  };

  const updateLesson = (
    courseId: string,
    unitId: string,
    topicId: string,
    lessonId: string,
    updates: Partial<Lesson>,
    newUnitId?: string,
    newTopicId?: string
  ) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;

        const destUnitId = newUnitId || unitId;
        const destTopicId = newTopicId || topicId;

        // If moving to another unit or topic
        if (destUnitId !== unitId || destTopicId !== topicId) {
          let movingLesson: Lesson | null = null;
          const unitsAfterRemoval = c.units.map((u) => {
            if (u.id !== unitId) return u;
            return {
              ...u,
              topics: u.topics.map((t) => {
                if (t.id !== topicId) return t;
                const found = t.lessons.find((l) => l.id === lessonId);
                if (found) {
                  movingLesson = { ...found, ...updates, topicId: destTopicId };
                }
                return {
                  ...t,
                  lessons: t.lessons.filter((l) => l.id !== lessonId)
                };
              })
            };
          });

          if (!movingLesson) return c;

          return {
            ...c,
            units: unitsAfterRemoval.map((u) => {
              if (u.id !== destUnitId) return u;
              return {
                ...u,
                topics: u.topics.map((t) => {
                  if (t.id !== destTopicId) return t;
                  return {
                    ...t,
                    lessons: [...t.lessons, movingLesson!]
                  };
                })
              };
            })
          };
        }

        // Normal in-place update
        return {
          ...c,
          units: c.units.map((u) => {
            if (u.id !== unitId) return u;
            return {
              ...u,
              topics: u.topics.map((t) => {
                if (t.id !== topicId) return t;
                return {
                  ...t,
                  lessons: t.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l))
                };
              })
            };
          })
        };
      })
    );
    addToast({
      type: 'success',
      title: 'Lesson Updated!',
      message: 'Lesson details saved successfully.'
    });
  };

  const deleteLesson = (courseId: string, unitId: string, topicId: string, lessonId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          totalLessons: Math.max(0, c.totalLessons - 1),
          units: c.units.map((u) => {
            if (u.id !== unitId) return u;
            return {
              ...u,
              topics: u.topics.map((t) => {
                if (t.id !== topicId) return t;
                return {
                  ...t,
                  lessons: t.lessons.filter((l) => l.id !== lessonId)
                };
              })
            };
          })
        };
      })
    );
    addToast({
      type: 'info',
      title: 'Lesson Removed',
      message: 'Lesson deleted from topic.'
    });
  };

  const createAnnouncement = (ann: Partial<Announcement>) => {
    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      title: ann.title || 'Official Announcement',
      message: ann.message || '',
      publishedAt: 'Just now',
      authorName: currentUser.name,
      authorRole: currentUser.role === 'teacher' ? 'Faculty Teacher' : 'Principal',
      targetAudience: ann.targetAudience || 'All Students',
      priority: ann.priority || 'normal'
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    addToast({
      type: 'success',
      title: 'Announcement Published!',
      message: 'Notice has been dispatched to target audience.'
    });
  };

  const updateAnnouncement = (id: string, updates: Partial<Omit<Announcement, 'id'>>) => {
    setAnnouncements((prev) =>
      prev.map((announcement) => announcement.id === id ? { ...announcement, ...updates } : announcement)
    );
    addToast({ type: 'success', title: 'Announcement Updated', message: 'Announcement details saved successfully.' });
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((announcement) => announcement.id !== id));
    addToast({ type: 'success', title: 'Announcement Removed', message: 'Announcement has been removed.' });
  };

  const toggleSaveResource = (id: string) => {
    setSavedResourceIds((prev) => {
      const isSaved = prev.includes(id);
      if (isSaved) {
        addToast({
          type: 'info',
          title: 'Removed from Saved Resources',
          message: 'Item has been removed from your saved shelf.'
        });
        return prev.filter((rId) => rId !== id);
      } else {
        addToast({
          type: 'success',
          title: 'Saved to My Resources!',
          message: 'Item has been bookmarked to your personal library shelf.'
        });
        return [...prev, id];
      }
    });
  };

  const createLibraryResource = (resource: Partial<LibraryResource>) => {
    const isBook = resource.resourceType === 'book';
    const newRes: LibraryResource = {
      id: `lib_${Date.now()}`,
      title: resource.title || 'Untitled Resource',
      resourceType: resource.resourceType || 'tute',
      subject: resource.subject || 'General',
      author: resource.author || currentUser.name,
      description: resource.description || 'Comprehensive learning resource uploaded for student study and curriculum preparation.',
      topic: resource.topic || (isBook ? undefined : 'General Module'),
      category: resource.category || 'Advanced Level',
      coverImage: resource.coverImage || (isBook 
        ? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80'),
      fileType: resource.fileType || 'PDF',
      fileSize: resource.fileSize || '4.2 MB',
      pageCount: resource.pageCount || (isBook ? 120 : 20),
      uploadedDate: new Date().toISOString().split('T')[0],
      status: resource.status || 'published',
      visibility: resource.visibility || 'public',
      allowDownload: resource.allowDownload !== false,
      downloadsCount: 0,
      viewsCount: 1,
      rating: 5.0,
      featured: false,
      tableOfContents: resource.tableOfContents || [
        { title: 'Section 1: Core Fundamentals & Principles', page: 1 },
        { title: 'Section 2: Practical Exercises & Derivations', page: 8 },
        { title: 'Section 3: Model Questions & Review', page: 15 }
      ],
      keyHighlights: resource.keyHighlights || [
        'Curriculum-aligned reference material for academic excellence',
        'Model step-by-step solutions and structured formulas',
        'Verified by certified faculty members'
      ],
      sampleContent: resource.sampleContent || [
        {
          chapterTitle: 'Section 1: Core Fundamentals & Principles',
          pageNumber: 1,
          text: resource.description || 'This educational resource contains core theoretical explanations, verified worked examples, and comprehensive review guidelines designed to reinforce conceptual understanding.'
        }
      ]
    };

    setLibraryResources((prev) => [newRes, ...prev]);
    addToast({
      type: 'success',
      title: newRes.status === 'published' ? 'Resource Published!' : 'Draft Saved!',
      message: `"${newRes.title}" is now added to the ${newRes.resourceType === 'book' ? 'Books' : 'Tutes'} collection.`
    });
  };

  const updateLibraryResource = (id: string, updates: Partial<LibraryResource>) => {
    setLibraryResources((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    addToast({
      type: 'info',
      title: 'Resource Updated',
      message: 'Library resource information was successfully updated.'
    });
  };

  const deleteLibraryResource = (id: string) => {
    const target = libraryResources.find((r) => r.id === id);
    setLibraryResources((prev) => prev.filter((r) => r.id !== id));
    setSavedResourceIds((prev) => prev.filter((rId) => rId !== id));
    addToast({
      type: 'warning',
      title: 'Resource Deleted',
      message: target ? `"${target.title}" was removed from the library.` : 'Resource removed.'
    });
  };

  const recordResourceView = (id: string) => {
    setLibraryResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, viewsCount: r.viewsCount + 1 } : r))
    );
  };

  const recordResourceDownload = (id: string) => {
    const target = libraryResources.find((r) => r.id === id);
    if (!target) return;
    if (!target.allowDownload) {
      addToast({
        type: 'warning',
        title: 'Download Restricted',
        message: 'This resource is protected and can only be read online.'
      });
      return;
    }
    setLibraryResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, downloadsCount: r.downloadsCount + 1 } : r))
    );
    addToast({
      type: 'success',
      title: 'Download Initiated',
      message: `Downloading "${target.title}" (${target.fileSize} · ${target.fileType}).`
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        locale,
        setLocale,
        theme,
        setTheme,
        deviceMode,
        setDeviceMode,
        currentView,
        setCurrentView,
        isLanding,
        setIsLanding,
        landingPortal,
        setLandingPortal,
        t,
        schools,
        grades,
        classes,
        timetable,
        subjects,
        courses,
        assignments,
        submissions,
        quizzes,
        sports,
        teams,
        fixtures,
        standings,
        tournaments,
        events,
        announcements,
        libraryResources,
        savedResourceIds,
        selectedCourseId,
        setSelectedCourseId,
        selectedLessonId,
        setSelectedLessonId,
        selectedAssignmentId,
        setSelectedAssignmentId,
        selectedQuizId,
        setSelectedQuizId,
        markLessonComplete,
        submitAssignment,
        gradeSubmission,
        submitQuizAttempt,
        registerEvent,
        createTimetableEntry,
        updateTimetableEntry,
        deleteTimetableEntry,
        updateEvent,
        recordMatchResult,
        createTournament,
        updateTournament,
        deleteTournament,
        createFixture,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        createUnit,
        updateUnit,
        createTopic,
        updateTopic,
        deleteUnit,
        deleteTopic,
        createLesson,
        updateLesson,
        deleteLesson,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        createSchool,
        createClass,
        createSubject,
        updateSubject,
        deleteSubject,
        createEvent,
        toggleSaveResource,
        createLibraryResource,
        updateLibraryResource,
        deleteLibraryResource,
        recordResourceView,
        recordResourceDownload,
        tenants,
        activeTenantId,
        activeTenant,
        setActiveTenantId,
        updateTenantFeature,
        applyTenantPreset,
        addTenant,
        updateTenant,
        deleteTenant,
        isFeatureEnabled,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
