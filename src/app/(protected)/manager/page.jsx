


import { BreadcrumbComponent } from "../../../components/common/breadcrumb-component";
import ManagerPortalContent from "../../../containers/manager/managerportalcontent";


export default function Page() {
  const breadcrumbData = [
    { name: " My Attendance ", url: "/manager" },
  ]
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <ManagerPortalContent />
    </>
  )
}