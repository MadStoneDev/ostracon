import React from "react";
import Link from "next/link";
import { IconUsers } from "@tabler/icons-react";
import { Drama } from "lucide-react";

type PostTagsProps = {
  nsfw: boolean;
  blurred: boolean;
  setBlurred: (value: boolean) => void;
  groupId?: string | null;
  groupName?: string;
};

export const PostTags = React.memo(
  ({ nsfw, blurred, setBlurred, groupId, groupName }: PostTagsProps) => (
    <div className="mt-2 flex flex-wrap gap-2">
      {nsfw && (
        <button
          className={`px-1.5 py-1 grid place-content-center text-red-600 aspect-square rounded-full font-accent z-10 transition-all duration-300 ease-in-out`}
          onClick={() => setBlurred(!blurred)}
        >
          <span className={`flex flex-col items-center text-xs text-center`}>
            <Drama /> NSFW
          </span>
        </button>
      )}

      {groupId && (
        <Link
          href={`/community/${groupName}`}
          className="px-2 py-1 flex items-center gap-1 border border-dark dark:border-light rounded-full text-dark dark:text-light z-10 transition-all duration-300 ease-in-out hover:opacity-80"
        >
          <IconUsers size={14} />
          <span className="text-xs text-center">
            {groupName || "Community"}
          </span>
        </Link>
      )}
    </div>
  ),
);
