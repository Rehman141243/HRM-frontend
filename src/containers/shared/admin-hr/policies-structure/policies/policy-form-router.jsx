'use client'

import { useSearchParams } from 'next/navigation';
import AttendancePolicyForm from './attendance-policy/attendance-policy-form';
import OvertimePolicyForm from './overtime-policy/overtime-policy-form';
import TaxPolicyForm from './tax-policy/tax-policy-form';
import BonusPolicyForm from './bonus-policy/bonus-policy-form';

const POLICY_FORM_COMPONENTS = {
  attendance: AttendancePolicyForm,
  overtime: OvertimePolicyForm,
  tax: TaxPolicyForm,
  bonus: BonusPolicyForm,
};

export default function PolicyFormRouter({ mode = 'create', basePath = '/hr' }) {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'attendance';
  
  const SelectedForm = POLICY_FORM_COMPONENTS[type] || AttendancePolicyForm;

  return <SelectedForm basePath={basePath} mode={mode} />;
}
