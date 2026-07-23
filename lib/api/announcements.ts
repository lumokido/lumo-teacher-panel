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

export async function getAnnouncement(id: number): Promise<AnnouncementRow> {
  const res = await api.get(`/api/announcements/${id}`);
  return res.data;
}

export async function updateAnnouncement(
  id: number,
  body: AnnouncementWriteBody,
): Promise<AnnouncementRow> {
  const res = await api.put(`/api/announcements/${id}`, body);
  return res.data;
}

export async function deleteAnnouncement(id: number): Promise<void> {
  await api.delete(`/api/announcements/${id}`);
}
