import React from "react";
import Link from "next/link";

import {
  IconHeart,
  IconHeartFilled,
  IconHeartOff,
  IconMessage,
  IconMessageFilled,
  IconMessageOff,
  IconMessagePlus,
} from "@tabler/icons-react";

type PostState = {
  liked: boolean;
  likeCount: number;
  hasCommented: boolean;
  commentCount: number;
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
  isLoading?: boolean; // Add the isLoading prop
};

export const PostActions = React.memo(
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
    isLoading = false, // Default to false
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
                isPending || isLoading ? "opacity-70 pointer-events-none" : ""
              }`}
              onClick={handleLike}
              disabled={isPending || isLoading}
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
              className={`transition-all duration-300 ease-in-out ${
                isLoading ? "opacity-70 pointer-events-none" : ""
              }`}
              onClick={() => setStartReply(!startReply)}
              disabled={isLoading}
              aria-label="Comment"
              title="Comment"
            >
              <IconMessagePlus size={24} strokeWidth={2} />
            </button>
          ) : (
            <div className="opacity-50 cursor-not-allowed">
              <IconMessageOff size={24} strokeWidth={2} />
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
            {optimisticState.liked ? (
              <IconHeartFilled size={20} strokeWidth={2.5} />
            ) : (
              <IconHeart size={20} strokeWidth={2.5} />
            )}
            <span className="font-sans text-sm font-bold">
              {isLoading ? "..." : optimisticState.likeCount}
            </span>
          </Link>

          <Link
            href={`/post/${postId}`}
            className="flex items-center gap-1 opacity-30 hover:opacity-100 transition-all duration-300 ease-in-out"
          >
            {optimisticState.hasCommented ? (
              <IconMessageFilled size={20} strokeWidth={2.5} />
            ) : (
              <IconMessage size={20} strokeWidth={2.5} />
            )}
            <span className="font-sans text-sm font-bold">
              {isLoading ? "..." : optimisticState.commentCount}
            </span>
          </Link>
        </div>
      </article>
    </section>
  ),
);
