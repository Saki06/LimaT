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
