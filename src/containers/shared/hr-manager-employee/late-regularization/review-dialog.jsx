"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatLabel } from "./late-regularization-columns";

export default function ReviewDialog({
    open,
    onOpenChange,
    reviewTarget,
    reviewStatus,
    reviewRemarks,
    reviewAppliedEffect,
    reviewOverride,
    reviewOverrideReason,
    reviewSubmitting,
    setReviewRemarks,
    setReviewAppliedEffect,
    setReviewOverride,
    setReviewOverrideReason,
    onSubmit,
    onClose,
}) {
    const isApproval = reviewStatus === "approved";

    return (
        <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? onOpenChange(true) : onClose())}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xs sm:text-sm">
                        {isApproval ? "Approve request" : "Reject request"}
                    </DialogTitle>
                    <DialogDescription className="text-[10px] sm:text-xs">
                        Employee:{" "}
                        {`${reviewTarget?.employee?.first_name || ""} ${reviewTarget?.employee?.last_name || ""}`.trim() || "--"}{" "}
                        | Type: {formatLabel(reviewTarget?.type)}
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={onSubmit}>
                    {/* Remarks */}
                    <div className="space-y-2">
                        <Label htmlFor="review-remarks">Remarks</Label>
                        <Textarea
                            id="review-remarks"
                            rows={3}
                            placeholder={
                                isApproval
                                    ? "Approved due to verified details."
                                    : "Evidence not sufficient for policy exception."
                            }
                            value={reviewRemarks}
                            onChange={(e) => setReviewRemarks(e.target.value)}
                            className="text-xs placeholder:text-xs sm:text-sm sm:placeholder:text-sm"
                        />
                    </div>

                    {/* Approval-only options */}
                    {isApproval && (
                        <div className="space-y-3 rounded-lg border border-border/60 p-3">
                            <label className="flex items-center gap-2 text-xs sm:text-sm">
                                <input
                                    type="checkbox"
                                    checked={reviewAppliedEffect}
                                    onChange={(e) => setReviewAppliedEffect(e.target.checked)}
                                />
                                Apply effect now
                            </label>
                            <label className="flex items-center gap-2 text-xs sm:text-sm">
                                <input
                                    type="checkbox"
                                    checked={reviewOverride}
                                    onChange={(e) => setReviewOverride(e.target.checked)}
                                />
                                Use HR override
                            </label>
                            {reviewOverride && (
                                <div className="space-y-2">
                                    <Label htmlFor="override-reason">Override reason</Label>
                                    <Textarea
                                        id="override-reason"
                                        rows={2}
                                        placeholder="Exceptional weather conditions validated by HR."
                                        value={reviewOverrideReason}
                                        onChange={(e) => setReviewOverrideReason(e.target.value)}
                                        className="text-xs placeholder:text-xs sm:text-sm sm:placeholder:text-sm"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="flex flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={reviewSubmitting}
                            className="text-xs sm:text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant={isApproval ? "default" : "destructive"}
                            disabled={reviewSubmitting}
                            className="gap-2"
                        >
                            {reviewSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
                            {isApproval ? "Approve" : "Reject"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
