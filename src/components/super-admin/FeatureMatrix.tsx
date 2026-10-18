"use client";

import React, { useState } from "react";
import { Tenant, FeatureCategory } from "@/types/tenant";
import { HIERARCHICAL_MODULES, TENANT_PRESETS } from "@/data/tenantMockData";
import {
  Sparkles,
  ArrowRight,
  Search,
  Layers,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  CornerDownRight,
  Check,
  X
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface FeatureMatrixProps {
  tenants: Tenant[];
  matrixTenant: Tenant;
  selectedTenantForMatrix: string;
  onSelectTenantForMatrix: (tenantId: string) => void;
  onApplyPreset: (presetId: string) => void;
  onToggleFeature: (featureKey: string, enabled: boolean) => void;
  onBatchToggleCategory: (category: FeatureCategory, enable: boolean) => void;
  onBatchToggleSubOptions: (moduleKey: string, enable: boolean) => void;
}

export function FeatureMatrix({
  tenants,
  matrixTenant,
  selectedTenantForMatrix,
  onSelectTenantForMatrix,
  onApplyPreset,
  onToggleFeature,
  onBatchToggleCategory,
  onBatchToggleSubOptions
}: FeatureMatrixProps) {
  const [featureSearchQuery, setFeatureSearchQuery] = useState("");
  const [matrixRoleScope, setMatrixRoleScope] = useState<"all" | "student" | "teacher" | "admin">("all");

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    HIERARCHICAL_MODULES.forEach((m) => {
      initial[m.key] = true;
    });
    return initial;
  });

  const toggleModuleAccordion = (moduleKey: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  const categories: FeatureCategory[] = [
    "Batch Management & Announcements",
    "Tuition & Commercial Billing",
    "Live Broadcast & Studio",
    "Curriculum & Digital Learning",
    "Assessments & Examinations",
    "Tutor Branding & Monetization"
  ];

  return (
    <div className="space-y-6">
      {/* Target Tenant Selector & Preset Bar */}
      <Card className="border-[#c4e9e0] bg-white shadow-2xs p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded bg-[#0d5c4d] text-white">
              Target Customer Tenant
            </span>
            <h3 className="text-xl font-black text-[#0d2b26] flex items-center gap-2 mt-1">
              {matrixTenant.name}
              <span className="text-xs font-mono text-slate-500 font-normal">[{matrixTenant.code}]</span>
            </h3>
            <p className="text-xs text-slate-500">
              Toggle individual parent modules and granular sub-features to customize this customer&apos;s exact LMS capabilities.
            </p>
          </div>

          {/* Select Tenant Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Select Client:</span>
            <select
              value={selectedTenantForMatrix}
              onChange={(e) => onSelectTenantForMatrix(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#0d5c4d]"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 1-Click Preset Template Apply Buttons */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" /> 1-Click Feature Bundle Presets:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TENANT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onApplyPreset(preset.id)}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#0d5c4d] bg-slate-50/70 hover:bg-[#ecf8f5] text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-xs text-[#0d2b26] group-hover:text-[#0d5c4d]">
                    {preset.name}
                  </p>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0d5c4d] transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Role Scope & Search Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#e6ece8] shadow-2xs">
        {/* Separate by Portal / User Type */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setMatrixRoleScope("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              matrixRoleScope === "all"
                ? "bg-[#0d5c4d] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            🌐 All Modules
          </button>
          <button
            onClick={() => setMatrixRoleScope("student")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              matrixRoleScope === "student"
                ? "bg-blue-700 text-white shadow-xs"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100"
            }`}
          >
            👨‍🎓 Student Portal Features
          </button>
          <button
            onClick={() => setMatrixRoleScope("teacher")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              matrixRoleScope === "teacher"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-900 hover:bg-amber-100"
            }`}
          >
            👨‍🏫 Teacher Studio Features
          </button>
          <button
            onClick={() => setMatrixRoleScope("admin")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              matrixRoleScope === "admin"
                ? "bg-purple-700 text-white shadow-xs"
                : "bg-purple-50 text-purple-900 hover:bg-purple-100"
            }`}
          >
            ⚙️ Tutor Admin &amp; Branding
          </button>
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search module or sub-feature name..."
            value={featureSearchQuery}
            onChange={(e) => setFeatureSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#0d5c4d] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Categorized Hierarchical Modules & Sub-Options */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryModules = HIERARCHICAL_MODULES.filter((m) => {
            const matchesCategory = m.category === category;
            const matchesRole =
              matrixRoleScope === "all" ||
              m.targetRole === matrixRoleScope ||
              m.targetRole === "shared";
            const matchesSearch =
              !featureSearchQuery.trim() ||
              m.label.toLowerCase().includes(featureSearchQuery.toLowerCase()) ||
              m.key.toLowerCase().includes(featureSearchQuery.toLowerCase()) ||
              m.description.toLowerCase().includes(featureSearchQuery.toLowerCase()) ||
              m.subOptions.some(
                (s) =>
                  s.label.toLowerCase().includes(featureSearchQuery.toLowerCase()) ||
                  s.description.toLowerCase().includes(featureSearchQuery.toLowerCase())
              );
            return matchesCategory && matchesRole && matchesSearch;
          });

          if (categoryModules.length === 0) return null;

          const enabledModulesInCategory = categoryModules.filter((m) => matrixTenant.enabledFeatures[m.key]).length;

          return (
            <Card key={category} className="border-[#e6ece8] bg-white shadow-2xs overflow-hidden">
              <CardHeader className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-extrabold text-[#0d2b26] flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#0d5c4d]" />
                  <span>{category}</span>
                  <span className="text-xs font-normal text-slate-500">
                    ({enabledModulesInCategory}/{categoryModules.length} Modules Active)
                  </span>
                </CardTitle>

                {/* Batch Toggle Buttons for Category */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onBatchToggleCategory(category, true)}
                    className="text-[10px] font-bold text-[#0d5c4d] hover:underline cursor-pointer px-2 py-0.5 rounded hover:bg-emerald-50"
                  >
                    Enable All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => onBatchToggleCategory(category, false)}
                    className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer px-2 py-0.5 rounded hover:bg-rose-50"
                  >
                    Disable All
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {categoryModules.map((mod) => {
                  const isParentEnabled = !!matrixTenant.enabledFeatures[mod.key];
                  const isExpanded = expandedModules[mod.key] ?? true;
                  const activeSubCount = mod.subOptions.filter((s) => matrixTenant.enabledFeatures[s.key]).length;

                  return (
                    <div
                      key={mod.key}
                      className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:border-[#c4e9e0] transition-colors"
                    >
                      {/* Parent Module Header Bar */}
                      <div className="p-4 bg-gradient-to-r from-slate-50/90 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                        <div className="space-y-1 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => toggleModuleAccordion(mod.key)}
                              className="p-1 text-slate-500 hover:text-[#0d5c4d] cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                            <h4 className="text-sm font-black text-slate-900">{mod.label}</h4>
                            {mod.targetRole === "student" && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
                                👨‍🎓 Student Portal
                              </span>
                            )}
                            {mod.targetRole === "teacher" && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                                👨‍🏫 Teacher Studio
                              </span>
                            )}
                            {mod.targetRole === "admin" && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200">
                                🏫 School Admin
                              </span>
                            )}
                            {mod.targetRole === "shared" && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
                                👥 Student &amp; Faculty
                              </span>
                            )}
                            {mod.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                                {mod.badge}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400">({mod.key})</span>
                          </div>
                          <p className="text-xs text-slate-500 pl-6 leading-relaxed">{mod.description}</p>
                        </div>

                        {/* Parent Master Toggle Switch */}
                        <div className="flex items-center gap-3 shrink-0 pl-6 sm:pl-0">
                          <span className="text-[11px] font-bold text-slate-500">Master Module:</span>
                          <button
                            onClick={() => onToggleFeature(mod.key, !isParentEnabled)}
                            className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                              isParentEnabled
                                ? "bg-[#0d5c4d] text-white"
                                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                            }`}
                          >
                            {isParentEnabled ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                                <span>ENABLED</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3.5 w-3.5 text-slate-400" />
                                <span>DISABLED</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Sub-Options Granular Matrix (Accordion Body) */}
                      {isExpanded && (
                        <div className="p-4 bg-slate-50/50 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                              <CornerDownRight className="h-3.5 w-3.5 text-[#0d5c4d]" />
                              <span>Granular Sub-Features ({activeSubCount}/{mod.subOptions.length} Active)</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onBatchToggleSubOptions(mod.key, true)}
                                className="text-[10px] font-bold text-[#0d5c4d] hover:underline cursor-pointer"
                              >
                                Enable All Sub-Options
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                onClick={() => onBatchToggleSubOptions(mod.key, false)}
                                className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                              >
                                Disable All Sub-Options
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 pt-1">
                            {mod.subOptions.map((sub) => {
                              const isSubEnabled = !!matrixTenant.enabledFeatures[sub.key];

                              return (
                                <div
                                  key={sub.key}
                                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                                    isSubEnabled && isParentEnabled
                                      ? "bg-white border-emerald-200"
                                      : "bg-slate-100/60 border-slate-200 opacity-80"
                                  }`}
                                >
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="h-2 w-2 rounded-full shrink-0 bg-[#0d5c4d]" />
                                      <p className="text-xs font-bold text-slate-800">{sub.label}</p>
                                      <span className="text-[10px] font-mono text-slate-400">({sub.key})</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 pl-4">{sub.description}</p>
                                  </div>

                                  <button
                                    onClick={() => onToggleFeature(sub.key, !isSubEnabled)}
                                    className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                                      isSubEnabled
                                        ? "bg-[#0d5c4d] text-white shadow-2xs"
                                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                    }`}
                                  >
                                    {isSubEnabled ? (
                                      <>
                                        <Check className="h-3 w-3 text-emerald-300" />
                                        <span>ON</span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="h-3 w-3 text-slate-400" />
                                        <span>OFF</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
