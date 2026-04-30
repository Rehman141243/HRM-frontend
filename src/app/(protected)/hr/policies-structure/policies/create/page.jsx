import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { PolicyFormRouter } from '@/containers/shared/admin-hr/policies-structure';

export default function CreatePolicy() {
  const breadcrumbItems = [
    { name: 'Policies & Structure', url: '/hr/policies-structure' },
    { name: 'Policies', url: '/hr/policies-structure/policies' },
    { name: 'Create', url: '/hr/policies-structure/policies/create' },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbItems} />
      <PolicyFormRouter basePath="/hr" mode="create" />
    </>
  );
}
