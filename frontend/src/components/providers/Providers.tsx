
"use client";

import React from "react";
import { QueryProvider } from "./QueryProvider";
import { AppProvider } from "@/context/AppContext";
import { AdminProvider } from "@/context/AdminContext";
import { ForcedPasswordChangeGuard } from "@/components/auth/ForcedPasswordChangeGuard";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppProvider>
        <AdminProvider>
          <ForcedPasswordChangeGuard>
            {children}
          </ForcedPasswordChangeGuard>
        </AdminProvider>
      </AppProvider>
    </QueryProvider>
  );
}
