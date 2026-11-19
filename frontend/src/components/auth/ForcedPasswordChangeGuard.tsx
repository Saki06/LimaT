
"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { ForcedPasswordChangeScreen } from "./ForcedPasswordChangeScreen";

export function ForcedPasswordChangeGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authUser, isSessionLoaded } = useApp();

  // Wait for session verification
  if (!isSessionLoaded) {
  return null;
}

  // Block application access until password is changed
  if (authUser?.mustChangePassword === true) {
    return <ForcedPasswordChangeScreen />;
  }

  return <>{children}</>;
}
