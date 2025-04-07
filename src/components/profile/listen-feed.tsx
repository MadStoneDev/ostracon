"use client";

import { useState, useEffect } from "react";
import SingleUser from "@/components/feed/single-user";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "../../../database.types";

// Types
type User = Database["public"]["Tables"]["users"]["Row"];

export function ListeningFeed({
  username,
  userId,
}: {
  username: string;
  userId: string;
}) {
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchFollowing = async () => {
      const supabase = createClient();

      // First get all following_ids
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

      if (follows && follows.length > 0) {
        // Then get all users that match these IDs
        const followingIds = follows.map((follow) => follow.following_id);
        const { data: users } = await supabase
          .from("users")
          .select("*")
          .in("id", followingIds);

        if (users) {
          setFollowedUsers(users);
        }
      }
    };

    fetchFollowing();
  }, [userId]);

  if (followedUsers.length === 0) {
    return (
      <section
        className={`my-3 pb-[70px] opacity-50 transition-all duration-300 ease-in-out`}
      >
        {username} isn't listening to anyone yet.
      </section>
    );
  }

  return (
    <section className={`pb-[80px] transition-all duration-300 ease-in-out`}>
      {followedUsers.map((user) => (
        <div
          key={`listening-${user.id}`}
          className={`py-3 border-b border-dark/10 dark:border-light/10`}
        >
          <SingleUser userId={user.id} />
        </div>
      ))}
    </section>
  );
}

export function ListenersFeed({
  username,
  userId,
}: {
  username: string;
  userId: string;
}) {
  const [followers, setFollowers] = useState<User[]>([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      const supabase = createClient();

      // First get all follower_ids
      const { data: follows } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId);

      if (follows && follows.length > 0) {
        // Then get all users that match these IDs
        const followerIds = follows.map((follow) => follow.follower_id);
        const { data: users } = await supabase
          .from("users")
          .select("*")
          .in("id", followerIds);

        if (users) {
          setFollowers(users);
        }
      }
    };

    fetchFollowers();
  }, [userId]);

  if (followers.length === 0) {
    return (
      <section
        className={`my-3 pb-[70px] opacity-50 transition-all duration-300 ease-in-out`}
      >
        {username} doesn't have any listeners yet.
      </section>
    );
  }

  return (
    <section className={`pb-[80px] transition-all duration-300 ease-in-out`}>
      {followers.map((user) => (
        <div
          key={`listener-${user.id}`}
          className={`py-3 border-b border-dark/10 dark:border-light/10`}
        >
          <SingleUser userId={user.id} />
        </div>
      ))}
    </section>
  );
}
