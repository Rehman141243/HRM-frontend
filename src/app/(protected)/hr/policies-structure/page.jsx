'use client'

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { PoliciesStructure } from '@/containers/shared/admin-hr/policies-structure';

export default function HRPoliciesStructurePage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "structure" ? "structure" : "policies";
  const [activeTab, setActiveTab] = useState(initialTab);

  const breadcrumbItems = [
    { name: 'Policies & Structure', url: '/hr/policies-structure' },
    activeTab === "policies"
      ? { name: 'Policies', url: '/hr/policies-structure' }
      : { name: 'Salary Structure', url: '/hr/policies-structure' },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbItems} />
      <PoliciesStructure basePath="/hr" onTabChange={setActiveTab} />
    </>
  );
}