import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { SalaryStructureList } from '@/containers/shared/admin-hr/policies-structure';

export default function HRSalaryStructuresPage() {
  return (
    <>
      <BreadcrumbComponent
        data={[
          { name: 'Policies & Structure', url: '/hr/policies-structure' },
          { name: 'Salary Structures', url: '/hr/policies-structure/salary-structure' },
        ]}
      />
      <div className="p-6">
        <SalaryStructureList basePath="/hr" showHeader={true} />
      </div>
    </>
  );
}
