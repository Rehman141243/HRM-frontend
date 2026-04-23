"use client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function TableToolbar({
  placeholder,
  total = 0,
  onSearchChange,
  className,
  rightSlot,
}) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4",
        "bg-card rounded-lg shadow-sm border border-border",
        className
      )}
    >
      <div className="relative flex-1 max-w-md group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary transition-colors duration-200 group-focus:text-secondary/50" />
        <Input
          placeholder={placeholder || "Search…"}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className={cn(
            "pl-10",
            "border-input focus:border-ring",
            "focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-none focus-visible:shadow-none"
          )}
        />
      </div>

      {rightSlot}
    </div>
  );
}

