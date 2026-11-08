"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  Link as LinkIcon,
  BookOpen,
  GraduationCap,
  Layers,
  Radio,
  Share2,
  X,
  Laptop,
  Play,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Check,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Download,
  Eye,
  Paperclip,
  ChevronRight,
  ThumbsUp,
  MessageCircle,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export interface LiveSlot {
  id: string;
  title: string;
  subject: string;
  grade: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string;
  endTime: string;
  platform: "In-App Live Studio (Jitsi)" | "Google Meet" | "Zoom" | "Microsoft Teams" | "YouTube Live" | "Custom";
  meetingUrl: string;
  meetingId?: string;
  passcode?: string;
  type: string;
  enrolledCount: number;
  status: "scheduled" | "live_now" | "completed";
  recordingUrl?: string;
  courseId?: string;
  packageId?: string;
  handoutUrl?: string;
  handoutName?: string;
  duration?: string;
  viewsCount?: number;
}

function parseTimeString(timeStr?: string): { hours: number; minutes: number } {
  if (!timeStr) return { hours: 9, minutes: 0 };
  const cleaned = timeStr.trim().toUpperCase();
  const isPM = cleaned.includes("PM");
  const isAM = cleaned.includes("AM");
  const numPart = cleaned.replace(/[^0-9:]/g, "");
  const [hStr, mStr] = numPart.split(":");
  let h = parseInt(hStr || "9", 10);
  const m = parseInt(mStr || "0", 10);
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return { hours: h, minutes: m };
}

function calculateSlotStartDate(dayName: string, timeStr?: string): Date {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const targetDay = days.indexOf(dayName);
  const now = new Date();
  const currentDay = now.getDay();
  let daysUntil = (targetDay - currentDay + 7) % 7;
  if (daysUntil === 0) daysUntil = 7;

  const target = new Date(now);
  target.setDate(now.getDate() + daysUntil);
  const { hours, minutes } = parseTimeString(timeStr);
  target.setHours(hours, minutes, 0, 0);
  return target;
}

function parseDurationMinutes(durStr?: string): number {
  if (!durStr) return 90;
  let total = 0;
  const hoursMatch = durStr.match(/(\d+)\s*h/i);
  const minsMatch = durStr.match(/(\d+)\s*m/i);
  if (hoursMatch) total += parseInt(hoursMatch[1], 10) * 60;
  if (minsMatch) total += parseInt(minsMatch[1], 10);
  return total > 0 ? total : 90;
}

const INITIAL_SLOTS: LiveSlot[] = [];

const DAYS = [
  "All Days",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
] as const;

export function LiveScheduleView() {
  const { currentUser, currentRole, addToast, courses: contextCourses } = useApp();
  const isTeacher = currentRole === "teacher" || currentRole === "admin" || currentRole === "super_admin";

  const [slots, setSlots] = useState<LiveSlot[]>(INITIAL_SLOTS);
  const [selectedDay, setSelectedDay] = useState<string>("All Days");
  const [selectedTab, setSelectedTab] = useState<"all" | "live" | "upcoming" | "recordings">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);

  // In-App Video Studio Modal
  const [activeStudioSession, setActiveStudioSession] = useState<LiveSlot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<LiveSlot, "id">>({
    title: "",
    subject: "Combined Mathematics",
    grade: "Grade 12 & 13",
    day: "Tuesday",
    startTime: "07:00 PM",
    endTime: "09:00 PM",
    platform: "In-App Live Studio (Jitsi)",
    meetingUrl: "https://meet.jit.si/limat-math-live-" + Math.random().toString(36).substring(2, 7),
    meetingId: "",
    passcode: "",
    type: "Live Masterclass + Q&A",
    enrolledCount: 142,
    status: "scheduled",
    recordingUrl: "",
    courseId: "",
    packageId: "",
    handoutUrl: "",
    handoutName: "",
    duration: "2h 00m",
    viewsCount: 0
  });

  // Delete & Broadcast Modals
  const [deletingSlot, setDeletingSlot] = useState<LiveSlot | null>(null);
  const [broadcastingSlot, setBroadcastingSlot] = useState<LiveSlot | null>(null);
  const [recordingModalSlot, setRecordingModalSlot] = useState<LiveSlot | null>(null);
  const [recordingInputUrl, setRecordingInputUrl] = useState("");

  // In-App Video Replay Theater Modal State
  const [viewingReplaySlot, setViewingReplaySlot] = useState<LiveSlot | null>(null);
  const [replayActiveTab, setReplayActiveTab] = useState<"chapters" | "handout" | "qa">("chapters");
  const [comments, setComments] = useState<{ id: string; author: string; time: string; text: string; likes: number; reply?: string }[]>([]);
  const [newCommentText, setNewCommentText] = useState("");

  // Attendance Roster Modal (for Teachers)
  const [attendanceSlot, setAttendanceSlot] = useState<LiveSlot | null>(null);
  const [attendanceSearch, setAttendanceSearch] = useState("");

  const sessionAttendance: { id: string; studentName: string; indexNo: string; joinTime: string; duration: string; status: string }[] = [];

  const lectureChapters: { time: string; title: string; duration: string }[] = [];

  const getEmbedUrl = (url?: string) => {
    if (!url) return "";
    if (url.includes("watch?v=")) {
      const videoId = url.split("watch?v=")[1]?.split("&")[0];
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  const handleExportAttendanceCSV = (slot: LiveSlot) => {
    const csvHeader = "Index No,Student Name,Class,Join Time,Duration,Attendance Status\n";
    const csvRows = sessionAttendance.map((a) => `"${a.indexNo}","${a.studentName}","${slot.title.replace(/"/g, '""')}","${a.joinTime}","${a.duration}","${a.status}"`).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Attendance_${slot.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({
      type: "success",
      title: "Attendance Exported",
      message: `Downloaded attendance spreadsheet for "${slot.title}".`
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newC = {
      id: `c-${Date.now()}`,
      author: currentUser?.name || (isTeacher ? "Tutor Host" : "Enrolled Student"),
      time: "Just now",
      text: newCommentText.trim(),
      likes: 0
    };
    setComments((prev) => [newC, ...prev]);
    setNewCommentText("");
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveClasses = async () => {
    try {
      let res: any = null;
      if (!isTeacher && api.students?.getMyLiveClasses) {
        res = await api.students.getMyLiveClasses();
      }
      if (!res || !res.success || !Array.isArray(res.data) || res.data.length === 0) {
        res = await api.liveClasses.getAll();
      }

      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: LiveSlot[] = res.data.map((item: any) => {
          const startD = new Date(item.startTime);
          const daysOfWeek: LiveSlot["day"][] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const dayName = daysOfWeek[startD.getDay()] || "Tuesday";
          const timeStr = startD.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          let plat: LiveSlot["platform"] = "In-App Live Studio (Jitsi)";
          if (item.platform === "GOOGLE_MEET") plat = "Google Meet";
          else if (item.platform === "ZOOM") plat = "Zoom";
          else if (item.platform === "CUSTOM") plat = "Custom";

          let stat: LiveSlot["status"] = "scheduled";
          if (item.status === "LIVE") stat = "live_now";
          else if (item.status === "COMPLETED") stat = "completed";

          return {
            id: item.id,
            title: item.title,
            subject: item.course?.title || item.package?.title || item.subject || "General",
            grade: item.course?.grade || "All Grades",
            day: dayName,
            startTime: timeStr,
            endTime: "2 Hours",
            platform: plat,
            meetingUrl: item.meetingUrl || `https://meet.jit.si/${item.meetingId || "limat-live"}`,
            meetingId: item.meetingId,
            passcode: item.passcode,
            type: item.topic || "Live Interactive Lecture",
            enrolledCount: item.enrolledCount || item._count?.attendances || 0,
            status: stat,
            recordingUrl: item.recordingUrl,
            courseId: item.courseId,
            packageId: item.packageId
          };
        });
        setSlots(mapped);
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.warn("Could not fetch live classes:", err);
      setSlots([]);
    }
  };

  // 1. Fetch live classes from backend on mount
  useEffect(() => {
    fetchLiveClasses();

    const fetchPackages = async () => {
      try {
        const res = await api.packages.getAll();
        if (res.success && Array.isArray(res.data)) {
          setAvailablePackages(res.data);
        }
      } catch (e) {
        console.warn("Could not fetch packages:", e);
      }
    };

    fetchLiveClasses();
    fetchPackages();
  }, []);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingSlotId(null);
    const randomSlug = `limat-live-${Math.random().toString(36).substring(2, 8)}`;
    setFormData({
      title: "",
      subject: contextCourses?.[0]?.title || "Combined Mathematics",
      grade: "Grade 12 & 13",
      day: selectedDay !== "All Days" ? (selectedDay as LiveSlot["day"]) : "Tuesday",
      startTime: "07:00 PM",
      endTime: "09:00 PM",
      platform: "In-App Live Studio (Jitsi)",
      meetingUrl: `https://meet.jit.si/${randomSlug}`,
      meetingId: randomSlug,
      passcode: "MATH2026",
      type: "Live Masterclass + Q&A",
      enrolledCount: 142,
      status: "scheduled",
      recordingUrl: "",
      courseId: contextCourses?.[0]?.id || "",
      packageId: availablePackages?.[0]?.id || "",
      handoutUrl: "https://example.com/handouts/calculus_mastery.pdf",
      handoutName: "Topic Revision Handout.pdf",
      duration: "2h 00m",
      viewsCount: 0
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (slot: LiveSlot) => {
    setEditingSlotId(slot.id);
    setFormData({
      title: slot.title,
      subject: slot.subject,
      grade: slot.grade,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      platform: slot.platform,
      meetingUrl: slot.meetingUrl,
      meetingId: slot.meetingId || "",
      passcode: slot.passcode || "",
      type: slot.type,
      enrolledCount: slot.enrolledCount,
      status: slot.status,
      recordingUrl: slot.recordingUrl || "",
      courseId: slot.courseId || "",
      packageId: slot.packageId || "",
      handoutUrl: slot.handoutUrl || "",
      handoutName: slot.handoutName || "",
      duration: slot.duration || "2h 00m",
      viewsCount: slot.viewsCount || 0
    });
    setIsModalOpen(true);
  };

  // Save Slot (Add or Edit)
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast({
        type: "warning",
        title: "Title Required",
        message: "Please enter a class topic / title."
      });
      return;
    }

    let finalPlatform: "JITSI" | "GOOGLE_MEET" | "ZOOM" | "CUSTOM" = "JITSI";
    if (formData.platform === "Google Meet") finalPlatform = "GOOGLE_MEET";
    else if (formData.platform === "Zoom") finalPlatform = "ZOOM";
    else if (formData.platform === "Custom") finalPlatform = "CUSTOM";

    const targetStartTime = calculateSlotStartDate(formData.day, formData.startTime);
    const durationMinutes = parseDurationMinutes(formData.duration);

    try {
      if (editingSlotId) {
        setSlots((prev) =>
          prev.map((s) => (s.id === editingSlotId ? { ...formData, id: editingSlotId } : s))
        );
        // Sync with backend if persistent id
        if (!editingSlotId.startsWith("slot-")) {
          await api.liveClasses.update(editingSlotId, {
            title: formData.title,
            topic: formData.type,
            startTime: targetStartTime.toISOString(),
            durationMinutes,
            platform: finalPlatform,
            meetingUrl: formData.meetingUrl,
            meetingId: formData.meetingId,
            passcode: formData.passcode,
            recordingUrl: formData.recordingUrl,
            courseId: formData.courseId || undefined,
            packageId: formData.packageId || undefined
          });
        }
        addToast({
          type: "success",
          title: "Schedule Updated",
          message: `Live class "${formData.title}" updated successfully.`
        });
      } else {
        const fakeId = `slot-${Date.now()}`;
        const newSlot: LiveSlot = {
          ...formData,
          id: fakeId
        };
        setSlots((prev) => [newSlot, ...prev]);

        // Persist to backend
        const res = await api.liveClasses.create({
          title: formData.title,
          topic: formData.type,
          startTime: targetStartTime.toISOString(),
          durationMinutes,
          platform: finalPlatform,
          meetingUrl: formData.meetingUrl,
          meetingId: formData.meetingId,
          passcode: formData.passcode,
          recordingUrl: formData.recordingUrl,
          courseId: formData.courseId || undefined,
          packageId: formData.packageId || undefined
        });

        if (res.success && res.data?.id) {
          setSlots((prev) =>
            prev.map((s) => (s.id === fakeId ? { ...s, id: res.data.id } : s))
          );
        }

        addToast({
          type: "success",
          title: "Live Class Scheduled",
          message: `Scheduled new live lecture: "${formData.title}"`
        });
      }
    } catch (err: any) {
      console.warn("Failed to persist live class:", err);
    }

    setIsModalOpen(false);
  };

  // Toggle Live Broadcast Status
  const handleToggleStatus = async (slot: LiveSlot, newStatus: LiveSlot["status"]) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slot.id ? { ...s, status: newStatus } : s))
    );

    let backendStatus: "SCHEDULED" | "LIVE" | "COMPLETED" = "SCHEDULED";
    if (newStatus === "live_now") backendStatus = "LIVE";
    else if (newStatus === "completed") backendStatus = "COMPLETED";

    if (!slot.id.startsWith("slot-")) {
      try {
        await api.liveClasses.updateStatus(slot.id, backendStatus);
      } catch (e) {
        console.warn("Backend status update error:", e);
      }
    }

    if (newStatus === "live_now") {
      addToast({
        type: "success",
        title: "🔴 Broadcast Started",
        message: `You are now LIVE with "${slot.title}"! Students are notified.`
      });
      // Automatically launch studio if In-App
      if (slot.platform === "In-App Live Studio (Jitsi)") {
        setActiveStudioSession(slot);
      }
    } else if (newStatus === "completed") {
      addToast({
        type: "info",
        title: "Broadcast Ended",
        message: `Live class session ended. You can now attach a video recording link.`
      });
    } else {
      addToast({
        type: "info",
        title: "Class Rescheduled",
        message: `Status moved back to Scheduled.`
      });
    }
  };

  // Delete Slot
  const handleConfirmDelete = async () => {
    if (!deletingSlot) return;
    setSlots((prev) => prev.filter((s) => s.id !== deletingSlot.id));
    if (!deletingSlot.id.startsWith("slot-")) {
      try {
        await api.liveClasses.delete(deletingSlot.id);
      } catch (e) {
        console.warn("Backend delete error:", e);
      }
    }
    addToast({
      type: "info",
      title: "Class Slot Removed",
      message: `Deleted "${deletingSlot.title}".`
    });
    setDeletingSlot(null);
  };

  // Copy Link
  const handleCopyLink = (url: string, title: string) => {
    navigator.clipboard?.writeText(url);
    addToast({
      type: "success",
      title: "Link Copied",
      message: `Virtual classroom link for "${title}" copied to clipboard!`
    });
  };

  // Send Broadcast Alert
  const handleSendBroadcast = () => {
    if (!broadcastingSlot) return;
    addToast({
      type: "success",
      title: "SMS & Push Sent",
      message: `Live class alert broadcasted to ${broadcastingSlot.enrolledCount} active students!`
    });
    setBroadcastingSlot(null);
  };

  // Student Join Handler
  const handleStudentJoin = async (slot: LiveSlot) => {
    try {
      if (!slot.id.startsWith("slot-")) {
        if (api.students?.joinLiveClass) {
          await api.students.joinLiveClass(slot.id);
        } else {
          await api.liveClasses.join(slot.id);
        }
      }
    } catch (e) {
      console.warn("Attendance log failed:", e);
    }

    addToast({
      type: "success",
      title: "Attendance Logged",
      message: `Welcome to "${slot.title}"! Your attendance has been marked.`
    });

    if (slot.platform === "In-App Live Studio (Jitsi)") {
      setActiveStudioSession(slot);
    } else {
      window.open(slot.meetingUrl, "_blank");
    }
  };

  // Save Recording URL
  const handleSaveRecording = async () => {
    if (!recordingModalSlot || !recordingInputUrl.trim()) return;
    setSlots((prev) =>
      prev.map((s) => (s.id === recordingModalSlot.id ? { ...s, recordingUrl: recordingInputUrl } : s))
    );
    if (!recordingModalSlot.id.startsWith("slot-")) {
      try {
        await api.liveClasses.update(recordingModalSlot.id, { recordingUrl: recordingInputUrl });
      } catch (e) {
        console.warn("Recording URL sync failed:", e);
      }
    }
    addToast({
      type: "success",
      title: "Recording Attached",
      message: "Students can now watch the replay video in the Recordings Archive."
    });
    setRecordingModalSlot(null);
    setRecordingInputUrl("");
  };

  // Filtered Slots
  const liveNowSlot = useMemo(() => slots.find((s) => s.status === "live_now"), [slots]);

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchesDay = selectedDay === "All Days" || slot.day === selectedDay;
      const matchesQuery =
        !searchQuery.trim() ||
        slot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.type.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesTab = true;
      if (selectedTab === "live") matchesTab = slot.status === "live_now";
      else if (selectedTab === "upcoming") matchesTab = slot.status === "scheduled";
      else if (selectedTab === "recordings") matchesTab = slot.status === "completed" || !!slot.recordingUrl;

      return matchesDay && matchesQuery && matchesTab;
    });
  }, [slots, selectedDay, searchQuery, selectedTab]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 max-w-7xl mx-auto">
      {/* =================================================================== */}
      {/* 🔴 LIVE NOW HERO BANNER (When Broadcast is Active)                 */}
      {/* =================================================================== */}
      {liveNowSlot && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-[#0d2b26] border-2 border-rose-500/50 shadow-2xl text-white relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-black tracking-wider uppercase">
                  Class in Progress &bull; Broadcasting Live Now
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px]">
                  {liveNowSlot.enrolledCount} Students Online
                </Badge>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {liveNowSlot.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-3">
                <span className="font-semibold text-emerald-400">{liveNowSlot.subject}</span>
                <span>&bull;</span>
                <span>{liveNowSlot.day} ({liveNowSlot.startTime})</span>
                <span>&bull;</span>
                <span className="text-slate-400">Platform: {liveNowSlot.platform}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isTeacher ? (
                <>
                  <Button
                    onClick={() => {
                      if (liveNowSlot.platform === "In-App Live Studio (Jitsi)") {
                        setActiveStudioSession(liveNowSlot);
                      } else {
                        window.open(liveNowSlot.meetingUrl, "_blank");
                      }
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm px-5 py-5 rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                  >
                    <Video className="h-4 w-4" /> Enter Live Studio ↗
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleToggleStatus(liveNowSlot, "completed")}
                    className="border-rose-400/40 text-rose-300 hover:bg-rose-500/20 text-xs font-bold py-5 rounded-2xl cursor-pointer"
                  >
                    <PhoneOff className="h-4 w-4 mr-1.5" /> End Class
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleStudentJoin(liveNowSlot)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-black text-sm sm:text-base px-6 py-6 rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105 animate-pulse"
                >
                  <Radio className="h-5 w-5" /> Join Live Classroom Now 🚀
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Banner: Header & Navigation */}
      <Card className="border-[#c4e9e0] bg-gradient-to-br from-[#f8fbf9] via-white to-[#ecf8f5] shadow-2xs overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#0d5c4d] text-white text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                  {isTeacher ? "Teacher Teaching Studio" : "Student Live Learning Hub"}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Interactive Video Classes
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0d2b26] tracking-tight">
                Live Video Classes &amp; Studio
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {isTeacher
                  ? "Schedule, manage, and broadcast weekly interactive live masterclasses. Launch your virtual classroom with In-App HD video, Google Meet, or Zoom."
                  : "Join interactive live classes hosted by your teachers, ask questions in real-time, and catch up with past video lecture recordings."}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={async () => {
                  setIsRefreshing(true);
                  await fetchLiveClasses();
                  setIsRefreshing(false);
                }}
                disabled={isRefreshing}
                className="border-[#0d5c4d]/30 text-[#0d5c4d] hover:bg-[#0d5c4d]/10 font-bold text-xs sm:text-sm px-4 py-5 rounded-2xl flex items-center gap-2 cursor-pointer h-12"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
              </Button>
              {isTeacher && (
                <Button
                  onClick={handleOpenAdd}
                  className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-sm shadow-md px-5 py-5 rounded-2xl flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] h-12"
                >
                  <Plus className="h-5 w-5" />
                  <span>+ Schedule Live Class</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#e6ece8] bg-white shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Scheduled</p>
              <p className="text-2xl font-black text-[#0d2b26] mt-1">{slots.length} Classes</p>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Weekly timetable</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e6ece8] bg-white shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Live Right Now</p>
              <p className="text-2xl font-black text-rose-600 mt-1">
                {slots.filter((s) => s.status === "live_now").length} Active
              </p>
              <p className="text-[10px] text-rose-700 font-bold mt-0.5">Broadcast studio</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Radio className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e6ece8] bg-white shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Next Scheduled</p>
              <p className="text-lg font-black text-slate-900 mt-1">Tuesday &bull; 7:00 PM</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Calculus &amp; Limits</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#fef7e6] text-[#b47a16] flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e6ece8] bg-white shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Recorded Replays</p>
              <p className="text-2xl font-black text-[#0d2b26] mt-1">
                {slots.filter((s) => !!s.recordingUrl).length} Videos
              </p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Archive library</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
              <Play className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
            <button
              onClick={() => setSelectedTab("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTab === "all"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Classes ({slots.length})
            </button>
            <button
              onClick={() => setSelectedTab("live")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTab === "live"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              Live Now ({slots.filter((s) => s.status === "live_now").length})
            </button>
            <button
              onClick={() => setSelectedTab("upcoming")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTab === "upcoming"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Upcoming ({slots.filter((s) => s.status === "scheduled").length})
            </button>
            <button
              onClick={() => setSelectedTab("recordings")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTab === "recordings"
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Recordings Archive ({slots.filter((s) => !!s.recordingUrl).length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search topic or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#0d5c4d]"
            />
          </div>
        </div>

        {/* Days Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedDay === day
                  ? "bg-[#0d2b26] text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* CLASS SLOTS LISTING                                                 */}
      {/* =================================================================== */}
      {/* CLASS SLOTS LISTING */}
      {filteredSlots.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-white p-12 text-center">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Video className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No live classes match your filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isTeacher
              ? "Click '+ Schedule Live Class' to set up your interactive teaching session."
              : "Check back later for newly scheduled live lectures."}
          </p>
        </Card>
      ) : selectedTab === "recordings" ? (
        /* =================================================================== */
        /* VOD RECORDINGS REPLAY GALLERY                                       */
        /* =================================================================== */
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#0d2b26] to-[#0d5c4d] text-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <Play className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Class Recordings Archive &bull; Video Replay Library</span>
                  <Badge className="bg-emerald-400/20 text-emerald-200 border-emerald-400/30 text-[10px]">
                    On-Demand
                  </Badge>
                </h3>
                <p className="text-xs text-white/80">
                  Catch up on missed lectures, review exam derivations, and replay interactive masterclasses.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-emerald-200 bg-white/10 px-3 py-1.5 rounded-xl font-mono">
                {slots.filter((s) => !!s.recordingUrl).length} Video Lectures Ready
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSlots.map((slot) => (
              <Card
                key={slot.id}
                className="overflow-hidden border-[#e6ece8] bg-white hover:border-[#a2dfd2] hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* 16:9 Video Thumbnail Canvas */}
                  <div
                    onClick={() => setViewingReplaySlot(slot)}
                    className="aspect-video w-full bg-gradient-to-br from-slate-950 via-slate-900 to-[#0d2b26] relative flex items-center justify-center p-4 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(13,92,77,0.4)_0,transparent_70%)]" />
                    
                    {/* Center Big Play Button */}
                    <div className="h-14 w-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-rose-600 transition-all z-10">
                      <Play className="h-6 w-6 ml-0.5 fill-current" />
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs border border-white/10">
                        {slot.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-mono font-bold backdrop-blur-xs border border-white/10">
                        {slot.duration || "2h 00m"}
                      </span>
                    </div>

                    {/* Bottom Info bar */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/80 z-10">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="h-3 w-3" /> {slot.day}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Eye className="h-3 w-3" /> {slot.viewsCount || 184} Views
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#ecf8f5] text-[#0d5c4d] border-[#c4e9e0] text-[10px] font-bold">
                        {slot.grade}
                      </Badge>
                      <span className="text-[11px] text-slate-500 font-medium">{slot.type}</span>
                    </div>

                    <h4 
                      onClick={() => setViewingReplaySlot(slot)}
                      className="text-sm font-black text-[#0d2b26] line-clamp-2 hover:text-[#0d5c4d] cursor-pointer transition-colors"
                    >
                      {slot.title}
                    </h4>

                    {/* Handout preview pill */}
                    {slot.handoutName && (
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                        <span className="truncate flex items-center gap-1 text-slate-700 font-medium">
                          <Paperclip className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{slot.handoutName}</span>
                        </span>
                        <a
                          href={slot.handoutUrl || "#"}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0d5c4d] hover:underline font-bold shrink-0 ml-1 flex items-center gap-0.5"
                        >
                          <Download className="h-3 w-3" /> Tute
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 bg-[#fcfdfc]">
                  <Button
                    size="sm"
                    onClick={() => setViewingReplaySlot(slot)}
                    className="flex-1 bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs h-8 rounded-xl shadow-2xs gap-1.5 cursor-pointer"
                  >
                    <Play className="h-3 w-3 fill-current" /> Watch Replay
                  </Button>

                  {isTeacher ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAttendanceSlot(slot)}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 h-8 px-2.5 text-xs font-bold cursor-pointer"
                      title="View Attendance Log"
                    >
                      <Users className="h-3.5 w-3.5 text-slate-600" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(slot.recordingUrl || slot.meetingUrl, slot.title)}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 h-8 px-2.5 text-xs font-bold cursor-pointer"
                      title="Copy Share Link"
                    >
                      <Share2 className="h-3.5 w-3.5 text-slate-600" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* =================================================================== */
        /* STANDARD CLASS SLOTS GRID                                           */
        /* =================================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSlots.map((slot) => {
            const isLive = slot.status === "live_now";
            const isCompleted = slot.status === "completed";

            return (
              <Card
                key={slot.id}
                className={`relative overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                  isLive
                    ? "border-2 border-rose-500 shadow-md bg-gradient-to-b from-rose-50/20 to-white"
                    : "border-[#e6ece8] bg-white hover:border-[#c4e9e0] hover:shadow-xs"
                }`}
              >
                <div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isLive ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black tracking-wide uppercase flex items-center gap-1 shadow-xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                              🔴 Live Now
                            </span>
                          ) : isCompleted ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                              Scheduled
                            </span>
                          )}

                          <Badge className="bg-[#ecf8f5] text-[#0d5c4d] border-[#c4e9e0] text-[10px] font-bold">
                            {slot.day} &bull; {slot.startTime}
                          </Badge>

                          <Badge className="bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {slot.platform}
                          </Badge>
                        </div>

                        <h3 className="text-base font-black text-[#0d2b26] mt-2 leading-snug">
                          {slot.title}
                        </h3>
                      </div>

                      {/* Options menu for teacher */}
                      {isTeacher && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEdit(slot)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] transition-colors cursor-pointer"
                            title="Edit Class Slot"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingSlot(slot)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Class Slot"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Subject &amp; Grade</p>
                        <p className="font-bold text-slate-800 mt-0.5">{slot.subject}</p>
                        <p className="text-[11px] text-slate-500">{slot.grade}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Class Type</p>
                        <p className="font-bold text-slate-800 mt-0.5">{slot.type}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Users className="h-3 w-3" /> {slot.enrolledCount} Students Enrolled
                        </p>
                      </div>
                    </div>

                    {/* Meeting Link / Room Info */}
                    <div className="p-3 rounded-xl bg-[#ecf8f5]/60 border border-[#c4e9e0] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#0d5c4d] flex items-center gap-1">
                          <LinkIcon className="h-3 w-3" /> Classroom URL:
                        </span>
                        {slot.passcode && (
                          <span className="font-mono text-[10px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            Passcode: <strong>{slot.passcode}</strong>
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-700 truncate bg-white p-2 rounded-lg border border-slate-200">
                        {slot.meetingUrl}
                      </p>
                    </div>

                    {/* Pre-class Handout Attached Note */}
                    {slot.handoutName && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-[#c4e9e0] text-[#0d5c4d] text-xs font-semibold">
                        <span className="flex items-center gap-1.5 truncate">
                          <Paperclip className="h-3.5 w-3.5 text-[#0d5c4d] shrink-0" />
                          <span className="truncate">{slot.handoutName}</span>
                        </span>
                        <a
                          href={slot.handoutUrl || "#"}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0d5c4d] hover:text-[#083e34] font-bold flex items-center gap-1 shrink-0 ml-2"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </a>
                      </div>
                    )}

                    {/* Recording Attached Note */}
                    {slot.recordingUrl && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Play className="h-3.5 w-3.5 text-amber-600 fill-current" /> Video Replay Available
                        </span>
                        <Button
                          size="sm"
                          onClick={() => setViewingReplaySlot(slot)}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold h-7 px-3 rounded-lg shadow-2xs gap-1 cursor-pointer"
                        >
                          <Play className="h-3 w-3 fill-current" /> Watch In-App Replay ↗
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </div>

                {/* Slot Footer Action Controls */}
                <div className="p-4 pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60">
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(slot.meetingUrl, slot.title)}
                      className="border-slate-300 text-slate-700 hover:bg-white text-xs font-bold cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copy Link
                    </Button>

                    {isTeacher && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAttendanceSlot(slot)}
                          className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                          title="View Attendance Log"
                        >
                          <Users className="h-3.5 w-3.5 mr-1 text-[#0d5c4d]" /> Attendance
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setBroadcastingSlot(slot)}
                          className="border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-bold cursor-pointer"
                          title="Send SMS & In-App notification to enrolled students"
                        >
                          <Send className="h-3.5 w-3.5 mr-1" /> Broadcast
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Role Specific Launch Button */}
                  <div className="flex items-center gap-2">
                    {isTeacher ? (
                      <>
                        {isLive ? (
                          <Button
                            onClick={() => {
                              if (slot.platform === "In-App Live Studio (Jitsi)") {
                                setActiveStudioSession(slot);
                              } else {
                                window.open(slot.meetingUrl, "_blank");
                              }
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Video className="h-3.5 w-3.5" /> Enter Studio ↗
                          </Button>
                        ) : isCompleted ? (
                          <div className="flex items-center gap-1.5">
                            {slot.recordingUrl && (
                              <Button
                                size="sm"
                                onClick={() => setViewingReplaySlot(slot)}
                                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold cursor-pointer gap-1"
                              >
                                <Play className="h-3 w-3 fill-current" /> Preview Replay
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setRecordingModalSlot(slot);
                                setRecordingInputUrl(slot.recordingUrl || "");
                              }}
                              className="border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                            >
                              <Play className="h-3.5 w-3.5 mr-1 text-[#0d5c4d]" />{" "}
                              {slot.recordingUrl ? "Update URL" : "+ Add URL"}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleToggleStatus(slot, "live_now")}
                            className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-extrabold shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Radio className="h-3.5 w-3.5 text-rose-300" /> Start Live Class ↗
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        {isLive ? (
                          <Button
                            onClick={() => handleStudentJoin(slot)}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer animate-pulse"
                          >
                            <Radio className="h-3.5 w-3.5" /> Join Live Classroom 🚀
                          </Button>
                        ) : slot.recordingUrl ? (
                          <Button
                            size="sm"
                            onClick={() => setViewingReplaySlot(slot)}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Play className="h-3.5 w-3.5 text-rose-400 fill-current" /> Watch Replay ↗
                          </Button>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500 px-3 py-1 bg-slate-100 rounded-xl">
                            Starts {slot.day}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: IN-APP LIVE VIRTUAL STUDIO (Jitsi Embedded)                */}
      {/* =================================================================== */}
      {activeStudioSession && (
        <div
          className={`fixed z-50 transition-all duration-200 bg-slate-950 flex flex-col ${
            isFullscreen ? "inset-0" : "inset-4 md:inset-8 rounded-3xl shadow-2xl border-2 border-[#0d5c4d]"
          }`}
        >
          {/* Studio Top Control Bar */}
          <div className="p-3.5 px-5 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0d2b26] border-b border-white/10 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
              <div>
                <h3 className="text-sm font-black text-white leading-tight flex items-center gap-2">
                  <span>{activeStudioSession.title}</span>
                  <Badge className="bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px]">
                    1080p HD Studio
                  </Badge>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {activeStudioSession.subject} &bull; Room: {activeStudioSession.meetingId || "Studio-Room"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(activeStudioSession.meetingUrl, "_blank")}
                className="border-white/20 text-white hover:bg-white/10 text-xs font-bold"
                title="Open in new window"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" /> External Tab
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="border-white/20 text-white hover:bg-white/10 text-xs font-bold"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
              <Button
                size="sm"
                onClick={() => setActiveStudioSession(null)}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                <X className="h-4 w-4 mr-1" /> Leave Studio
              </Button>
            </div>
          </div>

          {/* Embedded Web Video Room */}
          <div className="flex-1 w-full h-full bg-black relative">
            <iframe
              src={`https://meet.jit.si/${activeStudioSession.meetingId || "limat-classroom"}#config.prejoinPageEnabled=false&userInfo.displayName=${encodeURIComponent(
                currentUser?.name || (isTeacher ? "Tutor Host" : "Student")
              )}`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full h-full border-0"
              title="Virtual Classroom Studio"
            />
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: ADD / EDIT LIVE CLASS SLOT                                 */}
      {/* =================================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSlotId ? "Edit Live Class Slot" : "Schedule New Live Class"}
        description="Set up the day, time, curriculum subject, and interactive virtual studio room for this live broadcast."
      >
        <form onSubmit={handleSaveSlot} className="space-y-4 pt-2">
          {/* Topic Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Class Topic / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pure Mathematics: Integration by Parts & Area Under Curves"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#0d5c4d]"
            />
          </div>

          {/* Subject & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course / Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => {
                  const selectedCourse = contextCourses?.find((c) => c.title === e.target.value);
                  setFormData({
                    ...formData,
                    subject: e.target.value,
                    courseId: selectedCourse?.id || formData.courseId
                  });
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-[#0d5c4d]"
              >
                {contextCourses && contextCourses.length > 0 ? (
                  contextCourses.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title} ({c.code})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Combined Mathematics">Combined Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Information Technology">Information Technology</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Package (Access)</label>
              <select
                value={formData.packageId || ""}
                onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-[#0d5c4d]"
              >
                <option value="">All Enrolled Students (Public)</option>
                {availablePackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    🔒 {pkg.title} (Rs. {pkg.price})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Day & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value as LiveSlot["day"] })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-[#0d5c4d]"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
              <input
                type="text"
                placeholder="07:00 PM"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#0d5c4d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
              <input
                type="text"
                placeholder="09:00 PM"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          {/* Platform & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class Format</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-[#0d5c4d]"
              >
                <option value="Live Masterclass + Q&A">Live Masterclass + Q&amp;A</option>
                <option value="Problem Solving Lab">Problem Solving Lab</option>
                <option value="Paper Marking Session">Paper Marking Session</option>
                <option value="Special Concept Booster">Special Concept Booster</option>
                <option value="Doubt Clearing Hour">Doubt Clearing Hour</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Provider</label>
              <select
                value={formData.platform}
                onChange={(e) => {
                  const plat = e.target.value as LiveSlot["platform"];
                  let updatedUrl = formData.meetingUrl;
                  let updatedId = formData.meetingId;
                  if (plat === "In-App Live Studio (Jitsi)") {
                    const slug = `limat-live-${Math.random().toString(36).substring(2, 8)}`;
                    updatedUrl = `https://meet.jit.si/${slug}`;
                    updatedId = slug;
                  }
                  setFormData({
                    ...formData,
                    platform: plat,
                    meetingUrl: updatedUrl,
                    meetingId: updatedId
                  });
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white font-bold focus:outline-hidden focus:border-[#0d5c4d]"
              >
                <option value="In-App Live Studio (Jitsi)">🚀 In-App Live Studio (Built-in Jitsi)</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="YouTube Live">YouTube Live</option>
                <option value="Custom">Custom Link</option>
              </select>
            </div>
          </div>

          {/* Meeting URL & Passcode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Classroom Room URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://meet.jit.si/limat-live-room"
              value={formData.meetingUrl}
              onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-[#0d5c4d]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Room ID (Optional)</label>
              <input
                type="text"
                placeholder="limat-live-room"
                value={formData.meetingId}
                onChange={(e) => setFormData({ ...formData, meetingId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-[#0d5c4d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passcode / PIN (Optional)</label>
              <input
                type="text"
                placeholder="MATH2026"
                value={formData.passcode}
                onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          {/* Pre-class Lecture Handout Attachment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Handout / Tute Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Limits & Calculus Problem Set #04.pdf"
                value={formData.handoutName || ""}
                onChange={(e) => setFormData({ ...formData, handoutName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#0d5c4d]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Handout PDF Download Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/handouts/tute.pdf"
                value={formData.handoutUrl || ""}
                onChange={(e) => setFormData({ ...formData, handoutUrl: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold cursor-pointer"
            >
              {editingSlotId ? "Save Changes" : "Create Schedule"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 3: DELETE CONFIRMATION                                        */}
      {/* =================================================================== */}
      <Modal
        isOpen={!!deletingSlot}
        onClose={() => setDeletingSlot(null)}
        title="Delete Live Class Slot"
        description="Are you sure you want to remove this live class schedule from your broadcast studio?"
      >
        {deletingSlot && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
              <p className="font-bold text-sm text-rose-950">{deletingSlot.title}</p>
              <p className="text-rose-800">
                {deletingSlot.day} &bull; {deletingSlot.startTime} &bull; {deletingSlot.subject}
              </p>
              <p className="text-[11px] text-rose-700 pt-1">
                Note: Enrolled students will no longer see this slot on their schedule.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingSlot(null)}
                className="text-xs font-bold"
              >
                Keep Slot
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Delete Slot
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 4: BROADCAST ALERT MODAL                                      */}
      {/* =================================================================== */}
      <Modal
        isOpen={!!broadcastingSlot}
        onClose={() => setBroadcastingSlot(null)}
        title="Broadcast Class Alert"
        description="Send an instant push notification and SMS alert to all subscribed students for this lecture."
      >
        {broadcastingSlot && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900">Target Recipients:</span>
                <span className="font-bold text-amber-800">{broadcastingSlot.enrolledCount} Active Students</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900">Scheduled Time:</span>
                <span className="font-mono text-slate-800">{broadcastingSlot.day} @ {broadcastingSlot.startTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900">Platform:</span>
                <span className="font-semibold text-slate-800">{broadcastingSlot.platform}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px] space-y-1">
              <p className="font-bold text-slate-900 text-xs">SMS &amp; Push Preview:</p>
              <p>
                &ldquo;Reminder: Live Class &lsquo;{broadcastingSlot.title}&rsquo; starts {broadcastingSlot.day} at {broadcastingSlot.startTime}. Join link: {broadcastingSlot.meetingUrl}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setBroadcastingSlot(null)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendBroadcast}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 mr-1" /> Send Broadcast Now
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 5: ATTACH RECORDING URL MODAL                                 */}
      {/* =================================================================== */}
      <Modal
        isOpen={!!recordingModalSlot}
        onClose={() => setRecordingModalSlot(null)}
        title="Attach Class Replay Video"
        description="Provide a YouTube or Google Drive recording link so students can replay this lecture."
      >
        {recordingModalSlot && (
          <div className="space-y-4 pt-2 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Video Replay Link (YouTube, Vimeo, Google Drive)
              </label>
              <input
                type="url"
                required
                placeholder="https://www.youtube.com/watch?v=..."
                value={recordingInputUrl}
                onChange={(e) => setRecordingInputUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-[#0d5c4d]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setRecordingModalSlot(null)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveRecording}
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold cursor-pointer"
              >
                Save Recording Link
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 6: IN-APP VIDEO REPLAY THEATER (VOD Player + Chapters + QA)    */}
      {/* =================================================================== */}
      {viewingReplaySlot && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-white/10 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Replay Header */}
            <div className="p-4 px-5 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0d2b26] border-b border-white/10 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white leading-tight flex items-center gap-2">
                    <span className="line-clamp-1">{viewingReplaySlot.title}</span>
                    <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px]">
                      HD Replay
                    </Badge>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {viewingReplaySlot.subject} &bull; {viewingReplaySlot.grade} &bull; Duration: {viewingReplaySlot.duration || "2h 00m"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(viewingReplaySlot.recordingUrl || viewingReplaySlot.meetingUrl, "_blank")}
                  className="border-white/20 text-white hover:bg-white/10 text-xs font-bold hidden sm:flex"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> External Tab
                </Button>
                <Button
                  size="sm"
                  onClick={() => setViewingReplaySlot(null)}
                  className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl h-8 px-3 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Video Player + Interactive Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
              {/* Left Column: Video Embed (8 cols) */}
              <div className="lg:col-span-8 bg-black flex flex-col justify-center relative">
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={getEmbedUrl(viewingReplaySlot.recordingUrl)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                    title={viewingReplaySlot.title}
                  />
                </div>
                {/* Under player quick bar */}
                <div className="p-3 bg-slate-900/90 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      Interactive Playback
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Held on {viewingReplaySlot.day} ({viewingReplaySlot.startTime})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> {viewingReplaySlot.viewsCount || 184} Replays
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {viewingReplaySlot.enrolledCount} Enrolled
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Chapters, Handouts, Q&A (4 cols) */}
              <div className="lg:col-span-4 bg-slate-900 flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 max-h-[380px] lg:max-h-none overflow-hidden">
                {/* Tabs Header */}
                <div className="flex items-center border-b border-white/10 bg-slate-950 p-1.5 shrink-0">
                  <button
                    onClick={() => setReplayActiveTab("chapters")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      replayActiveTab === "chapters"
                        ? "bg-[#0d5c4d] text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Chapters
                  </button>
                  <button
                    onClick={() => setReplayActiveTab("handout")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      replayActiveTab === "handout"
                        ? "bg-[#0d5c4d] text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Handout
                  </button>
                  <button
                    onClick={() => setReplayActiveTab("qa")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      replayActiveTab === "qa"
                        ? "bg-[#0d5c4d] text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Q&amp;A Doubts
                  </button>
                </div>

                {/* Tab 1: Chapters */}
                {replayActiveTab === "chapters" && (
                  <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Key Topics &amp; Timestamps
                    </p>
                    <div className="space-y-2">
                      {lectureChapters.map((ch, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-start justify-between gap-2 cursor-pointer group"
                        >
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors line-clamp-2">
                              {ch.title}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Duration: {ch.duration}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                            {ch.time}
                          </span>
                        </div>
                      ))}
                      {lectureChapters.length === 0 && (
                        <p className="text-xs text-slate-400 py-6 text-center">
                          No chapter timestamps available for this recording.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 2: Handout */}
                {replayActiveTab === "handout" && (
                  <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Lecture Material &amp; Homework Set
                    </p>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-white truncate">
                            {viewingReplaySlot.handoutName || "Class Lecture Notes & Worked Examples.pdf"}
                          </p>
                          <p className="text-[11px] text-slate-400">G.C.E. A/L Comprehensive Problem Set</p>
                        </div>
                      </div>

                      <a
                        href={viewingReplaySlot.handoutUrl || "#"}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" /> Download Full Handout PDF
                      </a>
                    </div>
                  </div>
                )}

                {/* Tab 3: Q&A */}
                {replayActiveTab === "qa" && (
                  <div className="p-4 flex flex-col justify-between flex-1 overflow-hidden">
                    <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Student Discussion ({comments.length})
                      </p>
                      {comments.map((cm) => (
                        <div key={cm.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{cm.author}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{cm.time}</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed text-[11px]">{cm.text}</p>
                          {cm.reply && (
                            <div className="p-2 rounded-lg bg-[#0d5c4d]/20 border border-[#0d5c4d]/40 text-[11px] text-emerald-200 mt-1.5">
                              <span className="font-bold text-emerald-300 block mb-0.5">Teacher Reply:</span>
                              {cm.reply}
                            </div>
                          )}
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p className="text-xs text-slate-400 py-6 text-center">
                          No questions or comments posted yet.
                        </p>
                      )}
                    </div>

                    <form onSubmit={handleAddComment} className="pt-3 border-t border-white/10 flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask a question about this lecture..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="flex-1 p-2 rounded-xl bg-white/10 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-400"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold px-3 shrink-0 cursor-pointer"
                      >
                        Post
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 7: CLASS ATTENDANCE ROSTER & PARTICIPATION LOG               */}
      {/* =================================================================== */}
      <Modal
        isOpen={!!attendanceSlot}
        onClose={() => setAttendanceSlot(null)}
        title="Class Attendance & Participation Log"
        description={`Student check-in timestamps and duration records for "${attendanceSlot?.title || ""}"`}
      >
        {attendanceSlot && (
          <div className="space-y-4 pt-1">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0]">
                <p className="text-[10px] font-bold uppercase text-[#0d5c4d]">Enrolled</p>
                <p className="text-lg font-black text-[#0d2b26] mt-0.5">{attendanceSlot.enrolledCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-[10px] font-bold uppercase text-emerald-700">Attended</p>
                <p className="text-lg font-black text-emerald-900 mt-0.5">128 (90.1%)</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-600">On Time</p>
                <p className="text-lg font-black text-slate-800 mt-0.5">119</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-[10px] font-bold uppercase text-amber-700">Late Check-in</p>
                <p className="text-lg font-black text-amber-900 mt-0.5">9</p>
              </div>
            </div>

            {/* Filter & Export Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter student by name or index..."
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#0d5c4d]"
                />
              </div>
              <Button
                size="sm"
                onClick={() => handleExportAttendanceCSV(attendanceSlot)}
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold gap-1.5 shadow-2xs cursor-pointer shrink-0"
              >
                <Download className="h-3.5 w-3.5" /> Export Attendance CSV
              </Button>
            </div>

            {/* Attendance Records Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Index No</th>
                    <th className="py-2.5 px-3">Join Time</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessionAttendance
                    .filter((st) =>
                      !attendanceSearch.trim() ||
                      st.studentName.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
                      st.indexNo.toLowerCase().includes(attendanceSearch.toLowerCase())
                    )
                    .map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-900">{st.studentName}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{st.indexNo}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{st.joinTime}</td>
                        <td className="py-2 px-3 text-slate-600">{st.duration}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              st.status === "Present"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {sessionAttendance.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        No attendance records logged for this session.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAttendanceSlot(null)}
                className="text-xs font-bold"
              >
                Close Log
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
