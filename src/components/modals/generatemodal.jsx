import { useEffect, useState } from "react";
import { inputCls, Modal, ModalBody, ModalHeader, MONTH_NAMES } from "../modal-components/modalcomponents";
import { AlertTriangle, RefreshCw, TrendingUp, UserCheck } from "lucide-react";

export default function GenerateModal({ open, onClose, onGenerate, loading, prefilledEmployee }) {
    const now = new Date();
    const [month, setMonth] = useState(String(now.getMonth() + 1));
    const [year, setYear] = useState(String(now.getFullYear()));
  
    useEffect(() => {
      if (!open) { setMonth(String(new Date().getMonth() + 1)); setYear(String(new Date().getFullYear())); }
    }, [open]);
  
    const handleSubmit = () => {
      const m = Number(month), y = Number(year);
      if (m < 1 || m > 12) return toast.error("Month must be 1–12");
      if (y < 2000 || y > 2100) return toast.error("Year must be 2000–2100");
      const payload = { month: m, year: y };
      if (prefilledEmployee) payload.employee_id = prefilledEmployee.id;
      onGenerate(payload);
    };
  
    const empName = prefilledEmployee ? `${prefilledEmployee.first_name || ""} ${prefilledEmployee.last_name || ""}`.trim() : null;
  
    return (
      <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
        <ModalHeader icon={TrendingUp} title={prefilledEmployee ? "Generate Payroll" : "Generate All Payrolls"} onClose={onClose} />
        <ModalBody>
          <div className="px-6 py-5 space-y-4">
            {prefilledEmployee ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight text-gray-900 truncate">{empName}</p>
                  <p className="text-xs text-gray-500 truncate">{prefilledEmployee.designation || "—"}{prefilledEmployee.department ? ` · ${prefilledEmployee.department}` : ""}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Bulk run generates payroll for all employees with active salary structures.
              </div>
            )}
  
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Month</label>
                <select value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls}>
                  {MONTH_NAMES.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Year</label>
                <input type="number" min="2000" max="2100" value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} />
              </div>
            </div>
  
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold transition-colors disabled:opacity-50">
                {loading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Generating…</> : <><TrendingUp className="w-3.5 h-3.5" />Generate</>}
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }