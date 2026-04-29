"use client";

import { useState } from "react";
import { getUser } from "@/lib/auth";
import {
  Building2,
  Clock,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import PendingTab from "./leave-pending-tab";
import HistoryTab from "./leave-history-tab";

const normalizeRole = (value) => value?.toLowerCase() || "";

export default function LeaveApprovalTab({ role = "hr" }) {
  const user = getUser();
  const userDesignation = normalizeRole(user?.designation);
  const userRole = normalizeRole(user?.role);

  let actualRole = normalizeRole(role);
  if (!actualRole) {
    if (userRole === "admin") actualRole = "admin";
    else if (userDesignation === "manager") actualRole = "manager";
    else if (userDesignation === "hr") actualRole = "hr";
    else actualRole = "employee";
  }

  if (actualRole === "employee") return null;
  if (actualRole === "admin" && userRole !== "admin") return null;
  if (actualRole === "manager" && userDesignation !== "manager") return null;
  if (actualRole === "hr" && userDesignation !== "hr") return null;

  const [statusFilter, setStatusFilter] = useState("all");
  const [managerStatusFilter, setManagerStatusFilter] = useState("all");
  const [hrStatusFilter, setHrStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [employeeIdFilter, setEmployeeIdFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const resetPage = () => {};

  const clearFilters = () => {
    setStatusFilter("all");
    setManagerStatusFilter("all");
    setHrStatusFilter("all");
    setLeaveTypeFilter("all");
    setEmployeeIdFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setSortOrder("desc");
    resetPage();
  };

  const sharedFilters = {
    statusFilter,
    managerStatusFilter,
    hrStatusFilter,
    leaveTypeFilter,
    employeeIdFilter,
    startDateFilter,
    endDateFilter,
    sortOrder,
  };

  const roleConfig = {
    admin: {
      icon: ShieldCheck,
      title: "Leave Management (Admin)",
      description: "Full authority and audit access across all leave requests.",
    },
    manager: {
      icon: UserCheck,
      title: "Leave Management (Manager)",
      description: "First approval level before HR finalizes the request.",
    },
    hr: {
      icon: Building2,
      title: "Leave Management (HR)",
      description: "Final approval authority after manager approval.",
    },
  };

  const config = roleConfig[actualRole] || roleConfig.hr;
  const RoleIcon = config.icon;

  const roleHeader = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="flex items-center gap-2 font-semibold">
          <RoleIcon className="h-4 w-4 text-primary" />
          {config.title}
        </h3>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </div>
    </div>
  );

  if (actualRole === "admin") {
    return (
      <div className="mt-4 space-y-4">
        {roleHeader}
        <PendingTab
          role={actualRole}
          filters={sharedFilters}
          onClearFilters={clearFilters}
          onLeaveTypeChange={(value) => { setLeaveTypeFilter(value); }}
          onSortOrderChange={(value) => { setSortOrder(value); }}
          refreshKey={refreshTrigger}
          onActionSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {roleHeader}

      <Tabs defaultValue="pending">
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

        <TabsContent value="pending" className="mt-3">
          <PendingTab
            role={actualRole}
            filters={sharedFilters}
            onClearFilters={clearFilters}
            onLeaveTypeChange={(value) => { setLeaveTypeFilter(value); }}
            onSortOrderChange={(value) => { setSortOrder(value); }}
            refreshKey={refreshTrigger}
            onActionSuccess={() => setRefreshTrigger((prev) => prev + 1)}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-3 space-y-3">
          <HistoryTab
            role={actualRole}
            refreshKey={refreshTrigger}
            filters={sharedFilters}
            onClearFilters={clearFilters}
            onStatusChange={(value) => { setStatusFilter(value); }}
            onManagerStatusChange={(value) => { setManagerStatusFilter(value); }}
            onHrStatusChange={(value) => { setHrStatusFilter(value); }}
            onLeaveTypeChange={(value) => { setLeaveTypeFilter(value); }}
            onEmployeeIdChange={(value) => { setEmployeeIdFilter(value); }}
            onStartDateChange={(value) => { setStartDateFilter(value); }}
            onEndDateChange={(value) => { setEndDateFilter(value); }}
            onSortOrderChange={(value) => { setSortOrder(value); }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
