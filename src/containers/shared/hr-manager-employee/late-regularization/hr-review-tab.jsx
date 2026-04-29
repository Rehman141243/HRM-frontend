"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/common/data-table";
import { MobileCardList } from "@/components/responsiveness/late-regulation-card";
import TableToolbar from "@/components/common/table-toolbar";
import {
    regularizationCardFields,
    regularizationCardHighlight,
    regularizationTypes,
    requestStatusOptions,
} from "./late-regularization-columns";

const REGULARIZATION_FILTERS = [{ value: "all", label: "All Types" }, ...regularizationTypes];

export default function HrReviewTab({
    filteredHrRegularizations,
    hrRegularizationColumns,
    hrPageIndex,
    hrPageSize,
    hrTotal,
    hrLoading,
    hrSearch,
    hrStatus,
    hrType,
    hrStartDate,
    hrEndDate,
    setHrSearch,
    setHrStatus,
    setHrType,
    setHrStartDate,
    setHrEndDate,
    setHrPageIndex,
    setHrPageSize,
    onViewDetails,
    onReviewDialog,
    onRefresh,
}) {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base">All regularization requests (HR)</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    Review, approve, or reject requests across all employees.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <TableToolbar
                    placeholder="Search by employee, type, reason, status, or remarks..."
                    total={filteredHrRegularizations.length}
                    searchValue={hrSearch}
                    onSearchChange={setHrSearch}
                    rightSlot={
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Status</Label>
                                <Select
                                    value={hrStatus}
                                    onValueChange={(v) => {
                                        setHrStatus(v);
                                        setHrPageIndex(0);
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-35 text-[10px] sm:text-xs">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-40 text-[10px] sm:text-xs">
                                        {requestStatusOptions.map((opt) => (
                                            <SelectItem className="text-[10px] sm:text-xs" key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Type</Label>
                                <Select
                                    value={hrType}
                                    onValueChange={(v) => {
                                        setHrType(v);
                                        setHrPageIndex(0);
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-42.5 text-[10px] sm:text-xs">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" align="start" side="bottom" sideOffset={6} className="w-44 text-[10px] sm:text-xs">
                                        {REGULARIZATION_FILTERS.map((opt) => (
                                            <SelectItem className="text-[10px] sm:text-xs" key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">From</Label>
                                <Input
                                    type="date"
                                    value={hrStartDate}
                                    onChange={(e) => {
                                        setHrStartDate(e.target.value);
                                        setHrPageIndex(0);
                                    }}
                                    className="h-8 w-37.5 text-[10px] sm:text-xs placeholder:text-[10px] sm:placeholder:text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">To</Label>
                                <Input
                                    type="date"
                                    value={hrEndDate}
                                    onChange={(e) => {
                                        setHrEndDate(e.target.value);
                                        setHrPageIndex(0);
                                    }}
                                    className="h-8 w-37.5 text-[10px] sm:text-xs placeholder:text-[10px] sm:placeholder:text-xs"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-[10px]"
                                onClick={onRefresh}
                                disabled={hrLoading}
                            >
                                <RefreshCw className={`h-4 w-4 ${hrLoading ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                        </div>
                    }
                />

                {/* Desktop */}
                <div className="hidden md:block">
                    <DataTable
                        data={filteredHrRegularizations}
                        columns={hrRegularizationColumns}
                        page={hrPageIndex}
                        pageSize={hrPageSize}
                        total={hrTotal}
                        setPage={setHrPageIndex}
                        setPageSize={setHrPageSize}
                        isLoading={hrLoading}
                        loadingText="Loading regularizations for HR review..."
                        pagination
                    />
                </div>

                {/* Mobile */}
                <div className="block md:hidden">
                    <MobileCardList
                        data={filteredHrRegularizations}
                        fields={regularizationCardFields}
                        highlight={regularizationCardHighlight}
                        actions={(row) => (
                            <div className="grid w-full grid-cols-3 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => onViewDetails(row)}
                                >
                                    Details
                                </Button>
                                {String(row?.status || "").toLowerCase() === "pending" ? (
                                    <>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => onReviewDialog(row, "approved")}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => onReviewDialog(row, "rejected")}
                                        >
                                            Reject
                                        </Button>
                                    </>
                                ) : (
                                    <div className="col-span-2" />
                                )}
                            </div>
                        )}
                        keyExtractor={(row) => row.id || row.attendance_id || String(Math.random())}
                        isLoading={hrLoading}
                        loadingText="Loading regularizations for HR review..."
                        emptyText="No regularization requests found."
                        pagination
                        page={hrPageIndex}
                        pageSize={hrPageSize}
                        total={hrTotal}
                        setPage={setHrPageIndex}
                        setPageSize={setHrPageSize}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
