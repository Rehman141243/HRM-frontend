"use client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function TableToolbar({
  placeholder,
  total = 0,
  searchValue,
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
      <div className="flex flex-1 flex-col gap-2 md:max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-primary transition-colors duration-200 group-focus-within:text-secondary/70" />
          <Input
            placeholder={placeholder || "Search…"}
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className={cn(
              "pl-10",
              "border-input focus:border-ring",
              "focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-none focus-visible:shadow-none placeholder:text-[10px] sm:text-xs text-[10px] sm:text-xs"
            )}
          />
        </div>
        {/* {typeof total === "number" && total >= 0 && (
          <p className="text-xs text-muted-foreground">
            {total} result{total === 1 ? "" : "s"}
          </p>
        )} */}
      </div>

      {rightSlot}
    </div>
  );
}

