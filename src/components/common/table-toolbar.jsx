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
  const showSearch = typeof onSearchChange === "function";
  const showTotal = typeof total === "number" && total >= 0;

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4",
        "bg-card rounded-lg shadow-sm border border-border",
        className
      )}
    >
      <div className={cn("flex flex-col gap-2", showSearch ? "flex-1 md:max-w-md" : "md:min-w-0") }>
        {showSearch ? (
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:h-4 sm:w-4 text-primary transition-colors duration-200 " />
            <Input
              placeholder={placeholder || "Search…"}
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className={cn(
                "pl-10",
                "border-input focus:border-ring",
                "focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-none focus-visible:shadow-none text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm"
              )}
            />
          </div>
        ) : showTotal ? (
          <p className="text-sm text-muted-foreground">
            {total} result{total === 1 ? "" : "s"}
          </p>
        ) : null}
        {/* {typeof total === "number" && total >= 0 && (
          <p className="text-xs text-muted-foreground">
            {total} result{total === 1 ? "" : "s"}
          </p>
        )} */}
      </div>

      <div className={cn("flex items-center gap-2", showSearch ? "" : "md:ml-auto")}>{rightSlot}</div>
    </div>
  );
}

