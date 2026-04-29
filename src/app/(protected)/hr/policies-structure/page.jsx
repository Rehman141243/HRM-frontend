import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { PoliciesStructure } from '@/containers/shared/admin-hr/policies-structure';

export default function HRPoliciesStructurePage() {
  return (
    <>
      <BreadcrumbComponent
        data={[
          { name: 'Policies & Structure', url: '/hr/policies-structure' },
          { name: 'Policies', url: '/hr/policies-structure/' },
        ]}
      />
      <PoliciesStructure basePath="/hr" />
    </>
  );
}