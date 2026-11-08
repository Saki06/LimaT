"use client";

import React, { useState, useMemo } from "react";
import { Tenant } from "@/types/tenant";
import { HIERARCHICAL_MODULES } from "@/data/tenantMockData";
import { Search, Edit2, Trash2, Sliders, Check, Eye } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TenantSchoolsProps {
  tenants: Tenant[];
  activeTenantId: string;
  onSimulateTenant: (tenant: Tenant) => void;
  onEditTenant: (tenant: Tenant) => void;
  onDeleteTenant: (tenant: Tenant) => void;
  onConfigureFeatures: (tenantId: string) => void;
}

export const SUBJECT_FILTER_OPTIONS = [
  { key: "all", label: "👨‍🏫 All Tutors", shortName: "All" },
  {
    key: "maths",
    label: "📐 Combined Maths",
    shortName: "Combined Maths",
    keywords: [
      "math",
      "maths",
      "mathematics",
      "calculus",
      "algebra",
      "pure math",
      "applied math",
      "combined math",
      "geometry",
      "கணிதம்",
      "இணைந்த கணிதம்",
    ],
  },
  {
    key: "phys",
    label: "⚡ Physics",
    shortName: "Physics",
    keywords: [
      "phys",
      "physics",
      "quantum",
      "mechanics",
      "physical science",
      "பௌதிகவியல்",
      "இயற்பியல்",
    ],
  },
  {
    key: "chem",
    label: "🧪 Chemistry",
    shortName: "Chemistry",
    keywords: [
      "chem",
      "chemistry",
      "organic",
      "inorganic",
      "chemical",
      "இரசாயனவியல்",
      "வேதியியல்",
    ],
  },
  {
    key: "commerce",
    label: "📊 Commerce & Accounts",
    shortName: "Commerce & Accounts",
    keywords: [
      "commerce",
      "account",
      "accounts",
      "accounting",
      "business",
      "economics",
      "finance",
      "வணிகம்",
      "கணக்கியல்",
      "பொருளாதாரம்",
    ],
  },
];

export function TenantSchools({
  tenants,
  activeTenantId,
  onSimulateTenant,
  onEditTenant,
  onDeleteTenant,
  onConfigureFeatures
}: TenantSchoolsProps) {
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTenants = useMemo(() => {
    const selectedOption = SUBJECT_FILTER_OPTIONS.find((s) => s.key === subjectFilter);
    const keywords = selectedOption?.keywords;

    return tenants.filter((t) => {
      let matchSubject = subjectFilter === "all";

      if (!matchSubject && keywords) {
        const targetTexts: string[] = [
          t.name,
          t.tagline || "",
          t.code,
          t.adminName || "",
          t.address || "",
          ...(t.subjects || []),
          ...(t.courses || []),
        ].map((s) => (s ? s.toLowerCase() : ""));

        matchSubject = keywords.some((kw) =>
          targetTexts.some((text) => text.includes(kw))
        );
      }

      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        t.name.toLowerCase().includes(query) ||
        t.code.toLowerCase().includes(query) ||
        t.adminName.toLowerCase().includes(query) ||
        (t.tagline && t.tagline.toLowerCase().includes(query)) ||
        (t.subjects && t.subjects.some((s) => s.toLowerCase().includes(query))) ||
        (t.courses && t.courses.some((c) => c.toLowerCase().includes(query)));

      return matchSubject && matchQuery;
    });
  }, [tenants, subjectFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Subject Stream Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#e6ece8] shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {SUBJECT_FILTER_OPTIONS.map((sub) => (
            <button
              key={sub.key}
              onClick={() => setSubjectFilter(sub.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                subjectFilter === sub.key
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search institution, code, admin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#0d5c4d] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Empty State when no tutors match */}
      {filteredTenants.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white shadow-2xs space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl">
            {subjectFilter === "maths" ? "📐" : subjectFilter === "phys" ? "⚡" : subjectFilter === "chem" ? "🧪" : subjectFilter === "commerce" ? "📊" : "🔍"}
          </div>
          <h4 className="text-base font-black text-slate-800">
            {subjectFilter === "all"
              ? "No Tutors Found"
              : `No Tutors Found for ${SUBJECT_FILTER_OPTIONS.find((s) => s.key === subjectFilter)?.shortName || "Subject"}`}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {subjectFilter === "all"
              ? "No educational studios or tutors matched your search query."
              : `There are currently no educator studios tagged with this subject stream. You can edit an existing studio's "Subject Specialization" or register a new tutor studio.`}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {subjectFilter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubjectFilter("all")}
                className="text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                View All Tutors
              </Button>
            )}
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Clear Search
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Tenants Cards Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTenants.map((tenant) => {
          const enabledModulesCount = HIERARCHICAL_MODULES.filter((m) => tenant.enabledFeatures[m.key]).length;
          const isSimulated = tenant.id === activeTenantId;

          return (
            <Card
              key={tenant.id}
              className={`border transition-all bg-white shadow-2xs rounded-2xl overflow-hidden flex flex-col justify-between ${
                isSimulated ? "border-2 border-[#0d5c4d] ring-2 ring-[#0d5c4d]/20" : "border-[#e6ece8] hover:border-[#a5f3df]"
              }`}
            >
              <div>
                <CardHeader className="p-5 pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/70 to-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                          Solo Educator Studio
                        </Badge>

                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {tenant.code}
                        </span>

                        <Badge
                          className={`text-[10px] font-bold ${
                            tenant.status === "active"
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {tenant.status.toUpperCase()}
                        </Badge>

                        {isSimulated && (
                          <span className="px-2 py-0.5 rounded-full bg-[#0d5c4d] text-white text-[10px] font-black animate-pulse">
                            Live In Workspace
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-[#0d2b26] mt-1">{tenant.name}</h3>
                      {tenant.tagline && <p className="text-xs text-slate-500 italic">&ldquo;{tenant.tagline}&rdquo;</p>}

                      {tenant.subjects && tenant.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {tenant.subjects.slice(0, 3).map((sub, idx) => (
                            <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                              📚 {sub}
                            </span>
                          ))}
                          {tenant.subjects.length > 3 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              +{tenant.subjects.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditTenant(tenant)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] transition-colors cursor-pointer"
                        title="Edit Tenant"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTenant(tenant)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Tenant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-3.5 text-xs">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Students</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">{tenant.studentCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Active Staff</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">{tenant.teacherCount} Staff</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Monthly SaaS Fee</p>
                      <p className="text-sm font-black text-[#0d5c4d] mt-0.5">
                        LKR {tenant.monthlyFeeLkr.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Contact & Admin Details */}
                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <p>
                      <strong>Lead Tutor / Director:</strong> {tenant.adminName}
                    </p>
                    <p>
                      <strong>Email:</strong> {tenant.contactEmail} &bull; <strong>Phone:</strong> {tenant.contactPhone}
                    </p>
                  </div>

                  {/* Active Feature Summary Bar */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-[#0d5c4d]" /> Active Modules:
                    </span>
                    <span className="font-bold text-[#0d5c4d]">
                      {enabledModulesCount} of {HIERARCHICAL_MODULES.length} Modules Active
                    </span>
                  </div>
                </CardContent>
              </div>

              {/* Card Actions */}
              <div className="p-4 pt-0 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/40">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onConfigureFeatures(tenant.id)}
                  className="border-[#c4e9e0] text-[#0d5c4d] hover:bg-[#ecf8f5] text-xs font-bold cursor-pointer"
                >
                  <Sliders className="h-3.5 w-3.5 mr-1" /> Configure Sub-Features
                </Button>

                <Button
                  size="sm"
                  onClick={() => onSimulateTenant(tenant)}
                  className={`text-xs font-extrabold cursor-pointer shadow-xs ${
                    isSimulated
                      ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                      : "bg-[#0d5c4d] hover:bg-[#083e34] text-white"
                  }`}
                >
                  {isSimulated ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" /> Current Active Workspace
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 mr-1" /> Switch to This Tenant ↗
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}
