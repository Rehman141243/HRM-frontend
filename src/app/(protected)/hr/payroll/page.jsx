import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import Payroll from '@/containers/shared/admin-hr/payroll/payroll';

export default function HRPayrollPage() {
  const breadcrumbItems = [
    { name: 'Payroll', url: '/hr/payroll' },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbItems} />
      <Payroll />
    </>
  );
}
