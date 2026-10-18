import { Tenant, TenantModuleConfig, TenantPreset } from '@/types/tenant';

export const HIERARCHICAL_MODULES: TenantModuleConfig[] = [
  // =========================================================================
  // 1. BATCH MANAGEMENT & ANNOUNCEMENTS (Tutor Batches)
  // =========================================================================
  {
    key: 'batch_management',
    label: 'Student Batches & Class Cohorts',
    category: 'Batch Management & Announcements',
    targetRole: 'shared',
    description: 'Manage A/L candidate batches (Theory, Revision, Paper Class) with live join attendance registers.',
    badge: 'Batch Control',
    subOptions: [
      {
        key: 'sub_batches_cohorts',
        label: 'Course Batches (Theory, Revision, Paper Class)',
        description: 'Configure batch schedules, enrollment caps, and batch titles.'
      },
      {
        key: 'sub_batches_assistants',
        label: 'Assistant Tutor & Paper Marker Access',
        description: 'Assign marking assistants with paper grading and session moderation permissions.'
      },
      {
        key: 'sub_batches_attendance',
        label: 'Live Class Join Register & Student Logs',
        description: 'Track student attendance in live sessions and export monthly student attendance sheets.'
      },
      {
        key: 'sub_batches_announcements',
        label: 'Urgent Class Notice & Sticky Banner',
        description: 'Broadcast time changes, urgent circulars, and exam alerts directly to student dashboards.'
      },
      {
        key: 'sub_batches_timetable',
        label: 'Downloadable Class Schedule & Timetable PDFs',
        description: 'Share monthly master schedules and paper discussion timetables.'
      }
    ]
  },

  // =========================================================================
  // 2. TUITION & COMMERCIAL BILLING (Tutors)
  // =========================================================================
  {
    key: 'tuition_subscriptions',
    label: 'Find Teachers & Tuition Connect Hub',
    category: 'Tuition & Commercial Billing',
    targetRole: 'shared',
    description: 'Student recurring monthly tuition subscriptions, Find Teachers directory, and automated access control.',
    badge: 'Tuition Core',
    subOptions: [
      {
        key: 'find_teachers',
        label: 'Find Teachers Sidebar Menu (Student Workspace)',
        description: 'Show or hide the Find Teachers option in the student navigation sidebar.'
      },
      {
        key: 'sub_connect_find_teachers',
        label: 'Option 1: Find Teachers (Tutor Discovery Tab)',
        description: 'Enable or disable the Find Teachers tab in the student workspace to browse tutors, lesson plans, and fees.'
      },
      {
        key: 'sub_connect_subscriptions',
        label: 'Option 2: Subscriptions & Invoices Tab',
        description: 'Enable or disable the Subscriptions & Invoices tab in the student workspace for viewing active plans and tax receipts.'
      },
      {
        key: 'sub_connect_study_groups',
        label: 'Option 3: Peer Study Groups Tab',
        description: 'Enable or disable the Study Groups collaboration tab in the student workspace for peer study circles.'
      },
      {
        key: 'sub_tuition_plans',
        label: 'Custom Tiered Tuition Plans (LKR)',
        description: 'Create monthly fee plans (e.g., Theory: LKR 2,500/mo, Revision: LKR 3,500/mo).'
      },
      {
        key: 'sub_tuition_slips',
        label: 'Bank Deposit Slip Upload & Manual Verification',
        description: 'Students upload BOC, Commercial Bank, or HNB receipts with reference numbers for approval.'
      },
      {
        key: 'sub_tuition_online_pay',
        label: 'Online Visa / Mastercard & LANKAQR',
        description: 'Direct instant online card checkout with automated invoice activation.'
      },
      {
        key: 'sub_tuition_discounts',
        label: 'Scholarship & Promo Discount Codes',
        description: 'Provide fee waivers, sibling discounts, and early-bird promotional codes.'
      },
      {
        key: 'sub_tuition_auto_lock',
        label: 'Auto-Lock Unpaid Accounts on Expiry',
        description: 'Automatically restrict class recordings and live streams when monthly fees expire.'
      }
    ]
  },
  {
    key: 'course_marketplace',
    label: 'Digital Lesson & Paper Marketplace',
    category: 'Tuition & Commercial Billing',
    targetRole: 'student',
    description: 'Direct purchasing of downloadable past papers, revision packages, and masterclass bundles.',
    subOptions: [
      {
        key: 'sub_market_standalone_papers',
        label: 'Individual Model Paper & Marking Scheme Sales',
        description: 'Allow non-enrolled students to purchase model papers or marking schemes individually.'
      },
      {
        key: 'sub_market_video_bundles',
        label: 'Unit Video Masterclass Bundles',
        description: 'Sell complete topic recordings (e.g., Full Calculus Pack) as one-time purchases.'
      },
      {
        key: 'sub_market_digital_receipts',
        label: 'Instant Digital PDF Invoicing',
        description: 'Generate instant downloadable tax receipts and purchase order confirmations.'
      }
    ]
  },

  // =========================================================================
  // 3. LIVE BROADCAST & VIRTUAL STUDIO
  // =========================================================================
  {
    key: 'live_broadcast_studio',
    label: 'Live Broadcast & Meeting Studio',
    category: 'Live Broadcast & Studio',
    targetRole: 'teacher',
    description: 'Integrated Google Meet & Zoom live schedule manager with permanent lecture room links.',
    badge: 'Virtual Hall',
    subOptions: [
      {
        key: 'sub_live_google_meet',
        label: 'Google Meet 1-Click Tutor Launcher',
        description: 'Permanent Google Meet room URL with 1-click start and student join controls.'
      },
      {
        key: 'sub_live_zoom',
        label: 'Zoom Pro Direct Meeting Launcher',
        description: 'Support Zoom meeting IDs, encrypted passcodes, and direct launch buttons.'
      },
      {
        key: 'sub_live_sms_alerts',
        label: '1-Click Student Broadcast SMS & WhatsApp Alerts',
        description: 'Send instant SMS & push alerts to all enrolled subscribers 15 minutes before class.'
      },
      {
        key: 'sub_live_recordings',
        label: '1080p Cloud Lecture Replay Archive',
        description: 'Archive HD live stream recordings with chapter timestamps for late revision.'
      },
      {
        key: 'sub_live_doubt_chat',
        label: 'Student Doubt Clearing & Raise Hand',
        description: 'In-session question queue and post-lecture doubt clearing discussion threads.'
      }
    ]
  },

  // =========================================================================
  // 4. CURRICULUM & DIGITAL LEARNING
  // =========================================================================
  {
    key: 'syllabus_builder',
    label: 'Interactive Curriculum & Unit Builder',
    category: 'Curriculum & Digital Learning',
    targetRole: 'teacher',
    description: 'Structured course syllabus breakdown with units, subtopics, learning objectives, and notes.',
    badge: 'Curriculum',
    subOptions: [
      {
        key: 'sub_syllabus_units',
        label: 'Structured Unit & Topic Breakdown',
        description: 'Build sequential syllabus roadmaps with learning objectives and estimated study hours.'
      },
      {
        key: 'sub_syllabus_video',
        label: 'Embedded Video Player (1080p)',
        description: 'Video lesson player with speed playback (1.25x, 1.5x), bookmarks, and progress tracking.'
      },
      {
        key: 'sub_syllabus_quizzes',
        label: 'Interactive Timed MCQ Assessments',
        description: 'Self-grading multiple choice quizzes with instant answer key explanations.'
      },
      {
        key: 'sub_syllabus_past_papers',
        label: 'A/L & O/L Past Examination Papers',
        description: 'National examination archive (2015-2025) categorized by year and subject.'
      },
      {
        key: 'sub_syllabus_digital_books',
        label: 'PDF Digital Lecture Handouts & Tutes',
        description: 'Downloadable teacher lecture handouts, formula sheets, and PDF textbooks.'
      }
    ]
  },

  // =========================================================================
  // 5. ASSESSMENTS & EXAMINATIONS
  // =========================================================================
  {
    key: 'assignments_grading',
    label: 'Assessments, Homework & Model Tests',
    category: 'Assessments & Examinations',
    targetRole: 'teacher',
    description: 'Student assignment upload portal with teacher annotation mark-sheets and scorecards.',
    badge: 'Examinations',
    subOptions: [
      {
        key: 'sub_assign_student_upload',
        label: 'Student Homework File Upload Portal',
        description: 'Students submit homework as PDF or image photos directly from mobile or desktop.'
      },
      {
        key: 'sub_assign_teacher_rubrics',
        label: 'Teacher Rubric Grading & Mark Sheets',
        description: 'Mark assignments out of 100, record rubric criteria, and provide written feedback.'
      },
      {
        key: 'sub_assign_model_exams',
        label: 'Timed Online Model Examinations & Mock Tests',
        description: 'Schedule timed model paper trials with auto-submission timers and mark distributions.'
      },
      {
        key: 'sub_assign_report_cards',
        label: 'Student Progress Scorecard & Batch Rank',
        description: 'Automated student progress report cards with batch rankings and performance stats.'
      },
      {
        key: 'sub_assign_study_groups',
        label: 'Peer Discussion Forum & Doubt Exchange',
        description: 'Student collaboration rooms for past paper problem-solving and peer discussion.'
      }
    ]
  },

  // =========================================================================
  // 6. TUTOR BRANDING & MONETIZATION
  // =========================================================================
  {
    key: 'tutor_branding',
    label: 'Tutor Branding & Creator Monetization',
    category: 'Tutor Branding & Monetization',
    targetRole: 'admin',
    description: 'Personal brand white-labeling, custom domain, automated WhatsApp alerts, and income analytics.',
    badge: 'Solo Branding',
    subOptions: [
      {
        key: 'sub_brand_custom_domain',
        label: 'Custom Domain & Subdomain (e.g. sammaths.lk)',
        description: 'Connect custom domain or branded subdomain with automated SSL security.'
      },
      {
        key: 'sub_brand_logo_theme',
        label: 'Personal Brand Crest, Logo & Color Theme',
        description: 'Customize portal theme colors, brand banner, and personal tutor logo.'
      },
      {
        key: 'sub_brand_whatsapp_bot',
        label: 'Automated WhatsApp Bot for Links & Reminders',
        description: 'Auto-deliver class joining links and fee receipt alerts directly via WhatsApp.'
      },
      {
        key: 'sub_brand_revenue_analytics',
        label: 'Monthly Tuition Revenue & Growth Analytics',
        description: 'Real-time metrics on active paying students, monthly recurring revenue, and student retention.'
      }
    ]
  }
];

// Helper to generate a flat map of all feature keys (parent + sub-options)
const buildFullFeatures = (config: Record<string, boolean>): Record<string, boolean> => {
  const result: Record<string, boolean> = {};
  HIERARCHICAL_MODULES.forEach((mod) => {
    const isParentEnabled = config[mod.key] ?? false;
    result[mod.key] = isParentEnabled;
    mod.subOptions.forEach((sub) => {
      result[sub.key] = config[sub.key] !== undefined ? config[sub.key] : isParentEnabled;
    });
  });
  return result;
};

// Presets for 1-click tenant setup
export const TENANT_PRESETS: TenantPreset[] = [
  {
    id: 'preset_tutor_pro',
    name: 'Solo Educator Pro Edition',
    type: 'individual_teacher',
    description: 'Full live studio for tutors: Live Google Meet classes, Study Packages, Bank Slip Approvals, Student Subscriptions, and Syllabus Builder.',
    icon: 'GraduationCap',
    features: buildFullFeatures({
      batch_management: true,
      tuition_subscriptions: true,
      course_marketplace: true,
      live_broadcast_studio: true,
      syllabus_builder: true,
      assignments_grading: true,
      tutor_branding: true
    })
  },
  {
    id: 'preset_tutor_masterclass',
    name: 'Solo Masterclass & Paper Class Edition',
    type: 'individual_teacher',
    description: 'Designed for intensive paper class tutors: Past paper marketplace, Model evaluation schemes, Live video solutions, and Homework submissions.',
    icon: 'Award',
    features: buildFullFeatures({
      batch_management: true,
      tuition_subscriptions: true,
      course_marketplace: true,
      live_broadcast_studio: true,
      syllabus_builder: true,
      assignments_grading: true,
      tutor_branding: true
    })
  },
  {
    id: 'preset_tutor_starter',
    name: 'Solo Creator Starter Edition',
    type: 'individual_teacher',
    description: 'Affordable setup for emerging tutors: Pre-recorded Video Courses, Model Papers & PDF Library, Homework Submissions, and Basic Subscriptions.',
    icon: 'Sparkles',
    features: buildFullFeatures({
      batch_management: true,
      tuition_subscriptions: true,
      course_marketplace: true,
      live_broadcast_studio: false,
      syllabus_builder: true,
      assignments_grading: true,
      tutor_branding: false
    })
  }
];

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant_samantha',
    name: 'Dr. Samantha Perera (Combined Maths)',
    code: 'TUTOR-SAM',
    type: 'individual_teacher',
    plan: 'pro',
    status: 'active',
    contactEmail: 'sam.maths@combinedmaths.lk',
    contactPhone: '+94 77 123 4567',
    adminName: 'Dr. Samantha Perera',
    studentCount: 142,
    teacherCount: 1,
    monthlyFeeLkr: 18000,
    createdAt: '2026-01-15',
    renewalDate: '2027-01-15',
    primaryColor: '#059669',
    address: 'Online Faculty & Studio, Colombo',
    tagline: 'A/L Combined Mathematics Masterclass',
    enabledFeatures: { ...TENANT_PRESETS[0].features }
  },
  {
    id: 'tenant_thanushan',
    name: 'Eng. K. Thanushan (A/L Physics Masterclass)',
    code: 'TUTOR-PHYS',
    type: 'individual_teacher',
    plan: 'pro',
    status: 'active',
    contactEmail: 'thanushan.physics@gmail.com',
    contactPhone: '+94 77 987 6543',
    adminName: 'Eng. K. Thanushan (B.Sc. Eng)',
    studentCount: 285,
    teacherCount: 1,
    monthlyFeeLkr: 22000,
    createdAt: '2025-08-10',
    renewalDate: '2027-08-10',
    primaryColor: '#7c3aed',
    address: 'Online Studio & Live Faculty, Jaffna & Colombo',
    tagline: 'Conceptual Physics & Live Practical Problem Solving',
    enabledFeatures: { ...TENANT_PRESETS[0].features }
  },
  {
    id: 'tenant_nilmini',
    name: 'Dr. Nilmini Silva (A/L Chemistry Studio)',
    code: 'TUTOR-CHEM',
    type: 'individual_teacher',
    plan: 'pro',
    status: 'active',
    contactEmail: 'nilmini.chem@alchemistry.lk',
    contactPhone: '+94 71 456 7890',
    adminName: 'Dr. Nilmini Silva (Ph.D.)',
    studentCount: 220,
    teacherCount: 1,
    monthlyFeeLkr: 20000,
    createdAt: '2025-05-15',
    renewalDate: '2027-05-15',
    primaryColor: '#2563eb',
    address: 'Online Studio & Video Lab, Kandy & Colombo',
    tagline: 'Organic Mechanisms & Physical Chemistry Clarity',
    enabledFeatures: { ...TENANT_PRESETS[0].features }
  },
  {
    id: 'tenant_limat_saas',
    name: 'Mr. Lima T. (Commerce & Accounting)',
    code: 'TUTOR-LIMA',
    type: 'individual_teacher',
    plan: 'enterprise',
    status: 'active',
    contactEmail: 'limat.tutor@limat.lk',
    contactPhone: '+94 77 123 4567',
    adminName: 'Mr. Lima T. (MBA, B.Com)',
    studentCount: 350,
    teacherCount: 1,
    monthlyFeeLkr: 25000,
    createdAt: '2025-01-01',
    renewalDate: '2028-01-01',
    primaryColor: '#0d5c4d',
    address: 'Colombo Online Studio & Interactive Hub',
    tagline: 'Case Studies, Model Papers & Live Financial Accounting',
    enabledFeatures: { ...TENANT_PRESETS[1].features }
  }
];
