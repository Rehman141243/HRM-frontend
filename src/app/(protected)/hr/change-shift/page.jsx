import ShiftRequestsTab from "../../../../containers/hr/ShiftRequestsTab";

import { BreadcrumbComponent } from "../../../../components/common/breadcrumb-component";


export default function Page() {
  const breadcrumbData = [
    { name: "Request to change shift", url: "/hr/change-shift" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <ShiftRequestsTab />
    </>
  )
}

