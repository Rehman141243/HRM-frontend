import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { PolicyFormRouter } from '@/containers/shared/admin-hr/policies-structure';

export default function ViewEditPolicy({ params }) {
  const policyId = params?.id;
  
  const breadcrumbItems = [
    { name: 'Policies & Structure', url: '/hr/policies-structure' },
    { name: 'Policies', url: '/hr/policies-structure/policies' },
    { name: 'View/Edit', url: `/hr/policies-structure/policies/${policyId}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbItems} />
      <PolicyFormRouter basePath="/hr" mode="edit" />
    </>
  );
}
