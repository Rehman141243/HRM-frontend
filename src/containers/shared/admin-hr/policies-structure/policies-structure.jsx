'use client'

import { useState } from "react";
import { CreditCard, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PolicyList } from "./policies/policy";
import { SalaryStructureList } from "./salary-structure/salary-structure";

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

/**
 * PoliciesStructure
 * 
 * Integrated component for managing both policies and salary structures.
 * Replaces the previous policies-page.jsx with consolidated functionality.
 * 
 * Props:
 *   - basePath (string): dashboard base path (default: "/hr")
 */
export default function PoliciesStructure({ basePath = "/hr" }) {
  const [activeTab, setActiveTab] = useState("policies");
  const meta = TAB_META[activeTab];
  const Icon = meta.icon;

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="policies" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mt-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg border bg-background p-2 shadow-xs">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{meta.description}</p>
          </div>

          <TabsList className="grid grid-cols-2 w-full sm:w-auto">
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="structure">Salary Structure</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="policies" className="mt-4">
          <PolicyList mode="combined" basePath={basePath} showHeader={false} />
        </TabsContent>

        <TabsContent value="structure" className="mt-4">
          <SalaryStructureList basePath={basePath} showHeader={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
