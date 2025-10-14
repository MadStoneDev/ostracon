// hooks/use-moderation-permissions.ts
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { getUserPermissions, UserPermissions } from "@/utils/moderation";

export function useModerationPermissions(user: User | null) {
  const [permissions, setPermissions] = useState<UserPermissions>({
    isModerator: false,
    isAdmin: false,
    canModerate: false,
    canManageUsers: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserPermissions(user.id).then((perms) => {
        setPermissions(perms);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return { permissions, isLoading };
}
