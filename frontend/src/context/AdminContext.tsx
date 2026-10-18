"use client";

import React, { createContext, useContext, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { initialAdminDirectory, initialAdminStaff, initialAdminSubjects } from '@/data/adminMockData';
import { AdminDirectoryUser, AdminRecordStatus, AdminStaffRecord, AdminSubjectRecord, HubAuditEntry, HubFlag, HubFlagAction, HubSettings, Subscription, StaffInput, TeacherHub, TeacherHubStatus } from '@/types/lms';
import { initialAdminSubscriptions, initialHubFlags, initialHubSettings, initialTeacherHubs } from '@/data/adminConnectMockData';

interface AdminContextValue {
  schoolId: string;
  staff: AdminStaffRecord[];
  subjects: AdminSubjectRecord[];
  directory: AdminDirectoryUser[];
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
}

export function useTeacherHubs() { return useAdmin().teacherHubs; }
export function useSubscriptions() { return useAdmin().subscriptions; }
export function useHubFlags() { return useAdmin().hubFlags; }
export function useHubSettings() { return useAdmin().hubSettings; }

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  const [staff, setStaff] = useState(initialAdminStaff);
  const [directory, setDirectory] = useState(initialAdminDirectory);
  const [teacherHubs, setTeacherHubs] = useState(initialTeacherHubs);
  const [subscriptions, setSubscriptions] = useState(initialAdminSubscriptions);
  const [hubFlags, setHubFlags] = useState(initialHubFlags);
  const [hubSettings, setHubSettings] = useState(initialHubSettings);
  const [auditLog, setAuditLog] = useState<HubAuditEntry[]>([]);
  const schoolId = currentUser.schoolId;

  const value = useMemo<AdminContextValue>(() => ({
    schoolId,
    staff: staff.filter((record) => record.schoolId === schoolId),
    subjects: initialAdminSubjects.filter((subject) => subject.schoolId === schoolId),
    directory: directory.filter((user) => user.schoolId === schoolId),
    teacherHubs: teacherHubs.filter((hub) => hub.schoolId === schoolId),
    subscriptions: subscriptions.filter((subscription) => subscription.schoolId === schoolId),
    hubFlags: hubFlags.filter((flag) => flag.schoolId === schoolId),
    hubSettings: { ...hubSettings, schoolId },
    auditLog: auditLog.filter((entry) => entry.schoolId === schoolId),
    updateStaffStatus: (id, status) => {
      setStaff((records) => records.map((record) => record.id === id ? { ...record, status } : record));
    },
    createStaff: (input) => {
      if (staff.some((record) => record.schoolId === schoolId && (record.email.toLowerCase() === input.email.toLowerCase() || record.staffId.toLowerCase() === input.staffId.toLowerCase()))) {
        return { ok: false, error: 'A staff member with this email or staff ID already exists.' };
      }
      const record: AdminStaffRecord = {
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
        sport: input.sports[0],
        teams: input.teams,
        certification: input.certification,
        availability: input.availability,
        workload: 0
      };
      setStaff((records) => [...records, record]);
      return { ok: true };
    },
    updateStaff: (id, input) => {
      const duplicate = staff.some((record) => record.schoolId === schoolId && record.id !== id && (record.email.toLowerCase() === input.email.toLowerCase() || record.staffId.toLowerCase() === input.staffId.toLowerCase()));
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
        sport: input.sports[0],
        teams: input.teams,
        certification: input.certification,
        availability: input.availability
      } : record));
      return { ok: true };
    },
    updateDirectoryStatus: (id, status) => {
      setDirectory((users) => users.map((user) => user.id === id ? { ...user, status } : user));
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
  }), [auditLog, currentUser.id, directory, hubFlags, hubSettings, schoolId, staff, subscriptions, teacherHubs]);

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
