import { getChatHistory, sendChatMessage } from "@/lib/api/chat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export const chatKeys = {
  all: ["chat"] as const,
  history: (studentId: string) => [...chatKeys.all, "history", studentId] as const,
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

export function useChatHistory(studentId: string | null) {
  return useQuery({
    queryKey: chatKeys.history(studentId!),
    queryFn: () => getChatHistory(studentId!),
    enabled: !!studentId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
}

export function useSendChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ receiverId, content }: { receiverId: string; content: string }) =>
      sendChatMessage(receiverId, content),
    onSuccess: (_, variables) => {
      // Invalidate the specific chat history so it immediately refetches
      void qc.invalidateQueries({ queryKey: chatKeys.history(variables.receiverId) });
    },
    onError: (e) => {
      toast.error(messageFromAxios(e));
    },
  });
}
