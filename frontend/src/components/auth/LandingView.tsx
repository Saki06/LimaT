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
  Send
} from "lucide-react";
import { TozyAnimatedMascot } from "@/components/tozy";

type SupportedRole = "student" | "parent" | "teacher" | "admin" | "super_admin";
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
  const { setCurrentRole, addToast, schools, t, landingPortal, setLandingPortal, loginUser } = useApp();

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
  const rolePresetCredentials: Record<SupportedRole, { name: string; email: string; detail: string; school: string }> = {
    student: {
      name: "Sathurjan K.",
      email: "student@apex.edu",
      detail: "2026 A/L Combined Maths",
      school: "Apex Science Academy"
    },
    parent: {
      name: "Mrs. Priyadarshani Kulatunga",
      email: "parent@apex.edu",
      detail: "Parent of Sathurjan K. (Fee & Attendance)",
      school: "Apex Science Academy"
    },
    teacher: {
      name: "Dr. K. Arulnesan",
      email: "teacher@apex.edu",
      detail: "Master Tutor & Course Creator",
      school: "Apex Science Academy"
    },
    admin: {
      name: "Class Operations Admin",
      email: "admin@apex.edu",
      detail: "School Desk Administration",
      school: "Apex Science Academy"
    },
    super_admin: {
      name: "Platform Master Admin",
      email: "superadmin@apex.edu",
      detail: "Global Multi-Tenant SaaS Console",
      school: "Platform Root"
    }
  };

  const handleRoleSelect = (role: SupportedRole) => {
    setSelectedRole(role);
  };

  const openAuth = (tab: "login" | "signup", role: SupportedRole = "student", mode: "drawer" | "fullpage" = "drawer") => {
    setAuthTab(tab);
    handleRoleSelect(role);
    setAuthMode(mode);
    if (role === "admin") {
      setLoginEmail("admin@apex.edu");
      setLoginPassword("password123");
    } else if (role === "super_admin") {
      setLoginEmail("superadmin@apex.edu");
      setLoginPassword("password123");
    }
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
      title: `Signed in as ${
        role === "student"
          ? "Student"
          : role === "parent"
          ? "Parent"
          : role === "teacher"
          ? "Tutor"
          : role === "super_admin"
          ? "Super Admin"
          : "School Admin"
      }`,
      message: `Welcome back, ${rolePresetCredentials[role].name}!`
    });
    onEnterApp();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
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

    if (selectedRole === "parent" && parentLoginMethod === "otp" && parentOtpSent) {
      if (parentOtpCode.trim().length !== 6) {
        addToast({
          type: "error",
          title: "Invalid OTP Code",
          message: "Please enter the complete 6-digit SMS verification code."
        });
        return;
      }
      setCurrentRole("parent");
      setAuthMode("closed");
      addToast({
        type: "success",
        title: "Login Successful",
        message: "Welcome to Parent Guardian Desk! Live attendance and fee receipts loaded."
      });
      onEnterApp();
      return;
    }

    // Try real backend authentication
    try {
      const res = await loginUser(loginEmail.trim(), loginPassword);
      if (res.success) {
        setAuthMode("closed");
        onEnterApp();
        return;
      }
    } catch {
      // ignore
    }

    // Fallback role switch
    setCurrentRole(selectedRole);
    setAuthMode("closed");
    addToast({
      type: "success",
      title: "Login Successful",
      message:
        selectedRole === "parent"
          ? "Welcome to Parent Guardian Desk! Live attendance and fee receipts loaded."
          : selectedRole === "teacher"
          ? "Welcome to Tutor Cockpit! Course creator desk loaded."
          : selectedRole === "super_admin"
          ? "Welcome to Super Admin Console! Platform master controls loaded."
          : selectedRole === "admin"
          ? "Welcome to School Admin Operations Desk!"
          : "Welcome back to Newtoz! Shape Your Future!"
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
            : selectedRole === "admin"
            ? "bg-slate-100 border-slate-300 text-slate-800"
            : selectedRole === "super_admin"
            ? "bg-slate-900 border-amber-400/40 text-amber-300"
            : "bg-[#fef7e6] border-[#fde4af] text-[#b47a16]"
        }`}>
          <div className="flex items-center gap-2">
            {selectedRole === "student" ? (
              <GraduationCap className="h-4 w-4" />
            ) : selectedRole === "parent" ? (
              <Users className="h-4 w-4" />
            ) : selectedRole === "admin" ? (
              <Shield className="h-4 w-4 text-[#0d5c4d]" />
            ) : selectedRole === "super_admin" ? (
              <span className="text-sm">👑</span>
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="text-xs font-black uppercase tracking-wider">
              {selectedRole === "student"
                ? "Student Portal"
                : selectedRole === "parent"
                ? "Parent & Guardian Portal"
                : selectedRole === "admin"
                ? "School Admin Operations"
                : selectedRole === "super_admin"
                ? "Super Admin SaaS Console"
                : "Tutor Cockpit"}
            </span>
          </div>
          <span className="text-[10px] font-bold opacity-75">
            {selectedRole === "student"
              ? "Direct Enrollment"
              : selectedRole === "parent"
              ? "Fee & Attendance"
              : selectedRole === "admin"
              ? "Tuition Desk Administration"
              : selectedRole === "super_admin"
              ? "Master Platform Control"
              : "Course Creator"}
          </span>
        </div>
      )}

      {/* Tab Switcher: Sign In vs Create Account */}
      {selectedRole !== "admin" && selectedRole !== "super_admin" ? (
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
      ) : (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-amber-600" />
          <span>Restricted Administrative Access • Authorized Personnel Only</span>
        </div>
      )}


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
                      : selectedRole === "admin"
                      ? "School Admin Email Address"
                      : selectedRole === "super_admin"
                      ? "Super Admin Master Email"
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
                          ? "e.g. 077 123 4567 or student@apex.edu"
                          : selectedRole === "parent"
                          ? "e.g. 077 123 4567 or parent@apex.edu"
                          : selectedRole === "admin"
                          ? "e.g. admin@apex.edu"
                          : selectedRole === "super_admin"
                          ? "e.g. superadmin@apex.edu"
                          : "e.g. teacher@apex.edu or 077 987 6543"
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
                      : selectedRole === "admin"
                      ? "bg-slate-800 hover:bg-slate-900"
                      : selectedRole === "super_admin"
                      ? "bg-slate-900 hover:bg-black text-amber-300 border border-amber-400/40"
                      : "bg-[#0d5c4d] hover:bg-[#083e34]"
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  <span>
                    Sign In to{" "}
                    {selectedRole === "student"
                      ? "Student Portal"
                      : selectedRole === "parent"
                      ? "Parent Portal"
                      : selectedRole === "admin"
                      ? "School Admin Desk"
                      : selectedRole === "super_admin"
                      ? "Super Admin Console"
                      : "Tutor Cockpit"}
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
                  <span>I agree to the Newtoz Terms & Privacy Policy</span>
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
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-emerald-300 to-amber-300 p-0.5 shadow-sm shrink-0 ring-2 ring-emerald-500/20">
              <img
                src="/images/tozy_icon.jpg"
                alt="Tozy - Newtoz Mascot"
                className="w-full h-full object-cover rounded-[14px] bg-white"
              />
              <span className="absolute -top-1 -right-1 text-xs">🪽</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight text-[#0d2b26]">
                  Newtoz
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#0d5c4d] border border-emerald-200 text-[10px] font-extrabold">
                  newtoz.com
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#0d5c4d] font-black">
                Shape Your Future • Guided by Tozy 🐘
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
                      {authTab === "login" ? "Sign In to Newtoz" : "Create Newtoz Account"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedRole === "student" ? "Student Learning Portal • Shape Your Future" : selectedRole === "parent" ? "Parent & Guardian Desk" : "Tutor Portal"}
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
          <p className="font-bold text-[#0d2b26]">Newtoz • Shape Your Future — <span className="text-emerald-700">newtoz.com</span> (Guided by Tozy 🐘🪽)</p>
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
        <nav className="h-14 sm:h-16 border-b border-emerald-100/60 bg-[#ebf8f4]/85 backdrop-blur-md px-3 sm:px-8 flex items-center justify-between sticky top-0 z-40 shrink-0 transition-colors">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-emerald-300 to-amber-300 p-0.5 shadow-sm shrink-0 ring-2 ring-emerald-500/20">
              <img
                src="/images/tozy_icon.jpg"
                alt="Tozy - Newtoz Mascot"
                className="w-full h-full object-cover rounded-[14px] bg-white"
              />
              <span className="absolute -top-1 -right-1 text-xs">🪽</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-2xl tracking-tight text-[#0d2b26] truncate">
                  Newtoz
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0] text-[10px] font-extrabold shrink-0">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  newtoz.com
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#0d5c4d] font-black hidden sm:block truncate">
                Shape Your Future • Guided by Tozy 🐘
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-[#0d5c4d] text-xs font-bold border border-emerald-200">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Portal Selection</span>
            </span>
          </div>
        </nav>
      )}

      {/* ----------------- 1. STUDENT PORTAL NAVIGATION ----------------- */}
      {portalType === "student" && (
        <nav className="h-16 sm:h-20 border-b border-emerald-100/60 bg-[#ebf8f4]/85 backdrop-blur-md px-3 sm:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-emerald-300 to-amber-300 p-0.5 shadow-sm shrink-0 ring-2 ring-emerald-500/20">
              <img
                src="/images/tozy_icon.jpg"
                alt="Tozy - Newtoz Mascot"
                className="w-full h-full object-cover rounded-[14px] bg-white"
              />
              <span className="absolute -top-1 -right-1 text-xs">🪽</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-2xl tracking-tight text-[#0d2b26] truncate">
                  Newtoz
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 text-[#0d5c4d] border border-emerald-200/80 text-[10px] font-extrabold shrink-0 shadow-2xs">
                  <GraduationCap className="h-3 w-3" />
                  Student Portal
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#0d5c4d] font-black hidden sm:block truncate">
                Shape Your Future • Guided by Tozy 🐘
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handlePortalSwitch("gateway")}
              className="text-xs font-bold text-slate-600 hover:text-[#0d5c4d] px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-white/60 transition-colors flex items-center gap-1 cursor-pointer"
              title="All Portals"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">All Portals</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth("login", "student", "drawer")}
              className="text-xs font-bold text-slate-700 hover:text-[#0d5c4d] px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl hover:bg-white/60 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 text-[#0d5c4d]" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth("signup", "student", "drawer")}
              className="text-xs font-black bg-[#0d5c4d] hover:bg-[#083e34] text-white rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span><span className="hidden sm:inline">Join as </span>Student</span>
            </button>
          </div>
        </nav>
      )}

      {/* ----------------- 2. PARENT PORTAL NAVIGATION ----------------- */}
      {portalType === "parent" && (
        <nav className="h-16 sm:h-20 border-b border-sky-100/60 bg-[#f0f6fc]/85 backdrop-blur-md px-3 sm:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-300 to-amber-300 p-0.5 shadow-sm shrink-0 ring-2 ring-sky-500/20">
              <img
                src="/images/tozy_icon.jpg"
                alt="Tozy - Newtoz Mascot"
                className="w-full h-full object-cover rounded-[14px] bg-white"
              />
              <span className="absolute -top-1 -right-1 text-xs">🪽</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-2xl tracking-tight text-[#0d2b26] truncate">
                  Newtoz
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 text-[#1e3a5f] border border-sky-200/80 text-[10px] font-extrabold shrink-0 shadow-2xs">
                  <Users className="h-3 w-3 text-[#1e3a5f]" />
                  Parent Portal
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#1e3a5f] font-black hidden sm:block truncate">
                Shape Your Future • Guided by Tozy 🐘
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handlePortalSwitch("gateway")}
              className="text-xs font-bold text-slate-600 hover:text-[#1e3a5f] px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-white/60 transition-colors flex items-center gap-1 cursor-pointer"
              title="All Portals"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">All Portals</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth("login", "parent", "drawer")}
              className="text-xs font-bold text-slate-700 hover:text-[#1e3a5f] px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl hover:bg-white/60 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 text-[#1e3a5f]" />
              <span><span className="hidden sm:inline">Guardian </span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth("signup", "parent", "drawer")}
              className="text-xs font-black bg-[#1e3a5f] hover:bg-[#152a45] text-white rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span><span className="hidden sm:inline">Register </span>Guardian</span>
            </button>
          </div>
        </nav>
      )}

      {/* ----------------- 3. TUTOR / STAFF PORTAL NAVIGATION ----------------- */}
      {portalType === "staff" && (
        <nav className="h-16 sm:h-20 border-b border-amber-200/50 bg-[#fef8eb]/85 backdrop-blur-md px-3 sm:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-emerald-300 to-cyan-300 p-0.5 shadow-sm shrink-0 ring-2 ring-amber-500/20">
              <img
                src="/images/tozy_icon.jpg"
                alt="Tozy - Newtoz Mascot"
                className="w-full h-full object-cover rounded-[14px] bg-white"
              />
              <span className="absolute -top-1 -right-1 text-xs">🪽</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-2xl tracking-tight text-[#0d2b26] truncate">
                  Newtoz
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 text-[#b47a16] border border-amber-200/80 text-[10px] font-extrabold shrink-0 shadow-2xs">
                  <Sparkles className="h-3 w-3 text-[#b47a16]" />
                  Tutor Cockpit
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#0d5c4d] font-black hidden sm:block truncate">
                Shape Your Future • Guided by Tozy 🐘
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handlePortalSwitch("gateway")}
              className="text-xs font-bold text-slate-600 hover:text-[#0d5c4d] px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-white/60 transition-colors flex items-center gap-1 cursor-pointer"
              title="All Portals"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">All Portals</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth("login", "teacher", "drawer")}
              className="text-xs font-bold text-slate-700 hover:text-[#0d5c4d] px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl hover:bg-white/60 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 text-[#0d5c4d]" />
              <span>Tutor Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth("signup", "teacher", "drawer")}
              className="text-xs font-black bg-[#b47a16] hover:bg-[#8d5f10] text-white rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
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
            {/* Tozy Mascot & Welcome Header */}
            <div className="text-center space-y-1.5 pt-0.5 sm:pt-1 flex flex-col items-center">
              {/* Animated Floating Tozy Mascot with Wings and Speech */}
              <div className="relative mb-0.5">
                <TozyAnimatedMascot
                  size="md"
                  showSpeech={true}
                  speechText="Shape Your Future! Pick your portal below ✨"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#0d2b26]">
                  Welcome to <span className="bg-gradient-to-r from-[#0d5c4d] via-emerald-600 to-teal-700 bg-clip-text text-transparent">Newtoz!</span>
                </h1>
                <p className="text-xs sm:text-sm font-extrabold text-[#0d5c4d] tracking-wide mt-0.5 flex items-center justify-center gap-1.5">
                  <span className="text-amber-500">✨</span>
                  <span>Shape Your Future</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-bold">newtoz.com</span>
                  <span className="text-amber-500">✨</span>
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Your friendly learning journey guided by Tozy 🐘🪽
                </p>
              </div>
            </div>

            {/* 3 Clean Role Cards: Student, Parent & Tutor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 lg:gap-6 my-1.5 sm:my-3 max-w-4xl lg:max-w-5xl mx-auto w-full items-stretch">
              {/* CARD 1: STUDENT */}
              <div className="group rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-emerald-100 hover:border-[#0d5c4d] shadow-sm hover:shadow-xl transition-all duration-300 p-3.5 sm:p-5 lg:p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
                {/* Tozy Buddy Badge */}
                <div className="absolute top-2.5 right-2.5 bg-emerald-50 text-[#0d5c4d] text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1">
                  <span>🐘</span>
                  <span>Learn with Tozy</span>
                </div>

                {/* Brush-Splash Character Illustration */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 flex items-center justify-center mt-2">
                  <img
                    src="/images/student_brush_portrait.jpg"
                    alt="Student learning with Newtoz"
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
                  Shape your future, learn anytime, fly high!
                </p>
              </div>

              {/* CARD 2: PARENT */}
              <div className="group rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-slate-200 hover:border-[#1e3a5f] shadow-sm hover:shadow-xl transition-all duration-300 p-3.5 sm:p-5 lg:p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
                {/* Tozy Buddy Badge */}
                <div className="absolute top-2.5 right-2.5 bg-sky-50 text-[#1e3a5f] text-[10px] font-black px-2 py-0.5 rounded-full border border-sky-200/80 flex items-center gap-1">
                  <span>🐘</span>
                  <span>Guide with Tozy</span>
                </div>

                {/* Brush-Splash Character Illustration */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 flex items-center justify-center mt-2">
                  <img
                    src="/images/parent_brush_portrait.jpg"
                    alt="Parent reviewing student progress with Newtoz"
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
              </div>

              {/* CARD 3: TUTOR */}
              <div className="group rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-amber-100 hover:border-[#b47a16] shadow-sm hover:shadow-xl transition-all duration-300 p-3.5 sm:p-5 lg:p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
                {/* Tozy Buddy Badge */}
                <div className="absolute top-2.5 right-2.5 bg-amber-50 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200/80 flex items-center gap-1">
                  <span>🐘</span>
                  <span>Mentor with Tozy</span>
                </div>

                {/* Teacher / Educator Character Illustration */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 flex items-center justify-center mt-2">
                  <img
                    src="/images/tutor_brush_portrait.jpg"
                    alt="Teacher and Tutor educator with Newtoz"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                  />
                </div>

                {/* Pill Button in Amber / Gold Theme */}
                <button
                  type="button"
                  onClick={() => handlePortalSwitch("staff")}
                  className="w-full max-w-xs bg-[#b47a16] hover:bg-[#8d5f10] text-white font-black text-sm sm:text-base py-2.5 sm:py-3 px-5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-1.5 group"
                >
                  <BookOpen className="h-4 sm:h-5 w-4 sm:w-5" />
                  <span>Tutor</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Subtitle Caption */}
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-1 max-w-xs">
                  Teach, broadcast notices, manage batches & fees.
                </p>
              </div>
            </div>

            {/* Clean Minimal Bottom Footer with Admin Access */}
            <div className="pt-2 pb-1 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 border-t border-slate-200/50">
              <p className="font-bold text-[#0d5c4d] flex items-center gap-1.5">
                <span>Newtoz • Shape Your Future</span>
                <span className="text-slate-400">•</span>
                <span className="font-semibold text-slate-600">newtoz.com</span>
              </p>

              <div className="flex items-center gap-3 font-bold text-slate-600 text-[11px]">
                <button
                  type="button"
                  onClick={() => openAuth("login", "admin", "drawer")}
                  className="hover:text-[#0d5c4d] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Shield className="h-3.5 w-3.5 text-[#0d5c4d]" />
                  <span>Admin</span>
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => openAuth("login", "super_admin", "drawer")}
                  className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-1 text-slate-700"
                >
                  <span>👑</span>
                  <span>Super Admin</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STUDENT LANDING PAGE (Active when portalType === "student")           */}
      {/* Creative, Modern, Atmospheric & Attractive (Inheriting Gateway DNA)     */}
      {/* ========================================================================= */}
      {portalType === "student" && (
        <div className="relative flex-1 flex flex-col justify-between bg-gradient-to-b from-[#ebf8f4] via-[#ffffff] to-[#fef8eb] overflow-hidden">
          {/* Luminous Ambient Lighting Orbs (Same as Gateway) */}
          <div className="absolute -top-24 -left-20 w-[500px] h-[500px] rounded-full bg-emerald-300/35 blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full bg-[#38bdf8]/25 blur-3xl pointer-events-none" />
          <div className="absolute bottom-40 left-10 w-[450px] h-[450px] rounded-full bg-[#fde047]/35 blur-3xl pointer-events-none" />

          {/* Cheerful Background Doodles & Accents */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute top-8 left-10 text-amber-400 font-black text-2xl animate-pulse">✦</div>
            <div className="absolute top-28 left-32 text-emerald-500/50 font-black text-sm">★</div>
            <div className="absolute top-12 right-16 text-amber-400 font-black text-xl">✦</div>
            <div className="absolute top-36 right-36 text-sky-400/50 font-black text-sm">●</div>
            <div className="absolute top-1/3 left-6 w-14 h-14 rounded-full border-2 border-dashed border-emerald-400/25" />
            <div className="absolute top-2/3 right-8 w-16 h-16 rounded-full border-2 border-dashed border-amber-400/25" />
          </div>

          <div className="relative z-10 px-4 sm:px-8 lg:px-12 py-8 sm:py-12 max-w-7xl mx-auto w-full space-y-16">
            {/* HERO SECTION WITH IMMERSIVE MODERN CLASSROOM BACKDROP */}
            <section className="relative rounded-3xl sm:rounded-[36px] overflow-hidden border-2 border-emerald-100/80 shadow-lg min-h-[480px] lg:min-h-[540px] flex items-center">
              {/* Full Background Image: Real Sri Lankan Students */}
              <div className="absolute inset-0 z-0">
                <img
                  src="/images/student_card_hero.jpg"
                  alt="Sri Lankan Students Studying Collaboratively"
                  className="w-full h-full object-cover object-right sm:object-center"
                />
                {/* Modern Directional Gradient Overlay (ensures 100% text readability on left while showing students on right) */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#ebf8f4] via-[#ebf8f4]/95 sm:via-[#ebf8f4]/90 md:via-55% to-white/30 lg:to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#ebf8f4]/80 via-transparent to-transparent sm:hidden" />
              </div>

              {/* Foreground Content */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-14 w-full">
                {/* Left Column: Typography & CTAs (Crisp & High-Contrast) */}
                <div className="lg:col-span-7 space-y-6 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#0d5c4d] border border-emerald-200/80 text-xs font-black shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-[#0d5c4d] animate-pulse" />
                    <span>🎓 Student Learning Station • Sri Lankan Tuition &amp; Academics (Grades 1–13)</span>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0d2b26] leading-[1.12]">
                      Learn anytime, anywhere. <br />
                      <span className="text-[#0d5c4d] relative inline-block">
                        Grow your future.
                        <span className="absolute left-0 bottom-1.5 w-full h-3 bg-amber-300/40 -z-10 rounded-full" />
                      </span>
                    </h1>

                    <p className="text-sm sm:text-base lg:text-lg text-slate-700 font-medium max-w-xl leading-relaxed pt-1">
                      Master national curriculum chapters, practice with 12,000+ past papers with official marking schemes, take timed online exams, and compete in all-island sports championships.
                    </p>
                  </div>

                  {/* Main Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full">
                    <button
                      type="button"
                      onClick={() => openAuth("signup", "student", "drawer")}
                      className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-black text-sm px-7 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto group"
                    >
                      <GraduationCap className="h-4 sm:h-5 w-4 sm:w-5" />
                      <span>Join as Student</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openAuth("login", "student", "drawer")}
                      className="bg-white/95 backdrop-blur-md border-2 border-emerald-100 hover:border-[#0d5c4d] text-slate-800 font-extrabold text-sm px-6 py-3.5 rounded-full shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                    >
                      <LogIn className="h-4 w-4 text-[#0d5c4d]" />
                      <span>Student Sign In</span>
                    </button>
                  </div>

                  {/* High-Trust Benefit Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-bold text-slate-700">
                    <div className="flex items-center gap-1.5 bg-white/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-emerald-100/90 shadow-2xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#0d5c4d] shrink-0" />
                      <span>12,000+ Past Papers</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-emerald-100/90 shadow-2xs">
                      <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>Timed Online Exams</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-emerald-100/90 shadow-2xs">
                      <Trophy className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Sports League</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-emerald-100/90 shadow-2xs">
                      <Globe className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                      <span>Trilingual Medium</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Floating Modern Glass Badges Over Classroom Scene */}
                <div className="lg:col-span-5 hidden lg:flex flex-col items-end justify-between h-full min-h-[360px] py-4 pointer-events-none">
                  {/* Top Floating Badge */}
                  <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-100 shadow-lg flex items-center gap-2 text-xs font-black text-[#0d2b26] animate-in fade-in slide-in-from-top-4 duration-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Smart Interactive Tuition Classroom</span>
                  </div>

                  {/* Middle Floating Badge */}
                  <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-lg flex items-center gap-2 text-xs font-black text-amber-900">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Grades 1 – 13 All Streams</span>
                  </div>

                  {/* Bottom Floating Badge */}
                  <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-100 shadow-lg flex items-center gap-2 text-xs font-black text-[#0d5c4d]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>National Syllabus &amp; Model Papers</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* 5 CREATIVE "STUDY STATIONS" (VISUAL DISCOVERY CARDS)      */}
            {/* ========================================================= */}
            <section className="space-y-6 pt-4">
              <div className="text-center max-w-xl mx-auto space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#0d5c4d] bg-white px-3.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>Student Exploration Stations</span>
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0d2b26]">
                  Your Complete Digital Learning Studio
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Explore notes, video archives, past paper marking schemes, and student services.
                </p>
              </div>

              {/* 5 Clean, Tactile Cards (Using local photos) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Card 1: Research Archive */}
                <div
                  onClick={() => {
                    addToast({
                      type: "info",
                      title: "Past Papers & Marking Archive",
                      message: "Official G.C.E. O/L & A/L past papers with verified step-by-step schemes."
                    });
                    openAuth("login", "student", "drawer");
                  }}
                  className="group bg-white rounded-3xl p-3 border-2 border-emerald-100/70 hover:border-[#0d5c4d] shadow-sm hover:shadow-xl -translate-y-0 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
                >
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-3 relative bg-slate-100 shadow-inner">
                    <img
                      src="/images/card_archive.jpg"
                      alt="Research Archive"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-[#0d2b26] group-hover:text-[#0d5c4d] transition-colors">
                    Research Archive
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Past Papers &amp; Schemes</p>
                  <span className="text-[10px] font-black text-[#0d5c4d] mt-2 group-hover:underline flex items-center gap-0.5">
                    Browse Papers →
                  </span>
                </div>

                {/* Card 2: Video Repository */}
                <div
                  onClick={() => {
                    addToast({
                      type: "info",
                      title: "Video Masterclasses",
                      message: "Rewatch recorded classroom units, theory explanations & science practicals."
                    });
                    openAuth("login", "student", "drawer");
                  }}
                  className="group bg-white rounded-3xl p-3 border-2 border-emerald-100/70 hover:border-[#0d5c4d] shadow-sm hover:shadow-xl -translate-y-0 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
                >
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-3 relative bg-slate-100 shadow-inner">
                    <img
                      src="/images/card_video.jpg"
                      alt="Video Repository"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-[#0d2b26] group-hover:text-[#0d5c4d] transition-colors">
                    Video Repository
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Recorded Lessons</p>
                  <span className="text-[10px] font-black text-[#0d5c4d] mt-2 group-hover:underline flex items-center gap-0.5">
                    Watch Lessons →
                  </span>
                </div>

                {/* Card 3: Online Library */}
                <div
                  onClick={() => {
                    addToast({
                      type: "info",
                      title: "Digital Study Library",
                      message: "Access trilingual textbooks, unit notes, mind maps and chapter tutes."
                    });
                    openAuth("login", "student", "drawer");
                  }}
                  className="group bg-white rounded-3xl p-3 border-2 border-emerald-100/70 hover:border-[#0d5c4d] shadow-sm hover:shadow-xl -translate-y-0 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
                >
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-3 relative bg-slate-100 shadow-inner">
                    <img
                      src="/images/card_library.jpg"
                      alt="Online Library"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-[#0d2b26] group-hover:text-[#0d5c4d] transition-colors">
                    Online Library
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Books, Tutes &amp; Notes</p>
                  <span className="text-[10px] font-black text-[#0d5c4d] mt-2 group-hover:underline flex items-center gap-0.5">
                    Read Notes →
                  </span>
                </div>

                {/* Card 4: Student Help Desk */}
                <div
                  onClick={() => {
                    addToast({
                      type: "info",
                      title: "Student Help Desk",
                      message: "Ask academic questions, submit query tickets, and get teacher guidance."
                    });
                    openAuth("login", "student", "drawer");
                  }}
                  className="group bg-white rounded-3xl p-3 border-2 border-emerald-100/70 hover:border-[#0d5c4d] shadow-sm hover:shadow-xl -translate-y-0 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
                >
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-3 relative bg-slate-100 shadow-inner">
                    <img
                      src="/images/card_helpdesk.jpg"
                      alt="Student Help Desk"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-[#0d2b26] group-hover:text-[#0d5c4d] transition-colors">
                    Student Help Desk
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Advising &amp; Guidance</p>
                  <span className="text-[10px] font-black text-[#0d5c4d] mt-2 group-hover:underline flex items-center gap-0.5">
                    Ask Mentors →
                  </span>
                </div>

                {/* Card 5: Sports & Championship Hub */}
                <div
                  onClick={() => {
                    addToast({
                      type: "info",
                      title: "Eezhagam Sports Hub",
                      message: "Check inter-school match schedules, team rosters, and championship standings."
                    });
                    openAuth("login", "student", "drawer");
                  }}
                  className="group bg-white rounded-3xl p-3 border-2 border-emerald-100/70 hover:border-[#0d5c4d] shadow-sm hover:shadow-xl -translate-y-0 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col items-center text-center col-span-2 sm:col-span-1"
                >
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-3 relative bg-slate-100 shadow-inner">
                    <img
                      src="/images/card_service.jpg"
                      alt="Sports Championship"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-[#0d2b26] group-hover:text-[#0d5c4d] transition-colors">
                    Sports &amp; Games
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Scores &amp; Tournaments</p>
                  <span className="text-[10px] font-black text-[#0d5c4d] mt-2 group-hover:underline flex items-center gap-0.5">
                    View Match Hub →
                  </span>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* WHY STUDENTS LOVE LEARNING HERE (CREATIVE 4 PILLARS)      */}
            {/* ========================================================= */}
            <section className="space-y-6 pt-2">
              <div className="text-center max-w-xl mx-auto space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300/60 shadow-2xs">
                  <span>★</span>
                  <span>Engineered For Sri Lankan Students</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0d2b26]">
                  Everything You Need to Succeed
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5">
                <div className="p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-emerald-100/80 hover:border-[#0d5c4d] transition-all space-y-3 shadow-xs hover:shadow-lg">
                  <div className="h-11 w-11 rounded-2xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center font-black">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-sm text-[#0d2b26]">Syllabus-Aligned Units</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    National curriculum chapters broken into bite-sized 15-minute lessons with summaries for all school grades (Grades 1–13).
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-amber-100/80 hover:border-[#b47a16] transition-all space-y-3 shadow-xs hover:shadow-lg">
                  <div className="h-11 w-11 rounded-2xl bg-[#fef7e6] text-[#b47a16] flex items-center justify-center font-black">
                    <Zap className="h-5 w-5 text-amber-500" />
                  </div>
                  <h3 className="font-black text-sm text-[#0d2b26]">Real Exam Simulations</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Timed online tests with automatic mark calculation, answer keys, and district leaderboard standings.
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-sky-100/80 hover:border-sky-600 transition-all space-y-3 shadow-xs hover:shadow-lg">
                  <div className="h-11 w-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-black">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-sm text-[#0d2b26]">Teacher Homework Markings</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Upload homework files easily and receive verified marks, written teacher feedback, and rubrics.
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-emerald-100/80 hover:border-emerald-600 transition-all space-y-3 shadow-xs hover:shadow-lg">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-sm text-[#0d2b26]">Sports &amp; Academics Balance</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Participate in inter-school tournaments, register athletic squads, track live fixtures, and celebrate medal tallies.
                  </p>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* CHEERFUL CLOSING CALLOUT & ROLE SWITCHER (GATEWAY DNA)    */}
            {/* ========================================================= */}
            <section className="text-center pt-6 pb-2 space-y-4">
              <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-xs sm:text-sm tracking-widest">
                <span>˗ˏˋ</span>
                <p className="font-extrabold text-sm sm:text-base text-slate-800 tracking-wide">
                  Together for a Smarter Tomorrow
                </p>
                <span>ˎˊ˗</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => openAuth("signup", "student", "drawer")}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-black text-sm py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>Join Newtoz Student Station Now</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handlePortalSwitch("gateway")}
                  className="bg-white/90 border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-xs py-3 px-5 rounded-full shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
                  <span>← Back to Role Gateway</span>
                </button>
              </div>
            </section>
          </div>

          {/* Bottom Dual-Tone Wave Curves (Exact Same as Gateway) */}
          <div className="relative pointer-events-none overflow-hidden leading-none z-0 mt-8">
            <svg
              viewBox="0 0 1440 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-20 sm:h-28 lg:h-32"
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
                fill="#fef8eb"
                fillOpacity="0.85"
              />
            </svg>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PARENT LANDING PAGE (Active when portalType === "parent")              */}
      {/* Creative, Modern, Atmospheric & Attractive (Inheriting Gateway DNA)     */}
      {/* ========================================================================= */}
      {portalType === "parent" && (
        <div className="relative flex-1 flex flex-col justify-between bg-gradient-to-b from-[#f0f6fc] via-[#ffffff] to-[#eef5fc] overflow-hidden">
          {/* Luminous Ambient Lighting Orbs */}
          <div className="absolute -top-24 -left-20 w-[500px] h-[500px] rounded-full bg-sky-300/35 blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full bg-indigo-300/25 blur-3xl pointer-events-none" />
          <div className="absolute bottom-40 left-10 w-[450px] h-[450px] rounded-full bg-emerald-300/25 blur-3xl pointer-events-none" />

          {/* Cheerful Background Doodles & Accents */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute top-8 left-10 text-sky-400 font-black text-2xl animate-pulse">✦</div>
            <div className="absolute top-28 left-32 text-indigo-400/50 font-black text-sm">★</div>
            <div className="absolute top-12 right-16 text-sky-400 font-black text-xl">✦</div>
            <div className="absolute top-36 right-36 text-emerald-400/50 font-black text-sm">●</div>
            <div className="absolute top-1/3 left-6 w-14 h-14 rounded-full border-2 border-dashed border-sky-300/30" />
            <div className="absolute top-2/3 right-8 w-16 h-16 rounded-full border-2 border-dashed border-indigo-300/30" />
          </div>

          <div className="relative z-10 px-4 sm:px-8 lg:px-12 py-8 sm:py-12 max-w-7xl mx-auto w-full space-y-16">
            {/* HERO SECTION */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Typography & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#1e3a5f] border border-sky-200/80 text-xs font-black shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-[#1e3a5f] animate-pulse" />
                  <span>👨‍👩‍👧 Parent &amp; Guardian Desk • Sri Lankan Tuition &amp; Classes</span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0d2b26] leading-[1.12]">
                    Stay connected with your <br />
                    <span className="text-[#1e3a5f] relative inline-block">
                      child&apos;s daily learning.
                      <span className="absolute left-0 bottom-1.5 w-full h-3 bg-sky-200/50 -z-10 rounded-full" />
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed pt-1">
                    Track class attendance, examine test rankings, chat with tutors, review homework completion, and upload monthly tuition payment slips with complete peace of mind.
                  </p>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full">
                  <button
                    type="button"
                    onClick={() => openAuth("login", "parent", "drawer")}
                    className="bg-[#1e3a5f] hover:bg-[#152a45] text-white font-black text-sm px-7 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto group"
                  >
                    <LogIn className="h-4 sm:h-5 w-4 sm:w-5" />
                    <span>Guardian Sign In</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openAuth("signup", "parent", "drawer")}
                    className="bg-white/90 backdrop-blur-xs border-2 border-sky-100 hover:border-[#1e3a5f] text-slate-800 font-extrabold text-sm px-6 py-3.5 rounded-full shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    <UserPlus className="h-4 w-4 text-[#1e3a5f]" />
                    <span>Register Parent Account</span>
                  </button>
                </div>

                {/* High-Trust Benefit Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-bold text-slate-700">
                  <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-sky-100/80">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#1e3a5f] shrink-0" />
                    <span>SMS Attendance Alerts</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-sky-100/80">
                    <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Term Report Cards</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-sky-100/80">
                    <Mail className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span>Tutor Consultations</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-sky-100/80">
                    <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Tuition Fee Receipts</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean, Cheerful Parent Illustration Card (Matching Gateway DNA) */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="group relative w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur-md border-2 border-sky-100 hover:border-[#1e3a5f] shadow-sm hover:shadow-xl transition-all duration-300 p-6 sm:p-8 flex flex-col items-center justify-between text-center overflow-hidden">
                  {/* Floating Tag */}
                  <div className="absolute top-4 right-4 bg-sky-50 text-[#1e3a5f] text-[10px] font-black px-2.5 py-1 rounded-full border border-sky-200 shadow-2xs">
                    Guardian Desk
                  </div>

                  {/* Brush-Splash Character Illustration */}
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-52 lg:h-52 flex items-center justify-center my-2">
                    <img
                      src="/images/parent_brush_portrait.jpg"
                      alt="Parent monitoring student progress"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Clean Caption & Badge */}
                  <div className="space-y-1 mt-2">
                    <h3 className="text-base sm:text-lg font-black text-[#0d2b26]">
                      Parent &amp; Guardian Portal
                    </h3>
                    <p className="text-xs text-slate-600 font-medium max-w-xs">
                      Monitor progress, attendance &amp; fees with real-time confidence.
                    </p>
                  </div>

                  {/* Clean Feature Highlights (No duplicate buttons) */}
                  <div className="w-full grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-sky-100/70 text-[11px] font-bold text-slate-700">
                    <div className="bg-[#f0f6fc] px-2.5 py-2 rounded-xl text-[#1e3a5f] border border-sky-100/80 flex items-center justify-center gap-1.5 shadow-2xs">
                      <BarChart3 className="h-3.5 w-3.5 text-[#1e3a5f] shrink-0" />
                      <span>Term Reports</span>
                    </div>
                    <div className="bg-[#ecf8f5] px-2.5 py-2 rounded-xl text-emerald-800 border border-emerald-100/80 flex items-center justify-center gap-1.5 shadow-2xs">
                      <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Fee Slips</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4 FEATURE PILLARS FOR PARENTS */}
            <section className="space-y-6 pt-2">
              <div className="text-center max-w-xl mx-auto space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#1e3a5f] bg-sky-100/80 px-3 py-1 rounded-full border border-sky-300/60 shadow-2xs">
                  <span>★</span>
                  <span>Engineered For Sri Lankan Parents</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0d2b26]">
                  Designed for Sri Lankan Parents &amp; Guardians
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5">
                <div className="p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-sky-100/80 hover:border-[#1e3a5f] transition-all space-y-3 shadow-xs hover:shadow-lg">
                  <div className="h-11 w-11 rounded-2xl bg-[#f0f6fc] text-[#1e3a5f] flex items-center justify-center font-black">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-sm text-[#0d2b26]">Attendance &amp; Leave</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Real-time class entry check-in status, official leave request submissions, and monthly attendance reports.
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-emerald-100/80 hover:border-emerald-600 transition-all space-y-3 shadow-xs hover:shadow-lg">
                  <div className="h-11 w-11 rounded-2xl bg-[#ecf8f5] text-emerald-700 flex items-center justify-center font-black">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-sm text-[#0d2b26]">Term Report Cards</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Download certified term examination report cards with subject rankings, tutor remarks, and grade trends.
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-indigo-100/80 hover:border-indigo-600 transition-all space-y-3 shadow-xs hover:shadow-lg">
                  <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-sm text-[#0d2b26]">Tutor Communications</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Secure two-way messaging with course tutors and sports coaches to monitor academic and athletic progress.
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-amber-100/80 hover:border-[#b47a16] transition-all space-y-3 shadow-xs hover:shadow-lg">
                  <div className="h-11 w-11 rounded-2xl bg-[#fef8eb] text-[#b47a16] flex items-center justify-center font-black">
                    <Shield className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="font-black text-sm text-[#0d2b26]">Fee Receipts &amp; Slips</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Upload bank deposit slips or pay tuition fees online with verified digital receipt tracking.
                  </p>
                </div>
              </div>
            </section>

            {/* CHEERFUL CLOSING CALLOUT & ROLE SWITCHER (GATEWAY DNA) */}
            <section className="text-center pt-6 pb-2 space-y-4">
              <div className="flex items-center justify-center gap-2 text-sky-500 font-black text-xs sm:text-sm tracking-widest">
                <span>˗ˏˋ</span>
                <p className="font-extrabold text-sm sm:text-base text-slate-800 tracking-wide">
                  Together for a Smarter Tomorrow
                </p>
                <span>ˎˊ˗</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => openAuth("signup", "parent", "drawer")}
                  className="bg-[#1e3a5f] hover:bg-[#152a45] text-white font-black text-sm py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <Users className="h-4 w-4" />
                  <span>Join Newtoz Guardian Desk Now</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handlePortalSwitch("gateway")}
                  className="bg-white/90 border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-xs py-3 px-5 rounded-full shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
                  <span>← Back to Role Gateway</span>
                </button>
              </div>
            </section>
          </div>

          {/* Bottom Dual-Tone Wave Curves */}
          <div className="relative pointer-events-none overflow-hidden leading-none z-0 mt-8">
            <svg
              viewBox="0 0 1440 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-20 sm:h-28 lg:h-32"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C320,150 480,20 820,100 C1100,170 1300,70 1440,110 L1440,220 L0,220 Z"
                fill="#38bdf8"
                fillOpacity="0.4"
              />
              <path
                d="M0,100 C260,180 540,60 880,130 C1160,190 1340,90 1440,130 L1440,220 L0,220 Z"
                fill="#60a5fa"
                fillOpacity="0.4"
              />
              <path
                d="M0,135 C300,70 640,190 980,100 C1220,40 1380,150 1440,120 L1440,220 L0,220 Z"
                fill="#93c5fd"
                fillOpacity="0.5"
              />
              <path
                d="M0,180 C360,140 720,210 1080,165 C1260,145 1380,195 1440,180 L1440,220 L0,220 Z"
                fill="#eef5fc"
                fillOpacity="0.85"
              />
            </svg>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TUTOR LANDING PAGE (Active when portalType === "staff")                */}
      {/* Creative, Modern, Atmospheric & Attractive (Inheriting Gateway DNA)     */}
      {/* ========================================================================= */}
      {portalType === "staff" && (
        <div className="relative flex-1 flex flex-col justify-between bg-gradient-to-b from-[#fef8eb] via-[#ffffff] to-[#ebf8f4] overflow-hidden">
          {/* Luminous Ambient Lighting Orbs */}
          <div className="absolute -top-24 -left-20 w-[500px] h-[500px] rounded-full bg-amber-300/35 blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full bg-emerald-300/30 blur-3xl pointer-events-none" />
          <div className="absolute bottom-40 left-10 w-[450px] h-[450px] rounded-full bg-sky-300/25 blur-3xl pointer-events-none" />

          {/* Cheerful Background Doodles & Accents */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute top-8 left-10 text-amber-500 font-black text-2xl animate-pulse">✦</div>
            <div className="absolute top-28 left-32 text-emerald-500/50 font-black text-sm">★</div>
            <div className="absolute top-12 right-16 text-amber-500 font-black text-xl">✦</div>
            <div className="absolute top-36 right-36 text-sky-400/50 font-black text-sm">●</div>
            <div className="absolute top-1/3 left-6 w-14 h-14 rounded-full border-2 border-dashed border-amber-300/30" />
            <div className="absolute top-2/3 right-8 w-16 h-16 rounded-full border-2 border-dashed border-emerald-300/30" />
          </div>

          <div className="relative z-10 px-4 sm:px-8 lg:px-12 py-8 sm:py-12 max-w-7xl mx-auto w-full space-y-16">
            {/* HERO SECTION */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Typography & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#b47a16] border border-amber-200/80 text-xs font-black shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-[#b47a16] animate-pulse" />
                  <span>🧑‍🏫 Tutor Command Center • Independent Educators &amp; Academies</span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0d2b26] leading-[1.12]">
                    Lead your private tuition <br />
                    <span className="text-[#b47a16] relative inline-block">
                      with total autonomy.
                      <span className="absolute left-0 bottom-1.5 w-full h-3 bg-amber-200/50 -z-10 rounded-full" />
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed pt-1">
                    Everything an independent tuition master needs: publish courses, broadcast announcements directly to students&apos; learning feeds, run timed quizzes, verify bank fee slips, and monitor live attendance.
                  </p>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full">
                  <button
                    type="button"
                    onClick={() => handle1ClickDemoLogin("teacher")}
                    className="bg-[#b47a16] hover:bg-[#8d5f10] text-white font-black text-sm px-7 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto group"
                  >
                    <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 text-[#fde047]" />
                    <span>Launch Tutor Cockpit</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openAuth("signup", "teacher", "drawer")}
                    className="bg-white/90 backdrop-blur-xs border-2 border-amber-100 hover:border-[#b47a16] text-slate-800 font-extrabold text-sm px-6 py-3.5 rounded-full shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    <UserPlus className="h-4 w-4 text-[#b47a16]" />
                    <span>Register as Tutor</span>
                  </button>
                </div>

                {/* High-Trust Benefit Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-bold text-slate-700">
                  <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-amber-100/80">
                    <Send className="h-3.5 w-3.5 text-[#b47a16] shrink-0" />
                    <span>Feed Broadcaster</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-amber-100/80">
                    <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Auto Quiz Grading</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-amber-100/80">
                    <CreditCard className="h-3.5 w-3.5 text-[#0d5c4d] shrink-0" />
                    <span>Fee Reconciliation</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-amber-100/80">
                    <BarChart3 className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    <span>Progress Insights</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean, Cheerful Tutor Illustration Card (Matching Gateway DNA) */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="group relative w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur-md border-2 border-amber-100 hover:border-[#b47a16] shadow-sm hover:shadow-xl transition-all duration-300 p-6 sm:p-8 flex flex-col items-center justify-between text-center overflow-hidden">
                  {/* Floating Tag */}
                  <div className="absolute top-4 right-4 bg-amber-50 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs">
                    Tutor Studio
                  </div>

                  {/* Brush-Splash Character Illustration */}
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-52 lg:h-52 flex items-center justify-center my-2">
                    <img
                      src="/images/tutor_brush_portrait.jpg"
                      alt="Tutor educator"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Clean Caption & Badge */}
                  <div className="space-y-1 mt-2">
                    <h3 className="text-base sm:text-lg font-black text-[#0d2b26]">
                      Tutor Command Center
                    </h3>
                    <p className="text-xs text-slate-600 font-medium max-w-xs">
                      Manage students, batches, notices &amp; fee settlements seamlessly.
                    </p>
                  </div>

                  {/* Clean Feature Highlights (No duplicate buttons) */}
                  <div className="w-full grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-amber-100/70 text-[11px] font-bold text-slate-700">
                    <div className="bg-[#fef8eb] px-2.5 py-2 rounded-xl text-[#b47a16] border border-amber-200/80 flex items-center justify-center gap-1.5 shadow-2xs">
                      <Send className="h-3.5 w-3.5 text-[#b47a16] shrink-0" />
                      <span>Direct Broadcasts</span>
                    </div>
                    <div className="bg-[#ecf8f5] px-2.5 py-2 rounded-xl text-emerald-800 border border-emerald-100/80 flex items-center justify-center gap-1.5 shadow-2xs">
                      <Zap className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Auto Grading</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 6 EDUCATOR CAPABILITIES GRID */}
            <section className="space-y-6 pt-2">
              <div className="text-center max-w-2xl mx-auto space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300/60 shadow-2xs">
                  <span>★</span>
                  <span>Exclusively For Educators</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0d2b26]">
                  Everything You Need to Run Your Classes
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Replace fragmented WhatsApp groups and paper receipts with a unified, professional academy system.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-5">
                {/* Feature 1 */}
                <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-amber-100/80 hover:border-[#b47a16] transition-all space-y-3 shadow-xs hover:shadow-lg">
                  <div className="h-11 w-11 rounded-2xl bg-[#fef8eb] text-[#b47a16] flex items-center justify-center font-black">
                    <Send className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-sm text-[#0d2b26]">Live Student Noticeboard</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Post high-priority announcements, homework tasks, and class notices with edit, pin, and delete controls directly visible to all students.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-emerald-100/80 hover:border-[#0d5c4d] transition-all space-y-3 shadow-xs hover:shadow-lg">
                  <div className="h-11 w-11 rounded-2xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center font-black">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-sm text-[#0d2b26]">Course &amp; Lesson Studio</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Organize theory, revision, and paper class materials into Units and Topics with downloadable PDFs, video tutorials, and past papers.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-sky-100/80 hover:border-sky-600 transition-all space-y-3 shadow-xs hover:shadow-lg">
                  <div className="h-11 w-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-black">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-sm text-[#0d2b26]">Online Quizzes &amp; Ranking</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Build timed MCQ practice tests with automated mark calculation, answer reviews, and batch leaderboard standings.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="lg:col-span-2 lg:col-start-2 p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-emerald-100/80 hover:border-emerald-600 transition-all space-y-3 shadow-xs hover:shadow-lg">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-sm text-[#0d2b26]">Tuition Fee Reconciliation</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Review student/parent bank deposit slips with 1-click approvals, digital payment receipts, and real-time payment status lists.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="sm:col-span-2 sm:max-w-md sm:mx-auto w-full lg:col-span-2 lg:max-w-none lg:mx-0 p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-purple-100/80 hover:border-purple-600 transition-all space-y-3 shadow-xs hover:shadow-lg">
                  <div className="h-11 w-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-black">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <h3 className="font-black text-sm text-[#0d2b26]">Performance Insights</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Spot students falling behind early with clear charts on assignment completion, quiz averages, and class consistency.
                  </p>
                </div>
              </div>
            </section>

            {/* CHEERFUL CLOSING CALLOUT & ROLE SWITCHER (GATEWAY DNA) */}
            <section className="text-center pt-6 pb-2 space-y-4">
              <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-xs sm:text-sm tracking-widest">
                <span>˗ˏˋ</span>
                <p className="font-extrabold text-sm sm:text-base text-slate-800 tracking-wide">
                  Together for a Smarter Tomorrow
                </p>
                <span>ˎˊ˗</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => openAuth("signup", "teacher", "drawer")}
                  className="bg-[#b47a16] hover:bg-[#8d5f10] text-white font-black text-sm py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <Sparkles className="h-4 w-4 text-[#fde047]" />
                  <span>Register Tutor Account Now</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handlePortalSwitch("gateway")}
                  className="bg-white/90 border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-xs py-3 px-5 rounded-full shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
                  <span>← Back to Role Gateway</span>
                </button>
              </div>
            </section>
          </div>

          {/* Bottom Dual-Tone Wave Curves */}
          <div className="relative pointer-events-none overflow-hidden leading-none z-0 mt-8">
            <svg
              viewBox="0 0 1440 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-20 sm:h-28 lg:h-32"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C320,150 480,20 820,100 C1100,170 1300,70 1440,110 L1440,220 L0,220 Z"
                fill="#fde047"
                fillOpacity="0.4"
              />
              <path
                d="M0,100 C260,180 540,60 880,130 C1160,190 1340,90 1440,130 L1440,220 L0,220 Z"
                fill="#fbbf24"
                fillOpacity="0.4"
              />
              <path
                d="M0,135 C300,70 640,190 980,100 C1220,40 1380,150 1440,120 L1440,220 L0,220 Z"
                fill="#6ee7b7"
                fillOpacity="0.45"
              />
              <path
                d="M0,180 C360,140 720,210 1080,165 C1260,145 1380,195 1440,180 L1440,220 L0,220 Z"
                fill="#ebf8f4"
                fillOpacity="0.85"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Footer - only shown on Portal landing pages, Gateway has its own compact footer */}
      {portalType !== "gateway" && (
        <footer className={`py-8 px-6 text-center text-xs transition-colors ${
          portalType === "student"
            ? "border-t border-amber-200/50 bg-[#fef8eb] text-slate-600"
            : portalType === "parent"
            ? "border-t border-sky-200/50 bg-[#eef5fc] text-slate-600"
            : portalType === "staff"
            ? "border-t border-emerald-100/60 bg-[#ebf8f4] text-slate-600"
            : "border-t border-[#e6ece8] bg-white text-slate-500"
        }`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-emerald-300 to-amber-300 p-0.5 shadow-xs shrink-0 ring-1 ring-emerald-500/20">
                <img
                  src="/images/tozy_icon.jpg"
                  alt="Tozy - Newtoz Mascot"
                  className="w-full h-full object-cover rounded-[10px] bg-white"
                />
              </div>
              <div className="text-left">
                <p className="font-black text-[#0d2b26]">Newtoz • <span className="font-bold text-[#0d5c4d]">Shape Your Future</span></p>
                <p className="text-[10px] text-[#0d5c4d] font-bold">newtoz.com • Guided by Tozy 🐘🪽</p>
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
              <span>•</span>
              <button
                type="button"
                onClick={() => openAuth("login", "admin", "drawer")}
                className="hover:text-[#0d5c4d] cursor-pointer font-bold text-slate-600"
              >
                Admin Desk
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openAuth("login", "super_admin", "drawer")}
                className="hover:text-amber-700 cursor-pointer font-black text-amber-800"
              >
                Super Admin
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
                <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-emerald-300 to-amber-300 p-0.5 shadow-2xs shrink-0 ring-1 ring-emerald-500/20">
                  <img
                    src="/images/tozy_icon.jpg"
                    alt="Tozy - Newtoz Mascot"
                    className="w-full h-full object-cover rounded-[10px] bg-white"
                  />
                  <span className="absolute -top-1 -right-1 text-[10px]">🪽</span>
                </div>
                <div>
                  <h3 className="font-black text-base text-[#0d2b26]">Newtoz</h3>
                  <p className="text-[10px] uppercase font-bold text-[#0d5c4d]">
                    {selectedRole === "parent"
                      ? "Parent & Guardian Desk"
                      : selectedRole === "student"
                      ? "Student Portal"
                      : selectedRole === "admin"
                      ? "School Admin Operations"
                      : selectedRole === "super_admin"
                      ? "Super Admin SaaS Console"
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
