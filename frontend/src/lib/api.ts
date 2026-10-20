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

export const api = {
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

  // Teacher Studio Profile & Payout APIs
  teachers: {
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
