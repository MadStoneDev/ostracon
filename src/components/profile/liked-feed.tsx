"use client";

import { useState, useEffect } from "react";
import Post from "@/components/feed/single-post";

import { User } from "@supabase/supabase-js";
import type { Database } from "../../../database.types";

// Types
type Profile = Database["public"]["Tables"]["users"]["Row"];
type Fragment = Database["public"]["Tables"]["fragments"]["Row"] & {
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  userLiked?: boolean;
  userCommented?: boolean;
};

export default function LikedFeed({
  currentUser,
  user,
  likedFeed,
  settings,
  userProfiles,
}: {
  currentUser: User;
  user: Profile;
  likedFeed: Fragment[] | null;
  settings: any;
  userProfiles: Record<string, Profile>;
}) {
  const [posts, setPosts] = useState<Fragment[]>([]);

  // Check if current user is the profile owner
  const isViewingOwnProfile = currentUser.id === user.id;

  useEffect(() => {
    if (!likedFeed) return;

    const filteredFragments = likedFeed.filter((post) => {
      // Show all posts if profile is of the current user
      if (currentUser.id === user.id) {
        return true;
      }

      // Filter out NSFW posts if user has disabled sensitive content
      return !(!settings?.allow_sensitive_content && post.is_nsfw);
    });

    setPosts(filteredFragments);
  }, [likedFeed, currentUser.id, user.id, settings?.allow_sensitive_content]);

  if (posts.length === 0) {
    return (
      <section
        className={`my-3 pb-[70px] opacity-50 transition-all duration-300 ease-in-out`}
      >
        {user.username} hasn't liked any posts yet.
      </section>
    );
  }

  return (
    <section className={`pb-[70px] transition-all duration-300 ease-in-out`}>
      {posts.map((post) => {
        const postUser = userProfiles[post.user_id || ""];

        if (!postUser) return null;

        return (
          <article
            key={`liked-post-${post.id}`}
            className={`border-b last-of-type:border-b-0 border-dark/10 dark:border-light/10 transition-all duration-300 ease-in-out`}
          >
            <Post
              postId={post.id}
              avatar_url={postUser?.avatar_url || ""}
              username={postUser?.username || ""}
              title={post.title || ""}
              content={post.content || ""}
              nsfw={post.is_nsfw || false}
              commentsAllowed={post.comments_open ?? true}
              reactionsAllowed={post.reactions_open ?? true}
              blur={!isViewingOwnProfile && settings?.blur_sensitive_content}
              timestamp={post.created_at}
              userId={post.user_id || ""}
              // Pass pre-fetched data to avoid loading delay
              initialLikeCount={post.likeCount || 0}
              initialCommentCount={post.commentCount || 0}
              initialViewCount={post.viewCount || 0}
              initialUserLiked={post.userLiked || false}
              initialUserCommented={post.userCommented || false}
            />
          </article>
        );
      })}
    </section>
  );
}
