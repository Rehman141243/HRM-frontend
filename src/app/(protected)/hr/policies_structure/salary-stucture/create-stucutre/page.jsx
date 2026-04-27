'use client'

import { Suspense } from "react";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import CreateSalaryStructurePage from "../../../../../../containers/hr/salarystucture/createstucture";

export default function CreateSalaryStructure() {
  return (
    <Suspense fallback={null}>
      <>
        <BreadcrumbComponent data={[
          { name: "Policies & Structure", url: "/hr/policies_structure" },
          { name: "Salary Structure", url: "/hr/policies_structure" },
          { name: "New Structure", url: "/hr/policies_structure/salary-stucture/create-stucutre" },
        ]} />
        <CreateSalaryStructurePage />
      </>
    </Suspense>
  );
}