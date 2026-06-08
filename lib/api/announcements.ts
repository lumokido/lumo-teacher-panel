import { api } from "@/lib/api/httpClient";

export type AnnouncementType = "EVENT" | "ANNOUNCEMENT";

export type AnnouncementWriteBody = {
  title: string;
  description: string;
  type: AnnouncementType;
  startDate: string; // YYYY-MM-DD
};

export type AnnouncementRow = AnnouncementWriteBody & {
  id: number;
};

export async function listAnnouncements(type?: AnnouncementType): Promise<AnnouncementRow[]> {
  const url = type ? `/api/announcements/type/${type}` : "/api/announcements";
  const res = await api.get(url);
  return res.data;
}

export async function createAnnouncement(body: AnnouncementWriteBody): Promise<AnnouncementRow> {
  const res = await api.post("/api/announcements", body);
  return res.data;
}
