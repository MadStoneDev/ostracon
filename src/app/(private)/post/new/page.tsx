"use client";

import React from "react";
import TipTap from "@/components/ui/tip-tap";
import {
  IconArrowLeft,
  IconEyeOff,
  IconHeart,
  IconHeartFilled,
  IconMessage,
  IconMessageFilled,
  IconSend,
} from "@tabler/icons-react";

export default function NewPost() {
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
          className={`pb-4 flex flex-col gap-2 border-b border-dark dark:border-light`}
        >
          <h1 className={`font-serif text-3xl font-black`}>New Post</h1>
          <p className={`text-sm opacity-50`}>
            What would you like to share today?
          </p>
        </article>

        <article className={`flex-grow flex flex-col py-5`}>
          <TipTap content={""} />
        </article>
      </section>

      {/*  Footer*/}
      <footer
        className={`flex items-center border-y border-dark dark:border-light`}
      >
        <button className={`flex-grow flex justify-center items-center h-full`}>
          <IconHeart size={36} strokeWidth={2} />
        </button>

        <button className={`flex-grow flex justify-center items-center h-full`}>
          <IconMessage size={36} strokeWidth={2} />
        </button>

        <button
          className={`flex-grow py-2 flex flex-col justify-center items-center gap-1 h-full bg-danger text-light`}
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
        className={`absolute top-0 right-[25px] text-dark dark:text-light hover:text-primary transition-all duration-300 ease-in-out`}
      >
        <IconSend size={36} strokeWidth={2} />
      </button>
    </main>
  );
}
