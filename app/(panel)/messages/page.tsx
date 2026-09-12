"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useClassesList, useSectionsByClassId, useStudentsByClassId, useStudentsByClassAndSectionId } from "@/hooks/useAdminClasses";
import { useChatHistory, useSendChatMessage, usePrincipals } from "@/hooks/useChat";
import { getAdmissionId, studentDisplayName, type StudentRow } from "@/lib/api/students";
import type { ChatContact } from "@/lib/api/chat";
import { Loader2, Send, MessageSquare, User, Search, RefreshCw, XCircle, ShieldCheck, GraduationCap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type RecipientType = "PRINCIPAL" | "STUDENTS";

interface ActiveTarget {
  id: string;
  name: string;
  role: "ADMIN" | "STUDENT";
  subtext?: string;
}

export default function MessagesPage() {
  const [recipientType, setRecipientType] = useState<RecipientType>("PRINCIPAL");
  const { data: principals = [], isLoading: principalsLoading } = usePrincipals();

  const { data: classes = [], isLoading: classesLoading } = useClassesList();
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeTarget, setActiveTarget] = useState<ActiveTarget | null>(null);

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

  // Search filter for students
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

  // Search filter for principals
  const filteredPrincipals = useMemo(() => {
    if (!searchQuery.trim()) return principals;
    const lowerQ = searchQuery.toLowerCase();
    return principals.filter(p =>
      p.name.toLowerCase().includes(lowerQ) ||
      p.id.toLowerCase().includes(lowerQ) ||
      (p.subtext && p.subtext.toLowerCase().includes(lowerQ))
    );
  }, [principals, searchQuery]);

  // Select first principal by default when in PRINCIPAL mode
  useEffect(() => {
    if (recipientType === "PRINCIPAL" && principals.length > 0 && !activeTarget) {
      const first = principals[0];
      setActiveTarget({
        id: first.id,
        name: first.name,
        role: "ADMIN",
        subtext: first.subtext || "School Administration",
      });
    }
  }, [recipientType, principals, activeTarget]);

  // Chat Data
  const targetId = activeTarget?.id ?? null;
  const { data: chatHistory = [], isLoading: chatLoading, refetch: refetchHistory } = useChatHistory(targetId);
  const sendMut = useSendChatMessage();

  const [messageText, setMessageText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when chat history updates
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, activeTarget]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim() || !targetId) return;
    
    const content = messageText.trim();
    setMessageText("");
    try {
      await sendMut.mutateAsync({
        receiverId: targetId,
        content,
      });
    } catch {
      // Handled by toast in hook
    }
  }

  const isLoading = classesLoading;

  return (
    <div className="flex h-[calc(100vh-80px)] max-h-[850px] gap-6 overflow-hidden">
      {/* LEFT PANE: Contacts List */}
      <div className="flex w-80 flex-col rounded-2xl border border-sky-100 bg-white shadow-sm overflow-hidden shrink-0">
        <div className="p-4 border-b border-sky-100 bg-sky-50/50 space-y-3">
          <h2 className="font-montserrat text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-sky-500" />
            Messages
          </h2>

          {/* Recipient Type Switcher */}
          <div className="flex rounded-xl bg-sky-100/70 p-1 gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setRecipientType("PRINCIPAL");
                if (principals.length > 0) {
                  setActiveTarget({
                    id: principals[0].id,
                    name: principals[0].name,
                    role: "ADMIN",
                    subtext: principals[0].subtext || "School Administration",
                  });
                } else {
                  setActiveTarget(null);
                }
              }}
              className={cn(
                "flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5",
                recipientType === "PRINCIPAL"
                  ? "bg-white text-violet-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-violet-600" />
              Administration
            </button>

            <button
              type="button"
              onClick={() => {
                setRecipientType("STUDENTS");
                setActiveTarget(null);
              }}
              className={cn(
                "flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5",
                recipientType === "STUDENTS"
                  ? "bg-white text-sky-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <GraduationCap className="h-3.5 w-3.5 text-sky-600" />
              Students
            </button>
          </div>

          {recipientType === "STUDENTS" ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select
                  disabled={isLoading || classes.length === 0}
                  value={selectedClassId ? String(selectedClassId) : ""}
                  onValueChange={(val) => {
                    setSelectedClassId(val ? parseInt(val, 10) : "");
                    setSelectedSectionId(null as unknown as number);
                    setActiveTarget(null);
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
                    setActiveTarget(null);
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
                  placeholder="Search students by name, parent, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-sky-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search administrators / principals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-sky-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {/* Contacts Stream */}
        <div className="flex-1 overflow-y-auto bg-white p-2">
          {recipientType === "PRINCIPAL" ? (
            principalsLoading ? (
              <div className="flex h-full items-center justify-center text-sky-500">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredPrincipals.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                <ShieldCheck className="h-8 w-8 text-violet-300" />
                <p className="text-xs font-semibold text-slate-700">No Administration profiles</p>
                <p className="text-[11px] text-slate-400">School administration accounts will appear here.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredPrincipals.map((p) => {
                  const isSelected = activeTarget?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setActiveTarget({
                          id: p.id,
                          name: p.name,
                          role: "ADMIN",
                          subtext: p.subtext || "Director / Principal",
                        })
                      }
                      className={cn(
                        "w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer group",
                        isSelected ? "bg-violet-600 text-white shadow-md" : "hover:bg-violet-50 bg-transparent text-slate-900"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm shadow-xs",
                          isSelected ? "bg-white/20 text-white" : "bg-violet-100 text-violet-800"
                        )}
                      >
                        {p.name?.[0]?.toUpperCase() || "A"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={cn("text-xs font-bold truncate", isSelected ? "text-white" : "text-slate-900")}>
                            {p.name}
                          </p>
                          <span
                            className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider",
                              isSelected ? "bg-white/20 text-white" : "bg-violet-100 text-violet-700"
                            )}
                          >
                            Director
                          </span>
                        </div>
                        <p className={cn("text-[11px] truncate mt-0.5", isSelected ? "text-violet-100" : "text-slate-500")}>
                          {p.subtext || p.id}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          ) : !selectedClassId ? (
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
                const isSelected = activeTarget?.id === sAdmissionId;
                return (
                  <button
                    key={sAdmissionId ?? student.studentId}
                    type="button"
                    onClick={() =>
                      setActiveTarget({
                        id: sAdmissionId ?? String(student.studentId),
                        name: studentDisplayName(student),
                        role: "STUDENT",
                        subtext: `Parent: ${student.parentName || "Unknown"} (ID: ${sAdmissionId})`,
                      })
                    }
                    className={cn(
                      "w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group cursor-pointer",
                      isSelected ? "bg-sky-500 shadow-md text-white" : "hover:bg-sky-50 bg-transparent text-slate-900"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm transition-colors",
                        isSelected ? "bg-white/20 text-white" : "bg-sky-100 text-sky-700 group-hover:bg-sky-200"
                      )}
                    >
                      {student.firstName?.[0] || "S"}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className={cn("text-xs font-semibold truncate", isSelected ? "text-white" : "text-slate-900")}>
                        {studentDisplayName(student)}
                      </p>
                      <p className={cn("text-[11px] truncate mt-0.5", isSelected ? "text-sky-100" : "text-slate-500")}>
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
        {activeTarget ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-sky-100 bg-white px-6 py-3.5 shadow-sm z-10 relative">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold shadow-xs",
                    activeTarget.role === "ADMIN"
                      ? "bg-violet-100 text-violet-800 border border-violet-200"
                      : "bg-sky-100 text-sky-700"
                  )}
                >
                  {activeTarget.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-montserrat text-base font-bold text-slate-900">
                      {activeTarget.name}
                    </h3>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                        activeTarget.role === "ADMIN"
                          ? "bg-violet-100 text-violet-700 border border-violet-200"
                          : "bg-sky-100 text-sky-700"
                      )}
                    >
                      {activeTarget.role === "ADMIN" ? "Principal / Director" : "Student / Parent"}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {activeTarget.subtext || activeTarget.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => refetchHistory()}
                className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                title="Refresh Chat"
              >
                <RefreshCw className={cn("h-4 w-4", chatLoading && "animate-spin text-sky-500")} />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatLoading && chatHistory.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-slate-400 space-y-3">
                  <MessageSquare className="h-12 w-12 opacity-20" />
                  <p className="text-sm font-medium">No messages yet. Send a message to start communicating.</p>
                </div>
              ) : (
                chatHistory.map((msg, index) => {
                  const isSentByTeacher = msg.senderRole === "TEACHER";
                  const isFromAdmin = msg.senderRole === "ADMIN";
                  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                  return (
                    <div
                      key={msg.id || index}
                      className={cn("flex w-full", isSentByTeacher ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "relative max-w-[75%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-xs text-xs sm:text-sm leading-relaxed",
                          isSentByTeacher
                            ? "bg-sky-500 text-white rounded-br-xs"
                            : isFromAdmin
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-bl-xs shadow-md shadow-violet-200"
                            : "bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs"
                        )}
                      >
                        <span
                          className={cn(
                            "block text-[10px] font-semibold mb-1 opacity-80",
                            isSentByTeacher ? "text-sky-100" : isFromAdmin ? "text-violet-100" : "text-slate-500"
                          )}
                        >
                          {isSentByTeacher ? "You" : isFromAdmin ? "Principal / Director" : activeTarget.name}
                        </span>
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <span
                          className={cn(
                            "block text-[10px] mt-1 font-medium text-right opacity-80",
                            isSentByTeacher ? "text-sky-100" : isFromAdmin ? "text-violet-100" : "text-slate-400"
                          )}
                        >
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
                  placeholder={`Write a message to ${activeTarget.name}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendMessage(e);
                    }
                  }}
                  className="max-h-32 min-h-[48px] w-full resize-none rounded-xl border border-sky-200 bg-slate-50 p-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-400 transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sendMut.isPending}
                  className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm transition-all hover:bg-sky-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {sendMut.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 ml-0.5" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 p-6">
            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-9 w-9 text-slate-300" />
            </div>
            <h2 className="text-lg font-bold text-slate-700 font-montserrat">Your Communication Portal</h2>
            <p className="mt-1 text-xs max-w-sm text-slate-500">
              Select the Principal/Director to send administrative queries, or select a student from your classes to message their parents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

