"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "var(--primary)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-sm">
      <div className="font-medium">{p.name}</div>
      <div className="mt-1 text-muted-foreground">
        Count: <span className="font-medium text-foreground tabular-nums">{p.value}</span>
      </div>
    </div>
  );
}

export default function DonutBreakdownCard({ title, data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<Tip />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={2}
              >
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground tabular-nums">{total}</span>
          </div>
          <div className="space-y-2">
            {data.map((d, idx) => (
              <div key={d.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-sm truncate">{d.name}</span>
                </div>
                <span className="text-sm text-muted-foreground tabular-nums">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

