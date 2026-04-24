

import { BreadcrumbComponent } from '../../../../components/common/breadcrumb-component';
import  SalaryStructuresPage from '../../../../containers/admin/salarystucture/salarystucture'
export default function adminpolicies() {
    const breadcrumbData = [
        { name: "Payroll Services", url: "/admin/payroll" },
      ]
  return (
  <>
      <BreadcrumbComponent data={breadcrumbData} />
  <SalaryStructuresPage/>
  </>
  );
}