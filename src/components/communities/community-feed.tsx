"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Post from "@/components/feed/single-post";
import { createClient } from "@/utils/supabase/client";

const PAGE_SIZE = 25;

type CommunityFeedProps = {
  communityId: string;
};

export default function CommunityFeed({ communityId }: CommunityFeedProps) {
  const supabase = useMemo(() => createClient(), []);

  const [posts, setPosts] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleDeletePost = useCallback((deletedPostId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== deletedPostId));
  }, []);

  const fetchPosts = useCallback(
    async (pageNum: number, userId: string | null) => {
      const { data: rawPosts, error: postsError } = await supabase
        .from("fragments")
        .select(
          `
          *,
          profiles:user_id (username, avatar_url),
          communities:community_id (name)
        `,
        )
        .eq("community_id", communityId)
        .eq("is_draft", false)
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (postsError || !rawPosts) return [];

      // Fetch interaction data
      const postIds = rawPosts.map((p) => p.id);

      const [likesData, commentsData] = await Promise.all([
        supabase
          .from("fragment_reactions")
          .select("fragment_id, user_id")
          .eq("type", "like")
          .in("fragment_id", postIds),
        supabase
          .from("fragment_comments")
          .select("fragment_id, user_id")
          .in("fragment_id", postIds),
      ]);

      const likeCountMap: Record<string, number> = {};
      const userLikedMap: Record<string, boolean> = {};
      for (const like of likesData.data || []) {
        if (like.fragment_id) {
          likeCountMap[like.fragment_id] =
            (likeCountMap[like.fragment_id] || 0) + 1;
          if (userId === like.user_id) userLikedMap[like.fragment_id] = true;
        }
      }

      const commentCountMap: Record<string, number> = {};
      const userCommentedMap: Record<string, boolean> = {};
      for (const comment of commentsData.data || []) {
        if (comment.fragment_id) {
          commentCountMap[comment.fragment_id] =
            (commentCountMap[comment.fragment_id] || 0) + 1;
          if (userId === comment.user_id)
            userCommentedMap[comment.fragment_id] = true;
        }
      }

      return rawPosts.map((post) => ({
        ...post,
        likeCount: likeCountMap[post.id] || 0,
        commentCount: commentCountMap[post.id] || 0,
        userLiked: userLikedMap[post.id] || false,
        userCommented: userCommentedMap[post.id] || false,
      }));
    },
    [communityId, supabase],
  );

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id || null;
      setCurrentUserId(userId);

      const initialPosts = await fetchPosts(0, userId);
      setPosts(initialPosts);
      setHasMore(initialPosts.length === PAGE_SIZE);
      setIsLoading(false);
    };
    init();
  }, [fetchPosts, supabase]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const morePosts = await fetchPosts(nextPage, currentUserId);
    setPosts((prev) => [...prev, ...morePosts]);
    setPage(nextPage);
    setHasMore(morePosts.length === PAGE_SIZE);
    setIsLoadingMore(false);
  }, [page, hasMore, isLoadingMore, currentUserId, fetchPosts]);

  useEffect(() => {
    if (!loadingRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(loadingRef.current);
    return () => observer.disconnect();
  }, [isLoadingMore, hasMore, loadMore]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full py-4 animate-pulse"
          >
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/5" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No posts in this community yet. Be the first to share something!
      </p>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      {posts.map((post) => (
        <article key={`community-post-${post.id}`} className="w-full">
          <Post
            postId={post.id}
            avatar_url={post.profiles?.avatar_url || ""}
            username={post.profiles?.username || ""}
            title={post.title || ""}
            content={post.content || ""}
            nsfw={post.is_nsfw || false}
            commentsAllowed={post.comments_open ?? true}
            reactionsAllowed={post.reactions_open ?? true}
            timestamp={post.published_at || ""}
            groupId={post.community_id}
            groupName={post.communities?.name || ""}
            authorId={post.user_id || ""}
            onDelete={handleDeletePost}
            initialLikeCount={post.likeCount}
            initialCommentCount={post.commentCount}
            initialUserLiked={post.userLiked}
            initialUserCommented={post.userCommented}
          />
        </article>
      ))}

      <div ref={loadingRef} className="py-4 text-center">
        {isLoadingMore ? (
          <div className="flex justify-center items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse delay-150" />
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse delay-300" />
          </div>
        ) : hasMore ? (
          <button
            onClick={loadMore}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Load more posts
          </button>
        ) : posts.length > PAGE_SIZE ? (
          <p className="text-gray-500 text-sm">No more posts to show</p>
        ) : null}
      </div>
    </div>
  );
}
