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
import { type EmailLog, api } from "@/lib/api";

const COLSPAN = 6;

const KIND_LABEL: Record<EmailLog["kind"], string> = {
  alert: "Alert",
  thankyou: "Thank-you",
  reply: "Reply",
  other: "Other",
};

function statusVariant(s: EmailLog["status"]) {
  if (s === "sent") return "success" as const;
  if (s === "failed") return "danger" as const;
  return "warning" as const;
}

export default function EmailsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<EmailLog[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.pageEmails(page, pageSize);
      setRows(data.items);
      setTotal(data.total);
      setPageCount(data.page_count);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load emails");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    let active = true;
    const run = () => active && void load();
    run();
    const id = setInterval(run, 10000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [load]);

  const view = (id: number) => router.push(`/dashboard/emails/${id}`);

  return (
    <div className="w-full">
      <div className="mb-5">
        <h2 className="font-display text-2xl font-bold text-foreground">Sent emails</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Every email the system sent — alerts, thank-yous and follow-up replies.
        </p>
      </div>

      <DataTableRoot>
        <DataTableToolbar>
          <DataTableTitle title="Email log" subtitle={`${total.toLocaleString()} total`} />
        </DataTableToolbar>

        <DataTable>
          <DataTableHead>
            <tr>
              <DataTableHeaderCell>To</DataTableHeaderCell>
              <DataTableHeaderCell>Subject</DataTableHeaderCell>
              <DataTableHeaderCell>Kind</DataTableHeaderCell>
              <DataTableHeaderCell>Status</DataTableHeaderCell>
              <DataTableHeaderCell>Sent</DataTableHeaderCell>
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
              <DataTableEmptyRow colSpan={COLSPAN}>No emails sent yet.</DataTableEmptyRow>
            ) : (
              rows.map((e) => (
                <DataTableRow key={e.id} onClick={() => view(e.id)}>
                  <DataTableCell className="font-medium text-foreground">
                    {e.to_email}
                  </DataTableCell>
                  <DataTableCell className="max-w-xs truncate text-text-secondary">
                    {e.subject}
                  </DataTableCell>
                  <DataTableCell>
                    <Badge variant="default">{KIND_LABEL[e.kind]}</Badge>
                  </DataTableCell>
                  <DataTableCell>
                    <Badge variant={statusVariant(e.status)} dot>
                      {e.status}
                    </Badge>
                  </DataTableCell>
                  <DataTableCell className="text-sm text-text-secondary">
                    {new Date(e.created_at).toLocaleString()}
                  </DataTableCell>
                  <DataTableCell align="right">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        view(e.id);
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
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          disabled={loading}
        />
      </DataTableRoot>
    </div>
  );
}
