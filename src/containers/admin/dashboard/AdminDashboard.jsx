"use client";

import * as React from "react";
import { BarChart3, Sparkles, TrendingUp, Search, PieChart, Bell } from "lucide-react";

import ModuleHeader from "@/components/common/module-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import AreaTrendCard from "@/components/common/charts/area-trend";

import {
  mockActivity,
  mockKpis,
  mockTrend,
  mockPayments,
  mockTransactions,
} from "@/containers/admin/dashboard/data/mock-dashboard";

function InitialsAvatar({ name }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <div className="size-9 rounded-full bg-accent text-accent-foreground grid place-items-center text-xs font-semibold">
      {initials}
    </div>
  );
}

function StatusPill({ value }) {
  const cls =
    value === "Done"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${cls}`}>
      {value}
    </span>
  );
}

function DottedCard({ title, subtitle, rightSlot, children }) {
  return (
    <Card className="h-full rounded-2xl border border-dashed border-border/70 bg-card/70 shadow-xs">
      <CardHeader className="pb-2 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">{title}</CardTitle>
            {subtitle ? (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {rightSlot}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SolidCard({ title, rightSlot, children, className }) {
  return (
    <Card className={`h-full rounded-2xl border border-border/60 bg-card shadow-xs ${className || ""}`}>
      <CardHeader className="pb-2 pt-5">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          {rightSlot}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function KpiTile({ title, value, hint }) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-xs">
      <CardHeader className="pb-1.5 pt-5">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
        {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}

function MiniIncomeBars() {
  const bars = [
    { label: "15%", height: 18, tone: "bg-primary/25" },
    { label: "21%", height: 34, tone: "bg-primary/35" },
    { label: "32%", height: 54, tone: "bg-primary" },
  ];
  return (
    <div className="mt-3 flex items-end gap-3">
      {bars.map((b) => (
        <div key={b.label} className="flex flex-col items-center gap-2">
          <div className={`w-10 rounded-xl ${b.tone}`} style={{ height: `${b.height}px` }} />
          <span className="text-[11px] text-muted-foreground">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardContainer() {
  const [txQuery, setTxQuery] = React.useState("");
  const tx = React.useMemo(() => {
    const q = txQuery.trim().toLowerCase();
    if (!q) return mockTransactions;
    return mockTransactions.filter((t) => {
      return (
        t.receiver.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q) ||
        t.date.toLowerCase().includes(q)
      );
    });
  }, [txQuery]);

  return (
    <div className="flex flex-col gap-6">
      <ModuleHeader
        title="Analytics"
        description="A clean snapshot of HR operations. Static UI for now."
        icon={BarChart3}
        actions={[
          { label: "Export", variant: "outline", icon: TrendingUp, onClick: () => {} },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* {mockKpis.map((k) => (
          <KpiTile key={k.title} title={k.title} value={k.value} hint={k.hint} />
        ))} */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-4">
        <div className="lg:col-span-3">
          <DottedCard
            title="Team Payments"
            subtitle="07 Dec approval"
            rightSlot={<Bell className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {["Ayesha", "Bilal", "Sara"].map((n) => (
                  <div
                    key={n}
                    className="size-9 rounded-full ring-2 ring-background bg-accent grid place-items-center text-xs font-semibold"
                  >
                    {n[0]}
                  </div>
                ))}
              </div>
              <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                25+
              </span>
            </div>
          </DottedCard>
        </div>

        <div className="lg:col-span-3">
          <DottedCard
            title="Savings"
            subtitle="last week"
            rightSlot={
              <Button size="icon-sm" className="rounded-full" aria-label="Open savings">
                →
              </Button>
            }
          >
            <div className="mt-2 text-2xl font-semibold tabular-nums">$5,839</div>
            <div className="mt-1 text-xs text-muted-foreground">
              <span className="text-red-600 dark:text-red-400">−11%</span> vs last week
            </div>
          </DottedCard>
        </div>

        <div className="lg:col-span-3">
          <SolidCard title="Company Income" rightSlot={<Sparkles className="h-4 w-4 text-muted-foreground" />}>
            <div className="text-2xl font-semibold tabular-nums">$12,840</div>
            <div className="mt-1 text-xs text-muted-foreground">
              <span className="text-emerald-600 dark:text-emerald-400">+5.5%</span> from last week
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">This month</div>
              <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Updated
              </span>
            </div>
          </SolidCard>
        </div>

        <div className="lg:col-span-3">
          <SolidCard title="Income Statistics" rightSlot={<PieChart className="h-4 w-4 text-muted-foreground" />}>
            <div className="text-xs text-muted-foreground">Conversion</div>
            <MiniIncomeBars />
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                +8%
              </span>
              <span>vs previous period</span>
            </div>
          </SolidCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-12">
          <AreaTrendCard
            title="Operations Trend (7 days)"
            data={mockTrend}
            aKey="attendance"
            bKey="leaves"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-12">
          <SolidCard
            title="Recently Payments"
            rightSlot={<Button variant="outline" size="sm">See details</Button>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mockPayments.map((p) => (
                <div key={p.id} className="rounded-2xl border border-border/60 bg-card/70 p-4 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <InitialsAvatar name={p.name} />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums">${p.amount.toLocaleString()}</div>
                    <div className="mt-1"><StatusPill value={p.status} /></div>
                  </div>
                </div>
              ))}
            </div>
          </SolidCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-12">
          <SolidCard
            title="Transactions"
            rightSlot={
              <div className="relative w-full sm:w-[260px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={txQuery}
                  onChange={(e) => setTxQuery(e.target.value)}
                  placeholder="Search…"
                  className="pl-9 rounded-xl"
                />
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium">Receiver</th>
                    <th className="py-3 text-left font-medium">Type</th>
                    <th className="py-3 text-left font-medium">Status</th>
                    <th className="py-3 text-left font-medium">Date</th>
                    <th className="py-3 text-right font-medium">Amount</th>
                    <th className="py-3 text-right font-medium"> </th>
                  </tr>
                </thead>
                <tbody>
                  {tx.map((t) => (
                    <tr key={t.id} className="border-b last:border-b-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={t.receiver} />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{t.receiver}</div>
                            <div className="text-xs text-muted-foreground">{t.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{t.type}</td>
                      <td className="py-3"><StatusPill value={t.status} /></td>
                      <td className="py-3 text-muted-foreground">{t.date}</td>
                      <td className="py-3 text-right tabular-nums font-medium">${t.amount.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <Button variant="outline" size="sm" className="rounded-xl">Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SolidCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-12">
          <Card className="rounded-2xl border border-border/60 bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">Activity</CardTitle>
              <Button variant="outline" size="sm">View all</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockActivity.map((a) => (
                <div key={a.id} className="rounded-2xl border p-3 flex items-center justify-between gap-3 bg-card/70">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{a.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{a.meta}</div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{a.when}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}