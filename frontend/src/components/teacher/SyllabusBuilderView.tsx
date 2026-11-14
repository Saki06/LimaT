"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Layers,
  BookOpen,
  Plus,
  FolderPlus,
  FilePlus,
  ChevronDown,
  ChevronRight,
  FileText,
  FileUp,
  Presentation,
  Video,
  Trash2,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
  ExternalLink,
  UploadCloud,
  X,
  Link2,
  Paperclip,
  Edit3,
  Loader2,
  Eye,
  Copy,
  Download,
  ChevronLeft,
  PlayCircle,
  Printer,
  Maximize2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Course, SyllabusUnit, Topic, Lesson } from "@/types/lms";

export function SyllabusBuilderView() {
  const {
    courses,
    selectedCourseId,
    setSelectedCourseId,
    createCourse,
    createUnit,
    updateUnit,
    createTopic,
    updateTopic,
    deleteUnit,
    deleteTopic,
    createLesson,
    updateLesson,
    deleteLesson,
    syncCourseSyllabus,
    addToast,
    currentUser,
    currentRole
  } = useApp();

  // If viewed by an individual teacher, show only their assigned batches
  const visibleCourses = useMemo(() => {
    if (currentRole === "teacher") {
      const filtered = courses.filter(
        (c) =>
          (c.teacherId && currentUser?.id && c.teacherId === currentUser.id) ||
          (c.teacherName && currentUser?.name && c.teacherName.toLowerCase() === currentUser.name.toLowerCase()) ||
          (!c.teacherId && !c.teacherName)
      );
      return filtered.length > 0 ? filtered : courses;
    }
    return courses;
  }, [courses, currentRole, currentUser]);

  const [activeCourseId, setActiveCourseId] = useState<string>(
    selectedCourseId || visibleCourses[0]?.id || ""
  );

  useEffect(() => {
    if (selectedCourseId && visibleCourses.some((c) => c.id === selectedCourseId)) {
      setActiveCourseId(selectedCourseId);
    } else if (!visibleCourses.some((c) => c.id === activeCourseId) && visibleCourses.length > 0) {
      setActiveCourseId(visibleCourses[0].id);
    }
  }, [selectedCourseId, visibleCourses, activeCourseId]);

  const activeCourse = visibleCourses.find((c) => c.id === activeCourseId) || visibleCourses[0];

  // Course creation modal state
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseGrade, setNewCourseGrade] = useState("");
  const [newCourseSubject, setNewCourseSubject] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  const handleCreateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;
    setIsCreatingCourse(true);
    const cleanTitle = newCourseTitle.trim();
    const cleanGrade = newCourseGrade.trim() || "General Batch";
    const cleanSubject = newCourseSubject.trim() || "Masterclass";
    const code =
      newCourseCode.trim().toUpperCase() ||
      `${cleanTitle.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase() || "CRS"}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      const res = await createCourse({
        title: cleanTitle,
        code,
        description: newCourseDescription.trim() || `${cleanSubject} • ${cleanGrade}`,
      });
      if (res.success) {
        setIsCreateCourseModalOpen(false);
        setNewCourseTitle("");
        setNewCourseCode("");
        setNewCourseGrade("");
        setNewCourseSubject("");
        setNewCourseDescription("");
      }
    } finally {
      setIsCreatingCourse(false);
    }
  };

  // Accordion state for expanded units
  const [expandedUnitIds, setExpandedUnitIds] = useState<Record<string, boolean>>({
    [activeCourse?.units?.[0]?.id || ""]: true
  });

  const toggleUnit = (unitId: string) => {
    setExpandedUnitIds((prev) => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncSyllabus = async () => {
    if (!activeCourse) return;
    setIsSyncing(true);
    try {
      await syncCourseSyllabus(activeCourse.id);
      addToast({
        type: "success",
        title: "Syllabus Saved to Cloud",
        message: `${activeCourse.title} units & lessons are synchronized with server database.`
      });
    } catch (e) {
      addToast({
        type: "error",
        title: "Cloud Sync Failed",
        message: "Unable to sync syllabus to server."
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Modals state
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState("");

  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [targetUnitIdForTopic, setTargetUnitIdForTopic] = useState("");
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicDesc, setNewTopicDesc] = useState("");

  // Add Lesson Modal state
  const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);
  const [lessonTargetUnitId, setLessonTargetUnitId] = useState("");
  const [lessonTargetTopicId, setLessonTargetTopicId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonContentType, setLessonContentType] = useState<"pdf" | "slides" | "video" | "rich_text">("pdf");
  const [lessonBody, setLessonBody] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonVideoDuration, setLessonVideoDuration] = useState("45 mins");
  const [lessonSlidesCount, setLessonSlidesCount] = useState<number>(10);
  const [uploadedMainFile, setUploadedMainFile] = useState<{ name: string; size: string; type: string; url?: string } | null>(null);
  const [supplementaryFiles, setSupplementaryFiles] = useState<{ name: string; size: string; type: string; url?: string }[]>([]);

  // Edit Unit Modal state
  const [isEditUnitModalOpen, setIsEditUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<{ id: string; title: string } | null>(null);

  // Edit Topic Modal state
  const [isEditTopicModalOpen, setIsEditTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<{ unitId: string; id: string; title: string; description: string } | null>(null);

  // Edit Lesson Modal state (Rich Multi-Format)
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [editLessonSourceUnitId, setEditLessonSourceUnitId] = useState("");
  const [editLessonSourceTopicId, setEditLessonSourceTopicId] = useState("");
  const [editLessonTargetUnitId, setEditLessonTargetUnitId] = useState("");
  const [editLessonTargetTopicId, setEditLessonTargetTopicId] = useState("");
  const [editLessonId, setEditLessonId] = useState("");
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [editLessonDescription, setEditLessonDescription] = useState("");
  const [editLessonContentType, setEditLessonContentType] = useState<"pdf" | "slides" | "video" | "rich_text">("pdf");
  const [editLessonBody, setEditLessonBody] = useState("");
  const [editLessonVideoUrl, setEditLessonVideoUrl] = useState("");
  const [editLessonVideoDuration, setEditLessonVideoDuration] = useState("45 mins");
  const [editLessonSlidesCount, setEditLessonSlidesCount] = useState<number>(10);
  const [editUploadedMainFile, setEditUploadedMainFile] = useState<{ name: string; size: string; type: string; url?: string } | null>(null);
  const [editSupplementaryFiles, setEditSupplementaryFiles] = useState<{ name: string; size: string; type: string; url?: string }[]>([]);

  // View Lesson modal state
  const [viewingLesson, setViewingLesson] = useState<{
    lesson: Lesson;
    unitTitle: string;
    topicTitle: string;
    unitId?: string;
    topicId?: string;
  } | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(1);

  const handleOpenViewLesson = (
    lesson: Lesson,
    unitTitle: string,
    topicTitle: string,
    unitId?: string,
    topicId?: string
  ) => {
    setViewingLesson({ lesson, unitTitle, topicTitle, unitId, topicId });
    setActiveSlideIndex(1);
  };

  const generateRealPdfBlob = (
    title: string,
    courseTitle: string,
    unitTitle: string,
    topicTitle: string,
    contentBody: string
  ): string => {
    try {
      const clean = (s: string) => (s || "").replace(/[()\\\\]/g, "");

      const rawLines = (contentBody || "Official curriculum coursework and lecture notes. Complete all exercises and review foundational derivations.")
        .split("\n")
        .flatMap((l) => {
          const words = l.split(" ");
          const chunks: string[] = [];
          let curr = "";
          for (const w of words) {
            if ((curr + " " + w).length > 70) {
              chunks.push(curr.trim());
              curr = w;
            } else {
              curr += " " + w;
            }
          }
          if (curr.trim()) chunks.push(curr.trim());
          return chunks.length > 0 ? chunks : [""];
        });

      const page1Lines = rawLines.slice(0, 30);
      const page2Lines = rawLines.slice(30, 60);
      const hasPage2 = page2Lines.length > 0;
      const pageCount = hasPage2 ? 2 : 1;

      const buildStream = (lines: string[], pageNum: number) => {
        const parts: string[] = ["BT"];
        parts.push("/F1 10 Tf", "50 800 Td", `(${clean(courseTitle || "G.C.E. ADVANCED LEVEL - LIMAT LMS")} | OFFICIAL HANDOUT) Tj`);
        parts.push("0 -15 Td", "/F2 9 Tf", `(${clean(unitTitle)} > ${clean(topicTitle)}) Tj`);
        parts.push("ET", "0.5 w", "0.05 0.36 0.30 RG", "50 770 m", "545 770 l", "S", "BT");
        parts.push("/F1 18 Tf", "50 740 Td", `(${clean(title)}) Tj`);
        parts.push("0 -28 Td", "/F2 10.5 Tf");
        for (const line of lines) {
          if (line) {
            parts.push(`(${clean(line)}) Tj`);
          }
          parts.push("0 -16 Td");
        }
        parts.push("/F2 9 Tf", "50 40 Td", `(Page ${pageNum} of ${pageCount} - Verified Curriculum Material - Limat LMS) Tj`);
        parts.push("ET");
        return parts.join("\n");
      };

      const stream1 = buildStream(page1Lines, 1);
      const encoder = new TextEncoder();
      const stream1Len = encoder.encode(stream1).length;

      let stream2 = "";
      let stream2Len = 0;
      if (hasPage2) {
        stream2 = buildStream(page2Lines, 2);
        stream2Len = encoder.encode(stream2).length;
      }

      let out = "%PDF-1.4\n";
      const offsets: number[] = [];

      const addObj = (str: string) => {
        offsets.push(encoder.encode(out).length);
        out += str + "\n";
      };

      addObj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
      if (hasPage2) {
        addObj("2 0 obj\n<< /Type /Pages /Kids [3 0 R 7 0 R] /Count 2 >>\nendobj");
      } else {
        addObj("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
      }

      addObj("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj");
      addObj("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj");
      addObj("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj");
      addObj(`6 0 obj\n<< /Length ${stream1Len} >>\nstream\n${stream1}\nendstream\nendobj`);

      if (hasPage2) {
        addObj("7 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 8 0 R >>\nendobj");
        addObj(`8 0 obj\n<< /Length ${stream2Len} >>\nstream\n${stream2}\nendstream\nendobj`);
      }

      const objCount = hasPage2 ? 9 : 7;
      const xrefOffset = encoder.encode(out).length;
      out += `xref\n0 ${objCount}\n0000000000 65535 f \n`;
      for (const off of offsets) {
        out += String(off).padStart(10, "0") + " 00000 n \n";
      }
      out += `trailer\n<< /Size ${objCount} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

      const blob = new Blob([encoder.encode(out)], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error("PDF generation error:", err);
      return "";
    }
  };

  const handleReplacePdfForViewingLesson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !viewingLesson || !activeCourse) return;
    const fileUrl = URL.createObjectURL(file);
    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    const newAttachment = {
      name: file.name,
      size: sizeStr,
      type: "PDF",
      url: fileUrl,
    };

    const currentAttachments = viewingLesson.lesson.attachments || [];
    const otherAttachments = currentAttachments.filter(
      (a) => !a.type?.toLowerCase().includes("pdf") && !a.name?.toLowerCase().endsWith(".pdf")
    );
    const updatedAttachments = [newAttachment, ...otherAttachments];

    const updatedLesson: Lesson = {
      ...viewingLesson.lesson,
      attachments: updatedAttachments,
    };

    setViewingLesson((prev) => (prev ? { ...prev, lesson: updatedLesson } : null));

    if (viewingLesson.unitId && viewingLesson.topicId) {
      updateLesson(
        activeCourse.id,
        viewingLesson.unitId,
        viewingLesson.topicId,
        viewingLesson.lesson.id,
        { attachments: updatedAttachments }
      );
      addToast({
        type: "success",
        title: "Real PDF Loaded",
        message: `${file.name} is now open in your native PDF viewer.`
      });
    }
  };

  const handlePrintDocument = (
    title: string,
    body: string,
    unitTitle: string,
    topicTitle: string,
    courseTitle?: string
  ) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>${title} - Handout Document</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #0f172a;
              line-height: 1.8;
              background: #ffffff;
            }
            .header {
              border-bottom: 2px solid #0d5c4d;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .course {
              font-size: 11px;
              font-weight: 800;
              color: #0d5c4d;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .meta {
              font-size: 13px;
              color: #64748b;
              margin-top: 4px;
            }
            h1 {
              font-size: 26px;
              color: #0d2b26;
              margin: 10px 0 0 0;
            }
            .content {
              white-space: pre-wrap;
              font-size: 14.5px;
              color: #334155;
              margin-top: 24px;
            }
            .footer {
              margin-top: 48px;
              padding-top: 16px;
              border-top: 1px dashed #cbd5e1;
              font-size: 11px;
              color: #94a3b8;
              display: flex;
              justify-content: space-between;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="course">${courseTitle || "LMS Curriculum"} &bull; Official Handout</div>
            <h1>${title}</h1>
            <div class="meta">${unitTitle} &bull; ${topicTitle}</div>
          </div>
          <div class="content">${body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          <div class="footer">
            <span>Verified LMS Curriculum Material</span>
            <span>Printed on ${new Date().toLocaleDateString()}</span>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyText = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      addToast({
        type: "success",
        title: "Copied to Clipboard",
        message: "Lesson content copied to clipboard."
      });
    }
  };

  const handleOpenTheoryWindow = (title: string, body: string, unitTitle: string, topicTitle: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>${title} - Lesson Reader</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              padding: 48px;
              max-width: 840px;
              margin: 0 auto;
              color: #0f172a;
              line-height: 1.8;
              background: #ffffff;
            }
            .header {
              border-bottom: 2px solid #0d5c4d;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .breadcrumb {
              font-size: 13px;
              color: #0d5c4d;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            h1 {
              font-size: 28px;
              color: #0d2b26;
              margin: 8px 0 0 0;
            }
            .content {
              white-space: pre-wrap;
              font-size: 15px;
              color: #334155;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="breadcrumb">${unitTitle} &bull; ${topicTitle}</div>
            <h1>${title}</h1>
          </div>
          <div class="content">${body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getEmbedVideoUrl = (url: string) => {
    try {
      if (url.includes("youtube.com/watch?v=")) {
        const id = url.split("watch?v=")[1]?.split("&")[0];
        return `https://www.youtube.com/embed/${id}`;
      } else if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${id}`;
      } else if (url.includes("vimeo.com/")) {
        const id = url.split("vimeo.com/")[1]?.split("?")[0];
        return `https://player.vimeo.com/video/${id}`;
      }
    } catch {
      return null;
    }
    return null;
  };

  // Synchronize target units and topics for Edit Lesson modal
  const editModalUnits = activeCourse?.units || [];
  const editModalActiveUnit = editModalUnits.find((u) => u.id === editLessonTargetUnitId) || editModalUnits[0];
  const editModalTopics = editModalActiveUnit?.topics || [];
  const editModalActiveTopic = editModalTopics.find((t) => t.id === editLessonTargetTopicId) || editModalTopics[0];

  // Synchronize target units and topics for Add Lesson modal
  const modalUnits = activeCourse?.units || [];
  const modalActiveUnit = modalUnits.find((u) => u.id === lessonTargetUnitId) || modalUnits[0];
  const modalTopics = modalActiveUnit?.topics || [];
  const modalActiveTopic = modalTopics.find((t) => t.id === lessonTargetTopicId) || modalTopics[0];

  const handleCreateUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim() || !activeCourse) return;
    const createdId = createUnit(activeCourse.id, newUnitTitle.trim());
    setExpandedUnitIds((prev) => ({ ...prev, [createdId]: true }));
    setIsAddUnitModalOpen(false);
    setNewUnitTitle("");
  };

  const handleCreateTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !activeCourse || !targetUnitIdForTopic) return;
    createTopic(activeCourse.id, targetUnitIdForTopic, newTopicTitle.trim(), newTopicDesc.trim());
    setIsAddTopicModalOpen(false);
    setNewTopicTitle("");
    setNewTopicDesc("");
  };

  const handleUpdateUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit || !editingUnit.title.trim() || !activeCourse) return;
    updateUnit(activeCourse.id, editingUnit.id, { title: editingUnit.title.trim() });
    setIsEditUnitModalOpen(false);
    setEditingUnit(null);
  };

  const handleUpdateTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !editingTopic.title.trim() || !activeCourse) return;
    updateTopic(activeCourse.id, editingTopic.unitId, editingTopic.id, {
      title: editingTopic.title.trim(),
      description: editingTopic.description.trim()
    });
    setIsEditTopicModalOpen(false);
    setEditingTopic(null);
  };

  const handleOpenEditLesson = (unitId: string, topicId: string, lesson: Lesson) => {
    setEditLessonSourceUnitId(unitId);
    setEditLessonSourceTopicId(topicId);
    setEditLessonTargetUnitId(unitId);
    setEditLessonTargetTopicId(topicId);
    setEditLessonId(lesson.id);
    setEditLessonTitle(lesson.title);
    setEditLessonDescription(lesson.description || "");
    setEditLessonContentType(lesson.contentType || "rich_text");
    setEditLessonBody(lesson.contentBody || "");
    setEditLessonVideoUrl(lesson.videoUrl || "");
    setEditLessonVideoDuration("45 mins");
    setEditLessonSlidesCount(lesson.slidesCount || 10);

    if (lesson.attachments && lesson.attachments.length > 0) {
      if (lesson.contentType === "pdf" || lesson.contentType === "slides") {
        setEditUploadedMainFile(lesson.attachments[0] || null);
        setEditSupplementaryFiles(lesson.attachments.slice(1));
      } else {
        setEditUploadedMainFile(null);
        setEditSupplementaryFiles(lesson.attachments);
      }
    } else {
      setEditUploadedMainFile(null);
      setEditSupplementaryFiles([]);
    }

    setIsEditLessonModalOpen(true);
  };

  const handleEditMainFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      const fileExt = file.name.split(".").pop()?.toUpperCase() || "PDF";
      const fileUrl = URL.createObjectURL(file);
      setEditUploadedMainFile({
        name: file.name,
        size: sizeStr,
        type: fileExt,
        url: fileUrl
      });
      if (!editLessonTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setEditLessonTitle(cleanName);
      }
    }
  };

  const handleEditSupplementaryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newItems: { name: string; size: string; type: string; url?: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        newItems.push({
          name: f.name,
          size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
          type: f.name.split(".").pop()?.toUpperCase() || "FILE",
          url: URL.createObjectURL(f)
        });
      }
      setEditSupplementaryFiles((prev) => [...prev, ...newItems]);
    }
  };

  const handleUpdateLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLessonTitle.trim() || !activeCourse || !editLessonId) return;

    const allAttachments = [...editSupplementaryFiles];
    if (editUploadedMainFile) {
      allAttachments.unshift(editUploadedMainFile);
    }

    let finalContentBody = editLessonBody.trim();
    if (!finalContentBody) {
      if (editLessonContentType === "pdf") {
        finalContentBody = `Official lecture document and study guide for ${editLessonTitle}. Download or view the attached PDF for complete proofs and derivations.`;
      } else if (editLessonContentType === "slides") {
        finalContentBody = `Classroom presentation slide deck containing ${editLessonSlidesCount} instructional slides and topic summary points.`;
      } else if (editLessonContentType === "video") {
        finalContentBody = `Recorded classroom lecture session (${editLessonVideoDuration}) covering core theoretical applications and practical questions.`;
      } else {
        finalContentBody = "Lecture notes and worked examples prepared for the G.C.E. Advanced Level examination.";
      }
    }

    updateLesson(
      activeCourse.id,
      editLessonSourceUnitId,
      editLessonSourceTopicId,
      editLessonId,
      {
        title: editLessonTitle.trim(),
        description: editLessonDescription.trim() || undefined,
        contentType: editLessonContentType,
        contentBody: finalContentBody,
        videoUrl: editLessonContentType === "video" ? editLessonVideoUrl : undefined,
        slidesCount: editLessonContentType === "slides" ? editLessonSlidesCount : undefined,
        attachments: allAttachments
      },
      editLessonTargetUnitId,
      editLessonTargetTopicId
    );

    setIsEditLessonModalOpen(false);
  };

  const handleOpenAddLesson = (unitId?: string, topicId?: string) => {
    if (unitId) setLessonTargetUnitId(unitId);
    else if (modalUnits[0]) setLessonTargetUnitId(modalUnits[0].id);

    if (topicId) setLessonTargetTopicId(topicId);
    else if (modalUnits[0]?.topics[0]) setLessonTargetTopicId(modalUnits[0].topics[0].id);

    setLessonTitle("");
    setLessonDescription("");
    setLessonBody("");
    setUploadedMainFile(null);
    setSupplementaryFiles([]);
    setIsCreateLessonModalOpen(true);
  };

  const handleMainFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      const fileExt = file.name.split(".").pop()?.toUpperCase() || "PDF";
      const fileUrl = URL.createObjectURL(file);
      setUploadedMainFile({
        name: file.name,
        size: sizeStr,
        type: fileExt,
        url: fileUrl
      });
      if (!lessonTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setLessonTitle(cleanName);
      }
    }
  };

  const handleSupplementaryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newItems: { name: string; size: string; type: string; url?: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        newItems.push({
          name: f.name,
          size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
          type: f.name.split(".").pop()?.toUpperCase() || "FILE",
          url: URL.createObjectURL(f)
        });
      }
      setSupplementaryFiles((prev) => [...prev, ...newItems]);
    }
  };

  const handleCreateLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !activeCourse) return;

    const unitId = modalActiveUnit?.id || activeCourse.units?.[0]?.id;
    const topicId = modalActiveTopic?.id || activeCourse.units?.[0]?.topics?.[0]?.id;

    if (!unitId || !topicId) return;

    const allAttachments = [...supplementaryFiles];
    if (uploadedMainFile) {
      allAttachments.unshift(uploadedMainFile);
    }

    let finalContentBody = lessonBody.trim();
    if (!finalContentBody) {
      if (lessonContentType === "pdf") {
        finalContentBody = `Official lecture document and study guide for ${lessonTitle}. Download or view the attached PDF for complete proofs and derivations.`;
      } else if (lessonContentType === "slides") {
        finalContentBody = `Classroom presentation slide deck containing ${lessonSlidesCount} instructional slides and topic summary points.`;
      } else if (lessonContentType === "video") {
        finalContentBody = `Recorded classroom lecture session (${lessonVideoDuration}) covering core theoretical applications and practical questions.`;
      } else {
        finalContentBody = "Lecture notes and worked examples prepared for the G.C.E. Advanced Level examination.";
      }
    }

    createLesson(activeCourse.id, unitId, topicId, {
      title: lessonTitle.trim(),
      description: lessonDescription.trim() || undefined,
      contentType: lessonContentType,
      contentBody: finalContentBody,
      videoUrl: lessonContentType === "video" ? lessonVideoUrl : undefined,
      slidesCount: lessonContentType === "slides" ? lessonSlidesCount : undefined,
      attachments: allAttachments
    });

    setIsCreateLessonModalOpen(false);
  };

  const renderCreateCourseModal = () => (
    <Modal
      isOpen={isCreateCourseModalOpen}
      onClose={() => setIsCreateCourseModalOpen(false)}
      title="Create New Course / Masterclass"
    >
      <form onSubmit={handleCreateCourseSubmit} className="space-y-4">
        <p className="text-xs text-slate-500">
          Define your tuition masterclass or subject batch. You can immediately build units, topics, and upload lessons.
        </p>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Course / Masterclass Title *
          </label>
          <input
            type="text"
            required
            value={newCourseTitle}
            onChange={(e) => setNewCourseTitle(e.target.value)}
            placeholder="e.g. 2027 A/L Combined Mathematics Theory & Revision"
            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Course Code (Optional)
            </label>
            <input
              type="text"
              value={newCourseCode}
              onChange={(e) => setNewCourseCode(e.target.value)}
              placeholder="e.g. CM-2027"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] font-mono font-medium"
            />
            <span className="text-[10px] text-slate-400">Leave empty to auto-generate</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Target Batch / Grade
            </label>
            <input
              type="text"
              value={newCourseGrade}
              onChange={(e) => setNewCourseGrade(e.target.value)}
              placeholder="e.g. Grade 12 (A/L 2027), 2026 Revision"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] font-medium"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Subject Specialization
          </label>
          <input
            type="text"
            value={newCourseSubject}
            onChange={(e) => setNewCourseSubject(e.target.value)}
            placeholder="e.g. Combined Mathematics, Pure Physics, Chemistry"
            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] font-medium"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Description &amp; Syllabus Overview
          </label>
          <textarea
            rows={3}
            value={newCourseDescription}
            onChange={(e) => setNewCourseDescription(e.target.value)}
            placeholder="Brief course objectives, syllabus scope, lecture format, and targeted examinations..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d5c4d] font-medium resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCreateCourseModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreatingCourse || !newCourseTitle.trim()}
            className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            {isCreatingCourse ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Creating Course...</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Create Course &amp; Start Syllabus</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );

  const renderViewLessonModal = () => {
    if (!viewingLesson) return null;
    const { lesson, unitTitle, topicTitle, unitId, topicId } = viewingLesson;

    const mainPdf = lesson.attachments?.find(
      (a) => a.type?.toLowerCase().includes("pdf") || a.name?.toLowerCase().endsWith(".pdf")
    ) || (lesson.contentType === "pdf" ? lesson.attachments?.[0] : null);

    const activePdfUrl = mainPdf?.url || (
      lesson.contentType === "pdf"
        ? generateRealPdfBlob(
            lesson.title,
            activeCourse?.title || "",
            unitTitle,
            topicTitle,
            lesson.contentBody
          )
        : ""
    );

    const videoAttachment = lesson.attachments?.find(
      (a) => a.type?.toLowerCase().includes("video") || a.name?.toLowerCase().match(/\.(mp4|webm|mov|mkv)$/i)
    ) || (lesson.contentType === "video" ? lesson.attachments?.[0] : null);

    const slidesAttachment = lesson.attachments?.find(
      (a) => a.type?.toLowerCase().match(/(ppt|presentation|slide)/i) || a.name?.toLowerCase().match(/\.(pptx|ppt|pdf)$/i)
    ) || (lesson.contentType === "slides" ? lesson.attachments?.[0] : null);

    const embedUrl = lesson.videoUrl ? getEmbedVideoUrl(lesson.videoUrl) : null;
    const directVideoUrl = videoAttachment?.url || (lesson.videoUrl && !embedUrl ? lesson.videoUrl : null);

    const totalSlides = Math.max(lesson.slidesCount || 6, 4);

    return (
      <Modal
        isOpen={!!viewingLesson}
        onClose={() => setViewingLesson(null)}
        title={lesson.title}
        description={`${unitTitle} • ${topicTitle}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          {/* Lesson Format Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#f8faf9] border border-[#e6ece8]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0d5c4d]"></span>
              <span className="text-xs font-bold text-[#0d2b26] flex items-center gap-1.5">
                {lesson.contentType === "pdf" && <><FileUp className="h-3.5 w-3.5 text-rose-500" /> PDF Document Coursework</>}
                {lesson.contentType === "slides" && <><Presentation className="h-3.5 w-3.5 text-purple-600" /> Presentation Slide Deck</>}
                {lesson.contentType === "video" && <><PlayCircle className="h-3.5 w-3.5 text-blue-500" /> Recorded Video Lecture</>}
                {(!lesson.contentType || lesson.contentType === "rich_text") && <><FileText className="h-3.5 w-3.5 text-emerald-700" /> Theory &amp; Lecture Notes</>}
              </span>
            </div>

            <Badge
              variant="outline"
              className="text-[10px] font-bold font-mono uppercase bg-white text-slate-600"
            >
              {lesson.status === "published" ? "Published" : "Draft Coursework"}
            </Badge>
          </div>

          {/* Description if any */}
          {lesson.description && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600">
              <span className="font-bold text-slate-800">Lesson Focus: </span>
              {lesson.description}
            </div>
          )}

          {/* ============================================================== */}
          {/* FORMAT 1: PDF DOCUMENT VIEW                                     */}
          {/* ============================================================== */}
          {lesson.contentType === "pdf" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileUp className="h-4 w-4 text-rose-500" />
                    {mainPdf?.name || `${lesson.title}.pdf`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {mainPdf?.size || "Document"}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold text-rose-700 bg-rose-50 border-rose-200">
                    Full PDF Viewer
                  </Badge>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Upload / Replace Local PDF */}
                  <label className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                    <UploadCloud className="h-3.5 w-3.5 text-[#0d5c4d]" />
                    <span>Upload / Replace PDF</span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleReplacePdfForViewingLesson}
                    />
                  </label>

                  {/* Open in full window / tab */}
                  {activePdfUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(activePdfUrl, "_blank")}
                      className="h-8 text-xs font-bold gap-1 border-[#0d5c4d]/30 text-[#0d5c4d] hover:bg-[#ecf8f5] cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open Full PDF</span>
                    </Button>
                  )}

                  {/* Download PDF */}
                  {activePdfUrl && (
                    <a
                      href={activePdfUrl}
                      download={mainPdf?.name || `${lesson.title}.pdf`}
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-xl bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold transition-colors shadow-2xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download PDF</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Native Chromium PDF Reader iframe */}
              <div className="w-full h-[620px] rounded-2xl overflow-hidden border border-slate-300 bg-slate-900 shadow-md">
                <iframe
                  src={`${activePdfUrl}#toolbar=1`}
                  className="w-full h-full border-0"
                  title={mainPdf?.name || `${lesson.title}.pdf`}
                />
              </div>

              {/* Optional lecture notes below the PDF if any */}
              {lesson.contentBody && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-800">Lecture Key Points: </span>
                  {lesson.contentBody}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* FORMAT 2: PRESENTATION SLIDES VIEW                              */}
          {/* ============================================================== */}
          {lesson.contentType === "slides" && (
            <div className="space-y-3">
              {/* Slide Navigation Topbar */}
              <div className="flex items-center justify-between gap-2 text-xs px-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Presentation className="h-4 w-4 text-purple-600" />
                    Interactive Slide Deck
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                    Slide {activeSlideIndex} of {totalSlides}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={activeSlideIndex <= 1}
                    onClick={() => setActiveSlideIndex((prev) => Math.max(1, prev - 1))}
                    className="h-8 text-xs font-bold gap-1 border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={activeSlideIndex >= totalSlides}
                    onClick={() => setActiveSlideIndex((prev) => Math.min(totalSlides, prev + 1))}
                    className="h-8 text-xs font-bold gap-1 border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-40"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                  {slidesAttachment?.url && (
                    <a
                      href={slidesAttachment.url}
                      download={slidesAttachment.name || `${lesson.title}_slides.pptx`}
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 text-xs font-bold transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Deck</span>
                    </a>
                  )}
                </div>
              </div>

              {/* The Slide Canvas */}
              <div className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-[#06201a] via-[#0d3b32] to-[#041a15] text-white p-6 sm:p-10 flex flex-col justify-between shadow-xl relative overflow-hidden select-none border border-emerald-900/40">
                {/* Slide Top Metadata */}
                <div className="flex items-center justify-between text-xs text-emerald-300">
                  <span className="font-bold tracking-wider uppercase font-mono">
                    {activeCourse?.title || "Coursework"} &bull; SLIDE {activeSlideIndex} OF {totalSlides}
                  </span>
                  <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 text-[10px] font-bold">
                    Official Lecture Deck
                  </span>
                </div>

                {/* Slide Center Content based on index */}
                <div className="space-y-4 my-auto max-w-2xl">
                  {activeSlideIndex === 1 && (
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        Lesson Overview &amp; Learning Goals
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                        {lesson.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                        {lesson.description || "Mastering the fundamental concepts, structured proofs, and problem-solving methodologies for this syllabus topic."}
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-200 pt-2">
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>Understand the underlying theoretical framework</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>Analyze structured derivations and working rules</span>
                        </li>
                      </ul>
                    </div>
                  )}

                  {activeSlideIndex === 2 && (
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        Theoretical Foundations
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        Core Principles &amp; Definitions
                      </h3>
                      <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-emerald-100 leading-relaxed font-sans whitespace-pre-wrap max-h-[160px] overflow-y-auto">
                        {lesson.contentBody || "Key formulas and foundational theorems governing this module. Review the definitions carefully before advancing to application questions."}
                      </div>
                    </div>
                  )}

                  {activeSlideIndex === 3 && (
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        Worked Applications
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        Step-by-Step Derivation &amp; Proofs
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
                          <p className="font-bold text-emerald-300 mb-1">Standard Method:</p>
                          <p className="text-slate-200">Deconstruct the problem into identified parameters, establish the relation, and substitute known bounds.</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
                          <p className="font-bold text-amber-300 mb-1">Examination Alert:</p>
                          <p className="text-slate-200">Always state initial conditions and dimensional checks to ensure accuracy in structured exam papers.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSlideIndex >= 4 && (
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        Module Summary &amp; Exercises
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        Summary Checklist &bull; {topicTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        Complete the revision sheet attached in the course resources before attending the next lecture session.
                      </p>
                    </div>
                  )}
                </div>

                {/* Slide Bottom Bar: Progress Indicator */}
                <div className="space-y-2">
                  <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${(activeSlideIndex / totalSlides) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-200/80">
                    <span>{unitTitle}</span>
                    <span>Use &larr; Prev / Next &rarr; to advance</span>
                  </div>
                </div>
              </div>

              {/* Slide Pill Thumbnails */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSlideIndex(i + 1)}
                    className={`h-7 min-w-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeSlideIndex === i + 1
                        ? "bg-[#0d5c4d] text-white shadow-2xs scale-105"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* FORMAT 3: VIDEO LECTURE VIEW                                    */}
          {/* ============================================================== */}
          {lesson.contentType === "video" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs px-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <PlayCircle className="h-4 w-4 text-blue-600" />
                  Recorded Video Lecture
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Duration: {lesson.videoDuration || "45 mins"} &bull; {activeCourse?.teacherName || "Instructor"}
                </span>
              </div>

              {embedUrl ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-black shadow-lg">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lesson.title}
                  />
                </div>
              ) : directVideoUrl ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-black shadow-lg">
                  <video
                    controls
                    className="w-full h-full object-contain"
                    src={directVideoUrl}
                  >
                    Your browser does not support HTML5 video streaming.
                  </video>
                </div>
              ) : (
                /* Interactive Video Player Streaming Container */
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-lg relative flex flex-col items-center justify-center text-center p-6 group">
                  <video
                    controls
                    className="w-full h-full object-contain"
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  >
                    Your browser does not support HTML5 video playback.
                  </video>
                </div>
              )}

              {/* Accompanying lecture notes */}
              {lesson.contentBody && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-800">Lecture Key Points: </span>
                  {lesson.contentBody}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* FORMAT 4: THEORY NOTES VIEW                                     */}
          {/* ============================================================== */}
          {(!lesson.contentType || lesson.contentType === "rich_text") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-emerald-700" />
                  Theory Notes &bull; Lecture Content
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyText(lesson.contentBody || "")}
                    className="h-8 text-xs font-bold gap-1 border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    <span>Copy Text</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenTheoryWindow(lesson.title, lesson.contentBody || "", unitTitle, topicTitle)}
                    className="h-8 text-xs font-bold gap-1 border-[#0d5c4d]/30 text-[#0d5c4d] hover:bg-[#ecf8f5] cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Reader Window</span>
                  </Button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#fdfefe] border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed shadow-2xs font-sans min-h-[220px] max-h-[500px] overflow-y-auto">
                {lesson.contentBody ? (
                  lesson.contentBody
                ) : (
                  <span className="text-slate-400 italic">
                    No lecture body or text notes added for this lesson yet.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Supplementary Attachments List if any */}
          {lesson.attachments && lesson.attachments.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                Lesson Attachments &amp; Files ({lesson.attachments.length})
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lesson.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#0d5c4d] transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{att.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {att.size} &bull; {att.type}
                        </p>
                      </div>
                    </div>
                    {att.url && (
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(att.url, "_blank")}
                          className="h-7 px-2 text-[11px] font-bold text-[#0d5c4d] hover:bg-[#ecf8f5]"
                          title="Open attachment"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {unitId && topicId ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleOpenEditLesson(unitId, topicId, lesson);
                  setViewingLesson(null);
                }}
                className="text-xs font-bold gap-1.5 border-slate-200 text-slate-700 hover:text-[#0d5c4d] hover:border-[#0d5c4d] cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Lesson</span>
              </Button>
            ) : <div />}

            <Button
              type="button"
              onClick={() => setViewingLesson(null)}
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold px-5 cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  // Calculate metrics
  let totalTopicsCount = 0;
  if (activeCourse?.units) {
    activeCourse.units.forEach((u) => {
      totalTopicsCount += (u.topics || []).length;
    });
  }

  if (!activeCourse) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6ece8]">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0d5c4d]"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0d5c4d]">
                Curriculum Architecture &bull; Tutor Studio
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#0d2b26] mt-1">Syllabus Builder</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Organize national curriculum units, define syllabus topics, and manage lesson delivery.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateCourseModalOpen(true)}
            className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs h-9 px-4 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Course</span>
          </Button>
        </div>

        <Card className="p-12 text-center border-dashed border-slate-200">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Courses Available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-5">
            You do not have any active course masterclasses yet. Create your first course to start building your syllabus and organizing lessons.
          </p>
          <Button
            onClick={() => setIsCreateCourseModalOpen(true)}
            className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold rounded-xl px-5 py-2.5 shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Your First Course / Masterclass</span>
          </Button>
        </Card>

        {renderCreateCourseModal()}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#e6ece8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0d5c4d]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d5c4d]">
              Curriculum Architecture &bull; Tutor Studio
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0d2b26] mt-1">Syllabus Builder</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize syllabus units, define topics, and manage lesson delivery.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Target Course Switcher Dropdown */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#c4e9e0] shadow-2xs">
            <BookOpen className="h-4 w-4 text-[#0d5c4d] shrink-0" />
            <select
              value={activeCourseId}
              onChange={(e) => {
                setActiveCourseId(e.target.value);
                setSelectedCourseId(e.target.value);
              }}
              className="bg-transparent text-xs font-bold text-[#0d2b26] focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {visibleCourses.map((crs) => (
                <option key={crs.id} value={crs.id}>
                  {crs.title} ({crs.code})
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            onClick={() => setIsCreateCourseModalOpen(true)}
            className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-1 text-xs shadow-2xs h-8 px-3 rounded-xl cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> New Course
          </Button>

          <Button
            onClick={handleSyncSyllabus}
            disabled={isSyncing}
            variant="outline"
            size="sm"
            className="border-[#0d5c4d]/30 text-[#0d5c4d] hover:bg-[#0d5c4d]/10 font-bold gap-1.5 text-xs shadow-2xs h-8 px-3 rounded-xl cursor-pointer shrink-0"
          >
            {isSyncing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UploadCloud className="h-3.5 w-3.5" />
            )}
            {isSyncing ? "Saving..." : "Save to Cloud"}
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenAddLesson()}
            className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold gap-1.5 text-xs shadow-xs h-8 px-3.5 rounded-xl cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> Add Lesson
          </Button>
        </div>
      </div>

      {/* Course Overview Banner */}
      <Card className="border-[#c4e9e0] bg-gradient-to-br from-[#f8fbf9] to-[#ecf8f5] shadow-2xs overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#0d5c4d] text-white font-mono font-bold text-xs">
                  {activeCourse.code}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {activeCourse.gradeName} &bull; {activeCourse.className}
                </span>
              </div>
              <h2 className="text-xl font-black text-[#0d2b26]">
                {activeCourse.title}
              </h2>
              <p className="text-xs text-slate-600">
                Assigned Instructor: <span className="font-bold text-[#0d5c4d]">{activeCourse.teacherName}</span>
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-[#c4e9e0] pt-4 md:pt-0 md:pl-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Units</p>
                <p className="text-2xl font-black text-[#0d2b26] mt-0.5">{(activeCourse.units || []).length}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Topics</p>
                <p className="text-2xl font-black text-[#0d2b26] mt-0.5">{totalTopicsCount}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Lessons</p>
                <p className="text-2xl font-black text-[#0d5c4d] mt-0.5">{activeCourse.totalLessons || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Units & Topics Architecture Tree */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#0d5c4d]" />
              Syllabus Structure &amp; Learning Modules ({(activeCourse.units || []).length} Units)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any unit to expand its topics and uploaded coursework
            </p>
          </div>

          <Button
            onClick={() => setIsAddUnitModalOpen(true)}
            variant="outline"
            className="border-[#c4e9e0] text-[#0d5c4d] hover:bg-[#ecf8f5] font-bold text-xs shadow-2xs cursor-pointer shrink-0"
          >
            <FolderPlus className="h-3.5 w-3.5 mr-1.5" /> Add Unit / Module
          </Button>
        </div>

        {(activeCourse.units || []).length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-[#e6ece8] shadow-xs space-y-3">
            <Layers className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-700">No Units in this Course Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start building this subject syllabus by creating your first Unit / Module.
            </p>
            <Button
              onClick={() => setIsAddUnitModalOpen(true)}
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add First Unit
            </Button>
          </div>
        ) : (
          (activeCourse.units || []).map((unit, unitIdx) => {
            const isExpanded = !!expandedUnitIds[unit.id];
            let unitLessonCount = 0;
            unit.topics.forEach((t) => (unitLessonCount += t.lessons.length));

            return (
              <div
                key={unit.id}
                className="rounded-2xl border border-[#e6ece8] bg-white shadow-2xs overflow-hidden transition-all hover:border-[#b2e5d9]"
              >
                {/* Unit Header Bar */}
                <div className="p-5 flex items-center justify-between gap-4 bg-[#fcfdfc] border-b border-[#e6ece8]">
                  <div
                    onClick={() => toggleUnit(unit.id)}
                    className="flex items-center gap-3.5 flex-1 cursor-pointer select-none"
                  >
                    <button className="h-7 w-7 rounded-lg bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                          Unit {unitIdx + 1}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {unit.topics.length} {unit.topics.length === 1 ? "Topic" : "Topics"} &bull; {unitLessonCount} Lessons
                        </span>
                      </div>
                      <h4 className="text-base font-black text-[#0d2b26] mt-0.5">
                        {unit.title}
                      </h4>
                    </div>
                  </div>

                  {/* Unit Action Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => {
                        setTargetUnitIdForTopic(unit.id);
                        setIsAddTopicModalOpen(true);
                      }}
                      variant="outline"
                      className="border-[#c4e9e0] text-[#0d5c4d] hover:bg-[#ecf8f5] text-xs font-bold gap-1 shadow-2xs cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Topic</span>
                    </Button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingUnit({ id: unit.id, title: unit.title });
                        setIsEditUnitModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] rounded-lg transition-colors cursor-pointer"
                      title="Edit Unit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove "${unit.title}" from syllabus?`)) {
                          deleteUnit(activeCourse.id, unit.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Unit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Topics & Lessons Body */}
                {isExpanded && (
                  <div className="p-5 space-y-4 bg-white">
                    {unit.topics.length === 0 ? (
                      <div className="p-6 text-center rounded-xl bg-[#f8faf9] border border-dashed border-slate-200 text-xs text-slate-500">
                        No topics created in this unit yet.
                        <button
                          onClick={() => {
                            setTargetUnitIdForTopic(unit.id);
                            setIsAddTopicModalOpen(true);
                          }}
                          className="ml-2 font-bold text-[#0d5c4d] hover:underline cursor-pointer"
                        >
                          + Add first topic
                        </button>
                      </div>
                    ) : (
                      unit.topics.map((topic, topicIdx) => (
                        <div
                          key={topic.id}
                          className="rounded-xl border border-[#e6ece8] bg-[#f8faf9] p-4 space-y-3"
                        >
                          {/* Topic Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e6ece8] pb-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#0d5c4d] uppercase font-mono">
                                  Topic {unitIdx + 1}.{topicIdx + 1}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  ({topic.lessons.length} {topic.lessons.length === 1 ? "lesson" : "lessons"})
                                </span>
                              </div>
                              <h5 className="text-sm font-bold text-[#0d2b26] mt-0.5">
                                {topic.title}
                              </h5>
                              {topic.description && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {topic.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <Button
                                size="sm"
                                onClick={() => handleOpenAddLesson(unit.id, topic.id)}
                                className="bg-[#0d5c4d] hover:bg-[#083e34] text-white text-xs font-bold gap-1 shadow-2xs cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Add Lesson</span>
                              </Button>

                              <button
                                onClick={() => {
                                  setEditingTopic({
                                    unitId: unit.id,
                                    id: topic.id,
                                    title: topic.title,
                                    description: topic.description || ""
                                  });
                                  setIsEditTopicModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] rounded transition-colors cursor-pointer"
                                title="Edit Topic"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Remove topic "${topic.title}"?`)) {
                                    deleteTopic(activeCourse.id, unit.id, topic.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Delete Topic"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Lessons List inside this Topic */}
                          {topic.lessons.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-1">
                              No lessons uploaded under this topic yet. Click &ldquo;Add Lesson&rdquo; to attach PDF, video, slides, or theory.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                              {topic.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  onClick={() => handleOpenViewLesson(lesson, unit.title, topic.title, unit.id, topic.id)}
                                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e2eae5] text-xs hover:border-[#0d5c4d] hover:bg-[#fbfdfc] transition-all shadow-2xs cursor-pointer group"
                                  title="Click to view & read lesson"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="h-8 w-8 rounded-lg bg-[#ecf8f5] text-[#0d5c4d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                      {lesson.contentType === "pdf" && <FileUp className="h-4 w-4 text-rose-500" />}
                                      {lesson.contentType === "slides" && <Presentation className="h-4 w-4 text-purple-600" />}
                                      {lesson.contentType === "video" && <Video className="h-4 w-4 text-blue-500" />}
                                      {(!lesson.contentType || lesson.contentType === "rich_text") && <FileText className="h-4 w-4 text-emerald-700" />}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-900 truncate group-hover:text-[#0d5c4d] transition-colors">
                                        {lesson.title}
                                      </p>
                                      <p className="text-[10px] text-slate-400 capitalize">
                                        {lesson.contentType === "pdf" ? "PDF Document" : lesson.contentType === "rich_text" ? "Theory Notes" : lesson.contentType || "Theory Notes"} &bull; {lesson.attachments?.length || 0} attachments
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                                    <Badge
                                      variant="outline"
                                      className="uppercase font-mono font-bold text-[9px] bg-slate-50 text-slate-600"
                                    >
                                      {lesson.contentType || "notes"}
                                    </Badge>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenViewLesson(lesson, unit.title, topic.title, unit.id, topic.id)}
                                      className="p-1 text-slate-400 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] rounded transition-colors cursor-pointer"
                                      title="View / Read Lesson"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditLesson(unit.id, topic.id, lesson)}
                                      className="p-1 text-slate-400 hover:text-[#0d5c4d] hover:bg-[#ecf8f5] rounded transition-colors cursor-pointer"
                                      title="Edit Lesson"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Remove lesson "${lesson.title}"?`)) {
                                          deleteLesson(activeCourse.id, unit.id, topic.id, lesson.id);
                                        }
                                      }}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                      title="Delete Lesson"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal 1: Add Unit / Module */}
      <Modal
        isOpen={isAddUnitModalOpen}
        onClose={() => setIsAddUnitModalOpen(false)}
        title="Add Unit / Module to Syllabus"
        description={`Add a new major curriculum module to ${activeCourse.title}.`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateUnitSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Unit / Module Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newUnitTitle}
              onChange={(e) => setNewUnitTitle(e.target.value)}
              placeholder="e.g. Unit 3: Trigonometric Equations & Identities"
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddUnitModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold">
              Add Unit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Add Topic to Unit */}
      <Modal
        isOpen={isAddTopicModalOpen}
        onClose={() => setIsAddTopicModalOpen(false)}
        title="Add Syllabus Topic"
        description="Define a specific learning topic under this unit."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateTopicSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Topic Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              placeholder="e.g. Topic 3.1: Sine & Cosine Compound Angles"
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Topic Description / Focus (Optional)
            </label>
            <textarea
              rows={2}
              value={newTopicDesc}
              onChange={(e) => setNewTopicDesc(e.target.value)}
              placeholder="Key concepts, proofs, and application domains..."
              className="w-full p-2.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddTopicModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold">
              Create Topic
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Add Lesson Modal (Multi-Format Support) */}
      <Modal
        isOpen={isCreateLessonModalOpen}
        onClose={() => setIsCreateLessonModalOpen(false)}
        title="Add New Lesson to Syllabus"
        description="Upload coursework PDF documents, classroom presentation slides, or video lectures."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateLessonSubmit} className="space-y-4">
          {/* Target Unit & Topic Hierarchy Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f8faf9] p-3.5 rounded-2xl border border-[#e6ece8]">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Target Unit / Module
              </label>
              <select
                value={modalActiveUnit?.id || ""}
                onChange={(e) => {
                  setLessonTargetUnitId(e.target.value);
                  const u = modalUnits.find((unit) => unit.id === e.target.value);
                  if (u && u.topics[0]) {
                    setLessonTargetTopicId(u.topics[0].id);
                  }
                }}
                className="w-full h-9 px-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0d5c4d]"
              >
                {modalUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Syllabus Topic
              </label>
              <select
                value={modalActiveTopic?.id || ""}
                onChange={(e) => setLessonTargetTopicId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0d5c4d]"
              >
                {modalTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lesson Title & Brief Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Lesson Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g. Lesson 4: Integration by Substitution"
                className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d]/20 focus:border-[#0d5c4d]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Short Description
              </label>
              <input
                type="text"
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                placeholder="e.g. Theory notes, worked proofs, and revision problem sheet"
                className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d]/20 focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          {/* Delivery Format Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26] mb-1.5">
              Select Lesson Delivery Format:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setLessonContentType("pdf")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  lessonContentType === "pdf"
                    ? "bg-[#ecf8f5] border-[#0d5c4d] shadow-2xs ring-1 ring-[#0d5c4d]"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <FileText className="h-4 w-4" />
                  </div>
                  {lessonContentType === "pdf" && (
                    <span className="h-2 w-2 rounded-full bg-[#0d5c4d]" />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">PDF Document</p>
                  <p className="text-[10px] text-slate-500">Worksheet / Notes</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLessonContentType("slides")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  lessonContentType === "slides"
                    ? "bg-[#ecf8f5] border-[#0d5c4d] shadow-2xs ring-1 ring-[#0d5c4d]"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Presentation className="h-4 w-4" />
                  </div>
                  {lessonContentType === "slides" && (
                    <span className="h-2 w-2 rounded-full bg-[#0d5c4d]" />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">Presentation Slides</p>
                  <p className="text-[10px] text-slate-500">PPTX / Slide Deck</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLessonContentType("video")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  lessonContentType === "video"
                    ? "bg-[#ecf8f5] border-[#0d5c4d] shadow-2xs ring-1 ring-[#0d5c4d]"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Video className="h-4 w-4" />
                  </div>
                  {lessonContentType === "video" && (
                    <span className="h-2 w-2 rounded-full bg-[#0d5c4d]" />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">Video Lecture</p>
                  <p className="text-[10px] text-slate-500">Recording / URL</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLessonContentType("rich_text")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  lessonContentType === "rich_text"
                    ? "bg-[#ecf8f5] border-[#0d5c4d] shadow-2xs ring-1 ring-[#0d5c4d]"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Layers className="h-4 w-4" />
                  </div>
                  {lessonContentType === "rich_text" && (
                    <span className="h-2 w-2 rounded-full bg-[#0d5c4d]" />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">Theory Notes</p>
                  <p className="text-[10px] text-slate-500">Rich Text &amp; Math</p>
                </div>
              </button>
            </div>
          </div>

          {/* Dynamic Content Upload Section */}
          {lessonContentType === "pdf" && (
            <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e6ece8] space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26]">
                Upload Coursework PDF File:
              </label>

              {uploadedMainFile ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#c4e9e0] text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                      <FileUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{uploadedMainFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{uploadedMainFile.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedMainFile(null)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#c4e9e0] hover:border-[#0d5c4d] bg-white rounded-2xl cursor-pointer transition-colors group">
                  <UploadCloud className="h-8 w-8 text-[#0d5c4d] group-hover:scale-110 transition-transform mb-2" />
                  <p className="text-xs font-bold text-[#0d2b26]">
                    Click to browse or drag &amp; drop PDF document
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Supports .pdf textbooks, worksheets, and lecture summaries (up to 50MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleMainFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Optional Document Study Notes &amp; Highlights:
                </label>
                <textarea
                  rows={2}
                  value={lessonBody}
                  onChange={(e) => setLessonBody(e.target.value)}
                  placeholder="Outline key learning outcomes, pages to focus on, or homework exercise numbers..."
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>
          )}

          {lessonContentType === "slides" && (
            <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e6ece8] space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26]">
                  Upload Presentation Slide Deck:
                </label>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <span>Number of Slides:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={lessonSlidesCount}
                    onChange={(e) => setLessonSlidesCount(parseInt(e.target.value) || 1)}
                    className="w-16 h-7 px-2 text-center rounded-lg border border-slate-300 text-xs font-bold focus:border-[#0d5c4d]"
                  />
                </div>
              </div>

              {uploadedMainFile ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#c4e9e0] text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Presentation className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{uploadedMainFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{uploadedMainFile.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedMainFile(null)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#c4e9e0] hover:border-[#0d5c4d] bg-white rounded-2xl cursor-pointer transition-colors group">
                  <UploadCloud className="h-8 w-8 text-[#0d5c4d] group-hover:scale-110 transition-transform mb-2" />
                  <p className="text-xs font-bold text-[#0d2b26]">
                    Click to browse or drop PowerPoint / PDF slides (.pptx, .ppt, .pdf)
                  </p>
                  <input
                    type="file"
                    accept=".pptx,.ppt,.pdf"
                    onChange={handleMainFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Slide Deck Summary &amp; Speaker Points:
                </label>
                <textarea
                  rows={2}
                  value={lessonBody}
                  onChange={(e) => setLessonBody(e.target.value)}
                  placeholder="Key slide takeaways, diagrams breakdown, and topics covered..."
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>
          )}

          {lessonContentType === "video" && (
            <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e6ece8] space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26]">
                  Video Lecture Source:
                </label>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <span>Class Duration:</span>
                  <input
                    type="text"
                    value={lessonVideoDuration}
                    onChange={(e) => setLessonVideoDuration(e.target.value)}
                    placeholder="e.g. 45 mins"
                    className="w-24 h-7 px-2 text-center rounded-lg border border-slate-300 text-xs font-bold focus:border-[#0d5c4d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Link2 className="h-3 w-3 text-[#0d5c4d]" />
                  Paste Online Video URL (YouTube, Vimeo, Google Drive, or Google Meet recording):
                </label>
                <input
                  type="url"
                  value={lessonVideoUrl}
                  onChange={(e) => setLessonVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://meet.google.com/xyz-record"
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>

              <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                — OR UPLOAD LOCAL VIDEO RECORDING —
              </div>

              {uploadedMainFile ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#c4e9e0] text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Video className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{uploadedMainFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{uploadedMainFile.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedMainFile(null)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#c4e9e0] hover:border-[#0d5c4d] bg-white rounded-2xl cursor-pointer transition-colors group">
                  <Video className="h-8 w-8 text-[#0d5c4d] group-hover:scale-110 transition-transform mb-2" />
                  <p className="text-xs font-bold text-[#0d2b26]">
                    Click to browse or drop video file (.mp4, .webm, .mov)
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleMainFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {lessonContentType === "rich_text" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Theory Notes &amp; Derivations:
              </label>
              <textarea
                rows={5}
                required
                value={lessonBody}
                onChange={(e) => setLessonBody(e.target.value)}
                placeholder="Enter comprehensive lecture text, key equations, and worked examples..."
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d]/20 focus:border-[#0d5c4d]"
              />
            </div>
          )}

          {/* Supplementary Attachments Bar */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0d2b26] flex items-center gap-1">
                <Paperclip className="h-3.5 w-3.5 text-[#0d5c4d]" />
                Attach Supplementary Resource Materials:
              </label>
              <label className="text-[11px] font-bold text-[#0d5c4d] hover:underline cursor-pointer">
                + Add Files
                <input
                  type="file"
                  multiple
                  onChange={handleSupplementaryFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {supplementaryFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {supplementaryFiles.map((file, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0] text-xs font-semibold"
                  >
                    <FileText className="h-3 w-3" />
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSupplementaryFiles((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateLessonModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold shadow-xs cursor-pointer"
            >
              Add to Syllabus
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 4: Edit Unit / Module */}
      <Modal
        isOpen={isEditUnitModalOpen}
        onClose={() => {
          setIsEditUnitModalOpen(false);
          setEditingUnit(null);
        }}
        title="Edit Unit / Module"
        description="Update the unit or module title for this syllabus."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateUnitSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Unit / Module Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={editingUnit?.title || ""}
              onChange={(e) =>
                setEditingUnit((prev) => (prev ? { ...prev, title: e.target.value } : null))
              }
              placeholder="e.g. Unit 3: Trigonometric Equations & Identities"
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditUnitModalOpen(false);
                setEditingUnit(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold cursor-pointer">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 5: Edit Syllabus Topic */}
      <Modal
        isOpen={isEditTopicModalOpen}
        onClose={() => {
          setIsEditTopicModalOpen(false);
          setEditingTopic(null);
        }}
        title="Edit Syllabus Topic"
        description="Update topic title and description."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateTopicSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Topic Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={editingTopic?.title || ""}
              onChange={(e) =>
                setEditingTopic((prev) => (prev ? { ...prev, title: e.target.value } : null))
              }
              placeholder="e.g. Topic 3.1: Sine & Cosine Compound Angles"
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Topic Description / Focus (Optional)
            </label>
            <textarea
              rows={2}
              value={editingTopic?.description || ""}
              onChange={(e) =>
                setEditingTopic((prev) => (prev ? { ...prev, description: e.target.value } : null))
              }
              placeholder="Key concepts, proofs, and application domains..."
              className="w-full p-2.5 rounded-xl bg-[#f8faf9] border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditTopicModalOpen(false);
                setEditingTopic(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold cursor-pointer">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 6: Edit Lesson (Rich Multi-Format Support) */}
      <Modal
        isOpen={isEditLessonModalOpen}
        onClose={() => setIsEditLessonModalOpen(false)}
        title="Edit Lesson in Syllabus"
        description="Update coursework PDF documents, classroom presentation slides, video lectures, or theory notes."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleUpdateLessonSubmit} className="space-y-4">
          {/* Target Unit & Topic Hierarchy Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f8faf9] p-3.5 rounded-2xl border border-[#e6ece8]">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Target Unit / Module
              </label>
              <select
                value={editModalActiveUnit?.id || ""}
                onChange={(e) => {
                  setEditLessonTargetUnitId(e.target.value);
                  const u = editModalUnits.find((unit) => unit.id === e.target.value);
                  if (u && u.topics[0]) {
                    setEditLessonTargetTopicId(u.topics[0].id);
                  }
                }}
                className="w-full h-9 px-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0d5c4d]"
              >
                {editModalUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Syllabus Topic
              </label>
              <select
                value={editModalActiveTopic?.id || ""}
                onChange={(e) => setEditLessonTargetTopicId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0d5c4d]"
              >
                {editModalTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lesson Title & Brief Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Lesson Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editLessonTitle}
                onChange={(e) => setEditLessonTitle(e.target.value)}
                placeholder="e.g. Lesson 4: Integration by Substitution"
                className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d]/20 focus:border-[#0d5c4d]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Short Description
              </label>
              <input
                type="text"
                value={editLessonDescription}
                onChange={(e) => setEditLessonDescription(e.target.value)}
                placeholder="e.g. Theory notes, worked proofs, and revision problem sheet"
                className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d]/20 focus:border-[#0d5c4d]"
              />
            </div>
          </div>

          {/* Delivery Format Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26] mb-1.5">
              Select Lesson Delivery Format:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setEditLessonContentType("pdf")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  editLessonContentType === "pdf"
                    ? "bg-[#ecf8f5] border-[#0d5c4d] shadow-2xs ring-1 ring-[#0d5c4d]"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <FileText className="h-4 w-4" />
                  </div>
                  {editLessonContentType === "pdf" && (
                    <span className="h-2 w-2 rounded-full bg-[#0d5c4d]" />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">PDF Document</p>
                  <p className="text-[10px] text-slate-500">Worksheet / Notes</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEditLessonContentType("slides")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  editLessonContentType === "slides"
                    ? "bg-[#ecf8f5] border-[#0d5c4d] shadow-2xs ring-1 ring-[#0d5c4d]"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Presentation className="h-4 w-4" />
                  </div>
                  {editLessonContentType === "slides" && (
                    <span className="h-2 w-2 rounded-full bg-[#0d5c4d]" />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">Presentation Slides</p>
                  <p className="text-[10px] text-slate-500">PPTX / Slide Deck</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEditLessonContentType("video")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  editLessonContentType === "video"
                    ? "bg-[#ecf8f5] border-[#0d5c4d] shadow-2xs ring-1 ring-[#0d5c4d]"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Video className="h-4 w-4" />
                  </div>
                  {editLessonContentType === "video" && (
                    <span className="h-2 w-2 rounded-full bg-[#0d5c4d]" />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">Video Lecture</p>
                  <p className="text-[10px] text-slate-500">YouTube / Drive</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEditLessonContentType("rich_text")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  editLessonContentType === "rich_text"
                    ? "bg-[#ecf8f5] border-[#0d5c4d] shadow-2xs ring-1 ring-[#0d5c4d]"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  {editLessonContentType === "rich_text" && (
                    <span className="h-2 w-2 rounded-full bg-[#0d5c4d]" />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-xs text-[#0d2b26]">Theory Notes</p>
                  <p className="text-[10px] text-slate-500">Rich text / equations</p>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Media Upload Panes */}
          {editLessonContentType === "pdf" && (
            <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e6ece8] space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26]">
                Upload / Update PDF Course Document:
              </label>

              {editUploadedMainFile ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#c4e9e0] text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                      <FileUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{editUploadedMainFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{editUploadedMainFile.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditUploadedMainFile(null)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#c4e9e0] hover:border-[#0d5c4d] bg-white rounded-2xl cursor-pointer transition-colors group">
                  <UploadCloud className="h-8 w-8 text-[#0d5c4d] group-hover:scale-110 transition-transform mb-2" />
                  <p className="text-xs font-bold text-[#0d2b26]">
                    Click to browse or drop PDF worksheet / textbook chapter
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">PDF up to 50MB</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleEditMainFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Document Overview &amp; Learning Objectives:
                </label>
                <textarea
                  rows={2}
                  value={editLessonBody}
                  onChange={(e) => setEditLessonBody(e.target.value)}
                  placeholder="Outline key syllabus points covered in this PDF..."
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>
          )}

          {editLessonContentType === "slides" && (
            <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e6ece8] space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26]">
                  Upload / Update Slide Deck (.pptx, .pdf):
                </label>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <span>Number of Slides:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editLessonSlidesCount}
                    onChange={(e) => setEditLessonSlidesCount(parseInt(e.target.value) || 1)}
                    className="w-16 h-7 px-2 text-center rounded-lg border border-slate-300 text-xs font-bold focus:border-[#0d5c4d]"
                  />
                </div>
              </div>

              {editUploadedMainFile ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#c4e9e0] text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Presentation className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{editUploadedMainFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{editUploadedMainFile.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditUploadedMainFile(null)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#c4e9e0] hover:border-[#0d5c4d] bg-white rounded-2xl cursor-pointer transition-colors group">
                  <UploadCloud className="h-8 w-8 text-[#0d5c4d] group-hover:scale-110 transition-transform mb-2" />
                  <p className="text-xs font-bold text-[#0d2b26]">
                    Click to browse or drop PowerPoint / PDF slides (.pptx, .ppt, .pdf)
                  </p>
                  <input
                    type="file"
                    accept=".pptx,.ppt,.pdf"
                    onChange={handleEditMainFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Slide Deck Summary &amp; Speaker Points:
                </label>
                <textarea
                  rows={2}
                  value={editLessonBody}
                  onChange={(e) => setEditLessonBody(e.target.value)}
                  placeholder="Key slide takeaways, diagrams breakdown, and topics covered..."
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>
          )}

          {editLessonContentType === "video" && (
            <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e6ece8] space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26]">
                  Video Lecture Source:
                </label>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <span>Class Duration:</span>
                  <input
                    type="text"
                    value={editLessonVideoDuration}
                    onChange={(e) => setEditLessonVideoDuration(e.target.value)}
                    placeholder="e.g. 50 mins"
                    className="w-24 h-7 px-2 text-center rounded-lg border border-slate-300 text-xs font-bold focus:border-[#0d5c4d]"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type="url"
                    value={editLessonVideoUrl}
                    onChange={(e) => setEditLessonVideoUrl(e.target.value)}
                    placeholder="Paste YouTube, Vimeo, or Google Drive link..."
                    className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                  />
                  <Video className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Lecture Synopsis &amp; Discussion Points:
                </label>
                <textarea
                  rows={2}
                  value={editLessonBody}
                  onChange={(e) => setEditLessonBody(e.target.value)}
                  placeholder="Timestamp breakdown, topics covered in recording..."
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0d5c4d]"
                />
              </div>
            </div>
          )}

          {editLessonContentType === "rich_text" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0d2b26] mb-1">
                Theory Notes &amp; Derivations:
              </label>
              <textarea
                rows={5}
                required
                value={editLessonBody}
                onChange={(e) => setEditLessonBody(e.target.value)}
                placeholder="Enter comprehensive lecture text, key equations, and worked examples..."
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d]/20 focus:border-[#0d5c4d]"
              />
            </div>
          )}

          {/* Supplementary Attachments Bar */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0d2b26] flex items-center gap-1">
                <Paperclip className="h-3.5 w-3.5 text-[#0d5c4d]" />
                Attach Supplementary Resource Materials:
              </label>
              <label className="text-[11px] font-bold text-[#0d5c4d] hover:underline cursor-pointer">
                + Add Files
                <input
                  type="file"
                  multiple
                  onChange={handleEditSupplementaryFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {editSupplementaryFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {editSupplementaryFiles.map((file, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ecf8f5] text-[#0d5c4d] border border-[#c4e9e0] text-xs font-semibold"
                  >
                    <FileText className="h-3 w-3" />
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditSupplementaryFiles((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditLessonModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold shadow-xs cursor-pointer"
            >
              Save Lesson Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 5: View / Read Lesson Modal */}
      {renderViewLessonModal()}

      {renderCreateCourseModal()}
    </div>
  );
}
