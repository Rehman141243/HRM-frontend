import { Breadcrumb } from "@/components/ui/breadcrumb";
import Attendance from "../../../../containers/shared/hr-manager-employee/attendance/attendance";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";

export default function AttendancePage() {
  
const breadcrumbData = [
	{ name: "My Attendance", url: "/employee/attendance" },
];

  return (
    <div className="min-h-screen">
      <BreadcrumbComponent data={breadcrumbData}/>
      <Attendance basePath="/hr/attendance" />
    </div>
  );
}
