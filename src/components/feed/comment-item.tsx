"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IconDotsVertical, IconFlag, IconTrash } from "@tabler/icons-react";
import { formatTimestamp } from "@/lib/fragments";
import UserAvatar from "@/components/ui/user-avatar";
import HtmlContent from "@/components/feed/html-content-renderer";
import { deleteComment } from "@/utils/supabase/comment-actions";

interface CommentItemProps {
  comment: any;
  username: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
  postId: string;
  isCurrentUserComment?: boolean; // Passed from parent instead of determining here
}

export default function CommentItem({
  comment,
  username,
  avatarUrl,
  content,
  timestamp,
  postId,
  isCurrentUserComment = false,
}: CommentItemProps) {
  const [showOptions, setShowOptions] = useState(false);

  // Close options when clicking outside
  useEffect(() => {
    if (showOptions) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest(".options-container")) {
          setShowOptions(false);
        }
      };

      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showOptions]);

  return (
    <div
      className={`pl-2 pt-2 pb-4 border-l-[5px] border-l-primary border-b border-b-dark/10 dark:border-b-light/10`}
    >
      {/* Comment Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <UserAvatar avatar_url={avatarUrl} username={username} />
          <div>
            <Link
              href={`/profile/${username}`}
              className="font-bold hover:underline"
            >
              @{username}
            </Link>
            <div className="text-xs text-dark/50 dark:text-light/50">
              {formatTimestamp(timestamp).tooltip}
            </div>
          </div>
        </div>

        <div className="options-container shrink-0 flex flex-row-reverse items-center justify-end border-l border-dark dark:border-light/30 text-dark dark:text-light transition-all duration-300 ease-in-out">
          <div
            className={`cursor-pointer grid place-content-center w-6 opacity-50 hover:opacity-100 ${
              showOptions ? "-rotate-90" : ""
            } transition-all duration-300 ease-in-out`}
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions(!showOptions);
            }}
          >
            <IconDotsVertical />
          </div>

          <div
            className={`flex gap-2 items-center ${
              showOptions ? "ml-1 pr-1 max-w-20" : "max-w-0"
            } overflow-hidden transition-all duration-500 ease-in-out`}
          >
            {isCurrentUserComment ? (
              <button
                onClick={async () => await deleteComment(comment.id)}
                className="grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out text-red-600"
                title="Delete Comment"
              >
                <IconTrash />
              </button>
            ) : (
              <Link
                href={`/comment/${comment.id}/report`}
                className="grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out"
                title="Report Comment"
              >
                <IconFlag />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Comment Content */}
      <div className="pl-10">
        <HtmlContent
          postId={`comment-${comment.id}`}
          content={content}
          truncate={false}
          isExpanded={true}
          maxLines={0}
        />
      </div>
    </div>
  );
}
