"use client";

import * as React from "react";
import axiosInstance from "@/lib/axiosInstance";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TooltipProvider } from "@/components/ui/tooltip";
import KpiCard, { fmtDate, fmtTime, getUserRole, StatusBadge, todayDateStr } from "@/components/common/common"

import ManagerPortalContent from "../manager/managerportalcontent";
import EmployeePortalContent from "../employee/employeeportalcontent";
import HRPortalContent from "../hr/hrportalcontent";





export default function UserPortal() {
  const [currentStatus, setCurrentStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const { role, designation, name, email } = React.useMemo(() => getUserRole(), []);

  React.useEffect(() => {
    const init = async () => {
      try {

        const res = await axiosInstance.get("/attendance/status");
        setCurrentStatus(res.data?.data ?? null);
      } catch (e) {
        console.error("Portal init failed", e);
        setCurrentStatus(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const initials   = name?.[0]?.toUpperCase() ?? email?.[0]?.toUpperCase() ?? "U";
  const displayName = name || email || "User";

  const portalLabel = React.useMemo(() => {
    if (designation === "manager") return "Manager Portal";
    if (designation === "hr") return "HR Portal";
    return "Employee Self-Service Portal";
  }, [designation]);

  const portalAccentColor = React.useMemo(() => {
    if (designation === "manager") return "text-blue-600 dark:text-blue-400";
    if (designation === "hr") return "text-purple-600 dark:text-purple-400";
    return "text-muted-foreground";
  }, [designation]);

  const renderPortalContent = () => {
    if (designation === "manager") {
      return <ManagerPortalContent currentStatus={currentStatus} loading={loading} />;
    }
    if (designation === "hr") {
      return <HRPortalContent currentStatus={currentStatus} loading={loading} />;
    }
    return <EmployeePortalContent currentStatus={currentStatus} loading={loading} />;
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-5 max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-primary/10 border border-primary/20">
              <AvatarFallback className="text-sm font-semibold text-primary bg-primary/10">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-base font-semibold leading-tight">{displayName}</h1>
              <p className={`text-xs font-medium ${portalAccentColor}`}>{portalLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {designation && (
              <Badge variant="outline" className="text-xs capitalize">
                {designation}
              </Badge>
            )}
            {!loading && currentStatus && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">Today:</span>
                <StatusBadge status={currentStatus.punch_status ?? currentStatus.status} />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {renderPortalContent()}
      </div>
    </TooltipProvider>
  );
}