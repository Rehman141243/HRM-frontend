import Attendance from "../../../../../containers/shared/hr-manager-employee/attendance/attendance";
import { BreadcrumbComponent } from "../../../../../components/common/breadcrumb-component";

const breadcrumbData = [
	{ name: "My Attendance", url: "/employee/attendance" },
	{ name: "Reports", url: "/employee/attendance/reports" },
];

export default function Page() {
	return (
		<>
			<BreadcrumbComponent data={breadcrumbData} />
			<Attendance initialTab="reports" basePath="/employee/attendance" />
		</>
	);
}