'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, ChevronRight, Clock,
  Plus, Receipt, RefreshCw, Shield, UserCheck, X, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

// ─── constants ────────────────────────────────────────────────────────────────

const API_PATHS = {
  attendance: "/policies/attendance",
  overtime:   "/policies/overtime",
  tax:        "/policies/tax",
  bonus:      "/policies/bonus",
};

export const TYPE_META = {
  attendance: { label: "Attendance", Icon: UserCheck, color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/20"   },
  overtime:   { label: "Overtime",   Icon: Clock,      color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  tax:        { label: "Tax",        Icon: Receipt,    color: "text-rose-600 dark:text-rose-400",   bg: "bg-rose-50 dark:bg-rose-900/20"   },
  bonus:      { label: "Bonus",      Icon: Zap,        color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
};

const TYPE_TABS = [
  { key: "attendance", label: "Attendance", Icon: UserCheck },
  { key: "overtime",   label: "Overtime",   Icon: Clock     },
  { key: "tax",        label: "Tax",        Icon: Receipt   },
  { key: "bonus",      label: "Bonus",      Icon: Zap       },
];

const extractErrorMessage = (e, fallback) =>
  e?.response?.data?.message || e?.message || fallback;

// ─── shared UI primitives ─────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 " +
  "text-gray-900 dark:text-gray-100 text-sm px-3 py-2 outline-none placeholder:text-gray-400 " +
  "focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition";

const selectCls =
  "w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 " +
  "text-gray-900 dark:text-gray-100 text-sm px-3 py-2 outline-none " +
  "focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 transition";

const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

const Opt = () => (
  <span className="ml-1 text-[10px] font-normal text-gray-400 dark:text-gray-500">(optional)</span>
);

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pt-1">
    {children}
  </p>
);

const Field = ({ label, children, className }) => (
  <div className={className}>
    <label className={labelCls}>{label}</label>
    {children}
  </div>
);

const CheckRow = ({ checked, onChange, children }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded accent-gray-900 dark:accent-gray-300"
    />
    <span className="text-sm text-gray-700 dark:text-gray-300">{children}</span>
  </label>
);

// ─── form builders ────────────────────────────────────────────────────────────

const buildInitialForm = (type, policy) => {
  const b = policy ?? {};

  const joinArr = (val) =>
    Array.isArray(val) ? val.join(",") : (val || "");

  if (type === "attendance") return {
    name:                     b.name                     || "",
    timezone:                 b.timezone                 || "Asia/Karachi",
    apply_proration_default:  b.apply_proration_default  ?? true,
    grace_minutes_default:    b.grace_minutes_default    ?? 0,
    late_count_for_unpaid_day:b.late_count_for_unpaid_day?? 3,
    min_hours_for_present:    b.min_hours_for_present    ?? 0,
    min_hours_for_half_day:   b.min_hours_for_half_day   ?? 2,
    full_day_hours:           b.full_day_hours           ?? 8,
    no_checkout_behavior:     b.no_checkout_behavior     || "present",
    short_hours_behavior:     b.short_hours_behavior     || "present",
    short_hours_payable:      b.short_hours_payable      ?? 1,
    weekly_off_days:          joinArr(b.weekly_off_days) || "0,6",
    holiday_dates:            joinArr(b.holiday_dates),
    working_weekend_dates:    joinArr(b.working_weekend_dates),
    forced_working_dates:     joinArr(b.forced_working_dates),
    manual_off_dates:         joinArr(b.manual_off_dates),
  };

  if (type === "overtime") return {
    name:                        b.name                        || "",
    apply_proration_default:     b.apply_proration_default     ?? false,
    standard_work_hours_per_day: b.standard_work_hours_per_day ?? 8,
    multiplier:                  b.multiplier                  ?? 1.5,
    min_hours_per_day:           b.min_hours_per_day           ?? 0,
    max_hours_per_day:           b.max_hours_per_day           ?? 4,
    max_hours_per_month:         b.max_hours_per_month         ?? 20,
  };

  if (type === "tax") return {
    name:                    b.name                    || "",
    tax_mode_default:        b.tax_mode_default        || "slab",
    apply_proration_default: b.apply_proration_default ?? false,
    tax_rate_default:        b.tax_rate_default        ?? "",
    tax_slabs: Array.isArray(b.tax_slabs)
      ? b.tax_slabs
      : [{ up_to: 50000, rate: 0 }, { up_to: 100000, rate: 5 }, { up_to: null, rate: 15 }],
  };

  if (type === "bonus") return {
    name:                    b.name                    || "",
    bonus_mode_default:      b.bonus_mode_default      || "fixed",
    bonus_rate_default:      b.bonus_rate_default      ?? "",
    apply_proration_default: b.apply_proration_default ?? true,
    min_present_days:        b.min_present_days        ?? "",
    min_payable_days:        b.min_payable_days        ?? "",
    max_unpaid_leave_days:   b.max_unpaid_leave_days   ?? "",
    require_full_attendance: b.require_full_attendance ?? false,
  };

  return {};
};

const buildPayload = (type, form) => {
  const p = { ...form };

  if (type === "attendance") {
    // ── Only send fields the backend Joi schema knows about ──────────────
    const allowed = [
      "name",
      "timezone",
      "apply_proration_default",
      "grace_minutes_default",
      "late_count_for_unpaid_day",
      "shift_grace_by_shift_name",
      "weekly_off_days",
      "working_weekend_dates",
      "holiday_dates",
      "forced_working_dates",
      "manual_off_dates",
    ];
    Object.keys(p).forEach((k) => { if (!allowed.includes(k)) delete p[k]; });

    // ── Coerce numeric fields ─────────────────────────────────────────────
    ["grace_minutes_default", "late_count_for_unpaid_day"].forEach((k) => {
      if (p[k] !== "") p[k] = Number(p[k]);
    });

    // ── Strip empty optional date lists ───────────────────────────────────
    ["holiday_dates", "working_weekend_dates", "forced_working_dates", "manual_off_dates"].forEach((k) => {
      if (p[k] === "") delete p[k];
      else if (p[k]) p[k] = p[k].trim();
    });

    if (p.weekly_off_days === "") delete p.weekly_off_days;
  }

  if (type === "overtime") {
    ["standard_work_hours_per_day", "multiplier",
      "min_hours_per_day", "max_hours_per_day", "max_hours_per_month"]
      .forEach((k) => { p[k] = Number(p[k]); });
  }

  if (type === "tax") {
    if (p.tax_mode_default === "slab") {
      delete p.tax_rate_default;
      p.tax_slabs = (p.tax_slabs || []).map((s) => ({
        up_to: s.up_to === "" ? null : s.up_to,
        rate: Number(s.rate),
      }));
    } else {
      delete p.tax_slabs;
      p.tax_rate_default = Number(p.tax_rate_default);
    }
  }

  if (type === "bonus") {
    p.bonus_rate_default = Number(p.bonus_rate_default);
    ["min_present_days", "min_payable_days", "max_unpaid_leave_days"].forEach((k) => {
      if (p[k] === "") delete p[k]; else p[k] = Number(p[k]);
    });
  }

  return p;
};

const validateForm = (type, form) => {
  if (!form.name?.trim()) return "Policy name is required";
  if (type === "tax" &&
    (form.tax_mode_default === "percentage" || form.tax_mode_default === "fixed") &&
    form.tax_rate_default === "") return "Tax rate is required for percentage / fixed mode";
  if (type === "bonus" && form.bonus_rate_default === "") return "Bonus rate / amount is required";
  return null;
};

// ─── sub-forms ────────────────────────────────────────────────────────────────

function AttendanceFields({ form, setF, setN, setForm }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={<>Timezone <Opt /></>}>
          <input className={inputCls} placeholder="Asia/Karachi" value={form.timezone || ""} onChange={setF("timezone")} />
        </Field>
        <Field label={<>Grace Minutes <Opt /></>}>
          <input type="number" min="0" className={inputCls} value={form.grace_minutes_default ?? ""} onChange={setN("grace_minutes_default")} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={<>Lates → Unpaid Day <Opt /></>}>
          <input type="number" min="1" className={inputCls} value={form.late_count_for_unpaid_day ?? ""} onChange={setN("late_count_for_unpaid_day")} />
        </Field>
        <Field label={<>Weekly Off Days <Opt /></>}>
          <input className={inputCls} placeholder="0,6  (Sun, Sat)" value={form.weekly_off_days || ""} onChange={setF("weekly_off_days")} />
        </Field>
      </div>

      <SectionLabel>Hour Thresholds</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Min Hours Present">
          <input type="number" min="0" step="0.5" className={inputCls} value={form.min_hours_for_present ?? ""} onChange={setN("min_hours_for_present")} />
        </Field>
        <Field label="Min Hours Half Day">
          <input type="number" min="0" step="0.5" className={inputCls} value={form.min_hours_for_half_day ?? ""} onChange={setN("min_hours_for_half_day")} />
        </Field>
        <Field label="Full Day Hours">
          <input type="number" min="0" step="0.5" className={inputCls} value={form.full_day_hours ?? ""} onChange={setN("full_day_hours")} />
        </Field>
      </div>

      <SectionLabel>Behavior Rules</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="No Checkout Behavior">
          <select className={selectCls} value={form.no_checkout_behavior || "present"} onChange={setF("no_checkout_behavior")}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="half_day">Half Day</option>
          </select>
        </Field>
        <Field label="Short Hours Behavior">
          <select className={selectCls} value={form.short_hours_behavior || "present"} onChange={setF("short_hours_behavior")}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="half_day">Half Day</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Short Hours Payable Fraction">
          <select
            className={selectCls}
            value={String(form.short_hours_payable ?? 1)}
            onChange={(e) => setForm((f) => ({ ...f, short_hours_payable: Number(e.target.value) }))}
          >
            <option value="1">Full (1.0)</option>
            <option value="0.5">Half (0.5)</option>
            <option value="0">None (0)</option>
          </select>
        </Field>
      </div>

      <SectionLabel>Date Overrides</SectionLabel>
      <Field label={<>Holiday Dates <Opt /></>}>
        <input className={inputCls} placeholder="2025-12-25, 2026-01-01" value={form.holiday_dates || ""} onChange={setF("holiday_dates")} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={<>Working Weekend Dates <Opt /></>}>
          <input className={inputCls} placeholder="2025-12-27" value={form.working_weekend_dates || ""} onChange={setF("working_weekend_dates")} />
        </Field>
        <Field label={<>Manual Off Dates <Opt /></>}>
          <input className={inputCls} placeholder="2025-12-26" value={form.manual_off_dates || ""} onChange={setF("manual_off_dates")} />
        </Field>
      </div>
      <Field label={<>Forced Working Dates <Opt /></>}>
        <input className={inputCls} placeholder="2025-12-30" value={form.forced_working_dates || ""} onChange={setF("forced_working_dates")} />
      </Field>

      <CheckRow
        checked={form.apply_proration_default ?? true}
        onChange={setF("apply_proration_default")}
      >
        Apply proration by default
      </CheckRow>
    </>
  );
}

function OvertimeFields({ form, setF, setN }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Multiplier">
          <input type="number" min="0" step="0.1" className={inputCls} value={form.multiplier ?? ""} onChange={setN("multiplier")} />
        </Field>
        <Field label="Standard Work Hours / Day">
          <input type="number" min="0" step="0.5" className={inputCls} value={form.standard_work_hours_per_day ?? ""} onChange={setN("standard_work_hours_per_day")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Min OT / Day (h)">
          <input type="number" min="0" step="0.5" className={inputCls} value={form.min_hours_per_day ?? ""} onChange={setN("min_hours_per_day")} />
        </Field>
        <Field label="Max OT / Day (h)">
          <input type="number" min="0" step="0.5" className={inputCls} value={form.max_hours_per_day ?? ""} onChange={setN("max_hours_per_day")} />
        </Field>
        <Field label="Max OT / Month (h)">
          <input type="number" min="0" className={inputCls} value={form.max_hours_per_month ?? ""} onChange={setN("max_hours_per_month")} />
        </Field>
      </div>
      <CheckRow
        checked={form.apply_proration_default ?? false}
        onChange={setF("apply_proration_default")}
      >
        Apply proration to overtime
      </CheckRow>
    </>
  );
}

function TaxFields({ form, setF, setForm }) {
  const addSlab    = () => setForm((f) => ({ ...f, tax_slabs: [...(f.tax_slabs || []), { up_to: "", rate: 0 }] }));
  const removeSlab = (i) => setForm((f) => ({ ...f, tax_slabs: f.tax_slabs.filter((_, idx) => idx !== i) }));
  const updateSlab = (i, field, val) => setForm((f) => {
    const slabs = [...f.tax_slabs];
    slabs[i] = { ...slabs[i], [field]: val === "" || val === "null" ? null : Number(val) };
    return { ...f, tax_slabs: slabs };
  });

  return (
    <>
      <Field label="Tax Mode">
        <select className={selectCls} value={form.tax_mode_default || "slab"} onChange={setF("tax_mode_default")}>
          <option value="slab">Slab</option>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
        </select>
      </Field>

      {(form.tax_mode_default === "percentage" || form.tax_mode_default === "fixed") && (
        <Field label={form.tax_mode_default === "percentage" ? "Tax Rate (%)" : "Fixed Tax Amount"}>
          <input type="number" min="0" step="0.01" className={inputCls} value={form.tax_rate_default ?? ""} onChange={setF("tax_rate_default")} />
        </Field>
      )}

      {form.tax_mode_default === "slab" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelCls}>Tax Slabs</label>
            <button
              type="button" onClick={addSlab}
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              <Plus className="w-3 h-3" /> Add Slab
            </button>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_88px_32px] gap-2 px-0.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Income Up To</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Rate %</span>
          </div>

          <div className="space-y-2">
            {(form.tax_slabs || []).map((slab, i) => (
              <div key={i} className="grid grid-cols-[1fr_88px_32px] gap-2 items-center">
                <input
                  type="number" placeholder="∞ (leave empty)"
                  className={cn(inputCls, "text-sm")}
                  value={slab.up_to == null ? "" : slab.up_to}
                  onChange={(e) => updateSlab(i, "up_to", e.target.value)}
                />
                <input
                  type="number" min="0" max="100" step="0.01" placeholder="0"
                  className={cn(inputCls, "text-sm")}
                  value={slab.rate ?? ""}
                  onChange={(e) => updateSlab(i, "rate", e.target.value)}
                />
                <button
                  type="button" onClick={() => removeSlab(i)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            Leave "Income Up To" empty for the top slab (∞)
          </p>
        </div>
      )}

      <CheckRow
        checked={form.apply_proration_default ?? false}
        onChange={setF("apply_proration_default")}
      >
        Apply proration to fixed tax
      </CheckRow>
    </>
  );
}

function BonusFields({ form, setF }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Bonus Mode">
          <select className={selectCls} value={form.bonus_mode_default || "fixed"} onChange={setF("bonus_mode_default")}>
            <option value="fixed">Fixed</option>
            <option value="percentage">Percentage</option>
          </select>
        </Field>
        <Field label={<>{form.bonus_mode_default === "percentage" ? "Bonus Rate (%)" : "Bonus Amount"} <span className="text-red-500">*</span></>}>
          <input type="number" min="0" step="0.01" className={inputCls} value={form.bonus_rate_default ?? ""} onChange={setF("bonus_rate_default")} />
        </Field>
      </div>

      <hr className="border-gray-100 dark:border-gray-700" />
      <SectionLabel>Eligibility Rules <span className="text-gray-300 dark:text-gray-600 font-normal normal-case">(optional)</span></SectionLabel>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={<>Min Present Days <Opt /></>}>
          <input type="number" min="0" className={inputCls} value={form.min_present_days ?? ""} onChange={setF("min_present_days")} />
        </Field>
        <Field label={<>Min Payable Days <Opt /></>}>
          <input type="number" min="0" className={inputCls} value={form.min_payable_days ?? ""} onChange={setF("min_payable_days")} />
        </Field>
        <Field label={<>Max Unpaid Days <Opt /></>}>
          <input type="number" min="0" className={inputCls} value={form.max_unpaid_leave_days ?? ""} onChange={setF("max_unpaid_leave_days")} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-5">
        <CheckRow
          checked={form.apply_proration_default ?? true}
          onChange={setF("apply_proration_default")}
        >
          Apply proration
        </CheckRow>
        <CheckRow
          checked={form.require_full_attendance ?? false}
          onChange={setF("require_full_attendance")}
        >
          Require full attendance
        </CheckRow>
      </div>
    </>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function PolicyForm() {
  const router       = useRouter();
  const params       = useParams();
  const searchParams = useSearchParams();

  // /policies/[id]/page.jsx  → params.id exists  → edit mode
  // /policies/create/page.jsx → params.id missing → create mode
  const id     = params?.id;
  const isEdit = !!id;

  const typeParam = searchParams.get("type") || "attendance";
  const [type, setType] = useState(typeParam);

  const [form,        setForm]        = useState({});
  const [saving,      setSaving]      = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  // ── fetch on edit ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) { setForm(buildInitialForm(type, null)); return; }
    setFetchLoading(true);
    axiosInstance
      .get(`${API_PATHS[type]}/${id}`)
      .then((res) => setForm(buildInitialForm(type, res.data.policy)))
      .catch((e) => {
        toast.error(extractErrorMessage(e, "Failed to load policy"));
        router.back();
      })
      .finally(() => setFetchLoading(false));
  }, [id, type]); // eslint-disable-line

  // ── helpers ───────────────────────────────────────────────────────────────
  const setF = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };
  const setN = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value === "" ? "" : Number(e.target.value) }));

  const switchType = (t) => { setType(t); setForm(buildInitialForm(t, null)); };

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const err = validateForm(type, form);
    if (err) return toast.error(err);

    const payload = buildPayload(type, form);
    setSaving(true);
    try {
      if (isEdit) {
        await axiosInstance.put(`${API_PATHS[type]}/${id}`, payload);
        toast.success("Policy updated successfully!");
      } else {
        await axiosInstance.post(API_PATHS[type], payload);
        toast.success("Policy created successfully!");
      }
      router.back();
    } catch (e) {
      toast.error(extractErrorMessage(e, `Failed to ${isEdit ? "update" : "create"} policy`));
    } finally {
      setSaving(false);
    }
  };

  // ── meta ──────────────────────────────────────────────────────────────────
  const meta = TYPE_META[type] || TYPE_META.attendance;
  const { Icon } = meta;

  const SaveBtn = ({ size = "sm" }) => (
    <button
      onClick={handleSubmit}
      disabled={saving || fetchLoading}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-semibold transition-colors",
        "bg-gray-900 dark:bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-300",
        "text-white dark:text-gray-900 disabled:opacity-50",
        size === "sm" ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm"
      )}
    >
      {saving
        ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />{isEdit ? "Saving…" : "Creating…"}</>
        : <><CheckCircle2 className="w-3.5 h-3.5" />{isEdit ? "Save Changes" : "Create Policy"}</>
      }
    </button>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-0 dark:bg-gray-950">



      {/* ── Page body ──────────────────────────────────────────────────── */}
      <div className=" px-4 sm:px-6 py-8 space-y-6">


        {/* {!isEdit && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">
              Policy Type
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPE_TABS.map(({ key, label, Icon: TabIcon }) => {
                const m      = TYPE_META[key];
                const active = type === key;
                return (
                  <button
                    key={key} type="button" onClick={() => switchType(key)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold transition-all text-left",
                      active
                        ? "border-gray-900 dark:border-gray-100 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <span className={cn("p-1.5 rounded-md flex-shrink-0", active ? m.bg : "bg-gray-100 dark:bg-gray-800")}>
                      <TabIcon className={cn("w-3.5 h-3.5", active ? m.color : "text-gray-400")} />
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )} */}

        {/* Form card */}
        {fetchLoading ? (
          <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading policy…</span>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">

            {/* Card header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <span className={cn("p-2 rounded-xl", meta.bg)}>
                <Icon className={cn("w-4 h-4", meta.color)} />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {meta.label} Policy Details
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Fields marked <span className="text-red-500">*</span> are required.
                </p>
              </div>
            </div>

            {/* Card body */}
            <div className="px-6 py-6 space-y-5">

              {/* Policy name — always shown */}
              <Field label={<>Policy Name <span className="text-red-500">*</span></>}>
                <input
                  className={inputCls}
                  placeholder={`e.g., Standard ${meta.label} Policy`}
                  value={form.name || ""}
                  onChange={setF("name")}
                />
              </Field>

              {type === "attendance" && <AttendanceFields form={form} setF={setF} setN={setN} setForm={setForm} />}
              {type === "overtime"   && <OvertimeFields   form={form} setF={setF} setN={setN} />}
              {type === "tax"        && <TaxFields        form={form} setF={setF} setForm={setForm} />}
              {type === "bonus"      && <BonusFields      form={form} setF={setF} />}
            </div>

            {/* Card footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-2xl">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <SaveBtn size="default" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}