"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { IconShieldCheck, IconSettings } from "@tabler/icons-react";
import { useModerationPermissions } from "@/hooks/use-moderation-permissions";

interface ModerationLinkProps {
  user: User;
  className?: string;
  showAdminLink?: boolean;
}

export default function ModerationLink({
  user,
  className = "",
  showAdminLink = true,
}: ModerationLinkProps) {
  const { permissions, isLoading } = useModerationPermissions(user);

  if (isLoading || !permissions.canModerate) {
    return null;
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {permissions.canModerate && (
        <Link
          href="/moderation"
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
        >
          <IconShieldCheck className="w-4 h-4" />
          Moderation
        </Link>
      )}

      {permissions.canManageUsers && showAdminLink && (
        <Link
          href="/moderation?tab=users"
          className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          <IconSettings className="w-4 h-4" />
          Admin
        </Link>
      )}
    </div>
  );
}
