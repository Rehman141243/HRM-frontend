"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {

  Clock,
  CalendarDays,
  CalendarX,
  Hourglass,
  BarChart3,
  ClipboardList,
  Building2,
} from "lucide-react";


import KpiCard from "../common/page";

import AttendanceTab from "./Attendance";
import MyReportTab from "./MyReportTab";



export default function HRPortalContent({ currentStatus, loading }) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <KpiCard icon={Building2} label="HR Portal" value="HR Admin" hint="Full access" accent="blue" loading={false} />
        <KpiCard icon={CalendarDays} label="Leave Final Approval" value="Authority" hint="After manager approval" accent="amber" loading={false} />
        <KpiCard icon={Hourglass} label="Overtime Mgmt" value="All Requests" hint="Approve / reject" accent="purple" loading={false} />
        <KpiCard icon={BarChart3} label="Reports" value="Daily" hint="Attendance analytics" accent="green" loading={false} />
      </div>

   
        {/* <TabsList className="w-full sm:w-auto grid grid-cols-5 sm:flex gap-0">
          {/* <TabsTrigger value="my_attendance" className="text-xs sm:text-sm gap-1.5"><Clock className="h-3.5 w-3.5 hidden sm:inline" />My Attendance</TabsTrigger>
          <TabsTrigger value="leave_mgmt" className="text-xs sm:text-sm gap-1.5"><ClipboardList className="h-3.5 w-3.5 hidden sm:inline" />Leave Mgmt</TabsTrigger>
          <TabsTrigger value="overtime" className="text-xs sm:text-sm gap-1.5"><Hourglass className="h-3.5 w-3.5 hidden sm:inline" />Overtime</TabsTrigger>
          <TabsTrigger value="daily_report" className="text-xs sm:text-sm gap-1.5"><BarChart3 className="h-3.5 w-3.5 hidden sm:inline" />Daily Report</TabsTrigger>
          <TabsTrigger value="my_leave" className="text-xs sm:text-sm gap-1.5"><CalendarX className="h-3.5 w-3.5 hidden sm:inline" />My Leave</TabsTrigger> 
        </TabsList> */}
     
          <div className="space-y-4 mt-4">
            <AttendanceTab />
            {/* <Separator /> */}
            <MyReportTab />
          </div>
   
        {/* <TabsContent value="leave_mgmt"><HRLeaveApprovalTab /></TabsContent>
        <TabsContent value="overtime"><HROvertimeTab /></TabsContent>
        <TabsContent value="daily_report"><HRAttendanceDailyTab /></TabsContent>
        <TabsContent value="my_leave"><LeaveTab /></TabsContent> */}

    </>
  );
}