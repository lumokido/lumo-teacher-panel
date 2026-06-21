import { 
  saveTimetableEntry, 
  getTimetableByClass, 
  getTimetableByClassAndSection, 
  type SaveTimetablePayload 
} from "@/lib/api/timetable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export const timetableKeys = {
  all: ["timetable"] as const,
  byClass: (classId: number) => ["timetable", "class", classId] as const,
  byClassAndSection: (classId: number, sectionId: number) => ["timetable", "class", classId, "section", sectionId] as const,
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

export function useTimetableByClass(classId?: number) {
  return useQuery({
    queryKey: timetableKeys.byClass(classId || 0),
    queryFn: () => getTimetableByClass(classId!),
    enabled: !!classId,
  });
}

export function useTimetableByClassAndSection(classId?: number, sectionId?: number | null | "") {
  return useQuery({
    queryKey: timetableKeys.byClassAndSection(classId || 0, (sectionId as number) || 0),
    queryFn: () => {
      if (!sectionId) return getTimetableByClass(classId!);
      return getTimetableByClassAndSection(classId!, sectionId as number);
    },
    enabled: !!classId, // sectionId is optional now
  });
}

export function useSaveTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveTimetablePayload) => saveTimetableEntry(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: timetableKeys.all });
      toast.success("Timetable entry saved successfully");
    },
    onError: (e) => toast.error(messageFromAxios(e)),
  });
}
