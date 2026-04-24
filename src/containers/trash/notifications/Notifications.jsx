"use client";

import { Bell, Send, Settings2 } from "lucide-react";

import ModuleHeader from "@/components/common/module-header";
import StatCard from "@/components/common/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { mockNotificationKpis, mockNotifications } from "@/containers/notifications/data/mock-notifications";

function StatusBadge({ value }) {
  const variant = value === "Sent" ? "default" : value === "Queued" ? "secondary" : "outline";
  return <Badge variant={variant}>{value}</Badge>;
}

export default function NotificationsContainer() {
  return (
    <div className="flex flex-col gap-6">
      <ModuleHeader
        title="Notifications"
        description="Email/SMS alerts for approvals, leaves, birthdays, and policy updates. Static UI for now."
        icon={Bell}
        actions={[
          { label: "Send Test", icon: Send, onClick: () => {} },
          { label: "Preferences", variant: "outline", icon: Settings2, onClick: () => {} },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Queued" value={mockNotificationKpis.queued} hint="Waiting to send" />
        <StatCard title="Approvals" value={mockNotificationKpis.approvals} hint="Needs action" />
        <StatCard title="Birthdays" value={mockNotificationKpis.birthdays} hint="This week" />
        <StatCard title="Policy Updates" value={mockNotificationKpis.policyUpdates} hint="Unread" />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Button variant="outline" size="sm">View queue</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockNotifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium">{n.type}</TableCell>
                  <TableCell>
                    <div className="min-w-[320px]">
                      <div className="text-foreground">{n.message}</div>
                      <div className="text-xs text-muted-foreground">{n.id}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{n.channel}</TableCell>
                  <TableCell className="text-muted-foreground">{n.when}</TableCell>
                  <TableCell><StatusBadge value={n.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

