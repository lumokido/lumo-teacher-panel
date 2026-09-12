import { 
  getChatHistory, 
  sendChatMessage, 
  getConversations, 
  getChatContacts, 
  getPrincipals, 
  broadcastChatMessage,
  getAdminAllConversations,
  getAdminThreadHistory,
  type BroadcastPayload 
} from "@/lib/api/chat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export const chatKeys = {
  all: ["chat"] as const,
  history: (id: string) => [...chatKeys.all, "history", id] as const,
  conversations: () => [...chatKeys.all, "conversations"] as const,
  contacts: () => [...chatKeys.all, "contacts"] as const,
  principals: () => [...chatKeys.all, "principals"] as const,
  adminAllConversations: () => [...chatKeys.all, "admin-all-conversations"] as const,
  adminThread: (u1: string, u2: string) => [...chatKeys.all, "admin-thread", u1, u2] as const,
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

export function useChatHistory(participantId: string | null) {
  return useQuery({
    queryKey: chatKeys.history(participantId!),
    queryFn: () => getChatHistory(participantId!),
    enabled: !!participantId,
    refetchInterval: 4000, // Poll every 4 seconds for new messages
  });
}

export function useConversations() {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: () => getConversations(),
    refetchInterval: 6000, // Poll every 6 seconds for new conversations
  });
}

export function useChatContacts() {
  return useQuery({
    queryKey: chatKeys.contacts(),
    queryFn: () => getChatContacts(),
    staleTime: 60000,
  });
}

export function usePrincipals() {
  return useQuery({
    queryKey: chatKeys.principals(),
    queryFn: () => getPrincipals(),
    staleTime: 120000,
  });
}

export function useAdminAllConversations() {
  return useQuery({
    queryKey: chatKeys.adminAllConversations(),
    queryFn: () => getAdminAllConversations(),
    refetchInterval: 5000, // Auto-refresh every 5 seconds for live supervisory monitoring
  });
}

export function useAdminThreadHistory(user1: string | null, user2: string | null) {
  return useQuery({
    queryKey: chatKeys.adminThread(user1 || "", user2 || ""),
    queryFn: () => getAdminThreadHistory(user1!, user2!),
    enabled: !!user1 && !!user2,
    refetchInterval: 4000, // Live poll the open thread
  });
}

export function useSendChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ receiverId, content }: { receiverId: string; content: string }) =>
      sendChatMessage(receiverId, content),
    onSuccess: (_, variables) => {
      void qc.invalidateQueries({ queryKey: chatKeys.history(variables.receiverId) });
      void qc.invalidateQueries({ queryKey: chatKeys.conversations() });
      void qc.invalidateQueries({ queryKey: chatKeys.adminAllConversations() });
    },
    onError: (e) => {
      toast.error(messageFromAxios(e));
    },
  });
}

export function useBroadcastMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BroadcastPayload) => broadcastChatMessage(payload),
    onSuccess: () => {
      toast.success("Broadcast message sent successfully!");
      void qc.invalidateQueries({ queryKey: chatKeys.conversations() });
      void qc.invalidateQueries({ queryKey: chatKeys.adminAllConversations() });
    },
    onError: (e) => {
      toast.error(messageFromAxios(e));
    },
  });
}


