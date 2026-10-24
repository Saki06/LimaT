"use client";

import React, { useState } from "react";
import { Sparkles, Heart } from "lucide-react";

export interface TozyMascotProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  mood?: "welcoming" | "flying" | "reading" | "cheering" | "thinking";
  interactive?: boolean;
  showWings?: boolean;
  showSpeech?: boolean;
  speechText?: string;
  className?: string;
  onClick?: () => void;
}

export function TozyAnimatedMascot({
  size = "md",
  mood = "welcoming",
  interactive = true,
  showWings = true,
  showSpeech = false,
  speechText,
  className = "",
  onClick
}: TozyMascotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const sizeDimensions = {
    xs: { wrapper: "w-8 h-8", img: "w-8 h-8", wing: "w-3 h-3" },
    sm: { wrapper: "w-11 h-11", img: "w-11 h-11", wing: "w-4 h-4" },
    md: { wrapper: "w-20 h-20", img: "w-20 h-20", wing: "w-7 h-7" },
    lg: { wrapper: "w-32 h-32", img: "w-32 h-32", wing: "w-10 h-10" },
    xl: { wrapper: "w-48 h-48", img: "w-48 h-48", wing: "w-14 h-14" },
    hero: { wrapper: "w-64 h-64 sm:w-72 sm:h-72", img: "w-64 h-64 sm:w-72 sm:h-72", wing: "w-20 h-20" }
  }[size];

  const handleClick = () => {
    setIsWaving(true);
    setShowHeart(true);
    setTimeout(() => setIsWaving(false), 1200);
    setTimeout(() => setShowHeart(false), 2000);
    if (onClick) onClick();
  };

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Interactive Speech Bubble */}
      {(showSpeech || isHovered) && speechText && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border-2 border-emerald-300 text-[11px] font-black text-[#0d2b26] whitespace-nowrap flex items-center gap-1.5">
            <span className="text-amber-500">✨</span>
            <span>{speechText}</span>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-emerald-300 rotate-45" />
          </div>
        </div>
      )}

      {/* Floating Sparkles & Hearts */}
      {showHeart && (
        <div className="absolute -top-6 right-2 z-30 pointer-events-none animate-bounce">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
        </div>
      )}

      <div
        onClick={interactive ? handleClick : undefined}
        className={`relative ${sizeDimensions.wrapper} flex items-center justify-center ${
          interactive ? "cursor-pointer" : ""
        } animate-tozy-float transition-transform duration-300 ${
          isHovered ? "scale-105" : "scale-100"
        }`}
        title={interactive ? "Click Tozy for a friendly high-five!" : undefined}
      >
        {/* Luminous Glow Halo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-300/30 via-emerald-300/20 to-amber-300/30 blur-md animate-tozy-glow pointer-events-none" />

        {/* Left Wing (Animated Fluttering) */}
        {showWings && (
          <div
            className={`absolute -left-3 sm:-left-4 top-1/4 z-0 pointer-events-none ${
              isHovered || isWaving ? "animate-tozy-wing-left" : "animate-tozy-wing-left"
            }`}
            style={{ animationDuration: isHovered ? "0.35s" : "0.75s" }}
          >
            <svg
              className={`${sizeDimensions.wing} text-cyan-200 drop-shadow-[0_2px_4px_rgba(56,189,248,0.4)]`}
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path
                d="M90,70 C70,60 50,45 30,10 C15,35 10,60 20,80 C35,90 65,90 90,70 Z"
                fill="url(#wingGradientL)"
              />
              <path
                d="M80,60 C65,50 45,35 35,20 C25,40 22,60 30,75 C45,80 65,75 80,60 Z"
                fill="#ffffff"
                fillOpacity="0.75"
              />
              <defs>
                <linearGradient id="wingGradientL" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#bae6fd" />
                  <stop offset="50%" stopColor="#e0f2fe" />
                  <stop offset="100%" stopColor="#7dd3fc" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {/* Right Wing (Animated Fluttering) */}
        {showWings && (
          <div
            className={`absolute -right-3 sm:-right-4 top-1/4 z-0 pointer-events-none ${
              isHovered || isWaving ? "animate-tozy-wing-right" : "animate-tozy-wing-right"
            }`}
            style={{ animationDuration: isHovered ? "0.35s" : "0.75s" }}
          >
            <svg
              className={`${sizeDimensions.wing} text-cyan-200 drop-shadow-[0_2px_4px_rgba(56,189,248,0.4)]`}
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path
                d="M10,70 C30,60 50,45 70,10 C85,35 90,60 80,80 C65,90 35,90 10,70 Z"
                fill="url(#wingGradientR)"
              />
              <path
                d="M20,60 C35,50 55,35 65,20 C75,40 78,60 70,75 C55,80 35,75 20,60 Z"
                fill="#ffffff"
                fillOpacity="0.75"
              />
              <defs>
                <linearGradient id="wingGradientR" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#bae6fd" />
                  <stop offset="50%" stopColor="#e0f2fe" />
                  <stop offset="100%" stopColor="#7dd3fc" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {/* Mascot Center Image */}
        <div className="relative z-10 w-full h-full flex items-center justify-center drop-shadow-[0_8px_16px_rgba(13,92,77,0.18)]">
          <img
            src="/images/tozy_icon.jpg"
            alt="Tozy the winged baby elephant - Newtoz mascot"
            className="w-full h-full object-contain rounded-full ring-2 ring-emerald-300/40 p-0.5 bg-white/80"
          />
        </div>

        {/* Sparkling Stars */}
        <div className="absolute -top-1 -right-1 z-20 pointer-events-none animate-tozy-sparkle">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-300" />
        </div>
      </div>
    </div>
  );
}
