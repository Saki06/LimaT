"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Star,
  Award,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Share2,
  FileText,
  Download,
  AlertCircle,
  Play
} from "lucide-react";
import { api } from "@/lib/api";

interface PublicTutorData {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  title?: string;
  specialization?: string;
  bio?: string;
  rating?: number;
  isVerified?: boolean;
  mediums?: string[];
  experienceYears?: number;
  qualifications?: Array<{
    degree: string;
    institution: string;
    year: string;
    honors?: string;
  }>;
  accreditations?: Array<{
    name: string;
    issuer: string;
    certId?: string;
    year: string;
  }>;
  socialChannels?: Array<{
    id: string;
    platform: string;
    title: string;
    url: string;
  }>;
  publicSlug: string;
  youtubeUrl?: string;
  telegramUrl?: string;
  whatsappNumber?: string;
  websiteUrl?: string;
  coverImageUrl?: string;
  packages?: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    billingCycle: string;
    durationDays?: number;
    features?: string[] | string;
  }>;
  publicResources?: Array<{
    id: string;
    title: string;
    description: string;
    resourceType: string;
    subject: string;
    category: string;
    year: string;
    viewsCount: number;
    downloadsCount: number;
  }>;
}

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const shortsMatch = url.match(/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) return `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}`;
    const watchMatch = url.match(/v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}`;
    const beMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (beMatch) return `https://www.youtube-nocookie.com/embed/${beMatch[1]}`;
    return null;
  } catch {
    return null;
  }
}

export default function TutorPublicStudioPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  const [tutor, setTutor] = useState<PublicTutorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    Promise.resolve().then(() => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);

      api.teachers
        .getPublicProfile(slug)
        .then((res: { success?: boolean; data?: PublicTutorData; error?: string } | null | undefined) => {
          if (!isMounted) return;
          if (res?.success && res?.data) {
            setTutor(res.data);
          } else {
            setError(res?.error || "Tutor profile not found.");
          }
        })
        .catch((err: unknown) => {
          if (!isMounted) return;
          setError(err instanceof Error ? err.message : "Failed to load tutor profile.");
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    if (typeof window === "undefined") return;
    const text = encodeURIComponent(
      `Check out ${tutor?.name || "Tutor"}'s official teaching studio on Newtoz LMS: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const parsePackageFeatures = (features?: string[] | string): string[] => {
    if (!features) return [];
    if (Array.isArray(features)) return features;
    if (typeof features === "string") {
      try {
        const parsed = JSON.parse(features);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // split by commas or newlines
        return features
          .split(/[\n,]/)
          .map((f) => f.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0d5c4d] border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600">Loading Tutor Studio...</p>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Tutor Studio Not Found</h2>
          <p className="text-sm text-slate-500">
            The studio URL <span className="font-mono font-bold text-slate-700">/tutors/{slug}</span> does not exist or may have been modified.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 rounded-xl bg-[#0d5c4d] text-white text-xs font-bold hover:bg-[#0a473b] transition-colors"
            >
              Go to Home Page
            </button>
            <button
              onClick={() => router.push("/student")}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Browse Student Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const coverImage =
    tutor.coverImageUrl ||
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen bg-[#f6f9f8] text-slate-900 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div
            onClick={() => router.push("/")}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#0d5c4d] to-[#147a66] flex items-center justify-center text-white font-black text-lg shadow-sm">
              N
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-[#0d2b26]">
                Newtoz <span className="text-[#0d5c4d] font-bold text-xs">LMS</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Shape Your Future</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              <span>{copied ? "Link Copied!" : "Share Studio"}</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/student")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <span>Student Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero Studio Banner Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Cover Banner */}
          <div className="relative h-48 sm:h-64 w-full bg-slate-900">
            <Image
              src={coverImage}
              alt="Studio Cover"
              width={1200}
              height={256}
              unoptimized
              className="h-full w-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

            {/* Quick Share Overlay in banner */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Link"}</span>
              </button>
            </div>

            {/* Tutor Identity in Banner */}
            <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-[#0d5c4d] to-[#147a66] border-4 border-white text-white flex items-center justify-center text-3xl font-black shadow-xl overflow-hidden shrink-0">
                  {tutor.avatarUrl ? (
                    <Image src={tutor.avatarUrl} alt={tutor.name} width={96} height={96} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    tutor.name.charAt(0)
                  )}
                </div>
                <div className="text-white space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">{tutor.name}</h1>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[10px] tracking-wide">
                      VERIFIED TUTOR ✓
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium">
                    {tutor.title || "Specialist Educator"} {tutor.specialization ? `· ${tutor.specialization}` : ""}
                  </p>
                </div>
              </div>

              {/* Rating & Experience Badges */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-extrabold text-xs">{tutor.rating || 5.0}</span>
                  <span className="text-[10px] text-slate-300">/ 5.0</span>
                </div>
                {tutor.experienceYears ? (
                  <div className="px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
                    {tutor.experienceYears}+ Years Exp.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Banner Sub-Bar: Mediums & Quick Actions */}
          <div className="p-4 sm:p-6 bg-white border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Mediums:</span>
              {tutor.mediums && tutor.mediums.length > 0 ? (
                tutor.mediums.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#ecf8f5] text-[#0d5c4d] font-bold text-xs border border-[#c4e9e0]"
                  >
                    {m}
                  </span>
                ))
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-[#ecf8f5] text-[#0d5c4d] font-bold text-xs border border-[#c4e9e0]">
                  English, Tamil
                </span>
              )}

              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                SLTS Registered Educator
              </span>
            </div>

            <div className="flex items-center gap-2">
              {tutor.whatsappNumber ? (
                <a
                  href={`https://wa.me/${tutor.whatsappNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}

              {tutor.youtubeUrl ? (
                <a
                  href={tutor.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-red-600" />
                  <span>YouTube</span>
                </a>
              ) : null}

              {tutor.telegramUrl ? (
                <a
                  href={tutor.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Telegram</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* Content Columns: Left (Bio, Packages, Videos) / Right (Socials, Qualifications, Credentials) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2-column Left Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* About the Tutor */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-3">
              <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0d5c4d]" />
                <span>About the Tutor & Teaching Methodology</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {tutor.bio ||
                  `${tutor.name} is a dedicated and highly qualified specialist educator conducting structured tuition batches, exam preparation sessions, and interactive practical masterclasses. Focused on deep concept clarity, personalized student progress, and outstanding academic results.`}
              </p>
            </div>

            {/* Video Lecture / Short Showcase */}
            {tutor.youtubeUrl && getYouTubeEmbedUrl(tutor.youtubeUrl) ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                    <Play className="h-4 w-4 fill-red-600 text-red-600" />
                    <span>Featured Video Lecture &amp; Demo</span>
                  </h3>
                  <a
                    href={tutor.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-black max-w-xl mx-auto">
                  <iframe
                    src={getYouTubeEmbedUrl(tutor.youtubeUrl) || ""}
                    title="Featured Demo Lecture"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : null}

            {/* Available Tuition Packages & Masterclasses */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#0d5c4d]" />
                    <span>Tuition Packages &amp; Masterclasses</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enroll directly to access live classes, lecture recordings, model papers, and tutes.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[11px] border border-emerald-200">
                  Admissions Open
                </span>
              </div>

              {tutor.packages && tutor.packages.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {tutor.packages.map((pkg) => {
                    const features = parsePackageFeatures(pkg.features);
                    return (
                      <div
                        key={pkg.id}
                        className="p-5 rounded-2xl bg-[#fbfdfc] border border-[#e2eae5] hover:border-[#0d5c4d] shadow-2xs space-y-4 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-teal-800">
                              ACTIVE BATCH
                            </span>
                            <h4 className="font-bold text-base text-[#0d2b26]">{pkg.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                              {pkg.description}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-mono font-black text-lg text-[#0d5c4d]">
                              LKR {pkg.price.toLocaleString()}
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase">
                              / {pkg.billingCycle}
                            </div>
                          </div>
                        </div>

                        {features.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                            {features.map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/student?enrollPackage=${pkg.id}&tutor=${tutor.publicSlug}`)}
                            className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-[#0d5c4d] hover:bg-[#0a473b] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>Enroll in Batch Now</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>

                          {tutor.whatsappNumber && (
                            <a
                              href={`https://wa.me/${tutor.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Hello Teacher ${tutor.name}, I want to enroll in ${pkg.title}.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <span>Inquire on WhatsApp</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-[#f8faf9] space-y-1">
                  <p className="text-xs font-bold text-slate-600">No study packages published currently</p>
                  <p className="text-[11px] text-slate-400">
                    Contact the tutor directly or check back soon for new semester admissions.
                  </p>
                </div>
              )}
            </div>

            {/* Public Study Resources (if any) */}
            {tutor.publicResources && tutor.publicResources.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Free Public Notes &amp; Learning Resources</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tutor.publicResources.map((res) => (
                    <div
                      key={res.id}
                      className="p-4 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-2 hover:border-[#0d5c4d] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {res.resourceType.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400">{res.year}</span>
                      </div>
                      <h5 className="font-bold text-xs text-[#0d2b26] line-clamp-1">{res.title}</h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{res.description}</p>
                      <button
                        onClick={() => router.push(`/student`)}
                        className="text-[11px] font-bold text-[#0d5c4d] hover:underline flex items-center gap-1 pt-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download via Student Portal</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Social Channels, Academic Credentials & Accreditations */}
          <div className="space-y-6">
            {/* Social & Community Channels Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#0d5c4d]" />
                <span>Connected Channels</span>
              </h3>
              <p className="text-xs text-slate-500">
                Follow lectures, revision discussions, and class updates across platforms.
              </p>

              <div className="space-y-2.5">
                {tutor.socialChannels && tutor.socialChannels.length > 0 ? (
                  tutor.socialChannels.map((soc) => (
                    <a
                      key={soc.id}
                      href={soc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] hover:border-[#0d5c4d] flex items-center justify-between gap-2 transition-all group"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="h-8 w-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <Play className="h-3.5 w-3.5 fill-red-600" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#0d2b26] truncate">{soc.title || soc.platform}</p>
                          <p className="text-[10px] text-slate-400 truncate">{soc.url}</p>
                        </div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0d5c4d] shrink-0" />
                    </a>
                  ))
                ) : null}

                {tutor.youtubeUrl && (
                  <a
                    href={tutor.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-red-50/50 border border-red-200/80 hover:bg-red-50 flex items-center justify-between gap-2 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                        <Play className="h-3.5 w-3.5 fill-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-red-900">YouTube Channel</p>
                        <p className="text-[10px] text-red-600">Video lectures & demos</p>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-red-500" />
                  </a>
                )}

                {tutor.whatsappNumber && (
                  <a
                    href={`https://wa.me/${tutor.whatsappNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 hover:bg-emerald-50 flex items-center justify-between gap-2 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        WA
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-900">Direct WhatsApp</p>
                        <p className="text-[10px] text-emerald-600">Immediate tuition inquiries</p>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                  </a>
                )}
              </div>
            </div>

            {/* Academic Credentials */}
            {tutor.qualifications && tutor.qualifications.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Academic Credentials</span>
                </h3>
                <div className="space-y-2.5">
                  {tutor.qualifications.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#0d5c4d]">
                        <span>{q.year}</span>
                        {q.honors && <span className="text-amber-700">{q.honors}</span>}
                      </div>
                      <h5 className="font-bold text-xs text-[#0d2b26]">{q.degree}</h5>
                      <p className="text-[11px] text-slate-500">{q.institution}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Accreditations */}
            {tutor.accreditations && tutor.accreditations.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                <h3 className="font-extrabold text-base text-[#0d2b26] flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#0d5c4d]" />
                  <span>Certifications &amp; Accreditations</span>
                </h3>
                <div className="space-y-2.5">
                  {tutor.accreditations.map((acc, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-[#f8faf9] border border-[#e2eae5] space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#0d5c4d]">
                        <span>{acc.year}</span>
                        {acc.certId && <span className="text-slate-400">ID: {acc.certId}</span>}
                      </div>
                      <h5 className="font-bold text-xs text-[#0d2b26]">{acc.name}</h5>
                      <p className="text-[11px] text-slate-500">{acc.issuer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Student Enrollment CTA Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0d2b26] to-[#0d5c4d] text-white shadow-md space-y-3">
              <h4 className="font-extrabold text-base text-white">Join {tutor.name}&apos;s Class</h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                Create a free student account on Newtoz LMS to join live streams, submit homework, and download study notes.
              </p>
              <button
                type="button"
                onClick={() => router.push("/student")}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors cursor-pointer"
              >
                Sign Up as a Student
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Newtoz LMS · Dedicated Educator Studio Ecosystem</p>
      </footer>
    </div>
  );
}
