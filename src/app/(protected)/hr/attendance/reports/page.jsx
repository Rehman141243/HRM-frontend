import Attendance from "../../../../../containers/shared/hr-manager-employee/attendance/attendance";
import { BreadcrumbComponent } from "../../../../../components/common/breadcrumb-component";

const breadcrumbData = [
	{ name: "My Attendance", url: "/hr/attendance" },
	{ name: "Reports", url: "/hr/attendance/reports" },
];

export default function Page() {
	return (
		<>
			<BreadcrumbComponent data={breadcrumbData} />
			<Attendance initialTab="reports" basePath="/hr/attendance" />
		</>
	);
}