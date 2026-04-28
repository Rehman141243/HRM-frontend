import Attendance from "../../../../../containers/shared/hr-manager-employee/attendance/attendance";
import { BreadcrumbComponent } from "../../../../../components/common/breadcrumb-component";

const breadcrumbData = [
	{ name: "My Attendance", url: "/hr/attendance" },
	{ name: "Regularization", url: "/hr/attendance/regularization" },
];

export default function Page() {
	return (
		<>
			<BreadcrumbComponent data={breadcrumbData} />
			<Attendance initialTab="regularization" basePath="/hr/attendance" />
		</>
	);
}