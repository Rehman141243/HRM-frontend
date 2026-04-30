import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { SalaryStructureForm } from '@/containers/shared/admin-hr/policies-structure';

export default function ViewEditSalaryStructure({ params }) {
  const structureId = params?.id;
  
  const breadcrumbItems = [
    { name: 'Policies & Structure', url: '/hr/policies-structure' },
    { name: 'Salary Structures', url: '/hr/policies-structure/salary-structure' },
    { name: 'View/Edit', url: `/hr/policies-structure/salary-structure/${structureId}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbItems} />
      <SalaryStructureForm basePath="/hr" mode="edit" />
    </>
  );
}
