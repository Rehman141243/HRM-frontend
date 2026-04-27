'use client'

import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import SalaryStructuresPage from '@/containers/hr/salarystucture/salarystucture';

export default function SalaryStructurePage() {
  return (
    <>
      {/* <BreadcrumbComponent data={[
        { name: "Policies & Stucture ", url: "/hr/policies_structure" },
        { name: "Salary Structure", url: "/hr/policies_structure/salary-stucture" },
      ]} /> */}
      <SalaryStructuresPage />
    </>
  );
}