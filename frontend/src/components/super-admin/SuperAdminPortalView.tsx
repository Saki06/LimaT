"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Tenant, FeatureCategory } from "@/types/tenant";
import { HIERARCHICAL_MODULES } from "@/data/tenantMockData";
import {
  Shield,
  Building2,
  Users,
  CreditCard,
  Sparkles,
  Sliders,
  DollarSign,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TenantSchools } from "./TenantSchools";
import { FeatureMatrix } from "./FeatureMatrix";
import { SaasBilling } from "./SaasBilling";
import { CreateTenantModal, EditTenantModal, DeleteTenantModal } from "./CreateTenantModal";

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);

  // Current tenant for matrix
  const matrixTenant = tenants.find((t) => t.id === selectedTenantForMatrix) || activeTenant;

  // Platform Metrics
  const totalRevenue = tenants.reduce((acc, t) => acc + (t.status === "active" ? t.monthlyFeeLkr : 0), 0);
  const totalStudents = tenants.reduce((acc, t) => acc + t.studentCount, 0);
  const activeTenantsCount = tenants.filter((t) => t.status === "active").length;
  const totalSubOptionsCount = HIERARCHICAL_MODULES.reduce((acc, m) => acc + m.subOptions.length, 0);

  const handleSimulateTenant = (tenant: Tenant) => {
    setActiveTenantId(tenant.id);
    setSelectedTenantForMatrix(tenant.id);
    showToast(`Switched active workspace to: ${tenant.name} (${tenant.type.toUpperCase()})`);
  };

  const handleBatchToggleCategory = (category: FeatureCategory, enable: boolean) => {
    const categoryModules = HIERARCHICAL_MODULES.filter((m) => m.category === category);
    categoryModules.forEach((mod) => {
      updateTenantFeature(matrixTenant.id, mod.key, enable);
      mod.subOptions.forEach((sub) => {
        updateTenantFeature(matrixTenant.id, sub.key, enable);
      });
    });
    showToast(`${enable ? "Enabled" : "Disabled"} all modules in "${category}" for ${matrixTenant.name}`);
  };

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
                Manage all registered educators. Turn specific modules and granular sub-features ON/OFF per creator, assign custom plan presets, and simulate any tutor&apos;s live workspace.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Simulation Bar */}
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

      {/* TAB 1: CLIENT TENANTS DIRECTORY */}
      {activeTab === "tenants" && (
        <TenantSchools
          tenants={tenants}
          activeTenantId={activeTenantId}
          onSimulateTenant={handleSimulateTenant}
          onEditTenant={(tenant) => setEditingTenant(tenant)}
          onDeleteTenant={(tenant) => setDeletingTenant(tenant)}
          onConfigureFeatures={(tenantId) => {
            setSelectedTenantForMatrix(tenantId);
            handleTabChange("feature_matrix");
          }}
        />
      )}

      {/* TAB 2: GRANULAR SUB-FEATURE MATRIX */}
      {activeTab === "feature_matrix" && (
        <FeatureMatrix
          tenants={tenants}
          matrixTenant={matrixTenant}
          selectedTenantForMatrix={selectedTenantForMatrix}
          onSelectTenantForMatrix={setSelectedTenantForMatrix}
          onApplyPreset={(presetId) => {
            applyTenantPreset(matrixTenant.id, presetId);
            showToast(`Applied preset bundle to ${matrixTenant.name}!`);
          }}
          onToggleFeature={(key, enabled) => {
            updateTenantFeature(matrixTenant.id, key, enabled);
            showToast(`${enabled ? "Enabled" : "Disabled"} feature for ${matrixTenant.name}`);
          }}
          onBatchToggleCategory={handleBatchToggleCategory}
          onBatchToggleSubOptions={handleBatchToggleSubOptions}
        />
      )}

      {/* TAB 3: SAAS EDITIONS & PRICING PLANS */}
      {activeTab === "pricing_plans" && (
        <SaasBilling
          onSelectPlanForOnboard={() => {
            setIsAddModalOpen(true);
          }}
        />
      )}

      {/* MODALS */}
      <CreateTenantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTenant={(newTenant) => {
          addTenant(newTenant);
          showToast(`Successfully onboarded "${newTenant.name}"!`);
        }}
      />

      <EditTenantModal
        tenant={editingTenant}
        onClose={() => setEditingTenant(null)}
        onUpdateTenant={(updated) => {
          updateTenant(updated);
          setEditingTenant(null);
          showToast(`Updated details for "${updated.name}".`);
        }}
      />

      <DeleteTenantModal
        tenant={deletingTenant}
        onClose={() => setDeletingTenant(null)}
        onConfirmDelete={(id) => {
          deleteTenant(id);
          showToast("Deleted client tenant.");
          setDeletingTenant(null);
        }}
      />
    </div>
  );
}
