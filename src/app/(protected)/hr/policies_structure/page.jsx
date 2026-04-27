'use client';

import { useState } from 'react';
import { Shield, CreditCard } from 'lucide-react';
import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PoliciesPage from '@/containers/hr/policies/policies';
import SalaryStructuresPage from './salary-stucture/page';

const TAB_META = {
  policies: {
    icon: Shield,
    title: "Policies",
    description: "Manage attendance, overtime, tax, and bonus policies.",
  },
  structure: {
    icon: CreditCard,
    title: "Salary Structures",
    description: "Manage employee salary structures, allowances, and deductions.",
  },
};

export default function CompensationSetupPage() {
  const [activeTab, setActiveTab] = useState('policies');

  const meta = TAB_META[activeTab];
  const Icon = meta.icon;

  const breadcrumbs = [
    { name: "Policies & Structure", url: "/hr/policies_structure" },
    activeTab === 'policies'
      ? { name: "Policies", url: "/hr/policies_structure/" }
      : { name: "Salary Structure", url: "/hr/policies_structure/" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbs} />

      <div className="p-6 space-y-6">
        <Tabs defaultValue="policies" onValueChange={setActiveTab} className="w-full">

          {/* Header + Tabs together */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mt-5">
            {/* Dynamic title block */}
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg border bg-background p-2 shadow-xs">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>
              </div>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                {meta.description}
              </p>
            </div>

            {/* Tab switcher aligned to the right on desktop */}
            <TabsList className="grid grid-cols-2 w-full sm:w-auto">
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="structure">Salary Structure</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="policies" className="mt-4">
            <PoliciesPage />
          </TabsContent>
          <TabsContent value="structure" className="mt-4">
            <SalaryStructuresPage />
          </TabsContent>

        </Tabs>
      </div>
    </>
  );
}