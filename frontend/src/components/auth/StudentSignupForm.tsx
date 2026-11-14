"use client";

import React, { useState } from "react";
import { User as UserIcon, Phone, Mail, Lock, UserPlus, GraduationCap, Loader2, ChevronDown, Globe, MapPin, BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

const GRADE_OPTIONS = [
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11 (O/L)",
  "Grade 12 (A/L)",
  "Grade 13 (A/L)",
];

const GENDER_OPTIONS = [
  "Male",
  "Female",
];

const MEDIUM_OPTIONS = [
  "Tamil Medium",
  "English Medium",
  "Sinhala Medium",
];

const STREAM_OPTIONS = [
  "Physical Science (Maths)",
  "Biological Science",
  "Commerce",
  "Arts",
  "Engineering Technology",
  "Bio Systems Technology",
];

const DISTRICT_OPTIONS = [
  "Jaffna",
  "Colombo",
  "Kandy",
  "Batticaloa",
  "Vavuniya",
  "Kilinochchi",
  "Trincomalee",
  "Mannar",
  "Mullaitivu",
  "Gampaha",
  "Nuwara Eliya",
  "Ampara",
  "Puttalam",
  "Kurunegala",
  "Galle",
  "Matara",
  "Badulla",
  "Ratnapura",
  "Anuradhapura",
  "Polonnaruwa",
  "Kegalle",
  "Kalutara",
  "Matale",
  "Hambantota",
  "Monaragala",
];

interface StudentSignupFormProps {
  onSuccess: () => void;
}

export function StudentSignupForm({ onSuccess }: StudentSignupFormProps) {
  const { addToast, registerUser } = useApp();

  const [signupName, setSignupName] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedMedium, setSelectedMedium] = useState("Tamil Medium");
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("Jaffna");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const isAdvancedLevel = selectedGrade === "Grade 12 (A/L)" || selectedGrade === "Grade 13 (A/L)";

  const isValidSriLankanPhone = (phone: string) => {
    const cleaned = phone.trim().replace(/[\s-]/g, "");
    return /^(?:0[1-9]\d{8}|\+94[1-9]\d{8})$/.test(cleaned);
  };

  const isValidEmailAddress = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email.trim());
  };

  const phoneError =
    signupPhone.trim().length > 0 && !isValidSriLankanPhone(signupPhone)
      ? "Enter valid 10-digit SL number (e.g. 0771234567)"
      : "";

  const emailError =
    signupEmail.trim().length > 0 && !isValidEmailAddress(signupEmail)
      ? "Enter a valid email (e.g. name@gmail.com)"
      : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmailAddress(signupEmail)) {
      addToast({
        type: "error",
        title: "Invalid Email Address",
        message: "Please enter a valid email address (e.g. student@gmail.com)."
      });
      return;
    }

    if (!isValidSriLankanPhone(signupPhone)) {
      addToast({
        type: "error",
        title: "Invalid Mobile Number",
        message: "Please enter a valid 10-digit Sri Lankan mobile number (e.g. 077 123 4567)."
      });
      return;
    }

    if (signupPassword.trim().length < 6) {
      addToast({
        type: "error",
        title: "Weak Password",
        message: "Password must be at least 6 characters long."
      });
      return;
    }

    if (signupPassword && signupConfirmPassword && signupPassword !== signupConfirmPassword) {
      addToast({
        type: "error",
        title: "Password Mismatch",
        message: "The passwords entered do not match. Please re-enter."
      });
      return;
    }

    if (!agreeTerms) {
      addToast({
        type: "error",
        title: "Terms Required",
        message: "Please agree to the LimaT Terms & Privacy Policy to continue."
      });
      return;
    }

    setIsLoading(true);
    try {
      const nameParts = signupName.trim().split(" ");
      const firstName = nameParts[0] || "Student";
      const lastName = nameParts.slice(1).join(" ");

      const res = await registerUser({
        role: "student",
        firstName,
        lastName,
        email: signupEmail.trim(),
        password: signupPassword,
        phoneNumber: signupPhone.trim(),
        gradeLevel: selectedGrade,
        section: isAdvancedLevel ? selectedStream : selectedMedium,
        gender: selectedGender,
        medium: selectedMedium,
        district: selectedDistrict,
      });

      if (res.success) {
        onSuccess();
      } else {
        addToast({
          type: "error",
          title: "Registration Failed",
          message: res.message || "Could not complete student registration."
        });
      }
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Connection Error",
        message: err.message || "Could not reach registration server."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Student Full Name *</label>
        <div className="relative">
          <UserIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={signupName}
            onChange={(e) => setSignupName(e.target.value)}
            placeholder="e.g. Alex Morgan"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Enrolled Grade *</label>
          <div className="relative">
            <GraduationCap className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              required
              value={selectedGrade}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedGrade(val);
                if (val !== "Grade 12 (A/L)" && val !== "Grade 13 (A/L)") {
                  setSelectedStream("");
                } else if (!selectedStream) {
                  setSelectedStream("Physical Science (Maths)");
                }
              }}
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d] transition-all font-medium appearance-none cursor-pointer"
            >
              <option value="" disabled>Select Grade</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Gender *</label>
          <div className="relative">
            <UserIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              required
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d] transition-all font-medium appearance-none cursor-pointer"
            >
              <option value="" disabled>Select Gender</option>
              {GENDER_OPTIONS.map((gender) => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {isAdvancedLevel && (
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">A/L Subject Stream *</label>
          <div className="relative">
            <BookOpen className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              required
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d] transition-all font-medium appearance-none cursor-pointer"
            >
              {STREAM_OPTIONS.map((stream) => (
                <option key={stream} value={stream}>{stream}</option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Medium of Study *</label>
          <div className="relative">
            <Globe className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              required
              value={selectedMedium}
              onChange={(e) => setSelectedMedium(e.target.value)}
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d] transition-all font-medium appearance-none cursor-pointer"
            >
              {MEDIUM_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">District / City *</label>
          <div className="relative">
            <MapPin className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              required
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0d5c4d] transition-all font-medium appearance-none cursor-pointer"
            >
              {DISTRICT_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
          <div className="relative">
            <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="student@apex.edu"
              className={`w-full h-10 pl-9 pr-3 rounded-xl bg-white border text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium ${
                emailError
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-200 focus:border-[#0d5c4d]"
              }`}
            />
          </div>
          {emailError && (
            <p className="text-[10px] font-bold text-rose-600 mt-1">{emailError}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Mobile No (WhatsApp) *</label>
          <div className="relative">
            <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              required
              maxLength={15}
              value={signupPhone}
              onChange={(e) => setSignupPhone(e.target.value.replace(/[^0-9+\s-]/g, ""))}
              placeholder="077 123 4567"
              className={`w-full h-10 pl-9 pr-3 rounded-xl bg-white border text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium ${
                phoneError
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-200 focus:border-[#0d5c4d]"
              }`}
            />
          </div>
          {phoneError && (
            <p className="text-[10px] font-bold text-rose-600 mt-1">{phoneError}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Create Password *</label>
          <div className="relative">
            <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="At least 6 chars"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] transition-all font-medium"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Password *</label>
          <div className="relative">
            <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
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
          <span>I agree to the LimaT Terms &amp; Privacy Policy</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-1 bg-[#0d5c4d] hover:bg-[#083e34] ${
          isLoading ? "opacity-75 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Registering Student Account...</span>
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            <span>Create Account &amp; Join as Student</span>
          </>
        )}
      </button>
    </form>
  );
}
