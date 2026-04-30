// Shared policies-structure components
// Single import point for policies and salary structure management
//
// Usage:
//   import { PoliciesStructure, PolicyList, SalaryStructureList, SalaryStructureForm } from '@/containers/shared/admin-hr/policies-structure';

export { default as PoliciesStructure } from './policies-structure';
export { PolicyList } from './policies/policy';
export { default as PolicyFormRouter } from './policies/policy-form-router';
export { SalaryStructureList } from './salary-structure/salary-structure';
export { default as SalaryStructureForm } from './salary-structure/salary-structure-form';

// Individual policy exports
export { AttendancePolicyList } from './policies/attendance-policy/attendance-policy';
export { default as AttendancePolicyForm } from './policies/attendance-policy/attendance-policy-form';

export { OvertimePolicyList } from './policies/overtime-policy/overtime-policy';
export { default as OvertimePolicyForm } from './policies/overtime-policy/overtime-policy-form';

export { TaxPolicyList } from './policies/tax-policy/tax-policy';
export { default as TaxPolicyForm } from './policies/tax-policy/tax-policy-form';

export { BonusPolicyList } from './policies/bonus-policy/bonus-policy';
export { default as BonusPolicyForm } from './policies/bonus-policy/bonus-policy-form';

