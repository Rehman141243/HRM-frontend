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

export default function MyRegularizationsTab({
    filteredRegularizations,
    regularizationColumns,
    regularizationPageIndex,
    regularizationPageSize,
    regularizationTotal,
    regularizationLoading,
    regularizationSearch,
    regularizationStatus,
    regularizationType,
    regularizationStartDate,
    regularizationEndDate,
    setRegularizationSearch,
    setRegularizationStatus,
    setRegularizationType,
    setRegularizationStartDate,
    setRegularizationEndDate,
    setRegularizationPageIndex,
    setRegularizationPageSize,
    onViewDetails,
    onRefresh,
}) {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base">My regularizations</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    Track pending, approved, and rejected requests with filters for type and date range.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <TableToolbar
                    placeholder="Search by type, reason, status, or remarks..."
                    total={filteredRegularizations.length}
                    searchValue={regularizationSearch}
                    onSearchChange={setRegularizationSearch}
                    rightSlot={
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Status</Label>
                                <Select
                                    value={regularizationStatus}
                                    onValueChange={(v) => {
                                        setRegularizationStatus(v);
                                        setRegularizationPageIndex(0);
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
                                    value={regularizationType}
                                    onValueChange={(v) => {
                                        setRegularizationType(v);
                                        setRegularizationPageIndex(0);
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
                                    value={regularizationStartDate}
                                    onChange={(e) => {
                                        setRegularizationStartDate(e.target.value);
                                        setRegularizationPageIndex(0);
                                    }}
                                    className="h-8 w-37.5 text-[10px] sm:text-xs placeholder:text-[10px] sm:placeholder:text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">To</Label>
                                <Input
                                    type="date"
                                    value={regularizationEndDate}
                                    onChange={(e) => {
                                        setRegularizationEndDate(e.target.value);
                                        setRegularizationPageIndex(0);
                                    }}
                                    className="h-8 w-37.5 text-[10px] sm:text-xs placeholder:text-[10px] sm:placeholder:text-xs"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-[10px]"
                                onClick={onRefresh}
                                disabled={regularizationLoading}
                            >
                                <RefreshCw className={`h-4 w-4 ${regularizationLoading ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                        </div>
                    }
                />

                {/* Desktop */}
                <div className="hidden md:block">
                    <DataTable
                        data={filteredRegularizations}
                        columns={regularizationColumns}
                        page={regularizationPageIndex}
                        pageSize={regularizationPageSize}
                        total={regularizationTotal}
                        setPage={setRegularizationPageIndex}
                        setPageSize={setRegularizationPageSize}
                        isLoading={regularizationLoading}
                        loadingText="Loading your regularization requests..."
                        pagination
                    />
                </div>

                {/* Mobile */}
                <div className="block md:hidden">
                    <MobileCardList
                        data={filteredRegularizations}
                        fields={regularizationCardFields}
                        highlight={regularizationCardHighlight}
                        actions={(row) => (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full gap-2"
                                onClick={() => onViewDetails(row)}
                            >
                                View Details
                            </Button>
                        )}
                        keyExtractor={(row) => row.id || row.attendance_id || String(Math.random())}
                        isLoading={regularizationLoading}
                        loadingText="Loading your regularization requests..."
                        emptyText="No regularization requests found."
                        pagination
                        page={regularizationPageIndex}
                        pageSize={regularizationPageSize}
                        total={regularizationTotal}
                        setPage={setRegularizationPageIndex}
                        setPageSize={setRegularizationPageSize}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
