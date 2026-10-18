import {
  ConnectTeacher,
  ConnectStudent,
  ConnectStudyGroup,
  ConnectMessage,
  ConnectPurchase,
  TeacherSubscriber,
  TutorPackage
} from '@/types/lms';

export const initialConnectTeachers: ConnectTeacher[] = [
  {
    id: 'ct_01',
    name: 'Ms. Kavitha Rajan',
    initials: 'MK',
    avatarColor: 'bg-purple-600',
    verified: true,
    title: 'Mathematics Teacher • Grade 10-12 & A/L',
    subject: 'Combined Mathematics',
    studentsCount: 284,
    lessonsCount: 42,
    liveClassesCount: 6,
    monthlyFee: 2500,
    currency: 'LKR',
    rating: 4.9,
    tags: ['Calculus', 'Statistics', 'Pure Maths', 'A/L'],
    meetUrl: 'https://meet.google.com/kav-math-live',
    bio: 'Over 12 years of experience preparing students for G.C.E. A/L Combined Mathematics with proven island ranks.',
    qualifications: 'B.Sc. (Hons) Mathematics (Univ of Colombo), Dip. in Education',
    sampleVideoTitle: 'Calculus: Integration by Parts & Partial Fractions Masterclass',
    isSubscribed: false
  },
  {
    id: 'ct_02',
    name: 'Mr. Thuvaragan S.',
    initials: 'TR',
    avatarColor: 'bg-emerald-600',
    verified: true,
    title: 'Physics Teacher • Grade 11-12 & A/L',
    subject: 'Physics',
    studentsCount: 197,
    lessonsCount: 38,
    liveClassesCount: 4,
    monthlyFee: 2000,
    currency: 'LKR',
    rating: 4.8,
    tags: ['Mechanics', 'Waves & Optics', 'Electricity'],
    meetUrl: 'https://meet.google.com/thuvaragan-physics',
    bio: 'Specialist in Physics conceptual problem-solving, structured essay strategies, and practical demonstrations.',
    qualifications: 'B.Sc. Eng (Hons) University of Moratuwa',
    sampleVideoTitle: 'Rotational Motion & Inertia with Real-life Simulation',
    isSubscribed: false
  },
  {
    id: 'ct_03',
    name: 'Dr. Sarath Perera',
    initials: 'SP',
    avatarColor: 'bg-sky-600',
    verified: true,
    title: 'Chemistry Senior Lecturer • A/L Theory & Revision',
    subject: 'Chemistry',
    studentsCount: 342,
    lessonsCount: 56,
    liveClassesCount: 8,
    monthlyFee: 2800,
    currency: 'LKR',
    rating: 4.95,
    tags: ['Organic Chemistry', 'Equilibrium', 'Industrial Chem'],
    meetUrl: 'https://meet.google.com/sarath-chem-class',
    bio: 'Author of celebrated national A/L Chemistry reference guides and former Chief Examiner.',
    qualifications: 'Ph.D. in Chemistry (University of Peradeniya)',
    sampleVideoTitle: 'Organic Conversion Roadmaps: 100 Reactions Simplified',
    isSubscribed: true,
    subscribedDate: '2026-09-15'
  },
  {
    id: 'ct_04',
    name: 'Eng. N. Ketheesan',
    initials: 'NK',
    avatarColor: 'bg-amber-600',
    verified: true,
    title: 'ICT & Computing Specialist • Grade 12-13',
    subject: 'Information & Communication Technology',
    studentsCount: 215,
    lessonsCount: 34,
    liveClassesCount: 5,
    monthlyFee: 2200,
    currency: 'LKR',
    rating: 4.85,
    tags: ['Python Programming', 'Database & SQL', 'Networking', 'IoT'],
    meetUrl: 'https://meet.google.com/ketheesan-ict-live',
    bio: 'Software engineer and educator focused on hands-on programming, database design, and A/L ICT past paper breakdowns.',
    qualifications: 'B.Sc. Software Engineering, Sun Certified Java Developer',
    sampleVideoTitle: 'Python OOP & Data Structures for A/L Section B',
    isSubscribed: false
  },
  {
    id: 'ct_05',
    name: 'Mrs. Shanthi Mohan',
    initials: 'SM',
    avatarColor: 'bg-rose-600',
    verified: true,
    title: 'Biology Teacher • Plant Physiology & Genetics',
    subject: 'Biology',
    studentsCount: 180,
    lessonsCount: 29,
    liveClassesCount: 4,
    monthlyFee: 2000,
    currency: 'LKR',
    rating: 4.7,
    tags: ['Genetics', 'Plant Biology', 'Human Physiology'],
    meetUrl: 'https://meet.google.com/shanthi-bio-live',
    bio: 'Dedicated biology educator making complex cellular mechanisms and genetics easy to visualize with 3D models.',
    qualifications: 'M.Sc. Molecular Biology, B.Sc. Zoology',
    sampleVideoTitle: 'Mendelian Genetics & Pedigree Analysis Step-by-Step',
    isSubscribed: false
  }
];

export const initialConnectStudents: ConnectStudent[] = [
  {
    id: 'cs_01',
    name: 'Thivya N.',
    initials: 'TN',
    grade: 'Grade 12',
    stream: 'Physical Science',
    school: 'Colombo Hindu College',
    avatarColor: 'bg-emerald-500',
    subjects: ['Combined Maths', 'Physics', 'Chemistry'],
    status: 'online',
    isBuddy: true
  },
  {
    id: 'cs_02',
    name: 'Kavisan R.',
    initials: 'KR',
    grade: 'Grade 12',
    stream: 'Physical Science',
    school: 'Jaffna Central College',
    avatarColor: 'bg-blue-500',
    subjects: ['Combined Maths', 'Physics', 'ICT'],
    status: 'in_study',
    isBuddy: false
  },
  {
    id: 'cs_03',
    name: 'Niroshan T.',
    initials: 'NT',
    grade: 'Grade 12',
    stream: 'Biological Science',
    school: "St. John's College",
    avatarColor: 'bg-purple-500',
    subjects: ['Biology', 'Chemistry', 'Physics'],
    status: 'online',
    isBuddy: false
  },
  {
    id: 'cs_04',
    name: 'Pavithra S.',
    initials: 'PS',
    grade: 'Grade 12',
    stream: 'Physical Science',
    school: "Chundikuli Girls' College",
    avatarColor: 'bg-pink-500',
    subjects: ['Combined Maths', 'Physics', 'Chemistry'],
    status: 'offline',
    isBuddy: true
  },
  {
    id: 'cs_05',
    name: 'Dharshan K.',
    initials: 'DK',
    grade: 'Grade 12',
    stream: 'Physical Science',
    school: 'Hartley College',
    avatarColor: 'bg-amber-500',
    subjects: ['Combined Maths', 'Physics', 'ICT'],
    status: 'online',
    isBuddy: false
  }
];

export const initialConnectStudyGroups: ConnectStudyGroup[] = [
  {
    id: 'cg_01',
    teacherId: 'ct_01',
    teacherName: 'Ms. Kavitha Rajan',
    name: 'A/L 2026 Combined Maths Master Circle',
    subject: 'Combined Mathematics',
    description: 'Weekly teacher-led problem solving circle covering Pure Maths (Induction, Calculus) and Applied Mechanics with peer review.',
    membersCount: 64,
    maxMembers: 100,
    activeTopic: 'Differential Equations & Partial Fractions',
    schedule: 'Every Tue & Thu · 7:30 PM - 9:00 PM',
    meetUrl: 'https://meet.google.com/kavitha-maths-circle',
    isJoined: true,
    color: 'from-purple-500/10 to-indigo-500/5'
  },
  {
    id: 'cg_02',
    teacherId: 'ct_02',
    teacherName: 'Mr. Thuvaragan S.',
    name: 'Physics Mechanics Problem Busters',
    subject: 'Physics',
    description: 'Structured essay breakdowns, difficult past paper questions, and high-yield derivations in Statics and Rotation.',
    membersCount: 48,
    maxMembers: 80,
    activeTopic: 'Simple Harmonic Motion (SHM) & Oscillations',
    schedule: 'Every Saturday · 10:00 AM - 11:30 AM',
    meetUrl: 'https://meet.google.com/thuvaragan-physics-circle',
    isJoined: false,
    color: 'from-emerald-500/10 to-teal-500/5'
  },
  {
    id: 'cg_03',
    teacherId: 'ct_04',
    teacherName: 'Mr. Ketheesan K.',
    name: 'ICT Python & SQL Project Lab',
    subject: 'Information & Communication Technology',
    description: 'Hands-on coding practice for A/L ICT Section B, database normalization, and live code reviews.',
    membersCount: 39,
    maxMembers: 50,
    activeTopic: 'Database Normalization (1NF to 3NF) & SQL Joins',
    schedule: 'Every Sunday · 4:00 PM - 5:30 PM',
    meetUrl: 'https://meet.google.com/ketheesan-ict-circle',
    isJoined: false,
    color: 'from-amber-500/10 to-yellow-500/5'
  },
  {
    id: 'cg_04',
    teacherId: 'ct_03',
    teacherName: 'Dr. Sarath Perera',
    name: 'Chemistry Organic Reactions Sprint',
    subject: 'Chemistry',
    description: 'Flashcard sessions and reaction roadmaps for aliphatic and aromatic organic chemistry led by Dr. Sarath.',
    membersCount: 52,
    maxMembers: 80,
    activeTopic: 'Carbonyl Compounds (Aldehydes & Ketones) Grignard Reactions',
    schedule: 'Every Monday · 6:30 PM - 8:00 PM',
    meetUrl: 'https://meet.google.com/sarath-chem-circle',
    isJoined: true,
    color: 'from-sky-500/10 to-blue-500/5'
  }
];

export const initialConnectPurchases: ConnectPurchase[] = [
  {
    id: 'pur_01',
    teacherId: 'ct_03',
    teacherName: 'Dr. Sarath Perera',
    teacherInitials: 'SP',
    teacherColor: 'bg-sky-600',
    subject: 'Chemistry',
    amount: 2800,
    currency: 'LKR',
    date: '2026-09-15',
    validUntil: '2026-10-15',
    status: 'active',
    paymentMethod: 'Card (Visa/Mastercard)',
    receiptNo: 'REC-2026-98124',
    meetUrl: 'https://meet.google.com/sarath-chem-class'
  }
];

export const initialConnectMessages: ConnectMessage[] = [
  {
    id: 'msg_01',
    senderId: 'ct_01',
    senderName: 'Ms. Kavitha Rajan',
    senderAvatar: 'MK',
    text: 'Vanakkam Sathurjan! Please make sure to attempt Question 4 on Partial Fractions before our live session tomorrow evening.',
    timestamp: 'Yesterday, 6:15 PM',
    isMe: false
  },
  {
    id: 'msg_02',
    senderId: 'usr_student_01',
    senderName: 'Sathurjan K.',
    senderAvatar: 'SK',
    text: 'Vanakkam Miss! Yes, I have worked out questions 1 to 3 and I will finish question 4 tonight. Thank you!',
    timestamp: 'Yesterday, 6:28 PM',
    isMe: true
  },
  {
    id: 'msg_03',
    senderId: 'ct_01',
    senderName: 'Ms. Kavitha Rajan',
    senderAvatar: 'MK',
    text: 'Excellent work! Keep it up. We will also review the 2025 past paper marking rubric during the last 30 minutes.',
    timestamp: 'Yesterday, 6:35 PM',
    isMe: false
  }
];

export const initialTeacherSubscribers: TeacherSubscriber[] = [
  {
    id: 'sub_01',
    studentId: 'usr_student_01',
    studentName: 'Sathurjan K.',
    studentInitials: 'SK',
    avatarColor: 'bg-emerald-600',
    grade: 'Grade 12 (A/L)',
    stream: 'Physical Science',
    school: "St. Patrick's College, Jaffna",
    subscribedDate: '2026-09-01',
    validUntil: '2026-10-31',
    planName: 'Combined Maths A/L Full Masterclass',
    amount: 2500,
    currency: 'LKR',
    status: 'active',
    paymentMethod: 'Card (Visa)',
    attendanceRate: 98
    ,schoolId: 'sch_01'
  },
  {
    id: 'sub_02',
    studentId: 'usr_student_02',
    studentName: 'Kasun Bandara',
    studentInitials: 'KB',
    avatarColor: 'bg-blue-600',
    grade: 'Grade 12 (A/L)',
    stream: 'Physical Science',
    school: 'Royal College, Colombo',
    subscribedDate: '2026-09-05',
    validUntil: '2026-10-05',
    planName: 'Theory & Problem Solving Live Pass',
    amount: 2500,
    currency: 'LKR',
    status: 'active',
    paymentMethod: 'Bank Deposit (BOC)',
    slipReference: 'BOC-TXN-882910',
    attendanceRate: 92
    ,schoolId: 'sch_01'
  },
  {
    id: 'sub_03',
    studentId: 'usr_student_03',
    studentName: 'Nethmi Wijesinghe',
    studentInitials: 'NW',
    avatarColor: 'bg-purple-600',
    grade: 'Grade 12 (A/L)',
    stream: 'Physical Science',
    school: 'Visakha Vidyalaya, Colombo',
    subscribedDate: '2026-10-02',
    validUntil: '2026-11-02',
    planName: 'Combined Maths Monthly Pass',
    amount: 2500,
    currency: 'LKR',
    status: 'pending_slip',
    paymentMethod: 'Bank Deposit (BOC)',
    slipReference: 'BOC-TXN-994102',
    slipFileName: 'BOC_Deposit_Slip_Nethmi.jpg',
    attendanceRate: 100
    ,schoolId: 'sch_01'
  },
  {
    id: 'sub_04',
    studentId: 'usr_student_04',
    studentName: 'Pavithra S.',
    studentInitials: 'PS',
    avatarColor: 'bg-pink-600',
    grade: 'Grade 12 (A/L)',
    stream: 'Physical Science',
    school: "Chundikuli Girls' College, Jaffna",
    subscribedDate: '2026-09-10',
    validUntil: '2026-10-10',
    planName: 'Combined Maths A/L Full Masterclass',
    amount: 2500,
    currency: 'LKR',
    status: 'active',
    paymentMethod: 'Card (Mastercard)',
    attendanceRate: 96
    ,schoolId: 'sch_01'
  },
  {
    id: 'sub_05',
    studentId: 'usr_student_05',
    studentName: 'Dharshan K.',
    studentInitials: 'DK',
    avatarColor: 'bg-amber-600',
    grade: 'Grade 12 (A/L)',
    stream: 'Physical Science',
    school: 'Hartley College, Point Pedro',
    subscribedDate: '2026-09-12',
    validUntil: '2026-10-12',
    planName: 'Pure & Applied Combined Maths Live',
    amount: 2500,
    currency: 'LKR',
    status: 'active',
    paymentMethod: 'Commercial Bank Online',
    attendanceRate: 95
    ,schoolId: 'sch_01'
  },
  {
    id: 'sub_06',
    studentId: 'usr_student_06',
    studentName: 'Tharindu Senanayake',
    studentInitials: 'TS',
    avatarColor: 'bg-teal-600',
    grade: 'Grade 12 (A/L)',
    stream: 'Physical Science',
    school: 'Ananda College, Colombo',
    subscribedDate: '2026-10-01',
    validUntil: '2026-11-01',
    planName: 'Combined Maths Theory Pass',
    amount: 2500,
    currency: 'LKR',
    status: 'pending_slip',
    paymentMethod: 'Bank Deposit (Commercial Bank)',
    slipReference: 'COMB-TXN-771204',
    slipFileName: 'Commercial_Bank_Slip_Tharindu.pdf',
    attendanceRate: 90
    ,schoolId: 'sch_01'
  },
  {
    id: 'sub_07',
    studentId: 'usr_student_07',
    studentName: 'Amina Farook',
    studentInitials: 'AF',
    avatarColor: 'bg-rose-600',
    grade: 'Grade 12 (A/L)',
    stream: 'Physical Science',
    school: "Muslim Ladies' College, Colombo",
    subscribedDate: '2026-08-25',
    validUntil: '2026-09-25',
    planName: 'Combined Maths Monthly Pass',
    amount: 2500,
    currency: 'LKR',
    status: 'expired',
    paymentMethod: 'FriMi / PayHere',
    attendanceRate: 84
    ,schoolId: 'sch_01'
  },
  {
    id: 'sub_08',
    studentId: 'usr_student_08',
    studentName: 'Kavinda Fernando',
    studentInitials: 'KF',
    avatarColor: 'bg-indigo-600',
    grade: 'Grade 12 (A/L)',
    stream: 'Physical Science',
    school: "St. Joseph's College, Colombo",
    subscribedDate: '2026-09-18',
    validUntil: '2026-10-18',
    planName: 'Combined Maths A/L Full Masterclass',
    amount: 2500,
    currency: 'LKR',
    status: 'active',
    paymentMethod: 'Card (Visa)',
    attendanceRate: 94
    ,schoolId: 'sch_01'
  }
];

export const initialTutorPackages: TutorPackage[] = [
  {
    id: 'pkg_01',
    teacherId: 'ct_01',
    title: 'A/L Combined Mathematics Full Masterclass',
    subject: 'Combined Mathematics',
    grade: 'Grade 12 & 13 (A/L)',
    monthlyFeeLkr: 3500,
    billingCycle: 'Monthly',
    description: 'Complete comprehensive syllabus coverage: Calculus, Trigonometry, Statics & Dynamics, with weekly live classes, printed tute delivery, and monthly model paper discussions.',
    features: [
      '4 Live Interactive Classes / Week (Google Meet)',
      'High-Definition Recorded Video Archive with 24/7 Access',
      'Theory & Exercise Tutes (Printable PDF + Answer Guides)',
      'Monthly Timed Model Paper Discussion & Individual Marking',
      'Dedicated WhatsApp VIP Doubt Clearing Group'
    ],
    liveClassesPerWeek: 4,
    status: 'active',
    enrolledCount: 86,
    badge: 'Most Popular',
    createdAt: '2026-01-10'
  },
  {
    id: 'pkg_02',
    teacherId: 'ct_01',
    title: 'Pure Mathematics Theory & Proofs Intensive',
    subject: 'Pure Mathematics',
    grade: 'Grade 12 (A/L)',
    monthlyFeeLkr: 2500,
    billingCycle: 'Monthly',
    description: 'Focused deep-dive into Pure Mathematics: Functions, Polynomials, Complex Numbers, Matrices and Integration theorems for students targeting Island Top 50.',
    features: [
      '2 Live Theory Masterclasses / Week',
      'Detailed Theorem Proof Sheets & Formula Handbooks',
      '10-Year Past Paper Structured Question Breakdown',
      'Bi-weekly Online Diagnostic Quizzes'
    ],
    liveClassesPerWeek: 2,
    status: 'active',
    enrolledCount: 38,
    badge: 'Core Theory',
    createdAt: '2026-02-01'
  },
  {
    id: 'pkg_03',
    teacherId: 'ct_01',
    title: 'Applied Maths & Mechanics Problem Solving Pass',
    subject: 'Applied Mathematics',
    grade: 'Grade 13 (A/L)',
    monthlyFeeLkr: 2200,
    billingCycle: 'Monthly',
    description: 'Master vectors, friction, equilibrium, projectiles, and circular motion with step-by-step problem-solving templates and shortcut calculation methods.',
    features: [
      '2 Live Problem Solving Sessions / Week',
      'Mechanics Real-World Vector Diagrams & Worksheets',
      'Recorded Video Replays with Chapter Bookmarks',
      'Teacher Direct Q&A Support'
    ],
    liveClassesPerWeek: 2,
    status: 'active',
    enrolledCount: 24,
    createdAt: '2026-03-05'
  },
  {
    id: 'pkg_05',
    teacherId: 'ct_02',
    title: 'A/L Physics Theory & Real-Life Simulations Pass',
    subject: 'Physics',
    grade: 'Grade 12 & 13 (A/L)',
    monthlyFeeLkr: 2000,
    billingCycle: 'Monthly',
    description: 'Comprehensive Mechanics, Waves & Optics, Electricity and Modern Physics with hands-on conceptual demonstrations and structured essay writing methods.',
    features: [
      '4 Live Google Meet Classes / Month',
      'Step-by-step Physics MCQ Shortcut Speed Techniques',
      'Full Term Test Model Paper Discussions',
      'Direct WhatsApp Homework Mentorship'
    ],
    liveClassesPerWeek: 4,
    status: 'active',
    enrolledCount: 54,
    badge: 'High Demand',
    createdAt: '2026-02-15'
  },
  {
    id: 'pkg_06',
    teacherId: 'ct_02',
    title: 'Physics Mechanics & Past Paper Breakdown',
    subject: 'Physics',
    grade: 'Grade 12 (A/L)',
    monthlyFeeLkr: 1800,
    billingCycle: 'Monthly',
    description: 'Dedicated focus on Rotational Dynamics, Circular Motion, Gravitation, and 20 years of past paper essays.',
    features: [
      '2 Live Masterclasses / Week',
      'Detailed Derivation Summary Sheets',
      'Past Paper Model Marking Schemes'
    ],
    liveClassesPerWeek: 2,
    status: 'active',
    enrolledCount: 31,
    createdAt: '2026-03-01'
  },
  {
    id: 'pkg_07',
    teacherId: 'ct_03',
    title: 'Chemistry Organic & Inorganic Masterclass Pass',
    subject: 'Chemistry',
    grade: 'Grade 12 & 13 (A/L)',
    monthlyFeeLkr: 2800,
    billingCycle: 'Monthly',
    description: '100 Organic reaction conversion roadmaps, Equilibrium calculations, and Industrial Chemistry by former Chief Examiner Dr. Sarath Perera.',
    features: [
      '4 Live Theory & Reaction Mechanism Classes / Month',
      'Colour-coded Reaction Flowcharts & Workbooks',
      'Monthly Timed Paper Evaluation & Feedback'
    ],
    liveClassesPerWeek: 4,
    status: 'active',
    enrolledCount: 72,
    badge: 'Author Recommended',
    createdAt: '2026-01-20'
  },
  {
    id: 'pkg_08',
    teacherId: 'ct_04',
    title: 'A/L ICT Python Programming & SQL Database Plan',
    subject: 'Information & Communication Technology',
    grade: 'Grade 12 & 13 (A/L)',
    monthlyFeeLkr: 2200,
    billingCycle: 'Monthly',
    description: 'Hands-on programming practice, database relational schema design, network topology calculations, and section B code questions.',
    features: [
      '3 Live Coding & Theory Classes / Week',
      'Downloadable Python Code Repositories & SQL Scripts',
      'Project-based Past Paper breakdown'
    ],
    liveClassesPerWeek: 3,
    status: 'active',
    enrolledCount: 45,
    badge: 'Practical Focused',
    createdAt: '2026-02-10'
  },
  {
    id: 'pkg_09',
    teacherId: 'ct_05',
    title: 'Biology Plant Physiology & Genetics Mastery Pass',
    subject: 'Biology',
    grade: 'Grade 12 & 13 (A/L)',
    monthlyFeeLkr: 2000,
    billingCycle: 'Monthly',
    description: 'Visual 3D molecular biology models, Mendelian genetic pedigrees, and resource book line-by-line review.',
    features: [
      '3 Live Interactive Classes / Week',
      'High-Yield Structured Essay Points & Diagrams',
      'Model MCQ Strategy Sessions'
    ],
    liveClassesPerWeek: 3,
    status: 'active',
    enrolledCount: 36,
    badge: 'Top Rated',
    createdAt: '2026-02-28'
  }
];
