"use client";

import React, { useState } from "react";
import TipTap from "@/components/ui/tip-tap";
import {
  IconArrowLeft,
  IconChevronLeft,
  IconEyeOff,
  IconHeart,
  IconHeartFilled,
  IconMessage,
  IconMessageFilled,
  IconSend,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function NewPost() {
  // Hooks
  const router = useRouter();

  // States
  const [postContent, setPostContent] = useState("");
  const [allowReactions, setAllowReactions] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [postNSFW, setPostNSFW] = useState(false);

  return (
    <main
      className={`flex-grow relative flex flex-col overflow-y-auto`}
      style={{
        marginTop: "60px",
      }}
    >
      {/* Header */}
      <section className={`flex-grow relative px-[25px] flex flex-col`}>
        <article
          className={`pb-4 flex gap-2 border-b border-dark dark:border-light`}
        >
          <button
            className={`opacity-50 hover:opacity-100 hover:text-primary transition-all duration-300 ease-in-out`}
            onClick={() => router.back()}
          >
            <IconChevronLeft size={36} strokeWidth={2} />
          </button>
          <h1 className={`font-serif text-3xl font-black`}>New Post</h1>
        </article>

        <article className={`relative flex-grow flex flex-col py-5`}>
          <TipTap content={postContent} onChange={setPostContent} />

          {postContent.replace(/(<([^>]+)>)/gi, "").length === 0 && (
            <p
              className={`pointer-events-none absolute top-5 left-0 text-sm opacity-50`}
            >
              What would you like to share today?
            </p>
          )}
        </article>

        <article className={`py-2 text-xs italic`}>
          {!allowReactions && (
            <p>Reactions have been disabled for this post.</p>
          )}
          {!allowComments && <p>Comments have been disabled for this post.</p>}
          {postNSFW && (
            <p>
              Thank you for keeping our community safe and marking this post as
              sensitive.
            </p>
          )}
        </article>
      </section>

      {/*  Footer*/}
      <footer
        className={`flex items-center border-y border-dark dark:border-light/20`}
      >
        <button
          className={`flex-grow flex justify-center items-center h-full`}
          onClick={() => setAllowReactions(!allowReactions)}
        >
          {allowReactions ? (
            <IconHeartFilled size={36} strokeWidth={2} />
          ) : (
            <IconHeart size={36} strokeWidth={2} />
          )}
        </button>

        <button
          className={`flex-grow flex justify-center items-center h-full`}
          onClick={() => setAllowComments(!allowComments)}
        >
          {allowComments ? (
            <IconMessageFilled size={36} strokeWidth={2} />
          ) : (
            <IconMessage size={36} strokeWidth={2} />
          )}
        </button>

        <button
          className={`flex-grow py-2 flex flex-col justify-center items-center gap-1 h-full ${
            postNSFW ? "bg-danger text-light" : "text-dark dark:text-light"
          }`}
          onClick={() => setPostNSFW(!postNSFW)}
        >
          <span
            className={`max-w-20 text-xs text-center`}
            style={{
              lineHeight: "0.75rem",
            }}
          >
            Sensitive Content
          </span>
          <IconEyeOff />
        </button>
      </footer>

      {/* Send Button */}
      <button
        className={`absolute top-0 right-[25px] text-dark dark:text-light hover:text-primary dark:hover:text-primary disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 ease-in-out`}
        disabled={postContent.replace(/(<([^>]+)>)/gi, "").length === 0}
      >
        <IconSend size={36} strokeWidth={2} />
      </button>
    </main>
  );
}
