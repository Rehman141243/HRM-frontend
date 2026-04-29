'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getPermissions } from "@/components/modal-components/modalcomponents";
import { getUser } from "@/lib/auth";
import DeleteConfirmModal from "@/components/modals/deletecomfirmmodal";
import PolicyDetailModal from "@/components/modals/policy-details-modal";
import { usePolicies } from "@/components/modals/createstucturemodal";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { buildPolicyColumns } from "./policy-columns";
import { Clock, Plus, RefreshCw, Shield, UserCheck, Receipt, Zap, CheckCircle2, X } from "lucide-react";

// ============= CONSTANTS & UTILS =============
export const API_PATHS = {
  attendance: "/policies/attendance",
  overtime: "/policies/overtime",
  tax: "/policies/tax",
  bonus: "/policies/bonus",
};

export const POLICY_TYPE_META = {
  attendance: {
    key: "attendance",
    label: "Attendance",
    title: "Attendance Policies",
    description: "Manage attendance-related policy settings.",
    Icon: UserCheck,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  overtime: {
    key: "overtime",
    label: "Overtime",
    title: "Overtime Policies",
    description: "Manage overtime policy settings.",
    Icon: Clock,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  tax: {
    key: "tax",
    label: "Tax",
    title: "Tax Policies",
    description: "Manage tax policy settings.",
    Icon: Receipt,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  bonus: {
    key: "bonus",
    label: "Bonus",
    title: "Bonus Policies",
    description: "Manage bonus policy settings.",
    Icon: Zap,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
};

export const POLICY_TYPE_ORDER = ["attendance", "overtime", "tax", "bonus"];

export const getPolicyTypeMeta = (type) => POLICY_TYPE_META[type] || POLICY_TYPE_META.attendance;

export const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const buildInitialForm = (type, policy) => {
  const source = policy ?? {};
  const joinArray = (value) => (Array.isArray(value) ? value.join(",") : (value || ""));

  if (type === "attendance") return {
    name: source.name || "",
    timezone: source.timezone || "Asia/Karachi",
    apply_proration_default: source.apply_proration_default ?? true,
    grace_minutes_default: source.grace_minutes_default ?? 0,
    late_count_for_unpaid_day: source.late_count_for_unpaid_day ?? 3,
    min_hours_for_present: source.min_hours_for_present ?? 0,
    min_hours_for_half_day: source.min_hours_for_half_day ?? 2,
    full_day_hours: source.full_day_hours ?? 8,
    no_checkout_behavior: source.no_checkout_behavior || "present",
    short_hours_behavior: source.short_hours_behavior || "present",
    short_hours_payable: source.short_hours_payable ?? 1,
    weekly_off_days: joinArray(source.weekly_off_days) || "0,6",
    holiday_dates: joinArray(source.holiday_dates),
    working_weekend_dates: joinArray(source.working_weekend_dates),
    forced_working_dates: joinArray(source.forced_working_dates),
    manual_off_dates: joinArray(source.manual_off_dates),
  };

  if (type === "overtime") return {
    name: source.name || "",
    apply_proration_default: source.apply_proration_default ?? false,
    standard_work_hours_per_day: source.standard_work_hours_per_day ?? 8,
    multiplier: source.multiplier ?? 1.5,
    min_hours_per_day: source.min_hours_per_day ?? 0,
    max_hours_per_day: source.max_hours_per_day ?? 4,
    max_hours_per_month: source.max_hours_per_month ?? 20,
  };

  if (type === "tax") return {
    name: source.name || "",
    tax_mode_default: source.tax_mode_default || "slab",
    apply_proration_default: source.apply_proration_default ?? false,
    tax_rate_default: source.tax_rate_default ?? "",
    tax_slabs: Array.isArray(source.tax_slabs)
      ? source.tax_slabs
      : [{ up_to: 50000, rate: 0 }, { up_to: 100000, rate: 5 }, { up_to: null, rate: 15 }],
  };

  if (type === "bonus") return {
    name: source.name || "",
    bonus_mode_default: source.bonus_mode_default || "fixed",
    bonus_rate_default: source.bonus_rate_default ?? "",
    apply_proration_default: source.apply_proration_default ?? true,
    min_present_days: source.min_present_days ?? "",
    min_payable_days: source.min_payable_days ?? "",
    max_unpaid_leave_days: source.max_unpaid_leave_days ?? "",
    require_full_attendance: source.require_full_attendance ?? false,
  };

  return {};
};

export const buildPayload = (type, form) => {
  const payload = { ...form };

  if (type === "attendance") {
    const allowed = [
      "name", "timezone", "apply_proration_default", "grace_minutes_default",
      "late_count_for_unpaid_day", "shift_grace_by_shift_name", "weekly_off_days",
      "working_weekend_dates", "holiday_dates", "forced_working_dates", "manual_off_dates",
    ];
    Object.keys(payload).forEach((key) => { if (!allowed.includes(key)) delete payload[key]; });
    ["grace_minutes_default", "late_count_for_unpaid_day"].forEach((key) => {
      if (payload[key] !== "") payload[key] = Number(payload[key]);
    });
    ["holiday_dates", "working_weekend_dates", "forced_working_dates", "manual_off_dates"].forEach((key) => {
      if (payload[key] === "") delete payload[key];
      else if (payload[key]) payload[key] = payload[key].trim();
    });
    if (payload.weekly_off_days === "") delete payload.weekly_off_days;
  }

  if (type === "overtime") {
    ["standard_work_hours_per_day", "multiplier", "min_hours_per_day", "max_hours_per_day", "max_hours_per_month"]
      .forEach((key) => { payload[key] = Number(payload[key]); });
  }

  if (type === "tax") {
    if (payload.tax_mode_default === "slab") {
      delete payload.tax_rate_default;
      payload.tax_slabs = (payload.tax_slabs || []).map((slab) => ({
        up_to: slab.up_to === "" ? null : slab.up_to,
        rate: Number(slab.rate),
      }));
    } else {
      delete payload.tax_slabs;
      payload.tax_rate_default = Number(payload.tax_rate_default);
    }
  }

  if (type === "bonus") {
    payload.bonus_rate_default = Number(payload.bonus_rate_default);
    ["min_present_days", "min_payable_days", "max_unpaid_leave_days"].forEach((key) => {
      if (payload[key] === "") delete payload[key];
      else payload[key] = Number(payload[key]);
    });
  }

  return payload;
};

export const validatePolicyForm = (type, form) => {
  if (!form.name?.trim()) return "Policy name is required";
  if (type === "tax" && (form.tax_mode_default === "percentage" || form.tax_mode_default === "fixed") && form.tax_rate_default === "") {
    return "Tax rate is required for percentage / fixed mode";
  }
  if (type === "bonus" && form.bonus_rate_default === "") return "Bonus rate / amount is required";
  return null;
};

// ============= POLICY LIST COMPONENT =============
export function PolicyList({
  type: typeProp,
  mode = "single",
  basePath = "/hr",
  showHeader = true,
}) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  useEffect(() => { setUser(getUser()); }, []);
  const perms = useMemo(() => getPermissions(user), [user]);

  const [activeType, setActiveType] = useState(typeProp || "attendance");
  const [policies, setPolicies] = useState({ attendance: [], overtime: [], tax: [], bonus: [] });
  const [loading, setLoading] = useState({ attendance: false, overtime: false, tax: false, bonus: false });
  const [search, setSearch] = useState("");
  const [detailModal, setDetailModal] = useState({ open: false, policy: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, policy: null });
  const [deleting, setDeleting] = useState(false);

  const resolvedType = mode === "combined" ? activeType : (typeProp || activeType);
  const meta = getPolicyTypeMeta(resolvedType);

  const loadPolicies = useCallback(async (type) => {
    setLoading((current) => ({ ...current, [type]: true }));
    try {
      const response = await axiosInstance.get(API_PATHS[type]);
      setPolicies((current) => ({ ...current, [type]: response.data.policies || [] }));
    } catch (error) {
      if (error.response?.status !== 404) toast.error("Failed to fetch policies");
    } finally {
      setLoading((current) => ({ ...current, [type]: false }));
    }
  }, []);

  useEffect(() => {
    loadPolicies(resolvedType);
  }, [loadPolicies, resolvedType]);

  const currentPolicies = policies[resolvedType] || [];
  const isLoading = loading[resolvedType];

  const filtered = useMemo(() => (
    search.trim()
      ? currentPolicies.filter((policy) => policy.name?.toLowerCase().includes(search.toLowerCase()))
      : currentPolicies
  ), [currentPolicies, search]);

  const goToCreate = () => router.push(`${basePath}/policies-structure/policies/create?type=${resolvedType}`);
  const goToEdit = (policy) => router.push(`${basePath}/policies-structure/policies/${policy.id}?type=${resolvedType}`);

  const columns = useMemo(() => buildPolicyColumns({
    type: resolvedType,
    canManage: perms.canManagePolicies,
    onEdit: goToEdit,
    onDelete: (item) => setDeleteModal({ open: true, type: resolvedType, policy: item }),
    onView: (item) => setDetailModal({ open: true, policy: item }),
  }), [resolvedType, perms.canManagePolicies, goToEdit]);

  const handleDelete = async () => {
    const { type, policy } = deleteModal;
    if (!policy?.id) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`${API_PATHS[type]}/${policy.id}`);
      toast.success("Policy deleted.");
      loadPolicies(type);
      setDeleteModal({ open: false, type: null, policy: null });
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to delete policy"));
    } finally {
      setDeleting(false);
    }
  };

  if (user && !perms.canManagePolicies) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Shield className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">You don&apos;t have permission to manage policies.</p>
      </div>
    );
  }

  return (
    <div className={mode === "combined" ? "flex gap-0 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900" : "flex flex-col gap-6"}>
      {mode === "combined" && (
        <div className="w-52 shrink-0 border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Policy types</p>
          </div>
          <div className="py-2">
            {POLICY_TYPE_ORDER.map((typeKey) => {
              const item = POLICY_TYPE_META[typeKey];
              const count = (policies[typeKey] || []).length;
              const active = activeType === typeKey;
              const TabIcon = item.Icon;
              return (
                <button
                  key={typeKey}
                  onClick={() => setActiveType(typeKey)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors text-left",
                    active
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium border-r-2 border-gray-900 dark:border-gray-100"
                      : "text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/40 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn("p-1 rounded-md", active ? item.bg : "bg-transparent")}>
                      <TabIcon className={cn("w-3.5 h-3.5", active ? item.color : "text-gray-400 dark:text-gray-500")} />
                    </span>
                    {item.label}
                  </div>
                  <span className={cn(
                    "text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-4.5 text-center",
                    active ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {showHeader && mode === "single" && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg border bg-background p-2 shadow-xs">
                  <meta.Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>
              </div>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{meta.description}</p>
            </div>
          </div>
        )}

        <TableToolbar
          placeholder={`Search ${resolvedType} policies…`}
          total={filtered.length}
          searchValue={search}
          onSearchChange={setSearch}
          rightSlot={perms.canManagePolicies ? (
            <Button size="sm" className="h-8 gap-1.5 shrink-0" onClick={goToCreate}>
              <Plus className="w-3.5 h-3.5" />
              New {meta.label} policy
            </Button>
          ) : null}
        />

        <div className="p-4 pt-3">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading {resolvedType} policies…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Shield className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {search
                  ? `No policies match "${search}"`
                  : `No ${resolvedType} policies yet.${perms.canManagePolicies ? " Create one to get started." : ""}`}
              </p>
            </div>
          ) : (
            <DataTable
              data={filtered}
              columns={columns}
              isLoading={false}
              pagination={false}
              columnsBtn={false}
            />
          )}
        </div>
      </div>

      <PolicyDetailModal
        open={detailModal.open}
        policy={detailModal.policy}
        type={resolvedType}
        onClose={() => setDetailModal({ open: false, policy: null })}
        onEdit={goToEdit}
        canManage={perms.canManagePolicies}
      />

      <DeleteConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: null, policy: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete ${deleteModal.type} policy?`}
        description={`Are you sure you want to delete "${deleteModal.policy?.name}"? This may affect salary structures using this policy.`}
      />
    </div>
  );
}

export default PolicyList;
