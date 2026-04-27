'use client'

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PolicyForm from "@/components/policies/policy-form";

function EditPolicyContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "attendance";
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <>
      <BreadcrumbComponent data={[
        { name: "Policies", url: "/hr/policies" },
        { name: `Edit ${typeLabel} Policy`, url: `/hr/policies/${id}?type=${type}` },
      ]} />
      <PolicyForm />
    </>
  );
}

export default function EditPolicyPage() {
  return (
    <Suspense fallback={null}>
      <EditPolicyContent />
    </Suspense>
  );
}