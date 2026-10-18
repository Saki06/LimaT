"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
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
  Laptop
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
  platform: "Google Meet" | "Zoom" | "Microsoft Teams" | "YouTube Live";
  meetingUrl: string;
  meetingId?: string;
  passcode?: string;
  type: string;
  enrolledCount: number;
  status: "scheduled" | "live_now" | "completed";
}

const INITIAL_SLOTS: LiveSlot[] = [
  {
    id: "slot-1",
    title: "Pure Mathematics: Calculus & Limits Derivations",
    subject: "Combined Mathematics",
    grade: "Grade 12 & 13",
    day: "Tuesday",
    startTime: "07:00 PM",
    endTime: "09:00 PM",
    platform: "Google Meet",
    meetingUrl: "https://meet.google.com/sam-math-live",
    meetingId: "sam-math-live",
    passcode: "MATH2026",
    type: "Live Masterclass + Q&A",
    enrolledCount: 142,
    status: "scheduled"
  },
  {
    id: "slot-2",
    title: "Applied Mathematics: Newton's Laws, Friction & Work-Energy",
    subject: "Combined Mathematics",
    grade: "Grade 12 & 13",
    day: "Thursday",
    startTime: "07:00 PM",
    endTime: "09:00 PM",
    platform: "Google Meet",
    meetingUrl: "https://meet.google.com/sam-math-live",
    meetingId: "sam-math-live",
    passcode: "PHYS2026",
    type: "Problem Solving Lab",
    enrolledCount: 142,
    status: "scheduled"
  },
  {
    id: "slot-3",
    title: "A/L Past Paper 2025 Model Examination Breakdown",
    subject: "Combined Mathematics",
    grade: "Grade 13 Revision",
    day: "Saturday",
    startTime: "09:00 AM",
    endTime: "11:30 AM",
    platform: "Zoom",
    meetingUrl: "https://zoom.us/j/9876543210",
    meetingId: "987 654 3210",
    passcode: "AL2026",
    type: "Paper Marking Session",
    enrolledCount: 142,
    status: "scheduled"
  },
  {
    id: "slot-4",
    title: "Trigonometry Deep Dive & Complex Numbers",
    subject: "Combined Mathematics",
    grade: "Grade 12",
    day: "Sunday",
    startTime: "04:00 PM",
    endTime: "06:00 PM",
    platform: "Google Meet",
    meetingUrl: "https://meet.google.com/sam-math-live",
    meetingId: "sam-math-live",
    passcode: "TRIG2026",
    type: "Special Concept Booster",
    enrolledCount: 98,
    status: "scheduled"
  }
];

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
  const { currentUser, t } = useApp();

  const [slots, setSlots] = useState<LiveSlot[]>(INITIAL_SLOTS);
  const [selectedDay, setSelectedDay] = useState<string>("All Days");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
    platform: "Google Meet",
    meetingUrl: "https://meet.google.com/sam-math-live",
    meetingId: "sam-math-live",
    passcode: "MATH2026",
    type: "Live Masterclass + Q&A",
    enrolledCount: 142,
    status: "scheduled"
  });

  // Delete Confirmation Modal
  const [deletingSlot, setDeletingSlot] = useState<LiveSlot | null>(null);

  // Broadcast Alert Modal
  const [broadcastingSlot, setBroadcastingSlot] = useState<LiveSlot | null>(null);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingSlotId(null);
    setFormData({
      title: "",
      subject: "Combined Mathematics",
      grade: "Grade 12 & 13",
      day: selectedDay !== "All Days" ? (selectedDay as LiveSlot["day"]) : "Tuesday",
      startTime: "07:00 PM",
      endTime: "09:00 PM",
      platform: "Google Meet",
      meetingUrl: "https://meet.google.com/sam-math-live",
      meetingId: "sam-math-live",
      passcode: "MATH2026",
      type: "Live Masterclass + Q&A",
      enrolledCount: 142,
      status: "scheduled"
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
      status: slot.status
    });
    setIsModalOpen(true);
  };

  // Save Slot (Add or Edit)
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Please enter a class topic / title.");
      return;
    }

    if (editingSlotId) {
      setSlots((prev) =>
        prev.map((s) => (s.id === editingSlotId ? { ...formData, id: editingSlotId } : s))
      );
      showToast(`Updated live class: "${formData.title}"`);
    } else {
      const newSlot: LiveSlot = {
        ...formData,
        id: `slot-${Date.now()}`
      };
      setSlots((prev) => [newSlot, ...prev]);
      showToast(`Added new live class: "${formData.title}"`);
    }

    setIsModalOpen(false);
  };

  // Delete Slot
  const handleConfirmDelete = () => {
    if (!deletingSlot) return;
    setSlots((prev) => prev.filter((s) => s.id !== deletingSlot.id));
    showToast(`Deleted live slot: "${deletingSlot.title}"`);
    setDeletingSlot(null);
  };

  // Copy Link
  const handleCopyLink = (url: string, title: string) => {
    navigator.clipboard?.writeText(url);
    showToast(`Live meeting link for "${title}" copied to clipboard!`);
  };

  // Send Broadcast Alert
  const handleSendBroadcast = () => {
    if (!broadcastingSlot) return;
    showToast(
      `Live Class Reminder broadcast sent to ${broadcastingSlot.enrolledCount} enrolled students via SMS & In-App Notification!`
    );
    setBroadcastingSlot(null);
  };

  // Filtered Slots
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchesDay = selectedDay === "All Days" || slot.day === selectedDay;
      const matchesQuery =
        !searchQuery.trim() ||
        slot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDay && matchesQuery;
    });
  }, [slots, selectedDay, searchQuery]);

  // Statistics
  const totalWeeklyHours = slots.length * 2; // approximation
  const totalEnrolled = 142;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#0d5c4d] text-white shadow-2xl flex items-center gap-3 border border-[#a5f3df] animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-5 w-5 text-[#a5f3df] shrink-0" />
          <div className="text-xs">
            <p className="font-extrabold text-sm">Live Studio</p>
            <p className="text-slate-100">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/20 rounded-lg text-white/80 cursor-pointer ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Banner: Live Broadcast Management */}
      <Card className="border-[#c4e9e0] bg-gradient-to-br from-[#f8fbf9] via-white to-[#ecf8f5] shadow-2xs overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#0d5c4d] text-white text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                  Teaching Studio &bull; Live Broadcasts
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Weekly Masterclass Schedule
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0d2b26] tracking-tight">
                Live Classes &amp; Broadcast Schedule
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                Schedule and coordinate weekly live interactive lectures for Grade 12 &amp; 13 Combined Mathematics. Launch your virtual lecture hall, share meeting links, and broadcast instant class alerts to enrolled students.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={handleOpenAdd}
                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-sm shadow-md px-5 py-5 rounded-2xl flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <Plus className="h-5 w-5" />
                <span>+ Schedule Live Class</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#e6ece8] bg-white shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Scheduled Live Classes</p>
              <p className="text-2xl font-black text-[#0d2b26] mt-1">{slots.length} Slots</p>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">~{totalWeeklyHours} hrs weekly broadcast</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e6ece8] bg-white shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Enrolled Live Batch</p>
              <p className="text-2xl font-black text-[#0d5c4d] mt-1">{totalEnrolled} Students</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Active Connect subscribers</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e6ece8] bg-white shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Next Upcoming Live</p>
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
              <p className="text-xs text-slate-500 font-semibold">Virtual Studio Setup</p>
              <p className="text-2xl font-black text-[#0d2b26] mt-1">Google Meet</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">HD 1080p recording ready</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center">
              <Radio className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permanent Faculty Live Room Card */}
      <Card className="border-[#c4e9e0] bg-gradient-to-r from-[#0d5c4d] to-[#083e34] text-white shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-200 font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-400/30">
                  Permanent Faculty Meeting Link
                </span>
                <span className="text-xs text-emerald-100/70">Always active for your students</span>
              </div>
              <p className="text-sm font-mono font-bold text-white truncate max-w-md">
                https://meet.google.com/sam-math-live
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                onClick={() => handleCopyLink("https://meet.google.com/sam-math-live", "Faculty Room")}
                variant="outline"
                className="border-emerald-300/40 text-emerald-100 hover:bg-white/10 text-xs font-bold bg-white/5"
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Permanent Link
              </Button>
              <a
                href="https://meet.google.com/sam-math-live"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 rounded-xl bg-white text-[#0d5c4d] hover:bg-emerald-50 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Video className="h-4 w-4" /> Start Live ↗
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#c4e9e0] shadow-xs">
        {/* Day Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedDay === day
                  ? "bg-[#0d5c4d] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search classes or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#0d5c4d] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Live Class Slots Grid / List */}
      <div className="space-y-4">
        {filteredSlots.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-300 bg-slate-50/50 p-12 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No scheduled classes found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              There are no live classes matching the selected day or search filter. Click "+ Schedule Live Class" to create one.
            </p>
            <Button
              onClick={handleOpenAdd}
              size="sm"
              className="mt-4 bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs"
            >
              <Plus className="h-4 w-4 mr-1" /> Add New Slot
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSlots.map((slot) => (
              <Card
                key={slot.id}
                className="border-[#e6ece8] hover:border-[#a5f3df] transition-all bg-white shadow-2xs hover:shadow-md rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Slot Header */}
                  <CardHeader className="p-5 pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/70 to-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-[#0d5c4d] text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md">
                            {slot.day}
                          </Badge>
                          <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Clock className="h-3 w-3 text-[#0d5c4d]" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-800 bg-[#ecf8f5] px-2 py-0.5 rounded-md border border-[#c4e9e0]">
                            {slot.platform}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-[#0d2b26] mt-1.5 leading-snug">
                          {slot.title}
                        </h3>
                      </div>

                      {/* Options menu / edit */}
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
                    </div>
                  </CardHeader>

                  {/* Slot Details Body */}
                  <CardContent className="p-5 space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Subject &amp; Grade</p>
                        <p className="font-bold text-slate-800 mt-0.5">{slot.subject}</p>
                        <p className="text-[11px] text-slate-500">{slot.grade}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Format &amp; Audience</p>
                        <p className="font-bold text-slate-800 mt-0.5">{slot.type}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Users className="h-3 w-3" /> {slot.enrolledCount} Students Enrolled
                        </p>
                      </div>
                    </div>

                    {/* Meeting Link Bar */}
                    <div className="p-3 rounded-xl bg-[#ecf8f5]/60 border border-[#c4e9e0] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#0d5c4d] flex items-center gap-1">
                          <LinkIcon className="h-3 w-3" /> Virtual Classroom Room URL:
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
                  </CardContent>
                </div>

                {/* Slot Footer Action Controls */}
                <div className="p-4 pt-0 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/40">
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(slot.meetingUrl, slot.title)}
                      className="border-slate-300 text-slate-700 hover:bg-white text-xs font-bold cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copy Link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setBroadcastingSlot(slot)}
                      className="border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-bold cursor-pointer"
                      title="Send SMS & In-App notification to enrolled students"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" /> Broadcast Alert
                    </Button>
                  </div>

                  <a
                    href={slot.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-4 rounded-xl bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Video className="h-3.5 w-3.5" /> Start Live ↗
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: ADD / EDIT LIVE CLASS SLOT                                 */}
      {/* =================================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSlotId ? "Edit Live Class Slot" : "Schedule New Live Class"}
        description="Set up the day, time, curriculum topic, and virtual classroom meeting room for this live broadcast."
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-[#0d5c4d]"
              >
                <option value="Combined Mathematics">Combined Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Information Technology">Information Technology</option>
                <option value="General English">General English</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Level</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-[#0d5c4d]"
              >
                <option value="Grade 12 & 13">Grade 12 &amp; 13</option>
                <option value="Grade 12 (Theory)">Grade 12 (Theory)</option>
                <option value="Grade 13 (Revision)">Grade 13 (Revision)</option>
                <option value="A/L Paper Class">A/L Paper Class</option>
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

          {/* Format & Platform */}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value as LiveSlot["platform"] })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-[#0d5c4d]"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="YouTube Live">YouTube Live</option>
              </select>
            </div>
          </div>

          {/* Meeting URL & Passcode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Meeting URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://meet.google.com/sam-math-live"
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
                placeholder="sam-math-live"
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
      {/* MODAL 2: DELETE CONFIRMATION                                        */}
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
                {deletingSlot.day} &bull; {deletingSlot.startTime} - {deletingSlot.endTime} &bull; {deletingSlot.subject}
              </p>
              <p className="text-[11px] text-rose-700 pt-1">
                Note: Enrolled students ({deletingSlot.enrolledCount}) will no longer see this slot on their schedule.
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
      {/* MODAL 3: BROADCAST ALERT MODAL                                      */}
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
                &ldquo;Reminder: Combined Maths Live Class &lsquo;{broadcastingSlot.title}&rsquo; starts {broadcastingSlot.day} at {broadcastingSlot.startTime}. Join link: {broadcastingSlot.meetingUrl}&rdquo;
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
    </div>
  );
}
