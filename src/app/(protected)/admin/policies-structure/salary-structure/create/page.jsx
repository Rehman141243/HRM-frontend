import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { SalaryStructureForm } from '@/containers/shared/admin-hr/policies-structure';

export default function CreateSalaryStructure() {
  const breadcrumbItems = [
    { name: 'Policies & Structure', url: '/admin/policies-structure' },
    { name: 'Salary Structures', url: '/admin/policies-structure/salary-structure' },
    { name: 'Create', url: '/admin/policies-structure/salary-structure/create' },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbItems} />
      <SalaryStructureForm basePath="/admin" mode="create" />
    </>
  );
}
