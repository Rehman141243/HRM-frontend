'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getPermissions } from "@/components/modal-components/modalcomponents";
import { getUser } from "@/lib/auth";
import DeleteConfirmModal from "@/components/modals/deletecomfirmmodal";
import PolicyDetailModal from "@/components/modals/policy-details-modal";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { buildAttendancePolicyColumns } from "./attendance-policy-columns";
import { Plus, RefreshCw, Shield } from "lucide-react";
import { API_PATH, POLICY_META, extractErrorMessage } from "./attendance-policy-utils";

export function AttendancePolicyList({
  showHeader = true,
  basePath = "/hr",
}) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  useEffect(() => { setUser(getUser()); }, []);
  const perms = useMemo(() => getPermissions(user), [user]);

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [detailModal, setDetailModal] = useState({ open: false, policy: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, policy: null });
  const [deleting, setDeleting] = useState(false);

  const meta = POLICY_META;

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATH);
      setPolicies(response.data.policies || []);
    } catch (error) {
      if (error.response?.status !== 404) toast.error("Failed to fetch policies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const filtered = useMemo(() => (
    search.trim()
      ? policies.filter((policy) => policy.name?.toLowerCase().includes(search.toLowerCase()))
      : policies
  ), [policies, search]);

  const goToCreate = () => router.push(`${basePath}/policies-structure/policies/create?type=attendance`);
  const goToEdit = (policy) => router.push(`${basePath}/policies-structure/policies/${policy.id}?type=attendance`);

  const columns = useMemo(() => buildAttendancePolicyColumns({
    canManage: perms.canManagePolicies,
    onEdit: goToEdit,
    onDelete: (item) => setDeleteModal({ open: true, policy: item }),
    onView: (item) => setDetailModal({ open: true, policy: item }),
  }), [perms.canManagePolicies, goToEdit]);

  const handleDelete = async () => {
    const { policy } = deleteModal;
    if (!policy?.id) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`${API_PATH}/${policy.id}`);
      toast.success("Policy deleted.");
      loadPolicies();
      setDeleteModal({ open: false, policy: null });
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to delete policy"));
    } finally {
      setDeleting(false);
    }
  };

  if (user && !perms.canManagePolicies) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Shield className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">You don&apos;t have permission to manage policies.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {showHeader && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg border bg-background p-2 shadow-xs">
                <meta.Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{meta.description}</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="p-4 border-gray-200 dark:border-gray-800">
          <TableToolbar
            placeholder="Search attendance policies…"
            total={filtered.length}
            searchValue={search}
            onSearchChange={setSearch}
            rightSlot={perms.canManagePolicies ? (
              <Button size="sm" className="h-8 gap-1.5 shrink-0" onClick={goToCreate}>
                <Plus className="w-3.5 h-3.5" />
                New {meta.label} policy
              </Button>
            ) : null}
          />
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading attendance policies…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Shield className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {search
                  ? `No policies match "${search}"`
                  : `No attendance policies yet.${perms.canManagePolicies ? " Create one to get started." : ""}`}
              </p>
            </div>
          ) : (
            <DataTable
              data={filtered}
              columns={columns}
              isLoading={false}
              pagination={false}
              columnsBtn={false}
            />
          )}
        </div>
      </div>

      <PolicyDetailModal
        open={detailModal.open}
        policy={detailModal.policy}
        type="attendance"
        onClose={() => setDetailModal({ open: false, policy: null })}
        onEdit={goToEdit}
        canManage={perms.canManagePolicies}
      />

      <DeleteConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, policy: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete attendance policy?"
        description={`Are you sure you want to delete "${deleteModal.policy?.name}"? This may affect salary structures using this policy.`}
      />
    </div>
  );
}

export default AttendancePolicyList;
