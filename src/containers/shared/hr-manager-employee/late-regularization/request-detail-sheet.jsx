"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { fmtDate } from "@/components/common/common";
import { requestStatusMeta } from "./late-regularization-columns";

export default function RequestDetailSheet({ open, onOpenChange, selectedRequest, requestSummary, requestDocuments }) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="text-xs sm:text-sm">Request details</SheetTitle>
                    <SheetDescription className="text-[10px] sm:text-xs">
                        Review the submitted information, attached files, and any response fields returned by the API.
                    </SheetDescription>
                </SheetHeader>

                {selectedRequest && (
                    <div className="space-y-4 p-4 pt-0">
                        {/* Status + submitted header */}
                        <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
                            <div>
                                <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                                <Badge
                                    variant="outline"
                                    className={`mt-2 text-[10px] sm:text-xs font-medium ${requestStatusMeta(selectedRequest.status).className}`}
                                >
                                    {requestStatusMeta(selectedRequest.status).label}
                                </Badge>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] sm:text-sm uppercase tracking-wide text-muted-foreground">Submitted</p>
                                <p className="mt-1 text-[10px] sm:text-sm font-medium">
                                    {fmtDate(selectedRequest.submitted_at || selectedRequest.created_at)}
                                </p>
                            </div>
                        </div>

                        {/* Summary grid */}
                        <div className="grid gap-3 sm:grid-cols-2">
                            {requestSummary.map((item) => (
                                <div key={item.label} className="rounded-xl border p-3">
                                    <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">
                                        {item.label}
                                    </p>
                                    <p className="mt-1 wrap-break-word text-[10px] sm:text-sm font-medium">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Attachments */}
                        {requestDocuments.length > 0 && (
                            <div className="space-y-3 rounded-xl border p-4">
                                <div>
                                    <p className="text-sm font-medium">Attachments</p>
                                    <p className="text-xs text-muted-foreground">
                                        Preview the supporting documents attached to this request.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    {requestDocuments.map((document, index) => {
                                        const href =
                                            document?.url ||
                                            document?.file_url ||
                                            document?.path ||
                                            document?.download_url ||
                                            document?.location ||
                                            "";
                                        const label =
                                            document?.name ||
                                            document?.file_name ||
                                            document?.filename ||
                                            document?.original_name ||
                                            `Document ${index + 1}`;
                                        return (
                                            <div
                                                key={`${label}-${index}`}
                                                className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">{label}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {href || "No preview link available"}
                                                    </p>
                                                </div>
                                                {href && (
                                                    <Button asChild variant="outline" size="sm">
                                                        <a href={href} target="_blank" rel="noreferrer">Open</a>
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* History log */}
                        {Array.isArray(selectedRequest.history) && selectedRequest.history.length > 0 && (
                            <div className="space-y-3 rounded-xl border p-4">
                                <div>
                                    <p className="text-sm font-medium">History</p>
                                    <p className="text-xs text-muted-foreground">Action log returned by the API.</p>
                                </div>
                                <div className="space-y-2">
                                    {selectedRequest.history.map((entry, index) => (
                                        <div key={index} className="rounded-lg border bg-muted/20 p-3">
                                            <p className="text-sm font-medium">
                                                {entry?.action || entry?.status || `Event ${index + 1}`}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {fmtDate(entry?.created_at || entry?.timestamp || entry?.date)}
                                            </p>
                                            {entry?.remarks && (
                                                <p className="mt-2 text-sm">{entry.remarks}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
