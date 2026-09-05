"use client";

import { useState, useEffect } from "react";
import {
  useNotifications,
  useNotificationStats,
  useCreateNotification,
  useDeleteNotification,
  useSendNotification,
  useCancelNotification,
} from "@/hooks/useNotifications";
import { listClasses, type ClassItem } from "@/lib/api/adminClasses";
import type {
  NotificationRow,
  NotificationType,
  NotificationTargetType,
  NotificationWriteBody,
} from "@/lib/api/notifications";
import {
  Bell,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Plus,
  Loader2,
  Users,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

const NOTIFICATION_TYPES: { label: string; value: NotificationType }[] = [
  { label: "Announcement", value: "ANNOUNCEMENT" },
  { label: "Exam Schedule", value: "EXAM" },
  { label: "Exam Result", value: "EXAM_RESULT" },
  { label: "Attendance Alert", value: "ATTENDANCE" },
  { label: "Homework", value: "HOMEWORK" },
  { label: "Assignment", value: "ASSIGNMENT" },
  { label: "Fee Reminder", value: "FEE" },
  { label: "School Circular", value: "CIRCULAR" },
  { label: "School Event", value: "EVENT" },
  { label: "Emergency Alert", value: "EMERGENCY" },
  { label: "General Message", value: "GENERAL" },
];

const TARGET_AUDIENCES: { label: string; targetType: NotificationTargetType; targetId?: string }[] = [
  { label: "All Users (School Wide)", targetType: "ALL" },
  { label: "All Students", targetType: "ROLE", targetId: "STUDENT" },
  { label: "All Teachers", targetType: "ROLE", targetId: "TEACHER" },
  { label: "Specific Class", targetType: "CLASS" },
  { label: "Specific User (Student ID)", targetType: "USER" },
];

const SCREENS = [
  { label: "Default (Notification Detail)", value: "" },
  { label: "Attendance Screen", value: "Attendance" },
  { label: "Homework Screen", value: "Homework" },
  { label: "Timetable Screen", value: "Timetable" },
  { label: "Exam Schedule Screen", value: "ExamSchedule" },
  { label: "Report Card Screen", value: "ReportCard" },
  { label: "Events / Circulars Screen", value: "Events" },
  { label: "School Gallery", value: "SchoolGallery" },
  { label: "Teacher Messages / Chat", value: "MessagesTab" },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [classes, setClasses] = useState<ClassItem[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<NotificationType>("GENERAL");
  const [targetType, setTargetType] = useState<NotificationTargetType>("ALL");
  const [targetId, setTargetId] = useState("");
  const [screen, setScreen] = useState("");
  const [priority, setPriority] = useState<"normal" | "high">("high");
  const [scheduleMode, setScheduleMode] = useState<"now" | "schedule" | "draft">("now");
  const [scheduledAt, setScheduledAt] = useState("");

  // Queries & Mutations
  const { data: stats } = useNotificationStats();
  const { data: notificationsData, isLoading, refetch } = useNotifications(activeTab);
  const createMutation = useCreateNotification();
  const deleteMutation = useDeleteNotification();
  const sendMutation = useSendNotification();
  const cancelMutation = useCancelNotification();

  useEffect(() => {
    listClasses().then(setClasses).catch(() => {});
  }, []);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setType("GENERAL");
    setTargetType("ALL");
    setTargetId("");
    setScreen("");
    setPriority("high");
    setScheduleMode("now");
    setScheduledAt("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleSubmitForm = (mode: "now" | "schedule" | "draft") => {
    if (!title.trim()) {
      toast.error("Notification title is required");
      return;
    }
    if (!body.trim()) {
      toast.error("Notification message is required");
      return;
    }
    if (targetType === "CLASS" && !targetId) {
      toast.error("Please select a target class");
      return;
    }
    if (targetType === "USER" && !targetId.trim()) {
      toast.error("Please enter the target Student ID");
      return;
    }
    if (mode === "schedule" && !scheduledAt) {
      toast.error("Please select a schedule date and time");
      return;
    }

    if (mode === "now") {
      setShowConfirmModal(true);
    } else {
      executeCreate(mode);
    }
  };

  const executeCreate = (mode: "now" | "schedule" | "draft") => {
    const payload: NotificationWriteBody = {
      title: title.trim(),
      body: body.trim(),
      type,
      screen: screen || undefined,
      targetType,
      targetId: targetId || undefined,
      priority,
      sendNow: mode === "now",
      scheduledAt: mode === "schedule" && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setShowConfirmModal(false);
        setShowCreateModal(false);
        resetForm();
        refetch();
      },
    });
  };

  const notifications = notificationsData?.content || [];
  const filteredNotifications = notifications.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.body.toLowerCase().includes(q) ||
      (item.targetId && item.targetId.toLowerCase().includes(q)) ||
      item.type.toLowerCase().includes(q)
    );
  });

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PARTIALLY_SENT":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "SCHEDULED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DRAFT":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "FAILED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            Push Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Broadcast updates, exam schedules, homework alerts, and circulars directly to parent and student devices.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Notification
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            Total
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats?.total ?? 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-medium uppercase tracking-wider">
            Sent
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats?.sent ?? 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 text-xs font-medium uppercase tracking-wider">
            Scheduled
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats?.scheduled ?? 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            Drafts
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats?.drafts ?? 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-rose-600 text-xs font-medium uppercase tracking-wider">
            Failed
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats?.failed ?? 0}</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "SENT", "SCHEDULED", "DRAFT", "FAILED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab === "ALL" ? "All Notifications" : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-base font-semibold text-slate-700">No notifications found</p>
            <p className="text-xs text-slate-500 mt-1">Create a new push notification to broadcast to users.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Notification</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Audience</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Delivery</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNotifications.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 max-w-xs">
                      <div className="font-semibold text-slate-900 text-sm">{n.title}</div>
                      <div className="text-slate-500 text-xs line-clamp-1 mt-0.5">{n.body}</div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {n.type}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {n.targetType}
                        {n.targetId && (
                          <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                            {n.targetId}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold ${getBadgeColor(n.status)}`}>
                        {n.status}
                      </span>
                    </td>

                    <td className="p-4">
                      {n.status === "SENT" || n.status === "PARTIALLY_SENT" ? (
                        <div className="text-xs">
                          <span className="text-emerald-600 font-semibold">{n.successfulDeliveries || 0}</span>
                          <span className="text-slate-400 mx-1">/</span>
                          <span className="text-slate-600">{n.totalRecipients || 0}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="p-4 text-slate-500">
                      {n.sentAt ? (
                        new Date(n.sentAt).toLocaleString()
                      ) : n.scheduledAt ? (
                        <span className="text-blue-600 font-medium">
                          {new Date(n.scheduledAt).toLocaleString()}
                        </span>
                      ) : (
                        new Date(n.createdAt).toLocaleDateString()
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(n.status === "DRAFT" || n.status === "SCHEDULED") && (
                          <button
                            onClick={() => sendMutation.mutate(n.id)}
                            disabled={sendMutation.isPending}
                            title="Send Now"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {n.status === "SCHEDULED" && (
                          <button
                            onClick={() => cancelMutation.mutate(n.id)}
                            disabled={cancelMutation.isPending}
                            title="Cancel Schedule"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm("Delete this notification record?")) {
                              deleteMutation.mutate(n.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          title="Delete"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE NOTIFICATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-100 my-8 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create Push Notification</h3>
                  <p className="text-xs text-slate-500">Send instant alerts or schedule for later</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Notification Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics Exam Reminder"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 text-sm"
                />
              </div>

              {/* Message / Body */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Message Body *</label>
                <textarea
                  rows={3}
                  placeholder="Write the notification message displayed on parent/student phones..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 text-sm"
                />
              </div>

              {/* Type and Screen Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Notification Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as NotificationType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  >
                    {NOTIFICATION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Deep Link App Screen</label>
                  <select
                    value={screen}
                    onChange={(e) => setScreen(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  >
                    {SCREENS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Audience */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-semibold text-slate-700">Target Audience</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TARGET_AUDIENCES.map((aud) => (
                    <button
                      key={aud.label}
                      type="button"
                      onClick={() => {
                        setTargetType(aud.targetType);
                        setTargetId(aud.targetId || "");
                      }}
                      className={`p-2 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                        targetType === aud.targetType && (!aud.targetId || targetId === aud.targetId)
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>

                {/* Specific Class Selector */}
                {targetType === "CLASS" && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <label className="block font-semibold text-slate-700 mb-1">Select Class</label>
                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    >
                      <option value="">-- Choose a class --</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Specific User ID Input */}
                {targetType === "USER" && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <label className="block font-semibold text-slate-700 mb-1">Student ID</label>
                    <input
                      type="text"
                      placeholder="e.g. STU1001"
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Schedule Timing Options */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Delivery Timing</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="timing"
                      checked={scheduleMode === "now"}
                      onChange={() => setScheduleMode("now")}
                      className="text-indigo-600"
                    />
                    <span className="font-medium text-slate-800">Send Immediately</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="timing"
                      checked={scheduleMode === "schedule"}
                      onChange={() => setScheduleMode("schedule")}
                      className="text-indigo-600"
                    />
                    <span className="font-medium text-slate-800">Schedule for Later</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="timing"
                      checked={scheduleMode === "draft"}
                      onChange={() => setScheduleMode("draft")}
                      className="text-indigo-600"
                    />
                    <span className="font-medium text-slate-800">Save Draft</span>
                  </label>
                </div>

                {scheduleMode === "schedule" && (
                  <div className="mt-2">
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {scheduleMode === "draft" && (
                <button
                  type="button"
                  onClick={() => handleSubmitForm("draft")}
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Save as Draft
                </button>
              )}

              {scheduleMode === "schedule" && (
                <button
                  type="button"
                  onClick={() => handleSubmitForm("schedule")}
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  Schedule Notification
                </button>
              )}

              {scheduleMode === "now" && (
                <button
                  type="button"
                  onClick={() => handleSubmitForm("now")}
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Send Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 text-center animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl mx-auto flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">Confirm Notification Dispatch</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to broadcast <strong>"{title}"</strong> to <strong>{targetType} {targetId && `(${targetId})`}</strong> immediately?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeCreate("now")}
                disabled={createMutation.isPending}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Confirm & Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
