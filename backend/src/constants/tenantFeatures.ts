export const TENANT_FEATURE_HIERARCHY = {
  batch_management: [
    'sub_batches_cohorts',
    'sub_batches_assistants',
    'sub_batches_attendance',
    'sub_batches_announcements',
    'sub_batches_timetable',
  ],
  tuition_subscriptions: [
    'find_teachers',
    'sub_connect_find_teachers',
    'sub_connect_subscriptions',
    'sub_connect_study_groups',
    'sub_tuition_plans',
    'sub_tuition_slips',
    'sub_tuition_online_pay',
    'sub_tuition_discounts',
    'sub_tuition_auto_lock',
  ],
  course_marketplace: [
    'sub_market_standalone_papers',
    'sub_market_video_bundles',
    'sub_market_digital_receipts',
  ],
  live_broadcast_studio: [
    'sub_live_google_meet',
    'sub_live_zoom',
    'sub_live_sms_alerts',
    'sub_live_recordings',
    'sub_live_doubt_chat',
  ],
  syllabus_builder: [
    'sub_syllabus_units',
    'sub_syllabus_video',
    'sub_syllabus_quizzes',
    'sub_syllabus_past_papers',
    'sub_syllabus_digital_books',
  ],
  assignments_grading: [
    'sub_assign_student_upload',
    'sub_assign_teacher_rubrics',
    'sub_assign_model_exams',
    'sub_assign_report_cards',
    'sub_assign_study_groups',
  ],
  tutor_branding: [
    'sub_brand_custom_domain',
    'sub_brand_logo_theme',
    'sub_brand_whatsapp_bot',
    'sub_brand_revenue_analytics',
  ],
} as const;

export type TenantParentFeature = keyof typeof TENANT_FEATURE_HIERARCHY;

export type TenantChildFeature =
  (typeof TENANT_FEATURE_HIERARCHY)[TenantParentFeature][number];

export type TenantFeatureKey =
  | TenantParentFeature
  | TenantChildFeature;

export const TENANT_FEATURE_KEYS: readonly TenantFeatureKey[] = [
  ...Object.keys(TENANT_FEATURE_HIERARCHY) as TenantParentFeature[],
  ...Object.values(TENANT_FEATURE_HIERARCHY).flat(),
];

export const TENANT_FEATURE_PARENT_MAP: Record<string, TenantParentFeature> =
  Object.fromEntries(
    Object.entries(TENANT_FEATURE_HIERARCHY).flatMap(([parent, children]) =>
      children.map((child) => [child, parent])
    )
  ) as Record<string, TenantParentFeature>;

export type TenantFeatureValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export const validateTenantFeatures = (
  config: Record<string, unknown>
): TenantFeatureValidationResult => {
  const allowedKeys = new Set<string>(TENANT_FEATURE_KEYS);

  for (const [key, value] of Object.entries(config)) {
    if (!allowedKeys.has(key)) {
      return {
        valid: false,
        message: `Unknown tenant feature: ${key}`,
      };
    }

    if (typeof value !== 'boolean') {
      return {
        valid: false,
        message: `Feature "${key}" must have a boolean value.`,
      };
    }
  }

  for (const [parent, children] of Object.entries(TENANT_FEATURE_HIERARCHY)) {
    const parentEnabled = config[parent] === true;

    for (const child of children) {
      if (config[child] === true && !parentEnabled) {
        return {
          valid: false,
          message: `Feature "${child}" cannot be enabled while parent "${parent}" is disabled.`,
        };
      }
    }
  }

  return { valid: true };
};
