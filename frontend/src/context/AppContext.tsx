"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  Tournament,
  SchoolEvent,
  Announcement,
  LibraryResource,
  TeacherProfileData
} from '@/types/lms';
import {
  SportsEvent,
  SportsFixtureRecord,
  SportsRegistration,
  SportsStandingRecord,
  SportsTeamRecord,
  SportsTournamentRecord,
} from '@/lib/api';
import {
  ChampionshipSportItem,
  StoredAthleteRegistration,
} from '@/components/sports/sportsRegistrationData';
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
  initialEvents,
  initialAnnouncements,
  initialLibraryResources
} from '@/data/mockData';
import { getTranslation } from '@/lib/i18n';
import { api } from '@/lib/api';
import { mapBackendTenant } from '@/lib/tenantMapper';

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

  // Authentication State & Actions
  authUser: any | null;
  authToken: string | null;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => void;

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
  championshipSports: ChampionshipSportItem[];
  sportsEvents: SportsEvent[];
  sportsRegistrations: SportsRegistration[];
  fetchSportsEvents: () => Promise<void>;
  fetchMySportsRegistrations: () => Promise<void>;
  fetchSportsOperations: () => Promise<void>;
  registerForSport: (input: {
    eventId: string;
    jerseyNumber?: number;
    roleInTeam?: string;
    notes?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  submitChampionshipRegistration: (input: {
    eventIds: string[];
    registrationNumber: string;
    athleteDetails: Record<string, unknown>;
  }) => Promise<{ success: boolean; message?: string }>;
  updateChampionshipRegistrationStatus: (
    registrationNumber: string,
    status: StoredAthleteRegistration['status']
  ) => Promise<void>;
  createChampionshipSport: (sport: Omit<ChampionshipSportItem, 'id' | 'events' | 'registrationStatus'>) => Promise<void>;
  createChampionshipEvent: (
    sportId: string,
    event: Omit<ChampionshipSportItem['events'][number], 'id'>
  ) => Promise<void>;
  teams: SportsTeam[];
  fixtures: Fixture[];
  standings: SportsStandingRecord[];
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
  submitAssignment: (assignmentId: string, text: string, fileName?: string, fileAttachmentUrl?: string) => Promise<void>;
  gradeSubmission: (submissionId: string, marks: number, feedback: string, release: boolean) => void;
  submitQuizAttempt: (quizId: string, answers: Record<string, any>) => number;
  createQuiz: (quiz: Partial<Quiz>) => void;
  updateQuiz: (id: string, updates: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  fetchQuizzes: () => Promise<void>;
  registerEvent: (eventId: string) => void;
  createTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
  updateTimetableEntry: (id: string, updates: Omit<TimetableEntry, 'id'>) => void;
  deleteTimetableEntry: (id: string) => void;
  updateEvent: (id: string, updates: Partial<Omit<SchoolEvent, 'id'>>) => void;
  recordMatchResult: (fixtureId: string, homeScore: string, awayScore: string, outcome: string) => Promise<void>;
  createTournament: (tournament: Partial<Tournament>) => Promise<void>;
  updateTournament: (id: string, updates: Partial<Tournament>) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  createFixture: (fixture: Partial<Fixture>) => Promise<void>;
  createAssignment: (assignment: Partial<Assignment>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  createCourse: (data: { title: string; code: string; description?: string }) => Promise<{ success: boolean; message?: string }>;
  fetchCourses: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  fetchSubmissions: () => Promise<void>;
  syncCourseSyllabus: (courseId: string, updatedCourses?: Course[]) => Promise<void>;
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
  fetchLibraryResources: () => Promise<void>;

  // Teacher Profile & Studio State
  teacherProfile: TeacherProfileData | null;
  updateTeacherProfile: (updates: Partial<TeacherProfileData>) => Promise<boolean>;
  refreshTeacherProfile: () => Promise<void>;

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

const sportsEventOrganizer = 'School Sports Office';

const syncSportsCalendarEvents = async (
  setEvents: React.Dispatch<React.SetStateAction<SchoolEvent[]>>
) => {
  try {
    const token = api.token.get();
    if (!token) return;
    const sportsEvents = await api.sports.getEvents();
    if (api.token.get() !== token) return;
    const mappedEvents: SchoolEvent[] = sportsEvents.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description || event.sportType || 'Sports event',
      date: new Date(event.startDate).toISOString().slice(0, 10),
      time: new Date(event.startDate).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      venue: event.venue,
      organizer: sportsEventOrganizer,
      capacity: 200,
      registeredCount: event.registrationCount,
      audience: 'students',
      status: event.status === 'COMPLETED' ? 'completed' : 'published',
      isRegisteredByCurrentUser: event.isRegistered,
    }));
    setEvents((prev) => {
      const nonSportsEvents = prev.filter((event) => event.organizer !== sportsEventOrganizer);
      return [...mappedEvents, ...nonSportsEvents];
    });
  } catch (err) {
    console.warn('Sports events backend not available yet:', err);
  }
};

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
  const [sports, setSports] = useState<Sport[]>([]);
  const [championshipSports, setChampionshipSports] = useState<ChampionshipSportItem[]>([]);
  const [sportsEvents, setSportsEvents] = useState<SportsEvent[]>([]);
  const [sportsRegistrations, setSportsRegistrations] = useState<SportsRegistration[]>([]);
  const [teams, setTeams] = useState<SportsTeam[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [standings, setStandings] = useState<SportsStandingRecord[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
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
  setTenants((prev) => {
    const existingTenant = prev.find((t) => t.id === tenant.id);

    if (existingTenant) {
      return prev.map((t) =>
        t.id === tenant.id ? tenant : t
      );
    }

    return [tenant, ...prev];
  });
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
  if (authUser?.role === 'SUPER_ADMIN' && !activeTenant) {
    return false;
  }

  if (!activeTenant || !activeTenant.enabledFeatures) {
    return true;
  }

  return activeTenant.enabledFeatures[feature] ?? true;
};

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<any | null>(null);

  // Load real tenants for Super Admin
  useEffect(() => {
    if (currentRole !== 'super_admin' && authUser?.role !== 'SUPER_ADMIN') {
      return;
    }

    let cancelled = false;

    const loadTenants = async () => {
      try {
        const result = await api.tenants.getAll();

        if (cancelled) return;

        if (result?.data && Array.isArray(result.data)) {
          const realTenants: Tenant[] = result.data.map(mapBackendTenant);
          if (realTenants.length > 0) {
            setTenants(realTenants);
            if (!realTenants.some((t) => t.id === activeTenantId)) {
              setActiveTenantId(realTenants[0]?.id ?? '');
            }
          }
        }
      } catch (error) {
        if (cancelled) return;
        console.warn('Could not load live tenants from backend:', error);
      }
    };

    loadTenants();

    return () => {
      cancelled = true;
    };
  }, [currentRole, authUser?.role, authToken]);

  // Restore authenticated session from localStorage on initial load
  useEffect(() => {
    const token = api.token.get();
    const user = api.user.get();
    if (token && user) {
      setAuthToken(token);
      setAuthUser(user);
      const roleMap: Record<string, UserRole> = {
        STUDENT: 'student',
        TEACHER: 'teacher',
        PARENT: 'parent',
        ADMIN: 'admin',
        SUPER_ADMIN: 'super_admin'
      };
      if (user.role && roleMap[user.role]) {
        setCurrentRole(roleMap[user.role]);
      }
      setIsLanding(false);
    }
    fetchCourses();
    fetchAnnouncements();
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.assignments.getAll();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const loaded: Assignment[] = res.data.map((a: any) => ({
          id: a.id,
          courseId: a.courseId || a.course?.id || '',
          subjectName: a.subjectName || a.course?.title || 'Combined Mathematics',
          title: a.title,
          instructions: a.instructions || '',
          topicName: a.topicName || 'General Topic',
          maxMarks: Number(a.maxMarks) || 100,
          dueDate: a.dueDate
            ? new Date(a.dueDate).toISOString().replace('T', ' ').substring(0, 16)
            : '2026-11-30 23:59',
          status: a.status?.toLowerCase() === 'draft' ? 'draft' : 'published',
          attachmentName: a.attachmentName || undefined,
          submissionsCount: a.submissionsCount || a._count?.submissions || 0,
          pendingReviewCount: a.pendingReviewCount || 0,
        }));
        setAssignments((prev) => {
          const loadedIds = new Set(loaded.map((item) => item.id));
          return [...loaded, ...prev.filter((p) => !loadedIds.has(p.id))];
        });
      }
    } catch (err) {
      console.warn('Backend assignments API not reachable yet:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await api.assignments.getTeacherSubmissions();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const loadedSubs: StudentSubmission[] = res.data.map((s: any) => ({
          id: s.id,
          assignmentId: s.assignmentId,
          assignmentTitle: s.assignmentTitle || 'Assignment',
          studentId: s.studentId,
          studentName: s.studentName || 'Student',
          studentAvatar: s.studentAvatar || undefined,
          submittedAt: s.submittedAt
            ? new Date(s.submittedAt).toISOString().replace('T', ' ').substring(0, 16)
            : new Date().toISOString().substring(0, 16),
          status: s.status as 'not_submitted' | 'submitted' | 'marked' | 'result_released',
          textContent: s.textContent || undefined,
          fileAttachmentName: s.fileAttachmentName || undefined,
          fileAttachmentUrl: s.fileAttachmentUrl || undefined,
          marksObtained: s.marksObtained !== undefined && s.marksObtained !== null ? Number(s.marksObtained) : undefined,
          maxMarks: s.maxMarks || 100,
          teacherFeedback: s.teacherFeedback || undefined,
          markedAt: s.markedAt
            ? new Date(s.markedAt).toISOString().replace('T', ' ').substring(0, 16)
            : undefined,
        }));
        setSubmissions((prev) => {
          const loadedIds = new Set(loadedSubs.map((item) => item.id));
          return [...loadedSubs, ...prev.filter((p) => !loadedIds.has(p.id))];
        });
      }
    } catch (err) {
      console.warn('Backend teacher submissions API not reachable yet:', err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.announcements.getAll({ role: currentRole.toUpperCase() });
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      console.warn('Could not load announcements from backend:', err);
    }
  };

  const mapBackendCourseToFrontend = (c: any): Course => {
    const teacherName = c.teacher?.user
      ? `${c.teacher.user.firstName} ${c.teacher.user.lastName || ''}`.trim()
      : 'Assigned Tutor';

    const units: SyllabusUnit[] = Array.isArray(c.syllabus?.units)
      ? c.syllabus.units
      : [
          {
            id: `unt_${c.id}_default`,
            subjectId: c.id,
            title: 'Unit 1: Course Introduction & Overview',
            order: 1,
            topics: [
              {
                id: `top_${c.id}_default`,
                unitId: `unt_${c.id}_default`,
                title: 'Topic 1: Foundations',
                description: c.description || 'Welcome to the course.',
                order: 1,
                lessons: []
              }
            ]
          }
        ];

    return {
      id: c.id,
      subjectId: c.id,
      title: c.title,
      code: c.code,
      teacherId: c.teacherId || 'tutor',
      teacherName,
      gradeName: 'Active Batch',
      className: 'Online Cohort',
      bannerColor: '#0d5c4d',
      units,
      totalLessons: 0,
      completedLessons: 0
    };
  };

  const fetchCourses = async () => {
    try {
      const res = await api.courses.getAll();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const backendCourses = res.data.map(mapBackendCourseToFrontend);
        setCourses((prev) => {
          const backendIds = new Set(backendCourses.map((b: Course) => b.id));
          const nonDuplicatePrev = prev.filter((p) => !backendIds.has(p.id));
          return [...backendCourses, ...nonDuplicatePrev];
        });
      }
    } catch (err) {
      console.warn('Backend courses API not reachable yet:', err);
    }
  };

  const fetchLibraryResources = async () => {
    try {
      const res = await api.resources.getAll();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setLibraryResources((prev) => {
          const loadedIds = new Set(res.data.map((r: any) => r.id));
          return [...res.data, ...prev.filter((p) => !loadedIds.has(p.id))];
        });
      }
    } catch (err) {
      console.warn('Backend library resources API not reachable yet:', err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await api.quizzes.getAll();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setQuizzes((prev) => {
          const loadedIds = new Set(res.data.map((q: any) => q.id));
          return [...res.data, ...prev.filter((p) => !loadedIds.has(p.id))];
        });
      }
    } catch (err) {
      console.warn('Backend quizzes API not reachable yet:', err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
    fetchCourses();
    fetchLibraryResources();
    fetchQuizzes();
  }, [currentRole, activeTenantId]);

  useEffect(() => {
    if (!authToken) return;
    void syncSportsCalendarEvents(setEvents);
  }, [authToken]);

  const createCourse = async (data: {
    title: string;
    code: string;
    description?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.courses.create(data);
      if (res.success && res.data) {
        const newCourse = mapBackendCourseToFrontend(res.data);
        setCourses((prev) => [newCourse, ...prev]);
        setSelectedCourseId(newCourse.id);
        addToast({
          type: 'success',
          title: 'Subject / Course Created!',
          message: `"${data.title}" (${data.code}) successfully saved to cloud database.`
        });
        return { success: true };
      } else {
        const errorMsg = res.message || 'Failed to create course';
        addToast({
          type: 'error',
          title: 'Failed to Create Course',
          message: errorMsg
        });
        return { success: false, message: errorMsg };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Network error while creating course';
      addToast({
        type: 'error',
        title: 'Error Creating Course',
        message: errorMsg
      });
      return { success: false, message: errorMsg };
    }
  };

  const loginUser = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.token && res.user) {
        api.token.set(res.token);
        api.user.set(res.user);
        setEvents((prev) => prev.filter((event) => event.organizer !== sportsEventOrganizer));
        setAuthToken(res.token);
        setAuthUser(res.user);
        const roleMap: Record<string, UserRole> = {
          STUDENT: 'student',
          TEACHER: 'teacher',
          PARENT: 'parent',
          ADMIN: 'admin',
          SUPER_ADMIN: 'super_admin'
        };
        if (res.user.role && roleMap[res.user.role]) {
          setCurrentRole(roleMap[res.user.role]);
        }
        setIsLanding(false);
        addToast({
          type: 'success',
          title: 'Login Successful',
          message: `Welcome back, ${res.user.firstName || 'User'}!`
        });
        return { success: true };
      }
      return { success: false, message: res.message || 'Invalid credentials' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to connect to backend server' };
    }
  };

  const logoutUser = () => {
    api.token.remove();
    api.user.remove();
    setAuthToken(null);
    setAuthUser(null);
    setEvents((prev) => prev.filter((event) => event.organizer !== sportsEventOrganizer));
    setSports([]);
    setChampionshipSports([]);
    setSportsEvents([]);
    setSportsRegistrations([]);
    setTeams([]);
    setFixtures([]);
    setStandings([]);
    setTournaments([]);
    setIsLanding(true);
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been successfully signed out.'
    });
  };

  const t = getTranslation(locale);
  const baseUser = mockUsers[currentRole];
  const currentUser: User = authUser
    ? {
        ...baseUser,
        id: authUser.id,
        name: `${authUser.firstName} ${authUser.lastName}`.trim() || authUser.email,
        email: authUser.email,
        role: currentRole,
        avatar: authUser.avatarUrl || baseUser.avatar
      }
    : baseUser;

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, [setToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, [setToasts]);

  const fetchSportsEvents = useCallback(async () => {
    const token = api.token.get();
    if (!token) throw new Error('Authentication required');

    const [fetchedEvents, disciplines] = await Promise.all([
      api.sports.getEvents(),
      api.sports.getDisciplines(),
    ]);
    if (api.token.get() !== token) return;

    setSportsEvents(fetchedEvents);
    setChampionshipSports(disciplines.map((discipline) => ({
      id: discipline.id,
      name: discipline.name,
      category: discipline.category,
      iconName: discipline.iconName,
      description: discipline.description,
      ageGroups: Array.from(new Set(discipline.events
        .map((event) => event.ageCategory)
        .filter((age): age is NonNullable<typeof age> => Boolean(age)))) as ChampionshipSportItem['ageGroups'],
      gender: 'all',
      isTeamSport: discipline.isTeamSport,
      registrationStatus: 'Open',
      events: discipline.events.map((event) => ({
        id: event.id,
        name: event.title,
        ageCategory: (event.ageCategory || 'Open') as ChampionshipSportItem['events'][number]['ageCategory'],
        gender: (event.gender || 'All') as ChampionshipSportItem['events'][number]['gender'],
        fee: event.fee,
        maxParticipants: event.maxParticipants ?? 0,
      })),
    })));

    const sportsByType = new Map<string, Sport>();
    disciplines.forEach((discipline) => {
      sportsByType.set(discipline.name.toLowerCase(), {
        id: discipline.id,
        name: discipline.name,
        category: discipline.category,
        iconName: discipline.iconName,
        activeTeamsCount: 0,
      });
    });
    fetchedEvents.forEach((event) => {
      const name = event.sportType.trim();
      if (!name || sportsByType.has(name.toLowerCase())) return;
      sportsByType.set(name.toLowerCase(), {
        id: `sport_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        name,
        category: 'Sport',
        iconName: 'Trophy',
        activeTeamsCount: 0,
      });
    });
    setSports(Array.from(sportsByType.values()));
  }, []);

  const fetchMySportsRegistrations = useCallback(async () => {
    const token = api.token.get();
    if (!token) throw new Error('Authentication required');

    const registrations = await api.sports.getMyRegistrations();
    if (api.token.get() !== token) return;
    setSportsRegistrations(registrations);
  }, [setSportsRegistrations]);

  const fetchSportsOperations = useCallback(async () => {
    const token = api.token.get();
    if (!token) throw new Error('Authentication required');
    const [records, tournamentsData, fixturesData, standingsData] = await Promise.all([
      api.sports.getTeams(),
      api.sports.getTournaments(),
      api.sports.getFixtures(),
      api.sports.getStandings(),
    ]);
    if (api.token.get() !== token) return;

    setTeams(records.map((team: SportsTeamRecord) => ({
      id: team.id,
      sportId: team.sportName,
      sportName: team.sportName,
      name: team.name,
      coachId: '',
      coachName: team.coachName,
      playersCount: team.playersCount,
      status: team.status,
      trainingSchedule: team.trainingSchedule,
      players: team.players,
    })));
    setTournaments(tournamentsData.map((tournament: SportsTournamentRecord) => ({
      ...tournament,
      sportId: tournament.sportName,
      format: tournament.format as Tournament['format'],
      startDate: tournament.startDate.substring(0, 10),
      endDate: tournament.endDate.substring(0, 10),
      status: tournament.status as Tournament['status'],
      rules: tournament.rules || undefined,
      currentRound: tournament.currentRound || undefined,
      champion: tournament.champion || undefined,
      runnerUp: tournament.runnerUp || undefined,
    })));
    setFixtures(fixturesData.map((fixture: SportsFixtureRecord) => ({
      id: fixture.id,
      teamId: '',
      tournamentId: fixture.tournamentId,
      sportName: fixture.sportName,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      date: fixture.date.substring(0, 10),
      time: fixture.time,
      venue: fixture.venue,
      competitionName: fixture.competitionName,
      status: fixture.status === 'completed' ? 'completed' : fixture.status === 'in_progress' ? 'in_progress' : 'scheduled',
      ...(fixture.homeScore && fixture.awayScore && fixture.outcome
        ? { result: {
            homeScore: fixture.homeScore,
            awayScore: fixture.awayScore,
            outcome: fixture.outcome,
            recordedAt: fixture.recordedAt || '',
          } }
        : {}),
    })));
    setStandings(standingsData);
  }, []);

  const registerForSport = async (input: {
    eventId: string;
    jerseyNumber?: number;
    roleInTeam?: string;
    notes?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.sports.register(input);
      addToast({
        type: 'success',
        title: 'Sports Registration Submitted',
        message: 'Your registration has been sent for review.',
      });
      await Promise.all([
        fetchSportsEvents().catch((error) => {
          console.error('Failed to refresh sports events after registration:', error);
          addToast({
            type: 'error',
            title: 'Unable to Refresh Sports Events',
            message: error instanceof Error ? error.message : 'An unexpected error occurred.',
          });
        }),
        fetchMySportsRegistrations().catch((error) => {
          console.error('Failed to refresh sports registrations:', error);
          addToast({
            type: 'error',
            title: 'Unable to Refresh Sports Registrations',
            message: error instanceof Error ? error.message : 'An unexpected error occurred.',
          });
        }),
      ]);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      addToast({
        type: 'error',
        title: 'Sports Registration Failed',
        message,
      });
      return { success: false, message };
    }
  };

  const submitChampionshipRegistration = async (input: {
    eventIds: string[];
    registrationNumber: string;
    athleteDetails: Record<string, unknown>;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.sports.registerChampionship(input);
      await Promise.all([fetchSportsEvents(), fetchMySportsRegistrations()]);
      addToast({
        type: 'success',
        title: 'Championship Registration Submitted',
        message: 'Your athlete registration has been saved and sent for review.',
      });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      addToast({ type: 'error', title: 'Championship Registration Failed', message });
      return { success: false, message };
    }
  };

  const updateChampionshipRegistrationStatus = async (
    registrationNumber: string,
    status: StoredAthleteRegistration['status'],
  ) => {
    try {
      await api.sports.updateRegistrationStatus(registrationNumber, status);
      addToast({
        type: 'success',
        title: 'Registration Status Updated',
        message: `${registrationNumber} is now ${status}.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      addToast({ type: 'error', title: 'Unable to Update Registration', message });
      throw error;
    }
  };

  const createChampionshipSport = async (
    sport: Omit<ChampionshipSportItem, 'id' | 'events' | 'registrationStatus'>,
  ) => {
    try {
      await api.sports.createDiscipline(sport);
      await fetchSportsEvents();
      addToast({ type: 'success', title: 'Sport Added', message: `${sport.name} is now available.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      addToast({ type: 'error', title: 'Unable to Add Sport', message });
      throw error;
    }
  };

  const createChampionshipEvent = async (
    sportId: string,
    event: Omit<ChampionshipSportItem['events'][number], 'id'>,
  ) => {
    const sport = championshipSports.find((item) => item.id === sportId);
    if (!sport) throw new Error('Sports discipline not found.');
    try {
      await api.sports.createEvent({
        disciplineId: sport.id,
        title: event.name,
        sportType: sport.name,
        ageCategory: event.ageCategory,
        gender: event.gender,
        fee: event.fee,
        maxParticipants: event.maxParticipants,
        venue: event.venue || 'To be announced',
        startDate: event.startDate || new Date().toISOString(),
        description: sport.description,
        isTeamSport: sport.isTeamSport,
      });
      await fetchSportsEvents();
      addToast({ type: 'success', title: 'Sports Event Added', message: `${event.name} is now available.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      addToast({ type: 'error', title: 'Unable to Add Event', message });
      throw error;
    }
  };

  useEffect(() => {
    if (!authToken) return;

    let active = true;
    queueMicrotask(() => {
      if (!active) return;

      void fetchSportsEvents().catch((error) => {
        console.error('Failed to load sports events:', error);
        addToast({
          type: 'error',
          title: 'Unable to Load Sports Events',
          message: error instanceof Error ? error.message : 'An unexpected error occurred.',
        });
      });
      void fetchMySportsRegistrations().catch((error) => {
        console.error('Failed to load sports registrations:', error);
        addToast({
          type: 'error',
          title: 'Unable to Load Sports Registrations',
          message: error instanceof Error ? error.message : 'An unexpected error occurred.',
        });
      });
      void fetchSportsOperations().catch((error) => {
        console.error('Failed to load sports operations:', error);
        addToast({
          type: 'error',
          title: 'Unable to Load Sports Operations',
          message: error instanceof Error ? error.message : 'An unexpected error occurred.',
        });
      });
    });

    return () => {
      active = false;
    };
  }, [addToast, authToken, fetchMySportsRegistrations, fetchSportsEvents, fetchSportsOperations]);

  // Switch role reset default views
  useEffect(() => {
    setCurrentView('dashboard');
    fetchAnnouncements();
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
  const submitAssignment = async (
    assignmentId: string,
    text: string,
    fileName?: string,
    fileAttachmentUrl?: string
  ) => {
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
      fileAttachmentUrl: fileAttachmentUrl || undefined,
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

    try {
      await api.assignments.submit(assignmentId, {
        textContent: text,
        fileAttachmentName: fileName || 'Student_Submission.pdf',
        fileAttachmentUrl: fileAttachmentUrl || undefined,
      });
    } catch (err) {
      console.warn('Backend submit assignment skipped:', err);
    }
  };

  // Teacher grades submission and releases results
  const gradeSubmission = async (
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

    try {
      await api.assignments.gradeSubmission(submissionId, {
        marksObtained: marks,
        teacherFeedback: feedback,
        status: release ? 'RESULT_RELEASED' : 'MARKED',
      });
    } catch (err) {
      console.warn('Backend grade submission skipped:', err);
    }
  };

  // Student submits quiz attempt
  const submitQuizAttempt = (
    quizId: string,
    answers: Record<string, any>
  ) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) return 0;

    let score = 0;
    quiz.questions.forEach((q) => {
      const studentAns = answers[q.id];
      if (studentAns !== undefined && studentAns !== null && studentAns !== '') {
        const questionMarks = Number(q.marks) || 10;

        if (q.type === 'short_answer' || q.type === 'numerical') {
          // Normalize whitespace and case
          const cleanStudent = String(studentAns).trim().toLowerCase();
          const cleanCorrect = String(q.correctAnswer).trim().toLowerCase();
          if (cleanStudent === cleanCorrect) {
            score += questionMarks;
          }
        } else if (q.type === 'multi_select') {
          const correctArr = Array.isArray(q.correctAnswer)
            ? q.correctAnswer.map(String).sort()
            : [String(q.correctAnswer)];
          const studentArr = Array.isArray(studentAns)
            ? studentAns.map(String).sort()
            : [String(studentAns)];

          if (
            studentArr.length === correctArr.length &&
            studentArr.every((val, i) => val === correctArr[i])
          ) {
            score += questionMarks;
          }
        } else {
          // Standard MCQ or True/False
          if (String(studentAns) === String(q.correctAnswer)) {
            score += questionMarks;
          }
        }
      }
    });

    const percent = Math.round((score / quiz.totalMarks) * 100);
    const calculatedGrade: 'A' | 'B' | 'C' | 'S' | 'F' =
      percent >= 75 ? 'A' : percent >= 65 ? 'B' : percent >= 55 ? 'C' : percent >= 35 ? 'S' : 'F';

    const newAttemptRecord = {
      id: `att_${Date.now()}`,
      quizId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      indexNo: (currentUser as any).indexNumber || 'ST-2026-042',
      classBatch: (currentUser as any).class || '12-Physical Science A',
      score,
      totalMarks: quiz.totalMarks,
      percentage: percent,
      grade: calculatedGrade,
      timeSpentSeconds: 420,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      answers
    };

    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id === quizId) {
          return {
            ...q,
            userAttempt: {
              status: 'result_released',
              score,
              completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            },
            attempts: [newAttemptRecord, ...(q.attempts || [])]
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

    api.quizzes
      .submitAttempt(quizId, { answers, timeSpentSeconds: 420 })
      .catch((err) => {
        console.warn('Backend quiz attempt submission skipped:', err?.message);
      });

    return score;
  };

  // Tutor creates new Quiz
  const createQuiz = (qz: Partial<Quiz>) => {
    const targetCourse = courses.find((c) => c.id === qz.courseId);
    const resolvedSubjectName = qz.subjectName || targetCourse?.title || 'Combined Mathematics';

    const tempId = `qz_${Date.now()}`;
    const questions = qz.questions && qz.questions.length > 0 ? qz.questions : [
      {
        id: `q_${Date.now()}_1`,
        questionText: 'Sample MCQ Question',
        type: 'mcq' as const,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'Standard conceptual rationale for this question.',
        marks: 10
      }
    ];

    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 10), 0);

    const newQuiz: Quiz = {
      id: tempId,
      courseId: qz.courseId || targetCourse?.id || 'crs_math_12',
      subjectName: resolvedSubjectName,
      title: qz.title || 'New Online Quiz',
      instructions: qz.instructions || 'Answer all questions within the allocated time limit.',
      durationMinutes: qz.durationMinutes || 15,
      dueDate: qz.dueDate || '2026-11-15 23:59',
      status: qz.status || 'published',
      totalQuestions: questions.length,
      totalMarks: qz.totalMarks || totalMarks,
      questions: questions,
      userAttempt: {
        status: 'available'
      }
    };

    setQuizzes((prev) => [newQuiz, ...prev]);
    addToast({
      type: 'success',
      title: 'Quiz Published Successfully! 🎯',
      message: `"${newQuiz.title}" is now available (${newQuiz.totalQuestions} questions, ${newQuiz.totalMarks} marks).`
    });

    api.quizzes
      .create({
        title: newQuiz.title,
        instructions: newQuiz.instructions,
        courseId: newQuiz.courseId,
        subjectName: newQuiz.subjectName,
        durationMinutes: newQuiz.durationMinutes,
        dueDate: newQuiz.dueDate,
        status: newQuiz.status,
        totalMarks: newQuiz.totalMarks,
        questions: newQuiz.questions,
      })
      .then((res) => {
        if (res.success && res.data?.id) {
          setQuizzes((prev) =>
            prev.map((q) => (q.id === tempId ? { ...q, id: res.data.id } : q))
          );
        }
      })
      .catch((err) => {
        console.warn('Backend quiz creation skipped:', err?.message);
      });
  };

  // Tutor updates existing Quiz
  const updateQuiz = (id: string, updates: Partial<Quiz>) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const targetCourse = updates.courseId ? courses.find((c) => c.id === updates.courseId) : undefined;
        const updatedQuestions = updates.questions || q.questions;
        const calculatedMarks = updatedQuestions.reduce((sum, item) => sum + (Number(item.marks) || 10), 0);

        return {
          ...q,
          ...updates,
          subjectName: updates.subjectName || targetCourse?.title || q.subjectName,
          totalQuestions: updatedQuestions.length,
          totalMarks: updates.totalMarks !== undefined ? updates.totalMarks : calculatedMarks,
          questions: updatedQuestions
        };
      })
    );
    addToast({
      type: 'success',
      title: 'Quiz Updated! 📝',
      message: 'Questions and evaluation parameters saved successfully.'
    });

    api.quizzes
      .update(id, updates)
      .catch((err) => {
        console.warn('Backend quiz update skipped:', err?.message);
      });
  };

  // Tutor deletes Quiz
  const deleteQuiz = (id: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
    addToast({
      type: 'warning',
      title: 'Quiz Removed',
      message: 'The quiz has been removed from the curriculum.'
    });

    api.quizzes
      .delete(id)
      .catch((err) => {
        console.warn('Backend quiz delete skipped:', err?.message);
      });
  };

  // Event RSVP
  const registerEvent = async (eventId: string) => {
    if (authToken) {
      const result = await registerForSport({ eventId });
      if (result.success) await syncSportsCalendarEvents(setEvents);
      return;
    }

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
  const recordMatchResult = async (
    fixtureId: string,
    homeScore: string,
    awayScore: string,
    outcome: string
  ) => {
    try {
      await api.sports.recordFixtureResult(fixtureId, { homeScore, awayScore, outcome });
      await fetchSportsOperations();
      addToast({
        type: 'success',
        title: 'Match Result Recorded & Published',
        message: 'Standings have been recalculated from saved match results.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      addToast({ type: 'error', title: 'Unable to Record Match Result', message });
    }
  };

  // Tournament Management
  const createTournament = async (tr: Partial<Tournament>) => {
    const startDate = tr.startDate || new Date().toISOString().substring(0, 10);
    try {
      const created = await api.sports.createTournament({
        name: tr.name || '',
        sportName: tr.sportName || '',
        category: tr.category || 'Open',
        format: tr.format || 'knockout',
        startDate,
        endDate: tr.endDate || startDate,
        venue: tr.venue || '',
        organizer: tr.organizer || '',
        participatingTeams: tr.participatingTeams || [],
        status: tr.status || 'upcoming',
        trophyTitle: tr.trophyTitle || '',
        description: tr.description || '',
        rules: tr.rules || null,
        currentRound: tr.currentRound || null,
      });
      setTournaments((prev) => [{
        ...created,
        sportId: created.sportName,
        format: created.format as Tournament['format'],
        startDate: created.startDate.substring(0, 10),
        endDate: created.endDate.substring(0, 10),
        status: created.status as Tournament['status'],
        rules: created.rules || undefined,
        currentRound: created.currentRound || undefined,
        champion: created.champion || undefined,
        runnerUp: created.runnerUp || undefined,
      }, ...prev]);
      addToast({
        type: 'success',
        title: 'Tournament Created',
        message: `${created.name} has been saved.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      addToast({ type: 'error', title: 'Unable to Create Tournament', message });
    }
  };

  const updateTournament = async (id: string, updates: Partial<Tournament>) => {
    try {
      await api.sports.updateTournament(id, updates);
      await fetchSportsOperations();
      addToast({ type: 'success', title: 'Tournament Updated', message: 'Tournament changes were saved.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      addToast({ type: 'error', title: 'Unable to Update Tournament', message });
    }
  };

  const deleteTournament = async (id: string) => {
    try {
      await api.sports.deleteTournament(id);
      setTournaments((prev) => prev.filter((t) => t.id !== id));
      addToast({ type: 'success', title: 'Tournament Deleted', message: 'Tournament was removed.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      addToast({ type: 'error', title: 'Unable to Delete Tournament', message });
    }
  };

  const createFixture = async (fx: Partial<Fixture>) => {
    try {
      const created = await api.sports.createFixture({
        tournamentId: fx.tournamentId || null,
        sportName: fx.sportName || '',
        homeTeam: fx.homeTeam || '',
        awayTeam: fx.awayTeam || '',
        date: fx.date || new Date().toISOString().substring(0, 10),
        time: fx.time || '',
        venue: fx.venue || '',
        competitionName: fx.competitionName || '',
        status: 'scheduled',
      });
      setFixtures((prev) => [{
        id: created.id,
        teamId: '',
        tournamentId: created.tournamentId,
        sportName: created.sportName,
        homeTeam: created.homeTeam,
        awayTeam: created.awayTeam,
        date: created.date.substring(0, 10),
        time: created.time,
        venue: created.venue,
        competitionName: created.competitionName,
        status: 'scheduled',
      }, ...prev]);
      addToast({
        type: 'success',
        title: 'Match Fixture Scheduled',
        message: `${created.homeTeam} vs ${created.awayTeam} was saved.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      addToast({ type: 'error', title: 'Unable to Schedule Fixture', message });
    }
  };

  const createAssignment = async (asg: Partial<Assignment>) => {
    const targetCourse = courses.find((c) => c.id === asg.courseId);
    const resolvedSubjectName = asg.subjectName || targetCourse?.title || 'Combined Mathematics';

    const tempId = `asg_${Date.now()}`;
    const newAsg: Assignment = {
      id: tempId,
      courseId: asg.courseId || targetCourse?.id || 'crs_math_12',
      subjectName: resolvedSubjectName,
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
      message: `New assignment for "${resolvedSubjectName}" published successfully.`
    });

    try {
      const res = await api.assignments.create({
        title: newAsg.title,
        instructions: newAsg.instructions,
        courseId: asg.courseId,
        subjectName: resolvedSubjectName,
        topicName: newAsg.topicName,
        dueDate: newAsg.dueDate,
        maxMarks: newAsg.maxMarks,
        attachmentName: newAsg.attachmentName,
      });
      if (res && res.success && res.data) {
        setAssignments((prev) =>
          prev.map((a) => (a.id === tempId ? { ...a, id: res.data.id } : a))
        );
      }
    } catch (err) {
      console.warn('Backend assignment sync skipped:', err);
    }
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const targetCourse = updates.courseId ? courses.find((c) => c.id === updates.courseId) : undefined;
        return {
          ...a,
          ...updates,
          subjectName: updates.subjectName || targetCourse?.title || a.subjectName,
        };
      })
    );
    addToast({
      type: 'success',
      title: 'Assignment Updated!',
      message: 'Assignment details and attachments saved successfully.'
    });

    try {
      await api.assignments.update(id, updates);
    } catch (err) {
      console.warn('Backend assignment update skipped:', err);
    }
  };

  const deleteAssignment = async (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    addToast({
      type: 'info',
      title: 'Assignment Removed',
      message: 'Assignment deleted successfully.'
    });

    try {
      await api.assignments.delete(id);
    } catch (err) {
      console.warn('Backend assignment delete skipped:', err);
    }
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

  const syncCourseSyllabus = async (courseId: string, updatedCourses?: Course[]) => {
    try {
      const courseList = updatedCourses || courses;
      const target = courseList.find((c) => c.id === courseId);
      if (!target) return;

      if (!courseId.startsWith("crs_")) {
        await api.courses.update(courseId, { syllabus: { units: target.units } });
      } else {
        const existing = courseList.find(
          (c) => !c.id.startsWith("crs_") && (c.title === target.title || c.code === target.code)
        );
        if (existing) {
          await api.courses.update(existing.id, { syllabus: { units: target.units } });
        } else {
          const res = await api.courses.create({
            title: target.title,
            code: target.code || `CRS-${Date.now().toString().slice(-4)}`,
            description: `A/L Curriculum Batch for ${target.title}`
          });
          if (res.success && res.data) {
            await api.courses.update(res.data.id, { syllabus: { units: target.units } });
            setCourses((prev) =>
              prev.map((c) => (c.id === courseId ? { ...c, id: res.data.id } : c))
            );
          }
        }
      }
    } catch (e) {
      console.warn("Could not sync syllabus to server:", e);
    }
  };

  const createUnit = (courseId: string, unitTitle: string): string => {
    const newUnitId = `unt_${Date.now()}`;
    const newTopicId = `top_${Date.now()}`;
    setCourses((prev) => {
      const updated = prev.map((c) => {
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
      });
      syncCourseSyllabus(courseId, updated);
      return updated;
    });
    addToast({
      type: 'success',
      title: 'Unit Added to Syllabus!',
      message: `"${unitTitle}" created successfully.`
    });
    return newUnitId;
  };

  const updateUnit = (courseId: string, unitId: string, updates: { title?: string; order?: number }) => {
    setCourses((prev) => {
      const updated = prev.map((c) => {
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
      });
      syncCourseSyllabus(courseId, updated);
      return updated;
    });
    addToast({
      type: 'success',
      title: 'Unit Updated!',
      message: 'Unit details saved successfully.'
    });
  };

  const createTopic = (courseId: string, unitId: string, topicTitle: string, description?: string): string => {
    const newTopicId = `top_${Date.now()}`;
    setCourses((prev) => {
      const updated = prev.map((c) => {
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
      });
      syncCourseSyllabus(courseId, updated);
      return updated;
    });
    addToast({
      type: 'success',
      title: 'Topic Added to Unit!',
      message: `"${topicTitle}" created successfully.`
    });
    return newTopicId;
  };

  const updateTopic = (courseId: string, unitId: string, topicId: string, updates: { title?: string; description?: string }) => {
    setCourses((prev) => {
      const updated = prev.map((c) => {
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
      });
      syncCourseSyllabus(courseId, updated);
      return updated;
    });
    addToast({
      type: 'success',
      title: 'Topic Updated!',
      message: 'Topic details saved successfully.'
    });
  };

  const deleteUnit = (courseId: string, unitId: string) => {
    setCourses((prev) => {
      const updated = prev.map((c) => {
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
      });
      syncCourseSyllabus(courseId, updated);
      return updated;
    });
    addToast({
      type: 'info',
      title: 'Unit Removed',
      message: 'Unit deleted from syllabus.'
    });
  };

  const deleteTopic = (courseId: string, unitId: string, topicId: string) => {
    setCourses((prev) => {
      const updated = prev.map((c) => {
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
      });
      syncCourseSyllabus(courseId, updated);
      return updated;
    });
    addToast({
      type: 'info',
      title: 'Topic Removed',
      message: 'Topic deleted from unit.'
    });
  };

  const createLesson = (courseId: string, unitId: string, topicId: string, lesson: Partial<Lesson>) => {
    setCourses((prev) => {
      const updated = prev.map((c) => {
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
      });
      syncCourseSyllabus(courseId, updated);
      return updated;
    });
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
    setCourses((prev) => {
      const updated = prev.map((c) => {
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
      });
      syncCourseSyllabus(courseId, updated);
      return updated;
    });
    addToast({
      type: 'success',
      title: 'Lesson Updated!',
      message: 'Lesson details saved successfully.'
    });
  };

  const deleteLesson = (courseId: string, unitId: string, topicId: string, lessonId: string) => {
    setCourses((prev) => {
      const updated = prev.map((c) => {
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
      });
      syncCourseSyllabus(courseId, updated);
      return updated;
    });
    addToast({
      type: 'info',
      title: 'Lesson Removed',
      message: 'Lesson deleted from topic.'
    });
  };

  const createAnnouncement = async (ann: Partial<Announcement>) => {
    try {
      const res = await api.announcements.create({
        title: ann.title || 'Official Announcement',
        message: ann.message || '',
        targetAudience: ann.targetAudience || 'Platform-Wide (Everyone)',
        priority: ann.priority || 'normal'
      });
      if (res.success && res.data) {
        setAnnouncements((prev) => [res.data, ...prev]);
        addToast({
          type: 'success',
          title: 'Announcement Published!',
          message: 'Notice has been dispatched and saved to cloud database.'
        });
        return;
      }
    } catch (err) {
      console.warn('Failed to save announcement in backend, falling back to local:', err);
    }

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

  const updateAnnouncement = async (id: string, updates: Partial<Omit<Announcement, 'id'>>) => {
    try {
      await api.announcements.update(id, updates);
    } catch (err) {
      console.warn('Failed to update announcement in backend:', err);
    }
    setAnnouncements((prev) =>
      prev.map((announcement) => announcement.id === id ? { ...announcement, ...updates } : announcement)
    );
    addToast({ type: 'success', title: 'Announcement Updated', message: 'Announcement details saved successfully.' });
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await api.announcements.delete(id);
    } catch (err) {
      console.warn('Failed to delete announcement in backend:', err);
    }
    setAnnouncements((prev) => prev.filter((announcement) => announcement.id !== id));
    addToast({ type: 'success', title: 'Announcement Removed', message: 'Announcement has been removed from database.' });
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
    const isPastPaper = resource.resourceType === 'past_paper';
    const tempId = resource.id || `lib_${Date.now()}`;
    const newRes: LibraryResource = {
      id: tempId,
      title: resource.title || 'Untitled Resource',
      resourceType: resource.resourceType || 'tute',
      subject: resource.subject || 'General',
      author: resource.author || currentUser.name,
      teacherId: resource.teacherId || currentUser.id,
      isOwner: true,
      description: resource.description || 'Comprehensive learning resource uploaded for student study and curriculum preparation.',
      topic: resource.topic || (isBook ? undefined : 'General Module'),
      category: resource.category || (isPastPaper ? 'Past Papers & Model Exams' : 'Advanced Level'),
      coverImage: resource.coverImage || (isBook
        ? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
        : isPastPaper
        ? 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80'),
      fileType: resource.fileType || 'PDF',
      fileSize: resource.fileSize || '4.2 MB',
      pageCount: resource.pageCount || (isBook ? 120 : 20),
      uploadedDate: resource.uploadedDate || new Date().toISOString().split('T')[0],
      status: resource.status || 'published',
      visibility: resource.visibility || 'public',
      packageId: resource.packageId,
      packageName: resource.packageName,
      packagePrice: resource.packagePrice,
      isLocked: false,
      year: resource.year,
      medium: resource.medium,
      examType: resource.examType,
      paperPart: resource.paperPart,
      hasMarkingScheme: resource.hasMarkingScheme,
      markingSchemeUrl: resource.markingSchemeUrl,
      markingSchemePages: resource.markingSchemePages,
      markingSchemeNotes: resource.markingSchemeNotes,
      timeAllowedMinutes: resource.timeAllowedMinutes,
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
      message: `"${newRes.title}" is now added (${newRes.visibility === 'subscribers_only' ? '🔒 Subscribers Only' : '🌐 Public'}).`
    });

    // Asynchronous backend sync
    api.resources
      .create({
        title: newRes.title,
        description: newRes.description,
        resourceType: newRes.resourceType,
        subject: newRes.subject,
        topic: newRes.topic,
        category: newRes.category,
        year: newRes.year,
        medium: newRes.medium,
        examType: newRes.examType,
        paperPart: newRes.paperPart,
        fileType: newRes.fileType,
        fileSize: newRes.fileSize,
        coverImage: newRes.coverImage,
        hasMarkingScheme: newRes.hasMarkingScheme,
        markingSchemeNotes: newRes.markingSchemeNotes,
        timeAllowedMinutes: newRes.timeAllowedMinutes,
        visibility: newRes.visibility === 'subscribers_only' || newRes.visibility === 'private' ? 'SUBSCRIBERS_ONLY' : 'PUBLIC',
        packageId: newRes.packageId,
        status: newRes.status,
        allowDownload: newRes.allowDownload
      })
      .then((backendRes) => {
        if (backendRes.success && backendRes.data?.id) {
          setLibraryResources((prev) =>
            prev.map((r) => (r.id === tempId ? { ...r, id: backendRes.data.id } : r))
          );
        }
      })
      .catch((err) => {
        console.warn('Backend sync for created resource skipped or failed:', err?.message);
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

    // Asynchronous backend update sync
    api.resources
      .update(id, {
        ...updates,
        visibility:
          updates.visibility === 'subscribers_only' || updates.visibility === 'private'
            ? 'SUBSCRIBERS_ONLY'
            : updates.visibility === 'public'
            ? 'PUBLIC'
            : undefined
      })
      .catch((err) => {
        console.warn('Backend update sync skipped:', err?.message);
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

    // Asynchronous backend deletion sync
    api.resources.delete(id).catch((err) => {
      console.warn('Backend delete sync skipped:', err?.message);
    });
  };

  const recordResourceView = (id: string) => {
    setLibraryResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, viewsCount: r.viewsCount + 1 } : r))
    );
    api.resources.recordView(id).catch(() => {});
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
    api.resources.recordDownload(id).catch(() => {});
  };

  // Teacher Studio Profile & Payout State
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfileData | null>(null);

  const refreshTeacherProfile = useCallback(async () => {
    try {
      const res = await api.teachers.getMyProfile();
      if (res && res.success && res.data) {
        setTeacherProfile(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch teacher profile from API:', err);
    }
  }, []);

  const updateTeacherProfile = async (updates: Partial<TeacherProfileData>): Promise<boolean> => {
    try {
      setTeacherProfile((prev) => (prev ? { ...prev, ...updates } : (updates as TeacherProfileData)));
      const res = await api.teachers.updateMyProfile(updates);
      if (res && res.success && res.data) {
        setTeacherProfile(res.data);
        addToast({
          type: 'success',
          title: 'Profile Saved',
          message: 'Your Tutor Studio Profile & Payout details have been updated.'
        });
        return true;
      } else {
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: res?.error || 'Could not update profile. Please try again.'
        });
        return false;
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err?.message || 'Network error while saving profile.'
      });
      return false;
    }
  };

  useEffect(() => {
    if (currentRole === 'teacher') {
      refreshTeacherProfile();
    }
  }, [currentRole, refreshTeacherProfile]);

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
        championshipSports,
        sportsEvents,
        sportsRegistrations,
        fetchSportsEvents,
        fetchMySportsRegistrations,
        fetchSportsOperations,
        registerForSport,
        submitChampionshipRegistration,
        updateChampionshipRegistrationStatus,
        createChampionshipSport,
        createChampionshipEvent,
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
        createQuiz,
        updateQuiz,
        deleteQuiz,
        fetchQuizzes,
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
        createCourse,
        fetchCourses,
        fetchAssignments,
        fetchSubmissions,
        syncCourseSyllabus,
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
        fetchLibraryResources,
        teacherProfile,
        updateTeacherProfile,
        refreshTeacherProfile,
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
        removeToast,
        authUser,
        authToken,
        loginUser,
        logoutUser
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
