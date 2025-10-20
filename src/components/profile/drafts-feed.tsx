"use client";

import { User } from "@supabase/supabase-js";
import type { Database } from "../../../database.types";
import { fetchDraftFeedWithInteractions } from "@/utils/supabase/fetch-supabase";
import { usePagination } from "@/hooks/usePagination";
import { IconSquareRoundedPlus } from "@tabler/icons-react";
import Link from "next/link";
import Post from "@/components/feed/single-post";

// Types
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Fragment = Database["public"]["Tables"]["fragments"]["Row"] & {
  likeCount?: number;
  commentCount?: number;
  userLiked?: boolean;
  userCommented?: boolean;
};

export default function DraftsFeed({
  currentUser,
  user,
  initialDraftsFeed,
}: {
  currentUser: User;
  user: Profile;
  initialDraftsFeed: Fragment[] | null;
}) {
  const {
    data: drafts,
    loadMore,
    isLoading,
    hasMore,
  } = usePagination({
    initialData: initialDraftsFeed || [],
    fetchMoreData: async (page) =>
      await fetchDraftFeedWithInteractions(user.id, currentUser.id, page),
  });

  if (drafts.length === 0 && !isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">No drafts found.</p>

        <Link
          href={"/post/new"}
          className={`my-6 px-4 py-2 inline-flex gap-2 justify-center items-center rounded-full hover:bg-dark dark:hover:bg-light border border-dark dark:border-light hover:text-light dark:hover:text-dark transition-all duration-300 ease-in-out`}
        >
          <IconSquareRoundedPlus size={24} />
          Start a new draft!
        </Link>
      </div>
    );
  }

  if (currentUser.id !== user.id) {
    return <div>You can't view other people's drafts</div>;
  }

  return (
    <section className={`mt-3 pb-[70px] space-y-3`}>
      {drafts.map((draft) => {
        return (
          <article
            key={`draft-${draft.id}`}
            className={`transition-all duration-300 ease-in-out`}
          >
            <Post
              postId={draft.id}
              avatar_url={user?.avatar_url || ""}
              username={user?.username || ""}
              title={draft.title || ""}
              content={draft.content || ""}
              nsfw={draft.is_nsfw || false}
              commentsAllowed={draft.comments_open ?? true}
              reactionsAllowed={draft.reactions_open ?? true}
              // Never blur your own posts when viewing your profile
              blur={false}
              timestamp={draft.published_at || draft.created_at!}
              authorId={draft.user_id || ""}
              // Pass pre-fetched data to avoid loading delay
              initialLikeCount={draft.likeCount || 0}
              initialCommentCount={draft.commentCount || 0}
              initialUserLiked={draft.userLiked || false}
              initialUserCommented={draft.userCommented || false}
            />
          </article>
        );
      })}

      {!isLoading && drafts.length > 0 && (
        <div className="py-4 text-center">
          {hasMore ? (
            <button
              onClick={loadMore}
              disabled={isLoading}
              className={`px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
            >
              {isLoading ? "Loading..." : "Load More Drafts"}
            </button>
          ) : (
            <p className="text-gray-500 text-sm">No more drafts to show</p>
          )}
        </div>
      )}
    </section>
  );
}
