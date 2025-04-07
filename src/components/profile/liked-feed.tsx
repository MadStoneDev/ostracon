"use client";

import { useState, useEffect } from "react";
import Post from "@/components/feed/single-post";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "../../../database.types";

// Types
type PostFragment = Database["public"]["Tables"]["fragments"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

export default function LikedFeed({
  username,
  userId,
  currentUserId,
}: {
  username: string;
  userId: string;
  currentUserId: string;
}) {
  const [posts, setPosts] = useState<PostFragment[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [settings, setSettings] = useState<{
    blur_sensitive_content: boolean;
    allow_sensitive_content: boolean;
  }>({
    blur_sensitive_content: true,
    allow_sensitive_content: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch user settings if it's not the profile owner viewing
      if (currentUserId && currentUserId !== userId) {
        const { data: userSettings } = await supabase
          .from("users")
          .select("settings")
          .eq("id", currentUserId)
          .single();

        if (userSettings?.settings) {
          setSettings(userSettings.settings as any);
        }
      }

      // Get posts that the user has reacted to
      const { data: reactions } = await supabase
        .from("fragment_reactions")
        .select("fragment_id")
        .eq("user_id", userId);

      if (reactions && reactions.length > 0) {
        const postIds = reactions.map((reaction) => reaction.fragment_id);

        // Get the actual fragments/posts
        let fragmentsQuery = supabase
          .from("fragments")
          .select()
          .in("id", postIds);

        // Filter NSFW content if:
        // 1. Current user is not the profile owner
        // 2. Current user has disabled NSFW content
        if (
          currentUserId !== userId &&
          settings.allow_sensitive_content === false
        ) {
          fragmentsQuery = fragmentsQuery.eq("is_nsfw", false);
        }

        const { data: fragments } = await fragmentsQuery;

        if (fragments) {
          setPosts(fragments);

          // Get unique user IDs from fragments
          const userIds = [
            ...new Set(fragments.map((fragment) => fragment.user_id)),
          ];

          // Fetch user data for post authors
          const { data: userData } = await supabase
            .from("users")
            .select()
            .in("id", userIds);

          if (userData) {
            const userMap = userData.reduce(
              (acc, user) => {
                acc[user.id] = user;
                return acc;
              },
              {} as Record<string, User>,
            );

            setUsers(userMap);
          }
        }
      }
    };

    fetchData();
  }, [userId, currentUserId, settings.allow_sensitive_content]);

  if (posts.length > 0) {
    return (
      <section className={`pb-[70px] transition-all duration-300 ease-in-out`}>
        {posts.map((post) => {
          const postUser = post.user_id ? users[post.user_id] : undefined;
          const isViewingOwnProfile = currentUserId === userId;
          const isOwnPost = post.user_id === currentUserId;

          return (
            <article
              key={`feed-post-${post.id}`}
              className={`border-b last-of-type:border-b-0 border-dark/10 dark:border-light/10 transition-all duration-300 ease-in-out`}
            >
              <Post
                postId={post.id}
                avatar_url={postUser?.avatar_url || ""}
                username={postUser?.username || ""}
                content={post.content || ""}
                nsfw={post.is_nsfw || false}
                commentsAllowed={post.comments_open ?? true}
                reactionsAllowed={post.reactions_open ?? true}
                // Never blur when:
                // 1. It's your own profile you're viewing, or
                // 2. It's your own post (regardless of whose profile you're on)
                blur={
                  !isViewingOwnProfile &&
                  !isOwnPost &&
                  settings.blur_sensitive_content
                }
                timestamp={post.created_at}
                userId={post.user_id || ""}
              />
            </article>
          );
        })}
      </section>
    );
  }

  return (
    <section
      className={`my-3 pb-[70px] opacity-50 transition-all duration-300 ease-in-out`}
    >
      {username} hasn't reacted to any posts yet.
    </section>
  );
}
