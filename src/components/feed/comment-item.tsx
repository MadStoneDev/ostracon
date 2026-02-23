"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconDotsVertical,
  IconFlag,
  IconTrash,
  IconHeart,
  IconHeartFilled,
  IconPencil,
} from "@tabler/icons-react";
import { formatTimestamp } from "@/lib/fragments";
import UserAvatar from "@/components/ui/user-avatar";
import HtmlContent from "@/components/feed/html-content-renderer";
import { deleteComment, editComment } from "@/utils/supabase/comment-actions";
import { toggleCommentReaction } from "@/actions/comment-reaction-actions";

interface CommentItemProps {
  comment: any;
  username: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
  postId: string;
  isCurrentUserComment?: boolean;
  reactionCount?: number;
  userHasLiked?: boolean;
  isEdited?: boolean;
}

export default function CommentItem({
  comment,
  username,
  avatarUrl,
  content,
  timestamp,
  postId,
  isCurrentUserComment = false,
  reactionCount = 0,
  userHasLiked = false,
  isEdited = false,
}: CommentItemProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [liked, setLiked] = useState(userHasLiked);
  const [count, setCount] = useState(reactionCount);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [displayContent, setDisplayContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [edited, setEdited] = useState(isEdited);

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

  const handleToggleLike = async () => {
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    const result = await toggleCommentReaction(comment.id);
    if (!result.success) {
      // Rollback
      setLiked(wasLiked);
      setCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent.trim() === displayContent) {
      setIsEditing(false);
      setEditContent(displayContent);
      return;
    }

    setIsSaving(true);
    const result = await editComment(comment.id, editContent);

    if (result.success) {
      setDisplayContent(editContent.trim());
      setEdited(true);
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(displayContent);
  };

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
              {edited && (
                <span className="ml-1 text-dark/40 dark:text-light/40">(edited)</span>
              )}
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
              showOptions ? "ml-1 pr-1 max-w-32" : "max-w-0"
            } overflow-hidden transition-all duration-500 ease-in-out`}
          >
            {isCurrentUserComment ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowOptions(false);
                  }}
                  className="grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out text-primary"
                  title="Edit Comment"
                >
                  <IconPencil size={18} />
                </button>
                <button
                  onClick={async () => await deleteComment(comment.id)}
                  className="grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out text-red-600"
                  title="Delete Comment"
                >
                  <IconTrash />
                </button>
              </>
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
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary resize-none text-sm"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-3 py-1 text-sm bg-primary text-white rounded-md disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 text-sm border rounded-md hover:bg-dark/5 dark:hover:bg-light/5"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <HtmlContent
            postId={`comment-${comment.id}`}
            content={displayContent}
            truncate={false}
            isExpanded={true}
            maxLines={0}
          />
        )}

        {/* Reaction Button */}
        <div className="mt-2 flex items-center gap-1">
          <button
            onClick={handleToggleLike}
            className="flex items-center gap-1 text-sm text-dark/60 dark:text-light/60 hover:text-red-500 transition-colors"
          >
            {liked ? (
              <IconHeartFilled size={16} className="text-red-500" />
            ) : (
              <IconHeart size={16} />
            )}
            {count > 0 && <span className={liked ? "text-red-500" : ""}>{count}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
