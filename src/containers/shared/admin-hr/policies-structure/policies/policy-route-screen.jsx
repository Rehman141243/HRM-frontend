'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { PolicyRouteForm } from './policy-route-form';

export function PolicyRouteScreen({ basePath = '/hr', mode = 'create' }) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const policyId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const type = searchParams.get('type') || 'attendance';

  const handleSuccess = () => {
    router.push(`${basePath}/policies-structure/policies`);
  };

  const handleCancel = () => {
    router.back();
  };

  const breadcrumbItems = [
    { name: 'Policies & Structure', url: `${basePath}/policies-structure` },
    { name: 'Policies', url: `${basePath}/policies-structure/policies` },
    mode === 'create'
      ? { name: 'Create', url: `${basePath}/policies-structure/policies/create` }
      : { name: 'View/Edit', url: `${basePath}/policies-structure/policies/${policyId}` },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbItems} />
      <PolicyRouteForm
        type={type}
        mode={mode}
        policyId={policyId}
        basePath={basePath}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </>
  );
}