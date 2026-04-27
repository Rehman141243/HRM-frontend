import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import PayrollDetailsPage from "@/containers/employee/payroll/payroll-details";

export default async function Page({ params }) {
  const resolvedParams = await params;
  const payrollId = resolvedParams?.id;

  const breadcrumbData = [
    { name: "Payroll", url: "/employee/payroll" },
    { name: "Payroll Details", url: `/employee/payroll-details/${payrollId}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <PayrollDetailsPage />
    </>
  );
}
