"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api, ApiError } from "@/lib/api";

export default function SmsPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [gateway, setGateway] = useState<Awaited<ReturnType<typeof api.smsGatewayStatus>> | null>(null);
  useEffect(() => {
    let active = true;
    api.smsGatewayStatus().then((status) => { if (active) setGateway(status); }).catch(() => {});
    return () => { active = false; };
  }, []);
  const busy = useRef(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const normalized = phone.replace(/[\s()-]/g, "");
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
      setResult({ ok: false, text: "Enter an international phone number, for example +254712345678." });
      return;
    }
    busy.current = true;
    setSending(true);
    setResult(null);
    try {
      const response = await api.inviteSms(normalized, name.trim() || undefined);
      const delivery = response.result;
      const recipients = delivery.provider?.SMSMessageData?.Recipients;
      if (delivery.status === "mock") {
        setResult({ ok: true, text: `Test invitation recorded for ${normalized}. SMS is in mock mode; no message was sent to the phone.` });
      } else if (response.ok && delivery.status === "queued") {
        setResult({ ok: true, text: `Invitation queued for the Android gateway. Keep the phone online; check its outgoing SMS queue to confirm sending. Customers reply to the SIM number with three ratings.` });
      } else if (response.ok && ["sent", "accepted"].includes(delivery.status) && recipients?.length && recipients.every((r) => [100, 101, 102].includes(r.statusCode))) {
        setResult({ ok: true, text: `Invitation accepted by the SMS provider for ${normalized}. This does not confirm delivery to the phone.` });
      } else {
        setResult({ ok: false, text: delivery.error || recipients?.find((r) => r.statusCode !== 101)?.status || "The provider did not confirm acceptance. Check the recipient and SMS configuration before trying again." });
      }
    } catch (error) {
      setResult({ ok: false, text: error instanceof ApiError && [401, 403].includes(error.status) ? "Your session has expired. Sign in again to send an invitation." : "Unable to confirm sending. Check your connection and provider records before retrying to avoid a duplicate message." });
    } finally {
      busy.current = false;
      setSending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <p className="mb-6 text-sm text-text-secondary">Invite a customer to rate your services by SMS. Their reply appears alongside web feedback.</p>
      {gateway && (
        <div className="mb-6 rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary">
          <p className="font-medium text-foreground">Sending through {gateway.provider === "smsgate" ? "Android SIM gateway" : "Africa’s Talking"}</p>
          <p className="mt-1">{gateway.provider === "smsgate"
            ? gateway.credentials_configured && gateway.webhook_configured
              ? "Gateway credentials and reply verification are configured. Keep the Android phone connected to the internet with its SMS service running."
              : "Android gateway setup is incomplete. Configure its credentials and webhook signing key before sending."
            : "To receive replies without a shortcode, connect a dedicated Android SIM gateway."}</p>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Send a survey invitation</CardTitle></CardHeader>
          <CardBody>
            <form onSubmit={send} className="space-y-5" aria-busy={sending}>
              <Input label="Customer name (optional)" value={name} onChange={(e) => setName(e.target.value)} maxLength={160} autoComplete="name" disabled={sending} placeholder="Jane Doe" />
              <Input label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={32} autoComplete="tel" disabled={sending} placeholder="+254712345678" hint="Include the country code, for example +254 for Kenya." />
              <p className="text-xs text-muted">Send to customers who have agreed to receive SMS surveys. Provider messaging charges may apply.</p>
              <Button type="submit" icon={Send} loading={sending} disabled={!phone.trim()} fullWidth>Send invitation</Button>
            </form>
            <div aria-live="polite" aria-atomic="true">
              {result && <p className={`mt-5 rounded-md p-3 text-sm ${result.ok ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}>{result.text}</p>}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>How customers reply</CardTitle></CardHeader>
          <CardBody className="space-y-5 text-sm text-text-secondary">
            <p>The invitation asks customers to rate these three areas from 1 (poor) to 5 (excellent), in order:</p>
            <ol className="list-decimal space-y-2 pl-5"><li>Product experience</li><li>Customer care</li><li>Happiness with the product</li></ol>
            <div className="rounded-lg border border-border bg-bg p-4">
              <p className="mb-2 text-xs font-medium text-muted">Example customer reply</p>
              <p className="font-display text-2xl font-semibold tracking-widest text-foreground">4 5 4</p>
              <p className="mt-2 text-xs">Product: 4 · Care: 5 · Happiness: 4</p>
            </div>
            <p>Replies use the same scoring as the web survey. Low ratings create detractor alerts for follow-up.</p>
            <Link href="/dashboard/responses" className="inline-block font-medium text-primary hover:underline">View customer responses →</Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
