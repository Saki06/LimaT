// Central SaaS plan catalog (prices in LKR / month).
// Feature keys are the parent module keys; the frontend expands them to sub-options.
export type SaasPlanId = 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface SaasPlan {
  id: SaasPlanId;
  name: string;
  monthlyFeeLkr: number;
  studentLimit: number | null; // null = unlimited
  enabledFeatures: Record<string, boolean>;
}

export const SAAS_PLANS: Record<SaasPlanId, SaasPlan> = {
  STARTER: {
    id: 'STARTER',
    name: 'Solo Creator Starter',
    monthlyFeeLkr: 5000,
    studentLimit: 100,
    enabledFeatures: {
      batch_management: true,
      tuition_subscriptions: true,
      course_marketplace: true,
      live_broadcast_studio: false,
      syllabus_builder: true,
      assignments_grading: true,
      tutor_branding: false,
    },
  },
  PRO: {
    id: 'PRO',
    name: 'Solo Educator Pro',
    monthlyFeeLkr: 10000,
    studentLimit: null,
    enabledFeatures: {
      batch_management: true,
      tuition_subscriptions: true,
      course_marketplace: true,
      live_broadcast_studio: true,
      syllabus_builder: true,
      assignments_grading: true,
      tutor_branding: false,
    },
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Solo Masterclass Elite',
    monthlyFeeLkr: 15000,
    studentLimit: null,
    enabledFeatures: {
      batch_management: true,
      tuition_subscriptions: true,
      course_marketplace: true,
      live_broadcast_studio: true,
      syllabus_builder: true,
      assignments_grading: true,
      tutor_branding: true,
    },
  },
};

export const isSaasPlanId = (value: unknown): value is SaasPlanId =>
  typeof value === 'string' && value in SAAS_PLANS;

