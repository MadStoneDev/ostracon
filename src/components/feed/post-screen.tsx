"use client";

import BottomNav from "@/components/ui/bottom-nav";
import Post from "@/components/feed/single-post";
import PostComments from "@/components/feed/post-comments";

import type { Database } from "../../../database.types";

type FragmentRow = Database["public"]["Tables"]["fragments"]["Row"];
type CommunityRow = Database["public"]["Tables"]["communities"]["Row"];
type EnhancedFragment = FragmentRow & {
  users?: {
    username: string;
    avatar_url?: string;
    id?: string;
  };
  groups?: Pick<CommunityRow, "name" | "id"> | null;
  likeCount: number;
  commentCount: number;
  userLiked: boolean;
  userCommented: boolean;
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
  post: EnhancedFragment;
  settings: any;
  authenticated: boolean;
  comments: any[];
  currentUser: any | null;
}) {
  // Determine if we should blur content based on settings
  const shouldBlur = settings ? Boolean(settings.blur_sensitive_content) : true;

  return (
    <>
      <div className="post-content">
        <Post
          postId={postId}
          avatar_url={post.users?.avatar_url || ""}
          username={post.users?.username || ""}
          title={post.title || ""}
          content={post.content || ""}
          nsfw={post.is_nsfw || false}
          commentsAllowed={post.comments_open ?? true}
          reactionsAllowed={post.reactions_open ?? true}
          blur={shouldBlur}
          timestamp={post.published_at || ""}
          groupId={post.community_id}
          groupName={post.groups?.name || ""}
          truncate={false}
          isExpanded={true}
          authorId={post.user_id || ""}
          // Pass interaction data from enhanced post
          initialLikeCount={post.likeCount}
          initialCommentCount={post.commentCount || comments?.length || 0}
          initialUserLiked={post.userLiked}
          initialUserCommented={post.userCommented}
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
