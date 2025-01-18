"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

import { formatTimestamp, processContent } from "@/lib/fragments";

import {
  IconChartBarPopular,
  IconClock,
  IconHeart,
  IconHeartFilled,
  IconMessage2,
  IconMessageFilled,
  IconX,
} from "@tabler/icons-react";
import ProcessedContent from "@/components/feed/processed-content";

export default function Post({
  postId,
  avatar_url,
  username,
  content,
  nsfw,
  timestamp,
  truncate = true,
  isExpanded = false,
}: {
  postId: string;
  avatar_url: string;
  username: string;
  content: string;
  nsfw: boolean;
  timestamp: string;
  truncate?: boolean;
  isExpanded?: boolean;
}) {
  // States
  const [blurred, setBlurred] = useState(nsfw);
  const [liked, setLiked] = useState(false);
  const [hasCommented, setHasCommented] = useState(false);

  const [showFullScreen, setShowFullScreen] = useState(false);
  const [fullscreenImage, setFullScreenImage] = useState(``);

  // Effects
  useEffect(() => {
    setBlurred(nsfw);
  }, [nsfw]);

  return (
    <>
      {/* Header */}
      <section
        className={`flex justify-between items-center gap-2 text-dark dark:text-light transition-all duration-300 ease-in-out`}
      >
        {/* Avatar */}
        <article
          className={`cursor-pointer shrink-0 h-12 w-12 rounded-full bg-dark dark:bg-light border-[2px] border-dark dark:border-light overflow-hidden`}
        >
          {avatar_url ? (
            <img
              src={avatar_url}
              alt={`Avatar photo of ${username}`}
              className={`h-full w-full object-cover`}
              onClick={() => {
                setFullScreenImage(avatar_url);
                setShowFullScreen(true);
              }}
            />
          ) : null}
        </article>

        {/* Full Screen Image */}
        {showFullScreen && (
          <article
            className={`fixed top-[70px] left-0 bottom-[60px] right-0 bg-dark overflow-hidden z-30`}
          >
            {fullscreenImage && (
              <img
                src={fullscreenImage}
                alt={`Avatar photo of ${username}`}
                className={`h-full w-full object-contain`}
              />
            )}

            <button
              onClick={() => {
                setShowFullScreen(false);
                setFullScreenImage(``);
              }}
            >
              <IconX
                className={`absolute top-4 right-4 z-10 text-light/50 text-2xl cursor-pointer`}
              />
            </button>
          </article>
        )}

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
      </section>

      {/* Tag */}
      {nsfw && (
        <button
          className={`my-3 px-1.5 py-0.5 grid place-content-center bg-nsfw font-accent text-light z-10 transition-all duration-300 ease-in-out`}
          onClick={() => setBlurred(true)}
        >
          <span className={`text-sm text-center`}>nsfw</span>
        </button>
      )}

      {/* Content */}
      <section
        className={`relative pt-3 pb-5 flex flex-col ${
          nsfw && blurred ? "px-3" : "px-0"
        } transition-all duration-300 ease-in-out overflow-x-hidden`}
        style={{
          whiteSpace: "pre-wrap",
        }}
      >
        <article
          className={`pr-3 ${blurred ? "overflow-hidden" : "overflow-y-auto"}`}
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

      {nsfw && (
        <div className={`flex justify-end`}>
          <button
            className={`font-accent text-nsfw text-sm transition-all duration-300 ease-in-out`}
            onClick={() => setBlurred(!blurred)}
          >
            {blurred ? "Show" : "Hide"} Content
          </button>
        </div>
      )}

      {/* Actions */}
      <section
        className={`mt-1 py-2 flex flex-nowrap justify-between items-center`}
      >
        <article className={`flex gap-5`}>
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
            onClick={() => setHasCommented(!hasCommented)}
          >
            {hasCommented ? (
              <IconMessageFilled size={24} strokeWidth={2} />
            ) : (
              <IconMessage2 size={24} strokeWidth={2} />
            )}
          </button>
        </article>

        <article className={`flex gap-3 text-dark dark:text-light opacity-30`}>
          <Link
            href={`/post/${postId}/likes`}
            className={`flex items-center gap-1 transition-all duration-300 ease-in-out`}
          >
            <IconHeart size={20} strokeWidth={2.5} />
            <span className={`font-sans text-sm font-bold`}>50</span>
          </Link>

          <Link
            href={`/post/${postId}`}
            className={`flex items-center gap-1 transition-all duration-300 ease-in-out`}
          >
            <IconMessage2 size={20} strokeWidth={2.5} />
            <span className={`font-sans text-sm font-bold`}>50</span>
          </Link>

          <Link
            href={`/post/${postId}/analytics`}
            className={`flex items-center gap-1 transition-all duration-300 ease-in-out`}
          >
            <IconChartBarPopular size={20} strokeWidth={2.5} />
            <span className={`font-sans text-sm font-bold`}>50</span>
          </Link>
        </article>
      </section>
    </>
  );
}
