// Multi-Tenant SaaS, Hierarchical Modules and Sub-Feature Domain Types

export type TenantType = 'school' | 'tuition_center' | 'individual_teacher';

export type TenantPlan = 'starter' | 'pro' | 'enterprise';

export type TenantStatus = 'active' | 'inactive' | 'trial' | 'suspended';

export type FeatureCategory =
  | 'Batch Management & Announcements'
  | 'Tuition & Commercial Billing'
  | 'Live Broadcast & Studio'
  | 'Curriculum & Digital Learning'
  | 'Assessments & Examinations'
  | 'Tutor Branding & Monetization';

export type TargetRoleScope = 'student' | 'teacher' | 'admin' | 'shared';

export type TenantFeature = string;

export interface TenantSubOption {
  key: string;
  label: string;
  description: string;
}

export interface TenantModuleConfig {
  key: string;
  label: string;
  category: FeatureCategory;
  description: string;
  badge?: string;
  targetRole: TargetRoleScope;
  subOptions: TenantSubOption[];
}

export interface Tenant {
  id: string;
  name: string;
  code: string;
  type: TenantType;
  logo?: string;
  plan: TenantPlan;
  status: TenantStatus;
  contactEmail: string;
  contactPhone: string;
  adminName: string;
  studentCount: number;
  teacherCount: number;
  monthlyFeeLkr: number;
  enabledFeatures: Record<string, boolean>;
  createdAt: string;
  renewalDate: string;
  primaryColor?: string;
  address?: string;
  tagline?: string;
  googleMeetLink?: string;
}

export interface TenantPreset {
  id: string;
  name: string;
  type: TenantType;
  description: string;
  icon: string;
  features: Record<string, boolean>;
}
