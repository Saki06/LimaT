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
  feeStatus: "paid" | "pending_slip" | "overdue";
  validUntil: string;
  lastPaymentDate: string;
  lastPaymentRef: string;
  paymentBank: string;
  liveClassSchedule: string;
  platform: "Google Meet" | "Zoom" | "Microsoft Teams";
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
  status: "cleared" | "under_review" | "overdue";
  paymentMethod: "bank_slip" | "online_card" | "lanka_qr";
  slipRefNumber?: string;
  bankName?: string;
  branchName?: string;
  depositedDate?: string;
  slipImageUrl?: string;
  approvalDate?: string;
  tutorNotes?: string;
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
  priority: "urgent" | "regular";
  category: "Schedule Change" | "Paper Class Notice" | "Courier/Tute Dispatch" | "Special Seminar";
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
  reason:
    | "Medical Illness"
    | "Family Emergency"
    | "Religious Observation"
    | "Official Competition"
    | "School Exam Clashing"
    | "Other";
  note: string;
  hasMedicalCertificate: boolean;
  status: "approved" | "pending" | "rejected";
  submittedDate: string;
  reviewedBy?: string;
  reviewComment?: string;
}

export interface ParentChildProfile {
  id: string;
  admissionNo?: string;
  name: string;
  grade: string;
  avatarText: string;
  overallAverage: number;
  classRank: number;
  totalStudents: number;
  enrolments: ChildTuitionEnrolment[];
  invoices: TuitionInvoice[];
  paperMarks: TutorPaperMarkRecord[];
  announcements: TutorAnnouncement[];
  monthlyInvestmentLkr: number;
  pendingSlipsCount: number;
}
