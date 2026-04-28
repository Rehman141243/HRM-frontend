

import EmployeeContainer from "@/containers/shared/admin-hr/employee-management/employee";
import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
const breadcrumbData = [
    { name: "Employees", url: "/admin/employee-management" },
  ];
export default function Page() {
  return (
  <>
  <BreadcrumbComponent data={breadcrumbData}/>
  <EmployeeContainer />
  </>
  );
}