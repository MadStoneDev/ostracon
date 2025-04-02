import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IconDotsVertical, IconFlag, IconTrash } from "@tabler/icons-react";
import { formatTimestamp } from "@/lib/fragments";
import UserAvatar from "@/components/ui/user-avatar";
import HtmlContent from "@/components/feed/html-content-renderer";
import { createClient } from "@/utils/supabase/client";

interface CommentItemProps {
  comment: any;
  username: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
  postId: string;
}

export default function CommentItem({
  comment,
  username,
  avatarUrl,
  content,
  timestamp,
  postId,
}: CommentItemProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isCurrentUserComment, setIsCurrentUserComment] = useState(false);
  const supabase = createClient();

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

  // Check if this is the current user's comment
  useEffect(() => {
    const checkOwnership = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setIsCurrentUserComment(data.user.id === comment.user_id);
      }
    };

    checkOwnership();
  }, [comment.user_id, supabase]);

  return (
    <div className="pb-4 border-b border-dark/10 dark:border-light/10">
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

        <div className="shrink-0 flex flex-row-reverse items-center justify-end border-l border-dark dark:border-light/30 text-dark dark:text-light transition-all duration-300 ease-in-out">
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
              <Link
                href={`/comment/${comment.id}/delete`}
                className="grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out text-red-600"
                title="Delete Comment"
              >
                <IconTrash />
              </Link>
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
