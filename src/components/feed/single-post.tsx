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
import { toggleFragmentReaction, deleteFragment } from "@/actions/fragment-actions";
import { saveFragment, unsaveFragment } from "@/actions/save-actions";

import SinglePostReply from "@/components/ui/single-post-reply";
import { PostHeader } from "@/components/feed/post/post-header";
import { PostTags } from "@/components/feed/post/post-tags";
import { PostContent } from "@/components/feed/post/post-content";
import { PostActions } from "@/components/feed/post/post-actions";
import { User } from "@supabase/supabase-js";

type PostState = {
  liked: boolean;
  likeCount: number;
  hasCommented: boolean;
  commentCount: number;
};

type PostProps = {
  postId: string;
  avatar_url: string;
  username: string;
  title?: string;
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
  authorId?: string;
  onDelete?: (postId: string) => void;
  // Pre-fetched data props
  initialLikeCount?: number;
  initialCommentCount?: number;
  initialUserLiked?: boolean;
  initialUserCommented?: boolean;
};

export default function Post({
  postId,
  avatar_url,
  username,
  title,
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
  authorId = "",
  onDelete,
  // Default values for pre-fetched data
  initialLikeCount = 0,
  initialCommentCount = 0,
  initialUserLiked = false,
  initialUserCommented = false,
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
  const [isDeleted, setIsDeleted] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Initialize state with pre-fetched data
  const [baseState, setBaseState] = useState<PostState>({
    liked: initialUserLiked,
    likeCount: initialLikeCount,
    hasCommented: initialUserCommented,
    commentCount: initialCommentCount,
  });

  const [isPending, startTransition] = useTransition();

  const [optimisticState, updateOptimisticState] = useOptimistic<
    PostState,
    Partial<PostState>
  >(baseState, (state, update) => ({ ...state, ...update }));

  const handleDeletePost = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      setIsDeleted(true);

      if (onDelete) {
        onDelete(postId);
      }

      const result = await deleteFragment(postId);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete post");
      }

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
      setCurrentUser(userData.user ?? null);

      if (!userData?.user) return;

      if (authorId) {
        setIsCurrentUserPost(userData.user.id === authorId);
      } else {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", userData.user.id)
          .single();

        setIsCurrentUserPost(userProfile?.username === username);
      }

      // Check saved status
      const { data: savedData } = await supabase
        .from("saved_fragments")
        .select("fragment_id")
        .eq("user_id", userData.user.id)
        .eq("fragment_id", postId)
        .maybeSingle();

      setIsSaved(!!savedData);
    };

    checkIfCurrentUserPost();
  }, [supabase, username, authorId, postId]);

  // Only fetch post data if not provided through props
  useEffect(() => {
    // If we have pre-fetched data for all metrics, no need to fetch again
    const hasAllPreFetchedData =
      initialLikeCount !== undefined &&
      initialCommentCount !== undefined &&
      initialUserLiked !== undefined &&
      initialUserCommented !== undefined;

    if (hasAllPreFetchedData) {
      return;
    }

    const fetchPostData = async () => {
      setIsDataLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const isLoggedIn = !!userData?.user;

        // Execute all queries in parallel for better performance
        const [likesResult, commentsResult] = await Promise.all([
          // Only fetch likes if not provided
          initialLikeCount === undefined || initialUserLiked === undefined
            ? supabase
                .from("fragment_reactions")
                .select("*", { count: "exact", head: true })
                .eq("fragment_id", postId)
                .eq("type", "like")
            : Promise.resolve(null),

          // Only fetch comments if not provided
          initialCommentCount === undefined ||
          initialUserCommented === undefined
            ? supabase
                .from("fragment_comments")
                .select("*", { count: "exact", head: true })
                .eq("fragment_id", postId)
            : Promise.resolve(null),
        ]);

        // Prepare updated state
        const stateUpdate: Partial<PostState> = {};

        // Only update if we needed to fetch
        if (likesResult) {
          stateUpdate.likeCount = likesResult.error
            ? 0
            : likesResult.count || 0;
        }

        if (commentsResult) {
          stateUpdate.commentCount = commentsResult.error
            ? 0
            : commentsResult.count || 0;
        }

        // Check the user's interactions only if logged in and not provided
        if (
          isLoggedIn &&
          (initialUserLiked === undefined || initialUserCommented === undefined)
        ) {
          const userId = userData.user.id;
          const interactions = await Promise.all([
            // Only fetch user liked status if not provided
            initialUserLiked === undefined
              ? supabase
                  .from("fragment_reactions")
                  .select("id")
                  .eq("fragment_id", postId)
                  .eq("user_id", userId)
                  .eq("type", "like")
                  .maybeSingle()
              : Promise.resolve(null),

            // Only fetch user commented status if not provided
            initialUserCommented === undefined
              ? supabase
                  .from("fragment_comments")
                  .select("id")
                  .eq("fragment_id", postId)
                  .eq("user_id", userId)
                  .limit(1)
                  .maybeSingle()
              : Promise.resolve(null),
          ]);

          const [userLikedResult, userCommentedResult] = interactions;

          if (userLikedResult) {
            stateUpdate.liked =
              !userLikedResult.error && !!userLikedResult.data;
          }

          if (userCommentedResult) {
            stateUpdate.hasCommented =
              !userCommentedResult.error && !!userCommentedResult.data;
          }
        }

        // Only update state if we have changes
        if (Object.keys(stateUpdate).length > 0) {
          setBaseState((prev) => ({
            ...prev,
            ...stateUpdate,
          }));
        }
      } catch (error) {
        console.error("Error fetching post data:", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    // Only run the fetch if we're missing some data
    if (!hasAllPreFetchedData) {
      console.log("Fetching post data...");
      fetchPostData();
    }
  }, [
    postId,
    supabase,
    initialLikeCount,
    initialCommentCount,
    initialUserLiked,
    initialUserCommented,
  ]);

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

    // Update optimistic state immediately
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

    // Update base state immediately to prevent flickering
    setBaseState((prev) => ({
      ...prev,
      liked: newLikedState,
      likeCount: Math.max(0, newLikeCount),
    }));

    try {
      const result = await toggleFragmentReaction(postId, "like");

      if (!result.success) {
        throw new Error(result.error || "Failed to update reaction");
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

  const handleToggleSave = useCallback(async () => {
    const previousSaved = isSaved;
    setIsSaved(!isSaved);

    try {
      const result = previousSaved
        ? await unsaveFragment(postId)
        : await saveFragment(postId);

      if (!result.success) {
        setIsSaved(previousSaved);
      }
    } catch {
      setIsSaved(previousSaved);
    }
  }, [isSaved, postId]);

  const handleCommentAdded = useCallback(() => {
    if (isPending) return;

    startTransition(() => {
      updateOptimisticState({
        hasCommented: true,
        commentCount: optimisticState.commentCount + 1,
      });
    });

    setBaseState((prev) => ({
      ...prev,
      hasCommented: true,
      commentCount: prev.commentCount + 1,
    }));
  }, [isPending, updateOptimisticState, optimisticState.commentCount]);

  // If this post has been deleted, don't render it
  if (isDeleted) {
    return null;
  }

  return (
    <div className="p-4 relative bg-neutral-200/70 dark:bg-neutral-50/10 rounded-lg transition-all duration-300 ease-in-out">
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
        authorId={authorId}
        currentUser={currentUser}
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
        title={title}
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
            isLoading={isDataLoading}
            isSaved={isSaved}
            onToggleSave={currentUser ? handleToggleSave : undefined}
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
