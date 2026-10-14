// Pure Solo Tutor & Tuition SaaS Parent Portal Mock Data Engine

export interface ChildTuitionEnrolment {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherTitle: string;
  subject: string;
  avatarColor: string;
  initials: string;
  packageName: string;
  batch: string;
  monthlyFeeLkr: number;
  feeStatus: 'paid' | 'pending_slip' | 'overdue';
  validUntil: string;
  lastPaymentDate: string;
  lastPaymentRef: string;
  paymentBank: string;
  liveClassSchedule: string;
  platform: 'Google Meet' | 'Zoom' | 'Microsoft Teams';
  meetingUrl: string;
  nextSessionDate: string;
  nextSessionTopic: string;
  attendanceRate: number;
  attendedSessions: number;
  totalSessions: number;
  latestPaperMark: number;
  latestPaperMax: number;
  batchRank: number;
  batchTotalStudents: number;
  whatsappGroupUrl?: string;
  tutorPhone: string;
}

export interface TuitionInvoice {
  id: string;
  invoiceNumber: string;
  childId: string;
  childName: string;
  teacherName: string;
  subject: string;
  month: string;
  amountLkr: number;
  status: 'cleared' | 'under_review' | 'overdue';
  paymentMethod: 'bank_slip' | 'online_card' | 'lanka_qr';
  slipRefNumber?: string;
  bankName?: string;
  branchName?: string;
  depositedDate?: string;
  slipImageUrl?: string;
  approvalDate?: string;
  tutorNotes?: string;
}

export interface LiveClassAttendanceLog {
  id: string;
  childId: string;
  sessionTitle: string;
  tutorName: string;
  subject: string;
  date: string;
  timeSlot: string;
  platform: 'Google Meet' | 'Zoom' | 'Microsoft Teams';
  status: 'attended' | 'late' | 'missed';
  durationMinutes: number;
  totalDurationMinutes: number;
  joinTime: string;
  leaveTime: string;
  recordingWatched: boolean;
}

export interface TutorPaperMarkRecord {
  id: string;
  childId: string;
  paperCode: string;
  title: string;
  tutorName: string;
  subject: string;
  date: string;
  score: number;
  maxScore: number;
  batchAverage: number;
  highestScore: number;
  rank: number;
  batchTotal: number;
  grade: string;
  tutorFeedback: string;
  paperDownloadUrl?: string;
  markingSchemeUrl?: string;
}

export interface TutorAnnouncement {
  id: string;
  tutorName: string;
  subject: string;
  title: string;
  date: string;
  priority: 'urgent' | 'regular';
  category: 'Schedule Change' | 'Paper Class Notice' | 'Courier/Tute Dispatch' | 'Special Seminar';
  content: string;
  attachmentName?: string;
  attachmentSize?: string;
}

export interface ParentLeaveRequest {
  id: string;
  childId: string;
  childName: string;
  tutorName?: string;
  startDate: string;
  endDate: string;
  reason: 'Medical Illness' | 'Family Emergency' | 'Religious Observation' | 'Official Competition' | 'School Exam Clashing' | 'Other';
  note: string;
  hasMedicalCertificate: boolean;
  status: 'approved' | 'pending' | 'rejected';
  submittedDate: string;
  reviewedBy?: string;
  reviewComment?: string;
}

// Backward-compatibility interfaces for legacy types
export interface SubjectGrade {
  code: string;
  subject: string;
  teacher: string;
  score: number;
  grade: 'A*' | 'A' | 'B' | 'C' | 'S' | 'F';
  classAverage: number;
  highestScore: number;
  remarks: string;
}

export interface TermReportCard {
  id: string;
  term: string;
  shortTermLabel: string;
  issueDate: string;
  academicYear: string;
  gradeLevel: string;
  classSection: string;
  subjects: SubjectGrade[];
  overallPercentage: number;
  classRank: number;
  totalStudents: number;
  conduct: string;
  principalRemarks: string;
  attendancePercentage: number;
  isLatest?: boolean;
}

export interface AttendanceRecord {
  date: string;
  day: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  checkInTime?: string;
  note?: string;
}

export interface ExamScheduleItem {
  id: string;
  examType: string;
  subject: string;
  paperCode: string;
  paperName: string;
  date: string;
  day: string;
  timeSlot: string;
  duration: string;
  hallNumber: string;
  seatNumber: string;
  syllabusCoverage: string;
  maxMarks: number;
  status: 'upcoming' | 'completed';
  obtainedScore?: number;
  grade?: string;
  admissionStatus: string;
}

export interface PastTermComparison {
  termName: string;
  academicYear: string;
  aggregateAverage: number;
  classRank: number;
  totalStudents: number;
  attendanceRate: number;
  gradeClassification: string;
}

export interface AcademicYearRecord {
  id: string;
  year: string;
  gradeLevel: string;
  stage: string;
  classSection: string;
  classTeacher: string;
  annualAverage: number;
  annualRank: number;
  totalStudents: number;
  attendanceRate: number;
  promotionStatus: string;
  awardsOrMilestone?: string;
  terms: TermReportCard[];
}

export interface SchoolCircular {
  id: string;
  circularNo: string;
  title: string;
  category: 'Academic' | 'Administrative' | 'Safety' | 'Event';
  date: string;
  summary: string;
  content: string;
  priority: 'high' | 'normal';
  targetAudience: string;
  attachmentName?: string;
  attachmentSize?: string;
}

export interface ParentChildProfile {
  id: string;
  studentId: string;
  name: string;
  admissionNo: string;
  grade: string;
  classSection: string;
  avatarText: string;
  schoolName: string;
  enrolledSinceYear: string;
  admissionGrade: string;
  currentStage: string;
  cumulativeCareerAverage: number;
  totalYearsEnrolled: number;
  classTeacher: string;
  classTeacherEmail: string;
  classTeacherPhone: string;
  attendanceRate: number;
  presentDays: number;
  totalDays: number;
  overallAverage: number;
  classRank: number;
  totalStudents: number;
  upcomingExamsCount: number;
  hallTicketNo: string;
  nextExamDate: string;
  nextExamName: string;
  
  // Pure Solo Tutor SaaS Properties
  enrolments: ChildTuitionEnrolment[];
  invoices: TuitionInvoice[];
  attendanceLogs: LiveClassAttendanceLog[];
  paperMarks: TutorPaperMarkRecord[];
  announcements: TutorAnnouncement[];
  monthlyInvestmentLkr: number;
  activeEnrolmentsCount: number;
  pendingSlipsCount: number;

  // Legacy fallbacks
  termReport: TermReportCard;
  termReports: TermReportCard[];
  academicJourney: AcademicYearRecord[];
  recentAttendance: AttendanceRecord[];
  examSchedules: ExamScheduleItem[];
  pastTermsHistory: PastTermComparison[];
}

// ----------------------------------------------------------------------
// DATASET: CHILD 01 - SATHURJAN K. (A/L 2026 Physical Science)
// ----------------------------------------------------------------------
export const SATHURJAN_ENROLMENTS: ChildTuitionEnrolment[] = [
  {
    id: 'enrol_sat_01',
    teacherId: 'tutor_sam',
    teacherName: 'Dr. Samantha Perera',
    teacherTitle: 'Dr. Samantha Perera (Ph.D. Pure Maths)',
    subject: 'Combined Mathematics',
    avatarColor: 'bg-emerald-600',
    initials: 'SP',
    packageName: 'A/L 2026 Masterclass: Theory + Revision + Paper Class',
    batch: 'Batch 2026 - Pure & Applied Science',
    monthlyFeeLkr: 3500,
    feeStatus: 'paid',
    validUntil: '31 Oct 2026',
    lastPaymentDate: '2026-10-01',
    lastPaymentRef: 'COMM-984210',
    paymentBank: 'Commercial Bank',
    liveClassSchedule: 'Tuesdays 07:00 PM - 09:00 PM & Saturdays 08:30 AM',
    platform: 'Google Meet',
    meetingUrl: 'https://meet.google.com/sam-math-live',
    nextSessionDate: 'Tuesday, 07:00 PM',
    nextSessionTopic: 'Calculus: Integration by Parts & Definite Integrals',
    attendanceRate: 96.5,
    attendedSessions: 8,
    totalSessions: 8,
    latestPaperMark: 92,
    latestPaperMax: 100,
    batchRank: 3,
    batchTotalStudents: 142,
    whatsappGroupUrl: 'https://chat.whatsapp.com/AL-Maths-Samantha-2026',
    tutorPhone: '+94 77 123 4567'
  },
  {
    id: 'enrol_sat_02',
    teacherId: 'tutor_phys',
    teacherName: 'Eng. K. Thanushan',
    teacherTitle: 'Eng. K. Thanushan (B.Sc. Eng, Moratuwa)',
    subject: 'Physics',
    avatarColor: 'bg-purple-600',
    initials: 'KT',
    packageName: 'A/L Physics Conceptual Masterclass & Laboratory Practicals',
    batch: 'Batch 2026 - Advanced Mechanics & Wave Optics',
    monthlyFeeLkr: 3000,
    feeStatus: 'pending_slip',
    validUntil: 'Pending Approval (Slip Uploaded)',
    lastPaymentDate: '2026-10-12',
    lastPaymentRef: 'BOC-441920',
    paymentBank: 'Bank of Ceylon (BOC)',
    liveClassSchedule: 'Thursdays 07:00 PM - 09:00 PM',
    platform: 'Zoom',
    meetingUrl: 'https://zoom.us/j/9876543210',
    nextSessionDate: 'Thursday, 07:00 PM',
    nextSessionTopic: 'Wave Optics: Young\'s Double Slit & Diffraction Grating',
    attendanceRate: 92.0,
    attendedSessions: 7,
    totalSessions: 8,
    latestPaperMark: 88,
    latestPaperMax: 100,
    batchRank: 5,
    batchTotalStudents: 285,
    whatsappGroupUrl: 'https://chat.whatsapp.com/AL-Physics-Thanushan-2026',
    tutorPhone: '+94 77 987 6543'
  },
  {
    id: 'enrol_sat_03',
    teacherId: 'tutor_chem',
    teacherName: 'Dr. Nilmini Silva',
    teacherTitle: 'Dr. Nilmini Silva (Ph.D. Chem)',
    subject: 'Chemistry',
    avatarColor: 'bg-blue-600',
    initials: 'NS',
    packageName: 'A/L Chemistry Studio & Video Lab Masterclass',
    batch: 'Batch 2026 - Physical & Inorganic Chemistry',
    monthlyFeeLkr: 3000,
    feeStatus: 'paid',
    validUntil: '31 Oct 2026',
    lastPaymentDate: '2026-10-03',
    lastPaymentRef: 'HNB-778102',
    paymentBank: 'Hatton National Bank (HNB)',
    liveClassSchedule: 'Mondays 06:30 PM - 08:30 PM',
    platform: 'Google Meet',
    meetingUrl: 'https://meet.google.com/chem-nilmini-live',
    nextSessionDate: 'Next Monday, 06:30 PM',
    nextSessionTopic: 'Chemical Kinetics: Arrhenius Equation & Activation Energy',
    attendanceRate: 95.0,
    attendedSessions: 8,
    totalSessions: 8,
    latestPaperMark: 90,
    latestPaperMax: 100,
    batchRank: 4,
    batchTotalStudents: 220,
    whatsappGroupUrl: 'https://chat.whatsapp.com/AL-Chem-Nilmini-2026',
    tutorPhone: '+94 71 456 7890'
  }
];

export const SATHURJAN_INVOICES: TuitionInvoice[] = [
  {
    id: 'inv_sat_10_01',
    invoiceNumber: 'INV-2026-10-042',
    childId: 'child_01',
    childName: 'Sathurjan K.',
    teacherName: 'Dr. Samantha Perera',
    subject: 'Combined Mathematics',
    month: 'October 2026',
    amountLkr: 3500,
    status: 'cleared',
    paymentMethod: 'bank_slip',
    slipRefNumber: 'COMM-984210',
    bankName: 'Commercial Bank of Ceylon',
    branchName: 'Kollupitiya Branch',
    depositedDate: '2026-10-01',
    slipImageUrl: '/images/mock_slips/comm_slip_01.jpg',
    approvalDate: '2026-10-02',
    tutorNotes: 'Verified and full masterclass recording access unlocked.'
  },
  {
    id: 'inv_sat_10_02',
    invoiceNumber: 'INV-2026-10-077',
    childId: 'child_01',
    childName: 'Sathurjan K.',
    teacherName: 'Eng. K. Thanushan',
    subject: 'Physics',
    month: 'October 2026',
    amountLkr: 3000,
    status: 'under_review',
    paymentMethod: 'bank_slip',
    slipRefNumber: 'BOC-441920',
    bankName: 'Bank of Ceylon (BOC)',
    branchName: 'Jaffna City Branch',
    depositedDate: '2026-10-12',
    slipImageUrl: '/images/mock_slips/boc_slip_02.jpg',
    tutorNotes: 'Deposit slip submitted. Tutor assistant verification pending (usually within 12 hours).'
  },
  {
    id: 'inv_sat_10_03',
    invoiceNumber: 'INV-2026-10-112',
    childId: 'child_01',
    childName: 'Sathurjan K.',
    teacherName: 'Dr. Nilmini Silva',
    subject: 'Chemistry',
    month: 'October 2026',
    amountLkr: 3000,
    status: 'cleared',
    paymentMethod: 'online_card',
    slipRefNumber: 'VISA-4242-AUTH9812',
    approvalDate: '2026-10-03',
    tutorNotes: 'Instant Online Visa Clearance. Automated Invoice Receipt Issued.'
  },
  {
    id: 'inv_sat_09_01',
    invoiceNumber: 'INV-2026-09-039',
    childId: 'child_01',
    childName: 'Sathurjan K.',
    teacherName: 'Dr. Samantha Perera',
    subject: 'Combined Mathematics',
    month: 'September 2026',
    amountLkr: 3500,
    status: 'cleared',
    paymentMethod: 'bank_slip',
    slipRefNumber: 'COMM-871234',
    bankName: 'Commercial Bank of Ceylon',
    depositedDate: '2026-09-01',
    approvalDate: '2026-09-02'
  },
  {
    id: 'inv_sat_09_02',
    invoiceNumber: 'INV-2026-09-082',
    childId: 'child_01',
    childName: 'Sathurjan K.',
    teacherName: 'Eng. K. Thanushan',
    subject: 'Physics',
    month: 'September 2026',
    amountLkr: 3000,
    status: 'cleared',
    paymentMethod: 'bank_slip',
    slipRefNumber: 'BOC-331290',
    bankName: 'Bank of Ceylon (BOC)',
    depositedDate: '2026-09-02',
    approvalDate: '2026-09-03'
  }
];

export const SATHURJAN_ATTENDANCE_LOGS: LiveClassAttendanceLog[] = [
  {
    id: 'att_sat_01',
    childId: 'child_01',
    sessionTitle: 'Pure Maths: Integration by Partial Fractions & Trigonometric Substitutions',
    tutorName: 'Dr. Samantha Perera',
    subject: 'Combined Mathematics',
    date: 'Oct 10, 2026 (Saturday)',
    timeSlot: '08:30 AM - 11:30 AM',
    platform: 'Google Meet',
    status: 'attended',
    durationMinutes: 178,
    totalDurationMinutes: 180,
    joinTime: '08:31 AM',
    leaveTime: '11:29 AM',
    recordingWatched: true
  },
  {
    id: 'att_sat_02',
    childId: 'child_01',
    sessionTitle: 'Applied Maths: Equilibrium of Rigid Bodies & Rod Friction Systems',
    tutorName: 'Dr. Samantha Perera',
    subject: 'Combined Mathematics',
    date: 'Oct 06, 2026 (Tuesday)',
    timeSlot: '07:00 PM - 09:00 PM',
    platform: 'Google Meet',
    status: 'attended',
    durationMinutes: 120,
    totalDurationMinutes: 120,
    joinTime: '07:00 PM',
    leaveTime: '09:00 PM',
    recordingWatched: false
  },
  {
    id: 'att_sat_03',
    childId: 'child_01',
    sessionTitle: 'Physics: Electromagnetic Induction, Faraday\'s Law & Lenz\'s Rule Live Lab',
    tutorName: 'Eng. K. Thanushan',
    subject: 'Physics',
    date: 'Oct 08, 2026 (Thursday)',
    timeSlot: '07:00 PM - 09:00 PM',
    platform: 'Zoom',
    status: 'attended',
    durationMinutes: 115,
    totalDurationMinutes: 120,
    joinTime: '07:05 PM',
    leaveTime: '09:00 PM',
    recordingWatched: true
  },
  {
    id: 'att_sat_04',
    childId: 'child_01',
    sessionTitle: 'Chemistry: Chemical Thermodynamics - Entropy & Gibbs Free Energy',
    tutorName: 'Dr. Nilmini Silva',
    subject: 'Chemistry',
    date: 'Oct 05, 2026 (Monday)',
    timeSlot: '06:30 PM - 08:30 PM',
    platform: 'Google Meet',
    status: 'attended',
    durationMinutes: 120,
    totalDurationMinutes: 120,
    joinTime: '06:30 PM',
    leaveTime: '08:30 PM',
    recordingWatched: false
  },
  {
    id: 'att_sat_05',
    childId: 'child_01',
    sessionTitle: 'Physics: Alternating Current Circuits & RLC Resonance Problem Breakdown',
    tutorName: 'Eng. K. Thanushan',
    subject: 'Physics',
    date: 'Oct 01, 2026 (Thursday)',
    timeSlot: '07:00 PM - 09:00 PM',
    platform: 'Zoom',
    status: 'late',
    durationMinutes: 98,
    totalDurationMinutes: 120,
    joinTime: '07:22 PM',
    leaveTime: '09:00 PM',
    recordingWatched: true
  }
];

export const SATHURJAN_PAPER_MARKS: TutorPaperMarkRecord[] = [
  {
    id: 'paper_sat_01',
    childId: 'child_01',
    paperCode: 'MATH-MOD-05',
    title: 'Combined Maths: Advanced Calculus & Integration Model Paper 05',
    tutorName: 'Dr. Samantha Perera',
    subject: 'Combined Mathematics',
    date: 'Oct 07, 2026',
    score: 92,
    maxScore: 100,
    batchAverage: 64,
    highestScore: 98,
    rank: 3,
    batchTotal: 142,
    grade: 'A',
    tutorFeedback: 'Outstanding algebraic clarity in Question 04 (Trig substitution). Minor sign slip in differential equation integration constant.'
  },
  {
    id: 'paper_sat_02',
    childId: 'child_01',
    paperCode: 'PHYS-REV-04',
    title: 'Physics: Complete Mechanics & Dynamic Equilibrium Timed Assessment',
    tutorName: 'Eng. K. Thanushan',
    subject: 'Physics',
    date: 'Oct 02, 2026',
    score: 88,
    maxScore: 100,
    batchAverage: 61,
    highestScore: 95,
    rank: 5,
    batchTotal: 285,
    grade: 'A',
    tutorFeedback: 'Very strong free-body diagram drawing. Revise rotational moment of inertia derivations for composite rods.'
  },
  {
    id: 'paper_sat_03',
    childId: 'child_01',
    paperCode: 'CHEM-MOD-03',
    title: 'Chemistry: Physical Chemistry & Phase Equilibria Structured Evaluation',
    tutorName: 'Dr. Nilmini Silva',
    subject: 'Chemistry',
    date: 'Sep 29, 2026',
    score: 90,
    maxScore: 100,
    batchAverage: 66,
    highestScore: 96,
    rank: 4,
    batchTotal: 220,
    grade: 'A',
    tutorFeedback: 'Exemplary explanation of Raoult\'s Law and positive azeotrope distillation curves. Neat calculations.'
  },
  {
    id: 'paper_sat_04',
    childId: 'child_01',
    paperCode: 'MATH-PAPER-04',
    title: 'Pure Maths: Vectors, 3D Geometry & Relative Velocity Paper Class 04',
    tutorName: 'Dr. Samantha Perera',
    subject: 'Combined Mathematics',
    date: 'Sep 21, 2026',
    score: 86,
    maxScore: 100,
    batchAverage: 58,
    highestScore: 94,
    rank: 6,
    batchTotal: 142,
    grade: 'A',
    tutorFeedback: 'Good vector dot/cross product application. Review wind-drift relative velocity triangle method.'
  }
];

export const SATHURJAN_ANNOUNCEMENTS: TutorAnnouncement[] = [
  {
    id: 'not_sat_01',
    tutorName: 'Dr. Samantha Perera',
    subject: 'Combined Mathematics',
    title: 'Special 4-Hour Pure Maths Marathon Session this Sunday (Oct 18)',
    date: 'Today, 10:30 AM',
    priority: 'urgent',
    category: 'Special Seminar',
    content: 'Dear Parents & Students, we are holding a comprehensive 4-hour live problem solving session on Calculus Area Derivations this Sunday at 08:00 AM via Google Meet. Please ensure your child prints the Paper 06 PDF worksheet sent to WhatsApp.',
    attachmentName: 'Calculus_Area_Derivations_Worksheet_06.pdf',
    attachmentSize: '2.4 MB'
  },
  {
    id: 'not_sat_02',
    tutorName: 'Eng. K. Thanushan',
    subject: 'Physics',
    title: 'October Physical Tute Pack Dispatched via Speed Post Courier',
    date: 'Oct 11, 2026',
    priority: 'regular',
    category: 'Courier/Tute Dispatch',
    content: 'All paid students\' printed theory bound books (Wave Optics & Electronics Module 04) have been handed over to Domex/SpeedPost courier. Tracking numbers sent via SMS to registered parents.'
  },
  {
    id: 'not_sat_03',
    tutorName: 'Dr. Nilmini Silva',
    subject: 'Chemistry',
    title: 'Monthly Chemistry Paper 04 Marks & Detailed Video Solutions Released',
    date: 'Oct 08, 2026',
    priority: 'regular',
    category: 'Paper Class Notice',
    content: 'Marking for Phase Equilibria paper has been released. The full step-by-step 90-minute video explanation is now accessible in the LMS portal under Video Solutions.'
  }
];

// ----------------------------------------------------------------------
// DATASET: CHILD 02 - ANANYA K. (Grade 8 Junior Secondary)
// ----------------------------------------------------------------------
export const ANANYA_ENROLMENTS: ChildTuitionEnrolment[] = [
  {
    id: 'enrol_ana_01',
    teacherId: 'tutor_nilmini',
    teacherName: 'Mrs. Nilmini Silva',
    teacherTitle: 'Mrs. Nilmini Silva (B.Sc. Ed)',
    subject: 'Science & Environment',
    avatarColor: 'bg-emerald-600',
    initials: 'NS',
    packageName: 'Grade 8 Science Masterclass & Practical Experiments',
    batch: 'Batch 2026 - Junior Scholars',
    monthlyFeeLkr: 2000,
    feeStatus: 'paid',
    validUntil: '31 Oct 2026',
    lastPaymentDate: '2026-10-02',
    lastPaymentRef: 'COMM-119283',
    paymentBank: 'Commercial Bank',
    liveClassSchedule: 'Wednesdays 05:00 PM - 07:00 PM',
    platform: 'Google Meet',
    meetingUrl: 'https://meet.google.com/science-grade8-live',
    nextSessionDate: 'Wednesday, 05:00 PM',
    nextSessionTopic: 'Human Digestive System & Enzyme Action Laboratory Demo',
    attendanceRate: 98.0,
    attendedSessions: 8,
    totalSessions: 8,
    latestPaperMark: 94,
    latestPaperMax: 100,
    batchRank: 1,
    batchTotalStudents: 68,
    whatsappGroupUrl: 'https://chat.whatsapp.com/Grade8-Science-2026',
    tutorPhone: '+94 71 889 2211'
  },
  {
    id: 'enrol_ana_02',
    teacherId: 'tutor_siva',
    teacherName: 'Mr. K. Sivakumar',
    teacherTitle: 'Mr. K. Sivakumar (Dip. Teaching)',
    subject: 'Mathematics',
    avatarColor: 'bg-amber-600',
    initials: 'KS',
    packageName: 'Grade 8 Mathematics & Geometry Problem Lab',
    batch: 'Batch 2026 - Accelerated Math',
    monthlyFeeLkr: 2200,
    feeStatus: 'paid',
    validUntil: '31 Oct 2026',
    lastPaymentDate: '2026-10-01',
    lastPaymentRef: 'BOC-992102',
    paymentBank: 'Bank of Ceylon (BOC)',
    liveClassSchedule: 'Fridays 05:00 PM - 07:00 PM',
    platform: 'Zoom',
    meetingUrl: 'https://zoom.us/j/4455667788',
    nextSessionDate: 'Friday, 05:00 PM',
    nextSessionTopic: 'Algebraic Expressions & Factorization of Binomials',
    attendanceRate: 97.5,
    attendedSessions: 8,
    totalSessions: 8,
    latestPaperMark: 96,
    latestPaperMax: 100,
    batchRank: 1,
    batchTotalStudents: 75,
    whatsappGroupUrl: 'https://chat.whatsapp.com/Grade8-Math-Sivakumar',
    tutorPhone: '+94 77 334 5566'
  },
  {
    id: 'enrol_ana_03',
    teacherId: 'tutor_fonseka',
    teacherName: 'Ms. Rashmi Fonseka',
    teacherTitle: 'Ms. Rashmi Fonseka (BA Hons English)',
    subject: 'English Language & Literature',
    avatarColor: 'bg-indigo-600',
    initials: 'RF',
    packageName: 'Grade 8 English Language, Grammar & Essay Workshop',
    batch: 'Batch 2026 - Cambridge & National Syllabus',
    monthlyFeeLkr: 1800,
    feeStatus: 'paid',
    validUntil: '31 Oct 2026',
    lastPaymentDate: '2026-10-04',
    lastPaymentRef: 'HNB-554411',
    paymentBank: 'Hatton National Bank (HNB)',
    liveClassSchedule: 'Saturdays 03:00 PM - 05:00 PM',
    platform: 'Google Meet',
    meetingUrl: 'https://meet.google.com/english-fonseka-live',
    nextSessionDate: 'Saturday, 03:00 PM',
    nextSessionTopic: 'Creative Narrative Essay Writing & Idiomatic Expressions',
    attendanceRate: 100.0,
    attendedSessions: 8,
    totalSessions: 8,
    latestPaperMark: 91,
    latestPaperMax: 100,
    batchRank: 2,
    batchTotalStudents: 50,
    whatsappGroupUrl: 'https://chat.whatsapp.com/Grade8-English-Fonseka',
    tutorPhone: '+94 76 112 3344'
  }
];

export const ANANYA_INVOICES: TuitionInvoice[] = [
  {
    id: 'inv_ana_10_01',
    invoiceNumber: 'INV-2026-10-801',
    childId: 'child_02',
    childName: 'Ananya K.',
    teacherName: 'Mrs. Nilmini Silva',
    subject: 'Science & Environment',
    month: 'October 2026',
    amountLkr: 2000,
    status: 'cleared',
    paymentMethod: 'bank_slip',
    slipRefNumber: 'COMM-119283',
    bankName: 'Commercial Bank of Ceylon',
    depositedDate: '2026-10-02',
    approvalDate: '2026-10-02'
  },
  {
    id: 'inv_ana_10_02',
    invoiceNumber: 'INV-2026-10-802',
    childId: 'child_02',
    childName: 'Ananya K.',
    teacherName: 'Mr. K. Sivakumar',
    subject: 'Mathematics',
    month: 'October 2026',
    amountLkr: 2200,
    status: 'cleared',
    paymentMethod: 'bank_slip',
    slipRefNumber: 'BOC-992102',
    bankName: 'Bank of Ceylon (BOC)',
    depositedDate: '2026-10-01',
    approvalDate: '2026-10-02'
  },
  {
    id: 'inv_ana_10_03',
    invoiceNumber: 'INV-2026-10-803',
    childId: 'child_02',
    childName: 'Ananya K.',
    teacherName: 'Ms. Rashmi Fonseka',
    subject: 'English Language',
    month: 'October 2026',
    amountLkr: 1800,
    status: 'cleared',
    paymentMethod: 'online_card',
    slipRefNumber: 'HNB-554411',
    approvalDate: '2026-10-04'
  }
];

export const ANANYA_ATTENDANCE_LOGS: LiveClassAttendanceLog[] = [
  {
    id: 'att_ana_01',
    childId: 'child_02',
    sessionTitle: 'Science: Respiratory Systems & Gas Exchange in Living Cells',
    tutorName: 'Mrs. Nilmini Silva',
    subject: 'Science & Environment',
    date: 'Oct 07, 2026 (Wednesday)',
    timeSlot: '05:00 PM - 07:00 PM',
    platform: 'Google Meet',
    status: 'attended',
    durationMinutes: 120,
    totalDurationMinutes: 120,
    joinTime: '05:00 PM',
    leaveTime: '07:00 PM',
    recordingWatched: false
  },
  {
    id: 'att_ana_02',
    childId: 'child_02',
    sessionTitle: 'Maths: Algebraic Equations, Perimeter & Circumference Calculations',
    tutorName: 'Mr. K. Sivakumar',
    subject: 'Mathematics',
    date: 'Oct 09, 2026 (Friday)',
    timeSlot: '05:00 PM - 07:00 PM',
    platform: 'Zoom',
    status: 'attended',
    durationMinutes: 120,
    totalDurationMinutes: 120,
    joinTime: '04:58 PM',
    leaveTime: '07:00 PM',
    recordingWatched: false
  },
  {
    id: 'att_ana_03',
    childId: 'child_02',
    sessionTitle: 'English: Direct & Indirect Speech Rules and Dialogue Writing',
    tutorName: 'Ms. Rashmi Fonseka',
    subject: 'English Language',
    date: 'Oct 10, 2026 (Saturday)',
    timeSlot: '03:00 PM - 05:00 PM',
    platform: 'Google Meet',
    status: 'attended',
    durationMinutes: 120,
    totalDurationMinutes: 120,
    joinTime: '03:00 PM',
    leaveTime: '05:00 PM',
    recordingWatched: false
  }
];

export const ANANYA_PAPER_MARKS: TutorPaperMarkRecord[] = [
  {
    id: 'paper_ana_01',
    childId: 'child_02',
    paperCode: 'SCI-08-MOD-04',
    title: 'Grade 8 Science: Cell Biology, Organs & Human Body Systems Test',
    tutorName: 'Mrs. Nilmini Silva',
    subject: 'Science & Environment',
    date: 'Oct 04, 2026',
    score: 94,
    maxScore: 100,
    batchAverage: 71,
    highestScore: 98,
    rank: 1,
    batchTotal: 68,
    grade: 'A*',
    tutorFeedback: 'Exemplary cellular diagram labelling. Clear distinction between artery and vein structures.'
  },
  {
    id: 'paper_ana_02',
    childId: 'child_02',
    paperCode: 'MTH-08-REV-03',
    title: 'Grade 8 Mathematics: Perimeter, Area & Angles of Polygons Speed Drill',
    tutorName: 'Mr. K. Sivakumar',
    subject: 'Mathematics',
    date: 'Oct 02, 2026',
    score: 96,
    maxScore: 100,
    batchAverage: 68,
    highestScore: 98,
    rank: 1,
    batchTotal: 75,
    grade: 'A*',
    tutorFeedback: 'Faultless geometric theorem proofs. Quick and accurate computation.'
  },
  {
    id: 'paper_ana_03',
    childId: 'child_02',
    paperCode: 'ENG-08-ESS-03',
    title: 'Grade 8 English: Narrative Essay Composition & Advanced Grammar',
    tutorName: 'Ms. Rashmi Fonseka',
    subject: 'English Language',
    date: 'Sep 27, 2026',
    score: 91,
    maxScore: 100,
    batchAverage: 65,
    highestScore: 95,
    rank: 2,
    batchTotal: 50,
    grade: 'A',
    tutorFeedback: 'Vivid imagery and descriptive adjectives. Excellent vocabulary range.'
  }
];

export const ANANYA_ANNOUNCEMENTS: TutorAnnouncement[] = [
  {
    id: 'not_ana_01',
    tutorName: 'Mrs. Nilmini Silva',
    subject: 'Science & Environment',
    title: 'Printed Term 3 Science Model Paper Booklets Ready for Pickup / Delivery',
    date: 'Oct 11, 2026',
    priority: 'regular',
    category: 'Paper Class Notice',
    content: 'All Grade 8 students will be receiving 5 model assessment booklets before next Wednesday\'s revision class.'
  },
  {
    id: 'not_ana_02',
    tutorName: 'Mr. K. Sivakumar',
    subject: 'Mathematics',
    title: 'Friday Class Timing Reminder: Starts sharp at 05:00 PM on Zoom',
    date: 'Oct 08, 2026',
    priority: 'regular',
    category: 'Schedule Change',
    content: 'Please ensure students have their geometry instrument box and blank graph paper ready for Friday\'s session.'
  }
];

// Fallback legacy structure for backwards compatibility
const legacyTermReport: TermReportCard = {
  id: 'rep_sat_2026_t2',
  term: '2nd Term Evaluation 2026',
  shortTermLabel: '2026 Term 2',
  issueDate: 'October 01, 2026',
  academicYear: '2026',
  gradeLevel: 'Grade 12',
  classSection: '12-Physical Science',
  overallPercentage: 89.4,
  classRank: 3,
  totalStudents: 42,
  conduct: 'Exemplary',
  attendancePercentage: 96.5,
  principalRemarks: 'Superb academic focus in advanced mathematics and physics.',
  subjects: [
    { code: 'MATH', subject: 'Combined Mathematics', teacher: 'Dr. Samantha Perera', score: 92, grade: 'A', classAverage: 64, highestScore: 98, remarks: 'Top 3 percentile in batch.' },
    { code: 'PHYS', subject: 'Physics', teacher: 'Eng. K. Thanushan', score: 88, grade: 'A', classAverage: 61, highestScore: 95, remarks: 'Strong theoretical and practical skills.' },
    { code: 'CHEM', subject: 'Chemistry', teacher: 'Dr. Nilmini Silva', score: 90, grade: 'A', classAverage: 66, highestScore: 96, remarks: 'Excellent in physical kinetics.' }
  ]
};

// ----------------------------------------------------------------------
// EXPORTED PROFILES
// ----------------------------------------------------------------------
export const mockChildrenProfiles: ParentChildProfile[] = [
  {
    id: 'child_01',
    studentId: 'usr_student_01',
    name: 'Sathurjan K.',
    admissionNo: 'TUT-1204',
    grade: 'Grade 12 (A/L 2026/2027)',
    classSection: 'Physical Science (Maths, Physics, Chem)',
    avatarText: 'SK',
    schoolName: 'Solo Tutor & Masterclass Network',
    enrolledSinceYear: '2025',
    admissionGrade: 'Grade 12',
    currentStage: 'G.C.E. A/L Masterclass Batch',
    cumulativeCareerAverage: 90.0,
    totalYearsEnrolled: 2,
    classTeacher: 'Dr. Samantha Perera',
    classTeacherEmail: 'sam.maths@combinedmaths.lk',
    classTeacherPhone: '+94 77 123 4567',
    attendanceRate: 94.5,
    presentDays: 23,
    totalDays: 24,
    overallAverage: 90.0,
    classRank: 3,
    totalStudents: 142,
    upcomingExamsCount: 3,
    hallTicketNo: 'TUT-PASS-2026-0842',
    nextExamDate: 'Oct 28, 2026',
    nextExamName: 'A/L Combined Maths Paper Class 05',

    // Pure Solo Tutor SaaS Properties
    enrolments: SATHURJAN_ENROLMENTS,
    invoices: SATHURJAN_INVOICES,
    attendanceLogs: SATHURJAN_ATTENDANCE_LOGS,
    paperMarks: SATHURJAN_PAPER_MARKS,
    announcements: SATHURJAN_ANNOUNCEMENTS,
    monthlyInvestmentLkr: 9500,
    activeEnrolmentsCount: 3,
    pendingSlipsCount: 1,

    // Legacy fallbacks
    termReport: legacyTermReport,
    termReports: [legacyTermReport],
    academicJourney: [
      {
        id: 'yr_01',
        year: '2026',
        gradeLevel: 'Grade 12',
        stage: 'G.C.E. A/L',
        classSection: 'A/L Combined Maths & Physics',
        classTeacher: 'Dr. Samantha Perera',
        annualAverage: 90.0,
        annualRank: 3,
        totalStudents: 142,
        attendanceRate: 94.5,
        promotionStatus: 'Active Masterclass Enrolment',
        terms: [legacyTermReport]
      }
    ],
    recentAttendance: [
      { date: '2026-10-10', day: 'Saturday', status: 'present', checkInTime: '08:31 AM', note: 'Joined Google Meet live on time' },
      { date: '2026-10-08', day: 'Thursday', status: 'present', checkInTime: '07:05 PM', note: 'Joined Zoom live on time' },
      { date: '2026-10-06', day: 'Tuesday', status: 'present', checkInTime: '07:00 PM', note: 'Full attendance recorded' }
    ],
    examSchedules: [
      {
        id: 'ex_01',
        examType: 'Tutor Model Paper',
        subject: 'Combined Mathematics',
        paperCode: 'MATH-MOD-05',
        paperName: 'Advanced Calculus Model Paper 05',
        date: 'October 28, 2026',
        day: 'Tuesday',
        timeSlot: '07:00 PM - 09:30 PM',
        duration: '2.5 Hours',
        hallNumber: 'Google Meet Virtual Classroom',
        seatNumber: 'Online Roll #42',
        syllabusCoverage: 'Definite Integrals & Area Calculations',
        maxMarks: 100,
        status: 'upcoming',
        admissionStatus: 'Hall Ticket Issued'
      }
    ],
    pastTermsHistory: [
      {
        termName: 'September 2026 Batch Assessment',
        academicYear: '2026',
        aggregateAverage: 88.5,
        classRank: 4,
        totalStudents: 142,
        attendanceRate: 95.0,
        gradeClassification: 'Distinction'
      }
    ]
  },
  {
    id: 'child_02',
    studentId: 'usr_student_02',
    name: 'Ananya K.',
    admissionNo: 'TUT-1420',
    grade: 'Grade 8 (Junior Secondary)',
    classSection: 'Junior Scholars Batch',
    avatarText: 'AK',
    schoolName: 'Solo Tutor & Masterclass Network',
    enrolledSinceYear: '2026',
    admissionGrade: 'Grade 8',
    currentStage: 'Junior Secondary Scholars',
    cumulativeCareerAverage: 93.6,
    totalYearsEnrolled: 1,
    classTeacher: 'Mrs. Nilmini Silva',
    classTeacherEmail: 'nilmini.s@school.lk',
    classTeacherPhone: '+94 71 889 2211',
    attendanceRate: 98.5,
    presentDays: 24,
    totalDays: 24,
    overallAverage: 93.6,
    classRank: 1,
    totalStudents: 68,
    upcomingExamsCount: 2,
    hallTicketNo: 'TUT-PASS-2026-1420',
    nextExamDate: 'October 30, 2026',
    nextExamName: 'Grade 8 Science Monthly Test',

    // Pure Solo Tutor SaaS Properties
    enrolments: ANANYA_ENROLMENTS,
    invoices: ANANYA_INVOICES,
    attendanceLogs: ANANYA_ATTENDANCE_LOGS,
    paperMarks: ANANYA_PAPER_MARKS,
    announcements: ANANYA_ANNOUNCEMENTS,
    monthlyInvestmentLkr: 6000,
    activeEnrolmentsCount: 3,
    pendingSlipsCount: 0,

    // Legacy fallbacks
    termReport: legacyTermReport,
    termReports: [legacyTermReport],
    academicJourney: [
      {
        id: 'yr_02',
        year: '2026',
        gradeLevel: 'Grade 8',
        stage: 'Junior Secondary',
        classSection: 'Junior Scholars',
        classTeacher: 'Mrs. Nilmini Silva',
        annualAverage: 93.6,
        annualRank: 1,
        totalStudents: 68,
        attendanceRate: 98.5,
        promotionStatus: 'Active Junior Enrolment',
        terms: [legacyTermReport]
      }
    ],
    recentAttendance: [
      { date: '2026-10-09', day: 'Friday', status: 'present', checkInTime: '04:58 PM', note: 'Joined Zoom live on time' },
      { date: '2026-10-07', day: 'Wednesday', status: 'present', checkInTime: '05:00 PM', note: 'Full attendance recorded' }
    ],
    examSchedules: [],
    pastTermsHistory: []
  }
];

export const initialParentLeaveRequests: ParentLeaveRequest[] = [
  {
    id: 'leave_req_01',
    childId: 'child_01',
    childName: 'Sathurjan K.',
    tutorName: 'Dr. Samantha Perera',
    startDate: '2026-10-17',
    endDate: '2026-10-17',
    reason: 'School Exam Clashing',
    note: 'Term exam on Monday morning, requesting to watch recording instead of live session.',
    hasMedicalCertificate: false,
    status: 'approved',
    submittedDate: '2026-10-14',
    reviewedBy: 'Dr. Samantha Perera',
    reviewComment: 'Approved. Session recording and paper will remain unlocked for 7 days.'
  }
];

export const initialSchoolCirculars: SchoolCircular[] = [
  {
    id: 'circ_01',
    circularNo: 'TUT-CIR-2026-08',
    title: 'October A/L Theory & Paper Class Master Schedule Notice',
    category: 'Academic',
    date: 'Oct 01, 2026',
    summary: 'Comprehensive monthly timetable and revision masterclasses published for all A/L batches.',
    content: 'All live Google Meet and Zoom class links for October are active. Please ensure monthly deposit slips are uploaded by the 10th to prevent automated link locking.',
    priority: 'high',
    targetAudience: 'All Enrolled Parents & Students',
    attachmentName: 'October_Master_Schedule_Tutors.pdf',
    attachmentSize: '1.8 MB'
  }
];
