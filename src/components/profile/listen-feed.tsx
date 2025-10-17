"use client";

import { useState, useEffect } from "react";
import SingleUser from "@/components/feed/single-user";

import type { Database } from "../../../database.types";

// Types
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function ListeningFeed({
  user,
  following,
}: {
  user: Profile;
  following: Profile[] | null;
}) {
  const [followingUsers, setFollowingUsers] = useState<Profile[]>([]);

  // Set following users when prop changes
  useEffect(() => {
    if (following) {
      setFollowingUsers(following);
    }
  }, [following]);

  if (!following || following.length === 0) {
    return (
      <section
        className={`my-3 pb-[70px] opacity-50 transition-all duration-300 ease-in-out`}
      >
        {user.username} isn't listening to anyone yet.
      </section>
    );
  }

  return (
    <section
      className={`mt-3 pb-[70px] space-y-3 transition-all duration-300 ease-in-out`}
    >
      {followingUsers.map((followedUser) => (
        <div
          key={`listening-${followedUser.id}`}
          className={`py-3 border-b border-dark/10 dark:border-light/10`}
        >
          <SingleUser userId={followedUser.id} />
        </div>
      ))}
    </section>
  );
}

export function ListenersFeed({
  user,
  followers,
}: {
  user: Profile;
  followers: Profile[] | null;
}) {
  const [followerUsers, setFollowerUsers] = useState<Profile[]>([]);

  // Set follower users when prop changes
  useEffect(() => {
    if (followers) {
      setFollowerUsers(followers);
    }
  }, [followers]);

  if (!followers || followers.length === 0) {
    return (
      <section
        className={`my-3 pb-[70px] opacity-50 transition-all duration-300 ease-in-out`}
      >
        {user.username} doesn't have any listeners yet.
      </section>
    );
  }

  return (
    <section
      className={`mt-3 pb-[70px] space-y-3 transition-all duration-300 ease-in-out`}
    >
      {followerUsers.map((follower) => (
        <div
          key={`listener-${follower.id}`}
          className={`py-3 border-b border-dark/10 dark:border-light/10`}
        >
          <SingleUser userId={follower.id} />
        </div>
      ))}
    </section>
  );
}
