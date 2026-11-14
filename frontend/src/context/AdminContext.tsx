"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import {
  AdminDirectoryUser,
  AdminRecordStatus,
  AdminStaffRecord,
  AdminSubjectRecord,
  HubAuditEntry,
  HubFlag,
  HubFlagAction,
  HubSettings,
  Subscription,
  StaffInput,
  TeacherHub,
  TeacherHubStatus
} from '@/types/lms';
export interface AdminOverviewData {
  school: {
    id: string;
    name: string;
    domain: string;
    status: string;
    plan: string;
  };
  kpis: {
    totalStudents: number;
    totalTeachers: number;
    totalStaff: number;
    totalCourses: number;
    totalClasses: number;
    totalSubjects: number;
    totalAssignments: number;
    totalAnnouncements: number;
    activeAttendanceRate: string;
    systemHealth: string;
  };
  recentStudents: any[];
  recentStaff: any[];
}

export interface SchoolSettingsData {
  id: string;
  name: string;
  domain?: string;
  branding?: {
    motto?: string;
    phone?: string;
    email?: string;
    address?: string;
    academicYear?: string;
    principalName?: string;
    logoUrl?: string;
  };
  classes?: any[];
  subjects?: any[];
}

interface AdminContextValue {
  schoolId: string;
  staff: AdminStaffRecord[];
  subjects: AdminSubjectRecord[];
  directory: AdminDirectoryUser[];
  overviewData: AdminOverviewData | null;
  schoolSettings: SchoolSettingsData | null;
  isLoading: boolean;
  refreshAdminData: () => Promise<void>;
  updateStaffStatus: (id: string, status: AdminRecordStatus) => void;
  createStaff: (input: StaffInput) => { ok: boolean; error?: string };
  updateStaff: (id: string, input: StaffInput) => { ok: boolean; error?: string };
  teacherHubs: TeacherHub[];
  subscriptions: Subscription[];
  hubFlags: HubFlag[];
  hubSettings: HubSettings;
  auditLog: HubAuditEntry[];
  setHubStatus: (id: string, status: TeacherHubStatus, reason: string) => void;
  actOnHubFlag: (id: string, action: HubFlagAction, reason: string) => void;
  removeSubscription: (id: string, reason: string) => void;
  updateHubSettings: (settings: HubSettings) => void;
  updateDirectoryStatus: (id: string, status: AdminRecordStatus) => void;
  saveSchoolSettings: (settings: Partial<SchoolSettingsData>) => Promise<boolean>;
}

export function useTeacherHubs() { return useAdmin().teacherHubs; }
export function useSubscriptions() { return useAdmin().subscriptions; }
export function useHubFlags() { return useAdmin().hubFlags; }
export function useHubSettings() { return useAdmin().hubSettings; }

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, addToast } = useApp();
  const [staff, setStaff] = useState<AdminStaffRecord[]>([]);
  const [directory, setDirectory] = useState<AdminDirectoryUser[]>([]);
  const [overviewData, setOverviewData] = useState<AdminOverviewData | null>(null);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [teacherHubs, setTeacherHubs] = useState<TeacherHub[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [hubFlags, setHubFlags] = useState<HubFlag[]>([]);
  const [hubSettings, setHubSettings] = useState<HubSettings>({
    schoolId: currentUser.schoolId || 'sch_apex_01',
    enabled: false,
    approvalRequired: true,
    allowDirectMessages: false,
  });
  const [auditLog, setAuditLog] = useState<HubAuditEntry[]>([]);
  const schoolId = currentUser.schoolId || 'sch_apex_01';

  // Fetch live staff, students directory, overview KPIs, and settings from backend
  const fetchAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [staffRes, studentsRes, overviewRes, settingsRes] = await Promise.allSettled([
        api.admin.getStaff(),
        api.admin.getStudents(),
        api.admin.getOverview(),
        api.admin.getSettings(),
      ]);

      if (staffRes.status === 'fulfilled' && Array.isArray(staffRes.value)) {
        setStaff(staffRes.value);
      }
      if (studentsRes.status === 'fulfilled' && Array.isArray(studentsRes.value)) {
        setDirectory(studentsRes.value);
      }
      if (overviewRes.status === 'fulfilled' && overviewRes.value) {
        setOverviewData(overviewRes.value);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value) {
        setSchoolSettings(settingsRes.value);
      }
    } catch (err) {
      console.error('Failed to sync admin data from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, [schoolId]);

  const value = useMemo<AdminContextValue>(() => ({
    schoolId,
    staff,
    subjects: [] as AdminSubjectRecord[],
    directory,
    overviewData,
    schoolSettings,
    isLoading,
    refreshAdminData: fetchAllAdminData,
    teacherHubs: teacherHubs.filter((hub) => hub.schoolId === schoolId),
    subscriptions: subscriptions.filter((subscription) => subscription.schoolId === schoolId),
    hubFlags: hubFlags.filter((flag) => flag.schoolId === schoolId),
    hubSettings: { ...hubSettings, schoolId },
    auditLog: auditLog.filter((entry) => entry.schoolId === schoolId),

    updateStaffStatus: (id, status) => {
      // Optimistic state update
      setStaff((records) => records.map((record) => record.id === id ? { ...record, status } : record));
      // Persist to backend database
      api.admin.updateStaffStatus(id, status).catch((err) => {
        console.error('Error persisting staff status:', err);
      });
    },

    createStaff: (input) => {
      if (staff.some((record) => record.email.toLowerCase() === input.email.toLowerCase() || record.staffId.toLowerCase() === input.staffId.toLowerCase())) {
        return { ok: false, error: 'A staff member with this email or staff ID already exists.' };
      }
      const newLocalRecord: AdminStaffRecord = {
        id: `staff_${Date.now()}`,
        schoolId,
        name: input.name,
        email: input.email,
        role: input.role,
        staffId: input.staffId,
        photo: input.photo,
        phone: input.phone,
        gender: input.gender,
        dateOfBirth: input.dateOfBirth,
        joiningDate: input.joiningDate,
        status: input.status,
        qualification: input.qualification,
        subjects: input.subjects,
        classes: input.classes,
        classTeacherOf: input.classTeacherOf,
        medium: input.medium,
        sport: input.sports?.[0],
        teams: input.teams,
        certification: input.certification,
        availability: input.availability,
        workload: 0,
      };
      setStaff((records) => [newLocalRecord, ...records]);

      // Persist to backend
      api.admin.createStaff({
        name: input.name,
        email: input.email,
        role: input.role,
        staffId: input.staffId,
        phone: input.phone,
        qualification: input.qualification,
        subjects: input.subjects,
        classes: input.classes,
        medium: input.medium,
        status: input.status,
      }).then((saved) => {
        if (saved?.id) {
          setStaff((records) => records.map((r) => r.id === newLocalRecord.id ? { ...r, id: saved.id } : r));
        }
      }).catch((err) => {
        console.error('Failed to create staff in backend:', err);
      });

      return { ok: true };
    },

    updateStaff: (id, input) => {
      const duplicate = staff.some((record) => record.id !== id && (record.email.toLowerCase() === input.email.toLowerCase() || record.staffId.toLowerCase() === input.staffId.toLowerCase()));
      if (duplicate) return { ok: false, error: 'A staff member with this email or staff ID already exists.' };

      setStaff((records) => records.map((record) => record.id === id ? {
        ...record,
        name: input.name,
        email: input.email,
        role: input.role,
        staffId: input.staffId,
        photo: input.photo,
        phone: input.phone,
        gender: input.gender,
        dateOfBirth: input.dateOfBirth,
        joiningDate: input.joiningDate,
        status: input.status,
        qualification: input.qualification,
        subjects: input.subjects,
        classes: input.classes,
        classTeacherOf: input.classTeacherOf,
        medium: input.medium,
        sport: input.sports?.[0],
        teams: input.teams,
        certification: input.certification,
        availability: input.availability
      } : record));

      // Persist to backend
      api.admin.updateStaff(id, {
        name: input.name,
        email: input.email,
        role: input.role,
        staffId: input.staffId,
        phone: input.phone,
        qualification: input.qualification,
        subjects: input.subjects,
        classes: input.classes,
        medium: input.medium,
        status: input.status,
      }).catch((err) => {
        console.error('Failed to update staff in backend:', err);
      });

      return { ok: true };
    },

    updateDirectoryStatus: (id, status) => {
      setDirectory((users) => users.map((user) => user.id === id ? { ...user, status } : user));
      api.admin.updateStudentStatus(id, status).catch((err) => {
        console.error('Failed to update student status in backend:', err);
      });
    },

    saveSchoolSettings: async (settingsData) => {
      try {
        const saved = await api.admin.updateSettings(settingsData);
        if (saved) {
          setSchoolSettings((prev) => ({ ...(prev || {}), ...saved } as SchoolSettingsData));
          addToast({ type: 'success', title: 'School settings saved to cloud successfully.' });
          return true;
        }
      } catch (err: any) {
        console.error('Error saving school settings:', err);
        addToast({ type: 'error', title: err.message || 'Failed to save school settings.' });
      }
      return false;
    },

    setHubStatus: (id, status, reason) => {
      setTeacherHubs((hubs) => hubs.map((hub) => hub.id === id ? { ...hub, status } : hub));
      setAuditLog((entries) => [...entries, { id: `audit_${Date.now()}`, schoolId, adminId: currentUser.id, action: status, targetId: id, reason, createdAt: new Date().toISOString() }]);
    },
    actOnHubFlag: (id, action, reason) => {
      const status = action === 'dismiss' ? 'dismissed' : action === 'hide' ? 'hidden' : action === 'remove' ? 'removed' : 'warned';
      setHubFlags((flags) => flags.map((flag) => flag.id === id ? { ...flag, status, actionReason: reason } : flag));
      setAuditLog((entries) => [...entries, { id: `audit_${Date.now()}`, schoolId, adminId: currentUser.id, action, targetId: id, reason, createdAt: new Date().toISOString() }]);
    },
    removeSubscription: (id, reason) => {
      setSubscriptions((items) => items.map((item) => item.id === id ? { ...item, status: 'removed' } : item));
      setAuditLog((entries) => [...entries, { id: `audit_${Date.now()}`, schoolId, adminId: currentUser.id, action: 'remove_subscriber', targetId: id, reason, createdAt: new Date().toISOString() }]);
    },
    updateHubSettings: (settings) => {
      setHubSettings({ ...settings, schoolId });
      setAuditLog((entries) => [...entries, { id: `audit_${Date.now()}`, schoolId, adminId: currentUser.id, action: 'settings_change', targetId: schoolId, createdAt: new Date().toISOString() }]);
    }
  }), [auditLog, currentUser.id, directory, hubFlags, hubSettings, isLoading, overviewData, schoolId, schoolSettings, staff, subscriptions, teacherHubs]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
}

export function useStaff() {
  return useAdmin().staff;
}

export function useCreateStaff() {
  return useAdmin().createStaff;
}

export function useUpdateStaff() {
  return useAdmin().updateStaff;
}

export function useSetStaffStatus() {
  return useAdmin().updateStaffStatus;
}

export function useSubjects() {
  return useAdmin().subjects;
}

export function useDirectory() {
  return useAdmin().directory;
}

export function useAdminOverview() {
  return useAdmin().overviewData;
}

export function useSchoolSettings() {
  return useAdmin().schoolSettings;
}
