﻿"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { formatTimestamp, processContent } from "@/lib/fragments";

import {
  IconChartBarPopular,
  IconClock,
  IconDotsVertical,
  IconFlag,
  IconHeart,
  IconHeartFilled,
  IconMenu,
  IconMessage2,
  IconMessageFilled,
  IconSkull,
  IconX,
} from "@tabler/icons-react";

import ProcessedContent from "@/components/feed/processed-content";

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

  const [showFullScreen, setShowFullScreen] = useState(false);
  const [fullscreenImage, setFullScreenImage] = useState(``);

  // Effects
  useEffect(() => {
    setBlurred(nsfw && blur);
  }, [nsfw, blur]);

  useEffect(() => {
    if (showFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showFullScreen]);

  return (
    <>
      {/* Header */}
      <section
        className={`py-3 flex justify-between items-center gap-2 text-dark dark:text-light transition-all duration-300 ease-in-out`}
      >
        {/* Avatar */}
        <article
          className={`cursor-pointer relative shrink-0 h-12 w-12 rounded-full bg-dark dark:bg-light border-[2px] border-dark dark:border-light overflow-hidden`}
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
          ) : (
            <div
              className={`absolute left-0 top-0 right-0 bottom-0 grid place-content-center`}
            >
              <span className={`text-2xl font-accent text-primary`}>
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </article>

        {/* Full Screen Image */}
        {showFullScreen && (
          <article
            className={`fixed top-[60px] left-0 bottom-[60px] right-0 bg-dark overflow-hidden z-30`}
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
