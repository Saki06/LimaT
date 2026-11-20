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

export type TenantModuleFeature =
  | 'batch_management'
  | 'tuition_subscriptions'
  | 'course_marketplace'
  | 'live_broadcast_studio'
  | 'syllabus_builder'
  | 'assignments_grading'
  | 'tutor_branding';

export type TenantSubFeature =
  | 'sub_batches_cohorts'
  | 'sub_batches_assistants'
  | 'sub_batches_attendance'
  | 'sub_batches_announcements'
  | 'sub_batches_timetable'
  | 'find_teachers'
  | 'sub_connect_find_teachers'
  | 'sub_connect_subscriptions'
  | 'sub_connect_study_groups'
  | 'sub_tuition_plans'
  | 'sub_tuition_slips'
  | 'sub_tuition_online_pay'
  | 'sub_tuition_discounts'
  | 'sub_tuition_auto_lock'
  | 'sub_market_standalone_papers'
  | 'sub_market_video_bundles'
  | 'sub_market_digital_receipts'
  | 'sub_live_google_meet'
  | 'sub_live_zoom'
  | 'sub_live_sms_alerts'
  | 'sub_live_recordings'
  | 'sub_live_doubt_chat'
  | 'sub_syllabus_units'
  | 'sub_syllabus_video'
  | 'sub_syllabus_quizzes'
  | 'sub_syllabus_past_papers'
  | 'sub_syllabus_digital_books'
  | 'sub_assign_student_upload'
  | 'sub_assign_teacher_rubrics'
  | 'sub_assign_model_exams'
  | 'sub_assign_report_cards'
  | 'sub_assign_study_groups'
  | 'sub_brand_custom_domain'
  | 'sub_brand_logo_theme'
  | 'sub_brand_whatsapp_bot'
  | 'sub_brand_revenue_analytics'
  | 'sub_tutor_saas_subscription'
  | 'sub_tutor_card_payment'
  | 'sub_tutor_bank_slip_payment';

export type TenantFeature = TenantModuleFeature | TenantSubFeature;

export interface TenantSubOption {
  key: TenantSubFeature;
  label: string;
  description: string;
}

export interface TenantModuleConfig {
  key: TenantModuleFeature;
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
  enabledFeatures: Partial<Record<TenantFeature, boolean>>;
  createdAt: string;
  renewalDate: string;
  primaryColor?: string;
  address?: string;
  tagline?: string;
  googleMeetLink?: string;
  subjects?: string[];
  courses?: string[];
}

export interface TenantPreset {
  id: string;
  name: string;
  type: TenantType;
  description: string;
  icon: string;
  features: Partial<Record<TenantFeature, boolean>>;
}
