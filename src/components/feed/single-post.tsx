"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

import { formatTimestamp, processContent } from "@/lib/fragments";

import {
  IconChartBarPopular,
  IconClock,
  IconDotsVertical,
  IconFlag,
  IconHeart,
  IconHeartFilled,
  IconMessage2,
  IconMessageFilled,
  IconSkull,
  IconX,
} from "@tabler/icons-react";

import ProcessedContent from "@/components/feed/processed-content";
import UserAvatar from "@/components/ui/user-avatar";
import SinglePostReply from "@/components/ui/single-post-reply";

export default function Post({
  postId,
  avatar_url,
  username,
  content,
  nsfw,
  blur = true,
  timestamp,
  truncate = true,
  isExpanded = false,
}: {
  postId: string;
  avatar_url: string;
  username: string;
  content: string;
  nsfw: boolean;
  blur?: boolean;
  timestamp: string;
  truncate?: boolean;
  isExpanded?: boolean;
}) {
  // Hooks
  const router = useRouter();

  // States
  const [blurred, setBlurred] = useState(true);
  const [liked, setLiked] = useState(false);
  const [hasCommented, setHasCommented] = useState(false);

  const [showOptions, setShowOptions] = useState(false);

  const [startReply, setStartReply] = useState(false);

  // Effects
  useEffect(() => {
    setBlurred(nsfw && blur);
  }, [nsfw, blur]);

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
            <div
              className={`grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out`}
            >
              <IconFlag />
            </div>

            <div
              className={`grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out`}
            >
              <IconSkull />
            </div>
          </div>
        </div>
      </section>

      {/* Tag */}
      {nsfw && (
        <button
          className={`mt-2 px-1.5 py-1 grid place-content-center bg-nsfw rounded-full font-accent text-light z-10 transition-all duration-300 ease-in-out`}
          onClick={() => setBlurred(!blurred)}
        >
          <span className={`text-xs text-center`}>nsfw</span>
        </button>
      )}

      {/* Content */}
      <section
        className={`relative mt-2 mb-3 flex flex-col ${
          nsfw && blurred ? "px-3" : "px-0"
        } transition-all duration-300 ease-in-out overflow-x-hidden`}
        style={{
          whiteSpace: "pre-wrap",
        }}
      >
        <article
          className={`${!isExpanded && "cursor-pointer"} pr-3 ${
            blurred ? "overflow-hidden" : "overflow-y-auto"
          }`}
          onClick={() => {
            !isExpanded && router.push(`/post/${postId}`);
          }}
        >
          <ProcessedContent
            postId={postId}
            content={processContent(content)}
            truncate={truncate}
            isExpanded={isExpanded}
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
            <button
              className={`transition-all duration-300 ease-in-out`}
              onClick={() => setLiked(!liked)}
            >
              {liked ? (
                <IconHeartFilled size={24} strokeWidth={2} />
              ) : (
                <IconHeart size={24} strokeWidth={2} />
              )}
            </button>
            <button
              className={`transition-all duration-300 ease-in-out`}
              onClick={() => setStartReply(!startReply)}
            >
              {hasCommented ? (
                <IconMessageFilled size={24} strokeWidth={2} />
              ) : (
                <IconMessage2 size={24} strokeWidth={2} />
              )}
            </button>
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
              <span className={`font-sans text-sm font-bold`}>50</span>
            </Link>

            <Link
              href={`/post/${postId}`}
              className={`flex items-center gap-1 opacity-30 hover:opacity-100 transition-all duration-300 ease-in-out`}
            >
              <IconMessage2 size={20} strokeWidth={2.5} />
              <span className={`font-sans text-sm font-bold`}>50</span>
            </Link>
          </div>

          <Link
            href={`/post/${postId}/analytics`}
            className={`flex items-center gap-1 opacity-30 hover:opacity-100 transition-all duration-300 ease-in-out`}
          >
            <IconChartBarPopular size={20} strokeWidth={2.5} />
            <span className={`font-sans text-sm font-bold`}>50</span>
          </Link>
        </article>
      </section>

      {/* Reply */}
      <SinglePostReply
        startReply={startReply}
        setStartReply={setStartReply}
        avatarUrl={avatar_url}
        username={username}
        postId={postId}
        content={content}
        truncate={truncate}
        isExpanded={isExpanded}
      />
    </div>
  );
}
