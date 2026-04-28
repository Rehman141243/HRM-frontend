


import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import EmployeeContainer from "@/containers/shared/admin-hr/employee-management/employee";
const breadcrumbData = [
    { name: "Employees", url: "/hr/employee-management" },
  ];
export default function Page() {
  return (
  <>
  <BreadcrumbComponent data={breadcrumbData}/>
  <EmployeeContainer />
  </>
  );
}