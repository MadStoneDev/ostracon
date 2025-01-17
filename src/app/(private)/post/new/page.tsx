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
      <section className={`mt-5 relative flex-grow px-[25px] flex flex-col`}>
        {/* Send Button */}
        <button
          className={`absolute top-1 right-[25px] text-dark dark:text-light hover:text-primary dark:hover:text-primary disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 ease-in-out`}
          disabled={postContent.replace(/(<([^>]+)>)/gi, "").length === 0}
        >
          <IconSend size={24} strokeWidth={2} />
        </button>

        <article className={`pb-4 flex gap-2`}>
          <h1
            className={`font-sans font-black text-xl text-dark dark:text-light`}
          >
            What do you want to share?
          </h1>
        </article>

        <article className={`relative flex-grow flex flex-col py-5`}>
          {/*<TipTap content={postContent} onChange={setPostContent} />*/}

          {postContent.replace(/(<([^>]+)>)/gi, "").length === 0 && (
            <p
              className={`pointer-events-none absolute top-5 left-0 text-sm opacity-50`}
            >
              Start typing here...
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
              Thank you for keeping our community safe by marking this post as
              sensitive.
            </p>
          )}
        </article>
      </section>

      {/* Side Bar*/}
      <aside
        className={`px-1.5 py-3 fixed top-1/2 -translate-y-1/2 right-0 flex flex-col gap-5 bg-primary text-light dark:text-dark`}
      >
        <button
          className={`flex-grow flex justify-center items-center h-full`}
          onClick={() => setAllowReactions(!allowReactions)}
        >
          {allowReactions ? (
            <IconHeartFilled size={24} strokeWidth={2} />
          ) : (
            <IconHeart size={24} strokeWidth={2} />
          )}
        </button>

        <button
          className={`flex-grow flex justify-center items-center h-full`}
          onClick={() => setAllowComments(!allowComments)}
        >
          {allowComments ? (
            <IconMessageFilled size={24} strokeWidth={2} />
          ) : (
            <IconMessage size={24} strokeWidth={2} />
          )}
        </button>

        <button
          className={`flex-grow flex justify-center items-center gap-1 h-full ${
            postNSFW ? "opacity-100" : "opacity-50"
          }`}
          onClick={() => setPostNSFW(!postNSFW)}
        >
          <IconEyeOff size={24} strokeWidth={2} />
        </button>
      </aside>

      {/*  Footer*/}
      <footer
        className={`flex items-center border-y border-dark dark:border-light h-[50px]`}
        // className={`flex items-center border-y border-dark dark:border-light/20`}
      ></footer>
    </main>
  );
}
