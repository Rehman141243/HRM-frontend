import Attendance from "../../../../containers/shared/hr-manager-employee/attendance/attendance";
import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";

const breadcrumbData = [
	{ name: "My Attendance", url: "/employee/attendance" },
];

export default function Page() {
	return (
		<>
			<BreadcrumbComponent data={breadcrumbData} />
			<Attendance basePath="/employee/attendance" />
		</>
	);
}




