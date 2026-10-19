export type UserRole = 'student' | 'teacher' | 'admin' | 'super_admin' | 'parent';
export type AdminStaffRole = 'teacher' | 'coach';
export type AdminRecordStatus = 'active' | 'on_leave' | 'resigned' | 'inactive';
export type SchoolMedium = 'english' | 'tamil' | 'sinhala';
export type LocaleCode = 'en' | 'ta' | 'si';
export type DeviceViewMode = 'responsive' | 'desktop' | 'tablet' | 'mobile';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  grade?: string;
  class?: string;
  schoolId: string;
  schoolName: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  district: string;
  province: string;
  principal: string;
  studentCount: number;
  teacherCount: number;
}

export interface GradeLevel {
  id: string;
  name: string; // e.g. "Grade 10", "Grade 11"
  code: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "10-A", "11-Science"
  gradeId: string;
  gradeName: string;
  classTeacherId: string;
  classTeacherName: string;
  studentCount: number;
}

export type TimetableDay =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface TimetableEntry {
  id: string;
  day: TimetableDay;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface Subject {
  id: string;
  name: string; // e.g. "Combined Mathematics", "Physics"
  code: string;
  gradeId: string;
  gradeName: string;
  icon?: string;
  color?: string;
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  description: string;
  order: number;
  status: 'draft' | 'published';
  contentType: 'rich_text' | 'slides' | 'video' | 'pdf';
  contentBody: string;
  videoUrl?: string;
  slidesCount?: number;
  attachments?: { name: string; size: string; type: string }[];
  completedByStudentIds: string[];
}

export interface Topic {
  id: string;
  unitId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface SyllabusUnit {
  id: string;
  subjectId: string;
  title: string;
  order: number;
  topics: Topic[];
}

export interface Course {
  id: string;
  subjectId: string;
  title: string;
  code: string;
  teacherId: string;
  teacherName: string;
  gradeName: string;
  className: string;
  bannerColor: string;
  units: SyllabusUnit[];
  totalLessons: number;
  completedLessons: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  subjectName: string;
  title: string;
  instructions: string;
  topicName: string;
  maxMarks: number;
  dueDate: string;
  status: 'draft' | 'published';
  attachmentName?: string;
  submissionsCount: number;
  pendingReviewCount: number;
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  submittedAt: string;
  status: 'not_submitted' | 'submitted' | 'marked' | 'result_released';
  textContent?: string;
  fileAttachmentName?: string;
  marksObtained?: number;
  maxMarks: number;
  teacherFeedback?: string;
  markedAt?: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  options?: string[]; // for mcq
  correctAnswer: string | number; // index or string
  explanation?: string;
  marks: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  subjectName: string;
  title: string;
  instructions: string;
  durationMinutes: number;
  dueDate: string;
  status: 'draft' | 'published';
  totalQuestions: number;
  totalMarks: number;
  questions: QuizQuestion[];
  userAttempt?: {
    status: 'available' | 'in_progress' | 'submitted' | 'result_released';
    score?: number;
    completedAt?: string;
  };
}

export interface Sport {
  id: string;
  name: string; // e.g. "Cricket", "Athletics", "Rugby"
  category: string;
  iconName: string;
  activeTeamsCount: number;
}

export interface SportsTeam {
  id: string;
  sportId: string;
  sportName: string;
  name: string; // e.g. "Under-17 First XI Cricket"
  coachId: string;
  coachName: string;
  playersCount: number;
  status: 'draft' | 'active' | 'completed';
  trainingSchedule: string;
  players: { id: string; name: string; position: string; grade: string }[];
}

export type TournamentFormat = 'knockout' | 'round_robin' | 'group_stage_knockout' | 'league';
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed' | 'registration_open';

export interface Tournament {
  id: string;
  name: string;
  sportId: string;
  sportName: string;
  category: string; // e.g. "Under-17", "Under-19 Division 1", "Open"
  format: TournamentFormat;
  startDate: string;
  endDate: string;
  venue: string;
  organizer: string;
  teamsCount: number;
  participatingTeams: string[];
  status: TournamentStatus;
  trophyTitle: string;
  description: string;
  rules?: string;
  currentRound?: string;
  champion?: string;
  runnerUp?: string;
}

export interface Fixture {
  id: string;
  teamId: string;
  sportName: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  competitionName: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  result?: {
    homeScore: string;
    awayScore: string;
    outcome: string; // "Won by 4 wickets"
    recordedAt: string;
  };
}

export interface Standing {
  id: string;
  sportName: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  capacity: number;
  registeredCount: number;
  audience: 'all' | 'students' | 'teachers' | 'grade_11' | 'grade_12';
  status: 'draft' | 'published' | 'completed';
  isRegisteredByCurrentUser?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  publishedAt: string;
  authorName: string;
  authorRole: string;
  targetAudience: string;
  priority: 'normal' | 'high' | 'urgent';
}

export interface AdminStaffRecord {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  role: AdminStaffRole;
  avatar?: string;
  subjects?: string[];
  classes?: string[];
  sport?: string;
  teams?: string[];
  status: AdminRecordStatus;
  workload: number;
  phone?: string;
  staffId: string;
  photo?: string;
  gender?: 'female' | 'male' | 'other';
  dateOfBirth?: string;
  joiningDate?: string;
  qualification?: string;
  classTeacherOf?: string;
  medium?: SchoolMedium;
  certification?: string;
  availability?: string;
}

export interface StaffInput {
  role: AdminStaffRole;
  name: string;
  photo?: string;
  staffId: string;
  email: string;
  phone: string;
  gender: 'female' | 'male' | 'other';
  dateOfBirth: string;
  joiningDate: string;
  status: AdminRecordStatus;
  qualification?: string;
  subjects: string[];
  classes: string[];
  classTeacherOf?: string;
  medium?: SchoolMedium;
  sports: string[];
  teams: string[];
  certification?: string;
  availability?: string;
}

export interface AdminSubjectRecord {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  grades: string[];
  medium: SchoolMedium;
  assignedTeacherIds: string[];
  assignedTeacherNames: string[];
  units: SyllabusUnit[];
}

export interface AdminDirectoryUser {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  role: UserRole | 'coach';
  grade?: string;
  className?: string;
  status: AdminRecordStatus;
  phone?: string;
}

export type LibraryResourceType = 'book' | 'tute' | 'past_paper';

export interface LibraryResource {
  id: string;
  title: string;
  resourceType: LibraryResourceType; // 'book' | 'tute' | 'past_paper'
  subject: string;
  author: string;
  description: string;
  topic?: string; // used for tutes (e.g. Unit / Module name)
  category: string; // e.g. "Advanced Level", "Revision", "STEM & Computing", etc.
  coverImage: string;
  fileType: string; // "PDF", "EPUB", "DOCX"
  fileSize: string; // e.g. "4.2 MB"
  pageCount?: number;
  uploadedDate: string; // "2026-09-15"
  status: 'published' | 'draft' | 'unpublished';
  visibility: 'public' | 'class_only' | 'private' | 'subscribers_only';
  packageId?: string;
  packageName?: string;
  packagePrice?: number;
  isLocked?: boolean;
  isOwner?: boolean;
  teacherId?: string;
  authorAvatar?: string;
  allowDownload: boolean;
  downloadsCount: number;
  viewsCount: number;
  rating?: number;
  featured?: boolean;
  // Past paper specific fields
  year?: number; // e.g. 2025, 2024, 2023, 2022
  medium?: 'Tamil' | 'English' | 'Sinhala' | 'Trilingual' | 'All';
  examType?: 'G.C.E. Advanced Level' | 'G.C.E. Ordinary Level' | 'Provincial Term Test' | 'School Model Paper';
  paperPart?: 'Paper I (MCQ)' | 'Paper II (Structured & Essay)' | 'Complete Set (Paper I + II)' | 'Marking Scheme';
  hasMarkingScheme?: boolean;
  markingSchemeUrl?: string;
  markingSchemePages?: number;
  markingSchemeNotes?: string;
  timeAllowedMinutes?: number;
  tableOfContents?: { title: string; page: number }[];
  keyHighlights?: string[];
  sampleContent?: { chapterTitle: string; pageNumber: number; text: string }[];
}

export interface ExamItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  examType: 'term_final' | 'mid_term' | 'national_model' | 'practical';
  date: string;
  time: string;
  durationMinutes: number;
  hallName: string;
  seatNumber: string;
  invigilator: string;
  totalMarks: number;
  status: 'upcoming' | 'in_progress' | 'completed' | 'results_released';
  candidateIndexNo: string;
  rules: string[];
  parts?: {
    partName: string;
    allocatedMarks: number;
    description: string;
    questions: {
      questionNo: number;
      questionTitle: string;
      marks: number;
      text: string;
    }[];
  }[];
}

export interface ExamTermResult {
  id: string;
  termTitle: string;
  candidateName: string;
  indexNumber: string;
  zScore: number;
  districtRank: number;
  islandRank: number;
  gpa: number;
  subjects: {
    subjectName: string;
    marksObtained: number;
    maxMarks: number;
    grade: 'A' | 'B' | 'C' | 'S' | 'F';
    rankInClass: number;
    teacherRemark: string;
  }[];
  principalRemark: string;
  issuedDate: string;
}

// Connect Hub / Marketplace Types
export interface ConnectTeacher {
  id: string;
  name: string;
  initials: string;
  avatarColor: string; // e.g. "bg-purple-600", "bg-emerald-600"
  verified: boolean;
  title: string; // "Mathematics Teacher • Grade 10-12 & A/L"
  subject: string;
  studentsCount: number;
  lessonsCount: number;
  liveClassesCount: number;
  monthlyFee: number; // e.g. 2500
  currency: string; // "LKR"
  rating: number; // 4.9
  tags: string[]; // ["Calculus", "Statistics", "Pure Maths", "A/L"]
  meetUrl: string; // "meet.google.com/abc-xyz"
  bio: string;
  qualifications: string;
  isSubscribed?: boolean;
  subscribedDate?: string;
  sampleVideoTitle?: string;
}

export interface ConnectStudent {
  id: string;
  name: string;
  initials: string;
  grade: string;
  stream: string;
  school: string;
  avatarColor: string;
  subjects: string[];
  status: 'online' | 'in_study' | 'offline';
  isBuddy?: boolean;
}

export interface ConnectStudyGroup {
  id: string;
  teacherId: string;
  teacherName: string;
  name: string;
  subject: string;
  description: string;
  membersCount: number;
  maxMembers: number;
  activeTopic: string;
  schedule: string;
  meetUrl?: string;
  isJoined?: boolean;
  color?: string;
}

export interface ConnectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface ConnectPurchase {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherInitials: string;
  teacherColor: string;
  subject: string;
  amount: number;
  currency: string;
  date: string;
  validUntil: string;
  status: 'active' | 'expired';
  paymentMethod: 'Card (Visa/Mastercard)' | 'Bank Deposit (Commercial Bank)' | 'FriMi / PayHere';
  receiptNo: string;
  meetUrl: string;
}

export interface TutorPackage {
  id: string;
  teacherId?: string;
  title: string;
  subject: string;
  grade: string;
  monthlyFeeLkr: number;
  billingCycle: 'Monthly' | 'Term (3 Months)' | 'Full Syllabus Pass';
  description: string;
  features: string[];
  liveClassesPerWeek: number;
  status: 'active' | 'draft' | 'archived';
  enrolledCount: number;
  badge?: string;
  createdAt: string;
}

export interface TeacherSubscriber {
  id: string;
  studentId: string;
  studentName: string;
  studentInitials: string;
  avatarColor: string;
  grade: string;
  stream: string;
  school: string;
  subscribedDate: string;
  validUntil: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'active' | 'pending_slip' | 'expired';
  paymentMethod: string;
  slipReference?: string;
  slipFileName?: string;
  attendanceRate: number;
  schoolId?: string;
}

export type TeacherHubStatus = 'active' | 'paused' | 'suspended';
export type HubFlagStatus = 'open' | 'dismissed' | 'hidden' | 'removed' | 'warned';
export type HubFlagAction = 'dismiss' | 'hide' | 'remove' | 'warn';

export interface TeacherHub {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  subjects: string[];
  subscriberCount: number;
  postsThisMonth: number;
  status: TeacherHubStatus;
  recentActivity: string;
}

export interface Subscription {
  id: string;
  schoolId: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  grade: string;
  subscribedDate: string;
  status: 'active' | 'pending' | 'expired' | 'removed';
}

export interface HubFlag {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  contentType: 'post' | 'message';
  content: string;
  createdAt: string;
  reason: string;
  status: HubFlagStatus;
  actionReason?: string;
}

export interface HubSettings {
  schoolId: string;
  enabled: boolean;
  approvalRequired: boolean;
  allowDirectMessages: boolean;
  maxSubscribersPerTeacher?: number;
}

export interface HubAuditEntry {
  id: string;
  schoolId: string;
  adminId: string;
  action: string;
  targetId: string;
  reason?: string;
  createdAt: string;
}
