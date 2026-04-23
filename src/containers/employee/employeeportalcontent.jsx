"use client";


import { Separator } from "@/components/ui/separator";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";


import {


  Clock,
  CalendarDays,

  Timer,

  TrendingUp,
  FileText,

  CalendarX,
  Hourglass,
  Activity,

  Shield,

} from "lucide-react";

import KpiCard, { fmtTime } from "@/components/common/common";
import MyReportTab from "../hr/MyReportTab";
import AttendanceTab from "../hr/Attendance";







export default function EmployeePortalContent({ currentStatus, loading }) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        <KpiCard
          icon={Activity}
          label="Today's Status"
          value={
            loading ? "—"
              : currentStatus?.punch_status === "CHECKED_IN" ? "Active"
                : currentStatus?.punch_status === "CHECKED_OUT" ? "Done"
                  : "Pending"
          }
          hint={currentStatus?.check_in_time ? `In: ${fmtTime(currentStatus.check_in_time)}` : "Not checked in"}
          accent={currentStatus?.punch_status === "CHECKED_IN" ? "green" : currentStatus?.punch_status === "CHECKED_OUT" ? "blue" : "amber"}
          loading={loading}
        />
        <KpiCard
          icon={Timer}
          label="Today's Hours"
          value={
            loading ? "—"
              : currentStatus?.duration_hours ? `${currentStatus.duration_hours}h`
                : currentStatus?.punch_status === "CHECKED_IN" ? "In progress"
                  : "—"
          }
          hint={currentStatus?.check_out_time ? `Out: ${fmtTime(currentStatus.check_out_time)}` : "Still working"}
          accent="blue"
          loading={loading}
        />
        <KpiCard
          icon={CalendarDays}
          label="Leave Status"
          value={loading ? "—" : (currentStatus?.status === "ON_LEAVE" || currentStatus?.status === "leave") ? "On Leave" : "—"}
          hint={(currentStatus?.status === "ON_LEAVE" || currentStatus?.status === "leave") ? "Approved leave" : "No leave today"}
          accent="amber"
          loading={loading}
        />
        <KpiCard icon={TrendingUp} label="Overtime" value="View" hint="Check requests tab" accent="purple" loading={loading} />
      </div>

      <Tabs defaultValue="attendance" className="space-y-4 mt-4">

        <TabsContent value="attendance"><AttendanceTab /></TabsContent>

      </Tabs>

      <div className="mt-2" />
      <Separator />
      <div>
        <div className="flex items-center justify-between mb-4 mt-4 ">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />My Attendance Report
            </h2>
            <p className="text-xs text-muted-foreground">View detailed stats for any date range</p>
          </div>
        </div>
        <MyReportTab />
      </div>
    </>
  );
}
