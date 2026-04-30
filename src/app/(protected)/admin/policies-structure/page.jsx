'use client'

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { PoliciesStructure } from '@/containers/shared/admin-hr/policies-structure';

export default function AdminPoliciesStructurePage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "structure" ? "structure" : "policies";
  const [activeTab, setActiveTab] = useState(initialTab);

  const breadcrumbItems = [
    { name: 'Policies & Structure', url: '/admin/policies-structure' },
    activeTab === "policies"
      ? { name: 'Policies', url: '/admin/policies-structure' }
      : { name: 'Salary Structure', url: '/admin/policies-structure' },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbItems} />
      <PoliciesStructure basePath="/admin" onTabChange={setActiveTab} />
    </>
  );
}
