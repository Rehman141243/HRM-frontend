import { BreadcrumbComponent } from "../../../../../components/common/breadcrumb-component";
import Attendance from "../../../../../containers/shared/hr-manager-employee/attendance/attendance";

const breadcrumbData = [
	{ name: "My Attendance", url: "/manager/attendance" },
	{ name: "Regularization", url: "/manager/attendance/regularization" },
];

export default function Page() {
	return (
		<>
			<BreadcrumbComponent data={breadcrumbData} />
			<Attendance initialTab="regularization" basePath="/manager/attendance" />
		</>
	);
}