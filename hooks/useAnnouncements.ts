import { createAnnouncement, listAnnouncements, type AnnouncementWriteBody, type AnnouncementType } from "@/lib/api/announcements";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export const announcementKeys = {
  all: ["announcements"] as const,
  byType: (type?: AnnouncementType) => ["announcements", "type", type] as const,
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

export function useAnnouncements(type?: AnnouncementType) {
  return useQuery({
    queryKey: announcementKeys.byType(type),
    queryFn: () => listAnnouncements(type),
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AnnouncementWriteBody) => createAnnouncement(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: announcementKeys.all });
      toast.success("Event/Announcement created successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}
