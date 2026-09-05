import { api } from "@/lib/api/httpClient";

export type NotificationType =
  | "ANNOUNCEMENT"
  | "EXAM"
  | "EXAM_RESULT"
  | "ATTENDANCE"
  | "ASSIGNMENT"
  | "HOMEWORK"
  | "FEE"
  | "EVENT"
  | "CIRCULAR"
  | "EMERGENCY"
  | "GENERAL";

export type NotificationTargetType = "ALL" | "ROLE" | "CLASS" | "USER" | "TOPIC";

export type NotificationStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "SENDING"
  | "SENT"
  | "PARTIALLY_SENT"
  | "FAILED"
  | "CANCELLED";

export type NotificationWriteBody = {
  title: string;
  body: string;
  type?: NotificationType;
  screen?: string;
  data?: Record<string, string>;
  targetType: NotificationTargetType;
  targetId?: string;
  priority?: "normal" | "high";
  scheduledAt?: string;
  sendNow?: boolean;
};

export type NotificationRow = {
  id: number;
  title: string;
  body: string;
  type: NotificationType;
  screen?: string;
  data?: Record<string, string>;
  targetType: NotificationTargetType;
  targetId?: string;
  status: NotificationStatus;
  priority?: string;
  scheduledAt?: string;
  sentAt?: string;
  totalRecipients?: number;
  successfulDeliveries?: number;
  failedDeliveries?: number;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
};

export type NotificationStats = {
  total: number;
  sent: number;
  scheduled: number;
  failed: number;
  drafts: number;
};

export async function getNotificationStats(): Promise<NotificationStats> {
  const res = await api.get("/api/admin/notifications/stats");
  return res.data;
}

export async function listNotifications(
  status?: string,
  page: number = 0,
  size: number = 50
): Promise<{ content: NotificationRow[]; totalElements: number; totalPages: number }> {
  const params: Record<string, any> = { page, size };
  if (status && status !== "ALL") params.status = status;
  const res = await api.get("/api/admin/notifications", { params });
  return res.data;
}

export async function getNotification(id: number): Promise<NotificationRow> {
  const res = await api.get(`/api/admin/notifications/${id}`);
  return res.data;
}

export async function createNotification(body: NotificationWriteBody): Promise<NotificationRow> {
  const res = await api.post("/api/admin/notifications", body);
  return res.data;
}

export async function updateNotification(
  id: number,
  body: NotificationWriteBody
): Promise<NotificationRow> {
  const res = await api.put(`/api/admin/notifications/${id}`, body);
  return res.data;
}

export async function deleteNotification(id: number): Promise<void> {
  await api.delete(`/api/admin/notifications/${id}`);
}

export async function sendNotification(id: number): Promise<NotificationRow> {
  const res = await api.post(`/api/admin/notifications/${id}/send`);
  return res.data;
}

export async function cancelNotification(id: number): Promise<NotificationRow> {
  const res = await api.post(`/api/admin/notifications/${id}/cancel`);
  return res.data;
}
