"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Sun, Moon, Globe, Shield, GraduationCap, School, Users, Sparkles } from "lucide-react";

export function PrototypeBar() {
  const {
    currentRole,
    setCurrentRole,
    locale,
    setLocale,
    theme,
    setTheme,
    activeTenantId,
    setActiveTenantId,
    tenants,
    isLanding,
    setIsLanding,
    landingPortal,
    setLandingPortal
  } = useApp();

  const handleRoleChange = (role: any) => {
    setCurrentRole(role);
    if (isLanding) {
      if (role === "student") {
        setLandingPortal("student");
      } else if (role === "teacher" || role === "admin") {
        setLandingPortal("staff");
      } else if (role === "parent") {
        setLandingPortal("parent");
      }
    }
  };

  return (
    <div className="bg-[#082a24] text-slate-200 border-b border-[#0f443b] px-3 sm:px-4 py-1.5 text-xs sticky top-0 z-50 overflow-x-auto">
      <div className="flex items-center justify-between gap-2.5 max-w-7xl mx-auto min-w-max sm:min-w-0">
        {/* Left: Brand & Interactive Indicator + Client Workspace Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 font-bold text-white tracking-wide shrink-0">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#f3b738] shadow-[0_0_8px_#f3b738]" />
            <span className="font-extrabold tracking-tight text-white text-xs sm:text-sm">
              LimaT Tutor & Sports SaaS
            </span>
            <span className="text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#0d5c4d] text-emerald-200 border border-[#167866] hidden sm:inline-block">
              Tutor SaaS Ecosystem
            </span>
          </div>

          {/* Startup Landing / Dashboard Switcher Toggle */}
          <button
            type="button"
            onClick={() => setIsLanding(!isLanding)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#051c18] border border-[#14473e] text-emerald-300 hover:text-white hover:bg-emerald-950/60 transition-all cursor-pointer shadow-2xs"
            title="Toggle between Startup Landing page and Application Dashboard"
          >
            <Globe className="h-3.5 w-3.5 text-[#f3b738]" />
            <span>{isLanding ? "Enter App ➔" : "Startup Page"}</span>
          </button>

          {/* Landing Portal Switcher (Gateway vs Student vs Parent vs Staff) */}
          {isLanding && (
            <div className="flex items-center bg-[#051c18] border border-[#14473e] rounded-xl p-0.5 shrink-0 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2 hidden sm:inline">Landing:</span>
              <button
                type="button"
                onClick={() => setLandingPortal("gateway")}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  landingPortal === "gateway"
                    ? "bg-[#0d5c4d] text-white shadow-xs font-black"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                title="Switch to Gateway Splitter (GetEpic style)"
              >
                <Sparkles className={`h-3.5 w-3.5 ${landingPortal === "gateway" ? "text-[#f3b738]" : "text-slate-400"}`} />
                <span>Gateway</span>
              </button>

              <button
                type="button"
                onClick={() => setLandingPortal("student")}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  landingPortal === "student"
                    ? "bg-[#0d5c4d] text-white shadow-xs font-black"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                title="Switch to Student Landing Page"
              >
                <GraduationCap className={`h-3.5 w-3.5 ${landingPortal === "student" ? "text-white" : "text-emerald-300"}`} />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setLandingPortal("parent")}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  landingPortal === "parent"
                    ? "bg-[#1e3a5f] text-white shadow-xs font-black"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                title="Switch to Parent Landing Page"
              >
                <Users className={`h-3.5 w-3.5 ${landingPortal === "parent" ? "text-[#f3b738]" : "text-emerald-300"}`} />
                <span>Parent</span>
              </button>

              <button
                type="button"
                onClick={() => setLandingPortal("staff")}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  landingPortal === "staff"
                    ? "bg-[#f3b738] text-slate-950 shadow-xs font-black"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                title="Switch to Staff Landing Page"
              >
                <School className={`h-3.5 w-3.5 ${landingPortal === "staff" ? "text-slate-950" : "text-slate-300"}`} />
                <span>Tutor/Staff</span>
              </button>
            </div>
          )}

          {/* SaaS Workspace Selector */}
          <div className="flex items-center gap-1.5 bg-[#051c18] border border-[#14473e] rounded-xl px-2 py-1 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400">Workspace:</span>
            <select
              value={activeTenantId}
              onChange={(e) => setActiveTenantId(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-emerald-300 focus:outline-hidden cursor-pointer"
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id} className="bg-[#082a24] text-white">
                  👨‍🏫 {tenant.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Role Switcher, Language & Theme Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Role Switcher with clean labels */}
          <div className="flex items-center bg-[#051c18] border border-[#14473e] rounded-xl p-0.5 shrink-0 isolate">
            {/* Student */}
            <button
              type="button"
              onClick={() => handleRoleChange("student")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRole === "student"
                  ? "bg-[#0d5c4d] text-white shadow-xs font-black"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <GraduationCap className={`h-3.5 w-3.5 ${currentRole === "student" ? "text-white" : "text-emerald-300"}`} />
              <span>Student</span>
            </button>

            {/* Tutor */}
            <button
              type="button"
              onClick={() => handleRoleChange("teacher")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRole === "teacher"
                  ? "bg-[#f3b738] text-slate-950 shadow-xs font-black"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <School className={`h-3.5 w-3.5 ${currentRole === "teacher" ? "text-slate-950" : "text-slate-300"}`} />
              <span>Tutor</span>
            </button>

            {/* Platform Admin */}
            <button
              type="button"
              onClick={() => handleRoleChange("admin")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRole === "admin"
                  ? "bg-[#ecf8f5] text-[#0d5c4d] shadow-xs font-black"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Shield className={`h-3.5 w-3.5 ${currentRole === "admin" ? "text-[#0d5c4d]" : "text-slate-300"}`} />
              <span>Admin</span>
            </button>

            {/* Parent Portal */}
            <button
              type="button"
              onClick={() => handleRoleChange("parent")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRole === "parent"
                  ? "bg-[#1e3a5f] text-white shadow-xs font-black"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
              title="Parent Academic & Attendance Monitoring Portal"
            >
              <span className="text-xs">👨‍👩‍👧</span>
              <span>Parent</span>
            </button>

            {/* Super Admin */}
            <button
              type="button"
              onClick={() => setCurrentRole("super_admin")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentRole === "super_admin"
                  ? "bg-[#f3b738] text-slate-950 shadow-xs font-black"
                  : "text-amber-300 hover:text-amber-100 hover:bg-white/5"
              }`}
              title="Master Platform Management Portal"
            >
              <span className="text-xs">👑</span>
              <span>Super Admin</span>
            </button>
          </div>

          {/* Tri-lingual Language Switcher */}
          <div className="flex items-center bg-[#051c18] border border-[#14473e] rounded-xl p-0.5 shrink-0">
            <Globe className="h-3.5 w-3.5 ml-2 mr-1 text-slate-400" />
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-2 py-1 rounded-md transition-all text-[11px] font-bold cursor-pointer ${
                locale === "en" ? "bg-[#0d5c4d] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("ta")}
              className={`px-2 py-1 rounded-md transition-all text-[11px] font-bold cursor-pointer ${
                locale === "ta" ? "bg-[#0d5c4d] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              தமிழ்
            </button>
            <button
              type="button"
              onClick={() => setLocale("si")}
              className={`px-2 py-1 rounded-md transition-all text-[11px] font-bold cursor-pointer ${
                locale === "si" ? "bg-[#0d5c4d] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              සිංහල
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 rounded-lg bg-[#051c18] border border-[#14473e] text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Toggle Dark / Light Theme"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-[#f3b738]" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
