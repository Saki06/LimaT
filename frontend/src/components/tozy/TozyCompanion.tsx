"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Sparkles,
  X,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Calendar,
  Layers,
  Heart,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Zap,
  Volume2,
  VolumeX,
  ExternalLink,
  Smile
} from "lucide-react";
import { TozyAnimatedMascot } from "./TozyAnimatedMascot";

const MOTIVATIONAL_QUOTES = [
  "Small steps every day lead to giant leaps in your future! 🌟",
  "Hard work beats talent when talent doesn't work hard. Keep pushing! 💪",
  "Your potential is endless. Go do what you were created to do! 🚀",
  "Mistakes are proof that you are trying and learning! ✨",
  "Shape Your Future with Newtoz — Believe in yourself today! 🐘🪽"
];

const STUDY_TIPS = [
  {
    title: "The 25-Minute Rule",
    tip: "Study for 25 minutes with full focus, then take a 5-minute break. Your brain retains 40% more info!"
  },
  {
    title: "Active Recall",
    tip: "Instead of just re-reading, test yourself on past papers and questions without looking at the answer first."
  },
  {
    title: "Teach What You Learn",
    tip: "Try explaining a concept to a friend or aloud to yourself. If you can explain it simply, you've mastered it!"
  }
];

export function TozyCompanion() {
  const { currentRole, currentView, setCurrentView, setIsLanding, setLandingPortal } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tips" | "timer" | "shortcuts">("tips");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [bubbleMessage, setBubbleMessage] = useState<string>("Hi friend! I'm Tozy 🐘🪽! Shape Your Future with Newtoz!");
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);

  // Focus Timer State (Pomodoro: 25 mins)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Auto-cycle speech bubble every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Update speech bubble based on current quote
  useEffect(() => {
    if (!isOpen) {
      setBubbleMessage(MOTIVATIONAL_QUOTES[quoteIndex]);
    }
  }, [quoteIndex, isOpen]);

  // Pomodoro countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setBubbleMessage("🎉 Focus session completed! Take a 5-minute breather, superstar!");
      setShowSpeechBubble(true);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleQuickAction = (action: string) => {
    if (action === "portal_selection") {
      setIsLanding(true);
      setLandingPortal("gateway");
      setIsOpen(false);
    } else if (action === "courses") {
      setIsLanding(false);
      setCurrentView("courses");
      setIsOpen(false);
    } else if (action === "past_papers") {
      setIsLanding(false);
      setCurrentView("past_papers");
      setIsOpen(false);
    } else if (action === "live_schedule") {
      setIsLanding(false);
      setCurrentView("live_schedule");
      setIsOpen(false);
    }
  };

  return (
    <aside aria-label="Tozy Companion" className="fixed bottom-5 right-5 z-50 flex flex-col items-end select-none pointer-events-auto">
      {/* Expanded Interactive Companion Card */}
      {isOpen && (
        <div className="mb-3 w-[340px] sm:w-[380px] bg-white/95 backdrop-blur-xl border-2 border-emerald-300/80 rounded-3xl shadow-[0_20px_50px_rgba(13,92,77,0.22)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 ring-4 ring-emerald-500/10">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0d5c4d] via-[#10705e] to-[#083e34] p-4 text-white relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/images/tozy_icon.jpg"
                  alt="Tozy Avatar"
                  className="w-12 h-12 rounded-full ring-2 ring-amber-300 shadow-md object-cover bg-white"
                />
                <span className="absolute -bottom-0.5 -right-0.5 bg-amber-400 text-slate-950 text-[9px] font-black px-1 rounded-full">
                  🪽
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-base tracking-tight text-white">Tozy</h3>
                  <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full">
                    Student Buddy
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 font-medium">
                  Shape Your Future • <span className="font-bold text-amber-300">newtoz.com</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close Tozy Helper"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-3.5 max-h-[420px] overflow-y-auto">
            {/* Friendly Greeting Speech Bubble */}
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-200/80 rounded-2xl p-3 text-xs text-[#0d2b26] relative flex items-start gap-2.5 shadow-2xs">
              <div className="text-xl shrink-0 mt-0.5">🐘</div>
              <div>
                <p className="font-semibold leading-relaxed">{bubbleMessage}</p>
                <p className="text-[10px] text-[#0d5c4d] font-bold mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Tozy is cheering for you!
                </p>
              </div>
            </div>

            {/* Quick Action Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab("tips")}
                className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === "tips"
                    ? "bg-white text-[#0d5c4d] shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                💡 Study Tips
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("timer")}
                className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === "timer"
                    ? "bg-white text-[#0d5c4d] shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                ⏱️ Focus Mode
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("shortcuts")}
                className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === "shortcuts"
                    ? "bg-white text-[#0d5c4d] shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                🚀 Quick Jump
              </button>
            </div>

            {/* TAB 1: STUDY TIPS */}
            {activeTab === "tips" && (
              <div className="space-y-2.5">
                {STUDY_TIPS.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 transition-all shadow-2xs space-y-1"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0d5c4d]">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>{tip.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">{tip.tip}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: POMODORO FOCUS TIMER */}
            {activeTab === "timer" && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white text-center space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Tozy Focus Studio
                </div>
                <div className="font-mono text-4xl font-black tracking-tight text-amber-300">
                  {formatTimer(timerSeconds)}
                </div>
                <p className="text-[11px] text-slate-300">
                  {isTimerRunning ? "Deep study mode in progress! Stay focused! 🎧" : "Ready for a 25-minute power study session?"}
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isTimerRunning ? "Pause" : "Start Focus"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(25 * 60);
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: QUICK JUMP SHORTCUTS */}
            {activeTab === "shortcuts" && (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickAction("portal_selection")}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 flex items-center justify-between text-left transition-all text-xs font-semibold text-slate-700 hover:text-[#0d5c4d] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Portal Selection (Welcome Screen)
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAction("courses")}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 flex items-center justify-between text-left transition-all text-xs font-semibold text-slate-700 hover:text-[#0d5c4d] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    Courses & Study Materials
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAction("past_papers")}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 flex items-center justify-between text-left transition-all text-xs font-semibold text-slate-700 hover:text-[#0d5c4d] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-600" />
                    Past Papers & Model Exams
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAction("live_schedule")}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 flex items-center justify-between text-left transition-all text-xs font-semibold text-slate-700 hover:text-[#0d5c4d] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    Live Classes & Timetable
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            )}
          </div>

          {/* Footer Motto */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-[#0d5c4d]">Newtoz • Shape Your Future</span>
            <span className="text-[10px]">Your Companion ✨</span>
          </div>
        </div>
      )}

      {/* Floating Mascot Trigger Button with Flapping Wings & Speech Bubble */}
      <div className="relative flex items-center gap-2.5">
        {/* Floating Mini Speech Bubble */}
        {!isOpen && showSpeechBubble && (
          <div
            onClick={() => setIsOpen(true)}
            className="cursor-pointer bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border-2 border-emerald-300 text-xs font-black text-[#0d2b26] max-w-[220px] animate-in fade-in slide-in-from-right-2 duration-300 flex items-center gap-2 group hover:border-[#0d5c4d]"
          >
            <span className="text-base">🐘</span>
            <span className="line-clamp-2 leading-tight group-hover:text-[#0d5c4d]">
              {bubbleMessage}
            </span>
          </div>
        )}

        {/* The Animated Tozy Mascot Avatar Button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setShowSpeechBubble(false);
          }}
          className="group relative p-1 rounded-full bg-gradient-to-tr from-cyan-400 via-emerald-400 to-amber-300 shadow-[0_10px_25px_rgba(13,92,77,0.3)] hover:shadow-[0_15px_35px_rgba(13,92,77,0.45)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-white"
          title="Click to talk with Tozy, your Newtoz student companion!"
        >
          {/* Animated Tozy Mascot */}
          <TozyAnimatedMascot size="sm" showSpeech={false} interactive={false} />

          {/* Online Buddy Indicator */}
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
        </button>
      </div>
    </aside>
  );
}
