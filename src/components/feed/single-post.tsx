"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, {
  useState,
  useEffect,
  useOptimistic,
  useTransition,
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
  userId = "", // Add userId prop to identify if the post belongs to the current user
}: {
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
  userId?: string; // Optional user ID to identify the post owner
}) {
  // Hooks
  const router = useRouter();
  const supabase = createClient();

  // New state to track if this is the current user's post
  const [isCurrentUserPost, setIsCurrentUserPost] = useState(false);

  // Check if this post belongs to the current user
  useEffect(() => {
    const checkIfCurrentUserPost = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        // If userId prop is provided, use it for direct comparison
        if (userId) {
          setIsCurrentUserPost(userData.user.id === userId);
        } else {
          // Otherwise check if the username matches
          const { data: userProfile } = await supabase
            .from("users")
            .select("username")
            .eq("id", userData.user.id)
            .single();

          setIsCurrentUserPost(userProfile?.username === username);
        }
      }
    };

    checkIfCurrentUserPost();
  }, [supabase, username, userId]);

  // States
  const [blurred, setBlurred] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [startReply, setStartReply] = useState(false);

  // Define the state type to fix TypeScript errors
  type PostState = {
    liked: boolean;
    likeCount: number;
    hasCommented: boolean;
    commentCount: number;
    viewCount: number;
  };

  // Base states that will be optimistically updated
  const [baseState, setBaseState] = useState<PostState>({
    liked: false,
    likeCount: 0,
    hasCommented: false,
    commentCount: 0,
    viewCount: 0,
  });

  // Add transition for wrapping optimistic updates
  const [isPending, startTransition] = useTransition();

  // Optimistic state updates with proper typing
  const [optimisticState, updateOptimisticState] = useOptimistic<
    PostState,
    Partial<PostState>
  >(baseState, (state, update) => ({ ...state, ...update }));

  // Fetch reaction and comment counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Get like count
        const { count: reactionCount, error: reactionError } = await supabase
          .from("fragment_reactions")
          .select("*", { count: "exact", head: true })
          .eq("fragment_id", postId)
          .eq("type", "like");

        // Get comment count
        const { count: commentsCount, error: commentError } = await supabase
          .from("fragment_comments")
          .select("*", { count: "exact", head: true })
          .eq("fragment_id", postId);

        // Get analytics (view count)
        const { data: analytics, error: analyticsError } = await supabase
          .from("fragment_analytics")
          .select("views")
          .eq("fragment_id", postId)
          .maybeSingle();

        setBaseState((prev) => ({
          ...prev,
          likeCount: reactionError ? prev.likeCount : reactionCount || 0,
          commentCount: commentError ? prev.commentCount : commentsCount || 0,
          viewCount:
            analyticsError || !analytics ? prev.viewCount : analytics.views,
        }));
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, [postId, supabase]);

  // Check if the user has liked this post
  useEffect(() => {
    const checkUserInteractions = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        try {
          // Check if user liked the post
          const { data: reaction, error: reactionError } = await supabase
            .from("fragment_reactions")
            .select("id")
            .eq("fragment_id", postId)
            .eq("user_id", userData.user.id)
            .eq("type", "like")
            .maybeSingle();

          // Check if user commented on the post
          const { data: comment, error: commentError } = await supabase
            .from("fragment_comments")
            .select("id")
            .eq("fragment_id", postId)
            .eq("user_id", userData.user.id)
            .maybeSingle();

          setBaseState((prev) => ({
            ...prev,
            liked: !reactionError && !!reaction,
            hasCommented: !commentError && !!comment,
          }));
        } catch (error) {
          console.error("Error checking user interactions:", error);
        }
      }
    };

    checkUserInteractions();
  }, [postId, supabase]);

  // Handle like/unlike with optimistic updates
  const handleLike = async () => {
    if (!reactionsAllowed) return;

    // Prevent multiple rapid clicks
    if (isPending) return;

    // First check if user is logged in
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      router.push("/login");
      return;
    }

    // Calculate new states outside transition
    const newLikedState = !optimisticState.liked;
    const newLikeCount = optimisticState.likeCount + (newLikedState ? 1 : -1);

    // First update the optimistic state before network request
    startTransition(() => {
      updateOptimisticState({
        liked: newLikedState,
        likeCount: Math.max(0, newLikeCount),
      });
    });

    // Save current state in case we need to revert
    const previousState = {
      liked: baseState.liked,
      likeCount: baseState.likeCount,
    };

    // Set the base state immediately to prevent flickering
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

      // Success case - state is already set correctly
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

      // Show error to user (optional) - using a less intrusive method
      console.error("Failed to update like. Please try again.");
    }
  };

  // Handle comment added
  const handleCommentAdded = () => {
    // Set base state first to avoid flickering
    setBaseState((prev) => ({
      ...prev,
      hasCommented: true,
      commentCount: prev.commentCount + 1,
    }));

    // Then update optimistic state to match
    startTransition(() => {
      updateOptimisticState({
        hasCommented: true,
        commentCount: baseState.commentCount + 1,
      });
    });
  };

  // Effects
  useEffect(() => {
    setBlurred(nsfw && blur);
  }, [nsfw, blur]);

  // Ensure start reply is false if comments are not allowed
  useEffect(() => {
    if (!commentsAllowed && startReply) {
      setStartReply(false);
    }
  }, [commentsAllowed, startReply]);

  return (
    <div className={`py-4`}>
      {/* Header */}
      <section
        className={`flex justify-between items-center gap-2 text-dark dark:text-light transition-all duration-300 ease-in-out`}
      >
        <UserAvatar avatar_url={avatar_url} username={username} />

        {/* Username */}
        <div className={`flex-grow inline-flex items-center`}>
          <Link
            href={`/profile/${username}`}
            className={`hover:opacity-65 transition-all duration-300 ease-in-out`}
          >
            <h3
              className={`max-w-[150px] xs:max-w-[250px] sm:max-w-full font-sans font-bold truncate`}
            >
              @{username || "Ghost_User"}
            </h3>
          </Link>
        </div>

        {/* Time Information */}
        <div
          className={`shrink-0 flex gap-1 items-center text-dark dark:text-light opacity-30`}
          title={formatTimestamp(timestamp).tooltip}
        >
          <IconClock size={18} strokeWidth={2.5} />
          <span className={`font-sans text-sm font-bold`}>
            {formatTimestamp(timestamp).label}
          </span>
        </div>

        {/* Extra Options */}
        {!referenceOnly && (
          <div
            className={`shrink-0 flex flex-row-reverse items-center justify-end border-l border-dark dark:border-light/30 text-dark dark:text-light transition-all duration-300 ease-in-out`}
            title={"See More"}
          >
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
                // User's own post - show edit and delete options
                <>
                  <Link
                    title="Edit Post"
                    href={`/post/${postId}/edit`}
                    className={`grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out`}
                  >
                    <IconPencil />
                  </Link>

                  <Link
                    href={`/post/${postId}/delete`}
                    className={`grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out text-red-600`}
                    title="Delete Post"
                  >
                    <IconTrash />
                  </Link>
                </>
              ) : (
                // Someone else's post - show flag and report options
                <>
                  <Link
                    title="Flag"
                    href={`/post/${postId}/flag`}
                    className={`grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out`}
                  >
                    <IconFlag />
                  </Link>

                  <Link
                    href={`/post/${postId}/report`}
                    className={`grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out`}
                    title="Report"
                  >
                    <IconSkull />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Tags */}
      <div className="mt-2 flex flex-wrap gap-2">
        {/* NSFW Tag */}
        {nsfw && (
          <button
            className={`px-1.5 py-1 grid place-content-center bg-nsfw rounded-full font-accent text-light z-10 transition-all duration-300 ease-in-out`}
            onClick={() => setBlurred(!blurred)}
          >
            <span className={`text-xs text-center`}>nsfw</span>
          </button>
        )}

        {/* Community/Group Tag */}
        {groupId && (
          <Link
            href={`/community/${groupName}`}
            className={`px-2 py-1 flex items-center gap-1 border border-dark dark:border-light rounded-full text-dark dark:text-light z-10 transition-all duration-300 ease-in-out hover:opacity-80`}
          >
            <IconUsers size={14} />
            <span className={`text-xs text-center`}>
              {groupName || "Community"}
            </span>
          </Link>
        )}
      </div>

      {/* Content */}
      <section
        className={`relative mt-2 mb-3 flex flex-col ${
          nsfw && blurred ? "px-3" : "px-0"
        } transition-all duration-300 ease-in-out overflow-x-hidden`}
      >
        <article
          className={`${!isExpanded && "cursor-pointer"} pr-3 ${
            blurred ? "overflow-hidden" : "overflow-y-auto"
          }`}
          onClick={() => {
            !isExpanded && router.push(`/post/${postId}`);
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
            className={`absolute top-0 bottom-0 left-0 right-0 grid place-content-center`}
            style={{
              backdropFilter: "blur(2.5px)",
            }}
          ></div>
        )}
      </section>

      {/* Actions */}
      {!referenceOnly && (
        <>
          <section className={`flex flex-nowrap justify-between items-center`}>
            <article
              className={`relative ${
                blurred && "px-1"
              } transition-all duration-300 ease-in-out`}
            >
              {blurred && (
                <div
                  className={`absolute top-0 bottom-0 left-0 right-0 grid place-content-center z-10`}
                  style={{
                    backdropFilter: "blur(2.5px)",
                  }}
                ></div>
              )}
              <div className={`flex gap-3`}>
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
                    className={`transition-all duration-300 ease-in-out`}
                    onClick={() => setStartReply(!startReply)}
                    aria-label="Comment"
                    title="Comment"
                  >
                    {optimisticState.hasCommented ? (
                      <IconMessageFilled
                        size={24}
                        strokeWidth={2}
                        className="text-primary"
                      />
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

            <article className={`flex gap-3 text-dark dark:text-light`}>
              <div
                className={`${
                  blurred && "px-1"
                } relative flex gap-3 transition-all duration-300 ease-in-out`}
              >
                {blurred && (
                  <div
                    className={`absolute top-0 bottom-0 left-0 right-0 grid place-content-center z-10`}
                    style={{
                      backdropFilter: "blur(2px)",
                    }}
                  ></div>
                )}

                <Link
                  href={`/post/${postId}/likes`}
                  className={`flex items-center gap-1 opacity-30 hover:opacity-100 transition-all duration-300 ease-in-out`}
                >
                  <IconHeart size={20} strokeWidth={2.5} />
                  <span className={`font-sans text-sm font-bold`}>
                    {optimisticState.likeCount}
                  </span>
                </Link>

                <Link
                  href={`/post/${postId}`}
                  className={`flex items-center gap-1 opacity-30 hover:opacity-100 transition-all duration-300 ease-in-out`}
                >
                  <IconMessage2 size={20} strokeWidth={2.5} />
                  <span className={`font-sans text-sm font-bold`}>
                    {optimisticState.commentCount}
                  </span>
                </Link>
              </div>

              <Link
                href={`/post/${postId}/analytics`}
                className={`flex items-center gap-1 opacity-30 hover:opacity-100 transition-all duration-300 ease-in-out`}
              >
                <IconChartBarPopular size={20} strokeWidth={2.5} />
                <span className={`font-sans text-sm font-bold`}>
                  {optimisticState.viewCount}
                </span>
              </Link>
            </article>
          </section>

          {/* Reply - Only show if comments are allowed */}
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
