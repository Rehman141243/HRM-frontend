import AttendanceReports from "../../../../containers/employee/attendance-reports/attendance-reports";
import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";

const breadcrumbData = [
	{ name: "Attendance Reports", url: "/employee/attendance-reports" },
];

export default function Page() {
	return (
		<>
			<BreadcrumbComponent data={breadcrumbData} />
			<AttendanceReports />
		</>
	);
}
