"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BookOpen,
  FileText,
  UploadCloud,
  CheckCircle2,
  Lock,
  Globe,
  Layers,
  Save,
  X,
  FileCheck,
  Paperclip,
  Check,
  ImagePlus
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course, LibraryResource, LibraryResourceType } from "@/types/lms";
import { useApp } from "@/context/AppContext";

interface ResourceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceToEdit?: LibraryResource | null;
  courses: Course[];
  /** Subjects the signed-in tutor teaches (from their profile specializations). */
  subjectOptions?: string[];
  onSave: (data: Partial<LibraryResource>, publish: boolean) => void;
}

const COVER_PRESETS = [
  {
    label: "Combined Mathematics",
    url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80"
  },
  {
    label: "Physics & Waves",
    url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80"
  },
  {
    label: "Chemistry Laboratory",
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80"
  },
  {
    label: "Biology & Botany",
    url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80"
  },
  {
    label: "ICT & Computing",
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"
  }
];

export function ResourceUploadModal({
  isOpen,
  onClose,
  resourceToEdit,
  courses,
  subjectOptions = [],
  onSave
}: ResourceUploadModalProps) {
  const { currentUser } = useApp();
  const isEditing = Boolean(resourceToEdit);

  // Subjects this tutor teaches: profile specializations + their own course titles
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    subjectOptions.forEach((s) => s && set.add(s));
    courses.forEach((c) => c.title && set.add(c.title));
    return Array.from(set);
  }, [subjectOptions, courses]);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState<LibraryResourceType>("tute");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "subscribers_only">("public");
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);
  const [customCoverPreview, setCustomCoverPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState("PDF");
  const [fileSize, setFileSize] = useState("4.2 MB");
  const [pageCount, setPageCount] = useState(24);
  const [allowDownload, setAllowDownload] = useState(true);

  // Actual material file (tute / past paper / study guide / book)
  const materialFileInputRef = useRef<HTMLInputElement>(null);
  const [materialFileUrl, setMaterialFileUrl] = useState<string | undefined>(undefined);
  const [materialFileName, setMaterialFileName] = useState<string>("");
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const MATERIAL_ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.epub,.zip";
  const MAX_MATERIAL_MB = 50;

  const formatBytes = (bytes: number) =>
    bytes >= 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(bytes / 1024))} KB`;

  const processMaterialFile = async (file: File) => {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!["pdf", "doc", "docx", "ppt", "pptx", "epub", "zip"].includes(ext)) {
      setErrorMsg("Unsupported file type. Please upload PDF, DOC/DOCX, PPT/PPTX, EPUB or ZIP.");
      return;
    }
    if (file.size > MAX_MATERIAL_MB * 1024 * 1024) {
      setErrorMsg(`File is too large. Maximum allowed size is ${MAX_MATERIAL_MB} MB.`);
      return;
    }
    setErrorMsg(null);
    if (materialFileUrl && materialFileUrl.startsWith("blob:")) URL.revokeObjectURL(materialFileUrl);

    setMaterialFileUrl(URL.createObjectURL(file));
    setMaterialFileName(file.name);
    setFileType(ext.toUpperCase());
    setFileSize(formatBytes(file.size));

    // Best-effort page count for PDFs
    if (ext === "pdf") {
      try {
        const text = await file.text();
        const matches = text.match(/\/Type\s*\/Page[^s]/g);
        if (matches && matches.length > 0) setPageCount(matches.length);
      } catch {
        /* keep existing page count */
      }
    }
  };

  const handleMaterialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processMaterialFile(file);
    e.target.value = "";
  };

  const handleMaterialDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processMaterialFile(file);
  };

  const removeMaterialFile = () => {
    if (materialFileUrl && materialFileUrl.startsWith("blob:")) URL.revokeObjectURL(materialFileUrl);
    setMaterialFileUrl(undefined);
    setMaterialFileName("");
  };
  const handleCustomCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCustomCoverPreview(dataUrl);
      setCoverImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Past Paper / Model Exam specifics
  const [year, setYear] = useState<number>(2025);
  const [medium, setMedium] = useState<"Tamil" | "English" | "Sinhala" | "Trilingual" | "All">("Tamil");
  const [examType, setExamType] = useState<
    "G.C.E. Advanced Level" | "G.C.E. Ordinary Level" | "Provincial Term Test" | "School Model Paper"
  >("G.C.E. Advanced Level");
  const [paperPart, setPaperPart] = useState<
    "Paper I (MCQ)" | "Paper II (Structured & Essay)" | "Complete Set (Paper I + II)" | "Marking Scheme"
  >("Complete Set (Paper I + II)");
  const [hasMarkingScheme, setHasMarkingScheme] = useState(true);
  const [markingSchemeNotes, setMarkingSchemeNotes] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setCustomCoverPreview(null);
    setMaterialFileUrl(resourceToEdit?.fileUrl);
    setMaterialFileName(resourceToEdit?.fileName || "");

    if (resourceToEdit) {
      setTitle(resourceToEdit.title);
      setResourceType(resourceToEdit.resourceType);
      setSubject(resourceToEdit.subject);
      setTopic(resourceToEdit.topic || "");
      setDescription(resourceToEdit.description || "");
      setVisibility(resourceToEdit.visibility === "subscribers_only" ? "subscribers_only" : "public");
      setCoverImage(resourceToEdit.coverImage || COVER_PRESETS[0].url);
      setFileType(resourceToEdit.fileType || "PDF");
      setFileSize(resourceToEdit.fileSize || "4.5 MB");
      setPageCount(resourceToEdit.pageCount || 20);
      setAllowDownload(resourceToEdit.allowDownload !== false);

      if (resourceToEdit.year) setYear(resourceToEdit.year);
      if (resourceToEdit.medium) setMedium(resourceToEdit.medium);
      if (resourceToEdit.examType) setExamType(resourceToEdit.examType);
      if (resourceToEdit.paperPart) setPaperPart(resourceToEdit.paperPart);
      if (resourceToEdit.hasMarkingScheme !== undefined) setHasMarkingScheme(resourceToEdit.hasMarkingScheme);
      if (resourceToEdit.markingSchemeNotes) setMarkingSchemeNotes(resourceToEdit.markingSchemeNotes);
    } else {
      setTitle("");
      setResourceType("tute");
      setSubject(allSubjects[0] || "");
      setTopic("");
      setDescription("");
      setVisibility("public");
      setCoverImage(COVER_PRESETS[0].url);
      setFileType("PDF");
      setFileSize("");
      setPageCount(0);
      setAllowDownload(true);
      setYear(2025);
      setMedium("Tamil");
      setExamType("G.C.E. Advanced Level");
      setPaperPart("Complete Set (Paper I + II)");
      setHasMarkingScheme(true);
      setMarkingSchemeNotes("Official marking rubrics with step-by-step mark allocations.");
    }
    setErrorMsg(null);
  }, [resourceToEdit, isOpen]);

  // When subjects load late (profile fetched async), auto-select the first one for new uploads
  useEffect(() => {
    if (!isOpen || resourceToEdit) return;
    if (allSubjects.length > 0 && !allSubjects.includes(subject)) {
      setSubject(allSubjects[0]);
    }
  }, [allSubjects, isOpen, resourceToEdit, subject]);

  const handleSubmit = (publish: boolean) => {
    if (!title.trim()) {
      setErrorMsg("Please enter a title for this material.");
      return;
    }
    if (!subject.trim()) {
      setErrorMsg("Please specify the subject.");
      return;
    }

    if (!materialFileUrl && !isEditing) {
      setErrorMsg("Please upload the material file (PDF, DOC, PPT, EPUB or ZIP) before saving.");
      return;
    }

    const payload: Partial<LibraryResource> = {
      title: title.trim(),
      resourceType,
      subject,
      topic: resourceType === "tute" ? topic : undefined,
      description: description.trim(),
      visibility,
      coverImage,
      fileType,
      fileSize,
      pageCount: Number(pageCount) || undefined,
      fileUrl: materialFileUrl,
      fileName: materialFileName || undefined,
      allowDownload,
      status: publish ? "published" : "draft",
      author: currentUser?.name || "Tutor",
      year: resourceType === "past_paper" ? Number(year) : undefined,
      medium: resourceType === "past_paper" ? medium : undefined,
      examType: resourceType === "past_paper" ? examType : undefined,
      paperPart: resourceType === "past_paper" ? paperPart : undefined,
      hasMarkingScheme: resourceType === "past_paper" ? hasMarkingScheme : undefined,
      markingSchemeNotes: resourceType === "past_paper" ? markingSchemeNotes : undefined
    };

    onSave(payload, publish);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#ecf8f5] text-[#0d5c4d]">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#0d2b26]">
              {isEditing ? "Edit Study Material / Tute" : "Upload Educational Tute & Model Paper"}
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Publish PDF handouts, lecture tutes, past papers, and study guides for students.
            </p>
          </div>
        </div>
      }
      size="xl"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(true); }} className="space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SECTION 1: MATERIAL CLASSIFICATION */}
        <div className="p-4 rounded-2xl bg-white border border-[#e6ece8] space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Material Category <span className="text-rose-500">*</span></label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as LibraryResourceType)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] bg-white font-bold text-slate-800"
              >
                <option value="tute">📄 Class Tute / Lecture Handout</option>
                <option value="past_paper">📝 Past Paper / Model Exam Paper</option>
                <option value="book">📖 Study Guide / Reference Book</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Subject Course <span className="text-rose-500">*</span></label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] bg-white font-semibold text-slate-800"
              >
                {allSubjects.length > 0 ? (
                  allSubjects.map((s) => (
                    <option key={s} value={s}>
                      📚 {s}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No subjects found — add them in your Profile</option>
                )}
                {resourceToEdit?.subject && !allSubjects.includes(resourceToEdit.subject) && (
                  <option value={resourceToEdit.subject}>
                    📚 {resourceToEdit.subject}
                  </option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Access Mode</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] bg-white font-semibold text-slate-800"
              >
                <option value="public">🌐 Public (Free for all Students)</option>
                <option value="subscribers_only">🔒 Subscribers Only (Tuition Packages)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Material Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                courses[0]?.title
                  ? `e.g. ${courses[0].title} - Lesson 01 Handout & Revision Guide`
                  : "e.g. Course Handout & Revision Guide"
              }
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] font-semibold text-slate-800"
            />
          </div>

          {resourceType === "tute" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Syllabus Topic / Lesson Unit</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Unit 01: Introduction & Fundamentals"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] text-slate-800"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Description & Overview</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief explanation of what is covered in this tute or model paper..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c4d] text-slate-800"
            />
          </div>
        </div>

        {/* SECTION 2: PAST PAPER / MODEL EXAM FIELDS (If applicable) */}
        {resourceType === "past_paper" && (
          <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#c4e9e0] space-y-3 shadow-2xs">
            <h4 className="text-xs font-black text-[#0d5c4d] uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="h-4 w-4" /> Examination Specifications
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Exam Year</label>
                <input
                  type="number"
                  min={2000}
                  max={2030}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Language Medium</label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="English">English</option>
                  <option value="Sinhala">Sinhala (සිංහල)</option>
                  <option value="Trilingual">Trilingual Set</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Exam Level</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="G.C.E. Advanced Level">G.C.E. A/L</option>
                  <option value="G.C.E. Ordinary Level">G.C.E. O/L</option>
                  <option value="Provincial Term Test">Provincial Test</option>
                  <option value="School Model Paper">Model Exam</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Paper Component</label>
                <select
                  value={paperPart}
                  onChange={(e) => setPaperPart(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Complete Set (Paper I + II)">Complete Set (I + II)</option>
                  <option value="Paper I (MCQ)">Paper I (MCQ)</option>
                  <option value="Paper II (Structured & Essay)">Paper II (Essay)</option>
                </select>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={hasMarkingScheme}
                  onChange={(e) => setHasMarkingScheme(e.target.checked)}
                  className="h-4 w-4 rounded text-[#0d5c4d] focus:ring-[#0d5c4d]"
                />
                <span>Includes Complete Marking Scheme & Rubrics</span>
              </label>

              {hasMarkingScheme && (
                <span className="text-[11px] text-[#0d5c4d] font-bold bg-[#ecf8f5] px-2.5 py-0.5 rounded-full border border-[#c4e9e0]">
                  ✓ Verified Answer Scheme Included
                </span>
              )}
            </div>
          </div>
        )}

        {/* SECTION 3: FILE ATTACHMENT & COVER PRESET */}
        <div className="p-4 rounded-2xl bg-white border border-[#e6ece8] space-y-4 shadow-2xs">
          {/* Material file upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              {resourceType === "past_paper"
                ? "Past Paper / Model Paper File"
                : resourceType === "book"
                ? "Study Guide / Book File"
                : "Tute / Lecture Handout File"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              ref={materialFileInputRef}
              type="file"
              accept={MATERIAL_ACCEPT}
              onChange={handleMaterialFileChange}
              className="hidden"
            />
            {materialFileUrl ? (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#ecf8f5] border border-[#c4e9e0]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-white text-[#0d5c4d] border border-[#c4e9e0]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {materialFileName || "Uploaded file"}
                    </p>
                    <p className="text-[11px] text-slate-600 font-mono">
                      {fileType}
                      {fileSize ? ` • ${fileSize}` : ""}
                      {pageCount > 0 && fileType === "PDF" ? ` • ${pageCount} pages` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => materialFileInputRef.current?.click()}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-[#0d5c4d] text-[#0d5c4d] bg-white hover:bg-[#f0faf7] cursor-pointer"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={removeMaterialFile}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => materialFileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={handleMaterialDrop}
                className={`flex flex-col items-center justify-center gap-1.5 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-center ${
                  isDraggingFile
                    ? "border-[#0d5c4d] bg-[#ecf8f5]"
                    : "border-slate-300 bg-[#f8faf9] hover:bg-[#f0faf7] hover:border-[#0d5c4d]"
                }`}
              >
                <UploadCloud className="h-7 w-7 text-[#0d5c4d]" />
                <p className="text-xs font-bold text-slate-800">
                  Click to upload or drag &amp; drop your file here
                </p>
                <p className="text-[11px] text-slate-500">
                  PDF, DOC/DOCX, PPT/PPTX, EPUB or ZIP • up to {MAX_MATERIAL_MB} MB
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf9] border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">Student PDF Download</p>
              <p className="text-[11px] text-slate-500">Allow students to save offline copy to their device</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0d5c4d]"></div>
            </label>
          </div>

          {/* Cover image preview & quick presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Cover Thumbnail</label>
              {coverImage && (
                <img src={coverImage} alt="Selected cover" className="h-8 w-12 rounded-lg object-cover border border-slate-200 shadow-sm" />
              )}
            </div>

            {/* Preset thumbnails */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {COVER_PRESETS.map((preset) => {
                const isSelected = coverImage === preset.url;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => { setCoverImage(preset.url); setCustomCoverPreview(null); }}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border text-[11px] font-bold shrink-0 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#ecf8f5] border-[#0d5c4d] text-[#0d5c4d] ring-1 ring-[#0d5c4d]"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="h-6 w-8 rounded object-cover" />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom image upload */}
            <div>
              <input
                ref={coverImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomCoverUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverImageInputRef.current?.click()}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all w-full justify-center ${
                  customCoverPreview
                    ? "bg-[#ecf8f5] border-[#0d5c4d] text-[#0d5c4d] ring-1 ring-[#0d5c4d]"
                    : "bg-white border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:border-slate-400"
                }`}
              >
                {customCoverPreview ? (
                  <>
                    <img src={customCoverPreview} alt="Custom cover" className="h-6 w-8 rounded object-cover" />
                    <span>Custom Image Selected ✓ — Click to Change</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4" />
                    <span>Upload Custom Cover Image</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(false)}
              className="text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit(true)}
              className="bg-[#0d5c4d] hover:bg-[#083e34] text-white font-bold text-xs gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              {isEditing ? "Save Changes" : "Publish to Students"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
