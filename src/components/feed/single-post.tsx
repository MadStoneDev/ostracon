"use client";

import { useRouter } from "next/navigation";
import React, {
  useState,
  useEffect,
  useOptimistic,
  useTransition,
  useCallback,
} from "react";

import { createClient } from "@/utils/supabase/client";

import SinglePostReply from "@/components/ui/single-post-reply";
import { PostState } from "@/types/fragments";
import { PostHeader } from "@/components/feed/post/post-header";
import { PostTags } from "@/components/feed/post/post-tags";
import { PostContent } from "@/components/feed/post/post-content";
import { PostActions } from "@/components/feed/post/post-actions";

type PostProps = {
  postId: string;
  avatar_url: string;
  username: string;
  content: string;
  nsfw: boolean;
  commentsAllowed?: boolean;
  reactionsAllowed?: boolean;
  blur?: boolean;
  groupId?: string | null;
  groupName?: string;
  timestamp: string;
  truncate?: boolean;
  isExpanded?: boolean;
  referenceOnly?: boolean;
  userId?: string;
  onDelete?: (postId: string) => void; // New callback prop for optimistic deletion
};

export default function Post({
  postId,
  avatar_url,
  username,
  content,
  nsfw,
  commentsAllowed = true,
  reactionsAllowed = true,
  groupId = null,
  groupName = "",
  blur = true,
  timestamp,
  truncate = true,
  isExpanded = false,
  referenceOnly = false,
  userId = "",
  onDelete,
}: PostProps) {
  // Hooks
  const router = useRouter();
  const supabase = createClient();

  // State management
  const [isCurrentUserPost, setIsCurrentUserPost] = useState(false);
  const [blurred, setBlurred] = useState(nsfw && blur);
  const [showOptions, setShowOptions] = useState(false);
  const [startReply, setStartReply] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false); // Track if this post has been deleted

  // Base states with initial values
  const [baseState, setBaseState] = useState<PostState>({
    liked: false,
    likeCount: 0,
    hasCommented: false,
    commentCount: 0,
    viewCount: 0,
  });

  // Add transition for wrapping optimistic updates
  const [isPending, startTransition] = useTransition();

  // Optimistic state updates
  const [optimisticState, updateOptimisticState] = useOptimistic<
    PostState,
    Partial<PostState>
  >(baseState, (state, update) => ({ ...state, ...update }));

  // Handle post deletion
  const handleDeletePost = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Verify the user is authenticated
      const { data: userData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !userData?.user) {
        throw new Error("You must be logged in to delete this post.");
      }

      // Verify this is the user's post
      if (userData.user.id !== userId) {
        throw new Error("You can only delete your own posts.");
      }

      // Optimistically mark as deleted
      setIsDeleted(true);

      // Notify parent feed about the deletion
      if (onDelete) {
        onDelete(postId);
      }

      // Delete the post in the database
      const { error: deleteError } = await supabase
        .from("fragments")
        .delete()
        .eq("id", postId);

      if (deleteError) throw deleteError;

      // If we're on the individual post page, redirect to explore
      if (isExpanded) {
        router.push("/explore");
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      // Revert the optimistic deletion
      setIsDeleted(false);
      setDeleteError(
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Failed to delete post.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if this post belongs to the current user - Run once on mount
  useEffect(() => {
    const checkIfCurrentUserPost = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) return;

      if (userId) {
        setIsCurrentUserPost(userData.user.id === userId);
      } else {
        const { data: userProfile } = await supabase
          .from("users")
          .select("username")
          .eq("id", userData.user.id)
          .single();

        setIsCurrentUserPost(userProfile?.username === username);
      }
    };

    checkIfCurrentUserPost();
  }, [supabase, username, userId]);

  // Fetch reaction, comment counts, and user interactions in a single effect
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const isLoggedIn = !!userData?.user;

        // Prepare all queries
        const likesCountQuery = supabase
          .from("fragment_reactions")
          .select("*", { count: "exact", head: true })
          .eq("fragment_id", postId)
          .eq("type", "like");

        const commentsCountQuery = supabase
          .from("fragment_comments")
          .select("*", { count: "exact", head: true })
          .eq("fragment_id", postId);

        const analyticsQuery = supabase
          .from("fragment_analytics")
          .select("views")
          .eq("fragment_id", postId)
          .maybeSingle();

        // Execute base queries
        const [likesResult, commentsResult, analyticsResult] =
          await Promise.all([
            likesCountQuery,
            commentsCountQuery,
            analyticsQuery,
          ]);

        // Prepare update object
        const stateUpdate: PostState = {
          likeCount: likesResult.error ? 0 : likesResult.count || 0,
          commentCount: commentsResult.error ? 0 : commentsResult.count || 0,
          viewCount:
            analyticsResult.error || !analyticsResult.data
              ? 0
              : analyticsResult.data.views,
          liked: false,
          hasCommented: false,
        };

        // If logged in, check for user interactions
        if (isLoggedIn) {
          const userId = userData.user.id;

          // Important: Check if user has EVER commented on this post
          const userCommentedQuery = supabase
            .from("fragment_comments")
            .select("id")
            .eq("fragment_id", postId)
            .eq("user_id", userId)
            .limit(1) // We only need to know if at least one exists
            .maybeSingle();

          const userLikedQuery = supabase
            .from("fragment_reactions")
            .select("id")
            .eq("fragment_id", postId)
            .eq("user_id", userId)
            .eq("type", "like")
            .maybeSingle();

          const [userLikedResult, userCommentedResult] = await Promise.all([
            userLikedQuery,
            userCommentedQuery,
          ]);

          stateUpdate.liked = !userLikedResult.error && !!userLikedResult.data;
          stateUpdate.hasCommented =
            !userCommentedResult.error && !!userCommentedResult.data;
        }

        // Update state at once
        setBaseState(stateUpdate);
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    fetchPostData();
  }, [postId, supabase]);

  // Update blurred state when nsfw or blur props change
  useEffect(() => {
    setBlurred(nsfw && blur);
  }, [nsfw, blur]);

  // Ensure start reply is false if comments are not allowed
  useEffect(() => {
    if (!commentsAllowed && startReply) {
      setStartReply(false);
    }
  }, [commentsAllowed, startReply]);

  // Memoized handlers to prevent re-creation on each render
  const handleLike = useCallback(async () => {
    if (!reactionsAllowed || isPending) return;

    // Check if user is logged in
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      router.push("/login");
      return;
    }

    // Calculate new states
    const newLikedState = !optimisticState.liked;
    const newLikeCount = optimisticState.likeCount + (newLikedState ? 1 : -1);

    // Update optimistic state
    startTransition(() => {
      updateOptimisticState({
        liked: newLikedState,
        likeCount: Math.max(0, newLikeCount),
      });
    });

    // Save previous state for rollback
    const previousState = {
      liked: baseState.liked,
      likeCount: baseState.likeCount,
    };

    // Update base state to prevent flickering
    setBaseState((prev) => ({
      ...prev,
      liked: newLikedState,
      likeCount: Math.max(0, newLikeCount),
    }));

    try {
      if (newLikedState) {
        // Add like
        const { error } = await supabase.from("fragment_reactions").insert({
          fragment_id: postId,
          user_id: userData.user.id,
          type: "like",
        });

        if (error) throw error;
      } else {
        // Remove like
        const { error } = await supabase
          .from("fragment_reactions")
          .delete()
          .eq("fragment_id", postId)
          .eq("user_id", userData.user.id)
          .eq("type", "like");

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error updating like:", error);

      // Revert both states on error
      setBaseState((prev) => ({
        ...prev,
        liked: previousState.liked,
        likeCount: previousState.likeCount,
      }));

      startTransition(() => {
        updateOptimisticState({
          liked: previousState.liked,
          likeCount: previousState.likeCount,
        });
      });
    }
  }, [
    reactionsAllowed,
    isPending,
    supabase,
    router,
    optimisticState.liked,
    optimisticState.likeCount,
    baseState.liked,
    baseState.likeCount,
    postId,
    updateOptimisticState,
  ]);

  const handleCommentAdded = useCallback(() => {
    if (isPending) return;

    startTransition(() => {
      updateOptimisticState({
        hasCommented: true,
        commentCount: baseState.commentCount + 1,
      });
    });

    setBaseState((prev) => ({
      ...prev,
      hasCommented: true,
      commentCount: prev.commentCount + 1,
    }));
  }, [isPending, updateOptimisticState, baseState.commentCount]);

  // If this post has been deleted, don't render it
  if (isDeleted) {
    return null;
  }

  return (
    <div className="py-4 relative">
      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-50/90 dark:bg-neutral-800/90 rounded-md">
          <div className="p-6 max-w-sm">
            <h3 className="text-lg font-bold mb-2 text-dark dark:text-light">
              Delete Post
            </h3>
            <p className="mb-6 text-dark dark:text-light">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>

            {deleteError && (
              <div className="mb-4 p-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-dark dark:text-light hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <PostHeader
        avatar_url={avatar_url}
        username={username}
        timestamp={timestamp}
        isCurrentUserPost={isCurrentUserPost}
        showOptions={showOptions}
        setShowOptions={setShowOptions}
        postId={postId}
        referenceOnly={referenceOnly}
        setShowDeleteConfirm={setShowDeleteConfirm}
      />

      <PostTags
        nsfw={nsfw}
        blurred={blurred}
        setBlurred={setBlurred}
        groupId={groupId}
        groupName={groupName}
      />

      <PostContent
        nsfw={nsfw}
        blurred={blurred}
        isExpanded={isExpanded}
        router={router}
        postId={postId}
        content={content}
        truncate={truncate}
      />

      {!referenceOnly && (
        <>
          <PostActions
            blurred={blurred}
            reactionsAllowed={reactionsAllowed}
            optimisticState={optimisticState}
            isPending={isPending}
            handleLike={handleLike}
            commentsAllowed={commentsAllowed}
            setStartReply={setStartReply}
            startReply={startReply}
            postId={postId}
          />

          {commentsAllowed && (
            <SinglePostReply
              startReply={startReply}
              setStartReply={setStartReply}
              avatarUrl={avatar_url}
              username={username}
              postId={postId}
              content={content}
              truncate={truncate}
              isExpanded={isExpanded}
              onCommentAdded={handleCommentAdded}
            />
          )}
        </>
      )}
    </div>
  );
}
