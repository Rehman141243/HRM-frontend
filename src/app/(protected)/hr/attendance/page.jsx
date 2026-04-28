import Attendance from "../../../../containers/shared/hr-manager-employee/attendance/attendance";

export default function AttendancePage() {
  return (
    <div className="min-h-screen">
      <Attendance basePath="/hr/attendance" />
    </div>
  );
}
