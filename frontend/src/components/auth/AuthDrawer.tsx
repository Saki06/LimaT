"use client";

import React, { useState, useEffect } from "react";
import { Maximize2, X, Shield, GraduationCap, Users, Sparkles } from "lucide-react";
import { SupportedRole, AuthDisplayMode, AuthTab } from "./types";
import { LoginForm } from "./LoginForm";
import { StudentSignupForm } from "./StudentSignupForm";
import { TutorSignupForm } from "./TutorSignupForm";
import { ParentSignupForm } from "./ParentSignupForm";

export { type SupportedRole, type AuthDisplayMode } from "./types";

export interface AuthDrawerProps {
  authMode: AuthDisplayMode;
  initialTab?: AuthTab;
  initialRole?: SupportedRole;
  portalType?: "gateway" | "student" | "parent" | "staff";
  onClose: () => void;
  onEnterApp: () => void;
  onModeChange?: (mode: AuthDisplayMode) => void;
}

export function AuthDrawer({
  authMode: controlledMode,
  initialTab = "login",
  initialRole = "student",
  portalType = "gateway",
  onClose,
  onEnterApp,
  onModeChange
}: AuthDrawerProps) {
  const [internalMode, setInternalMode] = useState<AuthDisplayMode>(controlledMode);
  const [authTab, setAuthTab] = useState<AuthTab>(initialTab);
  const [selectedRole, setSelectedRole] = useState<SupportedRole>(initialRole);

  useEffect(() => {
    setInternalMode(controlledMode);
  }, [controlledMode]);

  useEffect(() => {
    setAuthTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setSelectedRole(initialRole);
  }, [initialRole]);

  const handleModeChange = (newMode: AuthDisplayMode) => {
    setInternalMode(newMode);
    onModeChange?.(newMode);
    if (newMode === "closed") {
      onClose();
    }
  };

  const handleAuthSuccess = () => {
    handleModeChange("closed");
    onEnterApp();
  };

  if (internalMode === "closed") {
    return null;
  }

  // Active form selector based on role & tab
  const renderActiveForm = () => {
    if (authTab === "login") {
      return <LoginForm selectedRole={selectedRole} onSuccess={handleAuthSuccess} />;
    }
    if (selectedRole === "parent") {
      return <ParentSignupForm onSuccess={handleAuthSuccess} />;
    }
    if (selectedRole === "teacher") {
      return <TutorSignupForm onSuccess={handleAuthSuccess} />;
    }
    return <StudentSignupForm onSuccess={handleAuthSuccess} />;
  };

  const authContent = (
    <div className="space-y-4">
      {/* Role Badge Indicator */}
      {!(selectedRole === "parent" && authTab === "signup") && (
        <div
          className={`p-3 rounded-2xl flex items-center justify-between border ${
            selectedRole === "student"
              ? "bg-[#ecf8f5] border-[#c4e9e0] text-[#0d5c4d]"
              : selectedRole === "parent"
              ? "bg-[#f0f5fa] border-[#cbdfe8] text-[#1e3a5f]"
              : "bg-[#fef7e6] border-[#fde4af] text-[#b47a16]"
          }`}
        >
          <div className="flex items-center gap-2">
            {selectedRole === "student" && <GraduationCap className="h-4 w-4" />}
            {selectedRole === "parent" && <Users className="h-4 w-4" />}
            {selectedRole !== "student" && selectedRole !== "parent" && <Sparkles className="h-4 w-4" />}
            <span className="text-xs font-black uppercase tracking-wider">
              {selectedRole === "student"
                ? "Student Portal"
                : selectedRole === "parent"
                ? "Parent & Guardian Desk"
                : "Tutor Cockpit"}
            </span>
          </div>
          <span className="text-[10px] font-bold opacity-75">
            {selectedRole === "student"
              ? "Direct Enrollment"
              : selectedRole === "parent"
              ? "Fee & Attendance"
              : "Course Creator"}
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

      {renderActiveForm()}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={() => handleModeChange("closed")}
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

          <button
            type="button"
            onClick={() => handleModeChange("closed")}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{authContent}</div>

        {/* Drawer Footer */}
        <div className="px-4 sm:px-6 py-3 bg-[#f8faf9] border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-[#0d5c4d]" />
            <span>Secure Tuition Platform</span>
          </span>
          <span className="text-[11px] text-slate-400">LimaT Education System</span>
        </div>
      </div>
    </div>
  );
}
