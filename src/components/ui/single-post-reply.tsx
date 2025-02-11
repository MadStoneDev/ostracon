import React, { useState, Dispatch, SetStateAction, useEffect } from "react";

import { IconLoader, IconSend, IconX } from "@tabler/icons-react";
import UserAvatar from "@/components/ui/user-avatar";

import { processContent } from "@/lib/fragments";
import PostEditor from "@/components/feed/post-editor";
import ProcessedContent from "@/components/feed/processed-content";

export default function SinglePostReply({
  startReply,
  setStartReply,
  avatarUrl,
  username,
  postId,
  content,
  truncate,
  isExpanded,
}: {
  startReply: boolean;
  setStartReply: Dispatch<SetStateAction<boolean>>;
  avatarUrl: string;
  username: string;
  postId: string;
  content: string;
  truncate: boolean;
  isExpanded: boolean;
}) {
  // States
  const [showReply, setShowReply] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [slideIn, setSlideIn] = useState(false);

  const [loading, setLoading] = useState(false);

  // Functions
  const handleReply = (show: boolean) => {
    const documentBody = document.body;

    if (show) {
      setShowReply(true);
      documentBody.style.overflow = "hidden";

      setTimeout(() => {
        setFadeIn(true);
      }, 100);

      setTimeout(() => {
        setSlideIn(true);
      }, 200);
    } else {
      setSlideIn(false);

      setTimeout(() => {
        setFadeIn(false);
      }, 100);

      setTimeout(() => {
        setShowReply(false);
        documentBody.style.overflow = "auto";
      }, 400);
    }
  };

  // Effects
  useEffect(() => {
    handleReply(startReply);
  }, [startReply]);

  return (
    <div
      className={`fixed inset-0 ${
        !showReply && "pointer-events-none invisible"
      } z-50`}
      aria-hidden={!showReply}
    >
      <section
        className={`px-5 fixed bottom-0 left-0 right-0 bg-light dark:bg-dark ${
          slideIn ? "py-5 max-h-[900px]" : "max-h-0"
        } z-50 transition-all duration-300 ease-in-out`}
      >
        <button
          className={`absolute top-5 right-5`}
          onClick={() => setStartReply(false)}
        >
          <IconX size={18} strokeWidth={2} />
        </button>

        {/* Reply Header */}
        <article
          className={`mb-4 pr-8 pb-5 flex items-center justify-between gap-2 border-b border-dark/20 dark:border-light/20 italic`}
        >
          <div className={`flex gap-3 w-full`}>
            <UserAvatar avatar_url={avatarUrl} username={username} />

            <article className={`pr-3 text-sm`}>
              <ProcessedContent
                postId={postId}
                content={processContent(content)}
                truncate={truncate}
                isExpanded={isExpanded}
                showExpandButton={false}
              />
            </article>
          </div>
        </article>

        <article className={`flex items-start gap-2 h-[20vh]`}>
          <div className={`flex-grow h-full overflow-y-auto`}>
            <PostEditor />
            {/*<input type={`text`} className={`flex-1 py-2 `} />*/}
          </div>

          {loading ? (
            <IconLoader
              size={24}
              strokeWidth={2}
              className={`text-primary animate-[spin_2s_linear_infinite]`}
            />
          ) : (
            <button
              className={`hover:text-primary transition-all duration-300 ease-in-out`}
              onClick={() => {
                // TODO: Send Reply

                setLoading(true);

                setTimeout(() => {
                  setStartReply(false);
                  setLoading(false);
                }, 1000);
              }}
            >
              <IconSend size={24} strokeWidth={2} />
            </button>
          )}
        </article>
      </section>

      {/* Reply Overlay */}
      <div
        className={`fixed top-0 bottom-0 left-0 right-0 bg-dark dark:bg-light ${
          fadeIn ? "opacity-50 dark:opacity-30" : "opacity-0"
        } z-30 transition-all duration-300 ease-in-out`}
        onClick={() => setStartReply(false)}
      ></div>
    </div>
  );
}
