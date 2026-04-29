import { PolicyRouteScreen } from '@/containers/shared/admin-hr/policies-structure';

export default function CreatePolicy() {
  return (
    <>
      <PolicyRouteScreen basePath="/hr" mode="create" />
    </>
  );
}
