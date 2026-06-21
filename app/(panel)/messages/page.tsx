"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useClassesList, useSectionsByClassId, useStudentsByClassId, useStudentsByClassAndSectionId } from "@/hooks/useAdminClasses";
import { useChatHistory, useSendChatMessage } from "@/hooks/useChat";
import { getAdmissionId, studentDisplayName, type StudentRow } from "@/lib/api/students";
import { Loader2, Send, MessageSquare, User, Search, RefreshCw, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);

  const { data: sections = [] } = useSectionsByClassId(
    selectedClassId ? (selectedClassId as number) : undefined
  );

  // Fetch students based on whether section is selected or just class
  const { data: classStudents = [], isLoading: classStudentsLoading } = useStudentsByClassId(
    selectedClassId && !selectedSectionId ? (selectedClassId as number) : undefined
  );
  const { data: sectionStudents = [], isLoading: sectionStudentsLoading } = useStudentsByClassAndSectionId(
    selectedClassId && selectedSectionId ? (selectedClassId as number) : undefined,
    selectedSectionId ? (selectedSectionId as number) : undefined
  );

  const studentsLoading = classStudentsLoading || sectionStudentsLoading;
  const rawStudents = selectedSectionId ? sectionStudents : classStudents;

  // Search filter
  const students = useMemo(() => {
    if (!searchQuery.trim()) return rawStudents;
    const lowerQ = searchQuery.toLowerCase();
    return rawStudents.filter(s => {
      const name = studentDisplayName(s).toLowerCase();
      const parent = (s.parentName || "").toLowerCase();
      const admissionId = (s.admissionId || "").toLowerCase();
      return name.includes(lowerQ) || parent.includes(lowerQ) || admissionId.includes(lowerQ);
    });
  }, [rawStudents, searchQuery]);

  // Chat Data
  const admissionId = selectedStudent ? getAdmissionId(selectedStudent) : null;
  const { data: chatHistory = [], isLoading: chatLoading } = useChatHistory(admissionId);
  const sendMut = useSendChatMessage();

  const [messageText, setMessageText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when chat history updates
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim() || !admissionId) return;
    
    try {
      await sendMut.mutateAsync({
        receiverId: admissionId,
        content: messageText.trim()
      });
      setMessageText("");
    } catch {
      // Handled by toast in hook
    }
  }

  const isLoading = classesLoading;

  return (
    <div className="flex h-[calc(100vh-80px)] max-h-[850px] gap-6 overflow-hidden">
      {/* LEFT PANE: Contacts List */}
      <div className="flex w-80 flex-col rounded-2xl border border-sky-100 bg-white shadow-sm overflow-hidden shrink-0">
        <div className="p-4 border-b border-sky-100 bg-sky-50/50">
          <h2 className="font-montserrat text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-sky-500" />
            Messages
          </h2>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Select
                disabled={isLoading || classes.length === 0}
                value={selectedClassId ? String(selectedClassId) : ""}
                onValueChange={(val) => {
                  setSelectedClassId(val ? parseInt(val, 10) : "");
                  setSelectedSectionId(null as unknown as number);
                  setSelectedStudent(null);
                }}
              >
                <SelectTrigger className="flex-1 rounded-xl border-sky-200 bg-white h-9 text-xs">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                disabled={!selectedClassId || sections.length === 0}
                value={selectedSectionId ? String(selectedSectionId) : "ALL"}
                onValueChange={(val) => {
                  setSelectedSectionId(val !== "ALL" ? parseInt(val as string, 10) : null as unknown as number);
                  setSelectedStudent(null as StudentRow | null);
                }}
              >
                <SelectTrigger className="flex-1 rounded-xl border-sky-200 bg-white h-9 text-xs">
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Sections</SelectItem>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      Sec {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, parent, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-sky-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-2">
          {!selectedClassId ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-4 text-slate-500">
              <User className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm font-medium">Select a class to view students</p>
            </div>
          ) : studentsLoading ? (
            <div className="flex h-full items-center justify-center text-sky-500">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-4 text-slate-500">
              <XCircle className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm font-medium">No students found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {students.map((student) => {
                const sAdmissionId = getAdmissionId(student);
                const isSelected = selectedStudent && getAdmissionId(selectedStudent) === sAdmissionId;
                return (
                  <button
                    key={sAdmissionId ?? student.studentId}
                    onClick={() => setSelectedStudent(student)}
                    className={cn(
                      "w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group",
                      isSelected ? "bg-sky-500 shadow-md" : "hover:bg-sky-50 bg-transparent"
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm transition-colors",
                      isSelected ? "bg-white/20 text-white" : "bg-sky-100 text-sky-700 group-hover:bg-sky-200"
                    )}>
                      {student.firstName?.[0] || "S"}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className={cn(
                        "text-sm font-semibold truncate",
                        isSelected ? "text-white" : "text-slate-900"
                      )}>
                        {studentDisplayName(student)}
                      </p>
                      <p className={cn(
                        "text-xs truncate",
                        isSelected ? "text-sky-100" : "text-slate-500"
                      )}>
                        Parent: {student.parentName || "Unknown"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: Chat Window */}
      <div className="flex flex-1 flex-col rounded-2xl border border-sky-100 bg-slate-50 shadow-sm overflow-hidden relative">
        {selectedStudent ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-4 border-b border-sky-100 bg-white px-6 py-4 shadow-sm z-10 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-lg font-bold">
                {selectedStudent.firstName?.[0] || "P"}
              </div>
              <div>
                <h3 className="font-montserrat text-lg font-bold text-slate-900">
                  {selectedStudent.parentName || "Parent of " + studentDisplayName(selectedStudent)}
                </h3>
                <p className="text-xs font-medium text-sky-600">
                  Student: {studentDisplayName(selectedStudent)} &bull; ID: {getAdmissionId(selectedStudent)}
                </p>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatLoading ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-slate-400 space-y-3">
                  <MessageSquare className="h-12 w-12 opacity-20" />
                  <p className="text-sm font-medium">No messages yet. Send a message to start the conversation.</p>
                </div>
              ) : (
                chatHistory.map((msg, index) => {
                  const isTeacher = msg.senderRole === "TEACHER";
                  
                  // Simple logic to show date grouping if needed (skipping for now)
                  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={msg.id || index}
                      className={cn(
                        "flex w-full",
                        isTeacher ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "relative max-w-[70%] rounded-2xl px-5 py-3 shadow-sm",
                          isTeacher
                            ? "bg-sky-500 text-white rounded-br-none"
                            : "bg-white border border-slate-100 text-slate-800 rounded-bl-none"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                        <span className={cn(
                          "block text-[10px] mt-1.5 font-medium text-right",
                          isTeacher ? "text-sky-100" : "text-slate-400"
                        )}>
                          {time}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-sky-100 bg-white p-4">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
                <textarea
                  placeholder="Type a message to the parent..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendMessage(e);
                    }
                  }}
                  className="max-h-32 min-h-[50px] w-full resize-none rounded-xl border border-sky-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-400 transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sendMut.isPending}
                  className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm transition-all hover:bg-sky-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {sendMut.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5 ml-1" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
            <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <MessageSquare className="h-10 w-10 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-700">Your Messages</h2>
            <p className="mt-2 text-sm max-w-sm">Select a student from the list to view their chat history or start a new conversation with their parent.</p>
          </div>
        )}
      </div>
    </div>
  );
}
