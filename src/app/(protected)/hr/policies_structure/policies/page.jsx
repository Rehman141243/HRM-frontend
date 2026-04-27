'use client'

import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import PoliciesPage from '@/containers/hr/policies/policies';

export default function HrPolicies() {
  return (
    <>
      <BreadcrumbComponent data={[
        { name: "Policies & Stucture ", url: "/hr/policies_structure" },
      
      ]} />
      <PoliciesPage />
    </>
  );
}