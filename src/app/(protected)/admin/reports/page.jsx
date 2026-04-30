import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import Reports from '@/containers/shared/admin-hr/reports/reports';

export default function AdminReportsPage() {
  const breadcrumbItems = [
    { name: 'Reports', url: '/admin/reports' },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbItems} />
      <Reports />
    </>
  );
}
