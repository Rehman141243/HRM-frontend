"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/common/data-table-pagination";

export function DataTable({
  data,
  columns,
  page,
  pageSize,
  total,
  style,
  setPage,
  setPageSize,
  pagination = true,
  columnsBtn = true,
  isLoading = false,
  loadingText,
  columnNameTranslations,
}) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});

  const safeData = React.useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const safeTotal = React.useMemo(() => {
    return typeof total === "number" && total >= 0 ? total : 0;
  }, [total]);

  const safePageSize = React.useMemo(() => {
    return typeof pageSize === "number" && pageSize > 0 ? pageSize : 10;
  }, [pageSize]);

  const safePage = React.useMemo(() => {
    return typeof page === "number" && page >= 0 ? page : 0;
  }, [page]);

  const safeColumns = React.useMemo(() => {
    return Array.isArray(columns) ? columns : [];
  }, [columns]);

  const table = useReactTable({
    data: safeData,
    columns: safeColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: Math.ceil(safeTotal / safePageSize) || 1,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: safePage,
        pageSize: safePageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater({ pageIndex: safePage, pageSize: safePageSize });
        if (next.pageIndex !== safePage && setPage) setPage(next.pageIndex);
        if (next.pageSize !== safePageSize && setPageSize)
          setPageSize(next.pageSize);
      } else {
        if (
          updater.pageIndex !== undefined &&
          updater.pageIndex !== safePage &&
          setPage
        )
          setPage(updater.pageIndex);
        if (
          updater.pageSize !== undefined &&
          updater.pageSize !== safePageSize &&
          setPageSize
        )
          setPageSize(updater.pageSize);
      }
    },
  });

  return (
    <div className="w-full" style={style}>
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex-1" />
        {columnsBtn && safeColumns.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto h-8 gap-2 border-border/50 bg-white dark:bg-zinc-900 hover:bg-muted transition-all shadow-xs"
              >
                <span className="text-xs font-semibold">Columns</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const columnName =
                    columnNameTranslations?.[column.id] ||
                    column.columnDef.meta?.label ||
                    column.id.replace(/_/g, " ");
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnName}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className={`mb-4 ${isLoading ? "" : "rounded-md border"}`}>
        {isLoading ? (
          <div className="min-h-[44vh] flex flex-col items-center justify-start space-y-3 pt-14">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            <p className="text-sm text-gray-500">
              {loadingText || "Loading data…"}
            </p>
          </div>
        ) : (
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={safeColumns.length || 1}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {pagination && !isLoading && (
        <DataTablePagination
          table={table}
          page={safePage}
          pageSize={safePageSize}
          setPage={setPage}
          setPageSize={setPageSize}
          total={safeTotal}
        />
      )}
    </div>
  );
}
