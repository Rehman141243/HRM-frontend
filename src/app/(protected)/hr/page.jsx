import { BreadcrumbComponent } from "../../../components/common/breadcrumb-component";
import HumanResource from "../../../containers/hr/hr";



export default function Page() {
  const breadcrumbData = [
    { name: "My Attendance", url: "/hr" },
  ]
  
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <HumanResource />
    </>
  )
}



