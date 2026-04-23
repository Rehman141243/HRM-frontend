"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-sm">
      <div className="font-medium">{label}</div>
      <div className="mt-1 text-muted-foreground">
        Headcount: <span className="font-medium text-foreground tabular-nums">{payload[0]?.value}</span>
      </div>
    </div>
  );
}

export default function BarDepartmentsCard({ title, data }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} width={28} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="value" radius={[10, 10, 10, 10]} fill="var(--primary)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

