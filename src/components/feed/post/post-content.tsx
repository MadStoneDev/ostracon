﻿import React from "react";
import HtmlContent from "@/components/feed/html-content-renderer";
import { useRouter } from "next/navigation";

type PostContentProps = {
  nsfw: boolean;
  blurred: boolean;
  isExpanded?: boolean;
  router: ReturnType<typeof useRouter>;
  postId: string;
  title?: string;
  content: string;
  truncate?: boolean;
};

export const PostContent = React.memo(
  ({
    nsfw,
    blurred,
    isExpanded,
    router,
    postId,
    title = "",
    content,
    truncate,
  }: PostContentProps) => (
    <section
      className={`relative mt-2 mb-3 p-3 flex flex-col bg-neutral-200/70 dark:bg-neutral-800/50 rounded-lg transition-all duration-300 ease-in-out overflow-x-hidden`}
    >
      <article
        className={`${!isExpanded ? "cursor-pointer" : ""} pr-3 ${
          blurred ? "overflow-hidden" : "overflow-y-auto"
        }`}
        onClick={() => {
          if (!isExpanded) {
            router.push(`/post/${postId}`);
          }
        }}
      >
        {title && (
          <h3
            className={`mb-2 pb-2 text-lg font-bold border-b border-neutral-400/60`}
          >
            {title || ""}
          </h3>
        )}

        <HtmlContent
          postId={postId}
          content={content}
          truncate={truncate}
          isExpanded={isExpanded}
          maxLines={4}
        />
      </article>

      {nsfw && blurred && (
        <div
          className="absolute top-0 bottom-0 left-0 right-0 grid place-content-center"
          style={{ backdropFilter: "blur(2.5px)" }}
        ></div>
      )}
    </section>
  ),
);
