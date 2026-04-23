import { ChevronDown, ChevronUp, Clock, Pencil, Receipt, Trash, UserCheck, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
export default function PolicyCard({ policy, type, onEdit, onDelete, canManage }) {
    const [expanded, setExpanded] = useState(false);
  
    const typeConfig = {
      attendance: { color: "border-l-blue-400", badge: "bg-blue-50 text-blue-700 border-blue-200", icon: <UserCheck className="w-3.5 h-3.5" /> },
      overtime: { color: "border-l-violet-400", badge: "bg-violet-50 text-violet-700 border-violet-200", icon: <Clock className="w-3.5 h-3.5" /> },
      tax: { color: "border-l-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200", icon: <Receipt className="w-3.5 h-3.5" /> },
      bonus: { color: "border-l-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <Zap className="w-3.5 h-3.5" /> },
    };
    const cfg = typeConfig[type] || typeConfig.attendance;
  
    const renderDetails = () => {
      if (type === "attendance") return (
        <div className="space-y-1">
          {[
            ["Timezone", policy.timezone],
            ["Grace Minutes", policy.grace_minutes_default],
            ["Late → Unpaid Day", `${policy.late_count_for_unpaid_day} lates`],
            ["Weekly Off", Array.isArray(policy.weekly_off_days) ? policy.weekly_off_days.join(", ") : policy.weekly_off_days || "—"],
            ["Apply Proration", policy.apply_proration_default ? "Yes" : "No"],
          ].map(([l, v]) => v != null && v !== "" && (
            <div key={l} className="flex justify-between text-xs"><span className="text-gray-400">{l}</span><span className="text-gray-700 font-medium">{String(v)}</span></div>
          ))}
          {Array.isArray(policy.holiday_dates) && policy.holiday_dates.length > 0 && (
            <div className="text-xs text-gray-400">Holidays: {policy.holiday_dates.slice(0, 3).join(", ")}{policy.holiday_dates.length > 3 ? ` +${policy.holiday_dates.length - 3} more` : ""}</div>
          )}
        </div>
      );
      if (type === "overtime") return (
        <div className="space-y-1">
          {[
            ["Multiplier", `${policy.multiplier}×`],
            ["Work Hours/Day", policy.standard_work_hours_per_day],
            ["Min OT/Day", `${policy.min_hours_per_day}h`],
            ["Max OT/Day", `${policy.max_hours_per_day}h`],
            ["Max OT/Month", `${policy.max_hours_per_month}h`],
            ["Apply Proration", policy.apply_proration_default ? "Yes" : "No"],
          ].map(([l, v]) => v != null && v !== "" && (
            <div key={l} className="flex justify-between text-xs"><span className="text-gray-400">{l}</span><span className="text-gray-700 font-medium">{String(v)}</span></div>
          ))}
        </div>
      );
      if (type === "tax") return (
        <div className="space-y-1">
          {[
            ["Mode", policy.tax_mode_default],
            ["Rate", policy.tax_rate_default != null ? `${policy.tax_rate_default}%` : null],
            ["Apply Proration", policy.apply_proration_default ? "Yes" : "No"],
          ].filter(([, v]) => v != null).map(([l, v]) => (
            <div key={l} className="flex justify-between text-xs"><span className="text-gray-400">{l}</span><span className="text-gray-700 font-medium capitalize">{String(v)}</span></div>
          ))}
          {Array.isArray(policy.tax_slabs) && policy.tax_slabs.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tax Slabs</p>
              <div className="space-y-0.5">
                {policy.tax_slabs.map((slab, i) => (
                  <div key={i} className="flex justify-between text-xs bg-amber-50 rounded px-2 py-1">
                    <span className="text-gray-500">Up to {slab.up_to != null ? `PKR ${slab.up_to?.toLocaleString()}` : "∞"}</span>
                    <span className="font-semibold text-amber-700">{slab.rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
      if (type === "bonus") return (
        <div className="space-y-1">
          {[
            ["Mode", policy.bonus_mode_default],
            ["Rate/Amount", policy.bonus_rate_default != null ? (policy.bonus_mode_default === "percentage" ? `${policy.bonus_rate_default}%` : fmtPKR(policy.bonus_rate_default)) : null],
            ["Apply Proration", policy.apply_proration_default ? "Yes" : "No"],
            ["Min Present Days", policy.min_present_days],
            ["Min Payable Days", policy.min_payable_days],
            ["Max Unpaid Days", policy.max_unpaid_leave_days],
            ["Require Full Attendance", policy.require_full_attendance ? "Yes" : null],
          ].filter(([, v]) => v != null).map(([l, v]) => (
            <div key={l} className="flex justify-between text-xs"><span className="text-gray-400">{l}</span><span className="text-gray-700 font-medium capitalize">{String(v)}</span></div>
          ))}
        </div>
      );
      return null;
    };
  
    return (
      <div className={cn("rounded-xl border-l-4 border border-gray-100 bg-white shadow-sm overflow-hidden", cfg.color)}>
        <div className="px-4 py-3 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border", cfg.badge)}>
                {cfg.icon}{type}
              </span>
              <span className="text-xs font-mono text-gray-300">{policy.id?.slice(0, 8)}…</span>
            </div>
            <p className="font-semibold text-sm text-gray-900 truncate">{policy.name || "Unnamed Policy"}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {canManage && (
              <>
                <button onClick={() => onEdit(policy)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(policy)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button onClick={() => setExpanded(!expanded)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        {expanded && (
          <div className="px-4 pb-3 pt-1 border-t border-gray-100 bg-gray-50/50">
            {renderDetails()}
          </div>
        )}
      </div>
    );
  }