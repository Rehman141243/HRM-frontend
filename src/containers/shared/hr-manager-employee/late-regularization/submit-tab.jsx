"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/common/data-table";
import { MobileCardList } from "@/components/responsiveness/late-regulation-card";
import TableToolbar from "@/components/common/table-toolbar";
import { attendanceCardFields, attendanceCardHighlight } from "./late-regularization-columns";
import { toAttendanceId } from "./late-regularization-utils";

export default function SubmitTab({
    filteredAttendance,
    attendanceColumns,
    attendancePageIndex,
    attendancePageSize,
    attendanceTotal,
    attendanceLoading,
    attendanceSearch,
    attendanceStartDate,
    attendanceEndDate,
    setAttendanceSearch,
    setAttendanceStartDate,
    setAttendancePageIndex,
    setAttendanceEndDate,
    setAttendancePageSize,
    onRaiseDialog,
    onRefresh,
}) {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base">Attendance selector</CardTitle>
                <CardDescription className="text-xs sm:text-xs">
                    Filter your attendance records, then choose the one that needs a regularization request.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <TableToolbar
                    placeholder="Search by attendance id, date, status, or time..."
                    total={filteredAttendance.length}
                    searchValue={attendanceSearch}
                    onSearchChange={setAttendanceSearch}
                    rightSlot={
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="attendance-start-date" className="text-xs text-muted-foreground">From</Label>
                                <Input
                                    id="attendance-start-date"
                                    type="date"
                                    value={attendanceStartDate}
                                    onChange={(e) => {
                                        setAttendanceStartDate(e.target.value);
                                        setAttendancePageIndex(0);
                                    }}
                                    className="h-8 w-37.5 placeholder:text-xs text-xs sm:text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="attendance-end-date" className="text-xs text-muted-foreground">To</Label>
                                <Input
                                    id="attendance-end-date"
                                    type="date"
                                    value={attendanceEndDate}
                                    onChange={(e) => {
                                        setAttendanceEndDate(e.target.value);
                                        setAttendancePageIndex(0);
                                    }}
                                    className="h-8 w-37.5 placeholder:text-xs text-xs sm:text-sm"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={onRefresh}
                                disabled={attendanceLoading}
                            >
                                <RefreshCw className={`h-4 w-4 ${attendanceLoading ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                        </div>
                    }
                />

                {/* Desktop */}
                <div className="hidden md:block">
                    <DataTable
                        data={filteredAttendance}
                        columns={attendanceColumns}
                        page={attendancePageIndex}
                        pageSize={attendancePageSize}
                        total={attendanceTotal}
                        setPage={setAttendancePageIndex}
                        setPageSize={setAttendancePageSize}
                        isLoading={attendanceLoading}
                        loadingText="Loading your attendance records..."
                        pagination
                    />
                </div>

                {/* Mobile */}
                <div className="block md:hidden">
                    <MobileCardList
                        data={filteredAttendance}
                        fields={attendanceCardFields}
                        highlight={attendanceCardHighlight}
                        actions={(row) => (
                            <Button
                                type="button"
                                size="sm"
                                className="w-full gap-2"
                                disabled={!toAttendanceId(row)}
                                onClick={() => onRaiseDialog(row)}
                            >
                                Raise Regularization
                            </Button>
                        )}
                        keyExtractor={(row) => toAttendanceId(row) || String(Math.random())}
                        isLoading={attendanceLoading}
                        loadingText="Loading your attendance records..."
                        emptyText="No attendance records found."
                        pagination
                        page={attendancePageIndex}
                        pageSize={attendancePageSize}
                        total={attendanceTotal}
                        setPage={setAttendancePageIndex}
                        setPageSize={setAttendancePageSize}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
