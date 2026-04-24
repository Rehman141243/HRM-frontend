'use client'
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, RefreshCw } from "lucide-react";
import { getUser } from "@/lib/auth";
import { getPermissions } from "@/components/modal-components/modalcomponents";
import PoliciesTab from "@/components/modal-components/policy-tab";

export default function PoliciesPage() {
  const [user, setUser] = useState(null);
  useEffect(() => { setUser(getUser()); }, []);
  const perms = useMemo(() => getPermissions(user), [user]);

  if (user && !perms.canManagePolicies) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          You don't have permission to manage policies.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mt-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border bg-background p-2 shadow-xs">
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Policies</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Manage attendance, overtime, tax, and bonus policies.
          </p>
        </div>
      </div>

      {/* Policies Content */}
      <PoliciesTab perms={perms} />
    </div>
  );
}