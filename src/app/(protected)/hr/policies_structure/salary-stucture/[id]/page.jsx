'use client'

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import EditSalaryStructurePage from "../../../../../../containers/hr/salarystucture/EditsalaryStructure";

function EditStructureContent() {
  const { id } = useParams();

  return (
    <>
      <BreadcrumbComponent data={[
        { name: "Policies & Structure", url: "/hr/policies_structure" },
        { name: "Salary Structure", url: "/hr/policies_structure" },
        { name: "Edit Structure", url: `/hr/policies_structure/salary-stucture/${id}` },
      ]} />
      <EditSalaryStructurePage />
    </>
  );
}

export default function EditSalaryStructure() {
  return (
    <Suspense fallback={null}>
      <EditStructureContent />
    </Suspense>
  );
}