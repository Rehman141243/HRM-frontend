import Attendance from "../../../../../containers/employee/attendance/attendance";
import { BreadcrumbComponent } from "../../../../../components/common/breadcrumb-component";

const breadcrumbData = [
	{ name: "My Attendance", url: "/employee/attendance" },
	{ name: "Regularization", url: "/employee/attendance/regularization" },
];

export default function Page() {
	return (
		<>
			<BreadcrumbComponent data={breadcrumbData} />
			<Attendance initialTab="regularization" />
		</>
	);
}