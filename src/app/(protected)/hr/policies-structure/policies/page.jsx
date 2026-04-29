import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { PolicyList } from '@/containers/shared/admin-hr/policies-structure';

export default function HRPoliciesPage() {
  return (
    <>
      <BreadcrumbComponent
        data={[
          { name: 'Policies & Structure', url: '/hr/policies-structure' },
          { name: 'Policies', url: '/hr/policies-structure/policies' },
        ]}
      />
      <div className="p-6">
        <PolicyList mode="combined" basePath="/hr" showHeader={true} />
      </div>
    </>
  );
}
