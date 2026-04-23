// import { useEffect, useState } from "react";
// import { inputCls, Modal, ModalBody, ModalHeader } from "../modal-components/modalcomponents";
// import { Plus, RefreshCw, Settings,X } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { toast } from "sonner";
// export default function PolicyModal({ open, onClose, type, policy, onSave, loading }) {
//     const isEdit = !!policy;
  
//     const buildInitialForm = () => {
//       if (!type) return {};
//       const base = policy ? { ...policy } : {};
  
//       // if (type === "attendance") return {
//       //   name: base.name || "", timezone: base.timezone || "Asia/Karachi",
//       //   apply_proration_default: base.apply_proration_default ?? true,
//       //   grace_minutes_default: base.grace_minutes_default ?? 0,
//       //   late_count_for_unpaid_day: base.late_count_for_unpaid_day ?? 3,
//       //   weekly_off_days: Array.isArray(base.weekly_off_days) ? base.weekly_off_days.join(",") : (base.weekly_off_days || "0,6"),
//       //   holiday_dates: Array.isArray(base.holiday_dates) ? base.holiday_dates.join(",") : (base.holiday_dates || ""),
//       //   working_weekend_dates: Array.isArray(base.working_weekend_dates) ? base.working_weekend_dates.join(",") : (base.working_weekend_dates || ""),
//       //   forced_working_dates: Array.isArray(base.forced_working_dates) ? base.forced_working_dates.join(",") : (base.forced_working_dates || ""),
//       //   manual_off_dates: Array.isArray(base.manual_off_dates) ? base.manual_off_dates.join(",") : (base.manual_off_dates || ""),
//       // };
//       if (type === "attendance") return {
//         name: base.name || "",
//         timezone: base.timezone || "Asia/Karachi",
      
//         apply_proration_default: base.apply_proration_default ?? true,
//         grace_minutes_default: base.grace_minutes_default ?? 0,
//         late_count_for_unpaid_day: base.late_count_for_unpaid_day ?? 3,
      
//         // ✅ NEW FIELDS
//         min_hours_for_present: base.min_hours_for_present ?? 0,
//         min_hours_for_half_day: base.min_hours_for_half_day ?? 2,
//         full_day_hours: base.full_day_hours ?? 8,
//         no_checkout_behavior: base.no_checkout_behavior || "present",
//         short_hours_behavior: base.short_hours_behavior || "present",
//         short_hours_payable: base.short_hours_payable ?? 1,
      
//         // ✅ Arrays instead of strings
//         weekly_off_days: base.weekly_off_days || [0, 6],
//         holiday_dates: base.holiday_dates || [],
//         working_weekend_dates: base.working_weekend_dates || [],
//         forced_working_dates: base.forced_working_dates || [],
//         manual_off_dates: base.manual_off_dates || [],
//       };
//       if (type === "overtime") return {
//         name: base.name || "", apply_proration_default: base.apply_proration_default ?? false,
//         standard_work_hours_per_day: base.standard_work_hours_per_day ?? 8,
//         multiplier: base.multiplier ?? 1.5,
//         min_hours_per_day: base.min_hours_per_day ?? 0,
//         max_hours_per_day: base.max_hours_per_day ?? 4,
//         max_hours_per_month: base.max_hours_per_month ?? 20,
//       };
//       if (type === "tax") return {
//         name: base.name || "", tax_mode_default: base.tax_mode_default || "slab",
//         apply_proration_default: base.apply_proration_default ?? false,
//         tax_rate_default: base.tax_rate_default ?? "",
//         tax_slabs: Array.isArray(base.tax_slabs) ? base.tax_slabs : [{ up_to: 50000, rate: 0 }, { up_to: 100000, rate: 5 }, { up_to: null, rate: 15 }],
//       };
//       if (type === "bonus") return {
//         name: base.name || "", bonus_mode_default: base.bonus_mode_default || "fixed",
//         bonus_rate_default: base.bonus_rate_default ?? "",
//         apply_proration_default: base.apply_proration_default ?? true,
//         min_present_days: base.min_present_days ?? "",
//         min_payable_days: base.min_payable_days ?? "",
//         max_unpaid_leave_days: base.max_unpaid_leave_days ?? "",
//         require_full_attendance: base.require_full_attendance ?? false,
//       };
//       return {};
//     };
  
//     const [form, setForm] = useState({});
  
//     useEffect(() => {
//       if (open) setForm(buildInitialForm());
//     }, [open, type, policy]);
  
//     const setF = (k) => (e) => {
//       const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
//       setForm((f) => ({ ...f, [k]: val }));
//     };
//     const setN = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value === "" ? "" : Number(e.target.value) }));
  
//     const addSlab = () => setForm((f) => ({ ...f, tax_slabs: [...(f.tax_slabs || []), { up_to: "", rate: 0 }] }));
//     const removeSlab = (i) => setForm((f) => ({ ...f, tax_slabs: f.tax_slabs.filter((_, idx) => idx !== i) }));
//     const updateSlab = (i, field, val) => setForm((f) => {
//       const slabs = [...f.tax_slabs];
//       slabs[i] = { ...slabs[i], [field]: val === "" || val === "null" ? null : Number(val) };
//       return { ...f, tax_slabs: slabs };
//     });
  
//     const handleSubmit = () => {
//       if (!form.name?.trim()) return toast.error("Policy name is required");
//       const payload = { ...form };
    
//       if (type === "tax") {
//         if (payload.tax_mode_default === "slab") {
//           delete payload.tax_rate_default;
//           payload.tax_slabs = (payload.tax_slabs || []).map((s) => ({ up_to: s.up_to === "" ? null : s.up_to, rate: Number(s.rate) }));
//         } else {
//           delete payload.tax_slabs;
//           if (payload.tax_rate_default === "") return toast.error("Tax rate is required for percentage/fixed mode");
//           payload.tax_rate_default = Number(payload.tax_rate_default);
//         }
//       }
      
//       if (type === "bonus") {
//         if (payload.bonus_rate_default === "") return toast.error("Bonus rate/amount is required");
//         payload.bonus_rate_default = Number(payload.bonus_rate_default);
//         if (payload.min_present_days === "") delete payload.min_present_days; else payload.min_present_days = Number(payload.min_present_days);
//         if (payload.min_payable_days === "") delete payload.min_payable_days; else payload.min_payable_days = Number(payload.min_payable_days);
//         if (payload.max_unpaid_leave_days === "") delete payload.max_unpaid_leave_days; else payload.max_unpaid_leave_days = Number(payload.max_unpaid_leave_days);
//       }
      
//       if (type === "attendance") {
//         ["grace_minutes_default", "late_count_for_unpaid_day"].forEach((k) => { 
//           if (payload[k] !== "") payload[k] = Number(payload[k]); 
//         });
        
//         // 🔥 FIX: Remove empty string fields for date arrays
//         const dateFields = [
//           "holiday_dates",
//           "working_weekend_dates", 
//           "forced_working_dates",
//           "manual_off_dates"
//         ];
        
//         dateFields.forEach(field => {
//           if (payload[field] === "") {
//             delete payload[field];  // Remove empty string fields completely
//           } else if (payload[field]) {
//             // Keep as string (your backend handles string parsing)
//             payload[field] = payload[field].trim();
//           }
//         });
        
//         // Also handle weekly_off_days if needed
//         if (payload.weekly_off_days === "") {
//           delete payload.weekly_off_days;
//         }
//       }
      
//       if (type === "overtime") {
//         ["standard_work_hours_per_day", "multiplier", "min_hours_per_day", "max_hours_per_day", "max_hours_per_month"].forEach((k) => { 
//           payload[k] = Number(payload[k]); 
//         });
//       }
    
//       onSave(policy?.id, payload, type, isEdit);
//     };
  
//     const typeLabels = { attendance: "Attendance Policy", overtime: "Overtime Policy", tax: "Tax Policy", bonus: "Bonus Policy" };
  
//     return (
//       <Modal open={open} onClose={onClose} maxWidth="max-w-lg">
//         <ModalHeader icon={Settings} title={`${isEdit ? "Edit" : "Create"} ${typeLabels[type] || "Policy"}`} onClose={onClose} />
//         <ModalBody>
//           <div className="px-6 py-5 space-y-4">
//             <div>
//               <label className="block text-xs font-semibold text-gray-700 mb-1.5">Policy Name <span className="text-red-500">*</span></label>
//               <input className={inputCls} placeholder="e.g., Standard Attendance Policy" value={form.name || ""} onChange={setF("name")} />
//             </div>
  
//             {/* Attendance Fields */}
//             {type === "attendance" && (
//               <>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Timezone</label>
//                     <input className={inputCls} placeholder="Asia/Karachi" value={form.timezone || ""} onChange={setF("timezone")} />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Grace Minutes</label>
//                     <input type="number" min="0" className={inputCls} value={form.grace_minutes_default ?? ""} onChange={setN("grace_minutes_default")} />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Lates → Unpaid Day</label>
//                     <input type="number" min="1" className={inputCls} value={form.late_count_for_unpaid_day ?? ""} onChange={setN("late_count_for_unpaid_day")} />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Weekly Off Days</label>
//                     <input className={inputCls} placeholder="0,6 (Sun,Sat)" value={form.weekly_off_days || ""} onChange={setF("weekly_off_days")} />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-semibold text-gray-700 mb-1.5">Holiday Dates <span className="text-gray-400 font-normal">(comma-separated ISO dates)</span></label>
//                   <input className={inputCls} placeholder="2025-12-25,2026-01-01" value={form.holiday_dates || ""} onChange={setF("holiday_dates")} />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Working Weekend Dates</label>
//                     <input className={inputCls} placeholder="2025-12-27" value={form.working_weekend_dates || ""} onChange={setF("working_weekend_dates")} />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Manual Off Dates</label>
//                     <input className={inputCls} placeholder="2025-12-26" value={form.manual_off_dates || ""} onChange={setF("manual_off_dates")} />
//                   </div>
//                 </div>
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input type="checkbox" checked={form.apply_proration_default ?? true} onChange={setF("apply_proration_default")} className="w-4 h-4 rounded" />
//                   <span className="text-sm text-gray-700">Apply proration by default</span>
//                 </label>
//               </>
//             )}
  
//             {/* Overtime Fields */}
//             {type === "overtime" && (
//               <>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Multiplier</label>
//                     <input type="number" min="0" step="0.1" className={inputCls} value={form.multiplier ?? ""} onChange={setN("multiplier")} />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Work Hours/Day</label>
//                     <input type="number" min="0" step="0.5" className={inputCls} value={form.standard_work_hours_per_day ?? ""} onChange={setN("standard_work_hours_per_day")} />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-3">
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Min OT/Day (h)</label>
//                     <input type="number" min="0" step="0.5" className={inputCls} value={form.min_hours_per_day ?? ""} onChange={setN("min_hours_per_day")} />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max OT/Day (h)</label>
//                     <input type="number" min="0" step="0.5" className={inputCls} value={form.max_hours_per_day ?? ""} onChange={setN("max_hours_per_day")} />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max OT/Month (h)</label>
//                     <input type="number" min="0" className={inputCls} value={form.max_hours_per_month ?? ""} onChange={setN("max_hours_per_month")} />
//                   </div>
//                 </div>
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input type="checkbox" checked={form.apply_proration_default ?? false} onChange={setF("apply_proration_default")} className="w-4 h-4 rounded" />
//                   <span className="text-sm text-gray-700">Apply proration to overtime</span>
//                 </label>
//               </>
//             )}
  
//             {/* Tax Fields */}
//             {type === "tax" && (
//               <>
//                 <div>
//                   <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tax Mode</label>
//                   <select className={inputCls} value={form.tax_mode_default || "slab"} onChange={setF("tax_mode_default")}>
//                     <option value="slab">Slab</option>
//                     <option value="percentage">Percentage</option>
//                     <option value="fixed">Fixed</option>
//                   </select>
//                 </div>
//                 {(form.tax_mode_default === "percentage" || form.tax_mode_default === "fixed") && (
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">
//                       {form.tax_mode_default === "percentage" ? "Tax Rate (%)" : "Fixed Tax Amount"}
//                     </label>
//                     <input type="number" min="0" step="0.01" className={inputCls} value={form.tax_rate_default ?? ""} onChange={setF("tax_rate_default")} />
//                   </div>
//                 )}
//                 {form.tax_mode_default === "slab" && (
//                   <div>
//                     <div className="flex items-center justify-between mb-2">
//                       <label className="text-xs font-semibold text-gray-700">Tax Slabs</label>
//                       <button onClick={addSlab} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
//                         <Plus className="w-3 h-3" />Add Slab
//                       </button>
//                     </div>
//                     <div className="space-y-2">
//                       {(form.tax_slabs || []).map((slab, i) => (
//                         <div key={i} className="flex items-center gap-2">
//                           <div className="flex-1">
//                             <input type="number" placeholder="Up to (null=∞)" className={cn(inputCls, "text-xs")}
//                               value={slab.up_to == null ? "" : slab.up_to}
//                               onChange={(e) => updateSlab(i, "up_to", e.target.value)} />
//                           </div>
//                           <div className="w-24">
//                             <input type="number" min="0" max="100" step="0.01" placeholder="Rate %" className={cn(inputCls, "text-xs")}
//                               value={slab.rate ?? ""} onChange={(e) => updateSlab(i, "rate", e.target.value)} />
//                           </div>
//                           <button onClick={() => removeSlab(i)} className="text-gray-400 hover:text-red-500 transition-colors">
//                             <X className="w-4 h-4" />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                     <p className="text-[10px] text-gray-400 mt-1">Leave "Up to" empty for the top slab (∞)</p>
//                   </div>
//                 )}
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input type="checkbox" checked={form.apply_proration_default ?? false} onChange={setF("apply_proration_default")} className="w-4 h-4 rounded" />
//                   <span className="text-sm text-gray-700">Apply proration to fixed tax</span>
//                 </label>
//               </>
//             )}
  
//             {/* Bonus Fields */}
//             {type === "bonus" && (
//               <>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bonus Mode</label>
//                     <select className={inputCls} value={form.bonus_mode_default || "fixed"} onChange={setF("bonus_mode_default")}>
//                       <option value="fixed">Fixed</option>
//                       <option value="percentage">Percentage</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">
//                       {form.bonus_mode_default === "percentage" ? "Bonus Rate (%)" : "Bonus Amount"} <span className="text-red-500">*</span>
//                     </label>
//                     <input type="number" min="0" step="0.01" className={inputCls} value={form.bonus_rate_default ?? ""} onChange={setF("bonus_rate_default")} />
//                   </div>
//                 </div>
//                 <hr className="border-gray-100" />
//                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Eligibility Rules <span className="text-gray-300 font-normal normal-case">(optional)</span></p>
//                 <div className="grid grid-cols-3 gap-3">
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Min Present Days</label>
//                     <input type="number" min="0" className={inputCls} value={form.min_present_days ?? ""} onChange={setF("min_present_days")} />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Min Payable Days</label>
//                     <input type="number" min="0" className={inputCls} value={form.min_payable_days ?? ""} onChange={setF("min_payable_days")} />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max Unpaid Days</label>
//                     <input type="number" min="0" className={inputCls} value={form.max_unpaid_leave_days ?? ""} onChange={setF("max_unpaid_leave_days")} />
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <label className="flex items-center gap-2 cursor-pointer">
//                     <input type="checkbox" checked={form.apply_proration_default ?? true} onChange={setF("apply_proration_default")} className="w-4 h-4 rounded" />
//                     <span className="text-sm text-gray-700">Apply proration</span>
//                   </label>
//                   <label className="flex items-center gap-2 cursor-pointer">
//                     <input type="checkbox" checked={form.require_full_attendance ?? false} onChange={setF("require_full_attendance")} className="w-4 h-4 rounded" />
//                     <span className="text-sm text-gray-700">Require full attendance</span>
//                   </label>
//                 </div>
//               </>
//             )}
  
//             <div className="flex justify-end gap-2 pt-2 pb-1">
//               <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
//               <button onClick={handleSubmit} disabled={loading}
//                 className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold transition-colors disabled:opacity-50">
//                 {loading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />{isEdit ? "Saving…" : "Creating…"}</> : isEdit ? "Save Changes" : "Create Policy"}
//               </button>
//             </div>
//           </div>
//         </ModalBody>
//       </Modal>
//     );
//   }

import { useEffect, useState } from "react";
import { inputCls, Modal, ModalBody, ModalHeader } from "../modal-components/modalcomponents";
import { Plus, RefreshCw, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PolicyModal({ open, onClose, type, policy, onSave, loading }) {
  const isEdit = !!policy;

  const buildInitialForm = () => {
    if (!type) return {};
    const base = policy ? { ...policy } : {};

    if (type === "attendance") return {
      name: base.name || "",
      timezone: base.timezone || "Asia/Karachi",

      grace_minutes_default: base.grace_minutes_default ?? 0,
      late_count_for_unpaid_day: base.late_count_for_unpaid_day ?? 3,
      apply_proration_default: base.apply_proration_default ?? true,

      min_hours_for_present: base.min_hours_for_present ?? 0,
      min_hours_for_half_day: base.min_hours_for_half_day ?? 2,
      full_day_hours: base.full_day_hours ?? 8,

      no_checkout_behavior: base.no_checkout_behavior || "present",
      short_hours_behavior: base.short_hours_behavior || "present",
      short_hours_payable: base.short_hours_payable ?? 1,

      weekly_off_days: base.weekly_off_days || [0, 6],
      working_weekend_dates: base.working_weekend_dates || [],
      holiday_dates: base.holiday_dates || [],
      forced_working_dates: base.forced_working_dates || [],
      manual_off_dates: base.manual_off_dates || [],
    };

    if (type === "overtime") return {
      name: base.name || "",
      apply_proration_default: base.apply_proration_default ?? false,
      standard_work_hours_per_day: base.standard_work_hours_per_day ?? 8,
      multiplier: base.multiplier ?? 1.5,
      min_hours_per_day: base.min_hours_per_day ?? 0,
      max_hours_per_day: base.max_hours_per_day ?? 4,
      max_hours_per_month: base.max_hours_per_month ?? 20,
    };

    if (type === "tax") return {
      name: base.name || "",
      tax_mode_default: base.tax_mode_default || "slab",
      apply_proration_default: base.apply_proration_default ?? false,
      tax_rate_default: base.tax_rate_default ?? "",
      tax_slabs: Array.isArray(base.tax_slabs)
        ? base.tax_slabs
        : [
            { up_to: 50000, rate: 0 },
            { up_to: 100000, rate: 5 },
            { up_to: null, rate: 15 }
          ],
    };

    if (type === "bonus") return {
      name: base.name || "",
      bonus_mode_default: base.bonus_mode_default || "fixed",
      bonus_rate_default: base.bonus_rate_default ?? "",
      apply_proration_default: base.apply_proration_default ?? true,
      min_present_days: base.min_present_days ?? "",
      min_payable_days: base.min_payable_days ?? "",
      max_unpaid_leave_days: base.max_unpaid_leave_days ?? "",
      require_full_attendance: base.require_full_attendance ?? false,
    };

    return {};
  };

  const [form, setForm] = useState({});

  useEffect(() => {
    if (open) setForm(buildInitialForm());
  }, [open, type, policy]);

  const setF = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const setN = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.value === "" ? "" : Number(e.target.value),
    }));

  const handleSubmit = () => {
    if (!form.name?.trim()) return toast.error("Policy name is required");

    const payload = { ...form };

    // ================= ATTENDANCE PAYLOAD FIX =================
    if (type === "attendance") {
      [
        "grace_minutes_default",
        "late_count_for_unpaid_day",
        "min_hours_for_present",
        "min_hours_for_half_day",
        "full_day_hours",
        "short_hours_payable",
      ].forEach((k) => {
        if (payload[k] !== "") payload[k] = Number(payload[k]);
      });

      // arrays must remain arrays
      [
        "weekly_off_days",
        "working_weekend_dates",
        "holiday_dates",
        "forced_working_dates",
        "manual_off_dates",
      ].forEach((field) => {
        if (!payload[field]) payload[field] = [];
      });
    }

    // ================= OVERTIME =================
    if (type === "overtime") {
      [
        "standard_work_hours_per_day",
        "multiplier",
        "min_hours_per_day",
        "max_hours_per_day",
        "max_hours_per_month",
      ].forEach((k) => (payload[k] = Number(payload[k])));
    }

    // ================= TAX =================
    if (type === "tax") {
      if (payload.tax_mode_default === "slab") {
        delete payload.tax_rate_default;
        payload.tax_slabs = (payload.tax_slabs || []).map((s) => ({
          up_to: s.up_to === "" ? null : s.up_to,
          rate: Number(s.rate),
        }));
      } else {
        delete payload.tax_slabs;
        if (payload.tax_rate_default === "")
          return toast.error("Tax rate is required");
        payload.tax_rate_default = Number(payload.tax_rate_default);
      }
    }

    // ================= BONUS =================
    if (type === "bonus") {
      if (payload.bonus_rate_default === "")
        return toast.error("Bonus rate/amount is required");

      payload.bonus_rate_default = Number(payload.bonus_rate_default);

      ["min_present_days", "min_payable_days", "max_unpaid_leave_days"].forEach(
        (k) => {
          if (payload[k] === "") delete payload[k];
          else payload[k] = Number(payload[k]);
        }
      );
    }

    onSave(policy?.id, payload, type, isEdit);
  };

  const typeLabels = {
    attendance: "Attendance Policy",
    overtime: "Overtime Policy",
    tax: "Tax Policy",
    bonus: "Bonus Policy",
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-lg">
      <ModalHeader
        icon={Settings}
        title={`${isEdit ? "Edit" : "Create"} ${typeLabels[type] || "Policy"}`}
        onClose={onClose}
      />

      <ModalBody>
        <div className="px-6 py-5 space-y-4">

          {/* ================= NAME ================= */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Policy Name <span className="text-red-500">*</span>
            </label>
            <input
              className={inputCls}
              value={form.name || ""}
              onChange={setF("name")}
            />
          </div>

          {/* ================= ATTENDANCE ================= */}
          {type === "attendance" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Timezone
                  </label>
                  <input
                    className={inputCls}
                    value={form.timezone || ""}
                    onChange={setF("timezone")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Grace Minutes
                  </label>
                  <input
                    type="number"
                    className={inputCls}
                    value={form.grace_minutes_default ?? ""}
                    onChange={setN("grace_minutes_default")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Min Hours (Present)
                  </label>
                  <input
                    type="number"
                    className={inputCls}
                    value={form.min_hours_for_present ?? ""}
                    onChange={setN("min_hours_for_present")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Min Hours (Half Day)
                  </label>
                  <input
                    type="number"
                    className={inputCls}
                    value={form.min_hours_for_half_day ?? ""}
                    onChange={setN("min_hours_for_half_day")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Full Day Hours
                  </label>
                  <input
                    type="number"
                    className={inputCls}
                    value={form.full_day_hours ?? ""}
                    onChange={setN("full_day_hours")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  No Checkout Behavior
                </label>
                <select
                  className={inputCls}
                  value={form.no_checkout_behavior || "present"}
                  onChange={setF("no_checkout_behavior")}
                >
                  <option value="present">Present</option>
                  <option value="half_day">Half Day</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Short Hours Behavior
                </label>
                <select
                  className={inputCls}
                  value={form.short_hours_behavior || "present"}
                  onChange={setF("short_hours_behavior")}
                >
                  <option value="present">Present</option>
                  <option value="half_day">Half Day</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Short Hours Payable
                </label>
                <input
                  type="number"
                  step="0.1"
                  className={inputCls}
                  value={form.short_hours_payable ?? ""}
                  onChange={setN("short_hours_payable")}
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.apply_proration_default ?? true}
                  onChange={setF("apply_proration_default")}
                />
                Apply Proration
              </label>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Weekly Off Days
                </label>
                <input
                  className={inputCls}
                  value={(form.weekly_off_days || []).join(",")}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      weekly_off_days: e.target.value
                        .split(",")
                        .map((v) => Number(v.trim()))
                        .filter((v) => !isNaN(v)),
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Holiday Dates
                </label>
                <input
                  className={inputCls}
                  value={(form.holiday_dates || []).join(",")}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      holiday_dates: e.target.value
                        ? e.target.value.split(",").map((v) => v.trim())
                        : [],
                    }))
                  }
                />
              </div>
            </>
          )}

          {/* ================= ACTIONS ================= */}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-3 py-1 border rounded">
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-1 bg-black text-white rounded"
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Policy"}
            </button>
          </div>

        </div>
      </ModalBody>
    </Modal>
  );
}