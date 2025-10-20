"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import type { Database } from "../../../database.types";
import { fetchLikedFeedWithInteractions } from "@/utils/supabase/fetch-supabase";
import { usePagination } from "@/hooks/usePagination";
import Post from "@/components/feed/single-post";
import { IconSquareRoundedPlus } from "@tabler/icons-react";
import Link from "next/link";

// Types
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Fragment = Database["public"]["Tables"]["fragments"]["Row"] & {
  likeCount?: number;
  commentCount?: number;
  userLiked?: boolean;
  userCommented?: boolean;
};

export default function LikedFeed({
  currentUser,
  user,
  initialLikedFeed,
  settings,
  userProfiles,
}: {
  currentUser: User;
  user: Profile;
  initialLikedFeed: Fragment[] | null;
  settings: any;
  userProfiles: Record<string, Profile>;
}) {
  const {
    data: posts,
    loadMore,
    isLoading,
    hasMore,
  } = usePagination({
    initialData: initialLikedFeed || [],
    fetchMoreData: async (page) =>
      await fetchLikedFeedWithInteractions(user.id, currentUser.id, page),
  });

  // Check if current user is viewing their own profile
  const isViewingOwnProfile = currentUser.id === user.id;

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">
          {user.username} hasn't liked any posts yet.
        </p>

        {isViewingOwnProfile && (
          <Link
            href={"/explore"}
            className={`my-6 px-4 py-2 inline-flex gap-2 justify-center items-center rounded-full hover:bg-dark dark:hover:bg-light border border-dark dark:border-light hover:text-light dark:hover:text-dark transition-all duration-300 ease-in-out`}
          >
            <IconSquareRoundedPlus size={24} />
            Explore and like some posts!
          </Link>
        )}
      </div>
    );
  }

  return (
    <section
      className={`mt-3 pb-[70px] space-y-3 transition-all duration-300 ease-in-out`}
    >
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
              timestamp={post.published_at || post.created_at!}
              authorId={post.user_id || ""}
              initialLikeCount={post.likeCount || 0}
              initialCommentCount={post.commentCount || 0}
              initialUserLiked={post.userLiked || false}
              initialUserCommented={post.userCommented || false}
            />
          </article>
        );
      })}

      {!isLoading && posts.length > 0 && (
        <div className="py-4 text-center">
          {hasMore ? (
            <button
              onClick={loadMore}
              disabled={isLoading}
              className={`px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
            >
              {isLoading ? "Loading..." : "Load More Liked Posts"}
            </button>
          ) : (
            <p className="text-gray-500 text-sm">No more liked posts to show</p>
          )}
        </div>
      )}
    </section>
  );
}
