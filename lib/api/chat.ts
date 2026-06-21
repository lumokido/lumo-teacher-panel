import { api } from "@/lib/api/httpClient";

export type ChatMessage = {
  id: number;
  senderId: string;
  senderRole: string;
  receiverId: string;
  receiverRole: string;
  content: string;
  timestamp: string;
};

export async function getChatHistory(studentId: string): Promise<ChatMessage[]> {
  const res = await api.get(`/api/chat/history/${encodeURIComponent(studentId)}`);
  return res.data;
}

export async function sendChatMessage(receiverId: string, content: string): Promise<ChatMessage> {
  const res = await api.post("/api/chat/send", { receiverId, content });
  return res.data;
}
