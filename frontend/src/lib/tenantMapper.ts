import type { Tenant } from '@/types/tenant';

interface BackendTenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  settings?: Record<string, any> | null;
  courses?: Array<{ id: string; title: string; code: string }>;
  createdAt: string;
  _count?: {
    users?: number;
    courses?: number;
  };
}

export function mapBackendTenant(data: BackendTenant): Tenant {
  const settings = data.settings ?? {};

  const plan = data.plan.toLowerCase();
  const status = data.status.toLowerCase();

  const subjectsList: string[] = Array.isArray(settings.subjects)
    ? settings.subjects.map((s: any) => typeof s === 'string' ? s : s?.name).filter(Boolean)
    : [];

  const coursesList: string[] = Array.isArray(data.courses)
    ? data.courses.map((c: any) => typeof c === 'string' ? c : c?.title).filter(Boolean)
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
