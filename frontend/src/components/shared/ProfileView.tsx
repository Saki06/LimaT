"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  User,
  MapPin,
  BookOpen,
  GraduationCap,
  School,
  Edit3,
  Save,
  Check,
  Users,
  CheckCircle2,
  Camera,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Copy,
  Printer,
  Calendar,
  Clock,
  Download,
  UserCheck,
  ShieldCheck,
  Trophy,
  Award,
  Activity,
  Medal,
  Zap,
  Briefcase,
  Video,
  ExternalLink,
  DollarSign,
  Building2,
  Sliders,
  CreditCard,
  TrendingUp,
  BarChart3,
  Flame,
  Target,
  Globe,
  Share2,
  Sparkles,
  Send,
  Eye,
  X,
  Lock,
  Plus,
  Trash2,
  HelpCircle,
  Phone,
  MessageSquare,
  AlertCircle,
  AlertTriangle
} from "lucide-react";
import {
  TeacherQualification,
  TeacherAccreditation,
  TeacherBankAccount,
  TeacherSocialChannel
} from "@/types/lms";
import { initialExams, initialExamTermResult } from "@/data/mockData";

type ProfileTab =
  | "personal"
  | "academic"
  | "progress"
  | "timetable"
  | "sports"
  | "teaching"
  | "qualifications"
  | "schedule"
  | "responsibilities"
  | "payout"
  | "social";

export function ProfileView() {
  const {
    currentUser,
    currentRole,
    setCurrentView,
    addToast,
    courses,
    setSelectedCourseId,
    teacherProfile,
    updateTeacherProfile
  } = useApp();

  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleContinueCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView("courses");
  };

  const handleDownloadHallTicket = () => {
    addToast({
      type: "success",
      title: "Hall Ticket Downloaded",
      message: "Official Examination Admission Card & Timetable (PDF) has been saved."
    });
  };

  const handleDownloadSportsCertificate = () => {
    addToast({
      type: "success",
      title: "Sports Portfolio Downloaded",
      message: "Official Athletic Achievement Record & College Colors Transcript (PDF) has been saved."
    });
  };

  // Editable Profile State based on role
  const defaultProfile = useMemo(() => {
    if (currentRole === "teacher") {
      const userFirstName = teacherProfile?.user?.firstName || currentUser.name?.split(" ")[0] || "Samantha";
      const userLastName = teacherProfile?.user?.lastName || currentUser.name?.split(" ").slice(1).join(" ") || "Perera";
      const userFullName = `${userFirstName} ${userLastName}`.trim();

      return {
        name: currentUser.name || "Mr. Samantha Perera",
        fullName: userFullName || "Samantha Priyantha Perera",
        preferredName: userFirstName || "Samantha",
        studentId: teacherProfile?.employeeNo || "TCH-2026-0042",
        indexNumber: teacherProfile?.sltsRegNo || "SLTS-REG/2012/4482",
        email: teacherProfile?.user?.email || currentUser.email || "samantha.p@school.lk",
        phone: teacherProfile?.phone || "+94 77 456 7890",
        altPhone: "+94 11 234 5678",
        dob: "1984-06-18",
        gender: "Male",
        bloodGroup: "B+",
        medium: (teacherProfile?.mediums && teacherProfile.mediums.length > 0) ? teacherProfile.mediums.join(", ") : "English, Sinhala & Tamil",
        address: teacherProfile?.address || "No. 18, Havelock Road, Havelock Town",
        city: teacherProfile?.city || "Colombo 05",
        district: teacherProfile?.district || "Colombo",
        province: teacherProfile?.province || "Western Province",
        postalCode: teacherProfile?.postalCode || "00500",
        bio: teacherProfile?.bio || "Lead Specialist Educator & Department Chair for Combined Mathematics (A/L). 14 years of teaching excellence preparing students for G.C.E. Advanced Level with distinction.",
        schoolName: (currentUser.schoolName && currentUser.schoolName !== "St. Michael High School") ? currentUser.schoolName : "LimaT Independent Tuition & Masterclasses",
        schoolCode: "LMT-COLOMBO",
        gradeLevel: "Faculty",
        grade: teacherProfile?.title || "A/L Faculty (Grade 12 & 13)",
        classRoom: "Advanced Level Mathematics Faculty",
        stream: teacherProfile?.specialization || "Combined Mathematics & Pure Sciences",
        examYear: "2026",
        academicYear: "Faculty Member (2012 - Present)",
        house: "Lions Sports Academy Mentor",
        classTeacher: "Head of Faculty (Mathematics)",
        admittedDate: "September 2012",
        attendanceRate: "99.1%",
        gpa: `Faculty Rating ${teacherProfile?.rating ?? 4.9}/5.0`,
        guardianName: "Mrs. Malini Perera",
        guardianRelationship: "Spouse (Next of Kin)",
        guardianPhone: "+94 77 987 6543",
        guardianEmail: "malini.perera@gmail.com",
        guardianOccupation: "Senior Banking Executive",
        motherName: "M. Perera",
        motherPhone: "+94 11 234 5678",
        emergencyContact: "Faculty Support (+94 11 258 0042)",
        transportMode: "Faculty Parking (Pass #FC-42)",
        healthNotes: "Normal health clearance. First-aid certified.",
        extracurricular: "Master-in-Charge Mathematics Olympiad, Senior Chess Club Patron"
      };
    }

    if (currentRole === "parent") {
      return {
        name: currentUser.name || "Mrs. Priyadarshani Kulatunga",
        fullName: "Priyadarshani Kulatunga",
        preferredName: "Priya",
        studentId: "PAR-2026-012",
        indexNumber: "PAR/NIC-786542190V",
        email: currentUser.email || "priya.k@gmail.com",
        phone: "+94 77 345 6789",
        altPhone: "+94 11 289 1234",
        dob: "1982-11-24",
        gender: "Female",
        bloodGroup: "A+",
        medium: "English & Sinhala",
        address: "No. 42, Temple Road, Wellawatte",
        city: "Colombo 06",
        district: "Colombo",
        province: "Western Province",
        postalCode: "00600",
        bio: "Parent & Guardian of Sathurjan K. (Physical Science A/L Masterclass Batch). Active member of the Masterclass Parent-Mentor Council.",
        schoolName: (currentUser.schoolName && currentUser.schoolName !== "St. Michael High School") ? currentUser.schoolName : "LimaT Independent Tuition & Masterclasses",
        schoolCode: "LMT-COLOMBO",
        gradeLevel: "Parent",
        grade: "Registered Parent Council Member",
        classRoom: "Guardian of Enrolled Student",
        stream: "Parent-Mentor Council",
        examYear: "2026",
        academicYear: "2024 - Present",
        house: "Lions Sports Academy Supporter",
        classTeacher: "Dr. Samantha Perera & Eng. K. Thanushan",
        admittedDate: "January 2024",
        attendanceRate: "100% PTM Attendance",
        gpa: "Verified Guardian Status",
        guardianName: "Mrs. Priyadarshani Kulatunga",
        guardianRelationship: "Mother",
        guardianPhone: "+94 77 345 6789",
        guardianEmail: "priya.k@gmail.com",
        guardianOccupation: "Chartered Accountant & Finance Director",
        motherName: "P. Kulatunga",
        motherPhone: "+94 77 345 6789",
        emergencyContact: "Mr. K. Kulatunga (+94 71 888 4321)",
        transportMode: "Private Vehicle Pickup",
        healthNotes: "Verified emergency contacts on file.",
        extracurricular: "School Development Fund Committee, Annual Sports Meet Organizer"
      };
    }

    if (currentRole === "super_admin") {
      return {
        name: currentUser.name || "SaaS Platform Owner",
        fullName: "LimaT Platform Owner & Chief Director",
        preferredName: "Super Admin",
        studentId: "ROOT-SAAS-001",
        indexNumber: "SAAS-ROOT/DIR-01",
        email: currentUser.email || "director@limat.lk",
        phone: "+94 77 123 4567",
        altPhone: "+94 11 200 4455",
        dob: "1982-01-01",
        gender: "Male",
        bloodGroup: "O+",
        medium: "English, Sinhala & Tamil",
        address: "LimaT Headquarters, Colombo Technology Park",
        city: "Colombo 02",
        district: "Colombo",
        province: "Western Province",
        postalCode: "00200",
        bio: "Master Platform Owner & SaaS System Director with root privileges. Controlling multi-tenant deployments, tenant billing, global feature matrix toggles, and creator ecosystems across Sri Lanka.",
        schoolName: currentUser.schoolName || "LimaT Multi-Tenant Creator Platform",
        schoolCode: "LIMAT-GLOBAL",
        gradeLevel: "Platform",
        grade: "Platform Director Level",
        classRoom: "Global SaaS Control Center",
        stream: "Enterprise Multi-Tenant Cloud SaaS Engine",
        examYear: "2026",
        academicYear: "Active Production (2025 - 2028)",
        house: "Master Operations",
        classTeacher: "Chief Platform Architect",
        admittedDate: "January 2025",
        attendanceRate: "99.98% SLA",
        gpa: "v2.4.0 Multi-Tenant Engine",
        guardianName: "Platform Security Directorate",
        guardianRelationship: "Two-Factor Master Key",
        guardianPhone: "+94 77 123 4567",
        guardianEmail: "security@limat.lk",
        guardianOccupation: "Cloud Infrastructure Directorate",
        motherName: "LimaT Cloud",
        motherPhone: "+94 11 200 4455",
        emergencyContact: "Emergency DevOps NOC (+94 77 999 0000)",
        transportMode: "Direct Cloud Console",
        healthNotes: "Root credentials verified. ISO 27001 compliant.",
        extracurricular: "Global Tenant Onboarding, SaaS Monetization, AI Studio Scaling"
      };
    }

    return {
      name: currentUser.name || "Sathurjan K.",
      fullName: "Sathurjan Kandasamy",
      preferredName: "Sathu",
      studentId: "STU-2026-0842",
      indexNumber: "AL/2026/89421",
      email: currentUser.email || "sathurjan@gmail.com",
      phone: "+94 77 123 4567",
      altPhone: "+94 11 234 5678",
      dob: "2008-03-14",
      gender: "Male",
      bloodGroup: "O+",
      medium: "English & Tamil",
      address: "No. 42, Temple Road, Wellawatte",
      city: "Colombo 06",
      district: "Colombo",
      province: "Western Province",
      postalCode: "00600",
      bio: "Passionate Advanced Level student preparing under leading private educators in Pure Maths, Quantum Physics, Chemistry and Software Architecture.",
      schoolName: (currentUser.schoolName && currentUser.schoolName !== "St. Michael High School") ? currentUser.schoolName : "LimaT Independent Tuition & Masterclasses",
      schoolCode: "LMT-COLOMBO",
      gradeLevel: "12",
      grade: (currentUser.grade && currentUser.grade !== "Grade 12") ? currentUser.grade : "Grade 12",
      classRoom: (currentUser.class && currentUser.class !== "12-Physical Science") ? currentUser.class : "Physical Science A/L Masterclass Batch",
      stream: "Physical Science",
      examYear: "2026",
      academicYear: "Batch 2026 - 2027",
      house: "Lions Sports & Athletics Academy",
      classTeacher: "Dr. Samantha Perera (Lead Combined Maths Specialist)",
      admittedDate: "January 2024",
      attendanceRate: "96.4%",
      gpa: "3.84 / 4.0",
      guardianName: "K. Kandasamy",
      guardianRelationship: "Father",
      guardianPhone: "+94 71 888 4321",
      guardianEmail: "kandasamy.k@gmail.com",
      guardianOccupation: "Chartered Civil Engineer",
      motherName: "S. Kandasamy",
      motherPhone: "+94 77 555 8912",
      emergencyContact: "K. Kandasamy (+94 71 888 4321)",
      transportMode: "Independent Transport / Online Live Stream",
      healthNotes: "No known allergies. Normal athletic health clearance.",
      extracurricular: "Vice Captain Lions Cricket 1st XI, Senior Athletic Squad, Science Club"
    };
  }, [currentRole, currentUser]);

  const [profileData, setProfileData] = useState(defaultProfile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showPublicPreview, setShowPublicPreview] = useState(false);

  // Bank & Payout Details (Teacher)
  const [bankName, setBankName] = useState("Commercial Bank of Ceylon");
  const [bankAccountName, setBankAccountName] = useState("Samantha Priyantha Perera");
  const [bankAccountNumber, setBankAccountNumber] = useState("8004561234");
  const [bankBranch, setBankBranch] = useState("Havelock Town");
  const [bankBranchCode, setBankBranchCode] = useState("042");

  // Public Studio & Social Ecosystem (Teacher)
  const [publicSlug, setPublicSlug] = useState("prof-samantha-perera");
  const [youtubeUrl, setYoutubeUrl] = useState("https://youtube.com/@SamanthaPereraMaths");
  const [telegramUrl, setTelegramUrl] = useState("https://t.me/CombinedMaths2026LK");
  const [whatsappNumber, setWhatsappNumber] = useState("+94774567890");
  const [websiteUrl, setWebsiteUrl] = useState("https://samanthamaths.lk");
  const [coverImageUrl, setCoverImageUrl] = useState("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80");

  // Qualifications & Accreditations (Teacher)
  const [qualificationsList, setQualificationsList] = useState<TeacherQualification[]>([
    {
      id: "deg-1",
      degree: "Bachelor of Science (B.Sc. Special) in Mathematics",
      institution: "University of Colombo, Sri Lanka",
      honors: "First Class Honours (GPA: 3.92 / 4.0)",
      year: "2008",
      details: "Pure Mathematics, Real Analysis, Complex Variables, Abstract Algebra & Numerical Methods."
    },
    {
      id: "deg-2",
      degree: "Post Graduate Diploma in Education (PGDE)",
      institution: "National Institute of Education (NIE), Maharagama",
      honors: "Passed with Distinction",
      year: "2014",
      details: "Secondary & Collegiate STEM Pedagogy, Educational Psychology, Curriculum Formulation & Evaluation."
    },
    {
      id: "deg-3",
      degree: "Master of Science (M.Sc.) in Applied Mathematics",
      institution: "University of Peradeniya",
      honors: "Thesis Distinction",
      year: "2018",
      details: "Thesis: Numerical Modeling of Partial Differential Equations & Boundary Value Simulations."
    }
  ]);

  const [accreditationsList, setAccreditationsList] = useState<TeacherAccreditation[]>([
    {
      id: "acc-1",
      title: "Sri Lanka Teachers' Service (SLTS) Class 1 Senior Educator",
      issuer: "Ministry of Education, Isurupaya, Battaramulla",
      regNo: "SLTS-REG/2012/4482",
      status: "Active & Permanent Pensionable Service · 14 Years Seniority",
      badge: "SLTS Class 1",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200"
    },
    {
      id: "acc-2",
      title: "G.C.E. Advanced Level Chief Examiner & Paper Setter Accreditation",
      issuer: "Department of Examinations, Pelawatte, Battaramulla",
      regNo: "EXAM-AL/MTH-P03",
      status: "Supervising Examiner · Combined Mathematics Paper Evaluation Panel 03",
      badge: "Chief Examiner",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200"
    },
    {
      id: "acc-3",
      title: "National STEM Pedagogical Master Trainer & Digital Lead",
      issuer: "UNESCO & National Education Commission (NEC)",
      regNo: "STEM-LK/2021/88",
      status: "Accredited Master Facilitator for Advanced Collegiate Mathematics Instruction",
      badge: "Master Trainer",
      badgeColor: "bg-purple-50 text-purple-800 border-purple-200"
    },
    {
      id: "acc-4",
      title: "Provincial Teaching Excellence & Mentorship Award (2023)",
      issuer: "Western Provincial Department of Education",
      regNo: "WP-EDU/AWARD/2023",
      status: "Awarded for 98% Distinction Rate in A/L Combined Mathematics Examination",
      badge: "Provincial Award",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200"
    }
  ]);

  const [bankAccountsList, setBankAccountsList] = useState<TeacherBankAccount[]>([
    {
      id: "bank-1",
      bankName: "Commercial Bank of Ceylon",
      bankAccountName: "Samantha Priyantha Perera",
      bankAccountNumber: "8004561234",
      bankBranch: "Havelock Town",
      bankBranchCode: "042",
      isPrimary: true
    },
    {
      id: "bank-2",
      bankName: "Bank of Ceylon (BOC)",
      bankAccountName: "Samantha Priyantha Perera",
      bankAccountNumber: "0072938491",
      bankBranch: "Kollupitiya Super Grade",
      bankBranchCode: "001",
      isPrimary: false
    }
  ]);

  const [socialChannelsList, setSocialChannelsList] = useState<TeacherSocialChannel[]>([
    {
      id: "soc-1",
      platform: "youtube",
      title: "YouTube Lecture Channel",
      url: "https://youtube.com/@SamanthaPereraMaths"
    },
    {
      id: "soc-2",
      platform: "telegram",
      title: "Telegram Student Discussion Group",
      url: "https://t.me/CombinedMaths2026LK"
    },
    {
      id: "soc-3",
      platform: "whatsapp",
      title: "Direct WhatsApp Mentorship Helpline",
      url: "+94774567890"
    },
    {
      id: "soc-4",
      platform: "website",
      title: "Personal Tutor Studio & Notes Portal",
      url: "https://samanthamaths.lk"
    }
  ]);

  const [subjectsList, setSubjectsList] = useState<string[]>([
    "Combined Mathematics",
    "Pure Mathematics",
    "Applied Mathematics",
    "Mechanics",
    "Probability & Statistics"
  ]);

  const [selectedMediums, setSelectedMediums] = useState<string[]>(["English", "Sinhala", "Tamil"]);
  const [experienceYears, setExperienceYears] = useState<number>(14);

  // Modal states for full CRUD workflows
  const [degreeModalState, setDegreeModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    index?: number;
    data: TeacherQualification;
  }>({
    isOpen: false,
    mode: "add",
    data: { degree: "", institution: "", year: "", honors: "", details: "" }
  });

  const [accreditationModalState, setAccreditationModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    index?: number;
    data: TeacherAccreditation;
  }>({
    isOpen: false,
    mode: "add",
    data: { id: "", title: "", issuer: "", regNo: "", status: "", badge: "Accredited", badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200" }
  });

  const [bankModalState, setBankModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    index?: number;
    data: TeacherBankAccount;
  }>({
    isOpen: false,
    mode: "add",
    data: { id: "", bankName: "Commercial Bank of Ceylon", bankAccountName: "", bankAccountNumber: "", bankBranch: "", bankBranchCode: "", isPrimary: false }
  });

  const [socialModalState, setSocialModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    index?: number;
    data: TeacherSocialChannel;
  }>({
    isOpen: false,
    mode: "add",
    data: { id: "", platform: "youtube", title: "", url: "" }
  });

  const [coverModalState, setCoverModalState] = useState<{ isOpen: boolean; url: string }>({
    isOpen: false,
    url: ""
  });

  const [newSubjectInput, setNewSubjectInput] = useState<string>("");
  const [showSubjectInput, setShowSubjectInput] = useState<boolean>(false);
  const [isEditingSlug, setIsEditingSlug] = useState<boolean>(false);
  const [slugEditValue, setSlugEditValue] = useState<string>("");

  // Sync with backend teacher profile when loaded
  useEffect(() => {
    if (teacherProfile && currentRole === "teacher") {
      if (teacherProfile.bankName) setBankName(teacherProfile.bankName);
      if (teacherProfile.bankAccountName) setBankAccountName(teacherProfile.bankAccountName);
      if (teacherProfile.bankAccountNumber) setBankAccountNumber(teacherProfile.bankAccountNumber);
      if (teacherProfile.bankBranch) setBankBranch(teacherProfile.bankBranch);
      if (teacherProfile.bankBranchCode) setBankBranchCode(teacherProfile.bankBranchCode);
      if (teacherProfile.publicSlug) setPublicSlug(teacherProfile.publicSlug);
      if (teacherProfile.youtubeUrl) setYoutubeUrl(teacherProfile.youtubeUrl);
      if (teacherProfile.telegramUrl) setTelegramUrl(teacherProfile.telegramUrl);
      if (teacherProfile.whatsappNumber) setWhatsappNumber(teacherProfile.whatsappNumber);
      if (teacherProfile.websiteUrl) setWebsiteUrl(teacherProfile.websiteUrl);
      if (teacherProfile.coverImageUrl) setCoverImageUrl(teacherProfile.coverImageUrl);
      if (teacherProfile.experienceYears) setExperienceYears(teacherProfile.experienceYears);
      if (Array.isArray(teacherProfile.mediums) && teacherProfile.mediums.length > 0) {
        setSelectedMediums(teacherProfile.mediums);
      }
      if (Array.isArray(teacherProfile.qualifications) && teacherProfile.qualifications.length > 0) {
        setQualificationsList(teacherProfile.qualifications);
      }
      if (Array.isArray(teacherProfile.accreditations) && teacherProfile.accreditations.length > 0) {
        setAccreditationsList(teacherProfile.accreditations);
      }
      if (Array.isArray(teacherProfile.bankAccounts) && teacherProfile.bankAccounts.length > 0) {
        setBankAccountsList(teacherProfile.bankAccounts);
      }
      if (Array.isArray(teacherProfile.socialChannels) && teacherProfile.socialChannels.length > 0) {
        setSocialChannelsList(teacherProfile.socialChannels);
      }
      if (teacherProfile.specialization) {
        const parsedSubjects = teacherProfile.specialization.split(",").map((s) => s.trim()).filter(Boolean);
        if (parsedSubjects.length > 0) {
          setSubjectsList(parsedSubjects);
        }
      }
    }
  }, [teacherProfile, currentRole]);

  useEffect(() => {
    setProfileData(defaultProfile);
    if (currentRole === "teacher") {
      if (!["personal", "qualifications", "payout", "social", "teaching", "schedule"].includes(activeTab)) {
        setActiveTab("personal");
      }
    } else if (currentRole === "super_admin") {
      setActiveTab("personal");
    } else {
      if (!["personal", "academic", "progress", "timetable", "sports"].includes(activeTab)) {
        setActiveTab("personal");
      }
    }
  }, [defaultProfile, currentRole]);

  const [avatarPreset, setAvatarPreset] = useState<string>("default");
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<
    "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
  >("Monday");

  const handleCopyId = () => {
    navigator.clipboard?.writeText(profileData.studentId);
    setCopiedId(true);
    addToast({
      type: "info",
      title: "ID Copied",
      message: `${currentRole === "teacher" ? "Tutor ID " : ""}${profileData.studentId} copied to clipboard.`
    });
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadTeacherDossier = () => {
    addToast({
      type: "success",
      title: "Tutor Profile & Portfolio Downloaded",
      message: "Verified Tutor Profile, Credentials & Course Catalog (PDF) has been saved."
    });
  };

  const handleDownloadTeacherTimetable = () => {
    addToast({
      type: "success",
      title: "Live Class Schedule Downloaded",
      message: "Weekly Live Streaming Timetable & Google Meet Session Links (PDF) has been saved."
    });
  };

  // =========================================================================
  // CRUD HANDLERS (Add, Edit, Delete) for Teacher Tabs
  // =========================================================================

  // 1. Degree CRUD
  const saveDegree = (item: TeacherQualification) => {
    let updated: TeacherQualification[];
    if (degreeModalState.mode === "add") {
      updated = [...qualificationsList, { ...item, id: `deg-${Date.now()}` }];
      addToast({ type: "success", title: "Degree Added", message: `"${item.degree}" has been added to your profile.` });
    } else {
      updated = qualificationsList.map((q, i) => i === degreeModalState.index ? item : q);
      addToast({ type: "success", title: "Degree Updated", message: `"${item.degree}" details have been updated.` });
    }
    setQualificationsList(updated);
    setDegreeModalState({ ...degreeModalState, isOpen: false });
    if (currentRole === "teacher") {
      updateTeacherProfile({ qualifications: updated, accreditations: accreditationsList, bankAccounts: bankAccountsList, socialChannels: socialChannelsList });
    }
  };

  const deleteDegree = (index: number) => {
    const item = qualificationsList[index];
    const updated = qualificationsList.filter((_, i) => i !== index);
    setQualificationsList(updated);
    addToast({ type: "info", title: "Degree Removed", message: `"${item.degree}" was removed from your profile.` });
    if (currentRole === "teacher") {
      updateTeacherProfile({ qualifications: updated, accreditations: accreditationsList, bankAccounts: bankAccountsList, socialChannels: socialChannelsList });
    }
  };

  // 2. Accreditation CRUD
  const saveAccreditation = (item: TeacherAccreditation) => {
    let updated: TeacherAccreditation[];
    if (accreditationModalState.mode === "add") {
      updated = [...accreditationsList, { ...item, id: `acc-${Date.now()}` }];
      addToast({ type: "success", title: "Accreditation Added", message: `"${item.title}" credential registered.` });
    } else {
      updated = accreditationsList.map((a, i) => i === accreditationModalState.index ? item : a);
      addToast({ type: "success", title: "Accreditation Updated", message: `"${item.title}" credential updated.` });
    }
    setAccreditationsList(updated);
    setAccreditationModalState({ ...accreditationModalState, isOpen: false });
    if (currentRole === "teacher") {
      updateTeacherProfile({ qualifications: qualificationsList, accreditations: updated, bankAccounts: bankAccountsList, socialChannels: socialChannelsList });
    }
  };

  const deleteAccreditation = (index: number) => {
    const item = accreditationsList[index];
    const updated = accreditationsList.filter((_, i) => i !== index);
    setAccreditationsList(updated);
    addToast({ type: "info", title: "Accreditation Removed", message: `"${item.title}" was removed.` });
    if (currentRole === "teacher") {
      updateTeacherProfile({ qualifications: qualificationsList, accreditations: updated, bankAccounts: bankAccountsList, socialChannels: socialChannelsList });
    }
  };

  // 3. Bank Account CRUD
  const saveBankAccount = (item: TeacherBankAccount) => {
    let updated: TeacherBankAccount[];
    if (bankModalState.mode === "add") {
      const willBePrimary = item.isPrimary || bankAccountsList.length === 0;
      const newItem = { ...item, id: `bank-${Date.now()}`, isPrimary: willBePrimary };
      if (willBePrimary) {
        updated = bankAccountsList.map((b) => ({ ...b, isPrimary: false })).concat(newItem);
      } else {
        updated = [...bankAccountsList, newItem];
      }
      addToast({ type: "success", title: "Bank Account Added", message: `${item.bankName} payout account registered.` });
    } else {
      if (item.isPrimary) {
        updated = bankAccountsList.map((b, i) => i === bankModalState.index ? item : { ...b, isPrimary: false });
      } else {
        updated = bankAccountsList.map((b, i) => i === bankModalState.index ? item : b);
      }
      addToast({ type: "success", title: "Bank Account Updated", message: `${item.bankName} account details updated.` });
    }
    setBankAccountsList(updated);
    setBankModalState({ ...bankModalState, isOpen: false });

    const primary = updated.find((b) => b.isPrimary) || updated[0];
    if (primary) {
      setBankName(primary.bankName);
      setBankAccountName(primary.bankAccountName);
      setBankAccountNumber(primary.bankAccountNumber);
      setBankBranch(primary.bankBranch);
      setBankBranchCode(primary.bankBranchCode || "");
    }
    if (currentRole === "teacher") {
      updateTeacherProfile({
        bankAccounts: updated,
        bankName: primary?.bankName,
        bankAccountName: primary?.bankAccountName,
        bankAccountNumber: primary?.bankAccountNumber,
        bankBranch: primary?.bankBranch,
        bankBranchCode: primary?.bankBranchCode
      });
    }
  };

  const deleteBankAccount = (index: number) => {
    if (bankAccountsList.length <= 1) {
      addToast({ type: "error", title: "Action Prevented", message: "At least one active payout bank account is required for subscription disbursements." });
      return;
    }
    const item = bankAccountsList[index];
    const updated = bankAccountsList.filter((_, i) => i !== index);
    if (item.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    setBankAccountsList(updated);
    addToast({ type: "info", title: "Account Removed", message: `${item.bankName} account was disconnected.` });

    const primary = updated.find((b) => b.isPrimary) || updated[0];
    if (primary) {
      setBankName(primary.bankName);
      setBankAccountName(primary.bankAccountName);
      setBankAccountNumber(primary.bankAccountNumber);
      setBankBranch(primary.bankBranch);
      setBankBranchCode(primary.bankBranchCode || "");
    }
    if (currentRole === "teacher") {
      updateTeacherProfile({
        bankAccounts: updated,
        bankName: primary?.bankName,
        bankAccountName: primary?.bankAccountName,
        bankAccountNumber: primary?.bankAccountNumber,
        bankBranch: primary?.bankBranch,
        bankBranchCode: primary?.bankBranchCode
      });
    }
  };

  const setPrimaryBankAccount = (index: number) => {
    const updated = bankAccountsList.map((b, i) => ({ ...b, isPrimary: i === index }));
    setBankAccountsList(updated);
    const primary = updated[index];
    if (primary) {
      setBankName(primary.bankName);
      setBankAccountName(primary.bankAccountName);
      setBankAccountNumber(primary.bankAccountNumber);
      setBankBranch(primary.bankBranch);
      setBankBranchCode(primary.bankBranchCode || "");
      addToast({ type: "success", title: "Primary Account Set", message: `${primary.bankName} is now your primary payout account.` });
      if (currentRole === "teacher") {
        updateTeacherProfile({
          bankAccounts: updated,
          bankName: primary.bankName,
          bankAccountName: primary.bankAccountName,
          bankAccountNumber: primary.bankAccountNumber,
          bankBranch: primary.bankBranch,
          bankBranchCode: primary.bankBranchCode
        });
      }
    }
  };

  // 4. Social Channel CRUD
  const saveSocialChannel = (item: TeacherSocialChannel) => {
    let updated: TeacherSocialChannel[];
    if (socialModalState.mode === "add") {
      updated = [...socialChannelsList, { ...item, id: `soc-${Date.now()}` }];
      addToast({ type: "success", title: "Social Channel Added", message: `"${item.title}" has been connected.` });
    } else {
      updated = socialChannelsList.map((s, i) => i === socialModalState.index ? item : s);
      addToast({ type: "success", title: "Social Channel Updated", message: `"${item.title}" updated.` });
    }
    setSocialChannelsList(updated);
    setSocialModalState({ ...socialModalState, isOpen: false });

    // Sync individual channel fields
    const yt = updated.find((s) => s.platform.toLowerCase() === "youtube")?.url || youtubeUrl;
    const tg = updated.find((s) => s.platform.toLowerCase() === "telegram")?.url || telegramUrl;
    const wa = updated.find((s) => s.platform.toLowerCase() === "whatsapp")?.url || whatsappNumber;
    const wb = updated.find((s) => s.platform.toLowerCase() === "website" || s.platform.toLowerCase() === "other")?.url || websiteUrl;
    setYoutubeUrl(yt);
    setTelegramUrl(tg);
    setWhatsappNumber(wa);
    setWebsiteUrl(wb);

    if (currentRole === "teacher") {
      updateTeacherProfile({
        socialChannels: updated,
        youtubeUrl: yt,
        telegramUrl: tg,
        whatsappNumber: wa,
        websiteUrl: wb
      });
    }
  };

  const deleteSocialChannel = (index: number) => {
    const item = socialChannelsList[index];
    const updated = socialChannelsList.filter((_, i) => i !== index);
    setSocialChannelsList(updated);
    addToast({ type: "info", title: "Channel Removed", message: `"${item.title}" was removed.` });
    if (currentRole === "teacher") {
      updateTeacherProfile({ socialChannels: updated });
    }
  };

  // 5. Subject Specialization CRUD
  const addSubject = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (subjectsList.includes(trimmed)) {
      addToast({ type: "info", title: "Duplicate Subject", message: `"${trimmed}" is already in your specialization list.` });
      return;
    }
    const updated = [...subjectsList, trimmed];
    setSubjectsList(updated);
    setProfileData({ ...profileData, stream: updated.join(", ") });
    setNewSubjectInput("");
    setShowSubjectInput(false);
    addToast({ type: "success", title: "Subject Added", message: `Added "${trimmed}" to specializations.` });
    if (currentRole === "teacher") {
      updateTeacherProfile({ specialization: updated.join(", ") });
    }
  };

  const deleteSubject = (subjectToRemove: string) => {
    const updated = subjectsList.filter((s) => s !== subjectToRemove);
    setSubjectsList(updated);
    setProfileData({ ...profileData, stream: updated.join(", ") });
    addToast({ type: "info", title: "Subject Removed", message: `Removed "${subjectToRemove}".` });
    if (currentRole === "teacher") {
      updateTeacherProfile({ specialization: updated.join(", ") });
    }
  };

  // 6. Cover Banner CRUD
  const saveCoverImage = (url: string) => {
    setCoverImageUrl(url);
    setCoverModalState({ isOpen: false, url: "" });
    addToast({ type: "success", title: "Cover Banner Updated", message: "Studio cover banner has been saved." });
    if (currentRole === "teacher") {
      updateTeacherProfile({ coverImageUrl: url });
    }
  };

  const resetCoverImage = () => {
    const defaultUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80";
    setCoverImageUrl(defaultUrl);
    addToast({ type: "info", title: "Cover Banner Reset", message: "Default studio banner restored." });
    if (currentRole === "teacher") {
      updateTeacherProfile({ coverImageUrl: defaultUrl });
    }
  };

  // 7. Shareable Slug Save
  const saveSlug = () => {
    const clean = slugEditValue.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!clean) return;
    setPublicSlug(clean);
    setIsEditingSlug(false);
    addToast({ type: "success", title: "Public Studio URL Updated", message: `New URL: https://limat.lk/tutors/${clean}` });
    if (currentRole === "teacher") {
      updateTeacherProfile({ publicSlug: clean });
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (currentRole === "teacher") {
      setIsSavingProfile(true);
      const success = await updateTeacherProfile({
        title: profileData.grade,
        bio: profileData.bio,
        specialization: subjectsList.join(", "),
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        district: profileData.district,
        province: profileData.province,
        postalCode: profileData.postalCode,
        sltsRegNo: profileData.indexNumber,
        mediums: selectedMediums,
        experienceYears: Number(experienceYears) || 0,
        qualifications: qualificationsList,
        accreditations: accreditationsList,
        bankAccounts: bankAccountsList,
        socialChannels: socialChannelsList,
        bankName,
        bankAccountName,
        bankAccountNumber,
        bankBranch,
        bankBranchCode,
        publicSlug,
        youtubeUrl,
        telegramUrl,
        whatsappNumber,
        websiteUrl,
        coverImageUrl
      });
      setIsSavingProfile(false);
      if (success) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
      addToast({
        type: "success",
        title: "Profile Saved",
        message: "Your profile information has been successfully updated!"
      });
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <button
              onClick={() => setCurrentView("dashboard")}
              className="hover:text-[#0d5c4d] transition-colors flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-bold text-[#0d5c4d] capitalize">
              {currentRole} Profile
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0d2b26] tracking-tight">
            User Profile &amp; Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your personal identity, academic records, and institutional credentials.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {currentRole === "teacher" && (
            <button
              type="button"
              onClick={() => setShowPublicPreview(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 text-xs font-bold text-purple-700 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Preview how students and visitors view your tutor studio profile"
            >
              <Eye className="h-3.5 w-3.5 text-purple-600" />
              <span className="hidden sm:inline">Preview Public Page</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#d6ede6] hover:bg-[#f6fbf9] text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Print or Save Profile Record as PDF"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print Record</span>
          </button>

          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={isSavingProfile}
              className="px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-sm shadow-[#0d5c4d]/20 cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSavingProfile ? "Saving..." : "Save Changes"}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-sm shadow-[#0d5c4d]/20 cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Hero Card */}
      <div className="relative rounded-3xl bg-white border border-[#e2eae5] p-5 sm:p-7 shadow-[0_12px_32px_-8px_rgba(13,92,77,0.08)] overflow-hidden">
        {/* Background decorative gradient */}
        <div className="absolute top-0 right-0 w-96 h-36 bg-gradient-to-l from-[#ecf8f5] via-[#f4faf7]/60 to-transparent pointer-events-none rounded-tr-3xl" />
        <div className="absolute top-3 right-4 sm:top-5 sm:right-6 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0] text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {currentRole === "teacher" ? "Senior Faculty Member · Active Service" : "Active Enrolled · Term 2"}
          </span>
        </div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-6">
          {/* Avatar with preset selection & edit indicator */}
          <div className="relative group shrink-0">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-gradient-to-br from-[#0d5c4d] to-[#16423b] flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-lg shadow-[#0d5c4d]/25 border-4 border-white ring-2 ring-[#0d5c4d]/10">
              {profileData.name.charAt(0)}
            </div>
            {isEditing && (
              <button
                type="button"
                className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-full bg-[#f3b738] text-slate-900 flex items-center justify-center shadow-md border-2 border-white hover:scale-105 transition-transform"
                title="Change Avatar Photo"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-[#0d2b26]">
                {profileData.fullName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#fef7e6] text-[#b47a16] border border-[#fde4af] text-[11px] font-bold capitalize">
                {currentRole === "teacher"
                  ? "Verified Tutor & Creator"
                  : currentRole === "super_admin"
                  ? "Master Super Admin • Platform Owner"
                  : currentRole}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                {currentRole === "student"
                  ? (profileData.gradeLevel === "12" || profileData.gradeLevel === "13")
                    ? `${profileData.grade || "Grade 12"} • ${profileData.stream || "Physical Science"}`
                    : (profileData.gradeLevel === "10" || profileData.gradeLevel === "11")
                    ? `${profileData.grade || "Grade 11"} • G.C.E. O/L`
                    : `${profileData.grade || "Grade 8"} • Junior Secondary`
                  : profileData.stream}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              {profileData.bio}
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <School className="h-3.5 w-3.5 text-[#0d5c4d]" />
                <span className="font-semibold text-slate-700">
                  {currentRole === "teacher"
                    ? "Online Tutor Studio & LMS"
                    : currentRole === "super_admin"
                    ? "Global Multi-Tenant SaaS Platform"
                    : profileData.schoolName}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[#0d5c4d]" />
                <span>{profileData.classRoom}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#0d5c4d]" />
                <span>{profileData.city}, Sri Lanka</span>
              </div>
              <button
                onClick={handleCopyId}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors font-mono font-bold text-[11px] text-slate-700 cursor-pointer"
                title={
                  currentRole === "teacher"
                    ? "Click to copy Tutor ID"
                    : currentRole === "super_admin"
                    ? "Click to copy Master Root ID"
                    : "Click to copy Student ID"
                }
              >
                <span>
                  {currentRole === "teacher"
                    ? `Tutor ID: ${profileData.studentId}`
                    : currentRole === "super_admin"
                    ? `Root ID: ${profileData.studentId}`
                    : `ID: ${profileData.studentId}`}
                </span>
                {copiedId ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Performance Indicators */}
        {currentRole === "teacher" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled Subscribers</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-black text-[#0d5c4d] font-mono">
                  {teacherProfile?.stats?.totalSubscribers ?? 142} Students
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">
                  Across {teacherProfile?.stats?.totalPackages ?? 4} Batches
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Gross Revenue</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-black text-amber-600 font-mono">
                  Rs. {(teacherProfile?.stats?.monthlyGrossRevenue ?? 639000).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">90% Tutor Payout</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Weekly Live Hours</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-black text-[#0d2b26]">14 Hours</span>
                <span className="text-[10px] text-emerald-600 font-bold">Google Meet Active</span>
              </div>
            </div>
          </div>
        ) : currentRole === "super_admin" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Client Tenants</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-black text-[#0d5c4d]">4 Active Clients</span>
                <span className="text-[10px] text-emerald-600 font-bold">Schools, Tutors &amp; Academies</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly SaaS MRR</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-black text-amber-600 font-mono">LKR 448,000</span>
                <span className="text-[10px] text-slate-500 font-semibold">Recurring Platform Revenue</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Platform Students</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-black text-[#0d2b26]">9,942 Students</span>
                <span className="text-[10px] text-emerald-600 font-bold">Across All Tenant Databases</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>


      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {(currentRole === "teacher"
          ? [
              { id: "personal", label: "Tutor Studio Profile", icon: User },
              { id: "qualifications", label: "Qualifications & Credentials", icon: GraduationCap },
              { id: "payout", label: "Bank & Payout Details", icon: CreditCard },
              { id: "social", label: "Public Studio & Social", icon: Globe },
              { id: "teaching", label: "Active Batches & Study Packages", icon: BookOpen },
              { id: "schedule", label: "Live Class Schedule & Meet", icon: Calendar }
            ]
          : currentRole === "super_admin"
          ? [
              { id: "personal", label: "Platform Director Credentials", icon: User }
            ]
          : [
              { id: "personal", label: "Personal Details", icon: User },
              { id: "academic", label: "Enrolled Tutors & Subjects", icon: GraduationCap },
              { id: "progress", label: "Learning Progress", icon: TrendingUp },
              { id: "timetable", label: "Online Assessment Schedule", icon: Calendar },
              { id: "sports", label: "Sports & Achievements", icon: Trophy }
            ]
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProfileTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#0d5c4d] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] border border-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: PERSONAL DETAILS                                            */}
      {/* =================================================================== */}
      {activeTab === "personal" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <User className="h-4 w-4 text-[#0d5c4d]" />
                  <span>
                    {currentRole === "teacher"
                      ? "Tutor Studio Profile & Faculty Credentials"
                      : currentRole === "super_admin"
                      ? "Platform Directorate Master Credentials"
                      : "General Information"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentRole === "teacher"
                    ? "Official personal identification, studio profile details, and Ministry of Education service registration."
                    : currentRole === "super_admin"
                    ? "Master administrator credentials, root authority, and global tenant control specifications."
                    : "Official personal identification as registered with the Ministry of Education."}
                </p>
              </div>

              {currentRole === "teacher" && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSavingProfile}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>{isSavingProfile ? "Saving..." : "Save Details"}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] hover:bg-[#d8f2eb] border border-[#c4e9e0] font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Details</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* SUBJECT SPECIALIZATIONS MANAGER (Add, Edit, Delete tags) */}
            {currentRole === "teacher" && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#f8faf9] to-[#f2f8f6] border border-[#d6ede6] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-xs text-[#0d2b26] flex items-center gap-1.5 uppercase tracking-wide">
                      <Award className="h-3.5 w-3.5 text-[#0d5c4d]" />
                      <span>Subject Specializations &amp; Modules</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Add and manage the specific subjects students search for on your tutor profile.
                    </p>
                  </div>

                  {!showSubjectInput && (
                    <button
                      type="button"
                      onClick={() => setShowSubjectInput(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Subject</span>
                    </button>
                  )}
                </div>

                {/* Inline Add Subject Input */}
                {showSubjectInput && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#0d5c4d]/30 shadow-xs">
                    <input
                      type="text"
                      value={newSubjectInput}
                      onChange={(e) => setNewSubjectInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSubject(newSubjectInput);
                        }
                      }}
                      placeholder="Type subject name (e.g. Combined Mathematics, Applied Mechanics)"
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0d5c4d]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => addSubject(newSubjectInput)}
                      className="px-3 py-1.5 rounded-lg bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSubjectInput(false);
                        setNewSubjectInput("");
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Subject Tags with Delete (X) */}
                <div className="flex flex-wrap items-center gap-2">
                  {subjectsList.map((subj) => (
                    <span
                      key={subj}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#0d2b26] border border-[#c4e9e0] text-xs font-bold shadow-2xs group hover:border-[#0d5c4d] transition-colors"
                    >
                      <span>{subj}</span>
                      <button
                        type="button"
                        onClick={() => deleteSubject(subj)}
                        className="h-4 w-4 rounded-full flex items-center justify-center text-slate-400 group-hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title={`Remove ${subj}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {subjectsList.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No subject specializations listed yet. Click "+ Add Subject" to add your first module.</p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Legal Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.fullName}
                  </p>
                )}
              </div>

              {/* Preferred Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Display / Preferred Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.name}
                  </p>
                )}
              </div>

              {/* Student ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher"
                    ? "Teacher Service / Faculty ID"
                    : currentRole === "super_admin"
                    ? "Platform Master Root ID"
                    : "Student Admission / Reg Number"}
                </label>
                <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-mono font-bold text-[#0d5c4d]">
                  {profileData.studentId}
                </p>
              </div>

              {/* G.C.E. A/L Index Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher"
                    ? "Sri Lanka Teachers' Service (SLTS) Reg Number"
                    : currentRole === "super_admin"
                    ? "Master Root Authority Identifier"
                    : "Exam Index Number (A/L 2026)"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.indexNumber}
                    onChange={(e) => setProfileData({ ...profileData, indexNumber: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-mono font-semibold text-slate-900">
                    {profileData.indexNumber}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address (Institutional)</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10"
                  />
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    <span>{profileData.email}</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Mobile Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.phone}
                  </p>
                )}
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                    />
                  ) : (
                    <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                      {profileData.dob}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Gender</label>
                  {isEditing ? (
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                      {profileData.gender}
                    </p>
                  )}
                </div>
              </div>

              {/* Medium & Blood Group */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Medium of Study</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.medium}
                      onChange={(e) => setProfileData({ ...profileData, medium: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs"
                    />
                  ) : (
                    <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                      {profileData.medium}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Blood Group</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.bloodGroup}
                      onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-bold text-red-600"
                    />
                  ) : (
                    <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-bold text-red-600">
                      {profileData.bloodGroup}
                    </p>
                  )}
                </div>
              </div>

              {/* Academic Grade, Stream & Target Year (Only for Students) */}
              {currentRole === "student" && (
                <div className="md:col-span-2 p-4 rounded-2xl bg-[#ecf8f5]/60 border border-[#c4e9e0] space-y-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#0d5c4d]" />
                    <span className="font-extrabold text-xs text-[#0d2b26]">
                      Academic Stage, Grade &amp; Examination Pathway
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Grade Selection */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Enrolled Grade</label>
                      {isEditing ? (
                        <select
                          value={profileData.gradeLevel || "12"}
                          onChange={(e) => {
                            const newLevel = e.target.value;
                            const isNewAL = newLevel === "12" || newLevel === "13";
                            const isNewOL = newLevel === "10" || newLevel === "11";
                            setProfileData({
                              ...profileData,
                              gradeLevel: newLevel,
                              grade: `Grade ${newLevel}`,
                              stream: isNewAL
                                ? (profileData.stream && !profileData.stream.includes("General") && !profileData.stream.includes("O/L") ? profileData.stream : "Physical Science")
                                : isNewOL
                                ? "General O/L Curriculum"
                                : "General Junior Curriculum"
                            });
                          }}
                          className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d] bg-white font-semibold text-slate-800"
                        >
                          <optgroup label="Junior Secondary (Grade 6 - 9: No Streams)">
                            <option value="6">Grade 6 (Junior Secondary)</option>
                            <option value="7">Grade 7 (Junior Secondary)</option>
                            <option value="8">Grade 8 (Junior Secondary)</option>
                            <option value="9">Grade 9 (Junior Secondary)</option>
                          </optgroup>
                          <optgroup label="G.C.E. Ordinary Level (Grade 10 - 11)">
                            <option value="10">Grade 10 (G.C.E. O/L)</option>
                            <option value="11">Grade 11 (G.C.E. O/L)</option>
                          </optgroup>
                          <optgroup label="G.C.E. Advanced Level (Grade 12 - 13: Streams)">
                            <option value="12">Grade 12 (G.C.E. A/L)</option>
                            <option value="13">Grade 13 (G.C.E. A/L)</option>
                          </optgroup>
                        </select>
                      ) : (
                        <p className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900">
                          Grade {profileData.gradeLevel || "12"}
                        </p>
                      )}
                    </div>

                    {/* Stream Selection - ONLY enabled for Grade 12 or 13! */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        {(profileData.gradeLevel === "12" || profileData.gradeLevel === "13")
                          ? "A/L Stream Specialization *"
                          : "Curriculum Stream"}
                      </label>
                      {isEditing ? (
                        (profileData.gradeLevel === "12" || profileData.gradeLevel === "13") ? (
                          <select
                            value={profileData.stream || "Physical Science"}
                            onChange={(e) => setProfileData({ ...profileData, stream: e.target.value })}
                            className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d] bg-white font-semibold text-[#0d5c4d]"
                          >
                            <option value="Physical Science">Physical Science (Maths, Physics, Chem, ICT)</option>
                            <option value="Biological Science">Biological Science (Bio, Chem, Physics, Agri)</option>
                            <option value="Commerce">Commerce (Accounting, Business, Economics, ICT)</option>
                            <option value="Technology">Technology (Engineering Tech, Science for Tech, Bio-Tech)</option>
                            <option value="Arts">Arts (Languages, History, Logic, Political Science)</option>
                          </select>
                        ) : (
                          <div className="h-10 px-3 rounded-xl bg-slate-100 border border-slate-200 text-xs flex items-center text-slate-500 font-medium">
                            {(profileData.gradeLevel === "10" || profileData.gradeLevel === "11")
                              ? "General O/L Subjects (No Stream)"
                              : "General Junior Subjects (No Stream)"}
                          </div>
                        )
                      ) : (
                        <p className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900">
                          {(profileData.gradeLevel === "12" || profileData.gradeLevel === "13")
                            ? profileData.stream
                            : (profileData.gradeLevel === "10" || profileData.gradeLevel === "11")
                            ? "General O/L Subjects (No Stream)"
                            : "General Junior Subjects (No Stream)"}
                        </p>
                      )}
                    </div>

                    {/* Target Examination Year */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Target Exam Year</label>
                      {isEditing ? (
                        <select
                          value={profileData.examYear || "2026"}
                          onChange={(e) => setProfileData({ ...profileData, examYear: e.target.value })}
                          className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d] bg-white font-semibold"
                        >
                          <option value="2026">2026 Batch</option>
                          <option value="2027">2027 Batch</option>
                          <option value="2028">2028 Batch</option>
                          <option value="2029">2029 Batch</option>
                        </select>
                      ) : (
                        <p className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900">
                          {profileData.examYear || "2026"} Batch
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Residential Address */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Residential Street Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.address}, {profileData.city}, {profileData.district}, {profileData.province}
                  </p>
                )}
              </div>

              {/* Bio Statement */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Personal Statement / Bio</label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d] leading-relaxed"
                  />
                ) : (
                  <p className="p-3 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {profileData.bio}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* TEACHER INSTRUCTION MEDIUMS & EXPERIENCE (Personal Tab) */}
          {currentRole === "teacher" && (
            <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-5">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#0d5c4d]" />
                    <span>Teaching Mediums &amp; Professional Experience</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your languages of instruction and total years of Advanced Level coaching experience.
                  </p>
                </div>
                {isEditing && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Editing Mode Active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Mediums of Instruction</label>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {["English", "Sinhala", "Tamil"].map((med) => {
                        const isSel = selectedMediums.includes(med);
                        return (
                          <button
                            key={med}
                            type="button"
                            onClick={() => {
                              setSelectedMediums((prev) =>
                                prev.includes(med) ? prev.filter((m) => m !== med) : [...prev, med]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              isSel
                                ? "bg-[#0d5c4d] text-white border-[#0d5c4d]"
                                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {isSel ? `✓ ${med}` : `+ ${med}`}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedMediums.map((med) => (
                        <span
                          key={med}
                          className="px-3 py-1 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] font-bold text-xs border border-[#c4e9e0]"
                        >
                          {med}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Years of Advanced Level Teaching Experience</label>
                  {isEditing ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value) || 0)}
                        className="w-32 h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-bold text-[#0d5c4d] focus:outline-none focus:border-[#0d5c4d]"
                      />
                      <span className="text-xs font-bold text-slate-600">Years in Service</span>
                    </div>
                  ) : (
                    <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-bold text-[#0d5c4d]">
                      {experienceYears} Years of A/L Excellence &amp; Ranker Mentorship
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* NEXT OF KIN & EMERGENCY LIAISON CARD (Teacher) / PARENT & GUARDIAN CARD (Student) / PLATFORM CLOUD OPERATIONS (Super Admin) */}
          {currentRole === "super_admin" ? (
            <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#0d5c4d]" />
                    <span>Multi-Tenant Cloud Operations &amp; Infrastructure</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Root infrastructure health, live tenant nodes, and platform-level master management.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                  Cluster Status: Optimal (99.98% SLA)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Cloud Region</p>
                  <p className="text-sm font-extrabold text-slate-900">AWS Colombo &amp; Singapore</p>
                  <p className="text-[11px] text-slate-500">Cloudflare Edge CDN Active</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Clearance</p>
                  <p className="text-sm font-extrabold text-[#0d5c4d]">Tier-1 Root Authority</p>
                  <p className="text-[11px] text-slate-500">2FA Master Key Enforced</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Engine Version</p>
                  <p className="text-sm font-extrabold text-slate-900">v2.4.0 Multi-Tenant Engine</p>
                  <p className="text-[11px] text-slate-500">Automated Daily Backups</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView("super_admin_tenants")}
                  className="px-4 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Open Client Tenants Directory</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView("super_admin_matrix")}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sliders className="h-4 w-4" />
                  <span>Configure Granular Feature Matrix</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView("super_admin_pricing")}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>SaaS Packages &amp; Pricing</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#0d5c4d]" />
                    <span>
                      {currentRole === "teacher"
                        ? "Next of Kin & Emergency Liaison"
                        : "Parent & Guardian Information"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentRole === "teacher"
                      ? "Official contact information for institutional welfare, emergency liaison, and faculty benefits."
                      : "Contact information for emergencies, parent-teacher conferences, and academic communications."}
                  </p>
                </div>
                {isEditing && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Editing Mode Active
                  </span>
                )}
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Primary Contact Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher" ? "Next of Kin Full Name" : "Primary Guardian Name"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.guardianName}
                    onChange={(e) => setProfileData({ ...profileData, guardianName: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.guardianName}
                  </p>
                )}
              </div>

              {/* Relationship */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher" ? "Relationship to Faculty Member" : "Relationship to Student"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.guardianRelationship}
                    onChange={(e) => setProfileData({ ...profileData, guardianRelationship: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.guardianRelationship}
                  </p>
                )}
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher" ? "Primary Contact Phone" : "Primary Contact Phone"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.guardianPhone}
                    onChange={(e) => setProfileData({ ...profileData, guardianPhone: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    <span>{profileData.guardianPhone}</span>
                    <a
                      href={`tel:${profileData.guardianPhone}`}
                      className="text-[10px] text-[#0d5c4d] font-bold hover:underline"
                    >
                      {currentRole === "teacher" ? "Call Next of Kin" : "Call Guardian"}
                    </a>
                  </div>
                )}
              </div>

              {/* Contact Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher" ? "Contact Email Address" : "Guardian Email"}
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.guardianEmail}
                    onChange={(e) => setProfileData({ ...profileData, guardianEmail: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.guardianEmail}
                  </p>
                )}
              </div>

              {/* Occupation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher" ? "Occupation / Workplace" : "Guardian Occupation / Workplace"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.guardianOccupation}
                    onChange={(e) => setProfileData({ ...profileData, guardianOccupation: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#f8faf9] border border-slate-200 text-xs font-semibold text-slate-900">
                    {profileData.guardianOccupation}
                  </p>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {currentRole === "teacher" ? "Faculty Welfare & Emergency Liaison (24/7)" : "Emergency Contact (24/7)"}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-900">
                    {profileData.emergencyContact}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )}

      {/* =================================================================== */}
      {/* TEACHER TAB 2: ACTIVE BATCHES & STUDY PACKAGES                      */}
      {/* =================================================================== */}
      {currentRole === "teacher" && activeTab === "teaching" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Active Study Packages &amp; Teaching Batches</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Published subscription packages, enrolled student counts, monthly fee metrics, and syllabus delivery.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentView("teaching")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Launch Teaching Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Workload Metric KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Packages</span>
                <p className="text-2xl font-black text-[#0d5c4d] mt-1 font-mono">4 Packages</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-1">Open for Enrolment</p>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subscribed Students</span>
                <p className="text-2xl font-black text-[#0d2b26] mt-1 font-mono">142 Students</p>
                <p className="text-[10px] text-slate-500 mt-1">Across 4 Active Cohorts</p>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Live Delivery</span>
                <p className="text-2xl font-black text-[#0d2b26] mt-1 font-mono">14 Hours</p>
                <p className="text-[10px] text-slate-500 mt-1">Google Meet &amp; Studio</p>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Batch Gross</span>
                <p className="text-2xl font-black text-amber-600 mt-1 font-mono">Rs. 639,000</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-1">90% Tutor Payout Share</p>
              </div>
            </div>

            {/* Active Study Packages Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#0d2b26]">Published Packages &amp; Cohort Deliverables</h4>
                <span className="text-[11px] font-semibold text-slate-500">Auto-billed monthly per subscriber</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Combined Mathematics 2026 (Pure & Applied Theory)",
                    code: "CMATH-26",
                    tier: "A/L 2026 Comprehensive Theory",
                    students: 48,
                    fee: "Rs. 4,500 / mo",
                    monthlyGross: "Rs. 216,000 / mo",
                    delivery: "Google Meet Live Studio & HD Recordings",
                    schedule: "Mon & Wed · 06:30 PM - 08:30 PM",
                    progress: 76,
                    unitsDone: 9,
                    unitsTotal: 12,
                    badgeColor: "border-indigo-200 bg-indigo-50/50 text-indigo-800"
                  },
                  {
                    title: "Pure Mathematics 2025 (Fast-Track Paper Class)",
                    code: "PMATH-25",
                    tier: "A/L 2025 Revision & Model Papers",
                    students: 42,
                    fee: "Rs. 3,500 / mo",
                    monthlyGross: "Rs. 147,000 / mo",
                    delivery: "Timed Exam Walkthrough & Video Solutions",
                    schedule: "Tue & Thu · 07:00 PM - 09:00 PM",
                    progress: 88,
                    unitsDone: 14,
                    unitsTotal: 16,
                    badgeColor: "border-emerald-200 bg-emerald-50/50 text-emerald-800"
                  },
                  {
                    title: "Applied Mathematics Mechanics & Dynamics Bootcamp",
                    code: "AMATH-26",
                    tier: "Mechanics Intensive Topic Series",
                    students: 32,
                    fee: "Rs. 4,000 / mo",
                    monthlyGross: "Rs. 128,000 / mo",
                    delivery: "Interactive Problem Solving & Whiteboard",
                    schedule: "Saturday Morning · 08:30 AM - 11:30 AM",
                    progress: 70,
                    unitsDone: 7,
                    unitsTotal: 10,
                    badgeColor: "border-blue-200 bg-blue-50/50 text-blue-800"
                  },
                  {
                    title: "G.C.E. A/L Top Rankers Model Paper Masterclass",
                    code: "MC-BOOST",
                    tier: "Elite Island-Rank Booster",
                    students: 20,
                    fee: "Rs. 5,000 / mo",
                    monthlyGross: "Rs. 100,000 / mo",
                    delivery: "Curated Challenge Sets & Individual Feedback",
                    schedule: "Sunday Evening · 06:00 PM - 09:00 PM",
                    progress: 92,
                    unitsDone: 11,
                    unitsTotal: 12,
                    badgeColor: "border-amber-200 bg-amber-50/50 text-amber-800"
                  }
                ].map((course, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-[#e6ece8] bg-[#fcfdfc] hover:border-[#b2e5d9] hover:shadow-xs transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${course.badgeColor}`}>
                            {course.code}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">{course.tier}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-[#0d2b26] mt-1.5">{course.title}</h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-black text-[#0d5c4d] block">
                          {course.fee}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {course.students} Subscribers
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs bg-white p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly Package Gross</span>
                        <p className="font-bold text-[#0d2b26] font-mono">{course.monthlyGross}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Delivery Format</span>
                        <p className="font-semibold text-slate-800 line-clamp-1">{course.delivery}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Live Online Time Slot</span>
                        <p className="font-bold text-[#0d5c4d]">{course.schedule}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Syllabus Completion</span>
                        <span className="font-bold text-[#0d5c4d]">
                          {course.unitsDone} of {course.unitsTotal} Units ({course.progress}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0d5c4d] to-[#147a66] rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => setCurrentView("syllabus_builder")}
                        className="text-[11px] font-bold text-[#0d5c4d] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Manage Syllabus &amp; Notes</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentView("assignments")}
                        className="text-[11px] font-bold text-slate-600 hover:text-[#0d5c4d] transition-colors cursor-pointer"
                      >
                        Submissions &amp; Coursework &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TEACHER TAB 3: LIVE CLASS SCHEDULE & MEET LINKS                     */}
      {/* =================================================================== */}
      {currentRole === "teacher" && activeTab === "schedule" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Weekly Live Class Schedule &amp; Online Studio Sessions</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Day-by-day live stream timetable, interactive doubt clearing clinics, and Google Meet room access.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadTeacherTimetable}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#d6dfd9] text-[#0d5c4d] hover:bg-[#ecf8f5] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Download Live Schedule</span>
                </button>
              </div>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const).map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedScheduleDay(day)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedScheduleDay === day
                      ? "bg-[#0d5c4d] text-white shadow-xs"
                      : "bg-[#f8faf9] text-slate-600 hover:bg-[#ecf8f5] border border-slate-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Day Schedule Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-[#f6fbf9] border border-[#c4e9e0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#0d5c4d]">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-bold">Active Live Schedule for {selectedScheduleDay} · Online Teaching Studio</span>
              </div>
              <span className="font-mono font-bold text-[11px] bg-white px-2.5 py-1 rounded-full border border-[#b2e5d9] self-start sm:self-auto">
                Studio Streaming Active
              </span>
            </div>

            {/* Live Session Cards */}
            <div className="space-y-3">
              {[
                ...(selectedScheduleDay === "Monday"
                  ? [
                      {
                        time: "06:30 PM - 08:30 PM",
                        subject: "Combined Mathematics - Differential Calculus & Real Analysis",
                        cohort: "Batch CMATH-26 · 48 Enrolled Subscribers",
                        type: "Live Theory Lecture",
                        platform: "Google Meet Live Studio",
                        meetCode: "meet.google.com/cmt-26-live",
                        isLive: true
                      },
                      {
                        time: "08:45 PM - 09:30 PM",
                        subject: "1-on-1 Student Doubt Clearing & Homework Review",
                        cohort: "Open Office Hours · All Active Subscribers",
                        type: "Interactive Clinic",
                        platform: "Google Meet Video Room",
                        meetCode: "meet.google.com/tutor-doubt-hub",
                        isLive: false
                      }
                    ]
                  : selectedScheduleDay === "Tuesday"
                  ? [
                      {
                        time: "07:00 PM - 09:00 PM",
                        subject: "Pure Mathematics - 2025 A/L Model Paper Discussion & Time Strategy",
                        cohort: "Batch PMATH-25 · 42 Enrolled Subscribers",
                        type: "Live Paper Class",
                        platform: "Google Meet Live Studio",
                        meetCode: "meet.google.com/pmt-25-paper",
                        isLive: true
                      }
                    ]
                  : selectedScheduleDay === "Wednesday"
                  ? [
                      {
                        time: "06:30 PM - 08:30 PM",
                        subject: "Combined Mathematics - Calculus Tutorial & Complex Problem Sets",
                        cohort: "Batch CMATH-26 · 48 Enrolled Subscribers",
                        type: "Live Problem Solving",
                        platform: "Google Meet Live Studio",
                        meetCode: "meet.google.com/cmt-26-live",
                        isLive: true
                      },
                      {
                        time: "08:40 PM - 09:15 PM",
                        subject: "Homework Grading, Solution Upload & PDF Releases",
                        cohort: "LMS Content Management",
                        type: "Portal Update",
                        platform: "Tutor Content Studio",
                        meetCode: "",
                        isLive: false
                      }
                    ]
                  : selectedScheduleDay === "Thursday"
                  ? [
                      {
                        time: "07:00 PM - 09:00 PM",
                        subject: "Pure Mathematics - Trigonometry & Complex Numbers Workshop",
                        cohort: "Batch PMATH-25 · 42 Enrolled Subscribers",
                        type: "Masterclass Workshop",
                        platform: "Google Meet Live Studio",
                        meetCode: "meet.google.com/pmt-25-paper",
                        isLive: true
                      }
                    ]
                  : selectedScheduleDay === "Friday"
                  ? [
                      {
                        time: "06:30 PM - 07:45 PM",
                        subject: "Weekly Mathematics Olympiad & Advanced Challenge Seminar",
                        cohort: "Elite Challenge Cohort · Top Rankers",
                        type: "Special Masterclass",
                        platform: "Google Meet Live Studio",
                        meetCode: "meet.google.com/mth-olym-live",
                        isLive: true
                      },
                      {
                        time: "08:00 PM - 09:00 PM",
                        subject: "Study Notes, Video Recording Archival & Week 08 Wrap-up",
                        cohort: "All Enrolled Batches",
                        type: "Content Production",
                        platform: "LMS Cloud Vault",
                        meetCode: "",
                        isLive: false
                      }
                    ]
                  : selectedScheduleDay === "Saturday"
                  ? [
                      {
                        time: "08:30 AM - 11:30 AM",
                        subject: "Applied Mathematics - Mechanics, Equilibrium & Circular Motion Bootcamp",
                        cohort: "Batch AMATH-26 · 32 Enrolled Subscribers",
                        type: "3-Hour Intensive",
                        platform: "Google Meet Live Studio",
                        meetCode: "meet.google.com/amt-26-mech",
                        isLive: true
                      }
                    ]
                  : [
                      {
                        time: "06:00 PM - 09:00 PM",
                        subject: "Top Rankers Model Paper Masterclass - Island Rank Problem Clinic",
                        cohort: "Batch MC-BOOST · 20 Enrolled Subscribers",
                        type: "Elite Masterclass",
                        platform: "Google Meet Live Studio",
                        meetCode: "meet.google.com/mc-boost-live",
                        isLive: true
                      }
                    ])
              ].map((slot, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-[#e6ece8] bg-white hover:border-[#b2e5d9] shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="h-12 w-28 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex flex-col items-center justify-center font-bold shrink-0">
                      <span className="text-[11px] font-black">{slot.type}</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5">{slot.time}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-[#0d2b26]">{slot.subject}</span>
                        {slot.isLive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Session
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Target: <span className="font-semibold text-slate-700">{slot.cohort}</span> · Platform:{" "}
                        <span className="font-semibold text-[#0d5c4d]">{slot.platform}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                    {slot.meetCode ? (
                      <a
                        href={`https://${slot.meetCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Launch Google Meet</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCurrentView("content_vault")}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <span>Open Vault</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TEACHER TAB: QUALIFICATIONS & CREDENTIALS                           */}
      {/* =================================================================== */}
      {currentRole === "teacher" && activeTab === "qualifications" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Academic Qualifications &amp; Pedagogical Degrees</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified university credentials, post-graduate education diplomas, and research specializations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTeacherDossier}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Faculty Dossier (PDF)</span>
                </button>
              </div>
            </div>

            {/* University Degrees List */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-[#0d2b26] flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#0d5c4d]" />
                    <span>Higher Education Degrees &amp; Diplomas</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage certified university degrees, diplomas, and collegiate qualifications.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDegreeModalState({
                      isOpen: true,
                      mode: "add",
                      data: {
                        degree: "",
                        institution: "",
                        year: new Date().getFullYear().toString(),
                        honors: "",
                        details: ""
                      }
                    });
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Degree / Qualification</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {qualificationsList.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-5 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-3 flex flex-col justify-between hover:border-[#0d5c4d] transition-all shadow-2xs group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-[#0d5c4d] bg-[#ecf8f5] px-2.5 py-0.5 rounded-full border border-[#c4e9e0]">
                          {item.year || "Year N/A"}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setDegreeModalState({
                                isOpen: true,
                                mode: "edit",
                                index: idx,
                                data: { ...item }
                              });
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-[#0d5c4d] hover:bg-white transition-colors cursor-pointer"
                            title="Edit Qualification"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteDegree(idx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Qualification"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h5 className="font-black text-sm text-[#0d2b26] leading-snug">{item.degree}</h5>
                      <p className="text-xs font-semibold text-slate-700">{item.institution}</p>
                      {item.honors && (
                        <p className="text-xs text-amber-700 font-bold">{item.honors}</p>
                      )}
                    </div>

                    {item.details && (
                      <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 leading-relaxed">
                        {item.details}
                      </p>
                    )}
                  </div>
                ))}

                {qualificationsList.length === 0 && (
                  <div className="md:col-span-3 p-8 text-center rounded-2xl border border-dashed border-slate-300 space-y-2">
                    <GraduationCap className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">No degrees or diplomas added yet.</p>
                    <p className="text-[11px] text-slate-400">Click &quot;Add Degree / Qualification&quot; above to list your higher education background.</p>
                  </div>
                )}
              </div>
            </div>

            {/* National Accreditations & Licensing */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-[#0d2b26] flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#0d5c4d]" />
                    <span>Professional Licensing &amp; National Accreditations</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official teaching service licenses, examiner credentials, and state pedagogical awards.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAccreditationModalState({
                      isOpen: true,
                      mode: "add",
                      data: {
                        id: "",
                        title: "",
                        issuer: "",
                        regNo: "",
                        status: "Active & Verified Service",
                        badge: "Accredited",
                        badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }
                    });
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add License / Accreditation</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accreditationsList.map((lic, idx) => (
                  <div
                    key={lic.id || idx}
                    className="p-5 rounded-2xl bg-white border border-[#e6ece8] shadow-2xs hover:shadow-xs transition-all space-y-3 hover:border-[#0d5c4d] group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${lic.badgeColor || "bg-emerald-50 text-emerald-800 border-emerald-200"}`}>
                          {lic.badge}
                        </span>
                        <h5 className="font-extrabold text-sm text-[#0d2b26] mt-1.5 leading-snug">{lic.title}</h5>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {lic.regNo && (
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                            {lic.regNo}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setAccreditationModalState({
                              isOpen: true,
                              mode: "edit",
                              index: idx,
                              data: { ...lic }
                            });
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-[#0d5c4d] hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Edit Accreditation"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAccreditation(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Accreditation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">{lic.issuer}</p>

                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold pt-2 border-t border-slate-100">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{lic.status}</span>
                    </div>
                  </div>
                ))}

                {accreditationsList.length === 0 && (
                  <div className="md:col-span-2 p-8 text-center rounded-2xl border border-dashed border-slate-300 space-y-2">
                    <ShieldCheck className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">No accreditations or licenses added yet.</p>
                    <p className="text-[11px] text-slate-400">Click &quot;Add License / Accreditation&quot; above to list teaching licenses and examiner appointments.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TEACHER TAB: BANK & PAYOUT DETAILS                                  */}
      {/* =================================================================== */}
      {currentRole === "teacher" && activeTab === "payout" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Tuition Revenue Payout &amp; Direct Deposit Settings</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Register and manage your Sri Lankan commercial bank accounts for automatic monthly tuition disbursements.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setBankModalState({
                    isOpen: true,
                    mode: "add",
                    data: {
                      id: "",
                      bankName: "Commercial Bank of Ceylon",
                      bankAccountName: profileData.fullName || "Samantha Priyantha Perera",
                      bankAccountNumber: "",
                      bankBranch: "",
                      bankBranchCode: "",
                      isPrimary: bankAccountsList.length === 0
                    }
                  });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Bank Account</span>
              </button>
            </div>

            {/* Payout Terms & Rate Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#ecf8f5] to-[#f4faf7] border border-[#c4e9e0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#0d5c4d] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#0d2b26]">90% Guaranteed Tutor Payout Share</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Monthly student tuition subscriptions are directly disbursed to your primary bank account on the 1st of every calendar month.
                  </p>
                </div>
              </div>
              <div className="text-right sm:border-l sm:border-[#c4e9e0] sm:pl-5 shrink-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Settlement Cycle</span>
                <p className="font-black text-sm text-[#0d5c4d]">1st of Every Month</p>
              </div>
            </div>

            {/* Bank Accounts List */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#0d2b26] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#0d5c4d]" />
                <span>Registered Direct Deposit Accounts ({bankAccountsList.length})</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bankAccountsList.map((account, idx) => (
                  <div
                    key={account.id || idx}
                    className={`p-5 rounded-2xl border transition-all space-y-3 shadow-2xs group ${
                      account.isPrimary
                        ? "bg-gradient-to-br from-white to-[#f7fcf9] border-[#0d5c4d] ring-1 ring-[#0d5c4d]/20"
                        : "bg-white border-[#e2eae5] hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#0d5c4d]" />
                          <h5 className="font-extrabold text-sm text-[#0d2b26]">{account.bankName}</h5>
                        </div>
                        {account.isPrimary ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold">
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span>Primary Payout Account</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPrimaryBankAccount(idx)}
                            className="text-[10px] font-bold text-slate-500 hover:text-[#0d5c4d] bg-slate-100 hover:bg-[#ecf8f5] px-2 py-0.5 rounded-md border border-slate-200 transition-colors cursor-pointer"
                          >
                            Set as Primary
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setBankModalState({
                              isOpen: true,
                              mode: "edit",
                              index: idx,
                              data: { ...account }
                            });
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0d5c4d] hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Edit Bank Account"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBankAccount(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Bank Account"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Account Holder Legal Name</span>
                        <p className="font-semibold text-slate-800">{account.bankAccountName || "N/A"}</p>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans font-bold">Account Number</span>
                          <span className="font-bold text-[#0d5c4d] text-xs">
                            ••••••••{account.bankAccountNumber.slice(-4) || "1234"}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-sans">
                          Verified
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Branch: <strong className="text-slate-700">{account.bankBranch || "Main"}</strong></span>
                        {account.bankBranchCode && (
                          <span>Code: <strong className="font-mono text-slate-700">{account.bankBranchCode}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {bankAccountsList.length === 0 && (
                  <div className="md:col-span-2 p-8 text-center rounded-2xl border border-dashed border-slate-300 space-y-2">
                    <CreditCard className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">No bank accounts registered.</p>
                    <p className="text-[11px] text-slate-400">Click &quot;Add Bank Account&quot; to link your direct deposit account for tuition income.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payout Security Notice */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-slate-800">256-Bit Bank Grade Encryption</span>
                <p className="leading-relaxed">
                  Your banking information is encrypted at rest using industry standard AES-256 protocols. LimaT uses this information strictly to transfer verified student tuition payments and generate formal income invoices.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TEACHER TAB: PUBLIC STUDIO & SOCIAL ECOSYSTEM                       */}
      {/* =================================================================== */}
      {currentRole === "teacher" && activeTab === "social" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Public Studio URL &amp; Student Social Channels</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your shareable student-facing studio URL slug, video lectures, and community channels.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPublicPreview(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Eye className="h-3.5 w-3.5 text-purple-600" />
                <span>Preview Public Page</span>
              </button>
            </div>

            {/* Public URL Slug Card */}
            <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Custom Shareable Tutor URL Slug</label>
                {!isEditingSlug ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSlugEditValue(publicSlug);
                      setIsEditingSlug(true);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[#0d5c4d] hover:underline cursor-pointer"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Edit Slug</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingSlug(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveSlug}
                      className="px-2.5 py-0.5 rounded-lg bg-[#0d5c4d] text-white text-xs font-bold hover:bg-[#0a473b] cursor-pointer"
                    >
                      Save Slug
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 flex items-center h-10 rounded-xl border border-slate-300 bg-white overflow-hidden px-3">
                  <span className="text-xs text-slate-400 font-mono select-none">https://limat.lk/tutors/</span>
                  {isEditingSlug ? (
                    <input
                      type="text"
                      value={slugEditValue}
                      onChange={(e) => setSlugEditValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="prof-samantha-perera"
                      className="flex-1 text-xs font-mono font-bold text-[#0d5c4d] focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="text-xs font-mono font-bold text-[#0d5c4d]">{publicSlug}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(`https://limat.lk/tutors/${publicSlug}`);
                    addToast({
                      type: "info",
                      title: "Studio Link Copied",
                      message: `https://limat.lk/tutors/${publicSlug} copied to clipboard.`
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Share this link on WhatsApp, Facebook, and flyers so prospective students can browse your study packages and enroll directly.
              </p>
            </div>

            {/* Studio Cover Banner Selection */}
            <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Studio Cover Banner</h4>
                  <p className="text-[11px] text-slate-500">Custom branded cover banner displayed at the top of your student studio.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCoverModalState({ isOpen: true, url: coverImageUrl });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0d5c4d] text-white hover:bg-[#0a473b] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Change Banner</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetCoverImage}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                    title="Reset to default banner"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="relative h-32 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner">
                <img
                  src={coverImageUrl}
                  alt="Studio Cover"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-between p-4 text-white">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">Live Studio Banner</span>
                    <h5 className="font-black text-sm">{profileData.fullName}</h5>
                  </div>
                  <span className="text-[10px] font-mono bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-md">
                    1200 x 400
                  </span>
                </div>
              </div>
            </div>

            {/* Connected Social & Community Channels */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-[#0d2b26] flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-[#0d5c4d]" />
                    <span>Connected Social &amp; Community Channels ({socialChannelsList.length})</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect your YouTube, Telegram, WhatsApp, TikTok, and other platforms so students can follow your lectures.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSocialModalState({
                      isOpen: true,
                      mode: "add",
                      data: {
                        id: "",
                        platform: "youtube",
                        title: "",
                        url: ""
                      }
                    });
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Social Channel</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {socialChannelsList.map((channel, idx) => {
                  const plat = channel.platform.toLowerCase();
                  let badgeBg = "bg-slate-100 text-slate-800 border-slate-200";
                  let icon = "🌐";

                  if (plat === "youtube") {
                    badgeBg = "bg-red-50 text-red-700 border-red-200";
                    icon = "▶";
                  } else if (plat === "telegram") {
                    badgeBg = "bg-sky-50 text-sky-700 border-sky-200";
                    icon = "✈";
                  } else if (plat === "whatsapp") {
                    badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    icon = "💬";
                  } else if (plat === "tiktok") {
                    badgeBg = "bg-slate-900 text-white border-slate-800";
                    icon = "🎵";
                  } else if (plat === "facebook") {
                    badgeBg = "bg-blue-50 text-blue-700 border-blue-200";
                    icon = "f";
                  } else if (plat === "linkedin") {
                    badgeBg = "bg-indigo-50 text-indigo-700 border-indigo-200";
                    icon = "in";
                  }

                  const targetUrl = plat === "whatsapp" && !channel.url.startsWith("http")
                    ? `https://wa.me/${channel.url.replace(/[^0-9]/g, "")}`
                    : channel.url;

                  return (
                    <div
                      key={channel.id || idx}
                      className="p-4 rounded-2xl bg-white border border-[#e2eae5] shadow-2xs hover:shadow-xs hover:border-[#0d5c4d] transition-all space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border flex items-center gap-1 ${badgeBg}`}>
                            <span>{icon}</span>
                            <span className="capitalize">{channel.platform}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <a
                            href={targetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] transition-colors cursor-pointer"
                            title="Visit Channel"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setSocialModalState({
                                isOpen: true,
                                mode: "edit",
                                index: idx,
                                data: { ...channel }
                              });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0d5c4d] hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Edit Channel"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSocialChannel(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Channel"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h5 className="font-extrabold text-xs text-[#0d2b26]">{channel.title}</h5>
                        <p className="text-[11px] text-slate-500 font-mono truncate">{channel.url}</p>
                      </div>
                    </div>
                  );
                })}

                {socialChannelsList.length === 0 && (
                  <div className="sm:col-span-2 p-8 text-center rounded-2xl border border-dashed border-slate-300 space-y-2">
                    <Share2 className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">No social channels connected yet.</p>
                    <p className="text-[11px] text-slate-400">Click &quot;Add Social Channel&quot; to connect YouTube, Telegram, or WhatsApp.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STUDENT TABS (Only for student / parent roles)                      */}
      {/* =================================================================== */}
      {currentRole !== "teacher" && (
        <>
          {/* TAB 2: ENROLLED TUTORS & ACTIVE SUBJECTS                         */}
          {activeTab === "academic" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            <div>
              <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#0d5c4d]" />
                <span>Enrolled Tutors &amp; Active Subject Batches</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active tuition subscriptions under independent educators, weekly live lecture schedules, and monthly access passes.
              </p>
            </div>

            {/* Tuition Hub & Subscription Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Tutors</span>
                <p className="font-black text-sm text-[#0d2b26]">4 Independent Educators</p>
                <p className="text-[11px] text-slate-500">Pure Maths, Physics, Chem, ICT</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {(profileData.gradeLevel === "12" || profileData.gradeLevel === "13")
                    ? "Target Examination"
                    : (profileData.gradeLevel === "10" || profileData.gradeLevel === "11")
                    ? "Target Examination"
                    : "Academic Stage"}
                </span>
                <p className="font-black text-sm text-[#0d2b26]">
                  {(profileData.gradeLevel === "12" || profileData.gradeLevel === "13")
                    ? `G.C.E. Advanced Level ${profileData.examYear || "2026"}`
                    : (profileData.gradeLevel === "10" || profileData.gradeLevel === "11")
                    ? `G.C.E. Ordinary Level ${profileData.examYear || "2026"}`
                    : `Junior Secondary (${profileData.grade || "Grade 8"})`}
                </p>
                <p className="text-[11px] text-slate-500">
                  {(profileData.gradeLevel === "12" || profileData.gradeLevel === "13")
                    ? `${profileData.stream || "Physical Science"} Masterclass Batch`
                    : (profileData.gradeLevel === "10" || profileData.gradeLevel === "11")
                    ? `Grade ${profileData.gradeLevel || "11"} O/L Tuition Batches`
                    : `General Academic Subject Batches`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tuition Subscriptions</span>
                <p className="font-black text-sm text-[#0d5c4d]">4 Monthly Passes Active</p>
                <p className="text-[11px] text-emerald-600 font-semibold">Bank Slips Verified &bull; Paid</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Live Classes</span>
                <p className="font-black text-sm text-[#0d2b26]">12 Hours / Week</p>
                <p className="text-[11px] text-slate-500">Google Meet &amp; Video Vault</p>
              </div>
            </div>

            {/* Enrolled Subjects & Tutors List */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#0d2b26]">Active Tuition Classes &amp; Tutors</h4>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  4 Active Batches
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: "Combined Mathematics",
                    code: "Batch CMATH-26",
                    teacher: "Dr. Samantha Perera",
                    title: "Lead Mathematics Specialist & Paper Author",
                    nextSession: "Saturday 08:30 AM – 11:30 AM (Model Paper Class)",
                    weeklySessions: [
                      { day: "Tue", time: "07:00 PM – 09:00 PM", label: "Pure Maths Theory" },
                      { day: "Thu", time: "07:00 PM – 09:00 PM", label: "Applied Mechanics Lab" },
                      { day: "Sat", time: "08:30 AM – 11:30 AM", label: "Model Paper Discussion" },
                      { day: "Mon", time: "08:45 PM – 09:30 PM", label: "Doubt Clinic & Homework" }
                    ],
                    color: "border-emerald-200 bg-emerald-50/20"
                  },
                  {
                    name: "Physics (Theory & Practicals)",
                    code: "Batch PHY-26",
                    teacher: "Eng. K. Thanushan",
                    title: "Senior Physics Educator & Concept Specialist",
                    nextSession: "Sunday 04:00 PM – 07:00 PM (Model Paper & Practical)",
                    weeklySessions: [
                      { day: "Wed", time: "06:30 PM – 08:30 PM", label: "Waves & Optics Theory" },
                      { day: "Fri", time: "07:00 PM – 09:00 PM", label: "Structured Problem Lab" },
                      { day: "Sun", time: "04:00 PM – 07:00 PM", label: "Model Paper & Practical" }
                    ],
                    color: "border-blue-200 bg-blue-50/20"
                  },
                  {
                    name: "Chemistry (Theory & Revision)",
                    code: "Batch CHEM-26",
                    teacher: "Dr. Nilmini Silva",
                    title: "Chemistry Senior Lecturer & Reaction Lab Lead",
                    nextSession: "Wednesday 06:30 PM – 08:30 PM (Organic Reaction Mechanics)",
                    weeklySessions: [
                      { day: "Tue", time: "05:00 PM – 07:00 PM", label: "Inorganic & Physical Chemistry" },
                      { day: "Wed", time: "06:30 PM – 08:30 PM", label: "Organic Reaction Mechanics" },
                      { day: "Sun", time: "08:30 AM – 10:30 AM", label: "Model Paper Discussion" }
                    ],
                    color: "border-purple-200 bg-purple-50/20"
                  },
                  {
                    name: "Information & Communication Tech",
                    code: "Batch ICT-26",
                    teacher: "Eng. S. Wickramasinghe",
                    title: "Collegiate ICT Lead & Python Master Trainer",
                    nextSession: "Friday 07:00 PM – 09:00 PM (Systems & Networking)",
                    weeklySessions: [
                      { day: "Thu", time: "05:00 PM – 07:00 PM", label: "Python & Algorithms Lab" },
                      { day: "Fri", time: "07:00 PM – 09:00 PM", label: "Systems Architecture & Networking" },
                      { day: "Sat", time: "04:00 PM – 06:00 PM", label: "Model Paper & Code Review" }
                    ],
                    color: "border-amber-200 bg-amber-50/20"
                  }
                ].map((subject, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border ${subject.color} flex flex-col justify-between gap-3 transition-all hover:shadow-xs bg-white`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{subject.name}</span>
                        <span className="text-[10px] font-mono font-bold text-[#0d5c4d] bg-[#ecf8f5] px-2 py-0.5 rounded-md border border-[#c4e9e0]">
                          {subject.code}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{subject.teacher}</p>
                        <p className="text-[11px] text-slate-500">{subject.title}</p>
                      </div>

                      {/* Next Upcoming Live Session Banner */}
                      <div className="p-2.5 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0] flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="font-extrabold text-[#0d5c4d]">Next:</span>
                        <span className="font-bold text-slate-800 truncate">{subject.nextSession}</span>
                      </div>

                      {/* Multi-Day Weekly Schedule Breakdown */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Weekly Live Schedule ({subject.weeklySessions.length} Sessions / Week):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {subject.weeklySessions.map((slot, sIdx) => (
                            <div
                              key={sIdx}
                              className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[10px] flex items-center justify-between gap-1 text-slate-700"
                            >
                              <div className="flex items-center gap-1 font-bold text-slate-900">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0d5c4d]" />
                                <span>{slot.day}</span>
                                <span className="font-medium text-slate-500">{slot.time}</span>
                              </div>
                              <span className="text-[9px] text-slate-400 font-semibold truncate max-w-[85px] text-right">
                                {slot.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Monthly Pass: Active</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => setCurrentView("live_schedule")}
                        className="text-xs font-bold text-[#0d5c4d] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Join Live</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB: ONLINE ASSESSMENT SCHEDULE & MODEL PAPERS                     */}
      {/* =================================================================== */}
      {activeTab === "timetable" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Online Masterclass Assessments &amp; Model Paper Schedule</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled online model paper dates, timed portal submission windows, proctoring details, and live mentor discussion slots.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] font-bold text-xs border border-[#b2e5d9] self-start sm:self-auto">
                <Video className="h-3.5 w-3.5" />
                <span>Live Online Proctored</span>
              </div>
            </div>

            {/* Candidate Online Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-[#f6fbf9] border border-[#c4e9e0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#0d5c4d]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-bold">Candidate Index: {profileData.indexNumber || "LMT-2026-12A-042"}</span>
                <span className="hidden sm:inline text-slate-400">|</span>
                <span className="hidden sm:inline text-slate-600">Online Submission Timer Active &bull; Upload scanned PDF scripts</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#b2e5d9] font-extrabold text-[10px] text-[#0d5c4d] shadow-2xs self-start sm:self-auto">
                Webcam &amp; Portal Monitored ✓
              </span>
            </div>

            {/* Exams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialExams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-[#fcfdfc] rounded-2xl border border-[#e6ece8] p-5 shadow-2xs hover:shadow-md hover:border-[#b2e5d9] transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] text-[10px] font-bold uppercase tracking-wider">
                        {exam.subject}
                      </span>
                      <h4 className="font-extrabold text-sm text-[#0d2b26] mt-1.5 leading-snug">
                        {exam.title}
                      </h4>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-extrabold text-[11px] border border-amber-200 shrink-0">
                      {exam.durationMinutes / 60} Hours
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-[#eef3f0]">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Date</p>
                        <p className="font-bold">{exam.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Time Window</p>
                        <p className="font-bold">{exam.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Video className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Exam Platform</p>
                        <p className="font-bold line-clamp-1">{exam.hallName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <ShieldCheck className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Mode</p>
                        <p className="font-bold text-[#0d5c4d]">{exam.seatNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#f0f4f1] text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Conducting Mentor: <span className="text-slate-800 font-bold">{exam.invigilator}</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Online Scheduled ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB: LEARNING PROGRESS & SYLLABUS MASTERY                           */}
      {/* =================================================================== */}
      {activeTab === "progress" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Learning Progress &amp; Syllabus Mastery</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time tracking of syllabus completion across enrolled tutor masterclasses, weekly study hours, quiz mastery, and unit milestones.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] text-xs font-bold border border-[#b2e5d9] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Term 2 On-Track &bull; 76% Covered</span>
                </span>
              </div>
            </div>

            {/* Top Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Syllabus</span>
                  <TrendingUp className="h-4 w-4 text-[#0d5c4d]" />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-black text-[#0d5c4d]">76%</p>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    +4% this wk
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-[#0d5c4d] h-full rounded-full transition-all duration-500" style={{ width: "76%" }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Average across 4 enrolled tutor masterclasses</p>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Study Hours</span>
                  <Clock className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-black text-slate-800">148.5</p>
                  <span className="text-xs font-bold text-slate-400">hours</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>108h Live Sessions &bull; 40.5h Replays</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">24.5 hrs logged in past 7 days</p>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Streak</span>
                  <Flame className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-black text-amber-600">19 Days</p>
                  <span className="text-base">🔥</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                    Consistency Master
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Best streak: 28 days continuous</p>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quiz Mastery</span>
                  <Target className="h-4 w-4 text-teal-600" />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-black text-[#0d5c4d]">89.2%</p>
                  <span className="text-[10px] font-bold text-slate-500">Avg Score</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-600 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>38 of 42 Practice Sets Passed</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">715 practice problems completed</p>
              </div>
            </div>

            {/* Weekly Study Rhythm & Consistency */}
            <div className="bg-[#fcfdfc] rounded-2xl border border-[#e2eae5] p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#0d5c4d]" />
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0d2b26]">
                    Weekly Study Rhythm &amp; Learning Volume
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500 font-medium">Weekly Goal: <strong className="text-slate-800">25 hrs</strong></span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                    24.5 hrs Completed (98%)
                  </span>
                </div>
              </div>

              {/* Day-by-Day Visual Activity Bars */}
              <div className="grid grid-cols-7 gap-2 pt-2">
                {[
                  { day: "Mon", hours: 2.5, percent: 50, active: true },
                  { day: "Tue", hours: 3.5, percent: 70, active: true },
                  { day: "Wed", hours: 2.0, percent: 40, active: true },
                  { day: "Thu", hours: 4.0, percent: 80, active: true },
                  { day: "Fri", hours: 3.0, percent: 60, active: true },
                  { day: "Sat", hours: 5.5, percent: 100, active: true, peak: true },
                  { day: "Sun", hours: 4.0, percent: 80, active: true }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-extrabold text-[#0d5c4d]">{item.hours}h</span>
                    <div className="w-full bg-slate-100 h-24 rounded-xl flex items-end p-1 justify-center relative group">
                      <div
                        className={`w-full rounded-lg transition-all duration-300 ${
                          item.peak
                            ? "bg-gradient-to-t from-[#0d5c4d] to-emerald-400 shadow-xs"
                            : "bg-[#0d5c4d]/80 hover:bg-[#0d5c4d]"
                        }`}
                        style={{ height: `${item.percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB: SPORTS & ATHLETIC ACHIEVEMENTS RECORD                         */}
      {/* =================================================================== */}
      {activeTab === "sports" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2eae5] p-5 sm:p-7 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Student Athletic Portfolio &amp; Sports Achievement Records</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified institutional sports credentials, tournament records, representative honours, and fitness certifications.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadSportsCertificate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs shadow-md transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Sports Record (PDF)</span>
              </button>
            </div>

            {/* Top Athletic Metrics / Honours Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Sport</span>
                <p className="text-lg font-black text-[#0d5c4d] mt-1">Cricket (First XI)</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">Vice Captain</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Jersey #07</span>
                </div>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academy Honours</span>
                <p className="text-lg font-black text-[#0d2b26] mt-1">Double Colorsman</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-1">Cricket &amp; Track Athletics</p>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Career Medals</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-black text-amber-600 font-mono">12</p>
                  <span className="text-[11px] font-bold text-slate-600">Medals Won</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">6 Gold • 4 Silver • 2 Bronze</p>
              </div>

              <div className="bg-[#f8faf9] rounded-2xl p-4 border border-[#e2eae5] shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fitness Level</span>
                <p className="text-lg font-black text-[#0d5c4d] mt-1 font-mono">Grade A+ (Elite)</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-1">Yo-Yo IR1: Level 19.4 • Fit</p>
              </div>
            </div>

            {/* Active Teams & Squad Roster Enrollment */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0d2b26] flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-[#0d5c4d]" />
                <span>Enrolled Teams &amp; Squad Rosters</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Team 1: Cricket */}
                <div className="p-4 rounded-2xl bg-[#fcfdfc] border border-[#e2eae5] hover:border-[#b2e5d9] transition-all space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold">
                        Major Sport
                      </span>
                      <h5 className="font-extrabold text-sm text-[#0d2b26] mt-1">Lions Academy First XI Cricket</h5>
                    </div>
                    <span className="text-xl">🏏</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><span className="font-bold text-slate-800">Role:</span> All-Rounder / Vice Captain</p>
                    <p><span className="font-bold text-slate-800">Specialty:</span> Right-Hand Bat, Right-Arm Medium Fast</p>
                    <p><span className="font-bold text-slate-800">Coach:</span> Coach Samantha Perera</p>
                    <p><span className="font-bold text-slate-800">Schedule:</span> Mon, Wed, Fri (3:30 - 5:30 PM)</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-bold">16 Appearances</span>
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">Active Captaincy ✓</span>
                  </div>
                </div>

                {/* Team 2: Athletics */}
                <div className="p-4 rounded-2xl bg-[#fcfdfc] border border-[#e2eae5] hover:border-[#b2e5d9] transition-all space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold">
                        Track &amp; Field
                      </span>
                      <h5 className="font-extrabold text-sm text-[#0d2b26] mt-1">Lions Senior Track &amp; Sprint Squad</h5>
                    </div>
                    <span className="text-xl">🏃</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><span className="font-bold text-slate-800">Events:</span> 100m, 200m &amp; 4x100m Relay Anchor</p>
                    <p><span className="font-bold text-slate-800">Personal Best:</span> 100m: 11.02s | 200m: 22.45s</p>
                    <p><span className="font-bold text-slate-800">Coach:</span> Coach M. Faizal</p>
                    <p><span className="font-bold text-slate-800">Schedule:</span> Tue, Thu (6:00 - 7:30 AM)</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-bold">National Qualifier</span>
                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold">Championship Record Holder</span>
                  </div>
                </div>

                {/* Team 3: Inter-House */}
                <div className="p-4 rounded-2xl bg-[#fcfdfc] border border-[#e2eae5] hover:border-[#b2e5d9] transition-all space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-extrabold">
                        Academy League
                      </span>
                      <h5 className="font-extrabold text-sm text-[#0d2b26] mt-1">Lions Academy Gold Squad</h5>
                    </div>
                    <span className="text-xl">🏆</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><span className="font-bold text-slate-800">Role:</span> Senior Academy Sports Captain</p>
                    <p><span className="font-bold text-slate-800">Meet Points:</span> 28 Individual Championship Points</p>
                    <p><span className="font-bold text-slate-800">Squad Mentor:</span> Eng. K. Thanushan</p>
                    <p><span className="font-bold text-slate-800">Squad Rank:</span> 1st Place Overall (2026)</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-purple-700 font-bold">Best Senior Athlete</span>
                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold">Academy Shield ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Tournament Achievements & Medals Table */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#0d2b26] flex items-center gap-1.5">
                <Medal className="h-3.5 w-3.5 text-amber-500" />
                <span>Official Tournament Achievements &amp; Medal Records</span>
              </h4>

              <div className="bg-white rounded-2xl border border-[#e6ece8] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fcfdfc] border-b border-[#e6ece8] text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Event / Tournament</th>
                        <th className="py-3 px-4">Sport</th>
                        <th className="py-3 px-4 text-center">Medal / Award</th>
                        <th className="py-3 px-4">Level</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Performance Highlights</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f4f1]">
                      {[
                        {
                          tournament: "All-Island Academy & Club Tier 1 Tournament (Finals)",
                          sport: "Cricket",
                          medal: "Gold Medal & Man of the Match",
                          medalType: "gold",
                          level: "National Tier 1",
                          date: "Sept 2026",
                          highlights: "Scored 78* (62 balls) & took 4/28 vs Colombo CC. Lions Academy won by 38 runs."
                        },
                        {
                          tournament: "Sri Lanka All-Island Academy Athletics Meet",
                          sport: "Athletics",
                          medal: "Gold Medal (New Record)",
                          medalType: "gold",
                          level: "All-Island National",
                          date: "July 2025",
                          highlights: "4x100m Relay Anchor Leg (Championship Record: 42.18s)."
                        },
                        {
                          tournament: "Western Provincial Track & Field Championship",
                          sport: "Athletics",
                          medal: "Silver Medal",
                          medalType: "silver",
                          level: "Provincial",
                          date: "Aug 2025",
                          highlights: "200m Sprint Final: 22.45 seconds (PB)."
                        },
                        {
                          tournament: "Lions Sports Academy Annual Awards Night 2025/2026",
                          sport: "Multi-Sport",
                          medal: "Academy Double Colors Award",
                          medalType: "colors",
                          level: "Institutional",
                          date: "Feb 2026",
                          highlights: "Honoured with Lions Golden Emblem for cricket and sprint athletics excellence."
                        },
                        {
                          tournament: "Annual Academy Championship League",
                          sport: "Athletics",
                          medal: "Senior Champion Trophy",
                          medalType: "trophy",
                          level: "Academy League",
                          date: "Feb 2026",
                          highlights: "Gold in 100m, Gold in 200m, Gold in 4x100m Relay. Total 28 Points for Lions Gold Squad."
                        },
                        {
                          tournament: "All-Island Junior Badminton Championship",
                          sport: "Badminton",
                          medal: "Bronze Medal",
                          medalType: "bronze",
                          level: "National Junior",
                          date: "Nov 2024",
                          highlights: "Under-16 Boys Doubles Semi-Finalist."
                        }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#f9fbf9] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{item.tournament}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ecf8f5] text-[#0d5c4d]">
                              {item.sport}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                item.medalType === "gold"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : item.medalType === "silver"
                                  ? "bg-slate-200 text-slate-800 border border-slate-300"
                                  : item.medalType === "colors"
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                  : item.medalType === "trophy"
                                  ? "bg-purple-100 text-purple-900 border border-purple-300"
                                  : "bg-orange-100 text-orange-900 border border-orange-300"
                              }`}
                            >
                              {item.medal}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-semibold">{item.level}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{item.date}</td>
                          <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs">{item.highlights}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Fitness, Biometrics & Coach Clearance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Biometrics */}
              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#0d2b26] flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-[#0d5c4d]" />
                    <span>Physical Biometrics &amp; Conditioning</span>
                  </h5>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                    Medical Fit ✓
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Height / Weight</p>
                    <p className="font-black text-[#0d2b26] mt-0.5">178 cm / 68 kg</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Yo-Yo Test</p>
                    <p className="font-black text-[#0d5c4d] mt-0.5">Level 19.4</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">VO2 Max</p>
                    <p className="font-black text-amber-600 mt-0.5">58.2 ml/kg</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-200/60">
                  <p>• Medical Examiner: <span className="font-bold text-slate-700">Dr. H. Wickremasinghe, MBBS</span> (Sports Medicine Board)</p>
                  <p>• Clearance Validity: <span className="font-bold text-slate-700">Full Academic Year 2026/2027</span></p>
                </div>
              </div>

              {/* Coach Endorsement */}
              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-3 flex flex-col justify-between">
                <div>
                  <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#0d2b26] flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0d5c4d]" />
                    <span>Head Coach &amp; Academy Director Endorsement</span>
                  </h5>
                  <p className="text-xs text-slate-600 italic mt-2 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    &ldquo;Sathurjan is an exemplary natural leader on the field. His tactical awareness as Vice Captain in our Lions First XI cricket squad and explosive anchor leg in athletics reflect exceptional dedication, balancing top physical fitness with academic brilliance.&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                  <span className="font-bold text-slate-700">Coach Samantha Perera (Academy Sports Director)</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-[#c4e9e0] text-[#0d5c4d] font-bold">
                    Official Stamp Verified ✓
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* =================================================================== */}
      {/* PUBLIC TUTOR STUDIO PREVIEW MODAL                                   */}
      {/* =================================================================== */}
      {showPublicPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-[#0d2b26] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Public Visitor Preview
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">
                  • https://limat.lk/tutors/{publicSlug}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPublicPreview(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[80vh] overflow-y-auto">
              {/* Studio Cover Banner */}
              <div className="relative h-44 sm:h-52 w-full bg-slate-900">
                <img
                  src={coverImageUrl}
                  alt="Studio Cover"
                  className="h-full w-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                  <div className="flex items-end gap-4">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-[#0d5c4d] to-[#147a66] border-4 border-white text-white flex items-center justify-center text-3xl font-black shadow-xl">
                      {profileData.name.charAt(0)}
                    </div>
                    <div className="text-white space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black">{profileData.fullName}</h2>
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[10px]">
                          VERIFIED TUTOR ✓
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200">{profileData.grade}</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/20 text-white text-xs font-bold">
                    <span className="text-amber-400">★ 4.9</span>
                    <span>· 142 Active Students</span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Teaching Mediums & Experience Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 mr-1">Mediums:</span>
                  {selectedMediums.map((m) => (
                    <span key={m} className="px-2.5 py-1 rounded-lg bg-[#ecf8f5] text-[#0d5c4d] font-bold text-xs border border-[#c4e9e0]">
                      {m}
                    </span>
                  ))}
                  <span className="text-slate-300">•</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                    {experienceYears} Years Teaching Experience
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                    SLTS Registered
                  </span>
                </div>

                {/* About the Tutor */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm text-[#0d2b26]">About the Tutor &amp; Teaching Methodology</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {profileData.bio}
                  </p>
                </div>

                {/* Degrees & Qualifications */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-extrabold text-sm text-[#0d2b26] flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#0d5c4d]" />
                    <span>Academic Credentials &amp; Degrees</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {qualificationsList.map((q, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#f8faf9] border border-[#e2eae5] space-y-1">
                        <span className="text-[10px] font-bold text-[#0d5c4d]">{q.year}</span>
                        <h5 className="font-bold text-xs text-[#0d2b26] line-clamp-1">{q.degree}</h5>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{q.institution}</p>
                        <p className="text-[10px] text-amber-700 font-semibold">{q.honors}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Study Packages */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-[#0d2b26] flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#0d5c4d]" />
                      <span>Available Tuition Packages &amp; Masterclasses</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-emerald-700">Admission Open</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Combined Mathematics 2026 (Theory & Revision)",
                        fee: "Rs. 4,500 / month",
                        schedule: "Mon & Wed · 06:30 PM",
                        features: ["Live Interactive Stream", "Recorded HD Archive", "Past Paper Vault", "WhatsApp Q&A"]
                      },
                      {
                        title: "Pure Mathematics Fast-Track Paper Class",
                        fee: "Rs. 3,500 / month",
                        schedule: "Tue & Thu · 07:00 PM",
                        features: ["Timed Exam Simulations", "Model Papers", "Marking Scheme Review", "Monthly Assessment"]
                      }
                    ].map((pkg, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white border border-[#e2eae5] hover:border-[#0d5c4d] shadow-2xs space-y-3 transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-bold text-sm text-[#0d2b26]">{pkg.title}</h5>
                          <span className="font-mono font-black text-xs text-[#0d5c4d] whitespace-nowrap bg-[#ecf8f5] px-2.5 py-1 rounded-lg">
                            {pkg.fee}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">🕒 {pkg.schedule}</p>
                        <ul className="space-y-1 text-[11px] text-slate-600">
                          {pkg.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={() => {
                            addToast({
                              type: "info",
                              title: "Enrollment Notice",
                              message: `In public mode, clicking this lets students subscribe to ${pkg.title}.`
                            });
                          }}
                          className="w-full py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Enroll in Batch Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Channels & Contact */}
                <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">Official Channels:</span>
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1"
                    >
                      <span>YouTube</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <a
                      href={telegramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold flex items-center gap-1"
                    >
                      <span>Telegram</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Chat on WhatsApp</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                This is a live preview simulation of your public studio profile.
              </span>
              <button
                type="button"
                onClick={() => setShowPublicPreview(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Back to Studio Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. DEGREE / QUALIFICATION MODAL (Add & Edit)                         */}
      {/* =================================================================== */}
      {degreeModalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center font-bold">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0d2b26]">
                    {degreeModalState.mode === "add" ? "Add Higher Education Degree" : "Edit Degree & Qualification"}
                  </h3>
                  <p className="text-xs text-slate-500">Degree or pedagogical diploma credential details.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDegreeModalState({ ...degreeModalState, isOpen: false })}
                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveDegree(degreeModalState.data);
              }}
              className="px-6 space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Degree / Diploma Title *</label>
                <input
                  type="text"
                  required
                  value={degreeModalState.data.degree}
                  onChange={(e) => setDegreeModalState({
                    ...degreeModalState,
                    data: { ...degreeModalState.data, degree: e.target.value }
                  })}
                  placeholder="e.g. Bachelor of Science (B.Sc. Special) in Mathematics"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-bold text-[#0d2b26] focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Awarding University / Institute *</label>
                <input
                  type="text"
                  required
                  value={degreeModalState.data.institution}
                  onChange={(e) => setDegreeModalState({
                    ...degreeModalState,
                    data: { ...degreeModalState.data, institution: e.target.value }
                  })}
                  placeholder="e.g. University of Colombo, Sri Lanka"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Year Awarded *</label>
                  <input
                    type="text"
                    required
                    value={degreeModalState.data.year}
                    onChange={(e) => setDegreeModalState({
                      ...degreeModalState,
                      data: { ...degreeModalState.data, year: e.target.value }
                    })}
                    placeholder="e.g. 2012"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Honors / Class Classification</label>
                  <input
                    type="text"
                    value={degreeModalState.data.honors || ""}
                    onChange={(e) => setDegreeModalState({
                      ...degreeModalState,
                      data: { ...degreeModalState.data, honors: e.target.value }
                    })}
                    placeholder="e.g. First Class Honours"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Specialization Focus &amp; Curriculum</label>
                <textarea
                  rows={3}
                  value={degreeModalState.data.details || ""}
                  onChange={(e) => setDegreeModalState({
                    ...degreeModalState,
                    data: { ...degreeModalState.data, details: e.target.value }
                  })}
                  placeholder="e.g. Pure Mathematics, Complex Analysis, Linear Algebra and Mathematical Modeling."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div className="pt-3 pb-6 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDegreeModalState({ ...degreeModalState, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  {degreeModalState.mode === "add" ? "Add Qualification" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. ACCREDITATION / LICENSE MODAL (Add & Edit)                        */}
      {/* =================================================================== */}
      {accreditationModalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0d2b26]">
                    {accreditationModalState.mode === "add" ? "Add License / Accreditation" : "Edit Accreditation"}
                  </h3>
                  <p className="text-xs text-slate-500">Government, examination board or council accreditation.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAccreditationModalState({ ...accreditationModalState, isOpen: false })}
                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveAccreditation(accreditationModalState.data);
              }}
              className="px-6 space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Licensing / Credential Title *</label>
                <input
                  type="text"
                  required
                  value={accreditationModalState.data.title}
                  onChange={(e) => setAccreditationModalState({
                    ...accreditationModalState,
                    data: { ...accreditationModalState.data, title: e.target.value }
                  })}
                  placeholder="e.g. Sri Lanka Teachers' Service (SLTS) Class 1 Senior Educator"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-bold text-[#0d2b26] focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Issuing Ministry or Authority *</label>
                <input
                  type="text"
                  required
                  value={accreditationModalState.data.issuer}
                  onChange={(e) => setAccreditationModalState({
                    ...accreditationModalState,
                    data: { ...accreditationModalState.data, issuer: e.target.value }
                  })}
                  placeholder="e.g. Ministry of Education, Pelawatte, Battaramulla"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Registration / Reference No *</label>
                  <input
                    type="text"
                    required
                    value={accreditationModalState.data.regNo}
                    onChange={(e) => setAccreditationModalState({
                      ...accreditationModalState,
                      data: { ...accreditationModalState.data, regNo: e.target.value }
                    })}
                    placeholder="e.g. SLTS-REG/2012/4482"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:border-[#0d5c4d]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Badge Classification</label>
                  <select
                    value={accreditationModalState.data.badge}
                    onChange={(e) => {
                      const badge = e.target.value;
                      let badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
                      if (badge.includes("Examiner")) badgeColor = "bg-blue-50 text-blue-800 border-blue-200";
                      else if (badge.includes("Trainer")) badgeColor = "bg-purple-50 text-purple-800 border-purple-200";
                      else if (badge.includes("Award")) badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
                      setAccreditationModalState({
                        ...accreditationModalState,
                        data: { ...accreditationModalState.data, badge, badgeColor }
                      });
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d] bg-white font-bold"
                  >
                    <option value="SLTS Class 1">SLTS Class 1</option>
                    <option value="Chief Examiner">Chief Examiner</option>
                    <option value="Master Trainer">Master Trainer</option>
                    <option value="Provincial Award">Provincial Award</option>
                    <option value="Accredited Educator">Accredited Educator</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Service Status &amp; Scope</label>
                <input
                  type="text"
                  value={accreditationModalState.data.status}
                  onChange={(e) => setAccreditationModalState({
                    ...accreditationModalState,
                    data: { ...accreditationModalState.data, status: e.target.value }
                  })}
                  placeholder="e.g. Active & Permanent Pensionable Service · 14 Years Seniority"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div className="pt-3 pb-6 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAccreditationModalState({ ...accreditationModalState, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  {accreditationModalState.mode === "add" ? "Register Accreditation" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. BANK ACCOUNT MODAL (Add & Edit)                                  */}
      {/* =================================================================== */}
      {bankModalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0d2b26]">
                    {bankModalState.mode === "add" ? "Add Direct Deposit Account" : "Edit Payout Bank Details"}
                  </h3>
                  <p className="text-xs text-slate-500">Sri Lankan commercial bank for monthly subscription transfers.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBankModalState({ ...bankModalState, isOpen: false })}
                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveBankAccount(bankModalState.data);
              }}
              className="px-6 space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Commercial Bank Name *</label>
                <select
                  value={bankModalState.data.bankName}
                  onChange={(e) => setBankModalState({
                    ...bankModalState,
                    data: { ...bankModalState.data, bankName: e.target.value }
                  })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d] bg-white"
                >
                  <option value="Commercial Bank of Ceylon">Commercial Bank of Ceylon</option>
                  <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
                  <option value="People's Bank">People&apos;s Bank</option>
                  <option value="Hatton National Bank (HNB)">Hatton National Bank (HNB)</option>
                  <option value="Sampath Bank">Sampath Bank</option>
                  <option value="Seylan Bank">Seylan Bank</option>
                  <option value="Nations Trust Bank (NTB)">Nations Trust Bank (NTB)</option>
                  <option value="DFCC Bank">DFCC Bank</option>
                  <option value="National Development Bank (NDB)">National Development Bank (NDB)</option>
                  <option value="Pan Asia Bank">Pan Asia Bank</option>
                  <option value="Union Bank of Colombo">Union Bank of Colombo</option>
                  <option value="Standard Chartered Sri Lanka">Standard Chartered Sri Lanka</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Account Holder Legal Name (Matches NIC) *</label>
                <input
                  type="text"
                  required
                  value={bankModalState.data.bankAccountName}
                  onChange={(e) => setBankModalState({
                    ...bankModalState,
                    data: { ...bankModalState.data, bankAccountName: e.target.value }
                  })}
                  placeholder="e.g. Samantha Priyantha Perera"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-bold text-[#0d2b26] focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Account Number *</label>
                <input
                  type="text"
                  required
                  value={bankModalState.data.bankAccountNumber}
                  onChange={(e) => setBankModalState({
                    ...bankModalState,
                    data: { ...bankModalState.data, bankAccountNumber: e.target.value }
                  })}
                  placeholder="e.g. 8004561234"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-[#0d5c4d] focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={bankModalState.data.bankBranch}
                    onChange={(e) => setBankModalState({
                      ...bankModalState,
                      data: { ...bankModalState.data, bankBranch: e.target.value }
                    })}
                    placeholder="e.g. Havelock Town"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Branch Code</label>
                  <input
                    type="text"
                    value={bankModalState.data.bankBranchCode || ""}
                    onChange={(e) => setBankModalState({
                      ...bankModalState,
                      data: { ...bankModalState.data, bankBranchCode: e.target.value }
                    })}
                    placeholder="e.g. 042"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-[#0d5c4d]"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={bankModalState.data.isPrimary}
                    onChange={(e) => setBankModalState({
                      ...bankModalState,
                      data: { ...bankModalState.data, isPrimary: e.target.checked }
                    })}
                    className="h-4 w-4 rounded-md border-slate-300 text-[#0d5c4d] focus:ring-[#0d5c4d]"
                  />
                  <span>Set as primary direct deposit account for tuition subscriptions</span>
                </label>
              </div>

              <div className="pt-3 pb-6 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBankModalState({ ...bankModalState, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  {bankModalState.mode === "add" ? "Register Bank Account" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. SOCIAL CHANNEL MODAL (Add & Edit)                                 */}
      {/* =================================================================== */}
      {socialModalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0d2b26]">
                    {socialModalState.mode === "add" ? "Connect Social Channel" : "Edit Social Channel"}
                  </h3>
                  <p className="text-xs text-slate-500">Provide direct links for students to follow your content.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSocialModalState({ ...socialModalState, isOpen: false })}
                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveSocialChannel(socialModalState.data);
              }}
              className="px-6 space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Platform *</label>
                <select
                  value={socialModalState.data.platform}
                  onChange={(e) => {
                    const platform = e.target.value;
                    let title = socialModalState.data.title;
                    if (!title) {
                      if (platform === "youtube") title = "YouTube Lecture Channel";
                      else if (platform === "telegram") title = "Telegram Discussion Group";
                      else if (platform === "whatsapp") title = "WhatsApp Helpline";
                      else if (platform === "tiktok") title = "TikTok Educational Clips";
                      else if (platform === "facebook") title = "Official Facebook Page";
                      else if (platform === "linkedin") title = "Professional Profile";
                    }
                    setSocialModalState({
                      ...socialModalState,
                      data: { ...socialModalState.data, platform, title }
                    });
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0d5c4d] bg-white"
                >
                  <option value="youtube">YouTube</option>
                  <option value="telegram">Telegram</option>
                  <option value="whatsapp">WhatsApp Hotline</option>
                  <option value="tiktok">TikTok</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="discord">Discord</option>
                  <option value="website">Custom Website</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Display Title *</label>
                <input
                  type="text"
                  required
                  value={socialModalState.data.title}
                  onChange={(e) => setSocialModalState({
                    ...socialModalState,
                    data: { ...socialModalState.data, title: e.target.value }
                  })}
                  placeholder="e.g. Combined Mathematics 2026 YouTube"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-bold text-[#0d2b26] focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {socialModalState.data.platform === "whatsapp" ? "WhatsApp Number (with country code) *" : "Channel or Profile URL *"}
                </label>
                <input
                  type={socialModalState.data.platform === "whatsapp" ? "text" : "url"}
                  required
                  value={socialModalState.data.url}
                  onChange={(e) => setSocialModalState({
                    ...socialModalState,
                    data: { ...socialModalState.data, url: e.target.value }
                  })}
                  placeholder={
                    socialModalState.data.platform === "whatsapp"
                      ? "+94 77 123 4567"
                      : "https://youtube.com/@Channel"
                  }
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div className="pt-3 pb-6 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSocialModalState({ ...socialModalState, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  {socialModalState.mode === "add" ? "Connect Channel" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. COVER BANNER MODAL (Presets & Custom URL)                         */}
      {/* =================================================================== */}
      {coverModalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center font-bold">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0d2b26]">Change Studio Cover Banner</h3>
                  <p className="text-xs text-slate-500">Select a curated theme preset or paste a custom banner image link.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCoverModalState({ ...coverModalState, isOpen: false })}
                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Curated Educational Presets</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      title: "Digital Tech Studio",
                      url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80"
                    },
                    {
                      title: "University Hall",
                      url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80"
                    },
                    {
                      title: "Mathematics Chalkboard",
                      url: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=1200&auto=format&fit=crop&q=80"
                    },
                    {
                      title: "Emerald Studio Abstract",
                      url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80"
                    }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverModalState({ ...coverModalState, url: preset.url })}
                      className={`relative h-20 rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer group ${
                        coverModalState.url === preset.url ? "border-[#0d5c4d] ring-2 ring-[#0d5c4d]/20" : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <img src={preset.url} alt={preset.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-2 text-white text-[11px] font-bold">
                        <span>{preset.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Or Paste Custom Image URL</label>
                <input
                  type="url"
                  value={coverModalState.url}
                  onChange={(e) => setCoverModalState({ ...coverModalState, url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div className="pt-3 pb-6 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCoverModalState({ ...coverModalState, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => saveCoverImage(coverModalState.url)}
                  disabled={!coverModalState.url}
                  className="px-5 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Apply Cover Banner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
