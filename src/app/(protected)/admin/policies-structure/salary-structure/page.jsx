import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { SalaryStructureList } from '@/containers/shared/admin-hr/policies-structure';

export default function AdminSalaryStructuresPage() {
  return (
    <>
      <BreadcrumbComponent
        data={[
          { name: 'Policies & Structure', url: '/admin/policies-structure' },
          { name: 'Salary Structures', url: '/admin/policies-structure/salary-structure' },
        ]}
      />
      <div className="p-6">
        <SalaryStructureList basePath="/admin" showHeader={true} />
      </div>
    </>
  );
}
