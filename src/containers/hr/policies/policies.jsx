'use client'

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import {
  Clock, Plus, Receipt, RefreshCw, Shield,
  UserCheck, Zap, Pencil, Trash, Search, Eye,
} from "lucide-react";
import { EmptyState, getPermissions, fmtPKR } from "@/components/modal-components/modalcomponents";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import DeleteConfirmModal from "@/components/modals/deletecomfirmmodal";
import PolicyDetailModal from "../../../components/modals/policy-details-modal";


const extractErrorMessage = (e, fallback) =>
  e?.response?.data?.message || e?.message || fallback;

const API_PATHS = {
  attendance: "/policies/attendance",
  overtime:   "/policies/overtime",
  tax:        "/policies/tax",
  bonus:      "/policies/bonus",
};

const policyTypeConfig = [
  { key: "attendance", label: "Attendance", icon: UserCheck, color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/20"    },
  { key: "overtime",   label: "Overtime",   icon: Clock,      color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
  { key: "tax",        label: "Tax",        icon: Receipt,    color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-900/20"   },
  { key: "bonus",      label: "Bonus",      icon: Zap,        color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
];

const getSummaryFields = (type, policy) => {
  if (type === "attendance") return [
    ["Timezone",     policy.timezone || "—"],
    ["Grace min",    policy.grace_minutes_default ?? "—"],
    ["Weekly off",   Array.isArray(policy.weekly_off_days) ? policy.weekly_off_days.join(", ") : policy.weekly_off_days || "—"],
  ];
  if (type === "overtime") return [
    ["Multiplier",   policy.multiplier != null ? `${policy.multiplier}×` : "—"],
    ["Work hrs/day", policy.standard_work_hours_per_day ?? "—"],
    ["Max OT/month", policy.max_hours_per_month != null ? `${policy.max_hours_per_month}h` : "—"],
  ];
  if (type === "tax") return [
    ["Mode",         policy.tax_mode_default || "—"],
    ["Rate",         policy.tax_rate_default != null ? `${policy.tax_rate_default}%` : "—"],
    ["Slabs",        Array.isArray(policy.tax_slabs) ? `${policy.tax_slabs.length} slabs` : "—"],
  ];
  if (type === "bonus") return [
    ["Mode",         policy.bonus_mode_default || "—"],
    ["Rate/amount",  policy.bonus_rate_default != null
      ? (policy.bonus_mode_default === "percentage" ? `${policy.bonus_rate_default}%` : fmtPKR(policy.bonus_rate_default))
      : "—"],
    ["Min present",  policy.min_present_days ?? "—"],
  ];
  return [];
};

// ── PolicyRow ─────────────────────────────────────────────────────────────────

function PolicyRow({ policy, type, canManage, onEdit, onDelete, onView }) {
  const cfg = policyTypeConfig.find(c => c.key === type);
  const Icon = cfg?.icon ?? Shield;
  const summaryFields = getSummaryFields(type, policy);

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
      {/* Name */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <span className={cn("p-1.5 rounded-md flex-shrink-0", cfg?.bg)}>
            <Icon className={cn("w-3.5 h-3.5", cfg?.color)} />
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[160px]">
            {policy.name || "Unnamed Policy"}
          </span>
        </div>
      </td>

      {/* Summary cols */}
      {summaryFields.map(([label, value]) => (
        <td key={label} className="py-3 px-4 hidden md:table-cell">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{String(value)}</span>
          </div>
        </td>
      ))}

      {/* Proration badge */}
      <td className="py-3 px-4 hidden lg:table-cell">
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold",
          policy.apply_proration_default
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
        )}>
          {policy.apply_proration_default ? "Prorated" : "Fixed"}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          {/* Eye / view button — always visible */}
          <button
            onClick={() => onView(policy)}
            title="View details"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {canManage && (
            <>
              <button
                onClick={() => onEdit(policy)}
                title="Edit"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(policy)}
                title="Delete"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── PoliciesTab ───────────────────────────────────────────────────────────────

export function PoliciesTab({ perms }) {
  const router = useRouter();

  const [policies,    setPolicies]    = useState({ attendance: [], overtime: [], tax: [], bonus: [] });
  const [loading,     setLoading]     = useState({ attendance: false, overtime: false, tax: false, bonus: false });
  const [activeType,  setActiveType]  = useState("attendance");
  const [search,      setSearch]      = useState("");
  const [detailModal, setDetailModal] = useState({ open: false, policy: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, policy: null });
  const [deleting,    setDeleting]    = useState(false);

  // ── load ─────────────────────────────────────────────────────────────────
  const loadPolicies = useCallback(async (type) => {
    setLoading(l => ({ ...l, [type]: true }));
    try {
      const res = await axiosInstance.get(API_PATHS[type]);
      setPolicies(p => ({ ...p, [type]: res.data.policies || [] }));
    } catch (e) {
      if (e.response?.status !== 404)
        toast.error(extractErrorMessage(e, `Failed to load ${type} policies`));
    } finally {
      setLoading(l => ({ ...l, [type]: false }));
    }
  }, []);

  useEffect(() => { loadPolicies(activeType); }, [activeType, loadPolicies]);

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const { type, policy } = deleteModal;
    setDeleting(true);
    try {
      await axiosInstance.delete(`${API_PATHS[type]}/${policy.id}`);
      toast.success("Policy deleted.");
      setDeleteModal({ open: false, type: null, policy: null });
      setDetailModal(d => d.policy?.id === policy.id ? { open: false, policy: null } : d);
      loadPolicies(type);
    } catch (e) {
      toast.error(extractErrorMessage(e, "Failed to delete policy"));
    } finally {
      setDeleting(false);
    }
  };

  // ── nav ───────────────────────────────────────────────────────────────────
  const goToCreate = () => router.push(`/hr/policies_structure/policies/create?type=${activeType}`);
  const goToEdit   = (policy) => router.push(`/hr/policies_structure/policies/${policy.id}?type=${activeType}`);

  // ── derived ───────────────────────────────────────────────────────────────
  const currentPolicies = policies[activeType] || [];
  const isLoading       = loading[activeType];
  const cfg             = policyTypeConfig.find(c => c.key === activeType);

  const filtered = useMemo(() =>
    search.trim()
      ? currentPolicies.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
      : currentPolicies,
    [currentPolicies, search]
  );

  const tableHeaders = {
    attendance: ["Name", "Timezone",   "Grace min",   "Weekly off"],
    overtime:   ["Name", "Multiplier", "Work hrs/day","Max OT/month"],
    tax:        ["Name", "Mode",       "Rate",        "Slabs"],
    bonus:      ["Name", "Mode",       "Rate/amount", "Min present"],
  };

  return (
    <div className="flex gap-0 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">

      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <div className="w-52 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Policy types
          </p>
        </div>
        <div className="py-2">
          {policyTypeConfig.map(({ key, label, icon: TabIcon, color, bg }) => {
            const count    = policies[key]?.length ?? 0;
            const isActive = activeType === key;
            return (
              <button
                key={key}
                onClick={() => { setActiveType(key); setSearch(""); }}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors text-left",
                  isActive
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium border-r-2 border-gray-900 dark:border-gray-100"
                    : "text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/40 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn("p-1 rounded-md", isActive ? bg : "bg-transparent")}>
                    <TabIcon className={cn("w-3.5 h-3.5", isActive ? color : "text-gray-400 dark:text-gray-500")} />
                  </span>
                  {label}
                </div>
                <span className={cn(
                  "text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
                  isActive
                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${activeType} policies…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition"
            />
          </div>
          {perms.canManagePolicies && (
            <Button size="sm" className="h-8 gap-1.5 flex-shrink-0" onClick={goToCreate}>
              <Plus className="w-3.5 h-3.5" />
              New {cfg?.label} policy
            </Button>
          )}
        </div>

        {/* Table / empty / loading */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading {activeType} policies…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Shield className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {search
                ? `No policies match "${search}"`
                : `No ${activeType} policies yet.${perms.canManagePolicies ? " Create one to get started." : ""}`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {(tableHeaders[activeType] || ["Name"]).map((h, i) => (
                    <th
                      key={h}
                      className={cn(
                        "px-4 py-2.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider",
                        i > 0 && "hidden md:table-cell"
                      )}
                    >
                      {h}
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Proration
                  </th>
                  <th className="px-4 py-2.5 w-24" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(policy => (
                  <PolicyRow
                    key={policy.id}
                    policy={policy}
                    type={activeType}
                    canManage={perms.canManagePolicies}
                    onEdit={goToEdit}
                    onDelete={p => setDeleteModal({ open: true, type: activeType, policy: p })}
                    onView={p => setDetailModal({ open: true, policy: p })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail modal ─────────────────────────────────────────────────── */}
      <PolicyDetailModal
        open={detailModal.open}
        policy={detailModal.policy}
        type={activeType}
        onClose={() => setDetailModal({ open: false, policy: null })}
        onEdit={goToEdit}
        canManage={perms.canManagePolicies}
      />

      {/* ── Delete confirm ────────────────────────────────────────────────── */}
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PoliciesPage() {
  const [user, setUser] = useState(null);
  useEffect(() => { setUser(getUser()); }, []);
  const perms = useMemo(() => getPermissions(user), [user]);

  if (user && !perms.canManagePolicies) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Shield className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          You don&apos;t have permission to manage policies.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mt-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border bg-background p-2 shadow-xs">
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Policies</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Manage attendance, overtime, tax, and bonus policies.
          </p>
        </div>
      </div> */}
      <PoliciesTab perms={perms} />
    </div>
  );
}