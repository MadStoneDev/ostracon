"use client";

import { User } from "@supabase/supabase-js";
import type { Database } from "../../../database.types";
import Post from "@/components/feed/single-post";
import { IconBookmark } from "@tabler/icons-react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Fragment = Database["public"]["Tables"]["fragments"]["Row"] & {
  likeCount?: number;
  commentCount?: number;
  userLiked?: boolean;
  userCommented?: boolean;
};

export default function SavedFeed({
  currentUser,
  initialSavedFeed,
  userProfiles,
}: {
  currentUser: User;
  initialSavedFeed: Fragment[] | null;
  userProfiles: Record<string, Profile>;
}) {
  const posts = initialSavedFeed || [];

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center">
        <IconBookmark size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-gray-500">No saved posts yet.</p>
        <p className="text-gray-400 text-sm mt-2">
          Bookmark posts to find them here later.
        </p>
      </div>
    );
  }

  return (
    <section
      className="mt-3 pb-[70px] space-y-3 transition-all duration-300 ease-in-out"
    >
      {posts.map((post) => {
        const postUser = userProfiles[post.user_id || ""];

        if (!postUser) return null;

        return (
          <article
            key={`saved-post-${post.id}`}
            className="transition-all duration-300 ease-in-out"
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
    </section>
  );
}
