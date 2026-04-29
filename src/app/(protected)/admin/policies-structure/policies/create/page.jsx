import { BreadcrumbComponent } from '@/components/common/breadcrumb-component';
import { PolicyRouteScreen } from '@/containers/shared/admin-hr/policies-structure';

export default function CreatePolicy() {
  return (
    <>
      <PolicyRouteScreen basePath="/admin" mode="create" />
    </>
  );
}
