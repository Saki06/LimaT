"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useStaff } from "@/context/AdminContext";
import { TimetableDay, TimetableEntry } from "@/types/lms";
import { Calendar, Clock3, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const DAYS: TimetableDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

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
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function dayOrder(day: TimetableDay) {
  return DAYS.indexOf(day);
}

export function TimetableView() {
  const {
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
  const [selectedDay, setSelectedDay] = useState<TimetableDay | "All">("All");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<TimetableEntry | null>(null);
  const [draft, setDraft] = useState<TimetableDraft>(EMPTY_DRAFT);

  const displayedEntries = useMemo(
    () => timetable
      .filter((entry) => selectedDay === "All" || entry.day === selectedDay)
      .sort((a, b) => dayOrder(a.day) - dayOrder(b.day) || a.startTime.localeCompare(b.startTime)),
    [selectedDay, timetable]
  );

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

  const saveEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (minutesFromTime(draft.endTime) <= minutesFromTime(draft.startTime)) {
      addToast({ type: "error", title: "Invalid period time", message: "The end time must be later than the start time." });
      return;
    }

    const selectedClass = classes.find((item) => item.id === draft.classId);
    const selectedSubject = subjects.find((item) => item.id === draft.subjectId);
    const selectedTeacher = teachers.find((item) => item.id === draft.teacherId);
    if (!selectedClass || !selectedSubject || !selectedTeacher) {
      addToast({ type: "error", title: "Incomplete timetable entry", message: "Choose a class, subject, and active teacher." });
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
      return entry.classId === draft.classId
        || entry.teacherId === draft.teacherId
        || (draft.room.trim() && entry.room.toLowerCase() === draft.room.trim().toLowerCase());
    });

    if (conflict) {
      const reason = conflict.classId === draft.classId
        ? `This class already has ${conflict.subjectName} at that time.`
        : conflict.teacherId === draft.teacherId
          ? `${selectedTeacher.name} is already scheduled at that time.`
          : `Room ${draft.room.trim()} is already booked at that time.`;
      addToast({ type: "error", title: "Schedule conflict", message: reason });
      return;
    }

    if (editingEntry) {
      updateTimetableEntry(editingEntry.id, proposedEntry);
    } else {
      createTimetableEntry(proposedEntry);
    }
    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 border-b border-[#e6ece8] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0d5c4d]">
            <Calendar className="h-4 w-4" /> Administrator · Academic Planning
          </div>
          <h1 className="mt-1 text-2xl font-black text-[#0d2b26]">Timetable Scheduling</h1>
          <p className="mt-1 text-xs text-slate-500">Create and manage class periods, teachers, and rooms.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Period
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-5 flex flex-wrap gap-2">
            <Button size="sm" variant={selectedDay === "All" ? "default" : "outline"} onClick={() => setSelectedDay("All")}>
              All days
            </Button>
            {DAYS.map((day) => (
              <Button key={day} size="sm" variant={selectedDay === day ? "default" : "outline"} onClick={() => setSelectedDay(day)}>
                {day}
              </Button>
            ))}
          </div>

          {displayedEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
              <Calendar className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-bold text-slate-700">No periods scheduled</p>
              <p className="mt-1 text-xs text-slate-500">Add a timetable period to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedEntries.map((entry) => (
                <div key={entry.id} className="flex flex-col gap-3 rounded-2xl border border-[#e6ece8] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="min-w-24 rounded-xl bg-[#ecf8f5] px-3 py-2 text-center text-xs font-bold text-[#0d5c4d]">
                      <p>{entry.day}</p>
                      <p className="mt-1 flex items-center justify-center gap-1 font-semibold">
                        <Clock3 className="h-3.5 w-3.5" />
                        {entry.startTime}–{entry.endTime}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-black text-[#0d2b26]">{entry.subjectName}</h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600"><Users className="h-3.5 w-3.5" />{entry.className} · {entry.teacherName}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{entry.room}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <Button type="button" variant="outline" size="sm" onClick={() => openEdit(entry)}><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => setEntryToDelete(entry)}><Trash2 className="mr-1.5 h-3.5 w-3.5" />Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingEntry ? "Edit timetable period" : "Add timetable period"}
        description="Choose a class, subject, active teacher, day, time, and room."
      >
        <form onSubmit={saveEntry} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Day
              <select required value={draft.day} onChange={(event) => setDraft({ ...draft, day: event.target.value as TimetableDay })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
                {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Class
              <select required value={draft.classId} onChange={(event) => setDraft({ ...draft, classId: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
                <option value="">Select class</option>
                {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Subject
              <select required value={draft.subjectId} onChange={(event) => setDraft({ ...draft, subjectId: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
                <option value="">Select subject</option>
                {subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Teacher
              <select required value={draft.teacherId} onChange={(event) => setDraft({ ...draft, teacherId: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
                <option value="">Select active teacher</option>
                {teachers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Start time
              <input required type="time" value={draft.startTime} onChange={(event) => setDraft({ ...draft, startTime: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              End time
              <input required type="time" value={draft.endTime} onChange={(event) => setDraft({ ...draft, endTime: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
              Room
              <input required value={draft.room} onChange={(event) => setDraft({ ...draft, room: event.target.value })} placeholder="e.g. Science Lab 2" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
            <Button type="submit">{editingEntry ? "Save Changes" : "Add Period"}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(entryToDelete)}
        onClose={() => setEntryToDelete(null)}
        title="Remove timetable period"
        description={`Remove ${entryToDelete?.subjectName ?? "this period"} from ${entryToDelete?.day ?? "the schedule"}?`}
        maxWidth="max-w-md"
      >
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setEntryToDelete(null)}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={() => {
            if (entryToDelete) deleteTimetableEntry(entryToDelete.id);
            setEntryToDelete(null);
          }}>Remove Period</Button>
        </div>
      </Modal>
    </div>
  );
}
