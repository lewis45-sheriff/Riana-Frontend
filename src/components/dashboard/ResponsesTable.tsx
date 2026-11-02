"use client";

import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmptyRow,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRoot,
  DataTableRow,
  DataTableSkeleton,
  DataTableTitle,
  DataTableToolbar,
} from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { type FeedbackResponse, api } from "@/lib/api";

const COLSPAN = 6;

export function ResponsesTable({ filter = "all" }: Readonly<{ filter?: string }>) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<FeedbackResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset to the first page when the filter changes — done during render via a
  // tracked previous value (React's recommended alternative to an effect).
  const [prevFilter, setPrevFilter] = useState(filter);
  if (prevFilter !== filter) {
    setPrevFilter(filter);
    setPage(1);
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.pageResponses(page, pageSize, filter);
      setRows(data.items);
      setTotal(data.total);
      setPageCount(data.page_count);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load responses");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filter]);

  useEffect(() => {
    let active = true;
    const run = () => active && void load();
    run();
    return () => {
      active = false;
    };
  }, [load]);

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const view = (id: number) => router.push(`/dashboard/responses/${id}`);

  return (
    <DataTableRoot>
      <DataTableToolbar>
        <DataTableTitle
          title="All responses"
          subtitle={`${total.toLocaleString()} total`}
        />
      </DataTableToolbar>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>Customer</DataTableHeaderCell>
            <DataTableHeaderCell>Date</DataTableHeaderCell>
            <DataTableHeaderCell>Source</DataTableHeaderCell>
            <DataTableHeaderCell align="right">Mean</DataTableHeaderCell>
            <DataTableHeaderCell>Verdict</DataTableHeaderCell>
            <DataTableHeaderCell align="right">
              <span className="sr-only">Actions</span>
            </DataTableHeaderCell>
          </tr>
        </DataTableHead>
        <DataTableBody>
          {loading && rows.length === 0 ? (
            <DataTableSkeleton rows={pageSize} columns={COLSPAN} />
          ) : error ? (
            <DataTableEmptyRow colSpan={COLSPAN}>{error}</DataTableEmptyRow>
          ) : rows.length === 0 ? (
            <DataTableEmptyRow colSpan={COLSPAN}>No responses yet.</DataTableEmptyRow>
          ) : (
            rows.map((r) => (
              <DataTableRow key={r.id} onClick={() => view(r.id)}>
                <DataTableCell>
                  <span className="block font-medium text-foreground">{r.customer.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {r.customer.email || r.customer.phone || "no contact"}
                  </span>
                </DataTableCell>
                <DataTableCell className="text-sm text-text-secondary">
                  {new Date(r.created_at).toLocaleDateString()}
                </DataTableCell>
                <DataTableCell className="text-sm text-text-secondary">{r.source}</DataTableCell>
                <DataTableCell align="right" numeric>
                  <span className="font-display font-semibold text-foreground">{r.mean}</span>
                </DataTableCell>
                <DataTableCell>
                  <Badge variant={r.classification}>{r.classification}</Badge>
                </DataTableCell>
                <DataTableCell align="right">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      view(r.id);
                    }}
                  >
                    View
                  </Button>
                </DataTableCell>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>

      <Pagination
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        onPageSizeChange={changePageSize}
        disabled={loading}
      />
    </DataTableRoot>
  );
}
