import { PolicyRouteScreen } from '@/containers/shared/admin-hr/policies-structure';

export default function ViewEditPolicy() {
  return (
    <>
      <PolicyRouteScreen basePath="/hr" mode="edit" />
    </>
  );
}
