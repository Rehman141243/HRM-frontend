import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { PolicyFormRouter } from '@/containers/shared/admin-hr/policies-structure';

export default function ViewEditPolicy({ params }) {
  const policyId = params?.id;
  
  const breadcrumbItems = [
    { name: 'Policies & Structure', url: '/admin/policies-structure' },
    { name: 'Policies', url: '/admin/policies-structure/policies' },
    { name: 'View/Edit', url: `/admin/policies-structure/policies/${policyId}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbItems} />
      <PolicyFormRouter basePath="/admin" mode="edit" />
    </>
  );
}
