"use client";

import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
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
import type { Alert } from "@/lib/api";

const COLSPAN = 5;

interface AlertsTableProps {
  alerts: Alert[];
  loading?: boolean;
}

export function AlertsTable({ alerts, loading }: Readonly<AlertsTableProps>) {
  const router = useRouter();
  const view = (id: number) => router.push(`/dashboard/alerts/${id}`);

  return (
    <DataTableRoot>
      <DataTableToolbar>
        <DataTableTitle title="Detractor alerts" subtitle={`${alerts.length} total`} />
      </DataTableToolbar>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableHeaderCell>Customer</DataTableHeaderCell>
            <DataTableHeaderCell align="right">Mean</DataTableHeaderCell>
            <DataTableHeaderCell>Raised</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell align="right">
              <span className="sr-only">Actions</span>
            </DataTableHeaderCell>
          </tr>
        </DataTableHead>
        <DataTableBody>
          {loading && alerts.length === 0 ? (
            <DataTableSkeleton rows={5} columns={COLSPAN} />
          ) : alerts.length === 0 ? (
            <DataTableEmptyRow colSpan={COLSPAN}>
              No alerts here. Everyone&apos;s happy right now.
            </DataTableEmptyRow>
          ) : (
            alerts.map((a) => (
              <DataTableRow key={a.id} onClick={() => view(a.id)}>
                <DataTableCell>
                  <span className="block font-medium text-foreground">{a.customer.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {a.customer.email || a.customer.phone || "no contact"}
                  </span>
                </DataTableCell>
                <DataTableCell align="right" numeric>
                  <span className="font-display font-semibold text-foreground">
                    {a.response.mean}
                  </span>
                </DataTableCell>
                <DataTableCell className="text-sm text-text-secondary">
                  {new Date(a.created_at).toLocaleDateString()}
                </DataTableCell>
                <DataTableCell>
                  {a.status === "new" ? (
                    <Badge variant="danger" dot>
                      Open
                    </Badge>
                  ) : (
                    <Badge variant="success" dot>
                      Acknowledged
                    </Badge>
                  )}
                </DataTableCell>
                <DataTableCell align="right">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      view(a.id);
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
    </DataTableRoot>
  );
}
