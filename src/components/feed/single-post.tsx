"use client";

import {
  IconChartBarPopular,
  IconClock,
  IconEyeOff,
  IconHeart,
  IconHeartFilled,
  IconMessage2,
  IconMessageFilled,
  IconSquareXFilled,
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
    <div className={``}>
      {/* Header */}
      <section
        className={`flex justify-between items-center gap-2 w-full max-w-full text-dark dark:text-light border transition-all duration-300 ease-in-out`}
      >
        {/* Avatar */}
        <article
          className={`shrink-0 h-12 w-12 rounded-full bg-dark dark:bg-light`}
        ></article>

        {/* Information */}
        <article className={`flex-grow flex items-center gap-4`}>
          <div className={`flex-grow`}>
            <h3
              className={`max-w-[150px] font-sans text-base font-bold truncate`}
            >
              @{username}asdasdasdasdas
            </h3>
          </div>

          <div
            className={`shrink-0 flex gap-1 items-center text-dark dark:text-light opacity-30`}
          >
            <IconClock size={20} strokeWidth={2.5} />
            <span className={`font-sans text-base font-bold`}>2h</span>
          </div>
        </article>
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
        className={`relative py-3 flex flex-col ${
          nsfw && blurred ? "px-3" : "px-0"
        } h-[150px] transition-all duration-300 ease-in-out overflow-x-hidden`}
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
              backdropFilter: "blur(3px)",
            }}
          ></div>
        )}
      </section>

      {/* Actions */}
      <section className={`py-2 flex flex-nowrap justify-between items-center`}>
        <article className={`flex gap-5`}>
          <button
            className={`hover:text-primary transition-all duration-300 ease-in-out`}
            onClick={() => setLiked(!liked)}
          >
            {liked ? (
              <IconHeartFilled size={24} strokeWidth={2} />
            ) : (
              <IconHeart size={24} strokeWidth={2} />
            )}
          </button>
          <button
            className={`hover:text-primary transition-all duration-300 ease-in-out`}
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
          <div className={`flex items-center gap-1`}>
            <IconHeart size={24} strokeWidth={2} />
            <span className={`font-sans text-sm font-bold`}>50</span>
          </div>

          <div className={`flex items-center gap-1`}>
            <IconMessage2 size={24} strokeWidth={2} />
            <span className={`font-sans text-sm font-bold`}>50</span>
          </div>

          <div className={`flex items-center gap-1`}>
            <IconChartBarPopular size={24} strokeWidth={2} />
            <span className={`font-sans text-sm font-bold`}>50</span>
          </div>
        </article>
      </section>
    </div>
  );
}
