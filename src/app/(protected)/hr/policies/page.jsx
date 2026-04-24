import { BreadcrumbComponent } from '../../../../components/common/breadcrumb-component';
import  PoliciesPage from '../../../../containers/hr/policies/policies'
export default function adminpolicies() {
  const breadcrumbData = [
    { name: "Policies ", url: "/admin/policies" },
  ]
  return (
  <>
    <BreadcrumbComponent data={breadcrumbData} />
  <PoliciesPage/>
  </>
  );
}