"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ModuleHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon ? (
            <div className="rounded-lg border bg-background p-2 shadow-xs">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{description}</p>
        ) : null}
      </div>

      {actions?.length ? (
        <div className="flex flex-col sm:flex-row gap-2">
          {actions.map((a) => (
            <Button
              key={a.key || a.label}
              variant={a.variant || "default"}
              className={cn("w-full sm:w-auto", a.className)}
              onClick={a.onClick}
            >
              {a.icon ? <a.icon className="h-4 w-4 mr-2" /> : null}
              {a.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

