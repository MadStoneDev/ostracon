"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserX, UserCheck } from "lucide-react";

interface BannedUser {
  user_id: string;
  banned_at: string;
  banned_by: string;
  reason: string | null;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface CommunityBannedUsersProps {
  communityName: string;
  bannedUsers: BannedUser[];
}

export function CommunityBannedUsers({
  communityName,
  bannedUsers: initialBannedUsers,
}: CommunityBannedUsersProps) {
  const router = useRouter();
  const [bannedUsers, setBannedUsers] = useState(initialBannedUsers);
  const [isLoading, setIsLoading] = useState(false);

  const unbanUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to unban ${username}?`)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/communities/${communityName}/bans/${userId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to unban user");
      }

      setBannedUsers(bannedUsers.filter((u) => u.user_id !== userId));
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to unban user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {bannedUsers.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No banned users
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {bannedUsers.map((ban) => (
            <div
              key={ban.user_id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {ban.profiles.avatar_url ? (
                  <Image
                    src={ban.profiles.avatar_url}
                    alt={ban.profiles.username}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <UserX className="h-5 w-5 text-red-600" />
                  </div>
                )}

                <div>
                  <p className="font-medium">{ban.profiles.username}</p>
                  <p className="text-xs text-muted-foreground">
                    Banned {new Date(ban.banned_at).toLocaleDateString()}
                  </p>
                  {ban.reason && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Reason: {ban.reason}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => unbanUser(ban.user_id, ban.profiles.username)}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1 text-sm border border-green-600 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
              >
                <UserCheck className="h-4 w-4" />
                Unban
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
