'use client';

import AttendancePolicyForm from './attendance-policy/attendance-policy-form';
import BonusPolicyForm from './bonus-policy/bonus-policy-form';
import OvertimePolicyForm from './overtime-policy/overtime-policy-form';
import TaxPolicyForm from './tax-policy/tax-policy-form';

const POLICY_FORM_COMPONENTS = {
  attendance: AttendancePolicyForm,
  overtime: OvertimePolicyForm,
  tax: TaxPolicyForm,
  bonus: BonusPolicyForm,
};

export function PolicyRouteForm({
  type = 'attendance',
  mode = 'create',
  policyId,
  basePath = '/hr',
  onSuccess,
  onCancel,
}) {
  const SelectedForm = POLICY_FORM_COMPONENTS[type] || AttendancePolicyForm;

  return (
    <SelectedForm
      mode={mode}
      policyId={policyId}
      basePath={basePath}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}