import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { PolicyFormRouter } from '@/containers/shared/admin-hr/policies-structure';

export default function CreatePolicy() {
  const breadcrumbItems = [
    { name: 'Policies & Structure', url: '/admin/policies-structure' },
    { name: 'Policies', url: '/admin/policies-structure/policies' },
    { name: 'Create', url: '/admin/policies-structure/policies/create' },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbItems} />
      <PolicyFormRouter basePath="/admin" mode="create" />
    </>
  );
}
