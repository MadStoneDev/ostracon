"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "./use-user";

// Get profile by username
export function useProfile(username: string) {
  const supabase = createClient();
  const { data: currentUser } = useUser();

  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, username, avatar_url, bio, is_moderator, settings")
        .eq("username", username)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw new Error("Profile not found");
      }

      return {
        ...data,
        isOwnProfile: currentUser?.id === data.id,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get follow relationship data
export function useFollowStats(userId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["followStats", userId],
    queryFn: async () => {
      // Get following count (parallel requests)
      const [followingResponse, followersResponse] = await Promise.all([
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", userId),
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", userId),
      ]);

      return {
        followingCount: followingResponse.count || 0,
        followersCount: followersResponse.count || 0,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!userId, // Only run if userId is available
  });
}

// Check follow status
export function useIsFollowing(profileUserId: string) {
  const supabase = createClient();
  const { data: currentUser } = useUser();

  return useQuery({
    queryKey: ["isFollowing", currentUser?.id, profileUserId],
    queryFn: async () => {
      if (!currentUser?.id || currentUser.id === profileUserId) {
        return false;
      }

      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentUser.id)
        .eq("following_id", profileUserId)
        .single();

      return !error && !!data;
    },
    enabled:
      !!currentUser?.id && !!profileUserId && currentUser.id !== profileUserId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
