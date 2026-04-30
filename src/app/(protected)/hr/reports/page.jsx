import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import Reports from '@/containers/shared/admin-hr/reports/reports';

export default function HRReportsPage() {
  const breadcrumbItems = [
    { name: 'Reports', url: '/hr/reports' },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbItems} />
      <Reports />
    </>
  );
}
