"use client";

import React, { useState, useEffect, useOptimistic } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// Client component for fetching user data and handling follow logic
const SingleUserClient = ({
  userId,
  referenceOnly = false,
}: {
  userId: string | null;
  referenceOnly?: boolean;
}) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Optimistic UI state
  const [optimisticFollowState, setOptimisticFollowState] = useOptimistic<
    boolean,
    { type: "follow" | "unfollow" }
  >(isFollowing, (state, action) => action.type === "follow");

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      // Get current user
      const {
        data: { user: currentUserData },
      } = await supabase.auth.getUser();
      const currentUserId = currentUserData?.id || null;
      setCurrentUser(currentUserId);

      // Get user data
      const { data: userData, error } = await supabase
        .from("users")
        .select("id, username, avatar_url")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
        return;
      }

      setUser(userData);

      // Check follow status if current user exists and is not the profile user
      if (currentUserId && currentUserId !== userId) {
        const { data: followData, error: followError } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", currentUserId)
          .eq("following_id", userId)
          .single();

        if (followError && followError.code !== "PGSQL_ERROR_NO_DATA_FOUND") {
          console.error("Error checking follow status:", followError);
        }

        setIsFollowing(!!followData);
      }

      setLoading(false);
    };

    fetchData();
  }, [userId]);

  const handleFollow = async () => {
    if (!userId || !currentUser || userId === currentUser) return;

    const supabase = createClient();

    // Update optimistic state immediately
    setOptimisticFollowState({ type: "follow" });

    try {
      const { error } = await supabase.from("follows").insert({
        follower_id: currentUser,
        following_id: userId,
      });

      if (error) throw error;

      // Update actual state after successful API call
      setIsFollowing(true);
      router.refresh();
    } catch (error) {
      console.error("Error following user:", error);
      // Revert optimistic update on error
      setOptimisticFollowState({ type: "unfollow" });
    }
  };

  const handleUnfollow = async () => {
    if (!userId || !currentUser || userId === currentUser) return;

    const supabase = createClient();

    // Update optimistic state immediately
    setOptimisticFollowState({ type: "unfollow" });

    try {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUser)
        .eq("following_id", userId);

      if (error) throw error;

      // Update actual state after successful API call
      setIsFollowing(false);
      router.refresh();
    } catch (error) {
      console.error("Error unfollowing user:", error);
      // Revert optimistic update on error
      setOptimisticFollowState({ type: "follow" });
    }
  };

  if (loading || !user) {
    return (
      <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-full max-w-[200px]"></div>
    );
  }

  const username = user.username || "";
  const avatar_url = user.avatar_url;
  const showFollowButton =
    !referenceOnly && currentUser && currentUser !== userId;

  return (
    <section className={`flex items-center gap-2`}>
      <article
        className={`relative w-8 h-8 rounded-full bg-dark dark:bg-light overflow-hidden`}
      >
        {avatar_url ? (
          <img src={avatar_url} alt={`Avatar photo of ${username}`} />
        ) : (
          <div
            className={`absolute left-0 top-0 right-0 bottom-0 grid place-content-center`}
          >
            <span className={`text-2xl font-accent text-primary`}>
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </article>

      <div className={`flex-grow inline-flex items-center`}>
        <Link
          href={`/profile/${username}`}
          className={`hover:opacity-65 transition-all duration-300 ease-in-out`}
        >
          <h3
            className={`max-w-[150px] xs:max-w-[250px] sm:max-w-full font-sans font-bold truncate`}
          >
            @{username || ""}
          </h3>
        </Link>
      </div>

      {showFollowButton && (
        <button
          onClick={optimisticFollowState ? handleUnfollow : handleFollow}
          className={`px-3 py-1 text-xs font-bold uppercase rounded-full transition-all duration-200 ${
            optimisticFollowState
              ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {optimisticFollowState ? "Unfollow" : "Follow"}
        </button>
      )}
    </section>
  );
};

// Server component wrapper that calls the client component
export default function SingleUser({
  userId,
  referenceOnly = false,
}: {
  userId: string | null;
  referenceOnly?: boolean;
}) {
  return <SingleUserClient userId={userId} referenceOnly={referenceOnly} />;
}
