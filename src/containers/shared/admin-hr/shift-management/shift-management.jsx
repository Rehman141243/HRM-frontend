"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import EmployeeAssignmentsTab from "./employee-assignment-tab";
import ShiftsManagementTab from "./shift-mangement-tab";

export default function ShiftManagement() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    setUser(u);

    const role = (u?.role ?? "").toLowerCase();
    const designation = (u?.designation ?? "").toLowerCase();

    if (role === "admin") return;

    if (role === "user") {
      if (designation === "hr" || designation === "manager") return;
      router.push("/");
    }
  }, [router]);

  const role = user?.role?.toLowerCase();
  const designation = user?.designation?.toLowerCase();

  if (!user) return null;

  if (role !== "admin") {
    if (role !== "user" || (designation !== "hr" && designation !== "manager")) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Access restricted.</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col gap-6 p-1">
      <div className="flex items-center gap-3 mt-5">
        <div className="rounded-lg border bg-background p-2 shadow-xs">
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shift Management</h1>
          <p className="text-sm text-muted-foreground">
            Define work shifts, assign to employees, and approve shift change requests.
          </p>
        </div>
      </div>

      <Tabs defaultValue="shifts" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-2">
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="mt-4">
          <EmployeeAssignmentsTab showActions={role !== "admin"} />
        </TabsContent>

        <TabsContent value="shifts" className="mt-4">
          <ShiftsManagementTab showActions={role !== "admin"} />
        </TabsContent>

      </Tabs>
    </div>
  );
}
