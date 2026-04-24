

import { BreadcrumbComponent } from '../../../../components/common/breadcrumb-component';
import  SalaryStructuresPage from '../../../../containers/hr/salarystucture/salarystucture'
export default function adminpolicies() {
  const breadcrumbData = [
    { name: "Policies ", url: "/admin/policies" },
  ]
  return (
  <>
   <BreadcrumbComponent data={breadcrumbData} />
  <SalaryStructuresPage/>
  </>
  );
}