import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import Payroll from "@/containers/employee/payroll/payroll";
export default function Page() {
  const breadcrumbData = [
    { name: "Payroll", url: "/employee/payroll" },
  ]
  
    return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <Payroll />
    </>
  )
}

