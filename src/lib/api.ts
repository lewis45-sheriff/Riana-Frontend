/**
 * Thin typed API client for the Django backend.
 * An empty NEXT_PUBLIC_API_URL uses the current origin for portable releases.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface FeedbackResponse {
  id: number;
  source: string;
  q1: number;
  q2: number;
  q3: number;
  comment: string | null;
  mean: number;
  classification: "detractor" | "passive" | "promoter";
  created_at: string;
  customer: Customer;
}

export interface FeedbackResult {
  response: FeedbackResponse;
  mean: number;
  classification: string;
  alert_created: boolean;
  message: string;
}

export interface Split {
  detractor: number;
  passive: number;
  promoter: number;
}

export interface TrendPoint {
  date: string;
  mean: number | null;
  count: number;
  projected: boolean;
}

export interface DashboardSummary {
  total_respondents: number;
  average_mean: number | null;
  split: Split;
  trend: TrendPoint[];
  open_alerts: number;
}

export interface Alert {
  id: number;
  status: "new" | "acknowledged";
  channels: string;
  ai_draft: string | null;
  created_at: string;
  customer: Customer;
  response: FeedbackResponse;
}

export interface AskResult {
  answer: string;
  chart: { type: string; data: Split } | null;
  degraded: boolean;
}

export interface PaginatedResponses {
  items: FeedbackResponse[];
  total: number;
  page: number;
  page_size: number;
  page_count: number;
}

export interface EmailLog {
  id: number;
  to_email: string;
  subject: string;
  body: string;
  kind: "alert" | "thankyou" | "reply" | "other";
  status: "sent" | "logged" | "failed";
  created_at: string;
}

export interface PaginatedEmails {
  items: EmailLog[];
  total: number;
  page: number;
  page_size: number;
  page_count: number;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
    credentials: "include", // send/receive the httpOnly auth cookie
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface SubmitFeedbackInput {
  name: string;
  email?: string;
  phone?: string;
  q1: number;
  q2: number;
  q3: number;
  comment?: string;
}

export const api = {
  smsGatewayStatus: () => request<{
    provider: string;
    credentials_configured: boolean;
    webhook_configured: boolean;
    device_configured: boolean;
  }>("/sms/gateway/status"),
  inviteSms: (phone: string, name?: string) =>
    request<{ ok: boolean; result: { status: string; error?: string; provider?: { SMSMessageData?: { Recipients?: { statusCode: number; status: string }[] } } } }>("/sms/invite", {
      method: "POST",
      body: JSON.stringify({ phone, ...(name ? { name } : {}) }),
    }),

  submitFeedback: (input: SubmitFeedbackInput) =>
    request<FeedbackResult>("/feedback", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  dashboard: (days = 14) =>
    request<DashboardSummary>(`/dashboard/summary?days=${days}`),

  listResponses: (limit = 50, offset = 0) =>
    request<FeedbackResponse[]>(`/feedback?limit=${limit}&offset=${offset}`),

  pageResponses: (page = 1, pageSize = 10, classification?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    if (classification && classification !== "all") {
      params.set("classification", classification);
    }
    return request<PaginatedResponses>(`/feedback/page?${params.toString()}`);
  },

  getResponse: (id: number) => request<FeedbackResponse>(`/feedback/${id}`),

  draftResponseEmail: (id: number) =>
    request<{ draft: string; degraded: boolean }>(`/feedback/${id}/draft`, {
      method: "POST",
    }),

  sendResponseEmail: (id: number, message?: string) =>
    request<{ status: string; to?: string; reason?: string }>(
      `/feedback/${id}/send-email`,
      { method: "POST", body: JSON.stringify({ message }) },
    ),

  pageEmails: (page = 1, pageSize = 10) =>
    request<PaginatedEmails>(`/emails?page=${page}&page_size=${pageSize}`),

  getEmail: (id: number) => request<EmailLog>(`/emails/${id}`),

  listAlerts: (status?: string) =>
    request<Alert[]>(`/alerts${status ? `?status=${status}` : ""}`),

  getAlert: (id: number) => request<Alert>(`/alerts/${id}`),

  ackAlert: (id: number, status = "acknowledged") =>
    request<Alert>(`/alerts/${id}/ack`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),

  regenerateDraft: (id: number) =>
    request<{ draft: string; degraded: boolean }>(`/alerts/${id}/draft`, {
      method: "POST",
    }),

  sendAlertEmail: (id: number, message?: string) =>
    request<{ status: string; to?: string; reason?: string }>(
      `/alerts/${id}/send-email`,
      { method: "POST", body: JSON.stringify({ message }) },
    ),

  sendAlertSms: (id: number, message?: string) =>
    request<{
      status: string;
      to?: string;
      reason?: string;
      provider?: { status?: string; error?: string };
    }>(
      `/alerts/${id}/send-sms`,
      { method: "POST", body: JSON.stringify({ message }) },
    ),

  ask: (question: string) =>
    request<AskResult>("/ai/ask", {
      method: "POST",
      body: JSON.stringify({ question }),
    }),

  // --- auth ---
  login: (identifier: string, password: string) =>
    request<{ user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),

  logout: () => request<void>("/auth/logout", { method: "POST" }),

  me: () => request<{ user: AuthUser }>("/auth/me"),
};

export { BASE_URL };
