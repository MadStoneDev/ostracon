"use client";

import {
  IconEyeOff,
  IconHeart,
  IconHeartFilled,
  IconMessage,
  IconMessageFilled,
  IconTool,
} from "@tabler/icons-react";
import { useState } from "react";

export default function Post({
  username,
  content,
  nsfw = true,
  date,
}: {
  username: string;
  content: string;
  nsfw: boolean;
  date: string;
}) {
  // States
  const [blurred, setBlurred] = useState(true);

  return (
    <div className={`px-[25px]`}>
      {/* Header */}
      <section
        className={`flex items-center gap-2 h-16 bg-dark dark:bg-light text-light dark:text-dark`}
      >
        {/* Avatar */}
        <article className={`ml-2 h-10 w-10 rounded-full bg-light`}></article>

        {/* Information */}
        <article className={`flex-grow flex flex-col gap-0`}>
          <span className={`text-xs opacity-50`}>2 hours ago</span>
          <h3 className={`font-serif text-base`}>Username posted:</h3>
        </article>

        {/* Tag */}
        {nsfw && (
          <article
            className={`p-1 flex flex-col items-center justify-center gap-1 h-full aspect-square bg-danger`}
          >
            <span
              className={`text-xs text-center`}
              style={{
                lineHeight: "0.75rem",
              }}
            >
              Sensitive Content
            </span>
            <IconEyeOff />
          </article>
        )}
      </section>
      {/* Content */}
      <section
        className={`relative py-7 ${
          nsfw ? "px-3" : "px-0"
        } border-b border-dark dark:border-light transition-all duration-300 ease-in-out`}
        style={{
          whiteSpace: "pre-wrap",
        }}
      >
        {content}

        {nsfw && blurred && (
          <div
            className={`absolute top-0 bottom-0 left-0 right-0 grid place-content-center bg-light/20 dark:bg-dark/20`}
            style={{
              backdropFilter: "blur(4px)",
            }}
          >
            <button
              className={`group/nsfw relative px-4 hover:px-6 py-2 text-light rounded-full shadow-lg hover:shadow-2xl shadow-dark/50 transition-all duration-300 ease-in-out overflow-hidden`}
              onClick={() => setBlurred(false)}
            >
              <div
                className={`absolute top-0 bottom-0 left-0 right-0 bg-danger`}
              >
                <div
                  className={`absolute -top-24 group-hover/nsfw:-top-20 right-72 group-hover/nsfw:-right-0 w-52 h-52 rotate-45 bg-dark z-0 transition-all duration-500 ease-in-out`}
                ></div>
              </div>

              <p
                className={`relative group-hover/nsfw:scale-95 z-10 transition-all duration-300 ease-in-out`}
              >
                Unblur Sensitive Content
              </p>
            </button>
          </div>
        )}
      </section>

      {/* Menus */}
      <section className={`flex flex-nowrap justify-around items-center h-20`}>
        <article>
          <IconHeart size={28} strokeWidth={1.5} />
        </article>
        <article>
          <IconMessage size={28} strokeWidth={1.5} />
        </article>
        <article>
          <IconTool size={28} strokeWidth={1.5} />
        </article>
      </section>
    </div>
  );
}
