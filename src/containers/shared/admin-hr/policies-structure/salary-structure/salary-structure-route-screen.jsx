'use client';

import { useParams, useRouter } from 'next/navigation';
import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { SalaryStructureForm } from './salary-structure';

export function SalaryStructureRouteScreen({ basePath = '/hr', mode = 'create' }) {
  const router = useRouter();
  const params = useParams();
  const structureId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const handleSuccess = () => {
    router.push(`${basePath}/policies-structure/salary-structure`);
  };

  const handleCancel = () => {
    router.back();
  };

  const breadcrumbItems = [
    { name: 'Policies & Structure', url: `${basePath}/policies-structure` },
    { name: 'Salary Structures', url: `${basePath}/policies-structure/salary-structure` },
    mode === 'create'
      ? { name: 'Create', url: `${basePath}/policies-structure/salary-structure/create` }
      : { name: 'View/Edit', url: `${basePath}/policies-structure/salary-structure/${structureId}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbItems} />
      <SalaryStructureForm
        mode={mode}
        structureId={structureId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </>
  );
}