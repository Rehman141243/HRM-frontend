import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { PoliciesStructure } from '@/containers/shared/admin-hr/policies-structure';

export default function AdminPoliciesStructurePage() {
  return (
    <>
      <BreadcrumbComponent
        data={[
          { name: 'Policies & Structure', url: '/admin/policies-structure' },
          { name: 'Policies', url: '/admin/policies-structure/' },
        ]}
      />
      <PoliciesStructure basePath="/admin" />
    </>
  );
}
