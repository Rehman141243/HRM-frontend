import { BreadcrumbComponent } from '../../../../components/common/breadcrumb-component';
import  PayrollService from '../../../../containers/admin/payroll/payroll'
export default function adminpolicies() {
 
const breadcrumbData = [
  { name: "Payroll Services", url: "/admin/payroll" },
]
  return (
  <>
  
  <BreadcrumbComponent data={breadcrumbData} />
  <PayrollService/>
  </>
  );
}

