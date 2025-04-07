import React from "react";
import Link from "next/link";

import { formatTimestamp } from "@/lib/fragments";
import UserAvatar from "@/components/ui/user-avatar";
import {
  IconClock,
  IconDotsVertical,
  IconFlag,
  IconPencil,
  IconSkull,
  IconTrash,
} from "@tabler/icons-react";

type PostHeaderProps = {
  avatar_url: string;
  username: string;
  timestamp: string;
  isCurrentUserPost: boolean;
  showOptions: boolean;
  setShowOptions: (value: boolean) => void;
  postId: string;
  referenceOnly?: boolean;
  setShowDeleteConfirm?: (value: boolean) => void;
};

type PostOptionsProps = {
  postId: string;
  isCurrentUserPost: boolean;
  showOptions: boolean;
  setShowOptions: (value: boolean) => void;
  setShowDeleteConfirm?: (value: boolean) => void;
};

const PostOptions = React.memo(
  ({
    postId,
    isCurrentUserPost,
    showOptions,
    setShowOptions,
    setShowDeleteConfirm,
  }: PostOptionsProps) => (
    <div className="shrink-0 flex flex-row-reverse items-center justify-end border-l border-dark dark:border-light/30 text-dark dark:text-light transition-all duration-300 ease-in-out">
      <div
        className={`cursor-pointer grid place-content-center w-6 opacity-50 hover:opacity-100 ${
          showOptions ? "-rotate-90" : ""
        } transition-all duration-300 ease-in-out`}
        onClick={() => setShowOptions(!showOptions)}
      >
        <IconDotsVertical />
      </div>

      <div
        className={`flex gap-2 items-center ${
          showOptions ? "ml-1 pr-1 max-w-20" : "max-w-0"
        } overflow-hidden transition-all duration-500 ease-in-out`}
      >
        {isCurrentUserPost ? (
          <>
            <Link
              title="Edit Post"
              href={`/post/${postId}/edit`}
              className="grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out"
            >
              <IconPencil />
            </Link>

            {setShowDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className={`grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out text-red-600 dark:text-red-500`}
                title="Delete Post"
              >
                <IconTrash />
              </button>
            )}
          </>
        ) : (
          <>
            <Link
              title="Flag"
              href={`/post/${postId}/flag`}
              className="grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out"
            >
              <IconFlag />
            </Link>

            <Link
              href={`/post/${postId}/report`}
              className="grid place-content-center w-6 opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out"
              title="Report"
            >
              <IconSkull />
            </Link>
          </>
        )}
      </div>
    </div>
  ),
);

export const PostHeader = React.memo(
  ({
    avatar_url,
    username,
    timestamp,
    isCurrentUserPost,
    showOptions,
    setShowOptions,
    postId,
    referenceOnly,
    setShowDeleteConfirm,
  }: PostHeaderProps) => (
    <section className="flex justify-between items-center gap-2 text-dark dark:text-light transition-all duration-300 ease-in-out">
      <UserAvatar avatar_url={avatar_url} username={username} />

      <div className="flex-grow inline-flex items-center">
        <Link
          href={`/profile/${username}`}
          className="hover:opacity-65 transition-all duration-300 ease-in-out"
        >
          <h3 className="max-w-[150px] xs:max-w-[250px] sm:max-w-full font-sans font-bold truncate">
            @{username || ""}
          </h3>
        </Link>
      </div>

      <div
        className="shrink-0 flex gap-1 items-center text-dark dark:text-light opacity-30"
        title={formatTimestamp(timestamp).tooltip}
      >
        <IconClock size={18} strokeWidth={2.5} />
        <span className="font-sans text-sm font-bold">
          {formatTimestamp(timestamp).label}
        </span>
      </div>

      {!referenceOnly && (
        <PostOptions
          postId={postId}
          isCurrentUserPost={isCurrentUserPost}
          showOptions={showOptions}
          setShowOptions={setShowOptions}
          setShowDeleteConfirm={setShowDeleteConfirm}
        />
      )}
    </section>
  ),
);
