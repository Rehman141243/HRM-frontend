import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import SalaryStructurePage from "@/containers/employee/salary-structure/salary-structure";

export default function Page() {
  const breadcrumbData = [
    { name: "Salary Structure", url: "/employee/salary-structure" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <SalaryStructurePage />
    </>
  );
}
