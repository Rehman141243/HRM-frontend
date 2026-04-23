import { useCallback, useEffect, useState } from "react";
import PolicyModal from "../modals/policymodal";
import axiosInstance from "@/lib/axiosInstance";
import { Clock, Plus, Receipt, RefreshCw, Shield, UserCheck, Zap } from "lucide-react";
import { EmptyState } from "./modalcomponents";
import PolicyCard from "./policy-card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DeleteConfirmModal from '../modals/deletecomfirmmodal'
export default function PoliciesTab({ perms }) {
  const [policies, setPolicies] = useState({ attendance: [], overtime: [], tax: [], bonus: [] });
  const [loading, setLoading] = useState({ attendance: false, overtime: false, tax: false, bonus: false });
  const [activeType, setActiveType] = useState("attendance");
  const [policyModal, setPolicyModal] = useState({ open: false, type: null, policy: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, policy: null });
  const [saving, setSaving] = useState(false);

  const policyTypeConfig = [
    { key: "attendance", label: "Attendance", icon: <UserCheck className="w-3.5 h-3.5" /> },
    { key: "overtime", label: "Overtime", icon: <Clock className="w-3.5 h-3.5" /> },
    { key: "tax", label: "Tax", icon: <Receipt className="w-3.5 h-3.5" /> },
    { key: "bonus", label: "Bonus", icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  const API_PATHS = {
    attendance: "/policies/attendance",
    overtime: "/policies/overtime",
    tax: "/policies/tax",
    bonus: "/policies/bonus",
  };

  const loadPolicies = useCallback(async (type) => {
    setLoading((l) => ({ ...l, [type]: true }));
    try {
      const res = await axiosInstance.get(API_PATHS[type]);
      setPolicies((p) => ({ ...p, [type]: res.data.policies || [] }));
    } catch (e) {
      if (e.response?.status !== 404) toast.error(extractErrorMessage(e, `Failed to load ${type} policies`));
    } finally { setLoading((l) => ({ ...l, [type]: false })); }
  }, []);

  useEffect(() => { loadPolicies(activeType); }, [activeType]);

  const handleSave = async (id, payload, type, isEdit) => {
    setSaving(true);
    try {
      if (isEdit) {
        await axiosInstance.put(`${API_PATHS[type]}/${id}`, payload);
        toast.success("Policy updated successfully!");
      } else {
        await axiosInstance.post(API_PATHS[type], payload);
        toast.success("Policy created successfully!");
      }
      setPolicyModal({ open: false, type: null, policy: null });
      loadPolicies(type);
    } catch (e) { toast.error(extractErrorMessage(e, `Failed to ${isEdit ? "update" : "create"} policy`)); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    const { type, policy } = deleteModal;
    setSaving(true);
    try {
      await axiosInstance.delete(`${API_PATHS[type]}/${policy.id}`);
      toast.success("Policy deleted.");
      setDeleteModal({ open: false, type: null, policy: null });
      loadPolicies(type);
    } catch (e) { toast.error(extractErrorMessage(e, "Failed to delete policy")); }
    finally { setSaving(false); }
  };

  const currentPolicies = policies[activeType] || [];
  const isLoading = loading[activeType];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex rounded-xl border border-gray-200 dark:border-gray-500 overflow-hidden dark:bg-gray-900/50 bg-gray-50 p-1 gap-0.5">
          {policyTypeConfig.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveType(key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                activeType === key
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              {icon}
              {label}

              {policies[key].length > 0 && (
                <span className="ml-0.5 text-[9px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-1.5 py-0.5">
                  {policies[key].length}
                </span>
              )}
            </button>
          ))}
        </div>
        {perms.canManagePolicies && (
          <Button size="sm" className="h-8 gap-1.5" onClick={() => setPolicyModal({ open: true, type: activeType, policy: null })}>
            <Plus className="w-3.5 h-3.5" />New {activeType.charAt(0).toUpperCase() + activeType.slice(1)} Policy
          </Button>
        )}
      </div>

      {isLoading ? (
        <EmptyState icon={RefreshCw} message={`Loading ${activeType} policies…`} />
      ) : currentPolicies.length === 0 ? (
        <EmptyState icon={Shield} message={`No ${activeType} policies found. ${perms.canManagePolicies ? "Create one to get started." : ""}`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentPolicies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              type={activeType}
              canManage={perms.canManagePolicies}
              onEdit={(p) => setPolicyModal({ open: true, type: activeType, policy: p })}
              onDelete={(p) => setDeleteModal({ open: true, type: activeType, policy: p })}
            />
          ))}
        </div>
      )}

      <PolicyModal
        open={policyModal.open}
        onClose={() => setPolicyModal({ open: false, type: null, policy: null })}
        type={policyModal.type}
        policy={policyModal.policy}
        onSave={handleSave}
        loading={saving}
      />
      <DeleteConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: null, policy: null })}
        onConfirm={handleDelete}
        loading={saving}
        title={`Delete ${deleteModal.type} policy?`}
        description={`Are you sure you want to delete "${deleteModal.policy?.name}"? This may affect salary structures using this policy.`}
      />
    </div>
  );
}
