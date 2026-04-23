import { Pencil, RefreshCw } from "lucide-react";
import { ComponentEditor, inputCls, Modal, ModalBody, ModalHeader } from "../modal-components/modalcomponents";
import { PolicySelect, usePolicies } from "./createstucturemodal";
import { useEffect, useState } from "react";

export default function EditStructureModal({ structure, open, onClose, onSave, loading }) {
    const [form, setForm] = useState({});
    const [allowances, setAllowances] = useState([]);
    const [deductions, setDeductions] = useState([]);
    
    // Fetch policies
    const { policies, fetchAllPolicies } = usePolicies();
  
    useEffect(() => {
      if (structure && open) {
        setForm({
          name: structure.name || "",
          basic_salary: String(structure.basic_salary || ""),
          currency: structure.currency || "PKR",
          effective_from: structure.effective_from || "",
          is_active: structure.is_active ?? true,
          attendance_policy_id: structure.attendance_policy_id || "",
          overtime_policy_id: structure.overtime_policy_id || "",
          tax_policy_id: structure.tax_policy_id || "",
          bonus_policy_id: structure.bonus_policy_id || "",
        });
        setAllowances((structure.allowances || []).map((a) => ({ 
          ...a, 
          value: String(a.value ?? a.amount ?? ""), 
          apply_proration: a.apply_proration !== false,
          basis: a.basis || "basic_salary"
        })));
        setDeductions((structure.deductions || []).map((d) => ({ 
          ...d, 
          value: String(d.value ?? d.amount ?? ""), 
          apply_proration: d.apply_proration !== false,
          basis: d.basis || "gross_salary"
        })));
        fetchAllPolicies();
      }
    }, [structure, open, fetchAllPolicies]);
  
    const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
    const setPolicy = (k) => (id) => setForm((f) => ({ ...f, [k]: id }));
  
    const handleSubmit = () => {
      const normalizeComponents = (comps) => comps
        .filter((c) => c.name && c.value !== "")
        .map((c) => ({ 
          name: c.name, 
          type: c.type, 
          value: parseFloat(c.value) || 0, 
          basis: c.basis,
          apply_proration: c.apply_proration === true 
        }));
    
      const payload = {};
      
      if (form.name?.trim()) payload.name = form.name.trim();
      if (form.basic_salary && !isNaN(parseFloat(form.basic_salary))) 
        payload.basic_salary = parseFloat(form.basic_salary);
      if (form.currency?.trim()) payload.currency = form.currency.trim();
      if (form.effective_from) payload.effective_from = form.effective_from;
      
      payload.is_active = form.is_active === true;
      
      // Only include policies if they've been selected
      if (form.attendance_policy_id?.trim()) 
        payload.attendance_policy_id = form.attendance_policy_id.trim();
      if (form.overtime_policy_id?.trim()) 
        payload.overtime_policy_id = form.overtime_policy_id.trim();
      if (form.tax_policy_id?.trim()) 
        payload.tax_policy_id = form.tax_policy_id.trim();
      if (form.bonus_policy_id?.trim()) 
        payload.bonus_policy_id = form.bonus_policy_id.trim();
      
      payload.allowances = normalizeComponents(allowances);
      payload.deductions = normalizeComponents(deductions);
    
      onSave(structure.id, payload);
    };
  
    if (!structure) return null;
  
    return (
      <Modal open={open} onClose={onClose} maxWidth="max-w-2xl">
        <ModalHeader
          icon={Pencil}
          title="Edit Salary Structure"
          subtitle={`${structure.employee?.first_name || ""} ${structure.employee?.last_name || ""} · ${structure.employee?.designation || "—"}`}
          onClose={onClose}
        />
        <ModalBody>
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Structure Name</label>
                <input className={inputCls} value={form.name || ""} onChange={setF("name")} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Currency</label>
                <input className={inputCls} value={form.currency || ""} onChange={setF("currency")} />
              </div>
            </div>
  
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Basic Salary</label>
                <input type="number" min="0" step="0.01" className={inputCls} value={form.basic_salary || ""} onChange={setF("basic_salary")} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Effective From</label>
                <input type="date" className={inputCls} value={form.effective_from || ""} onChange={setF("effective_from")} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
                <select value={form.is_active ? "active" : "inactive"} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === "active" }))} className={inputCls}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
  
            <hr className="border-gray-100" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Policies</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Attendance Policy</label>
                <PolicySelect
                  value={form.attendance_policy_id}
                  onChange={setPolicy("attendance_policy_id")}
                  policies={policies.attendance}
                  placeholder="Select attendance policy"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Overtime Policy</label>
                <PolicySelect
                  value={form.overtime_policy_id}
                  onChange={setPolicy("overtime_policy_id")}
                  policies={policies.overtime}
                  placeholder="Select overtime policy"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tax Policy</label>
                <PolicySelect
                  value={form.tax_policy_id}
                  onChange={setPolicy("tax_policy_id")}
                  policies={policies.tax}
                  placeholder="Select tax policy"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bonus Policy</label>
                <PolicySelect
                  value={form.bonus_policy_id}
                  onChange={setPolicy("bonus_policy_id")}
                  policies={policies.bonus}
                  placeholder="Select bonus policy"
                />
              </div>
            </div>
  
            <hr className="border-gray-100" />
            <ComponentEditor title="Allowances" components={allowances} onChange={setAllowances} basisOptions={["basic_salary", "gross_salary"]} />
            <ComponentEditor title="Deductions" components={deductions} onChange={setDeductions} basisOptions={["gross_salary", "basic_salary"]} />
  
            <div className="flex justify-end gap-2 pt-2 pb-1">
              <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold transition-colors disabled:opacity-50">
                {loading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Saving…</> : "Save Changes"}
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }