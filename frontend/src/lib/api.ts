export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN' | 'SUPER_ADMIN';
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    tenant?: {
      id: string;
      slug: string;
      name: string;
    };
    studentProfile?: any;
    teacherProfile?: any;
    parentProfile?: any;
  };
}

export type SportsEventStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
export type SportsRegistrationStatus = 'PENDING' | 'CONFIRMED' | 'WAITLISTED' | 'REJECTED';

export interface SportsEvent {
  id: string;
  title: string;
  sportType: string;
  disciplineId: string | null;
  ageCategory: string | null;
  gender: string | null;
  fee: number;
  maxParticipants: number | null;
  description: string | null;
  isTeamSport: boolean;
  venue: string;
  startDate: string;
  endDate: string | null;
  status: SportsEventStatus;
  registrationCount: number;
  isRegistered: boolean;
}

export interface SportsRegistration {
  id: string;
  eventId: string;
  userId: string;
  jerseyNumber: number | null;
  roleInTeam: string | null;
  status: SportsRegistrationStatus;
  notes: string | null;
  registrationNumber: string | null;
  athleteDetails: unknown;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  event?: Omit<SportsEvent, 'registrationCount' | 'isRegistered'>;
}

export interface SportsRegistrationInput {
  eventId: string;
  jerseyNumber?: number;
  roleInTeam?: string;
  notes?: string;
}

export interface SportsDiscipline {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  isTeamSport: boolean;
}

export interface SportsTeamRecord {
  id: string;
  sportName: string;
  name: string;
  coachName: string;
  trainingSchedule: string;
  status: SportsTeamStatus;
  playersCount: number;
  players: { id: string; name: string; position: string; grade: string }[];
}

export type SportsTeamStatus = 'draft' | 'active' | 'completed';

export interface SportsTournamentRecord {
  id: string;
  name: string;
  sportName: string;
  category: string;
  format: string;
  startDate: string;
  endDate: string;
  venue: string;
  organizer: string;
  teamsCount: number;
  participatingTeams: string[];
  status: string;
  trophyTitle: string;
  description: string;
  rules: string | null;
  currentRound: string | null;
  champion: string | null;
  runnerUp: string | null;
}

export interface SportsFixtureRecord {
  id: string;
  tournamentId: string | null;
  sportName: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  competitionName: string;
  status: string;
  homeDistrict: string | null;
  awayDistrict: string | null;
  roundName: string | null;
  homeScore: string | null;
  awayScore: string | null;
  outcome: string | null;
  recordedAt: string | null;
}

export interface SportsStandingRecord {
  id: string;
  rank: number;
  teamName: string;
  schoolName: string;
  sport: string;
  division: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  scoredFor: number;
  scoredAgainst: number;
  diffOrNrr: string;
  points: number;
  form: ('W' | 'D' | 'L')[];
  statusText: string;
  statusType: 'qualified' | 'playoff' | 'neutral' | 'danger';
  groupKey: string;
}

async function sportsRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = api.token.get();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/sports${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  const result: { success: boolean; message?: string; data?: T } = await response.json();
  if (!response.ok || !result.success || result.data === undefined) {
    throw new Error(result.message || 'Sports request failed');
  }
  return result.data;
}

export const api = {
  // Super Admin - Tenant API
  tenants: {
    async getAll() {
      const token = api.token.get();

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/tenants`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to load tenants');
      }

      return result;
    },
       async create(data: {
  name: string;
  subdomain: string;
  plan: string;
  adminEmail: string;
  adminName: string;
  contactPhone: string;
  monthlyFeeLkr: number;
  address: string;
  type: string;
  enabledFeatures: Record<string, boolean>;
}) {
      const token = api.token.get();

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create tenant');
      }

      return result;
    },

      async updateFeatures(
      tenantId: string,
      enabledFeatures: Record<string, boolean>
    ) {
      const token = api.token.get();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${API_BASE_URL}/tenants/${tenantId}/features`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ enabledFeatures }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update tenant features"
        );
      }

      return result;
    },
      async update(
  tenantId: string,
  data: {
    name?: string;
    plan?: string;
    adminEmail?: string;
    adminName?: string;
    contactPhone?: string;
    monthlyFeeLkr?: number;
    address?: string;
    type?: string;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "TRIAL";
    tagline?: string;
  }
) {
  const token = api.token.get();

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(
    `${API_BASE_URL}/tenants/${tenantId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to update tenant"
    );
  }

  return result;
    },

    async getArchived() {
      const token = api.token.get();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/tenants/archived`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load archived tenants");
      }

      return result;
    },

    async archive(tenantId: string) {
      const token = api.token.get();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${API_BASE_URL}/tenants/${encodeURIComponent(tenantId)}/archive`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to archive tenant");
      }

      return result;
    },

    async restore(tenantId: string) {
      const token = api.token.get();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${API_BASE_URL}/tenants/${encodeURIComponent(tenantId)}/restore`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to restore tenant");
      }

      return result;
    },

  },

  // Auth API
  auth: {
    async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return response.json();
    },

    async registerStudent(data: {
      firstName: string;
      lastName?: string;
      email: string;
      password: string;
      gradeLevel?: string;
      studentIdNo?: string;
    }): Promise<AuthResponse> {
      const response = await fetch(`${API_BASE_URL}/auth/register/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    async registerTutor(data: {
      firstName: string;
      lastName?: string;
      email: string;
      password: string;
      specialization?: string;
      employeeNo?: string;
    }): Promise<AuthResponse> {
      const response = await fetch(`${API_BASE_URL}/auth/register/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    async registerParent(data: {
      firstName: string;
      lastName?: string;
      email: string;
      password: string;
      phoneNumber?: string;
      childStudentId?: string;
    }): Promise<AuthResponse> {
      const response = await fetch(`${API_BASE_URL}/auth/register/parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },

  // Courses & Subjects API
  courses: {
    async getAll(params?: { search?: string; tenantId?: string; page?: number; limit?: number }) {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.tenantId) query.append('tenantId', params.tenantId);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());

      const res = await fetch(`${API_BASE_URL}/courses?${query.toString()}`);
      return res.json();
    },

    async getMyCourses() {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/courses/my-courses`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getById(id: string) {
      const res = await fetch(`${API_BASE_URL}/courses/${id}`);
      return res.json();
    },

    async create(courseData: {
      title: string;
      code: string;
      description?: string;
      syllabus?: any;
    }) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(courseData),
      });
      return res.json();
    },

    async update(id: string, courseData: {
      title?: string;
      code?: string;
      description?: string;
      syllabus?: any;
    }) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(courseData),
      });
      return res.json();
    },

    async delete(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },
  },

  // Tutor Study Packages API
  packages: {
    async getAll(params?: { search?: string; tenantId?: string; page?: number; limit?: number }) {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.tenantId) query.append('tenantId', params.tenantId);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());

      const res = await fetch(`${API_BASE_URL}/packages?${query.toString()}`);
      return res.json();
    },

    async getMyPackages() {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/packages/my-packages`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getById(id: string) {
      const res = await fetch(`${API_BASE_URL}/packages/${id}`);
      return res.json();
    },

    async create(packageData: {
      title: string;
      description?: string;
      price?: number;
      billingCycle?: string;
      durationDays?: number;
      features?: string[];
      isPublished?: boolean;
      courseIds?: string[];
    }) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(packageData),
      });
      return res.json();
    },

    async update(id: string, packageData: any) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/packages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(packageData),
      });
      return res.json();
    },

    async delete(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/packages/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async subscribe(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/packages/${id}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getSubscribers(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/packages/${id}/subscribers`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getTeacherSubscribers(params?: { status?: string; search?: string }) {
      const token = api.token.get();
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE_URL}/packages/teacher/subscribers?${query.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async verifySlip(subscriptionId: string, action: 'APPROVE' | 'REJECT', notes?: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/packages/subscriptions/${subscriptionId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, notes }),
      });
      return res.json();
    },
  },

  // Live Video Classes API
  liveClasses: {
    async getAll(params?: { status?: string; courseId?: string; packageId?: string }) {
      const token = api.token.get();
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.courseId) query.append('courseId', params.courseId);
      if (params?.packageId) query.append('packageId', params.packageId);

      const res = await fetch(`${API_BASE_URL}/live-classes?${query.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getById(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/live-classes/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async create(data: {
      title: string;
      description?: string;
      topic?: string;
      courseId?: string;
      packageId?: string;
      startTime: string;
      durationMinutes?: number;
      platform?: 'JITSI' | 'GOOGLE_MEET' | 'ZOOM' | 'CUSTOM';
      meetingUrl?: string;
      meetingId?: string;
      passcode?: string;
      recordingUrl?: string;
    }) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/live-classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async update(id: string, data: any) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/live-classes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async updateStatus(id: string, status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED') {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/live-classes/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },

    async delete(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/live-classes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async join(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/live-classes/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },
  },

  // Assignments & Homework Grading API
  assignments: {
    async getAll(params?: { courseId?: string; status?: string; subjectName?: string; search?: string }) {
      const token = api.token.get();
      const query = new URLSearchParams();
      if (params?.courseId) query.append('courseId', params.courseId);
      if (params?.status) query.append('status', params.status);
      if (params?.subjectName) query.append('subjectName', params.subjectName);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE_URL}/assignments?${query.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getById(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/assignments/${id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async create(data: {
      title: string;
      instructions?: string;
      courseId?: string;
      subjectName?: string;
      topicName?: string;
      dueDate?: string;
      maxMarks?: number;
      status?: string;
      attachmentUrl?: string;
      attachmentName?: string;
    }) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async update(
      id: string,
      data: {
        title?: string;
        instructions?: string;
        courseId?: string;
        subjectName?: string;
        topicName?: string;
        dueDate?: string;
        maxMarks?: number;
        status?: string;
        attachmentUrl?: string;
        attachmentName?: string;
      }
    ) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/assignments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async delete(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/assignments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async submit(id: string, data: { textContent?: string; fileAttachmentUrl?: string; fileAttachmentName?: string }) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/assignments/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async gradeSubmission(
      submissionId: string,
      data: { marksObtained: number; teacherFeedback?: string; status?: string }
    ) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/assignments/submissions/${submissionId}/grade`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async getSubmissions(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/assignments/${id}/submissions`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getTeacherSubmissions(params?: { status?: string; assignmentId?: string; search?: string }) {
      const token = api.token.get();
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.assignmentId) query.append('assignmentId', params.assignmentId);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE_URL}/assignments/teacher/submissions?${query.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },
  },

  // Library Resources (Past Papers, Tutes, Books with Access Control)
  resources: {
    async getAll(params?: {
      resourceType?: string;
      subject?: string;
      year?: string | number;
      medium?: string;
      examType?: string;
      search?: string;
      mine?: boolean;
    }) {
      const token = api.token.get();
      const query = new URLSearchParams();
      if (params?.resourceType) query.append('resourceType', params.resourceType);
      if (params?.subject) query.append('subject', params.subject);
      if (params?.year) query.append('year', params.year.toString());
      if (params?.medium) query.append('medium', params.medium);
      if (params?.examType) query.append('examType', params.examType);
      if (params?.search) query.append('search', params.search);
      if (params?.mine) query.append('mine', 'true');

      const res = await fetch(`${API_BASE_URL}/resources?${query.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getById(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/resources/${id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async create(data: any) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async update(id: string, data: any) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/resources/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async delete(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/resources/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async recordView(id: string) {
      const res = await fetch(`${API_BASE_URL}/resources/${id}/view`, {
        method: 'POST',
      });
      return res.json();
    },

    async recordDownload(id: string) {
      const res = await fetch(`${API_BASE_URL}/resources/${id}/download`, {
        method: 'POST',
      });
      return res.json();
    },
  },

  // Online Quizzes & MCQs API
  quizzes: {
    async getAll(params?: { courseId?: string; search?: string }) {
      const token = api.token.get();
      const query = new URLSearchParams();
      if (params?.courseId) query.append('courseId', params.courseId);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE_URL}/quizzes?${query.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getById(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async create(data: any) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async update(id: string, data: any) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async delete(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async submitAttempt(id: string, data: { answers: Record<string, any>; timeSpentSeconds?: number }) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/quizzes/${id}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },

  // Teacher Studio Profile & Payout APIs
  teachers: {
    async getDashboard() {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/teachers/me/dashboard`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getMyProfile() {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/teachers/me`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async updateMyProfile(data: any) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/teachers/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async getPublicProfile(slugOrId: string) {
      const res = await fetch(`${API_BASE_URL}/teachers/public/${slugOrId}`);
      return res.json();
    },

    async getMarketplace(params?: {
      subject?: string;
      medium?: string;
      district?: string;
      search?: string;
    }) {
      const query = new URLSearchParams();
      if (params?.subject) query.append('subject', params.subject);
      if (params?.medium) query.append('medium', params.medium);
      if (params?.district) query.append('district', params.district);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE_URL}/teachers/marketplace?${query.toString()}`);
      return res.json();
    },
  },

  // Student Workspace APIs (Profile, Dashboard Cockpit, Learning Analytics)
  students: {
    async getMyProfile() {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/me`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async updateMyProfile(data: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
      gradeLevel?: string;
      section?: string;
    }) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async getDashboardOverview() {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/dashboard`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getMyCourses() {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/my-courses`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async enrollCourse(courseId: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getMyPackages() {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/my-packages`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async subscribePackage(packageId: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/packages/${packageId}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async checkoutPackage(packageId: string, data?: {
      paymentMethod?: string;
      bankRefNo?: string;
      slipUrl?: string;
      slipFileName?: string;
      paymentNotes?: string;
    }) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/packages/${packageId}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data || {}),
      });
      return res.json();
    },

    async getMyPurchases() {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/my-purchases`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getMyAssignments() {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/my-assignments`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async submitAssignment(assignmentId: string, data: { textContent?: string; fileAttachmentUrl?: string; fileAttachmentName?: string }) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async getMyResults() {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/my-results`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getMyLiveClasses() {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/my-live-classes`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async joinLiveClass(sessionId: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/live-classes/${sessionId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getMyTimetable() {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/students/my-timetable`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getMyLibraryResources(params?: {
      resourceType?: string;
      subject?: string;
      year?: string | number;
      medium?: string;
      search?: string;
    }) {
      const token = api.token.get();
      const query = new URLSearchParams();
      if (params?.resourceType) query.append('resourceType', params.resourceType);
      if (params?.subject) query.append('subject', params.subject);
      if (params?.year) query.append('year', params.year.toString());
      if (params?.medium) query.append('medium', params.medium);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE_URL}/students/my-resources?${query.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },
  },

  // Parent & Guardian Portal API
  parents: {
    async getMyChildren() {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/parents/children`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getDashboard(childId?: string) {
      const token = api.token.get();
      const query = childId ? `?childId=${encodeURIComponent(childId)}` : '';
      const res = await fetch(`${API_BASE_URL}/parents/dashboard${query}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async submitLeaveRequest(data: {
      childId: string;
      startDate: string;
      endDate?: string;
      reason: string;
      note: string;
      tutorName?: string;
    }) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/parents/leave-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async submitDepositSlip(data: {
      childId: string;
      packageId?: string;
      slipRefNumber: string;
      bankName?: string;
      branchName?: string;
      depositedDate?: string;
      amountLkr?: number;
      slipImageUrl?: string;
      tutorName?: string;
    }) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/parents/deposit-slip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },

  // Announcements & Notice Board API
  announcements: {
    async getAll(params?: { search?: string; priority?: string; audience?: string; role?: string }) {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.priority) query.append('priority', params.priority);
      if (params?.audience) query.append('audience', params.audience);
      if (params?.role) query.append('role', params.role);

      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/announcements?${query.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async getById(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async create(data: {
      title: string;
      message: string;
      targetAudience?: string;
      priority?: 'normal' | 'high' | 'urgent';
      isPinned?: boolean;
    }) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async update(id: string, data: Partial<{
      title: string;
      message: string;
      targetAudience: string;
      priority: 'normal' | 'high' | 'urgent';
      isPinned: boolean;
    }>) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    async delete(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },

    async togglePin(id: string) {
      const token = api.token.get();
      const res = await fetch(`${API_BASE_URL}/announcements/${id}/pin`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.json();
    },
  },

    // Super Admin Profile APIs
  superAdminProfile: {
    async get() {
      const token = api.token.get();

      const res = await fetch(`${API_BASE_URL}/super-admin/profile`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to fetch Super Admin profile');
      }

      return result;
    },

    async update(data: {
      fullName?: string | null;
      preferredName?: string | null;
      phone?: string | null;
      altPhone?: string | null;
      address?: string | null;
      city?: string | null;
      district?: string | null;
      province?: string | null;
      postalCode?: string | null;
      bio?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  languages?: string | null;
  rootAuthorityId?: string | null;
    }) {
      const token = api.token.get();

      const res = await fetch(`${API_BASE_URL}/super-admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to update Super Admin profile');
      }

      return result;
    },
  },

  // Sports Events and Registrations
  sports: {
    async getEvents(): Promise<SportsEvent[]> {
      const result = await sportsRequest<Array<{
        id: string;
        title: string;
        sportType: string;
        disciplineId: string | null;
        ageCategory: string | null;
        gender: string | null;
        fee: number;
        maxParticipants: number | null;
        description: string | null;
        isTeamSport: boolean;
        venue: string;
        startDate: string;
        endDate: string | null;
        status: SportsEventStatus;
        _count: { registrations: number };
        registrations: Array<{ userId: string }>;
      }>>('/events');
      return result.map((event) => ({
        id: event.id,
        title: event.title,
        sportType: event.sportType,
        disciplineId: event.disciplineId,
        ageCategory: event.ageCategory,
        gender: event.gender,
        fee: event.fee,
        maxParticipants: event.maxParticipants,
        description: event.description,
        isTeamSport: event.isTeamSport,
        venue: event.venue,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status,
        registrationCount: event._count.registrations,
        isRegistered: event.registrations.length > 0,
      }));
    },

    async getMyRegistrations(): Promise<SportsRegistration[]> {
      return sportsRequest<SportsRegistration[]>('/registrations/me');
    },

    async register(input: SportsRegistrationInput): Promise<SportsRegistration> {
      return sportsRequest<SportsRegistration>('/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async getDisciplines(): Promise<Array<SportsDiscipline & { events: SportsEvent[] }>> {
      const data = await sportsRequest<Array<SportsDiscipline & { events: Array<Record<string, unknown>> }>>(
        '/disciplines',
      );
      return data.map((discipline) => ({
        ...discipline,
        events: discipline.events.map((event) => ({
          id: String(event.id),
          title: String(event.title),
          sportType: String(event.sportType),
          disciplineId: typeof event.disciplineId === 'string' ? event.disciplineId : null,
          ageCategory: typeof event.ageCategory === 'string' ? event.ageCategory : null,
          gender: typeof event.gender === 'string' ? event.gender : null,
          fee: Number(event.fee) || 0,
          maxParticipants: typeof event.maxParticipants === 'number' ? event.maxParticipants : null,
          description: typeof event.description === 'string' ? event.description : null,
          isTeamSport: Boolean(event.isTeamSport),
          venue: String(event.venue),
          startDate: String(event.startDate),
          endDate: typeof event.endDate === 'string' ? event.endDate : null,
          status: event.status as SportsEventStatus,
          registrationCount: 0,
          isRegistered: false,
        })),
      }));
    },

    async createDiscipline(input: Omit<SportsDiscipline, 'id'>): Promise<SportsDiscipline> {
      return sportsRequest<SportsDiscipline>('/disciplines', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async createEvent(input: {
      disciplineId: string;
      title: string;
      sportType: string;
      ageCategory: string;
      gender: string;
      fee: number;
      maxParticipants: number;
      venue: string;
      startDate: string;
      description?: string;
      isTeamSport: boolean;
    }): Promise<SportsEvent> {
      return sportsRequest<SportsEvent>('/events', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async registerChampionship(input: {
      eventIds: string[];
      registrationNumber: string;
      athleteDetails: Record<string, unknown>;
    }): Promise<SportsRegistration[]> {
      return sportsRequest<SportsRegistration[]>('/registrations/championship', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async getRegistrations(): Promise<SportsRegistration[]> {
      return sportsRequest<SportsRegistration[]>('/registrations');
    },

    async updateRegistrationStatus(
      registrationNumber: string,
      status: 'Confirmed' | 'Pending' | 'Approved' | 'Rejected',
    ): Promise<void> {
      await sportsRequest<{ registrationNumber: string; status: string }>(
        `/registrations/${encodeURIComponent(registrationNumber)}/status`,
        { method: 'PATCH', body: JSON.stringify({ status }) },
      );
    },

    async getTeams(): Promise<SportsTeamRecord[]> {
      return sportsRequest<SportsTeamRecord[]>('/teams');
    },

    async createTeam(input: Omit<SportsTeamRecord, 'id' | 'playersCount'>): Promise<SportsTeamRecord> {
      return sportsRequest<SportsTeamRecord>('/teams', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async getTournaments(): Promise<SportsTournamentRecord[]> {
      return sportsRequest<SportsTournamentRecord[]>('/tournaments');
    },

    async createTournament(
      input: Omit<SportsTournamentRecord, 'id' | 'teamsCount' | 'champion' | 'runnerUp'>,
    ): Promise<SportsTournamentRecord> {
      return sportsRequest<SportsTournamentRecord>('/tournaments', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async updateTournament(
      id: string,
      input: Partial<Omit<SportsTournamentRecord, 'id'>>,
    ): Promise<SportsTournamentRecord> {
      return sportsRequest<SportsTournamentRecord>(`/tournaments/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
    },

    async deleteTournament(id: string): Promise<void> {
      await sportsRequest<{ id: string }>(`/tournaments/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },

    async getFixtures(): Promise<SportsFixtureRecord[]> {
      return sportsRequest<SportsFixtureRecord[]>('/fixtures');
    },

    async createFixture(
      input: Omit<SportsFixtureRecord, 'id' | 'homeDistrict' | 'awayDistrict' | 'roundName' | 'homeScore' | 'awayScore' | 'outcome' | 'recordedAt' | 'tournamentId'> & { tournamentId?: string | null },
    ): Promise<SportsFixtureRecord> {
      return sportsRequest<SportsFixtureRecord>('/fixtures', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async recordFixtureResult(
      id: string,
      input: { homeScore: string; awayScore: string; outcome: string },
    ): Promise<SportsFixtureRecord> {
      return sportsRequest<SportsFixtureRecord>(`/fixtures/${encodeURIComponent(id)}/result`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
    },

    async getStandings(): Promise<SportsStandingRecord[]> {
      return sportsRequest<SportsStandingRecord[]>('/standings');
    },
  },

  // School Admin Workspace APIs
  admin: {
    async getOverview() {
      const token = api.token.get();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/admin/overview`, { headers });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch admin overview');
      return data.data;
    },
    async getStaff() {
      const token = api.token.get();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/admin/staff`, { headers });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch staff');
      return data.data;
    },
    async createStaff(input: any) {
      const token = api.token.get();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/admin/staff`, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create staff');
      return data.data;
    },
    async updateStaff(id: string, input: any) {
      const token = api.token.get();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/admin/staff/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update staff');
      return data.data;
    },
    async updateStaffStatus(id: string, status: string) {
      const token = api.token.get();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/admin/staff/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update staff status');
      return data.data;
    },
    async getStudents(search?: string) {
      const token = api.token.get();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const url = new URL(`${API_BASE_URL}/admin/students`);
      if (search) url.searchParams.set('search', search);
      const res = await fetch(url.toString(), { headers });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch students');
      return data.data;
    },
    async createStudent(input: { name: string; email: string; grade?: string; section?: string; studentIdNo?: string }) {
      const token = api.token.get();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/admin/students`, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create student');
      return data.data;
    },
    async deleteUser(id: string) {
      const token = api.token.get();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/admin/users/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete user');
      return data;
    },
    async updateStudentStatus(id: string, status: string) {
      const token = api.token.get();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/admin/students/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update student status');
      return data.data;
    },
    async getSettings() {
      const token = api.token.get();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/admin/settings`, { headers });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch settings');
      return data.data;
    },
    async updateSettings(settingsData: any) {
      const token = api.token.get();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settingsData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save settings');
      return data.data;
    },
  },

  // Token and Local Storage Helpers
  token: {
    get(): string | null {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('lms_token');
    },
    set(token: string): void {
      if (typeof window === 'undefined') return;
      localStorage.setItem('lms_token', token);
    },
    remove(): void {
      if (typeof window === 'undefined') return;
      localStorage.removeItem('lms_token');
    },
  },

  user: {
    get(): any | null {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem('lms_user');
      return data ? JSON.parse(data) : null;
    },
    set(user: any): void {
      if (typeof window === 'undefined') return;
      localStorage.setItem('lms_user', JSON.stringify(user));
    },
    remove(): void {
      if (typeof window === 'undefined') return;
      localStorage.removeItem('lms_user');
    },
  },
};
