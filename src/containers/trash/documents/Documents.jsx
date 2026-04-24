"use client";

import { FileText, UploadCloud, FolderOpen } from "lucide-react";

import ModuleHeader from "@/components/common/module-header";
import StatCard from "@/components/common/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { mockDocuments, mockDocumentStats } from "@/containers/documents/data/mock-documents";

function AccessBadge({ value }) {
  const variant = value === "All" ? "default" : value === "HR" ? "secondary" : "outline";
  return <Badge variant={variant}>{value}</Badge>;
}

export default function DocumentsContainer() {
  return (
    <div className="flex flex-col gap-6">
      <ModuleHeader
        title="Documents"
        description="Store employee & company documents with versioning and role-based permissions. Static UI for now."
        icon={FileText}
        actions={[
          { label: "Upload", icon: UploadCloud, onClick: () => {} },
          { label: "Browse", variant: "outline", icon: FolderOpen, onClick: () => {} },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Documents" value={mockDocumentStats.total} hint="Across repositories" />
        <StatCard title="Employee Docs" value={mockDocumentStats.employeeDocs} hint="CNIC, passport, contracts" />
        <StatCard title="Policy Docs" value={mockDocumentStats.policyDocs} hint="Company-wide" />
        <StatCard title="Expiring Soon" value={mockDocumentStats.expiringSoon} hint="Next 30 days" />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Recent Files</CardTitle>
          <Button variant="outline" size="sm">View all</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDocuments.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">
                    <div className="min-w-[280px]">
                      <div className="text-foreground">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{d.type}</TableCell>
                  <TableCell className="text-muted-foreground">{d.owner}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">{d.updated}</TableCell>
                  <TableCell><AccessBadge value={d.access} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

