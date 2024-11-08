"use client";

import {
  IconEyeOff,
  IconHeart,
  IconHeartFilled,
  IconMessage,
  IconMessageFilled,
  IconTool,
} from "@tabler/icons-react";

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
        className={`py-7 border-b border-dark dark:border-light`}
        style={{
          whiteSpace: "pre-wrap",
        }}
      >
        {content}
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
