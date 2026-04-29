// Shared policies-structure components
// Single import point for policies and salary structure management
//
// Usage:
//   import { PoliciesStructure, PolicyList, SalaryStructureList, SalaryStructureForm } from '@/containers/shared/admin-hr/policies-structure';

export { default as PoliciesStructure } from './policies-structure';
export { PolicyList } from './policies/policy';
export { PolicyRouteScreen } from './policies/policy-route-screen';
export { SalaryStructureList, SalaryStructureForm } from './salary-structure/salary-structure';
export { SalaryStructureRouteScreen } from './salary-structure/salary-structure-route-screen';
