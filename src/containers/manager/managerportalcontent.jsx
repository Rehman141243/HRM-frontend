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

  Hourglass,
 
  Shield,

  Users,
  UserCheck,

} from "lucide-react";

import KpiCard from "@/components/common/common";
import AttendanceTab from "../hr/attendance/attendance";
import MyReportTab from "../hr/MyReportTab";



export default function ManagerPortalContent({ currentStatus, loading }) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <KpiCard icon={Users} label="Team Mgmt" value="Manager" hint="Review team requests" accent="blue" loading={false} />
        <KpiCard icon={CalendarDays} label="Leave Approvals" value="Pending" hint="Check leave tab" accent="amber" loading={false} />
        <KpiCard icon={Hourglass} label="Overtime" value="Pending" hint="Check overtime tab" accent="purple" loading={false} />
        <KpiCard icon={Shield} label="Shift Requests" value="Pending" hint="Check shift tab" accent="green" loading={false} />
      </div>

      <Tabs defaultValue="my_attendance" className="space-y-4 mt-4">
        {/* <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex gap-0">
          <TabsTrigger value="my_attendance" className="text-xs sm:text-sm gap-1.5"><Clock className="h-3.5 w-3.5 hidden sm:inline" />My Attendance</TabsTrigger>
          <TabsTrigger value="leave_approvals" className="text-xs sm:text-sm gap-1.5"><UserCheck className="h-3.5 w-3.5 hidden sm:inline" />Leave Approvals</TabsTrigger>
          <TabsTrigger value="overtime" className="text-xs sm:text-sm gap-1.5"><Hourglass className="h-3.5 w-3.5 hidden sm:inline" />Overtime</TabsTrigger>
          <TabsTrigger value="shift_requests" className="text-xs sm:text-sm gap-1.5"><Shield className="h-3.5 w-3.5 hidden sm:inline" />Shift Requests</TabsTrigger>
        </TabsList> */}
        <TabsContent value="my_attendance">
          <div className="space-y-4">
            <AttendanceTab />
            <Separator />
            <MyReportTab />
          </div>
        </TabsContent>
        {/* <TabsContent value="leave_approvals"><ManagerLeaveApprovalTab /></TabsContent>
        <TabsContent value="overtime"><ManagerOvertimeTab /></TabsContent>
        <TabsContent value="shift_requests"><ManagerShiftRequestsTab /></TabsContent> */}
      </Tabs>
    </>
  );
}
