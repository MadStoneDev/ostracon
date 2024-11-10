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
  const [blurred, setBlurred] = useState(nsfw);
  const [liked, setLiked] = useState(false);
  const [hasCommented, setHasCommented] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

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
          <button
            className={`p-1 flex flex-col items-center justify-center gap-1 h-full aspect-square bg-danger text-light`}
            onClick={() => setBlurred(true)}
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
          </button>
        )}
      </section>

      {/* Content */}
      <section
        className={`relative py-7 flex flex-col ${
          nsfw && blurred ? "px-3" : "px-0"
        } h-[200px] border-b border-dark dark:border-light transition-all duration-300 ease-in-out overflow-x-hidden`}
        style={{
          whiteSpace: "pre-wrap",
        }}
      >
        <article
          className={`pr-3 ${blurred ? "overflow-hidden" : "overflow-y-auto"}`}
        >
          {content}
        </article>

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
                style={{
                  backdropFilter: "blur(4px)",
                }}
              >
                <div
                  className={`absolute -top-24 group-hover/nsfw:-top-20 right-72 group-hover/nsfw:-right-0 w-52 h-52 rotate-45 bg-dark dark:bg-light z-0 transition-all duration-500 ease-in-out`}
                  style={{
                    boxShadow: "0 0 20px 20px transparent inset",
                  }}
                ></div>
              </div>

              <p
                className={`relative group-hover/nsfw:scale-95 dark:group-hover/nsfw:text-dark z-10 transition-all duration-300 ease-in-out`}
              >
                Unblur Sensitive Content
              </p>
            </button>
          </div>
        )}

        {/* Tools Menu */}
        <article
          className={`absolute py-5 top-0 ${
            toolsOpen ? "right-0" : "-right-full"
          } flex flex-col gap-4 w-full h-full bg-light dark:bg-dark z-10 transition-all duration-300 ease-in-out overflow-auto`}
        >
          <span className={`font-serif`}>Share Post</span>
          <span className={`font-serif`}>Report Post</span>
          <span className={`font-serif`}>Report {username}</span>
          <span className={`font-serif`}>Hide Post</span>
        </article>
      </section>

      {/* Menus */}
      <section className={`flex flex-nowrap justify-around items-center h-16`}>
        <button
          className={`hover:text-primary transition-all duration-300 ease-in-out`}
          onClick={() => setLiked(!liked)}
        >
          {liked ? (
            <IconHeartFilled size={28} strokeWidth={1.5} />
          ) : (
            <IconHeart size={28} strokeWidth={1.5} />
          )}
        </button>
        <button
          className={`hover:text-primary transition-all duration-300 ease-in-out`}
          onClick={() => setHasCommented(!hasCommented)}
        >
          {hasCommented ? (
            <IconMessageFilled size={28} strokeWidth={1.5} />
          ) : (
            <IconMessage size={28} strokeWidth={1.5} />
          )}
        </button>
        <button
          className={`hover:text-primary transition-all duration-300 ease-in-out`}
          onClick={() => setToolsOpen(!toolsOpen)}
        >
          <IconTool size={28} strokeWidth={1.5} />
        </button>
      </section>
    </div>
  );
}
