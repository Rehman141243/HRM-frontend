

import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import OvertimeRequestTab from "../../../../containers/shared/admin-hr/overtime-request/overtime-request";

export default function Page() {
  const breadcrumbData = [
    { name: "Overtime Requests", url: "/admin/overtime" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <OvertimeRequestTab role="admin" />
    </>
  );
}

