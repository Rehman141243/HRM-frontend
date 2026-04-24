import { BreadcrumbComponent } from '../../../../components/common/breadcrumb-component';
import  PoliciesPage from '../../../../containers/admin/policies/policies'
export default function adminpolicies() {
    const breadcrumbData = [
        { name: "Payroll Services", url: "/admin/payroll" },
      ]
  return (
  <>
    <BreadcrumbComponent data={breadcrumbData} />
  <PoliciesPage/>
  </>
  );
}