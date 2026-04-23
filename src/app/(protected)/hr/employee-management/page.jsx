


import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import EmployeeContainer from "../../../../containers/hr/employee-management/Employee";
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