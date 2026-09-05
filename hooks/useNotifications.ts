import {
  getNotificationStats,
  listNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  sendNotification,
  cancelNotification,
  type NotificationWriteBody,
} from "@/lib/api/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export const notificationKeys = {
  all: ["notifications"] as const,
  stats: ["notifications", "stats"] as const,
  list: (status?: string) => ["notifications", "list", status] as const,
  detail: (id: number) => ["notifications", "detail", id] as const,
};

function messageFromAxios(err: unknown): string {
  if (!isAxiosError(err)) return "Request failed";
  const d = err.response?.data;
  if (d && typeof d === "object") {
    const o = d as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
    if (typeof o.error === "string") return o.error;
  }
  return err.message || "Request failed";
}

export function useNotificationStats() {
  return useQuery({
    queryKey: notificationKeys.stats,
    queryFn: () => getNotificationStats(),
    refetchInterval: 15000,
  });
}

export function useNotifications(status?: string) {
  return useQuery({
    queryKey: notificationKeys.list(status),
    queryFn: () => listNotifications(status),
  });
}

export function useNotification(id: number | null) {
  return useQuery({
    queryKey: notificationKeys.detail(id ?? 0),
    queryFn: () => getNotification(id!),
    enabled: id != null,
  });
}

export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NotificationWriteBody) => createNotification(body),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
      if (data.status === "SENT" || data.status === "PARTIALLY_SENT") {
        toast.success(`Notification sent successfully to ${data.successfulDeliveries || 0} devices!`);
      } else if (data.status === "SCHEDULED") {
        toast.success("Notification scheduled successfully!");
      } else {
        toast.success("Draft saved successfully!");
      }
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useUpdateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: NotificationWriteBody }) =>
      updateNotification(id, body),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
      void qc.invalidateQueries({ queryKey: notificationKeys.detail(vars.id) });
      toast.success("Notification updated successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Notification deleted successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useSendNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sendNotification(id),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success(`Notification sent to ${data.successfulDeliveries || 0} devices!`);
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}

export function useCancelNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelNotification(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Scheduled notification cancelled");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}
