"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  GraduationCap,
  School,
  Shield,
  BookOpen,
  CheckCircle2,
  FileText,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
  Check,
  Lock,
  Mail,
  User as UserIcon,
  Building2,
  Eye,
  EyeOff,
  Trophy,
  Calendar,
  Globe,
  LogIn,
  UserPlus,
  X,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Users,
  Layers,
  Settings,
  Award,
  Phone,
  Heart,
  ChevronRight,
  BarChart3,
  CreditCard,
  QrCode,
  Send
} from "lucide-react";

type SupportedRole = "student" | "parent" | "teacher" | "admin";
type AuthDisplayMode = "closed" | "drawer" | "fullpage";
export type PortalType = "gateway" | "student" | "parent" | "staff";

const BANNER_SLIDES = [
  {
    image: "/images/school_banner_1.jpg",
    alt: "Interactive Tuition Classroom - Evolve Beyond",
    caption: "Smart Interactive Tuition Classes & Dedicated Tutors"
  },
  {
    image: "/images/school_banner_2.jpg",
    alt: "Science Practical & Guided Discussions - Evolve Beyond",
    caption: "Interactive Science Practical & Guided Model Paper Discussions"
  },
  {
    image: "/images/school_banner_3.jpg",
    alt: "Revision Batches & Study Library - Evolve Beyond",
    caption: "Trilingual Revision Batches & Past Exam Library"
  },
  {
    image: "/images/student_banner_evolve.jpg",
    alt: "Sri Lankan Students Campus Learning - Evolve Beyond",
    caption: "Holistic Academics, Sports Championships & Leadership"
  }
];

export function LandingView({
  onEnterApp,
  initialPortal
}: {
  onEnterApp: () => void;
  initialPortal?: PortalType;
}) {
  const { setCurrentRole, addToast, schools, t, landingPortal, setLandingPortal } = useApp();

  // Auto-rotate the student banner image every 3.5 seconds
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Sync initialPortal prop if explicitly passed (e.g. from direct URL routes)
  React.useEffect(() => {
    if (initialPortal) {
      setLandingPortal(initialPortal);
    }
  }, [initialPortal, setLandingPortal]);

  const portalType = landingPortal;

  // Auth Display Mode: "closed", "drawer" (slide in from side), or "fullpage" (dedicated new page)
  const [authMode, setAuthMode] = useState<AuthDisplayMode>("closed");
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [selectedRole, setSelectedRole] = useState<SupportedRole>("student");
  const [gatewayTab, setGatewayTab] = useState<"student" | "parent" | "staff">("student");

  // Sign In Form State (Empty by default for a clean, generic portal)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);


  // Sign Up Form State
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Sri Lankan Parent-Specific Sign In & Registration States
  const [parentLoginMethod, setParentLoginMethod] = useState<"password" | "otp">("password");
  const [parentOtpSent, setParentOtpSent] = useState(false);
  const [parentOtpCode, setParentOtpCode] = useState("");

  const [parentTitle, setParentTitle] = useState("Mrs.");
  const [parentRelation, setParentRelation] = useState("Mother");
  const [parentPhone, setParentPhone] = useState("");
  const [parentNic, setParentNic] = useState("");
  const [childName, setChildName] = useState("");
  const [childPhoneOrId, setChildPhoneOrId] = useState("");
  const [childBatch, setChildBatch] = useState("2026 A/L Theory (English / Tamil)");
  const [parentConsent, setParentConsent] = useState(true);

  // Pre-fill credentials based on role (Tutor Platform)
  const rolePresetCredentials = {
    student: {
      name: "Sathurjan K.",
      email: "student@soloclass.lk",
      detail: "2026 A/L Combined Maths",
      school: "Apex Science Academy"
    },
    parent: {
      name: "Mrs. Priyadarshani Kulatunga",
      email: "parent@soloclass.lk",
      detail: "Parent of Sathurjan K. (Fee & Attendance)",
      school: "Apex Science Academy"
    },
    teacher: {
      name: "Dr. K. Arulnesan",
      email: "tutor@soloclass.lk",
      detail: "Master Tutor & Course Creator",
      school: "Apex Science Academy"
    },
    admin: {
      name: "Class Operations Admin",
      email: "admin@soloclass.lk",
      detail: "Tuition Desk Administration",
      school: "Apex Science Academy"
    }
  };

  const handleRoleSelect = (role: SupportedRole) => {
    setSelectedRole(role);
  };

  const openAuth = (tab: "login" | "signup", role: SupportedRole = "student", mode: "drawer" | "fullpage" = "drawer") => {
    setAuthTab(tab);
    handleRoleSelect(role);
    setAuthMode(mode);
  };

  const handlePortalSwitch = (type: PortalType) => {
    setLandingPortal(type);
    if (type === "student") {
      handleRoleSelect("student");
    } else if (type === "parent") {
      handleRoleSelect("parent");
    } else if (type === "staff") {
      handleRoleSelect("teacher");
    }
  };

  const handle1ClickDemoLogin = (role: SupportedRole) => {
    setCurrentRole(role);
    setAuthMode("closed");
    addToast({
      type: "success",
      title: `Signed in as ${role === "student" ? "Student" : role === "parent" ? "Parent" : "Tutor"}`,
      message: `Welcome back, ${rolePresetCredentials[role].name}!`
    });
    onEnterApp();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRole === "parent" && parentLoginMethod === "otp" && !parentOtpSent) {
      if (!loginEmail.trim()) {
        addToast({
          type: "error",
          title: "Mobile Number Required",
          message: "Please enter your registered mobile number to receive your SMS OTP."
        });
        return;
      }
      setParentOtpSent(true);
      addToast({
        type: "success",
        title: "SMS OTP Dispatched",
        message: `A 6-digit verification code has been sent via SMS to ${loginEmail}.`
      });
      return;
    }

    setCurrentRole(selectedRole);
    setAuthMode("closed");
    addToast({
      type: "success",
      title: "Login Successful",
      message: selectedRole === "parent"
        ? "Welcome to Parent Guardian Desk! Live attendance and fee receipts loaded."
        : selectedRole === "teacher"
        ? "Welcome to Tutor Cockpit! Course creator desk loaded."
        : "Welcome back to LimaT Smart Book! Learning feed loaded."
    });
    onEnterApp();
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword && signupConfirmPassword && signupPassword !== signupConfirmPassword) {
      addToast({
        type: "error",
        title: "Password Mismatch",
        message: "The passwords entered do not match. Please re-enter."
      });
      return;
    }

    // Role-based Registration Enforcement
    if (selectedRole === "parent") {
      if (!signupName.trim() || !parentPhone.trim() || !childName.trim() || !childPhoneOrId.trim()) {
        addToast({
          type: "error",
          title: "Missing Required Details",
          message: "Please fill in Guardian Name, Mobile Number, Student Full Name, and Student WhatsApp/ID."
        });
        return;
      }
      if (!parentConsent) {
        addToast({
          type: "error",
          title: "Guardian Verification Required",
          message: "Please confirm that you are the legal parent or guardian to monitor tuition records."
        });
        return;
      }
      setCurrentRole("parent");
      setAuthMode("closed");
      addToast({
        type: "success",
        title: "Guardian Account Registered!",
        message: `Welcome, ${parentTitle} ${signupName}! Account successfully linked with ${childName}.`
      });
      onEnterApp();
      return;
    }

    setCurrentRole(selectedRole);
    setAuthMode("closed");
    addToast({
      type: "success",
      title: "Account Created Successfully!",
      message: `Welcome, ${signupName || rolePresetCredentials[selectedRole].name}! Your ${selectedRole === "student" ? "Student" : selectedRole === "teacher" ? "Tutor" : selectedRole} profile has been initialized.`
    });
    onEnterApp();
  };

  // =========================================================================
  // REUSABLE AUTH FORM COMPONENT (Dedicated per role: Student vs Parent vs Tutor)
  // =========================================================================
  const renderAuthContent = () => (
    <div className="space-y-4">
      {/* Active Role Dedicated Badge Header (Hidden on Parent Registration) */}
      {!(selectedRole === "parent" && authTab === "signup") && (
        <div className={`p-3 rounded-2xl flex items-center justify-between border ${
          selectedRole === "student"
            ? "bg-[#ecf8f5] border-[#c4e9e0] text-[#0d5c4d]"
            : selectedRole === "parent"
            ? "bg-[#f0f5fa] border-[#cbdfe8] text-[#1e3a5f]"
            : "bg-[#fef7e6] border-[#fde4af] text-[#b47a16]"
        }`}>
          <div className="flex items-center gap-2">
            {selectedRole === "student" ? (
              <GraduationCap className="h-4 w-4" />
            ) : selectedRole === "parent" ? (
              <Users className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="text-xs font-black uppercase tracking-wider">
              {selectedRole === "student"
                ? "Student Portal"
                : selectedRole === "parent"
                ? "Parent & Guardian Portal"
                : "Tutor Cockpit"}
            </span>
          </div>
          <span className="text-[10px] font-bold opacity-75">
            {selectedRole === "student" ? "Direct Enrollment" : selectedRole === "parent" ? "Fee & Attendance" : "Course Creator"}
          </span>
        </div>
      )}

      {/* Tab Switcher: Sign In vs Create Account */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 text-xs font-bold">
        <button
          type="button"
          onClick={() => setAuthTab("login")}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            authTab === "login"
              ? "bg-white text-[#0d2b26] shadow-xs font-black"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Sign In (Login)
        </button>
        <button
          type="button"
          onClick={() => setAuthTab("signup")}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            authTab === "signup"
              ? "bg-white text-[#0d2b26] shadow-xs font-black"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {selectedRole === "parent"
            ? "Register Guardian"
            : selectedRole === "teacher"
            ? "Register as Tutor"
            : "Create Account (Sign Up)"}
        </button>
      </div>


      {/* -------------------- SIGN IN TAB CONTENT -------------------- */}
      {authTab === "login" && (
        <div className="space-y-4 pt-1">
          {/* Parent Login Method Switcher */}
          {selectedRole === "parent" && (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setParentLoginMethod("password");
                  setParentOtpSent(false);
                }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  parentLoginMethod === "password"
                    ? "bg-white text-[#1e3a5f] shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Password Sign In
              </button>
              <button
                type="button"
                onClick={() => setParentLoginMethod("otp")}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  parentLoginMethod === "otp"
                    ? "bg-white text-[#1e3a5f] shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                SMS OTP Login
              </button>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-3">
            {/* If Parent chose SMS OTP Login */}
            {selectedRole === "parent" && parentLoginMethod === "otp" ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Registered Mobile Number (Sri Lanka) *
                  </label>
                  <div className="relative">
                    <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. 077 123 4567 or 071 987 6543"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 transition-all font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Enter the mobile phone registered with your child&apos;s tuition class.
                  </p>
                </div>

                {parentOtpSent ? (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Enter 6-Digit SMS Verification Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={parentOtpCode}
                      onChange={(e) => setParentOtpCode(e.target.value)}
                      placeholder="e.g. 849201"
                      className="w-full h-11 text-center font-mono text-base tracking-widest font-black rounded-xl bg-white border border-[#cfdeea] text-slate-900 focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/15"
                    />
                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span className="text-slate-500">Didn&apos;t receive code?</span>
                      <button
                        type="button"
                        onClick={() => {
                          addToast({
                            type: "info",
                            title: "SMS Re-dispatched",
                            message: `New OTP sent to ${loginEmail}.`
                          });
                        }}
                        className="font-bold text-[#1e3a5f] hover:underline cursor-pointer"
                      >
                        Resend SMS OTP
                      </button>
                    </div>
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>
                    {parentOtpSent ? "Verify Code & Sign In" : "Send SMS Verification OTP"}
                  </span>
                </button>
              </div>
            ) : (
              /* Standard Password Login (for Student, Parent, Tutor) */
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {selectedRole === "student"
                      ? "Student Mobile No or Email"
                      : selectedRole === "parent"
                      ? "Parent Mobile No or Email Address"
                      : "Tutor Email or Mobile Number"}
                  </label>
                  <div className="relative">
                    {selectedRole === "parent" ? (
                      <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    ) : (
                      <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    )}
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={
                        selectedRole === "student"
                          ? "e.g. 077 123 4567 or student@gmail.com"
                          : selectedRole === "parent"
                          ? "e.g. 077 123 4567 or parent@gmail.com"
                          : "e.g. tutor@soloclass.lk or 077 987 6543"
                      }
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        addToast({
                          type: "info",
                          title: "Password Reset Code",
                          message: selectedRole === "parent"
                            ? "Use SMS OTP Login to sign in instantly, or enter your mobile to receive a reset code."
                            : "Enter your registered mobile number or email to receive a password reset OTP code."
                        });
                      }}
                      className="text-[11px] font-bold text-[#0d5c4d] hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full h-10 pl-9 pr-10 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#0d5c4d] focus:ring-0"
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className={`w-full text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-1 ${
                    selectedRole === "parent"
                      ? "bg-[#1e3a5f] hover:bg-[#152a45]"
                      : selectedRole === "teacher"
                      ? "bg-[#b47a16] hover:bg-[#96640f]"
                      : "bg-[#0d5c4d] hover:bg-[#083e34]"
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  <span>
                    Sign In to {selectedRole === "student" ? "Student Portal" : selectedRole === "parent" ? "Parent Portal" : "Tutor Cockpit"}
                  </span>
                </button>
              </>
            )}
          </form>
        </div>
      )}

      {/* -------------------- SIGN UP TAB CONTENT -------------------- */}
      {authTab === "signup" && (
        <form onSubmit={handleSignupSubmit} className="space-y-4 pt-1">
          {/* SPECIALIZED PARENT REGISTRATION FORM */}
          {selectedRole === "parent" ? (
            <div className="space-y-4">
              {/* SECTION 1: GUARDIAN PERSONAL DETAILS */}
              <div className="space-y-3 pt-1">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#1e3a5f]" />
                  <span>1. Guardian Information</span>
                </p>

                {/* Title + Full Name as single unified row */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Guardian Full Name *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={parentTitle}
                      onChange={(e) => setParentTitle(e.target.value)}
                      className="w-24 h-10 px-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#1e3a5f] cursor-pointer shrink-0"
                    >
                      <option value="Mrs.">Mrs.</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Rev.">Rev.</option>
                    </select>
                    <div className="relative flex-1 min-w-0">
                      <UserIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. Priyadarshani Kulatunga"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Relationship & Mobile Phone (perfect 2-col alignment with single-line labels) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Relationship *
                    </label>
                    <select
                      value={parentRelation}
                      onChange={(e) => setParentRelation(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#1e3a5f] cursor-pointer"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Grandparent">Grandparent</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mobile No (WhatsApp) *
                    </label>
                    <div className="relative">
                      <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="e.g. 077 123 4567"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: STUDENT / CHILD TUITION RECORD LINKING */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-[#1e3a5f]" />
                  <span>2. Student Linking &amp; Verification</span>
                </p>

                {/* Child Full Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Child&apos;s Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="e.g. Sathurjan Kaveen"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e3a5f] font-medium"
                    />
                  </div>
                </div>

                {/* Student WhatsApp No / Student ID */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Student WhatsApp No / Student ID *
                  </label>
                  <div className="relative">
                    <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={childPhoneOrId}
                      onChange={(e) => setChildPhoneOrId(e.target.value)}
                      placeholder="e.g. 077 987 6543 or STU-2026-042"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-[#1e3a5f] font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: ACCOUNT SECURITY */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#1e3a5f]" />
                  <span>3. Account Security</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e3a5f] font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e3a5f] font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1 text-xs">
                  <label className="flex items-start gap-2 cursor-pointer text-slate-600 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={parentConsent}
                      onChange={(e) => setParentConsent(e.target.checked)}
                      className="rounded text-[#1e3a5f] focus:ring-0 mt-0.5"
                    />
                    <span className="text-[11px] leading-relaxed">
                      I verify that I am the legal parent or guardian to monitor tuition fee receipts and attendance.
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Complete Parent Registration & Link Student</span>
              </button>
            </div>
          ) : (
            /* STUDENT & TUTOR REGISTRATION FORM */
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {selectedRole === "teacher" ? "Tutor / Educator Full Name *" : "Student Full Name *"}
                </label>
                <div className="relative">
                  <UserIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder={selectedRole === "teacher" ? "e.g. Dr. K. Arulnesan" : "e.g. Sathurjan Kaveen"}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile Number (WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="e.g. 077 123 4567"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder={selectedRole === "teacher" ? "tutor@soloclass.lk" : "student@gmail.com"}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d]/10 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Create Password *
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-0.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded text-[#0d5c4d] focus:ring-0"
                  />
                  <span>I agree to the LimaT Terms & Privacy Policy</span>
                </label>
              </div>

              <button
                type="submit"
                className={`w-full text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-1 ${
                  selectedRole === "teacher"
                    ? "bg-[#b47a16] hover:bg-[#96640f]"
                    : "bg-[#0d5c4d] hover:bg-[#083e34]"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Account & Join as {selectedRole === "student" ? "Student" : "Tutor"}</span>
              </button>
            </>
          )}
        </form>
      )}
    </div>
  );

  // =========================================================================
  // VIEW MODE: DEDICATED FULL PAGE VIEW ("new page la varanum")
  // =========================================================================
  if (authMode === "fullpage") {
    return (
      <div className="min-h-screen bg-[#fbfcfb] text-[#0d2b26] flex flex-col justify-between selection:bg-[#0d5c4d] selection:text-white">
        {/* Full Page Navigation Header */}
        <header className="h-20 border-b border-[#e6ece8] bg-white px-6 sm:px-12 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#f3b738] flex items-center justify-center text-slate-950 font-black text-xl shadow-xs font-sans">
              L
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-[#0d2b26]">
                LimaT Smart Book
              </span>
              <p className="text-[9px] uppercase tracking-widest text-[#0d5c4d] font-black">
                {portalType === "student" ? "STUDENT & PARENT ACCESS" : "FACULTY & CAMPUS GOVERNANCE"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAuthMode("drawer")}
              className="text-xs font-bold text-slate-600 hover:text-[#0d5c4d] px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Switch to Side Drawer mode"
            >
              <Minimize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Side Drawer Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMode("closed")}
              className="text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl px-4 py-2 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </button>
          </div>
        </header>

        {/* Full Page Center Container */}
        <main className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-10 flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-5 hidden lg:block">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0] text-xs font-black">
                <span className="h-2 w-2 rounded-full bg-[#0d5c4d]" />
                <span>{selectedRole === "student" ? "Student Learning Portal" : selectedRole === "parent" ? "Parent & Guardian Desk" : "Tutor Cockpit"}</span>
              </div>

              <h2 className="text-3xl font-black text-[#0d2b26] leading-tight">
                {selectedRole === "student"
                  ? "Welcome to your digital tuition classroom."
                  : selectedRole === "parent"
                  ? "Monitor tuition fee receipts and attendance."
                  : "Empowering tutors & course creators."}
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                {selectedRole === "student"
                  ? "Study course units, download term past papers with marking schemes, complete timed quizzes, and check your rank."
                  : selectedRole === "parent"
                  ? "Upload monthly tuition fee slips, review attendance scan records, and monitor academic progress."
                  : "Publish interactive study notes, schedule online classes, track monthly tuition fee payments, and post instant batch announcements."}
              </p>

              <div className="p-4 rounded-2xl bg-white border border-[#e6ece8] shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#f3b738] text-slate-950 font-black flex items-center justify-center text-sm">
                    L
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#0d2b26]">Apex Science &amp; Maths Academy</h4>
                    <p className="text-[10px] text-slate-500">A/L Theory &amp; Revision Batches • Digital Classroom</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                  <Check className="h-3.5 w-3.5 text-[#0d5c4d]" />
                  <span>English • සිංහල • தமிழ் Mediums Supported</span>
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7">
              <div className="bg-white border-2 border-[#c4e9e0] rounded-3xl shadow-xl p-6 sm:p-8 space-y-5 max-w-lg mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-black text-[#0d2b26]">
                      {authTab === "login" ? "Sign In to LimaT" : "Create Account"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedRole === "student" ? "Student Learning Portal" : selectedRole === "parent" ? "Parent & Guardian Desk" : "Tutor Portal"}
                    </p>
                  </div>

                  <span className="h-9 w-9 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center font-bold">
                    {selectedRole === "student" ? <GraduationCap className="h-5 w-5" /> : selectedRole === "parent" ? <Users className="h-5 w-5" /> : <Sparkles className="h-5 w-5 text-[#b47a16]" />}
                  </span>
                </div>

                {renderAuthContent()}

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode("closed")}
                    className="text-xs font-bold text-slate-500 hover:text-[#0d5c4d] transition-colors"
                  >
                    ← Cancel and return to overview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#e6ece8] bg-white py-6 px-6 text-center text-xs text-slate-500">
          <p className="font-bold text-[#0d2b26]">LimaT Smart Book — LEARN · GROW · LEAD</p>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE: STANDARD LANDING PAGE (Student View OR Faculty/Admin View)
  // =========================================================================
  return (
    <div className={`${portalType === "gateway" ? "h-screen overflow-hidden" : "min-h-screen"} bg-[#fbfcfb] text-[#0d2b26] flex flex-col justify-between selection:bg-[#0d5c4d] selection:text-white`}>
      {/* ----------------- 0. GATEWAY PORTAL NAVIGATION ----------------- */}
      {portalType === "gateway" && (
        <nav className="h-14 sm:h-16 border-b border-[#e6ece8] bg-white/95 backdrop-blur-md px-3 sm:px-8 flex items-center justify-between sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-[#f3b738] flex items-center justify-center text-slate-950 font-black text-base sm:text-xl shadow-xs font-sans shrink-0">
              L
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-2xl tracking-tight text-[#0d2b26] truncate">
                  LimaT Smart Book
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0] text-[10px] font-extrabold shrink-0">
                  <Sparkles className="h-3 w-3 text-[#f3b738]" />
                  Portal Selection
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#0d5c4d] font-black hidden sm:block truncate">
                LEARN · GROW · LEAD • SRI LANKA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
              <Globe className="h-3.5 w-3.5 text-[#0d5c4d]" />
              Trilingual: EN • SI • TA
            </span>

            <button
              type="button"
              onClick={() => handlePortalSwitch("staff")}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Tutor Hub →</span>
            </button>
          </div>
        </nav>
      )}

      {/* ----------------- 1. STUDENT PORTAL NAVIGATION ----------------- */}
      {portalType === "student" && (
        <nav className="h-16 sm:h-20 border-b border-[#e6ece8] bg-white/95 backdrop-blur-md px-3 sm:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-[#f3b738] flex items-center justify-center text-slate-950 font-black text-base sm:text-xl shadow-xs font-sans shrink-0">
              L
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-2xl tracking-tight text-[#0d2b26] truncate">
                  LimaT Smart Book
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0] text-[10px] font-extrabold shrink-0">
                  <GraduationCap className="h-3 w-3" />
                  Student Portal
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#0d5c4d] font-black hidden sm:block truncate">
                LEARN · GROW · LEAD
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handlePortalSwitch("gateway")}
              className="text-xs font-bold text-slate-600 hover:text-[#0d5c4d] px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
              title="All Portals"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">All Portals</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth("login", "student", "drawer")}
              className="text-xs font-bold text-slate-700 hover:text-[#0d5c4d] px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 text-[#0d5c4d]" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth("signup", "student", "drawer")}
              className="text-xs font-black bg-[#0d5c4d] hover:bg-[#083e34] text-white rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2.5 transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span><span className="hidden sm:inline">Join as </span>Student</span>
            </button>
          </div>
        </nav>
      )}

      {/* ----------------- 2. PARENT PORTAL NAVIGATION ----------------- */}
      {portalType === "parent" && (
        <nav className="h-16 sm:h-20 border-b border-[#e6ece8] bg-white/95 backdrop-blur-md px-3 sm:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-[#082a24] flex items-center justify-center text-[#f3b738] font-black text-base sm:text-xl shadow-xs font-sans shrink-0">
              L
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-2xl tracking-tight text-[#0d2b26] truncate">
                  LimaT Smart Book
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0f5fa] text-[#1e3a5f] border border-[#cbdfe8] text-[10px] font-extrabold shrink-0">
                  <Users className="h-3 w-3 text-[#1e3a5f]" />
                  Parent Portal
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#1e3a5f] font-black hidden sm:block truncate">
                ACADEMIC TRACKING · REPORT CARDS · GUIDANCE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handlePortalSwitch("gateway")}
              className="text-xs font-bold text-slate-600 hover:text-[#1e3a5f] px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
              title="All Portals"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">All Portals</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth("login", "parent", "drawer")}
              className="text-xs font-bold text-slate-700 hover:text-[#1e3a5f] px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 text-[#1e3a5f]" />
              <span><span className="hidden sm:inline">Guardian </span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth("signup", "parent", "drawer")}
              className="text-xs font-black bg-[#1e3a5f] hover:bg-[#152a45] text-white rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2.5 transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span><span className="hidden sm:inline">Register </span>Guardian</span>
            </button>
          </div>
        </nav>
      )}

      {/* ----------------- 3. TUTOR / STAFF PORTAL NAVIGATION ----------------- */}
      {portalType === "staff" && (
        <nav className="h-16 sm:h-20 border-b border-[#e6ece8] bg-white/95 backdrop-blur-md px-3 sm:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-[#0d5c4d] flex items-center justify-center text-[#f3b738] font-black text-base sm:text-xl shadow-xs font-sans shrink-0">
              L
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-2xl tracking-tight text-[#0d2b26] truncate">
                  LimaT Smart Book
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fef8eb] text-[#b47a16] border border-[#fbd38d] text-[10px] font-extrabold shrink-0">
                  <Sparkles className="h-3 w-3 text-[#b47a16]" />
                  Tutor Cockpit
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#0d5c4d] font-black hidden sm:block truncate">
                AUTHOR · BROADCAST · ATTENDANCE · FEE MONITORING
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handlePortalSwitch("gateway")}
              className="text-xs font-bold text-slate-600 hover:text-[#0d5c4d] px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
              title="All Portals"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">All Portals</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth("login", "teacher", "drawer")}
              className="text-xs font-bold text-slate-700 hover:text-[#0d5c4d] px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 text-[#0d5c4d]" />
              <span>Tutor Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth("signup", "teacher", "drawer")}
              className="text-xs font-black bg-[#0d5c4d] hover:bg-[#083e34] text-white rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2.5 transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register as Tutor</span>
            </button>
          </div>
        </nav>
      )}

      {/* ========================================================================= */}
      {/* 0. MINIMALIST GATEWAY (Clean 2 Role Cards: Student & Parent)               */}
      {/* Active when portalType === "gateway"                                       */}
      {/* ========================================================================= */}
      {portalType === "gateway" && (
        <div className="relative flex-1 flex flex-col justify-between bg-gradient-to-b from-[#ebf8f4] via-[#ffffff] to-[#fef8eb] overflow-hidden">
          {/* Luminous Ambient Lighting Orbs */}
          <div className="absolute -top-20 -left-20 w-[450px] h-[450px] rounded-full bg-emerald-300/40 blur-3xl pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-[450px] h-[450px] rounded-full bg-[#38bdf8]/30 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-[#fde047]/40 blur-3xl pointer-events-none" />

          {/* Cheerful Background Doodles & Motifs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute top-6 left-8 text-amber-400 font-black text-xl animate-pulse">✦</div>
            <div className="absolute top-20 left-20 text-emerald-500/50 font-black text-sm">★</div>
            <div className="absolute top-8 right-12 text-amber-400 font-black text-xl">✦</div>
            <div className="absolute top-24 right-24 text-sky-400/50 font-black text-xs">●</div>
            <div className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-dashed border-emerald-400/25" />
            <div className="absolute top-1/2 right-4 -translate-y-1/2 w-14 h-14 rounded-full border-2 border-dashed border-amber-400/25" />
          </div>

          {/* Bottom Dual-Tone Wave Curves */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden leading-none z-0">
            <svg
              viewBox="0 0 1440 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-24 sm:h-32 lg:h-36"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C320,150 480,20 820,100 C1100,170 1300,70 1440,110 L1440,220 L0,220 Z"
                fill="#38bdf8"
                fillOpacity="0.4"
              />
              <path
                d="M0,100 C260,180 540,60 880,130 C1160,190 1340,90 1440,130 L1440,220 L0,220 Z"
                fill="#6ee7b7"
                fillOpacity="0.45"
              />
              <path
                d="M0,135 C300,70 640,190 980,100 C1220,40 1380,150 1440,120 L1440,220 L0,220 Z"
                fill="#fde047"
                fillOpacity="0.6"
              />
              <path
                d="M0,180 C360,140 720,210 1080,165 C1260,145 1380,195 1440,180 L1440,220 L0,220 Z"
                fill="#ffffff"
                fillOpacity="0.85"
              />
            </svg>
          </div>

          <main className="relative z-10 flex-1 flex flex-col justify-between px-3 sm:px-6 lg:px-8 py-2 sm:py-3 max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="text-center space-y-1 pt-0.5 sm:pt-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#0d2b26]">
                Welcome to <span className="text-[#0d5c4d]">LimaT Book!</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                Choose your role to get started
              </p>
            </div>

            {/* 3 Clean Role Cards: Student, Parent & Tutor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 lg:gap-6 my-1.5 sm:my-3 max-w-4xl lg:max-w-5xl mx-auto w-full items-stretch">
              {/* CARD 1: STUDENT */}
              <div className="group rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-emerald-100 hover:border-[#0d5c4d] shadow-sm hover:shadow-xl transition-all duration-300 p-3.5 sm:p-5 lg:p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
                {/* Brush-Splash Character Illustration */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 flex items-center justify-center">
                  <img
                    src="/images/student_brush_portrait.jpg"
                    alt="Student learning with LimaT Book"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Pill Button in our Emerald Theme (#0d5c4d) */}
                <button
                  type="button"
                  onClick={() => handlePortalSwitch("student")}
                  className="w-full max-w-xs bg-[#0d5c4d] hover:bg-[#083e34] text-white font-black text-sm sm:text-base py-2.5 sm:py-3 px-5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-1.5 group"
                >
                  <GraduationCap className="h-4 sm:h-5 w-4 sm:w-5" />
                  <span>Student</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Subtitle Caption */}
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-1 max-w-xs">
                  Learn anytime, anywhere, grow your future.
                </p>

                {/* Quick Direct Sign In / Register Links */}
                <div className="flex items-center gap-3 text-xs pt-1.5 font-semibold text-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      handlePortalSwitch("student");
                      openAuth("login", "student", "drawer");
                    }}
                    className="font-bold text-[#0d5c4d] hover:underline cursor-pointer"
                  >
                    Student Sign In →
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      handlePortalSwitch("student");
                      openAuth("signup", "student", "drawer");
                    }}
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* CARD 2: PARENT */}
              <div className="group rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-slate-200 hover:border-[#1e3a5f] shadow-sm hover:shadow-xl transition-all duration-300 p-3.5 sm:p-5 lg:p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
                {/* Brush-Splash Character Illustration */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 flex items-center justify-center">
                  <img
                    src="/images/parent_brush_portrait.jpg"
                    alt="Parent reviewing student progress on tablet"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Pill Button in our Slate Navy Theme (#1e3a5f) */}
                <button
                  type="button"
                  onClick={() => handlePortalSwitch("parent")}
                  className="w-full max-w-xs bg-[#1e3a5f] hover:bg-[#152a45] text-white font-black text-sm sm:text-base py-2.5 sm:py-3 px-5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-1.5 group"
                >
                  <Users className="h-4 sm:h-5 w-4 sm:w-5" />
                  <span>Parent</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Subtitle Caption */}
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-1 max-w-xs">
                  Support, monitor, be part of their journey.
                </p>

                {/* Quick Direct Sign In / Register Links */}
                <div className="flex items-center gap-3 text-xs pt-1.5 font-semibold text-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      handlePortalSwitch("parent");
                      openAuth("login", "parent", "drawer");
                    }}
                    className="font-bold text-[#1e3a5f] hover:underline cursor-pointer"
                  >
                    Guardian Sign In →
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      handlePortalSwitch("parent");
                      openAuth("signup", "parent", "drawer");
                    }}
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* CARD 3: TUTOR */}
              <div className="group rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-amber-100 hover:border-[#b47a16] shadow-sm hover:shadow-xl transition-all duration-300 p-3.5 sm:p-5 lg:p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
                {/* Teacher / Educator Character Illustration */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 flex items-center justify-center">
                  <img
                    src="/images/tutor_brush_portrait.jpg"
                    alt="Teacher and Tutor educator"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                  />
                </div>

                {/* Pill Button in Amber / Gold Theme */}
                <button
                  type="button"
                  onClick={() => handlePortalSwitch("staff")}
                  className="w-full max-w-xs bg-[#b47a16] hover:bg-[#8d5f10] text-white font-black text-sm sm:text-base py-2.5 sm:py-3 px-5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-1.5 group"
                >
                  <Sparkles className="h-4 sm:h-5 w-4 sm:w-5" />
                  <span>Tutor</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Subtitle Caption */}
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-1 max-w-xs">
                  Teach, broadcast notices, manage batches & fees.
                </p>

                {/* Quick Direct Sign In / Register Links */}
                <div className="flex items-center gap-3 text-xs pt-1.5 font-semibold text-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      handlePortalSwitch("staff");
                      openAuth("login", "teacher", "drawer");
                    }}
                    className="font-bold text-[#b47a16] hover:underline cursor-pointer"
                  >
                    Tutor Sign In →
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      handlePortalSwitch("staff");
                      openAuth("signup", "teacher", "drawer");
                    }}
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Playful Tagline */}
            <div className="flex flex-col items-center justify-center gap-0.5 pt-1 pb-1">
              <div className="flex items-center gap-2.5 text-amber-500 font-black text-xs sm:text-sm tracking-widest">
                <span>˗ˏˋ</span>
                <p className="font-extrabold text-xs text-slate-700 tracking-wide">
                  Together for a Smarter Tomorrow
                </p>
                <span>ˎˊ˗</span>
              </div>
            </div>

            {/* Discreet Footer Link for Faculty */}
            <div className="pb-1.5 pt-1 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] text-slate-500 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => openAuth("login", "teacher", "drawer")}
                className="font-bold text-slate-600 hover:text-[#0d5c4d] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Tutor or Course Creator? Access Tutor Cockpit →</span>
              </button>

              <span className="text-[10px] text-slate-400">
                Trilingual Medium: English • සිංහල • தமிழ்
              </span>
            </div>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STUDENT LANDING PAGE (Active when portalType === "student")           */}
      {/* ========================================================================= */}
      {portalType === "student" && (
        <main className="px-4 sm:px-8 lg:px-12 py-10 sm:py-16 max-w-7xl mx-auto w-full space-y-16">
          {/* Student Hero Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0] text-xs font-black shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-[#0d5c4d] animate-pulse" />
                <span>Student & Parent Portal • Sri Lankan Tuition & Academics</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0d2b26] leading-[1.15]">
                Learn, practice & excel <br className="hidden sm:inline" />
                <span className="text-[#0d5c4d]">in every term test.</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed">
                Study curriculum units, download past papers with marking schemes, submit assignments, take timed exams, and join sports championships.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full">
                <button
                  type="button"
                  onClick={() => openAuth("signup", "student", "drawer")}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-black text-sm px-6 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Join as Student</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => openAuth("login", "student", "drawer")}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Sign in to student account</span>
                </button>
              </div>

              {/* Student Features Bar */}
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-bold text-slate-600 pt-2">
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                  <span>G.C.E. O/L & A/L Past Papers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                  <span>Timed Online Exams</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                  <span>Sports Championship & Tournaments</span>
                </div>
              </div>
            </div>

            {/* Right Student Card (Generic Platform Overview) */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden border border-[#e6ece8] bg-white shadow-xl">
                <div className="bg-gradient-to-br from-[#0d5c4d] to-[#082a24] p-7 text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-[#f3b738]" />
                      <span>Student Academic Hub</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-[#f3b738]">Grades 6 — 13</span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white">Interactive Learning Desk</h3>
                    <p className="text-xs text-slate-200">National Curriculum • Model Paper Classes • Digital Classroom</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="p-2.5 rounded-xl bg-white/10 text-center">
                      <p className="text-base font-black text-white">All Streams</p>
                      <p className="text-[10px] text-slate-300">Sci / Art / Com / Tech</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/10 text-center">
                      <p className="text-base font-black text-[#f3b738]">100%</p>
                      <p className="text-[10px] text-slate-300">Syllabus Aligned</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/10 text-center">
                      <p className="text-base font-black text-emerald-300">Trilingual</p>
                      <p className="text-[10px] text-slate-300">Notes & Papers</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white space-y-3.5">
                  <p className="text-xs font-bold text-slate-700">Student Portal Capabilities:</p>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center shrink-0">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#0d2b26]">Lesson Notes & Past Papers</p>
                        <p className="text-[10px] text-slate-500">Downloadable PDFs, videos, and term revision guides</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#0d2b26]">Assignments & Online Quizzes</p>
                        <p className="text-[10px] text-slate-500">Submit homework and receive teacher feedback with marks</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openAuth("login", "student", "drawer")}
                      className="w-full bg-[#0d5c4d] hover:bg-[#0a483c] text-white font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Student Sign In</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openAuth("signup", "student", "drawer")}
                      className="w-full bg-[#ecf8f5] hover:bg-[#d8f1ea] text-[#0d5c4d] border border-[#c4e9e0] font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Register Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* EVOLVE BEYOND SHOWCASE BANNER & 5 QUICK ACCESS CARDS      */}
          {/* ========================================================= */}
          <section className="space-y-4">
            {/* Visual Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#031d28] via-[#083e47] to-[#0284c7] text-white shadow-2xl border border-cyan-400/20">
              {/* Dynamic Wave Background Accents */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-200 via-transparent to-transparent" />
              <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
              <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 items-center relative z-10 min-h-[260px] sm:min-h-[300px]">
                {/* Left Typography Block */}
                <div className="lg:col-span-5 p-6 sm:p-10 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-black text-cyan-200 tracking-wider uppercase">
                    <Sparkles className="h-3 w-3 text-[#f3b738]" />
                    <span>Tuition & Learning Hub</span>
                  </div>

                  <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none uppercase drop-shadow-md">
                    <span className="block text-sky-200">EVOLVE</span>
                    <span className="block text-white">BEYOND</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-cyan-100/90 font-medium max-w-sm leading-relaxed">
                    Unleash your academic brilliance. Interactive digital coursework, trilingual tuition lessons, and continuous exam preparation designed for Sri Lankan students.
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openAuth("login", "student", "drawer")}
                      className="px-5 py-2.5 rounded-xl bg-white text-[#083e47] hover:bg-cyan-50 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Explore Student Hub</span>
                      <ArrowRight className="h-3.5 w-3.5 text-cyan-600" />
                    </button>
                    <span className="text-[11px] font-semibold text-cyan-200/80">Grades 6 – 13</span>
                  </div>
                </div>

                {/* Right Students Photography (Auto-Rotating School Students Slideshow) */}
                <div className="lg:col-span-7 h-full flex items-end justify-center lg:justify-end relative pr-0 lg:pr-6 overflow-hidden">
                  <div className="relative w-full max-h-[340px] flex items-end justify-center">
                    <div className="relative w-full h-[240px] sm:h-[300px] rounded-2xl lg:rounded-l-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900">
                      {BANNER_SLIDES.map((slide, idx) => (
                        <img
                          key={idx}
                          src={slide.image}
                          alt={slide.alt}
                          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-in-out ${
                            idx === currentSlideIndex
                              ? "opacity-100 scale-100"
                              : "opacity-0 scale-105 pointer-events-none"
                          }`}
                        />
                      ))}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#031d28]/70 via-transparent to-transparent lg:hidden pointer-events-none" />

                      {/* Floating Caption & Dots */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-black/45 backdrop-blur-md text-[11px] text-white border border-white/15 pointer-events-auto">
                        <span className="truncate font-semibold text-cyan-200">
                          {BANNER_SLIDES[currentSlideIndex].caption}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {BANNER_SLIDES.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCurrentSlideIndex(idx)}
                              aria-label={`Go to slide ${idx + 1}`}
                              className={`h-2 rounded-full transition-all cursor-pointer ${
                                idx === currentSlideIndex
                                  ? "w-5 bg-cyan-400"
                                  : "w-2 bg-white/40 hover:bg-white/70"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Quick Access Cards (Direct Visual Links - Verified Local Images) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 pt-1">
              {/* Card 1: Student Help Desk */}
              <div
                onClick={() => {
                  addToast({
                    type: "info",
                    title: "Student Help Desk",
                    message: "Sign in to access academic counseling, query tickets, and teacher mentorship."
                  });
                  openAuth("login", "student", "drawer");
                }}
                className="group bg-white rounded-2xl p-3 border border-[#e6ece8] shadow-sm hover:shadow-xl hover:border-amber-400 -translate-y-0 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center flex flex-col items-center"
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2.5 relative bg-slate-100">
                  <img
                    src="/images/card_helpdesk.jpg"
                    alt="Student Help Desk"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-xs font-black text-amber-700 group-hover:text-amber-600 transition-colors">
                  Student Help Desk
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Advising & Support</p>
              </div>

              {/* Card 2: Student Service */}
              <div
                onClick={() => {
                  addToast({
                    type: "info",
                    title: "Student Service",
                    message: "Sign in to access your enrolled tuition batches, sports championship events, and exam schedules."
                  });
                  openAuth("login", "student", "drawer");
                }}
                className="group bg-white rounded-2xl p-3 border border-[#e6ece8] shadow-sm hover:shadow-xl hover:border-amber-400 -translate-y-0 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center flex flex-col items-center"
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2.5 relative bg-slate-100">
                  <img
                    src="/images/card_service.jpg"
                    alt="Student Service"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-xs font-black text-amber-700 group-hover:text-amber-600 transition-colors">
                  Student Service
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Batch & Student Support Desk</p>
              </div>

              {/* Card 3: Online Library */}
              <div
                onClick={() => {
                  addToast({
                    type: "info",
                    title: "Online Library",
                    message: "Access trilingual textbooks, unit notes, and digital study packs."
                  });
                  openAuth("login", "student", "drawer");
                }}
                className="group bg-white rounded-2xl p-3 border border-[#e6ece8] shadow-sm hover:shadow-xl hover:border-amber-400 -translate-y-0 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center flex flex-col items-center"
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2.5 relative bg-slate-100">
                  <img
                    src="/images/card_library.jpg"
                    alt="Online Library"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-xs font-black text-amber-700 group-hover:text-amber-600 transition-colors">
                  Online Library
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Digital Notes & Books</p>
              </div>

              {/* Card 4: Video Repository */}
              <div
                onClick={() => {
                  addToast({
                    type: "info",
                    title: "Video Repository",
                    message: "Watch recorded classroom video lessons and lab practical explanations."
                  });
                  openAuth("login", "student", "drawer");
                }}
                className="group bg-white rounded-2xl p-3 border border-[#e6ece8] shadow-sm hover:shadow-xl hover:border-amber-400 -translate-y-0 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center flex flex-col items-center"
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2.5 relative bg-slate-100">
                  <img
                    src="/images/card_video.jpg"
                    alt="Video Repository"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-xs font-black text-amber-700 group-hover:text-amber-600 transition-colors">
                  Video Repository
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Recorded Class Units</p>
              </div>

              {/* Card 5: Research Archive */}
              <div
                onClick={() => {
                  addToast({
                    type: "info",
                    title: "Research Archive",
                    message: "Official G.C.E O/L and A/L Past Examination Papers & Marking Schemes."
                  });
                  openAuth("login", "student", "drawer");
                }}
                className="group bg-white rounded-2xl p-3 border border-[#e6ece8] shadow-sm hover:shadow-xl hover:border-amber-400 -translate-y-0 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center flex flex-col items-center"
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2.5 relative bg-slate-100">
                  <img
                    src="/images/card_archive.jpg"
                    alt="Research Archive"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-xs font-black text-amber-700 group-hover:text-amber-600 transition-colors">
                  Research Archive
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Past Papers & Marking</p>
              </div>
            </div>
          </section>

          {/* Student Key Learning Highlights */}
          <section className="space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0d5c4d] bg-[#ecf8f5] px-3 py-1 rounded-full border border-[#c4e9e0]">
                Student Experience
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0d2b26] mt-2">
                Everything for Exam & Sports Success in One Place
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] hover:border-[#0d5c4d] transition-all space-y-3 shadow-2xs">
                <div className="h-10 w-10 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#0d2b26]">Structured Lessons</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Video units, downloadable PDF notes, and chapter summaries aligned with G.C.E. O/L, A/L & revision batches.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] hover:border-[#0d5c4d] transition-all space-y-3 shadow-2xs">
                <div className="h-10 w-10 rounded-xl bg-[#fef7e6] text-[#b47a16] flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#0d2b26]">Past Papers Library</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  National examination past papers and official marking schemes for G.C.E. O/L and A/L.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] hover:border-[#0d5c4d] transition-all space-y-3 shadow-2xs">
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#0d2b26]">Homework Submission</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload homework files easily and receive clear scores, written teacher feedback, and rubrics.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] hover:border-[#0d5c4d] transition-all space-y-3 shadow-2xs">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Trophy className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#0d2b26]">Sports & Championship</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Eezhagam championship fixtures, athletic registrations, cricket & football match schedules, and leaderboards.
                </p>
              </div>
            </div>
          </section>

        </main>
      )}

      {/* ========================================================================= */}
      {/* 2. PARENT LANDING PAGE (Active when portalType === "parent")              */}
      {/* ========================================================================= */}
      {portalType === "parent" && (
        <main className="px-4 sm:px-8 lg:px-12 py-10 sm:py-16 max-w-7xl mx-auto w-full space-y-16 animate-in fade-in duration-300">
          {/* Parent Hero Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f0f5fa] text-[#1e3a5f] border border-[#cbdfe8] text-xs font-black shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-[#1e3a5f] animate-pulse" />
                <span>Parent & Guardian Desk • Sri Lankan Tuition & Classes</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0d2b26] leading-[1.15]">
                Stay connected with your <br className="hidden sm:inline" />
                <span className="text-[#1e3a5f]">child&apos;s daily learning.</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed">
                Track class attendance, examine test rankings, chat with tutors, review homework completion, and upload monthly tuition payment slips.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full">
                <button
                  type="button"
                  onClick={() => openAuth("login", "parent", "drawer")}
                  className="bg-[#1e3a5f] hover:bg-[#152a45] text-white font-black text-sm px-6 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Guardian Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuth("signup", "parent", "drawer")}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <UserPlus className="h-4 w-4 text-[#1e3a5f]" />
                  <span>Register Parent Account</span>
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-bold text-slate-600 pt-2">
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#1e3a5f] shrink-0" />
                  <span>Daily SMS Attendance Alerts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#1e3a5f] shrink-0" />
                  <span>Verified Term Report Cards</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#1e3a5f] shrink-0" />
                  <span>Direct Tutor Consultations</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Live Parent Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-gradient-to-b from-[#0f243a] via-[#0c1c2e] to-[#071320] p-6 sm:p-7 text-white shadow-2xl border border-[#1e3a5f]/40 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-[#1e3a5f]/40 border border-[#335d8a]/40 text-[#f3b738] flex items-center justify-center font-black text-sm">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-white">Parent &amp; Guardian Portal</h3>
                      <p className="text-[11px] text-[#9bbddf]">Connected Student Profile • Grades 1–13</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                    Active Portal
                  </span>
                </div>

                {/* Quick Metric Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Term Attendance</p>
                    <p className="text-xl font-black text-emerald-400">98.4%</p>
                    <p className="text-[10px] text-slate-400">Daily class entry check-in</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Academic Standing</p>
                    <p className="text-xl font-black text-[#7ba9d6]">Honor Roll</p>
                    <p className="text-[10px] text-slate-400">Monthly test &amp; paper class ranking</p>
                  </div>
                </div>

                {/* Teacher Remark Snippet */}
                <div className="p-4 rounded-2xl bg-[#0b1c2d]/80 border border-[#244b72]/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#9bbddf] flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[#7ba9d6]" />
                      Direct Tutor Feedback &amp; Reports
                    </span>
                    <span className="text-[10px] text-slate-400">Official Desk</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    &quot;Review continuous homework submissions, verified term test grades, and real-time remarks directly from course tutors.&quot;
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold">— Tutors &amp; Academy Administration</p>
                </div>

                <button
                  type="button"
                  onClick={() => openAuth("login", "parent", "drawer")}
                  className="w-full bg-[#1e3a5f] hover:bg-[#284a73] text-white font-black text-xs py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Guardian Sign In</span>
                </button>
              </div>
            </div>
          </section>

          {/* 4 Feature Pillars for Parents */}
          <section className="space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1e3a5f] bg-[#f0f5fa] px-3 py-1 rounded-full border border-[#cbdfe8]">
                Guardian Features
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0d2b26] mt-2">
                Designed for Sri Lankan Parents & Guardians
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] hover:border-[#1e3a5f] transition-all space-y-3 shadow-2xs">
                <div className="h-10 w-10 rounded-xl bg-[#f0f5fa] text-[#1e3a5f] flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#0d2b26]">Attendance & Leave</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Real-time class entry check-in status, official leave request submissions, and monthly attendance reports.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] hover:border-[#1e3a5f] transition-all space-y-3 shadow-2xs">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#0d2b26]">Term Report Cards</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Download certified term examination report cards with subject rankings, tutor remarks, and grade trends.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] hover:border-[#1e3a5f] transition-all space-y-3 shadow-2xs">
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#0d2b26]">Tutor Communications</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Secure two-way messaging with course tutors and sports coaches to monitor academic and athletic progress.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] hover:border-[#1e3a5f] transition-all space-y-3 shadow-2xs">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#0d2b26]">Fee Receipts & Slips</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload bank deposit slips or pay tuition fees online with verified digital receipt tracking.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Return to Splitter */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => handlePortalSwitch("gateway")}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to All Portals</span>
            </button>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 3. TUTOR LANDING PAGE (Active when portalType === "staff")                */}
      {/* ========================================================================= */}
      {portalType === "staff" && (
        <main className="px-4 sm:px-8 lg:px-12 py-10 sm:py-16 max-w-7xl mx-auto w-full space-y-16 animate-in fade-in duration-300">
          {/* Tutor Hero Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fef8eb] text-[#b47a16] border border-[#fbd38d] text-xs font-black shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-[#b47a16] animate-pulse" />
                <span>Tutor Command Center • Independent Educators</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0d2b26] leading-[1.15]">
                Lead your private tuition <br className="hidden sm:inline" />
                <span className="text-[#0d5c4d]">with total autonomy.</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed">
                Everything an independent tuition master needs: publish courses, broadcast announcements directly to students&apos; learning feeds, run timed quizzes, verify bank fee slips, and monitor live attendance.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full">
                <button
                  type="button"
                  onClick={() => handle1ClickDemoLogin("teacher")}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-black text-sm px-6 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <Sparkles className="h-4 w-4 text-[#f3b738]" />
                  <span>Launch Tutor Cockpit</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => openAuth("signup", "teacher", "drawer")}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <UserPlus className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Register New Tutor Account</span>
                </button>
              </div>

              {/* Tutor Features Bar */}
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-bold text-slate-600 pt-2">
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                  <span>Interactive Learning Feed Broadcaster</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                  <span>Automated Quiz & MCQ Grading</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#0d5c4d] shrink-0" />
                  <span>Bank Slip Verification & Fee Receipts</span>
                </div>
              </div>
            </div>

            {/* Right Tutor Card (Cockpit Interactive Preview) */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden border border-[#e6ece8] bg-white shadow-xl">
                <div className="bg-gradient-to-br from-[#082a24] via-[#0d5c4d] to-[#14473e] p-7 text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#f3b738]" />
                      <span>Tutor Cockpit</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-[#f3b738]">Live Dashboard</span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white">Dr. K. Arulnesan</h3>
                    <p className="text-xs text-emerald-200">A/L Combined Mathematics & Physics Specialist</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="p-2.5 rounded-xl bg-white/10 text-center">
                      <p className="text-base font-black text-white">480+</p>
                      <p className="text-[10px] text-slate-300">Enrolled Students</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/10 text-center">
                      <p className="text-base font-black text-[#f3b738]">94%</p>
                      <p className="text-[10px] text-slate-300">Fee Settled</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/10 text-center">
                      <p className="text-base font-black text-emerald-300">98.4%</p>
                      <p className="text-[10px] text-slate-300">Attendance</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white space-y-3.5">
                  <p className="text-xs font-bold text-slate-700">Educator Workspace Modules:</p>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[#fef8eb] text-[#b47a16] flex items-center justify-center shrink-0">
                        <Send className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#0d2b26]">Direct Learning Feed Broadcaster</p>
                        <p className="text-[10px] text-slate-500">Post announcements, notices, zoom links, & study tips directly to student feeds</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center shrink-0">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#0d2b26]">Syllabus & Video Lesson Studio</p>
                        <p className="text-[10px] text-slate-500">Curate lessons, PDF handouts, past exam papers, and video lectures</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8] flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[#f0f5fa] text-[#1e3a5f] flex items-center justify-center shrink-0">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#0d2b26]">Fee Slip Verification & QR Tracking</p>
                        <p className="text-[10px] text-slate-500">Approve tuition bank deposits and track classroom attendance with instant SMS</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handle1ClickDemoLogin("teacher")}
                    className="w-full bg-[#f8faf9] hover:bg-[#ecf8f5] border border-slate-200 hover:border-[#0d5c4d] text-[#0d5c4d] font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <span>Enter Tutor Workspace Demo</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Tutor Core Capabilities Grid */}
          <section className="space-y-8 pt-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0d2b26] tracking-tight">
                Designed Exclusively for Independent Educators
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Replace fragmented WhatsApp groups, paper receipt books, and scattered drive links with a unified, professional tuition academy system.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] hover:border-[#0d5c4d] shadow-2xs hover:shadow-md transition-all space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
                  <Send className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#0d2b26]">Live Student Noticeboard</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Post high-priority announcements, homework tasks, and class notices with edit, pin, and delete controls directly visible to all students.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] hover:border-[#0d5c4d] shadow-2xs hover:shadow-md transition-all space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#fef8eb] text-[#b47a16] flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#0d2b26]">Course & Lesson Studio</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Organize theory, revision, and paper class materials into Units and Topics with downloadable PDFs, video tutorials, and past papers.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] hover:border-[#0d5c4d] shadow-2xs hover:shadow-md transition-all space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#f0f5fa] text-[#1e3a5f] flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#0d2b26]">Online Quizzes & Ranking</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Build timed MCQ practice tests with automated mark calculation, answer reviews, and batch leaderboard standings.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] hover:border-[#0d5c4d] shadow-2xs hover:shadow-md transition-all space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#0d2b26]">Tuition Fee Reconciliation</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Review student/parent bank deposit slips with 1-click approvals, digital payment receipts, and real-time payment status lists.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] hover:border-[#0d5c4d] shadow-2xs hover:shadow-md transition-all space-y-3">
                <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <QrCode className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#0d2b26]">Smart QR Attendance</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Scan student IDs or mark attendance in seconds. Parents receive instant notification that their child has checked into class.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-2xl bg-white border border-[#e6ece8] hover:border-[#0d5c4d] shadow-2xs hover:shadow-md transition-all space-y-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#0d2b26]">Student Performance Insights</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Spot students falling behind early with clear charts on assignment completion, quiz averages, and class consistency.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Return to Splitter */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => handlePortalSwitch("gateway")}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Portal Selection</span>
            </button>
          </div>
        </main>
      )}

      {/* Footer - only shown on Portal landing pages, Gateway has its own compact footer */}
      {portalType !== "gateway" && (
        <footer className="border-t border-[#e6ece8] bg-white py-10 px-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#f3b738] flex items-center justify-center text-slate-950 font-black text-base">
                L
              </div>
              <div className="text-left">
                <p className="font-black text-[#0d2b26]">LimaT Smart Book</p>
                <p className="text-[10px] text-[#0d5c4d] font-bold">LEARN · GROW · LEAD</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => handlePortalSwitch("gateway")}
                className="hover:text-[#0d5c4d] cursor-pointer"
              >
                All Portals
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handlePortalSwitch("student")}
                className={`hover:text-[#0d5c4d] cursor-pointer ${portalType === "student" ? "text-[#0d5c4d] font-black underline" : ""}`}
              >
                Student Portal
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handlePortalSwitch("parent")}
                className={`hover:text-[#0d5c4d] cursor-pointer ${portalType === "parent" ? "text-[#0d5c4d] font-black underline" : ""}`}
              >
                Parent Portal
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handlePortalSwitch("staff")}
                className={`hover:text-[#0d5c4d] cursor-pointer ${portalType === "staff" ? "text-[#b47a16] font-black underline" : "text-[#b47a16] font-bold"}`}
              >
                Tutor Portal
              </button>
            </div>

            <p className="text-center sm:text-right text-[11px] text-slate-400">
              Sri Lanka Tutor Platform • Built for English, Sinhala, and Tamil.
            </p>
          </div>
        </footer>
      )}

      {/* ========================================================================= */}
      {/* RIGHT-SIDE SLIDE DRAWER ("site ala varanum")                             */}
      {/* ========================================================================= */}
      {authMode === "drawer" && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Subtle Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
            onClick={() => setAuthMode("closed")}
          />

          {/* Right Slide Panel */}
          <div className="relative w-full sm:w-[460px] md:w-[490px] h-full bg-white shadow-2xl z-50 flex flex-col border-l border-[#d6ede6] animate-in slide-in-from-right duration-300 ease-out">
            {/* Drawer Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-b from-[#f8fbf9] to-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#f3b738] flex items-center justify-center text-slate-950 font-black text-lg shadow-2xs font-sans">
                  L
                </div>
                <div>
                  <h3 className="font-black text-base text-[#0d2b26]">LimaT Smart Book</h3>
                  <p className="text-[10px] uppercase font-bold text-[#0d5c4d]">
                    {selectedRole === "parent"
                      ? "Parent & Guardian Desk"
                      : selectedRole === "student"
                      ? "Student Portal"
                      : "Tutor Cockpit"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Switch to Full Page button */}
                <button
                  type="button"
                  onClick={() => setAuthMode("fullpage")}
                  className="p-2 rounded-xl text-slate-500 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] transition-colors cursor-pointer"
                  title="Open as full dedicated page"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>

                {/* Close Drawer button */}
                <button
                  type="button"
                  onClick={() => setAuthMode("closed")}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {renderAuthContent()}
            </div>

            {/* Drawer Footer */}
            <div className="px-4 sm:px-6 py-3 bg-[#f8faf9] border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-[#0d5c4d]" />
                <span>Secure Tuition Platform</span>
              </span>
              <button
                type="button"
                onClick={() => setAuthMode("fullpage")}
                className="text-[11px] font-bold text-[#0d5c4d] hover:underline"
              >
                Expand full page →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
