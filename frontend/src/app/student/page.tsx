"use client";

import React from "react";
import { LandingView } from "@/components/auth/LandingView";
import { ToastContainer } from "@/components/ui/toast";
import { useApp } from "@/context/AppContext";

export default function StudentPortalPage() {
  const { theme, setIsLanding } = useApp();

  return (
    <div className={theme === "dark" ? "dark bg-slate-950" : "bg-[#fbfcfb]"}>
      <LandingView initialPortal="student" onEnterApp={() => setIsLanding(false)} />
      <ToastContainer />
    </div>
  );
}
