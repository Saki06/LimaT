"use client";

import React from "react";
import { QueryProvider } from "./QueryProvider";
import { AppProvider } from "@/context/AppContext";
import { AdminProvider } from "@/context/AdminContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppProvider>
        <AdminProvider>{children}</AdminProvider>
      </AppProvider>
    </QueryProvider>
  );
}
