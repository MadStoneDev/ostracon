"use client";

import BottomNav from "@/components/ui/bottom-nav";
import Post from "@/components/feed/single-post";
import PostComments from "@/components/feed/post-comments";
import { UserSettings } from "@/types/settings.types";
import type { Database } from "../../../database.types";

type FragmentRow = Database["public"]["Tables"]["fragments"]["Row"];
type GroupRow = Database["public"]["Tables"]["groups"]["Row"];
type FragmentWithUser = FragmentRow & {
  users?: {
    username: string;
    avatar_url?: string;
  };
  groups?: Pick<GroupRow, "name"> | null;
};

export default function PostScreen({
  postId,
  post,
  settings,
  authenticated,
  comments,
  currentUser,
}: {
  postId: string;
  post: FragmentWithUser;
  settings: any;
  authenticated: boolean;
  comments: any[];
  currentUser: any | null;
}) {
  // Determine if we should blur content based on settings
  const shouldBlur = settings ? Boolean(settings.blur_sensitive_content) : true;

  // Extract stats for Post component
  const initialLikeCount = 0; // You could prefetch this data too
  const initialCommentCount = comments?.length || 0;
  const initialViewCount = 0; // You could prefetch this data too
  const initialUserLiked = false; // You could prefetch this data too
  const initialUserCommented = comments
    ? comments.some((comment) => comment.user_id === currentUser?.id)
    : false;

  return (
    <>
      <div className="post-content">
        <Post
          postId={postId}
          avatar_url={post.users?.avatar_url || ""}
          username={post.users?.username || ""}
          content={post.content || ""}
          nsfw={post.is_nsfw || false}
          commentsAllowed={post.comments_open ?? true}
          reactionsAllowed={post.reactions_open ?? true}
          blur={shouldBlur}
          timestamp={post.created_at}
          groupId={post.group_id}
          groupName={post.groups?.name || ""}
          truncate={false}
          isExpanded={true}
          userId={post.user_id || ""}
          // Pass pre-fetched stats to Post component
          initialLikeCount={initialLikeCount}
          initialCommentCount={initialCommentCount}
          initialViewCount={initialViewCount}
          initialUserLiked={initialUserLiked}
          initialUserCommented={initialUserCommented}
        />
      </div>

      {/* Comments Section - Only show if comments are allowed */}
      {post.comments_open !== false && (
        <div className={`comments-container`}>
          <div className="h-[1px] bg-dark/20 dark:bg-light/20 mt-2 mb-4"></div>
          <PostComments
            postId={postId}
            initialComments={comments}
            currentUser={currentUser}
          />
        </div>
      )}

      {authenticated && <BottomNav />}
    </>
  );
}
