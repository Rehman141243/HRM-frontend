'use client'

import { useParams, usePathname } from 'next/navigation';
import { BreadcrumbComponent } from '../../../../components/common/breadcrumb-component';
import PoliciesPage from '../../../../containers/hr/policies/policies';

export default function HrPolicies() {
  // const pathname = usePathname();
  // const params = useParams();

  // const getBreadcrumbs = () => {
  //   const base = { name: "Policies", url: "/hr/policies" };

  //   if (pathname.includes('/create')) {
  //     return [
  //       base,
  //       { name: "Create New Policy", url: "/hr/policies/create" },
  //     ];
  //   }

  //   if (params?.id) {
  //     return [
  //       base,
  //       { name: `Edit Policy`, url: `/hr/policies/${params.id}` },
  //     ];
  //   }

  //   return [base];
  // };

  return (
    <>
      {/* <BreadcrumbComponent data={getBreadcrumbs()} /> */}
      <PoliciesPage />
    </>
  );
}