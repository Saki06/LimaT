"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Tenant, TenantType, TenantPlan, TenantStatus, FeatureCategory } from "@/types/tenant";
import { HIERARCHICAL_MODULES, TENANT_PRESETS } from "@/data/tenantMockData";
import {
  Shield,
  Building2,
  School,
  GraduationCap,
  Users,
  CreditCard,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Plus,
  Search,
  Filter,
  Sparkles,
  Settings,
  Layers,
  ArrowRight,
  ExternalLink,
  Eye,
  Edit2,
  Trash2,
  Radio,
  Sliders,
  DollarSign,
  Calendar,
  AlertCircle,
  Check,
  X,
  Lock,
  Unlock,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  CornerDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

type SuperAdminTab = "tenants" | "feature_matrix" | "pricing_plans";

interface SuperAdminPortalViewProps {
  initialTab?: SuperAdminTab;
}

export function SuperAdminPortalView({ initialTab }: SuperAdminPortalViewProps = {}) {
  const {
    tenants,
    activeTenantId,
    activeTenant,
    setActiveTenantId,
    updateTenantFeature,
    applyTenantPreset,
    addTenant,
    updateTenant,
    deleteTenant,
    currentView,
    setCurrentView
  } = useApp();

  const getTabFromView = (view: string): SuperAdminTab => {
    if (view === "super_admin_matrix" || view === "feature_matrix") return "feature_matrix";
    if (view === "super_admin_pricing" || view === "pricing_plans") return "pricing_plans";
    return "tenants";
  };

  const [activeTab, setActiveTab] = useState<SuperAdminTab>(() => {
    if (initialTab) return initialTab;
    return getTabFromView(currentView);
  });

  // Keep activeTab in sync with currentView and initialTab when sidebar items are clicked
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else {
      setActiveTab(getTabFromView(currentView));
    }
  }, [currentView, initialTab]);

  const handleTabChange = (tab: SuperAdminTab) => {
    setActiveTab(tab);
    if (tab === "tenants") setCurrentView("super_admin_tenants");
    else if (tab === "feature_matrix") setCurrentView("super_admin_matrix");
    else if (tab === "pricing_plans") setCurrentView("super_admin_pricing");
  };
  const [selectedTenantForMatrix, setSelectedTenantForMatrix] = useState<string>(activeTenantId);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [featureSearchQuery, setFeatureSearchQuery] = useState("");
  const [matrixRoleScope, setMatrixRoleScope] = useState<"all" | "student" | "teacher" | "admin">("all");

  // Track expanded state of sub-options per module key
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    HIERARCHICAL_MODULES.forEach((m) => {
      initial[m.key] = true; // default all expanded for easy discovery
    });
    return initial;
  });

  const toggleModuleAccordion = (moduleKey: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Tenant Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTenantData, setNewTenantData] = useState({
    name: "",
    code: "",
    type: "individual_teacher" as TenantType,
    plan: "pro" as TenantPlan,
    adminName: "",
    contactEmail: "",
    contactPhone: "",
    monthlyFeeLkr: 18000,
    address: "",
    studentCount: 150,
    teacherCount: 1
  });

  // Edit Tenant Modal
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // Deleting Tenant Modal
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);

  // Filtered tenants by subject or search
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchSubject =
        subjectFilter === "all" ||
        t.name.toLowerCase().includes(subjectFilter.toLowerCase()) ||
        (t.tagline && t.tagline.toLowerCase().includes(subjectFilter.toLowerCase())) ||
        t.code.toLowerCase().includes(subjectFilter.toLowerCase());
      const matchQuery =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.adminName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchQuery;
    });
  }, [tenants, subjectFilter, searchQuery]);

  // Current tenant for matrix
  const matrixTenant = tenants.find((t) => t.id === selectedTenantForMatrix) || activeTenant;

  // Platform Metrics
  const totalRevenue = tenants.reduce((acc, t) => acc + (t.status === "active" ? t.monthlyFeeLkr : 0), 0);
  const totalStudents = tenants.reduce((acc, t) => acc + t.studentCount, 0);
  const activeTenantsCount = tenants.filter((t) => t.status === "active").length;

  // Total count of all sub-options
  const totalSubOptionsCount = HIERARCHICAL_MODULES.reduce((acc, m) => acc + m.subOptions.length, 0);

  // Handle Switch to Tenant
  const handleSimulateTenant = (tenant: Tenant) => {
    setActiveTenantId(tenant.id);
    setSelectedTenantForMatrix(tenant.id);
    showToast(`Switched active workspace to: ${tenant.name} (${tenant.type.toUpperCase()})`);
  };

  // Handle Add Tenant Submit
  const handleAddTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantData.name.trim() || !newTenantData.code.trim()) {
      showToast("Please fill in the institution name and code.");
      return;
    }

    // Pick preset by type
    const preset =
      TENANT_PRESETS.find((p) => p.type === newTenantData.type) || TENANT_PRESETS[0];

    const createdTenant: Tenant = {
      id: `tenant_${Date.now()}`,
      name: newTenantData.name,
      code: newTenantData.code.toUpperCase(),
      type: newTenantData.type,
      plan: newTenantData.plan,
      status: "active",
      contactEmail: newTenantData.contactEmail || "admin@institution.lk",
      contactPhone: newTenantData.contactPhone || "+94 11 000 0000",
      adminName: newTenantData.adminName || "Administrator",
      studentCount: Number(newTenantData.studentCount) || 500,
      teacherCount: Number(newTenantData.teacherCount) || 20,
      monthlyFeeLkr: Number(newTenantData.monthlyFeeLkr) || 50000,
      createdAt: new Date().toISOString().split("T")[0],
      renewalDate: "2027-12-31",
      address: newTenantData.address || "Sri Lanka",
      enabledFeatures: { ...preset.features }
    };

    addTenant(createdTenant);
    setIsAddModalOpen(false);
    showToast(`Successfully onboarded "${createdTenant.name}" with default ${preset.name} features!`);
  };

  // Handle Edit Tenant Submit
  const handleEditTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    updateTenant(editingTenant);
    setEditingTenant(null);
    showToast(`Updated details for "${editingTenant.name}".`);
  };

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deletingTenant) return;
    deleteTenant(deletingTenant.id);
    showToast(`Deleted client tenant "${deletingTenant.name}".`);
    setDeletingTenant(null);
  };

  // Categories for Feature Matrix
  const categories: FeatureCategory[] = [
    "Batch Management & Announcements",
    "Tuition & Commercial Billing",
    "Live Broadcast & Studio",
    "Curriculum & Digital Learning",
    "Assessments & Examinations",
    "Tutor Branding & Monetization"
  ];

  // Batch toggle all features in a category (parent + sub-options)
  const handleBatchToggleCategory = (category: FeatureCategory, enable: boolean) => {
    const categoryModules = HIERARCHICAL_MODULES.filter((m) => m.category === category);
    categoryModules.forEach((mod) => {
      updateTenantFeature(matrixTenant.id, mod.key, enable);
      mod.subOptions.forEach((sub) => {
        updateTenantFeature(matrixTenant.id, sub.key, enable);
      });
    });
    showToast(`${enable ? "Enabled" : "Disabled"} all modules & sub-features in "${category}" for ${matrixTenant.name}`);
  };

  // Batch toggle sub-options of a specific module
  const handleBatchToggleSubOptions = (moduleKey: string, enable: boolean) => {
    const targetModule = HIERARCHICAL_MODULES.find((m) => m.key === moduleKey);
    if (!targetModule) return;
    targetModule.subOptions.forEach((sub) => {
      updateTenantFeature(matrixTenant.id, sub.key, enable);
    });
    showToast(`${enable ? "Enabled" : "Disabled"} all sub-options for "${targetModule.label}"`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#082a24] text-white shadow-2xl flex items-center gap-3 border border-[#f3b738] animate-in slide-in-from-top-4 duration-200">
          <Sparkles className="h-5 w-5 text-[#f3b738] shrink-0" />
          <div className="text-xs">
            <p className="font-extrabold text-sm text-[#f3b738]">Platform Control Center</p>
            <p className="text-slate-100">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/20 rounded-lg text-white/80 cursor-pointer ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Banner: Master Management Portal */}
      <Card className="border-[#0d5c4d]/30 bg-gradient-to-br from-[#082a24] via-[#0d3b32] to-[#051c18] text-white shadow-md overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#f3b738] text-slate-950 text-xs font-black tracking-wide uppercase flex items-center gap-1.5 shadow-sm">
                  <Shield className="h-3.5 w-3.5" />
                  Master Super Admin &bull; Platform Owner
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300 bg-white/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                  Multi-Tenant SaaS Engine
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Global Creator &amp; Tutor Management Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
                Manage all registered educators (Tutors and Tuition Coaching Studios). Turn specific parent modules and granular sub-features ON/OFF per creator, assign custom plan presets, and simulate any tutor&apos;s live workspace experience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Simulation Bar: Shows currently active simulated tenant */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-2 border-[#0d5c4d]/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#0d5c4d] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            👨‍🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-[#0d5c4d] text-white">
                Active Tutor Simulator
              </span>
              <span className="text-xs font-mono text-slate-500">[{activeTenant.code}]</span>
            </div>
            <p className="text-sm font-black text-[#0d2b26] mt-0.5">
              {activeTenant.name}{" "}
              <span className="text-xs font-normal text-slate-500">
                &bull; Independent Solo Educator Studio
              </span>
            </p>
          </div>
        </div>

        {/* Quick Tenant Switch Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 hidden sm:inline">Switch Workspace:</span>
          <select
            value={activeTenantId}
            onChange={(e) => {
              const t = tenants.find((item) => item.id === e.target.value);
              if (t) handleSimulateTenant(t);
            }}
            className="p-2 rounded-xl border-2 border-[#0d5c4d] bg-white text-xs font-bold text-[#0d2b26] cursor-pointer focus:outline-hidden"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (Tutor)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Global SaaS Platform Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#e6ece8] bg-white shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Registered Tutors</p>
              <p className="text-2xl font-black text-[#0d2b26] mt-1">{tenants.length} Tutors</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{activeTenantsCount} active educator studios</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e6ece8] bg-white shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Monthly SaaS MRR</p>
              <p className="text-2xl font-black text-[#0d5c4d] mt-1">LKR {totalRevenue.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Recurring SaaS revenue</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e6ece8] bg-white shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Platform Students</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalStudents.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Across all client databases</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#fef7e6] text-[#b47a16] flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#c4e9e0] shadow-xs">
        <button
          onClick={() => handleTabChange("tenants")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "tenants"
              ? "bg-[#0d5c4d] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Tutor Directory</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
            {tenants.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("feature_matrix")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "feature_matrix"
              ? "bg-[#0d5c4d] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Granular Sub-Feature Matrix</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef7e6] text-[#b47a16]">
            {totalSubOptionsCount} Sub-Options
          </span>
        </button>

        <button
          onClick={() => handleTabChange("pricing_plans")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "pricing_plans"
              ? "bg-[#0d5c4d] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>SaaS Edition Presets &amp; Pricing</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: CLIENT TENANTS DIRECTORY                                     */}
      {/* =================================================================== */}
      {activeTab === "tenants" && (
        <div className="space-y-4">
          {/* Subject Stream Filter & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#e6ece8] shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { key: "all", label: "👨‍🏫 All Tutors" },
                { key: "maths", label: "📐 Combined Maths" },
                { key: "phys", label: "⚡ Physics" },
                { key: "chem", label: "🧪 Chemistry" },
                { key: "commerce", label: "📊 Commerce & Accounts" }
              ].map((sub) => (
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

          {/* Tenants Cards Grid */}
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
                            <Badge
                              className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900"
                            >
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
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setEditingTenant(tenant)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] transition-colors cursor-pointer"
                            title="Edit Tenant"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingTenant(tenant)}
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
                      onClick={() => {
                        setSelectedTenantForMatrix(tenant.id);
                        handleTabChange("feature_matrix");
                      }}
                      className="border-[#c4e9e0] text-[#0d5c4d] hover:bg-[#ecf8f5] text-xs font-bold cursor-pointer"
                    >
                      <Sliders className="h-3.5 w-3.5 mr-1" /> Configure Sub-Features
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleSimulateTenant(tenant)}
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
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: GRANULAR SUB-FEATURE MATRIX                                  */}
      {/* =================================================================== */}
      {activeTab === "feature_matrix" && (
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
                  Toggle individual parent modules and granular sub-features to customize this customer's exact LMS capabilities.
                </p>
              </div>

              {/* Select Tenant Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Select Client:</span>
                <select
                  value={selectedTenantForMatrix}
                  onChange={(e) => setSelectedTenantForMatrix(e.target.value)}
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
                    onClick={() => {
                      applyTenantPreset(matrixTenant.id, preset.id);
                      showToast(`Applied "${preset.name}" preset bundle to ${matrixTenant.name}!`);
                    }}
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
                        onClick={() => handleBatchToggleCategory(category, true)}
                        className="text-[10px] font-bold text-[#0d5c4d] hover:underline cursor-pointer px-2 py-0.5 rounded hover:bg-emerald-50"
                      >
                        Enable All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => handleBatchToggleCategory(category, false)}
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
                                onClick={() => {
                                  updateTenantFeature(matrixTenant.id, mod.key, !isParentEnabled);
                                  showToast(
                                    `${!isParentEnabled ? "Enabled" : "Disabled"} Master Module "${mod.label}" for ${matrixTenant.name}`
                                  );
                                }}
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
                                    onClick={() => handleBatchToggleSubOptions(mod.key, true)}
                                    className="text-[10px] font-bold text-[#0d5c4d] hover:underline cursor-pointer"
                                  >
                                    Enable All Sub-Options
                                  </button>
                                  <span className="text-slate-300">|</span>
                                  <button
                                    onClick={() => handleBatchToggleSubOptions(mod.key, false)}
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

                                      {/* Granular Sub-Option Toggle */}
                                      <button
                                        onClick={() => {
                                          updateTenantFeature(matrixTenant.id, sub.key, !isSubEnabled);
                                          showToast(
                                            `${!isSubEnabled ? "Enabled" : "Disabled"} sub-option "${sub.label}"`
                                          );
                                        }}
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
      )}

      {/* =================================================================== */}
      {/* TAB 3: SAAS EDITIONS & PRICING PLANS                                */}
      {/* =================================================================== */}
      {activeTab === "pricing_plans" && (
        <div className="space-y-6">
          <Card className="border-[#c4e9e0] bg-white shadow-2xs p-6 space-y-4">
            <h3 className="text-lg font-black text-[#0d2b26]">Commercial SaaS Packaging &amp; Licensing</h3>
            <p className="text-xs text-slate-600 max-w-3xl">
              We offer 3 standardized SaaS editions tailored to distinct customer market segments in Sri Lanka:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Plan 1: Solo Creator Starter */}
              <div className="p-5 rounded-2xl border-2 border-slate-300 bg-slate-50/60 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <Badge className="bg-slate-200 text-slate-800 font-extrabold text-[10px]">
                    Solo Creator Starter
                  </Badge>
                  <div>
                    <p className="text-2xl font-black text-[#0d2b26]">LKR 8,500</p>
                    <p className="text-[11px] text-slate-500 font-semibold">/ month &bull; 1 Tutor License</p>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Pre-recorded Video Courses
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Downloadable Past Paper Library
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Homework &amp; Quiz Submissions
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Up to 100 Enrolled Students
                    </li>
                    <li className="flex items-center gap-1.5 text-slate-400 line-through">
                      <X className="h-3.5 w-3.5" /> Live Google Meet Studio
                    </li>
                    <li className="flex items-center gap-1.5 text-slate-400 line-through">
                      <X className="h-3.5 w-3.5" /> Multi-Teacher Management
                    </li>
                  </ul>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    setNewTenantData((prev) => ({
                      ...prev,
                      type: "individual_teacher",
                      plan: "starter",
                      monthlyFeeLkr: 8500
                    }));
                    setIsAddModalOpen(true);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  Onboard Starter Tutor
                </Button>
              </div>

              {/* Plan 2: Solo Educator Pro */}
              <div className="p-5 rounded-2xl border-2 border-emerald-400 bg-emerald-50/50 space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-100 text-emerald-900 font-extrabold text-[10px]">
                      Solo Educator Pro
                    </Badge>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#0d2b26]">LKR 18,000</p>
                    <p className="text-[11px] text-slate-500 font-semibold">/ month &bull; 1 Tutor License</p>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Unlimited Enrolled Students
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Direct Tuition Subscriptions
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> BOC / Commercial Bank Slip Approvals
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Live Meet / Zoom Broadcast Studio
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Interactive Study Packages &amp; Syllabus
                    </li>
                    <li className="flex items-center gap-1.5 text-slate-400 line-through">
                      <X className="h-3.5 w-3.5" /> Multi-Teacher Management
                    </li>
                  </ul>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    setNewTenantData((prev) => ({
                      ...prev,
                      type: "individual_teacher",
                      plan: "pro",
                      monthlyFeeLkr: 18000
                    }));
                    setIsAddModalOpen(true);
                  }}
                  className="w-full bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold cursor-pointer"
                >
                  Onboard Pro Tutor
                </Button>
              </div>

              {/* Plan 3: Solo Masterclass Elite */}
              <div className="p-5 rounded-2xl border-2 border-purple-400 bg-purple-50/40 space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <Badge className="bg-purple-100 text-purple-900 font-extrabold text-[10px]">
                    Solo Masterclass Elite
                  </Badge>
                  <div>
                    <p className="text-2xl font-black text-[#0d2b26]">LKR 28,000</p>
                    <p className="text-[11px] text-slate-500 font-semibold">/ month &bull; 1 Tutor License</p>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-purple-600" /> Unlimited Enrolled Students
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-purple-600" /> 1-on-1 Paper Evaluation &amp; Solutions
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-purple-600" /> Model Paper &amp; Revision Marketplace
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-purple-600" /> Priority Dedicated Video CDN
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-purple-600" /> Automated WhatsApp SMS Alerts
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-purple-600" /> Custom Domain &amp; Tutor Brand
                    </li>
                  </ul>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    setNewTenantData((prev) => ({
                      ...prev,
                      type: "individual_teacher",
                      plan: "enterprise",
                      monthlyFeeLkr: 28000
                    }));
                    setIsAddModalOpen(true);
                  }}
                  className="w-full bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold cursor-pointer"
                >
                  Onboard Masterclass Tutor
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: ONBOARD NEW TUTOR                                          */}
      {/* =================================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Tutor"
        description="Add a new independent educator to the platform and assign their initial study packages and live studio."
      >
        <form onSubmit={handleAddTenantSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tutor Name &amp; Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Samantha Perera / Eng. K. Thanushan"
              value={newTenantData.name}
              onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#0d5c4d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tutor Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TUTOR-MATHS"
                value={newTenantData.code}
                onChange={(e) => setNewTenantData({ ...newTenantData, code: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-[#0d5c4d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject Specialization</label>
              <input
                type="text"
                placeholder="e.g. Combined Mathematics"
                value={newTenantData.address}
                onChange={(e) => setNewTenantData({ ...newTenantData, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lead Tutor / Director</label>
              <input
                type="text"
                placeholder="e.g. Dr. Samantha Perera"
                value={newTenantData.adminName}
                onChange={(e) => setNewTenantData({ ...newTenantData, adminName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#0d5c4d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Monthly SaaS Fee (LKR)</label>
              <input
                type="number"
                value={newTenantData.monthlyFeeLkr}
                onChange={(e) => setNewTenantData({ ...newTenantData, monthlyFeeLkr: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                placeholder="admin@school.lk"
                value={newTenantData.contactEmail}
                onChange={(e) => setNewTenantData({ ...newTenantData, contactEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#0d5c4d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+94 11 200 0000"
                value={newTenantData.contactPhone}
                onChange={(e) => setNewTenantData({ ...newTenantData, contactPhone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold cursor-pointer"
            >
              Onboard &amp; Activate Client
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 2: EDIT TENANT DETAILS                                        */}
      {/* =================================================================== */}
      <Modal
        isOpen={!!editingTenant}
        onClose={() => setEditingTenant(null)}
        title="Edit Client Tenant Profile"
        description="Update contact info, subscription status, and monthly pricing."
      >
        {editingTenant && (
          <form onSubmit={handleEditTenantSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institution Name</label>
              <input
                type="text"
                required
                value={editingTenant.name}
                onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Specialization</label>
                <input
                  type="text"
                  value={editingTenant.tagline || ""}
                  onChange={(e) => setEditingTenant({ ...editingTenant, tagline: e.target.value })}
                  placeholder="e.g. A/L Combined Mathematics"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subscription Status</label>
                <select
                  value={editingTenant.status}
                  onChange={(e) => setEditingTenant({ ...editingTenant, status: e.target.value as TenantStatus })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Fee (LKR)</label>
                <input
                  type="number"
                  value={editingTenant.monthlyFeeLkr}
                  onChange={(e) => setEditingTenant({ ...editingTenant, monthlyFeeLkr: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin / Principal Name</label>
                <input
                  type="text"
                  value={editingTenant.adminName}
                  onChange={(e) => setEditingTenant({ ...editingTenant, adminName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingTenant(null)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold cursor-pointer"
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 3: DELETE TENANT CONFIRMATION                                 */}
      {/* =================================================================== */}
      <Modal
        isOpen={!!deletingTenant}
        onClose={() => setDeletingTenant(null)}
        title="Delete Client Tenant"
        description="Are you sure you want to permanently remove this customer tenant and all associated data from the platform?"
      >
        {deletingTenant && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
              <p className="font-bold text-sm text-rose-950">{deletingTenant.name}</p>
              <p>Code: {deletingTenant.code} &bull; Type: {deletingTenant.type}</p>
              <p className="text-[11px] text-rose-700 pt-1">
                Warning: This will terminate the client's SaaS instance and remove all student/staff access.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingTenant(null)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Delete Client Tenant
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
