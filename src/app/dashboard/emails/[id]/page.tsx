"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/button-styles";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ApiError, type EmailLog, api } from "@/lib/api";

const KIND_LABEL: Record<EmailLog["kind"], string> = {
  alert: "Alert notification",
  thankyou: "Thank-you",
  reply: "Follow-up reply",
  other: "Other",
};

export default function EmailDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [email, setEmail] = useState<EmailLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEmail(await api.getEmail(id));
      setError(null);
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 404
          ? "This email was not found."
          : e instanceof Error
            ? e.message
            : "Failed to load email",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    const run = () => active && void load();
    run();
    return () => {
      active = false;
    };
  }, [load]);

  return (
    <div className="w-full">
      <div className="mb-5">
        <Link href="/dashboard/emails" className={buttonStyles({ variant: "ghost", size: "sm" })}>
          <ArrowLeft size={15} />
          Back to emails
        </Link>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-(--r-card) border border-border bg-surface" />
      ) : error ? (
        <div className="rounded-md bg-danger-bg px-4 py-3 text-sm text-danger">{error}</div>
      ) : email ? (
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>{email.subject}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="default">{KIND_LABEL[email.kind]}</Badge>
              <Badge
                variant={
                  email.status === "sent"
                    ? "success"
                    : email.status === "failed"
                      ? "danger"
                      : "warning"
                }
                dot
              >
                {email.status}
              </Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="mb-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted">To:</span>{" "}
                <span className="font-medium text-foreground">{email.to_email}</span>
              </div>
              <div>
                <span className="text-muted">Sent:</span>{" "}
                <span className="text-foreground">
                  {new Date(email.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="whitespace-pre-wrap rounded-md border border-border bg-bg p-4 text-sm leading-relaxed text-foreground">
              {email.body}
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
