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

export type ConversationItem = {
  participantId: string;
  participantName: string;
  participantRole?: "ADMIN" | "TEACHER" | "STUDENT" | string;
  participantSubtext?: string;
  lastMessage: string;
  lastActive: string;
  lastSenderRole?: string;
};

export type ChatContact = {
  id: string;
  name: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | string;
  subtext?: string;
  mobileNumber?: string;
  email?: string;
};

export type BroadcastPayload = {
  targetRole: "TEACHER" | "STUDENT";
  recipientIds?: string[];
  content: string;
};

export async function getChatHistory(participantId: string): Promise<ChatMessage[]> {
  const res = await api.get(`/api/chat/history/${encodeURIComponent(participantId)}`);
  return res.data;
}

export async function sendChatMessage(receiverId: string, content: string): Promise<ChatMessage> {
  const res = await api.post("/api/chat/send", { receiverId, content });
  return res.data;
}

export async function getConversations(): Promise<ConversationItem[]> {
  const res = await api.get("/api/chat/conversations");
  return res.data;
}

export async function getChatContacts(): Promise<ChatContact[]> {
  const res = await api.get("/api/chat/contacts");
  return res.data;
}

export async function getPrincipals(): Promise<ChatContact[]> {
  const res = await api.get("/api/chat/admin/principals");
  return res.data;
}

export async function broadcastChatMessage(payload: BroadcastPayload): Promise<ChatMessage[]> {
  const res = await api.post("/api/chat/broadcast", payload);
  return res.data;
}

export type AdminConversation = {
  threadId: string;
  teacherId: string;
  teacherName: string;
  teacherSubject: string;
  teacherPhone: string;
  studentId: string;
  studentName: string;
  parentName: string;
  className: string;
  sectionName: string;
  parentPhone: string;
  lastMessage: string;
  lastActive: string;
  lastSenderRole: string;
};

export async function getAdminAllConversations(): Promise<AdminConversation[]> {
  const res = await api.get("/api/chat/admin/all-conversations");
  return res.data;
}

export async function getAdminThreadHistory(user1: string, user2: string): Promise<ChatMessage[]> {
  const res = await api.get("/api/chat/admin/thread-history", {
    params: { user1, user2 },
  });
  return res.data;
}


