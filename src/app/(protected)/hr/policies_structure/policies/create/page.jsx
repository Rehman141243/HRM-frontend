'use client'

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PolicyForm, { TYPE_META } from "../../../../../../components/policies/policy-form";

function CreatePolicyContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "attendance";
  const typeLabel = TYPE_META[type]?.label || type;

  return (
    <>
      <BreadcrumbComponent data={[
        { name: "Policies & Structure", url: "/hr/policies_structure" },
        { name: "Policies", url: "/hr/policies_structure/policies" },
        {
          name: id ? `Edit ${typeLabel} Policy` : `Create ${typeLabel} Policy`,
          url: id
            ? `/hr/policies_structure/policies/${id}?type=${type}`
            : `/hr/policies_structure/policies/create?type=${type}`,
        },
      ]} />
      <PolicyForm />
    </>
  );
}

export default function CreatePolicyPage() {
  return (
    <Suspense fallback={null}>
      <CreatePolicyContent />
    </Suspense>
  );
}