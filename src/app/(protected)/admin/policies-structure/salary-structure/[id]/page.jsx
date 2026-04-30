import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { SalaryStructureForm } from '@/containers/shared/admin-hr/policies-structure';

export default function ViewEditSalaryStructure({ params }) {
  const structureId = params?.id;
  
  const breadcrumbItems = [
    { name: 'Policies & Structure', url: '/admin/policies-structure' },
    { name: 'Salary Structures', url: '/admin/policies-structure/salary-structure' },
    { name: 'View/Edit', url: `/admin/policies-structure/salary-structure/${structureId}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbItems} />
      <SalaryStructureForm basePath="/admin" mode="edit" />
    </>
  );
}
