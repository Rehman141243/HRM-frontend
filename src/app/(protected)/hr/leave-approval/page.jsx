import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";
import LeaveApprovalTab from "../../../../containers/shared/admin-hr/leave-approval/leave-approval";

export default function Page() {
  const breadcrumbData = [
    { name: "Leave Approvel", url: "/hr/leaveapprovetab" },
  ];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <LeaveApprovalTab role="hr" />
    </>
  );
}

