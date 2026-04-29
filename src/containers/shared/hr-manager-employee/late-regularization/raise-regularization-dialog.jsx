"use client";

import { RefreshCw, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { regularizationTypes } from "./late-regularization-columns";

export default function RaiseRegularizationDialog({
    open,
    onOpenChange,
    selectedAttendanceId,
    formData,
    formErrors,
    submitLoading,
    onFormChange,
    onSubmit,
    onClose,
}) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? onOpenChange(true) : onClose())}>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xs sm:text-sm">Raise regularization request</DialogTitle>
                    <DialogDescription className="text-[10px] sm:text-xs">
                        Attendance ID is prefilled from your own attendance record. Only employee-safe fields are included in the payload.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={onSubmit}>
                    {/* Attendance ID (read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="attendance-id">Attendance ID</Label>
                        <Input
                            id="attendance-id"
                            value={selectedAttendanceId}
                            readOnly
                            className="bg-muted/60 text-[10px]"
                        />
                        <p className="text-xs text-muted-foreground">
                            Selected from your attendance history and sent as attendance_id.
                        </p>
                        {formErrors.attendance_id && (
                            <p className="text-xs text-destructive">{formErrors.attendance_id}</p>
                        )}
                    </div>

                    {/* Type + Custom type */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) =>
                                    onFormChange({
                                        type: value,
                                        custom_type: value === "other" ? formData.custom_type : "",
                                    })
                                }
                            >
                                <SelectTrigger
                                    id="type"
                                    className={formErrors.type ? "border-destructive" : "text-[10px] sm:text-xs"}
                                >
                                    <SelectValue placeholder="Select a type" className="text-[10px] sm:text-xs" />
                                </SelectTrigger>
                                <SelectContent>
                                    {regularizationTypes.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                            className="text-[10px] sm:text-xs"
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Pick the reason category that best matches the attendance issue.
                            </p>
                            {formErrors.type && (
                                <p className="text-xs text-destructive">{formErrors.type}</p>
                            )}
                        </div>

                        {formData.type === "other" && (
                            <div className="space-y-2">
                                <Label htmlFor="custom-type">Custom type</Label>
                                <Input
                                    id="custom-type"
                                    placeholder="e.g. internet_outage"
                                    value={formData.custom_type}
                                    onChange={(e) => onFormChange({ custom_type: e.target.value })}
                                    className={
                                        formErrors.custom_type
                                            ? "border-destructive"
                                            : "text-xs placeholder:text-xs sm:text-xs sm:placeholder:text-xs"
                                    }
                                />
                                <p className="text-xs text-muted-foreground">Required only when the type is Other.</p>
                                {formErrors.custom_type && (
                                    <p className="text-xs text-destructive">{formErrors.custom_type}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                            id="reason"
                            rows={4}
                            placeholder="Explain why this attendance needs regularization"
                            value={formData.reason}
                            onChange={(e) => onFormChange({ reason: e.target.value })}
                            className={
                                formErrors.reason
                                    ? "border-destructive"
                                    : "text-xs placeholder:text-xs sm:text-xs sm:placeholder:text-xs"
                            }
                        />
                        <p className="text-xs text-muted-foreground">Minimum 5 characters. Keep it clear and factual.</p>
                        {formErrors.reason && (
                            <p className="text-xs text-destructive">{formErrors.reason}</p>
                        )}
                    </div>

                    {/* Supporting documents */}
                    <div className="space-y-2">
                        <Label htmlFor="supporting-documents">Supporting documents</Label>
                        <Input
                            id="supporting-documents"
                            type="file"
                            multiple
                            className="text-xs placeholder:text-xs sm:text-[10px] sm:placeholder:text-[10px]"
                            onChange={(e) => onFormChange({ documents: Array.from(e.target.files || []) })}
                        />
                        <p className="text-xs text-muted-foreground">Optional. Attach screenshots, receipts, or other proof.</p>
                        {formData.documents.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1 text-[10px] sm:text-xs">
                                {formData.documents.map((file) => (
                                    <Badge key={`${file.name}-${file.size}`} variant="outline" className="max-w-full truncate">
                                        {file.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={submitLoading}
                            className="text-xs sm:text-sm"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitLoading} className="gap-2">
                            {submitLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="h-4 w-4" />
                            )}
                            {submitLoading ? "Submitting..." : "Submit request"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
