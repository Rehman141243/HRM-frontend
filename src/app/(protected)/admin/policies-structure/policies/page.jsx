import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { PolicyList } from '@/containers/shared/admin-hr/policies-structure';

export default function AdminPoliciesPage() {
  return (
    <>
      <BreadcrumbComponent
        data={[
          { name: 'Policies & Structure', url: '/admin/policies-structure' },
          { name: 'Policies', url: '/admin/policies-structure/policies' },
        ]}
      />
      <div className="p-6">
        <PolicyList mode="combined" basePath="/admin" showHeader={true} />
      </div>
    </>
  );
}
