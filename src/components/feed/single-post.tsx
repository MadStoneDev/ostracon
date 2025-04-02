"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, {
  useState,
  useEffect,
  useOptimistic,
  useTransition,
  useCallback,
} from "react";

import { createClient } from "@/utils/supabase/client";
import { formatTimestamp } from "@/lib/fragments";

import {
  IconChartBarPopular,
  IconClock,
  IconDotsVertical,
  IconFlag,
  IconHeart,
  IconHeartFilled,
  IconHeartOff,
  IconMessage2,
  IconMessage2Off,
  IconMessageFilled,
  IconPencil,
  IconSkull,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";

import UserAvatar from "@/components/ui/user-avatar";
import SinglePostReply from "@/components/ui/single-post-reply";
import HtmlContent from "@/components/feed/html-content-renderer";

// Define types outside component for better readability
type PostState = {
  liked: boolean;
  likeCount: number;
  hasCommented: boolean;
  commentCount: number;
  viewCount: number;
};

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
};

type PostHeaderProps = {
  avatar_url: string;
  username: string;
  timestamp: string;
  isCurrentUserPost: boolean;
  showOptions: boolean;
  setShowOptions: (value: boolean) => void;
  postId: string;
  referenceOnly?: boolean;
};

type PostOptionsProps = {
  postId: string;
  isCurrentUserPost: boolean;
  showOptions: boolean;
  setShowOptions: (value: boolean) => void;
};

type PostTagsProps = {
  nsfw: boolean;
  blurred: boolean;
  setBlurred: (value: boolean) => void;
  groupId?: string | null;
  groupName?: string;
};

type PostContentProps = {
  nsfw: boolean;
  blurred: boolean;
  isExpanded?: boolean;
  router: ReturnType<typeof useRouter>;
  postId: string;
  content: string;
  truncate?: boolean;
};

type PostActionsProps = {
  blurred: boolean;
  reactionsAllowed?: boolean;
  optimisticState: PostState;
  isPending: boolean;
  handleLike: () => Promise<void>;
  commentsAllowed?: boolean;
  setStartReply: (value: boolean) => void;
  startReply: boolean;
  postId: string;
};

// Create separate components for better code organization
const PostHeader = React.memo(
  ({
    avatar_url,
    username,
    timestamp,
    isCurrentUserPost,
    showOptions,
    setShowOptions,
    postId,
    referenceOnly,
  }: PostHeaderProps) => (
    <section className="flex justify-between items-center gap-2 text-dark dark:text-light transition-all duration-300 ease-in-out">
      <UserAvatar avatar_url={avatar_url} username={username} />

      <div className="flex-grow inline-flex items-center">
        <Link
          href={`/profile/${username}`}
          className="hover:opacity-65 transition-all duration-300 ease-in-out"
        >
          <h3 className="max-w-[150px] xs:max-w-[250px] sm:max-w-full font-sans font-bold truncate">
            @{username || "Ghost_User"}
          </h3>
        </Link>
      </div>

      <div
        className="shrink-0 flex gap-1 items-center text-dark dark:text-light opacity-30"
        title={formatTimestamp(timestamp).tooltip}
      >
        <IconClock size={18} strokeWidth={2.5} />
        <span className="font-sans text-sm font-bold">
          {formatTimestamp(timestamp).label}
        </span>
      </div>

      {!referenceOnly && (
        <PostOptions
          postId={postId}
          isCurrentUserPost={isCurrentUserPost}
          showOptions={showOptions}
          setShowOptions={setShowOptions}
        />
      )}
    </section>
  ),
);

const PostOptions = React.memo(
  ({
    postId,
    isCurrentUserPost,
    showOptions,
    setShowOptions,
  }: PostOptionsProps) => (
    <div className="shrink-0 flex flex-row-reverse items-center justify-end border-l border-dark dark:border-light/30 text-dark dark:text-light transition-all duration-300 ease-in-out">
      <div
        className={`cursor-pointer grid place-content-center w-6 opacity-50 hover:opacity-100 ${
          showOptions ? "-rotate-90" : ""
        } transition-all duration-300 ease-in-out`}
        onClick={() => setShowOptions(!showOptions)}
      >
        <IconDotsVertical />
      </div>

      <div
        className={`flex gap-2 items-center ${
          showOptions ? "ml-1 pr-1 max-w-20" : "max-w-0"
        } overflow-hidden transition-all duration-500 ease-in-out`}
      >
        {isCurrentUserPost ? (
          <>
            <Link
              title="Edit Post"
              href={`/post/${postId}/edit`}
              className="grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out"
            >
              <IconPencil />
            </Link>

            <Link
              href={`/post/${postId}/delete`}
              className="grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out text-red-600"
              title="Delete Post"
            >
              <IconTrash />
            </Link>
          </>
        ) : (
          <>
            <Link
              title="Flag"
              href={`/post/${postId}/flag`}
              className="grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out"
            >
              <IconFlag />
            </Link>

            <Link
              href={`/post/${postId}/report`}
              className="grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out"
              title="Report"
            >
              <IconSkull />
            </Link>
          </>
        )}
      </div>
    </div>
  ),
);

const PostTags = React.memo(
  ({ nsfw, blurred, setBlurred, groupId, groupName }: PostTagsProps) => (
    <div className="mt-2 flex flex-wrap gap-2">
      {nsfw && (
        <button
          className="px-1.5 py-1 grid place-content-center bg-nsfw rounded-full font-accent text-light z-10 transition-all duration-300 ease-in-out"
          onClick={() => setBlurred(!blurred)}
        >
          <span className="text-xs text-center">nsfw</span>
        </button>
      )}

      {groupId && (
        <Link
          href={`/community/${groupName}`}
          className="px-2 py-1 flex items-center gap-1 border border-dark dark:border-light rounded-full text-dark dark:text-light z-10 transition-all duration-300 ease-in-out hover:opacity-80"
        >
          <IconUsers size={14} />
          <span className="text-xs text-center">
            {groupName || "Community"}
          </span>
        </Link>
      )}
    </div>
  ),
);

const PostContent = React.memo(
  ({
    nsfw,
    blurred,
    isExpanded,
    router,
    postId,
    content,
    truncate,
  }: PostContentProps) => (
    <section
      className={`relative mt-2 mb-3 flex flex-col ${
        nsfw && blurred ? "px-3" : "px-0"
      } transition-all duration-300 ease-in-out overflow-x-hidden`}
    >
      <article
        className={`${!isExpanded ? "cursor-pointer" : ""} pr-3 ${
          blurred ? "overflow-hidden" : "overflow-y-auto"
        }`}
        onClick={() => {
          if (!isExpanded) {
            router.push(`/post/${postId}`);
          }
        }}
      >
        <HtmlContent
          postId={postId}
          content={content}
          truncate={truncate}
          isExpanded={isExpanded}
          maxLines={4}
        />
      </article>

      {nsfw && blurred && (
        <div
          className="absolute top-0 bottom-0 left-0 right-0 grid place-content-center"
          style={{ backdropFilter: "blur(2.5px)" }}
        ></div>
      )}
    </section>
  ),
);

const PostActions = React.memo(
  ({
    blurred,
    reactionsAllowed,
    optimisticState,
    isPending,
    handleLike,
    commentsAllowed,
    setStartReply,
    startReply,
    postId,
  }: PostActionsProps) => (
    <section className="flex flex-nowrap justify-between items-center">
      <article
        className={`relative ${
          blurred ? "px-1" : ""
        } transition-all duration-300 ease-in-out`}
      >
        {blurred && (
          <div
            className="absolute top-0 bottom-0 left-0 right-0 grid place-content-center z-10"
            style={{ backdropFilter: "blur(2.5px)" }}
          ></div>
        )}
        <div className="flex gap-3">
          {reactionsAllowed ? (
            <button
              className={`transition-all duration-300 ease-in-out ${
                isPending ? "opacity-70 pointer-events-none" : ""
              }`}
              onClick={handleLike}
              disabled={isPending}
              aria-label={optimisticState.liked ? "Unlike" : "Like"}
              title={optimisticState.liked ? "Unlike" : "Like"}
            >
              {optimisticState.liked ? (
                <IconHeartFilled size={24} strokeWidth={2} />
              ) : (
                <IconHeart size={24} strokeWidth={2} />
              )}
            </button>
          ) : (
            <div className="opacity-50 cursor-not-allowed">
              <IconHeartOff size={24} strokeWidth={2} />
            </div>
          )}

          {commentsAllowed ? (
            <button
              className="transition-all duration-300 ease-in-out"
              onClick={() => setStartReply(!startReply)}
              aria-label="Comment"
              title="Comment"
            >
              {optimisticState.hasCommented ? (
                <IconMessageFilled size={24} strokeWidth={2} />
              ) : (
                <IconMessage2 size={24} strokeWidth={2} />
              )}
            </button>
          ) : (
            <div className="opacity-50 cursor-not-allowed">
              <IconMessage2Off size={24} strokeWidth={2} />
            </div>
          )}
        </div>
      </article>

      <article className="flex gap-3 text-dark dark:text-light">
        <div
          className={`${
            blurred ? "px-1" : ""
          } relative flex gap-3 transition-all duration-300 ease-in-out`}
        >
          {blurred && (
            <div
              className="absolute top-0 bottom-0 left-0 right-0 grid place-content-center z-10"
              style={{ backdropFilter: "blur(2px)" }}
            ></div>
          )}

          <Link
            href={`/post/${postId}/likes`}
            className="flex items-center gap-1 opacity-30 hover:opacity-100 transition-all duration-300 ease-in-out"
          >
            <IconHeart size={20} strokeWidth={2.5} />
            <span className="font-sans text-sm font-bold">
              {optimisticState.likeCount}
            </span>
          </Link>

          <Link
            href={`/post/${postId}`}
            className="flex items-center gap-1 opacity-30 hover:opacity-100 transition-all duration-300 ease-in-out"
          >
            <IconMessage2 size={20} strokeWidth={2.5} />
            <span className="font-sans text-sm font-bold">
              {optimisticState.commentCount}
            </span>
          </Link>
        </div>

        <Link
          href={`/post/${postId}/analytics`}
          className="flex items-center gap-1 opacity-30 hover:opacity-100 transition-all duration-300 ease-in-out"
        >
          <IconChartBarPopular size={20} strokeWidth={2.5} />
        </Link>
      </article>
    </section>
  ),
);

// Main Post component with optimizations
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
}: PostProps) {
  // Hooks
  const router = useRouter();
  const supabase = createClient();

  // State management
  const [isCurrentUserPost, setIsCurrentUserPost] = useState(false);
  const [blurred, setBlurred] = useState(nsfw && blur);
  const [showOptions, setShowOptions] = useState(false);
  const [startReply, setStartReply] = useState(false);

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

          const [userLikedResult, userCommentedResult] = await Promise.all([
            supabase
              .from("fragment_reactions")
              .select("id")
              .eq("fragment_id", postId)
              .eq("user_id", userId)
              .eq("type", "like")
              .maybeSingle(),

            supabase
              .from("fragment_comments")
              .select("id")
              .eq("fragment_id", postId)
              .eq("user_id", userId)
              .maybeSingle(),
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
    // Update base and optimistic state in one go
    const newCommentCount = baseState.commentCount + 1;

    setBaseState((prev) => ({
      ...prev,
      hasCommented: true,
      commentCount: newCommentCount,
    }));

    startTransition(() => {
      updateOptimisticState({
        hasCommented: true,
        commentCount: newCommentCount,
      });
    });
  }, [baseState.commentCount, updateOptimisticState]);

  return (
    <div className="py-4">
      <PostHeader
        avatar_url={avatar_url}
        username={username}
        timestamp={timestamp}
        isCurrentUserPost={isCurrentUserPost}
        showOptions={showOptions}
        setShowOptions={setShowOptions}
        postId={postId}
        referenceOnly={referenceOnly}
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
