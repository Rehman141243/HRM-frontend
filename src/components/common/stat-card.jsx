"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, hint, icon: Icon, className }) {
  return (
    <Card className={cn("border-border/60 shadow-sm", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {Icon ? (
            <div className="rounded-md border bg-background p-2">
              <Icon className="w-3 h-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

