// components/moderation-guard.tsx
"use client";

import React from "react";
import { User } from "@supabase/supabase-js";
import { useModerationPermissions } from "@/hooks/use-moderation-permissions";

interface ModerationGuardProps {
  user: User | null;
  requireAdmin?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ModerationGuard({
  user,
  requireAdmin = false,
  children,
  fallback = <div>Access denied</div>,
}: ModerationGuardProps) {
  const { permissions, isLoading } = useModerationPermissions(user);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  const hasAccess = requireAdmin
    ? permissions.canManageUsers
    : permissions.canModerate;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
