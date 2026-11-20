import type { Tenant, TenantType } from '@/types/tenant';

interface BackendTenantSettings {
  type?: TenantType;
  adminEmail?: string;
  contactPhone?: string;
  adminName?: string;
  studentCount?: number;
  teacherCount?: number;
  monthlyFeeLkr?: number;
  enabledFeatures?: Record<string, boolean>;
  renewalDate?: string;
  primaryColor?: string;
  address?: string;
  tagline?: string;
  subjects?: Array<string | { name?: string | null }>;
  [key: string]: unknown;
}

interface BackendTenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  settings?: BackendTenantSettings | null;
  courses?: Array<string | { id?: string; title?: string; code?: string }>;
  createdAt: string;
  _count?: {
    users?: number;
    courses?: number;
  };
}

export function mapBackendTenant(data: BackendTenant): Tenant {
  const settings: BackendTenantSettings = data.settings ?? {};

  const plan = data.plan.toLowerCase();
  const status = data.status.toLowerCase();

  const subjectsList: string[] = Array.isArray(settings.subjects)
    ? settings.subjects
        .map((s) => (typeof s === 'string' ? s : s?.name))
        .filter((name): name is string => Boolean(name))
    : [];

  const coursesList: string[] = Array.isArray(data.courses)
    ? data.courses
        .map((c) => (typeof c === 'string' ? c : c?.title))
        .filter((title): title is string => Boolean(title))
    : [];

  return {
    id: data.id,
    name: data.name,
    code: data.slug,
    type: settings.type ?? 'individual_teacher',
    plan: plan === 'starter' || plan === 'enterprise' ? plan : 'pro',
    status:
  status === 'trial'
    ? 'trial'
    : status === 'suspended'
      ? 'suspended'
      : status === 'inactive'
        ? 'inactive'
        : 'active',
    contactEmail: settings.adminEmail ?? '',
    contactPhone: settings.contactPhone ?? '',
    adminName: settings.adminName ?? '',
    studentCount: settings.studentCount ?? 0,
    teacherCount: settings.teacherCount ?? 0,
    monthlyFeeLkr: settings.monthlyFeeLkr ?? 0,
    enabledFeatures: settings.enabledFeatures ?? {},
    createdAt: data.createdAt,
    renewalDate: settings.renewalDate ?? '',
    primaryColor: settings.primaryColor,
    address: settings.address,
    tagline: settings.tagline,
    subjects: subjectsList,
    courses: coursesList,
  };
}
