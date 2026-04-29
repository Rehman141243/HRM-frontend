"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import OvertimePendingTab from "./overtime-pending-tab";
import OvertimeHistoryTab from "./overtime-history-tab";

export default function OvertimeRequestTab({ role = "hr" }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const clearFilters = () => {
    setStatusFilter("all");
  };

  const sharedFilters = { statusFilter };

  return (
    <div className="mt-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="flex items-center gap-2 font-semibold">
          <Clock className="h-4 w-4 text-primary" />
          Overtime Requests
        </h3>
        <p className="text-sm text-muted-foreground">
          {role === "admin"
            ? "View overtime request history"
            : "Manage and approve overtime requests from employees"}
        </p>
      </div>

      {/* ✅ ADMIN → ONLY HISTORY */}
      {role === "admin" ? (
        <OvertimeHistoryTab
          role={role}
          refreshKey={refreshKey}
          filters={sharedFilters}
          onStatusChange={setStatusFilter}
          onClearFilters={clearFilters}
        />
      ) : (
        /* ✅ OTHER ROLES → TABS */
        <Tabs defaultValue="pending" className="mt-4">
          <TabsList className="h-9">
            <TabsTrigger value="pending" className="gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-3 space-y-4">
            <OvertimePendingTab
              role={role}
              refreshKey={refreshKey}
              onActionSuccess={() => setRefreshKey((prev) => prev + 1)}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-3 space-y-4">
            <OvertimeHistoryTab
              role={role}
              refreshKey={refreshKey}
              filters={sharedFilters}
              onStatusChange={setStatusFilter}
              onClearFilters={clearFilters}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}