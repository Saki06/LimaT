"use client";

import React, { useState } from "react";
import { Tenant, TenantType, TenantPlan, TenantStatus } from "@/types/tenant";
import { TENANT_PRESETS } from "@/data/tenantMockData";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTenant: (tenant: Tenant) => void;
}

export function CreateTenantModal({ isOpen, onClose, onAddTenant }: CreateTenantModalProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantData.name.trim() || !newTenantData.code.trim()) return;

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

    onAddTenant(createdTenant);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard New Tutor"
      description="Add a new independent educator to the platform and assign their initial study packages and live studio."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
            onClick={onClose}
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
  );
}

interface EditTenantModalProps {
  tenant: Tenant | null;
  onClose: () => void;
  onUpdateTenant: (tenant: Tenant) => void;
}

export function EditTenantModal({ tenant, onClose, onUpdateTenant }: EditTenantModalProps) {
  if (!tenant) return null;

  return (
    <Modal
      isOpen={!!tenant}
      onClose={onClose}
      title="Edit Client Tenant Profile"
      description="Update contact info, subscription status, and monthly pricing."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onUpdateTenant(tenant);
        }}
        className="space-y-4 pt-2"
      >
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Institution Name</label>
          <input
            type="text"
            required
            value={tenant.name}
            onChange={(e) => onUpdateTenant({ ...tenant, name: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject Specialization</label>
            <input
              type="text"
              value={tenant.tagline || ""}
              onChange={(e) => onUpdateTenant({ ...tenant, tagline: e.target.value })}
              placeholder="e.g. A/L Combined Mathematics"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subscription Status</label>
            <select
              value={tenant.status}
              onChange={(e) => onUpdateTenant({ ...tenant, status: e.target.value as TenantStatus })}
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
              value={tenant.monthlyFeeLkr}
              onChange={(e) => onUpdateTenant({ ...tenant, monthlyFeeLkr: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Admin / Principal Name</label>
            <input
              type="text"
              value={tenant.adminName}
              onChange={(e) => onUpdateTenant({ ...tenant, adminName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
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
    </Modal>
  );
}

interface DeleteTenantModalProps {
  tenant: Tenant | null;
  onClose: () => void;
  onConfirmDelete: (tenantId: string) => void;
}

export function DeleteTenantModal({ tenant, onClose, onConfirmDelete }: DeleteTenantModalProps) {
  if (!tenant) return null;

  return (
    <Modal
      isOpen={!!tenant}
      onClose={onClose}
      title="Delete Client Tenant"
      description="Are you sure you want to permanently remove this customer tenant and all associated data from the platform?"
    >
      <div className="space-y-4 pt-2">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
          <p className="font-bold text-sm text-rose-950">{tenant.name}</p>
          <p>Code: {tenant.code} &bull; Type: {tenant.type}</p>
          <p className="text-[11px] text-rose-700 pt-1">
            Warning: This will terminate the client&apos;s SaaS instance and remove all student/staff access.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirmDelete(tenant.id);
              onClose();
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
          >
            Delete Client Tenant
          </Button>
        </div>
      </div>
    </Modal>
  );
}
