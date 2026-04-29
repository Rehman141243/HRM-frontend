"use client";

/**
 * MobileCard & MobileCardList — Reusable mobile-first card components
 *
 * Usage:
 *   <MobileCardList
 *     data={records}
 *     fields={[
 *       { label: "Date", accessor: (row) => fmtDate(row.date) },
 *       { label: "Status", accessor: (row) => <Badge>...</Badge> },
 *     ]}
 *     actions={(row) => <Button onClick={() => handle(row)}>Do thing</Button>}
 *     keyExtractor={(row) => row.id}
 *     emptyText="No records found."
 *     isLoading={false}
 *     loadingText="Loading..."
 *     // Pagination props (optional — mirrors DataTable)
 *     page={0}
 *     pageSize={10}
 *     total={42}
 *     setPage={(idx) => ...}
 *     setPageSize={(size) => ...}
 *     pagination
 *   />
 */

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* ─── Single card ─────────────────────────────────────────────────────────── */

/**
 * @param {object}   props
 * @param {object}   props.row            — The data row
 * @param {Array}    props.fields         — [{ label, accessor, className?, fullWidth?, half? }]
 *   label      : string shown as the key
 *   accessor   : (row) => string | ReactNode
 *   className  : extra classes on the value cell
 *   fullWidth  : if true, spans full width (for long text like "Reason")
 *   half       : default behaviour — rendered in a 2-col grid
 * @param {function} [props.actions]      — (row) => ReactNode rendered at card bottom
 * @param {string}   [props.className]    — extra classes on the card wrapper
 * @param {object}   [props.highlight]    — { accessor: (row) => ReactNode, className? }
 *   A prominent badge/status shown top-right of the card header
 */
export function MobileCard({ row, fields, actions, className, highlight }) {
    // First non-fullWidth field is used as the card "title" in the header
    const allNormal = fields.filter((f) => !f.fullWidth);
    const fullWidthFields = fields.filter((f) => f.fullWidth);

    const [titleField, ...bodyFields] = allNormal;

    // Pair body fields for the 2-col grid; odd one out becomes full-width
    const pairedFields = [];
    let i = 0;
    while (i < bodyFields.length) {
        if (i + 1 < bodyFields.length) {
            pairedFields.push([bodyFields[i], bodyFields[i + 1]]);
            i += 2;
        } else {
            // Lone field — treat it as full-width inside the grid section
            pairedFields.push([bodyFields[i], null]);
            i++;
        }
    }

    return (
        <div
            className={cn(
                "rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden",
                className
            )}
        >
            {/* ── Header: title field + highlight badge ───────────────────────── */}
            {titleField && (
                <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-border/40">
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-0.5">
                            {titleField.label}
                        </p>
                        <div className={cn("text-[10px] sm:text-sm font-semibold text-foreground break-all", titleField.className)}>
                            {titleField.accessor(row)}
                        </div>
                    </div>

                    {highlight && (
                        <div className={cn("text-[10px] sm:text-sm shrink-0 pt-0.5", highlight.className)}>
                            {highlight.accessor(row)}
                        </div>
                    )}
                </div>
            )}

            {/* ── 2-col body grid ─────────────────────────────────────────────── */}
            {pairedFields.length > 0 && (
                <div className="divide-y divide-border/30">
                    {pairedFields.map((pair, rowIdx) => {
                        const [left, right] = pair;
                        const isLonePair = right === null;

                        return (
                            <div
                                key={rowIdx}
                                className={cn(
                                    "grid",
                                    isLonePair ? "grid-cols-1" : "grid-cols-2 divide-x divide-border/30"
                                )}
                            >
                                <FieldCell field={left} row={row} />
                                {!isLonePair && <FieldCell field={right} row={row} />}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Full-width fields (e.g. Reason, Remarks) ────────────────────── */}
            {fullWidthFields.length > 0 && (
                <div className="divide-y divide-border/30 border-t border-border/30">
                    {fullWidthFields.map((field, idx) => (
                        <div key={field.label + idx} className="px-4 py-3 space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                                {field.label}
                            </p>
                            <div className={cn("text-[10px] sm:text-sm text-foreground", field.className)}>
                                {field.accessor(row)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Actions ─────────────────────────────────────────────────────── */}
            {actions && (
                <div className="px-4 py-3 text-[10px] sm:text-xs border-t border-border/40 bg-muted/20 flex justify-end gap-2">
                    {actions(row)}
                </div>
            )}
        </div>
    );
}

/** Internal helper — one cell in the body grid */
function FieldCell({ field, row }) {
    return (
        <div className="px-4 py-3 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                {field.label}
            </p>
            <div className={cn("text-[10px] sm:text-sm text-foreground", field.className)}>
                {field.accessor(row)}
            </div>
        </div>
    );
}

/* ─── Pagination bar (mirrors DataTable's minimal controls) ──────────────── */

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function MobilePagination({ page, pageSize, total, setPage, setPageSize }) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const from = total === 0 ? 0 : page * pageSize + 1;
    const to = Math.min((page + 1) * pageSize, total);

    return (
        <div className="flex flex-col gap-3 pt-2">
            {/* Row count + page size selector */}
            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>
                    {total === 0
                        ? "No results"
                        : `${from}–${to} of ${total}`}
                </span>

                <div className="flex items-center gap-2">
                    <span className="text-xs">Per page</span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(v) => {
                            setPageSize(Number(v));
                            setPage(0);
                        }}
                    >
                        <SelectTrigger className="h-7 w-16 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGE_SIZE_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={String(opt)} className="text-xs">
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Prev / page indicator / Next */}
            <div className="flex items-center justify-between gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                </Button>

                <span className="text-xs text-muted-foreground">
                    Page {page + 1} of {totalPages}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1}
                >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}

/* ─── Card list with loading / empty states ───────────────────────────────── */

/**
 * @param {object}   props
 * @param {Array}    props.data
 * @param {Array}    props.fields           — passed to each MobileCard
 * @param {function} [props.actions]        — passed to each MobileCard
 * @param {object}   [props.highlight]      — passed to each MobileCard
 * @param {function} [props.keyExtractor]   — (row) => string|number, defaults to index
 * @param {boolean}  [props.isLoading]
 * @param {string}   [props.loadingText]
 * @param {string}   [props.emptyText]
 * @param {string}   [props.className]      — extra classes on the list wrapper
 *
 * Pagination (all required together when `pagination` is true):
 * @param {boolean}  [props.pagination]
 * @param {number}   [props.page]           — 0-based page index
 * @param {number}   [props.pageSize]
 * @param {number}   [props.total]          — total record count (server-side)
 * @param {function} [props.setPage]        — (idx: number) => void
 * @param {function} [props.setPageSize]    — (size: number) => void
 */
export function MobileCardList({
    data = [],
    fields = [],
    actions,
    highlight,
    keyExtractor,
    isLoading = false,
    loadingText = "Loading...",
    emptyText = "No results.",
    className,
    // pagination
    pagination = false,
    page = 0,
    pageSize = 10,
    total,
    setPage,
    setPageSize,
}) {
    const resolvedTotal = total ?? data.length;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin" />
                <p className="text-sm">{loadingText}</p>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                {emptyText}
            </div>
        );
    }

    return (
        <div className={cn("space-y-3", className)}>
            {data.map((row, index) => (
                <MobileCard
                    key={keyExtractor ? keyExtractor(row) : index}
                    row={row}
                    fields={fields}
                    actions={actions}
                    highlight={highlight}
                />
            ))}

            {pagination && setPage && setPageSize && (
                <MobilePagination
                    page={page}
                    pageSize={pageSize}
                    total={resolvedTotal}
                    setPage={setPage}
                    setPageSize={setPageSize}
                />
            )}
        </div>
    );
}