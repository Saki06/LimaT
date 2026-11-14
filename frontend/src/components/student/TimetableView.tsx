"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useStaff } from "@/context/AdminContext";
import { TimetableDay, TimetableEntry } from "@/types/lms";
import {
  Calendar,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users,
  Video,
  Printer,
  Sparkles,
  BookOpen,
  FlaskConical,
  GraduationCap,
  ExternalLink,
  RefreshCw,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  Search,
  School,
  Radio
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";

const DAYS: TimetableDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const DAY_TAMIL_NAMES: Record<TimetableDay, string> = {
  Monday: "திங்கட்கிழமை",
  Tuesday: "செவ்வாய்க்கிழமை",
  Wednesday: "புதன்கிழமை",
  Thursday: "வியாழக்கிழமை",
  Friday: "வெள்ளிக்கிழமை",
  Saturday: "சனிக்கிழமை",
  Sunday: "ஞாயிற்றுக்கிழமை"
};

type TimetableDraft = Omit<TimetableEntry, "id" | "className" | "subjectName" | "teacherName">;

const EMPTY_DRAFT: TimetableDraft = {
  day: "Monday",
  classId: "",
  subjectId: "",
  teacherId: "",
  startTime: "",
  endTime: "",
  room: ""
};

function minutesFromTime(time: string) {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function dayOrder(day: TimetableDay) {
  return DAYS.indexOf(day);
}

// Current day of week helper (Monday = 0 ... Sunday = 6)
function getTodayDayName(): TimetableDay {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday
  if (dayIndex === 0) return "Sunday";
  if (dayIndex === 1) return "Monday";
  if (dayIndex === 2) return "Tuesday";
  if (dayIndex === 3) return "Wednesday";
  if (dayIndex === 4) return "Thursday";
  if (dayIndex === 5) return "Friday";
  return "Saturday";
}

export function TimetableView() {
  const {
    currentRole,
    authUser,
    classes,
    subjects,
    timetable,
    createTimetableEntry,
    updateTimetableEntry,
    deleteTimetableEntry,
    addToast
  } = useApp();

  const staff = useStaff();
  const teachers = staff.filter((member) => member.role === "teacher" && member.status === "active");

  const todayName = useMemo(() => getTodayDayName(), []);
  const [selectedDay, setSelectedDay] = useState<TimetableDay | "All">(todayName);
  const [viewMode, setViewMode] = useState<"cards" | "grid">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backendEntries, setBackendEntries] = useState<TimetableEntry[]>([]);

  // Admin editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<TimetableEntry | null>(null);
  const [draft, setDraft] = useState<TimetableDraft>(EMPTY_DRAFT);

  const isAdmin = currentRole === "admin" || currentRole === "super_admin";

  const fetchTimetable = async () => {
    setIsLoading(true);
    try {
      const res = await api.students.getMyTimetable();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setBackendEntries(res.data);
      }
    } catch (err) {
      console.warn("Could not load backend student timetable:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const combinedTimetable = useMemo(() => {
    if (backendEntries.length === 0) return timetable;
    const existingIds = new Set(backendEntries.map((b) => b.id));
    return [...backendEntries, ...timetable.filter((t) => !existingIds.has(t.id))];
  }, [backendEntries, timetable]);

  const filteredEntries = useMemo(() => {
    return combinedTimetable
      .filter((entry) => {
        const matchesDay = selectedDay === "All" || entry.day === selectedDay;
        const matchesQuery =
          !searchQuery.trim() ||
          entry.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (entry.subjectCode && entry.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesDay && matchesQuery;
      })
      .sort((a, b) => dayOrder(a.day) - dayOrder(b.day) || a.startTime.localeCompare(b.startTime));
  }, [selectedDay, combinedTimetable, searchQuery]);

  // Find next upcoming or live class for today
  const nextClassAlert = useMemo(() => {
    const todayEntries = combinedTimetable
      .filter((e) => e.day === todayName)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (todayEntries.length === 0) return null;

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    // Check if one is live right now
    const liveNow = todayEntries.find((e) => {
      if (e.isLiveNow) return true;
      const start = minutesFromTime(e.startTime);
      const end = minutesFromTime(e.endTime);
      return currentMins >= start && currentMins <= end;
    });

    if (liveNow) {
      return {
        status: "LIVE_NOW" as const,
        entry: liveNow,
        label: "Happening Live Right Now (தற்போது நடைபெறுகிறது)",
      };
    }

    // Find next upcoming today
    const upcoming = todayEntries.find((e) => minutesFromTime(e.startTime) > currentMins);
    if (upcoming) {
      const diffMins = minutesFromTime(upcoming.startTime) - currentMins;
      const timeStr = diffMins > 60 ? `${Math.floor(diffMins / 60)}h ${diffMins % 60}m` : `${diffMins} minutes`;
      return {
        status: "UPCOMING" as const,
        entry: upcoming,
        label: `Starts in ${timeStr} · Today at ${upcoming.startTime}`,
      };
    }

    // Otherwise, first class of tomorrow or next day
    return {
      status: "COMPLETED" as const,
      entry: todayEntries[0],
      label: "All classes for today have ended",
    };
  }, [combinedTimetable, todayName]);

  // Counts by day
  const periodCountsByDay = useMemo(() => {
    const map: Record<string, number> = {};
    DAYS.forEach((d) => (map[d] = 0));
    combinedTimetable.forEach((e) => {
      if (map[e.day] !== undefined) map[e.day]++;
    });
    return map;
  }, [combinedTimetable]);

  // Stats
  const totalPeriods = combinedTimetable.length;
  const todayClassesCount = periodCountsByDay[todayName] || 0;
  const uniqueTutorsCount = new Set(combinedTimetable.map((e) => e.teacherName)).size;
  const liveSessionsCount = combinedTimetable.filter((e) => e.periodType === "MASTERCLASS" || e.meetingUrl).length;

  const handlePrint = () => {
    window.print();
  };

  // Admin handlers
  const openCreate = () => {
    setEditingEntry(null);
    setDraft({ ...EMPTY_DRAFT });
    setIsEditorOpen(true);
  };

  const openEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setDraft({
      day: entry.day,
      classId: entry.classId,
      subjectId: entry.subjectId,
      teacherId: entry.teacherId,
      startTime: entry.startTime,
      endTime: entry.endTime,
      room: entry.room
    });
    setIsEditorOpen(true);
  };

  const saveEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (minutesFromTime(draft.endTime) <= minutesFromTime(draft.startTime)) {
      addToast({
        type: "error",
        title: "Invalid period time",
        message: "The end time must be later than the start time."
      });
      return;
    }

    const selectedClass = classes.find((item) => item.id === draft.classId);
    const selectedSubject = subjects.find((item) => item.id === draft.subjectId);
    const selectedTeacher = teachers.find((item) => item.id === draft.teacherId);
    if (!selectedClass || !selectedSubject || !selectedTeacher) {
      addToast({
        type: "error",
        title: "Incomplete timetable entry",
        message: "Choose a class, subject, and active teacher."
      });
      return;
    }

    const proposedEntry: Omit<TimetableEntry, "id"> = {
      ...draft,
      className: selectedClass.name,
      subjectName: selectedSubject.name,
      teacherName: selectedTeacher.name,
      room: draft.room.trim()
    };
    const start = minutesFromTime(draft.startTime);
    const end = minutesFromTime(draft.endTime);
    const conflict = timetable.find((entry) => {
      if (entry.id === editingEntry?.id || entry.day !== draft.day) return false;
      const overlaps = start < minutesFromTime(entry.endTime) && end > minutesFromTime(entry.startTime);
      if (!overlaps) return false;
      return (
        entry.classId === draft.classId ||
        entry.teacherId === draft.teacherId ||
        (draft.room.trim() && entry.room.toLowerCase() === draft.room.trim().toLowerCase())
      );
    });

    if (conflict) {
      const reason =
        conflict.classId === draft.classId
          ? `This class already has ${conflict.subjectName} at that time.`
          : conflict.teacherId === draft.teacherId
          ? `${selectedTeacher.name} is already scheduled at that time.`
          : `Room ${draft.room.trim()} is already booked at that time.`;
      addToast({ type: "error", title: "Schedule conflict", message: reason });
      return;
    }

    if (editingEntry) {
      await updateTimetableEntry(editingEntry.id, proposedEntry);
    } else {
      await createTimetableEntry(proposedEntry);
    }
    setIsEditorOpen(false);
  };

  const getPeriodBadge = (type?: string) => {
    switch (type) {
      case "MASTERCLASS":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/30",
          icon: Sparkles,
          label: "Masterclass (நேரலை)",
        };
      case "LAB":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          icon: FlaskConical,
          label: "Practical Lab (ஆய்வுகூடம்)",
        };
      case "TUTORIAL":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: Users,
          label: "Tutorial Seminar (பயிற்சி)",
        };
      case "LECTURE":
      default:
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          icon: BookOpen,
          label: "Theory Lecture (விரிவுரை)",
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Printable Header - Visible ONLY during print */}
      <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4 text-center">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
          Official Academic Timetable · வாராந்த வகுப்பு நேர அட்டவணை
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Student: {authUser?.firstName ? `${authUser.firstName} ${authUser.lastName || ""}` : (authUser?.name || "Enrolled Student")} · Academic Term 2026/2027
        </p>
        <p className="text-[11px] text-slate-500">
          Generated on {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Hero Header Cockpit */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#082a24] via-[#0d4a3e] to-[#0a3830] p-6 lg:p-8 text-white shadow-xl shadow-emerald-950/20 print:hidden">
        {/* Ambient subtle glow background */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md border border-white/15">
              <Calendar className="h-3.5 w-3.5 text-emerald-300" />
              <span>Academic Timetable · வகுப்பு நேர அட்டவணை</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span className="text-emerald-300 font-bold">2026/2027 Term 3</span>
            </div>

            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl text-white">
              Student Weekly Timetable
            </h1>
            <p className="mt-1 text-sm text-emerald-100/90 leading-relaxed">
              திங்கள் முதல் ஞாயிறு வரையிலான உங்கள் பிரத்தியேக வகுப்பு, ஆய்வுகூடம் மற்றும் நேரலை மாஸ்டர்கிளாஸ் நேர அட்டவணை.
            </p>

            {/* Quick Metrics Bar */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <p className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-medium">Weekly Periods</p>
                <p className="text-xl font-black text-white mt-0.5">{totalPeriods} <span className="text-xs font-normal text-emerald-200">Classes</span></p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <p className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-medium">Today's Routine</p>
                <p className="text-xl font-black text-emerald-300 mt-0.5">{todayClassesCount} <span className="text-xs font-normal text-white">Periods</span></p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <p className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-medium">Specialist Tutors</p>
                <p className="text-xl font-black text-white mt-0.5">{uniqueTutorsCount} <span className="text-xs font-normal text-emerald-200">Faculty</span></p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <p className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-medium">Live Masterclasses</p>
                <p className="text-xl font-black text-amber-300 mt-0.5">{liveSessionsCount} <span className="text-xs font-normal text-emerald-200">Interactive</span></p>
              </div>
            </div>
          </div>

          {/* Action Buttons & Quick Controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md gap-2 rounded-xl text-xs font-bold"
            >
              <Printer className="h-4 w-4 text-emerald-300" />
              <span>Print Timetable</span>
            </Button>

            <Button
              onClick={fetchTimetable}
              disabled={isLoading}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md gap-2 rounded-xl text-xs font-bold"
            >
              <RefreshCw className={`h-4 w-4 text-emerald-300 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            {isAdmin && (
              <Button
                onClick={openCreate}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black gap-2 rounded-xl shadow-lg shadow-emerald-500/20 text-xs"
              >
                <Plus className="h-4 w-4" /> Add Period
              </Button>
            )}
          </div>
        </div>

        {/* Next Period Alert Strip */}
        {nextClassAlert && (
          <div className="mt-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  nextClassAlert.status === "LIVE_NOW"
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-emerald-400/20 text-emerald-300"
                }`}
              >
                {nextClassAlert.status === "LIVE_NOW" ? (
                  <Radio className="h-5 w-5" />
                ) : (
                  <Clock3 className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      nextClassAlert.status === "LIVE_NOW"
                        ? "bg-rose-500/30 text-rose-200 border border-rose-400/40"
                        : "bg-emerald-400/20 text-emerald-200"
                    }`}
                  >
                    {nextClassAlert.label}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {nextClassAlert.entry.subjectName} ({nextClassAlert.entry.subjectCode || "CORE"}) · {nextClassAlert.entry.startTime} – {nextClassAlert.entry.endTime}
                </h3>
                <p className="text-xs text-emerald-200/80">
                  {nextClassAlert.entry.teacherName} · {nextClassAlert.entry.room}
                </p>
              </div>
            </div>

            {nextClassAlert.entry.meetingUrl && (
              <a
                href={nextClassAlert.entry.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-2 text-xs font-bold text-slate-950 hover:brightness-110 shadow-md transition-all shrink-0"
              >
                <Video className="h-3.5 w-3.5" />
                <span>Join Classroom</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Main Schedule Container */}
      <Card className="rounded-3xl border border-[#e6ece8] shadow-sm bg-white overflow-hidden print:border-none print:shadow-none">
        <CardHeader className="border-b border-[#e6ece8] bg-[#fbfcfb] p-5 sm:p-6 print:hidden">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Day Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedDay("All")}
                className={`rounded-2xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedDay === "All"
                    ? "bg-[#0d5c4d] text-white shadow-md shadow-emerald-900/10"
                    : "bg-[#f4f7f5] text-slate-600 hover:bg-[#e6ece8]"
                }`}
              >
                <span>All Days (முழு வாரம்)</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-bold">
                  {totalPeriods}
                </span>
              </button>

              {DAYS.map((day) => {
                const count = periodCountsByDay[day] || 0;
                const isToday = day === todayName;
                const isSelected = selectedDay === day;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`relative rounded-2xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#0d5c4d] text-white shadow-md shadow-emerald-900/10"
                        : isToday
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100/70"
                        : "bg-[#f4f7f5] text-slate-600 hover:bg-[#e6ece8]"
                    }`}
                  >
                    <span>{day.slice(0, 3)}</span>
                    {isToday && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    )}
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* View Mode Toggle & Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter subjects, tutors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-44 sm:w-56 rounded-xl border border-slate-200 pl-8 pr-3 text-xs focus:border-[#0d5c4d] focus:outline-none focus:ring-1 focus:ring-[#0d5c4d]"
                />
              </div>

              <div className="flex items-center rounded-xl bg-[#f4f7f5] p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "cards" ? "bg-white text-[#0d5c4d] shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Card list view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "grid" ? "bg-white text-[#0d5c4d] shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Full week time-grid"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          {/* Active Day Banner */}
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-[#0d2b26] flex items-center gap-2">
                {selectedDay === "All" ? "All Weekly Scheduled Periods" : `${selectedDay} (${DAY_TAMIL_NAMES[selectedDay]})`}
                {selectedDay === todayName && (
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 border border-emerald-300">
                    Today · இன்று
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredEntries.length} confirmed academic period{filteredEntries.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* Empty State */}
          {filteredEntries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-800">No scheduled periods for {selectedDay}</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                No classes match your current filter. Enjoy your study review and revision hours!
              </p>
              {isAdmin && (
                <Button onClick={openCreate} size="sm" className="mt-4 gap-1.5 rounded-xl bg-[#0d5c4d] hover:bg-[#094237] text-white">
                  <Plus className="h-3.5 w-3.5" /> Schedule Period
                </Button>
              )}
            </div>
          ) : viewMode === "cards" ? (
            /* Cards / Detailed Schedule View */
            <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-1">
              {filteredEntries.map((entry) => {
                const badge = getPeriodBadge(entry.periodType);
                const BadgeIcon = badge.icon;
                const isEntryLive = entry.isLiveNow;

                return (
                  <div
                    key={entry.id}
                    className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all hover:shadow-md ${
                      isEntryLive
                        ? "border-emerald-300 bg-gradient-to-r from-emerald-50/60 to-white ring-1 ring-emerald-300"
                        : "border-[#e6ece8] bg-white hover:border-[#0d5c4d]/30"
                    }`}
                  >
                    {/* Time Slot Badge & Day Info */}
                    <div className="flex items-start gap-4">
                      <div className="flex min-w-[110px] flex-col items-center justify-center rounded-2xl bg-[#f4f7f5] p-3 text-center border border-slate-200/80 group-hover:bg-[#ecf8f5] group-hover:border-emerald-200 transition-colors">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#0d5c4d]">
                          {entry.day}
                        </span>
                        <div className="mt-1 flex items-center gap-1 text-xs font-black text-slate-800">
                          <Clock3 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{entry.startTime}</span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500">to {entry.endTime}</span>
                      </div>

                      {/* Period Details */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${badge.bg}`}>
                            <BadgeIcon className="h-3 w-3" />
                            {badge.label}
                          </span>
                          {entry.subjectCode && (
                            <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-mono font-bold">
                              {entry.subjectCode}
                            </span>
                          )}
                          {isEntryLive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 text-white px-2 py-0.5 text-[10px] font-bold animate-pulse">
                              <Radio className="h-3 w-3" /> LIVE NOW
                            </span>
                          )}
                        </div>

                        <h3 className="mt-1.5 text-base font-black text-[#0d2b26] tracking-tight">
                          {entry.subjectName}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{entry.teacherName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span>{entry.room}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium text-slate-500">
                            <School className="h-3.5 w-3.5 text-slate-400" />
                            <span>{entry.className}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 print:hidden">
                      {entry.meetingUrl && (
                        <a
                          href={entry.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0d5c4d] hover:bg-[#0a463b] text-white px-3.5 py-2 text-xs font-bold transition-all shadow-sm"
                        >
                          <Video className="h-3.5 w-3.5 text-emerald-200" />
                          <span>Join Session</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}

                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(entry)}
                            className="h-8 rounded-xl px-2.5 text-xs text-slate-600"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setEntryToDelete(entry)}
                            className="h-8 rounded-xl px-2.5 text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Matrix / 7-Day Time-Grid View */
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#f8faf9] text-xs font-bold text-slate-700">
                    <th className="p-3 w-28 border-r border-slate-200">Day (நாள்)</th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${
                          day === todayName ? "bg-emerald-50 text-emerald-900" : ""
                        }`}
                      >
                        <div>{day}</div>
                        <div className="text-[10px] font-normal text-slate-500">{DAY_TAMIL_NAMES[day]}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {/* Slots row: Morning, Midday, Afternoon */}
                  {["08:30 – 10:30", "10:30 – 12:30", "13:30 – 15:30", "16:00 – 18:00"].map((slotLabel) => {
                    const [slotStart] = slotLabel.split(" – ");
                    const slotMins = minutesFromTime(slotStart);

                    return (
                      <tr key={slotLabel} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-600 bg-[#fbfcfb] border-r border-slate-200 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                            {slotLabel}
                          </div>
                        </td>

                        {DAYS.map((day) => {
                          const periodsInSlot = combinedTimetable.filter((e) => {
                            if (e.day !== day) return false;
                            const eStart = minutesFromTime(e.startTime);
                            return Math.abs(eStart - slotMins) <= 60; // within 1 hr of slot window
                          });

                          return (
                            <td
                              key={`${day}-${slotLabel}`}
                              className={`p-2 align-top border-r border-slate-100 last:border-r-0 min-h-[90px] ${
                                day === todayName ? "bg-emerald-50/30" : ""
                              }`}
                            >
                              {periodsInSlot.length > 0 ? (
                                <div className="space-y-1.5">
                                  {periodsInSlot.map((p) => {
                                    const badge = getPeriodBadge(p.periodType);
                                    return (
                                      <div
                                        key={p.id}
                                        className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm hover:border-emerald-300 transition-colors"
                                      >
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="text-[9px] font-bold uppercase text-emerald-800 bg-emerald-50 px-1 rounded">
                                            {p.startTime}
                                          </span>
                                          {p.isLiveNow && (
                                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                                          )}
                                        </div>
                                        <p className="font-bold text-[#0d2b26] text-[11px] mt-1 line-clamp-1">
                                          {p.subjectName}
                                        </p>
                                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                          {p.teacherName}
                                        </p>
                                        <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                                          <MapPin className="h-2.5 w-2.5" />
                                          <span className="truncate">{p.room}</span>
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="h-full min-h-[50px] flex items-center justify-center text-slate-300 text-[11px]">
                                  —
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Period Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingEntry ? "Edit Timetable Period" : "Add Timetable Period"}
        description="Choose a class, subject, active teacher, day, time, and room."
      >
        <form onSubmit={saveEntry} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Day
              <select
                required
                value={draft.day}
                onChange={(event) => setDraft({ ...draft, day: event.target.value as TimetableDay })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day} ({DAY_TAMIL_NAMES[day]})
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Class Cohort
              <select
                required
                value={draft.classId}
                onChange={(event) => setDraft({ ...draft, classId: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              >
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Subject
              <select
                required
                value={draft.subjectId}
                onChange={(event) => setDraft({ ...draft, subjectId: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              >
                <option value="">Select subject</option>
                {subjects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Teacher / Specialist Tutor
              <select
                required
                value={draft.teacherId}
                onChange={(event) => setDraft({ ...draft, teacherId: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              >
                <option value="">Select active teacher</option>
                {teachers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Start Time
              <input
                required
                type="time"
                value={draft.startTime}
                onChange={(event) => setDraft({ ...draft, startTime: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </label>

            <label className="text-sm font-semibold text-slate-700">
              End Time
              <input
                required
                type="time"
                value={draft.endTime}
                onChange={(event) => setDraft({ ...draft, endTime: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </label>

            <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
              Room / Laboratory / Studio
              <input
                required
                value={draft.room}
                onChange={(event) => setDraft({ ...draft, room: event.target.value })}
                placeholder="e.g. Science Lab 02 / Lecture Theatre 1"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsEditorOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl bg-[#0d5c4d] hover:bg-[#0a463b] text-white">
              {editingEntry ? "Save Changes" : "Add Period"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Admin Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(entryToDelete)}
        onClose={() => setEntryToDelete(null)}
        title="Remove Timetable Period"
        description={`Remove ${entryToDelete?.subjectName ?? "this period"} from ${entryToDelete?.day ?? "the schedule"}?`}
        maxWidth="max-w-md"
      >
        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" variant="outline" onClick={() => setEntryToDelete(null)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl"
            onClick={() => {
              if (entryToDelete) deleteTimetableEntry(entryToDelete.id);
              setEntryToDelete(null);
            }}
          >
            Remove Period
          </Button>
        </div>
      </Modal>
    </div>
  );
}
