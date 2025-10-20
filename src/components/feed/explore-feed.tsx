"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Post from "@/components/feed/single-post";
import { defaultSettings } from "@/data/defaults/settings";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "../../../database.types";
import Link from "next/link";
import { IconSquareRoundedPlus } from "@tabler/icons-react";
import PullToRefresh from "react-simple-pull-to-refresh";

// Define types using the Database type
type FragmentRow = Database["public"]["Tables"]["fragments"]["Row"];
type CommunityRow = Database["public"]["Tables"]["communities"]["Row"];
type FragmentWithUser = FragmentRow & {
  users?: {
    username: string;
    avatar_url?: string;
  };
  groups?: Pick<CommunityRow, "name"> | null;
};

// Define EnhancedFragment with interaction data
type EnhancedFragment = FragmentWithUser & {
  likeCount: number;
  commentCount: number;
  userLiked: boolean;
  userCommented: boolean;
};

// Define UserSettings type
interface UserSettings {
  blur_sensitive_content: boolean;
  allow_sensitive_content: boolean;
  // Add other settings as needed
  [key: string]: any;
}

// Loading skeleton for posts
const PostSkeleton = () => (
  <div className="w-full border-b border-dark/10 dark:border-light/10 py-4 animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
      </div>
    </div>
    <div className="space-y-2 mt-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
    <div className="mt-4 flex justify-between">
      <div className="flex space-x-4">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
      </div>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
    </div>
  </div>
);

export default function ExploreFeed() {
  // Memoize the supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), []);

  const [posts, setPosts] = useState<EnhancedFragment[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Constants
  const PAGE_SIZE = 25;

  const loadingRef = useRef<HTMLDivElement>(null);

  // Optimize the delete handler with proper dependency array
  const handleDeletePost = useCallback((deletedPostId: string) => {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== deletedPostId),
    );
  }, []);

  // Fetch initial user data and first set of posts
  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the current authenticated user
      const { data: userData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !userData.user) {
        setError("Please sign in to view your explore feed");
        setIsLoading(false);
        return;
      }

      setCurrentUserId(userData.user.id);

      // Get user settings
      const { data: userSettings, error: userError } = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", userData.user.id)
        .single();

      if (!userError && userSettings?.settings) {
        // Type assertion since we know the structure
        const userSettingsData = userSettings.settings as UserSettings;
        setSettings({
          ...userSettingsData,
          blur_sensitive_content: userSettingsData.blur_sensitive_content,
          allow_sensitive_content: userSettingsData.allow_sensitive_content,
        });
      }

      // Fetch first page of posts
      await fetchPosts(0, userData.user.id);
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch posts with pagination
  const fetchPosts = async (pageNum: number, userId: string) => {
    try {
      // First, get relevant user and group IDs
      const [followingData, groupMemberships] = await Promise.all([
        supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId),
        supabase
          .from("community_members")
          .select("community_id")
          .eq("user_id", userId),
      ]);

      const followingIds =
        followingData.data?.map((item) => item.following_id) || [];
      const membershipCommunityIds =
        groupMemberships.data?.map((item) => item.community_id) || [];
      const relevantUserIds = [userId, ...followingIds];

      // Build the paginated query
      let postsQuery = supabase
        .from("fragments")
        .select(
          `
          *,
          profiles:user_id (
            username,
            avatar_url
          ),
          communities:community_id (
            name
          )
        `,
        )
        .order("published_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      // Only add filters if we have valid IDs to filter by
      if (relevantUserIds.length > 0 || membershipCommunityIds.length > 0) {
        let filterConditions = [];

        if (relevantUserIds.length > 0) {
          filterConditions.push(`user_id.in.(${relevantUserIds.join(",")})`);
        }

        if (membershipCommunityIds.length > 0) {
          filterConditions.push(
            `community_id.in.(${membershipCommunityIds.join(",")})`,
          );
        }

        if (filterConditions.length > 0) {
          postsQuery = postsQuery.or(filterConditions.join(","));
        }
      }

      const { data: newPosts, error: postsError } = await postsQuery;

      if (postsError) {
        throw postsError;
      }

      // Fetch interaction data for these posts
      const postIds = newPosts?.map((post) => post.id) || [];

      // Fetch interactions for all the posts we just loaded
      const [likesData, commentsData] = await Promise.all([
        // Fetch like counts
        supabase
          .from("fragment_reactions")
          .select("fragment_id, user_id")
          .eq("type", "like")
          .in("fragment_id", postIds),

        // Fetch comment counts
        supabase
          .from("fragment_comments")
          .select("fragment_id, user_id")
          .in("fragment_id", postIds),
      ]);

      // Process likes data
      const likeCountMap: Record<string, number> = {};
      const userLikedMap: Record<string, boolean> = {};

      if (likesData.data && likesData.data.length > 0) {
        for (const like of likesData.data) {
          if (like.fragment_id) {
            // Count likes per post
            likeCountMap[like.fragment_id] =
              (likeCountMap[like.fragment_id] || 0) + 1;

            // Check if current user liked this post
            if (userId === like.user_id) {
              userLikedMap[like.fragment_id] = true;
            }
          }
        }
      }

      // Process comments data
      const commentCountMap: Record<string, number> = {};
      const userCommentedMap: Record<string, boolean> = {};

      if (commentsData.data && commentsData.data.length > 0) {
        const userCommentedPosts = new Set<string>();

        for (const comment of commentsData.data) {
          if (comment.fragment_id) {
            // Count comments per post
            commentCountMap[comment.fragment_id] =
              (commentCountMap[comment.fragment_id] || 0) + 1;

            // Check if current user commented on this post
            if (
              userId === comment.user_id &&
              !userCommentedPosts.has(comment.fragment_id)
            ) {
              userCommentedMap[comment.fragment_id] = true;
              userCommentedPosts.add(comment.fragment_id);
            }
          }
        }
      }

      // Cast the result to our type and enhance with interaction data
      const typedPosts = (newPosts || []).map(
        (post) =>
          ({
            ...post,
            likeCount: likeCountMap[post.id] || 0,
            commentCount: commentCountMap[post.id] || 0,
            userLiked: userLikedMap[post.id] || false,
            userCommented: userCommentedMap[post.id] || false,
          }) as EnhancedFragment,
      );

      // Filter NSFW content based on user settings
      const filteredPosts =
        typedPosts?.filter((post) => {
          if (post.is_nsfw) {
            return settings.allow_sensitive_content || post.user_id === userId;
          }
          return true;
        }) || [];

      // Update posts state - use functional update
      setPosts((prevPosts) =>
        pageNum === 0 ? filteredPosts : [...prevPosts, ...filteredPosts],
      );

      // Update pagination state
      setPage(pageNum);
      setHasMore(filteredPosts.length === PAGE_SIZE);

      return filteredPosts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  };

  // Load more posts when scrolling - use useCallback to stabilize function reference
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || isLoadingMore || !currentUserId) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      await fetchPosts(nextPage, currentUserId);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, currentUserId]);

  // Simple retry handler to improve UX
  const handleRetry = () => {
    fetchInitialData();
  };

  const handlePullToRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      // Reset pagination
      setPage(0);
      setPosts([]);

      // Fetch first page of posts
      await fetchInitialData();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Effects
  useEffect(() => {
    const handleScroll = () => {
      // Check if user is near bottom (within 200px)
      if (
        window.innerHeight + document.documentElement.scrollTop + 200 >=
        document.documentElement.offsetHeight
      ) {
        loadMorePosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMorePosts]);

  // Fetch initial posts
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (!loadingRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // If the loading element is visible and we're not already loading
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loadingRef.current);
    return () => observer.disconnect();
  }, [isLoadingMore, hasMore]);

  return (
    <PullToRefresh onRefresh={handlePullToRefresh}>
      <div className={`flex flex-col items-center w-full space-y-3 z-0`}>
        {/* Show skeletons during initial load */}
        {isLoading && (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        )}

        {!isLoading &&
          posts.length > 0 &&
          posts.map((post) => (
            <article
              key={`feed-post-${post.id}`}
              className={`w-full transition-all duration-300 ease-in-out`}
            >
              <Post
                postId={post.id}
                avatar_url={post.users?.avatar_url || ""}
                username={post.users?.username || ""}
                title={post.title || ""}
                content={post.content || ""}
                nsfw={post.is_nsfw || false}
                commentsAllowed={post.comments_open ?? true}
                reactionsAllowed={post.reactions_open ?? true}
                blur={settings.blur_sensitive_content}
                timestamp={post.published_at || ""}
                groupId={post.community_id}
                groupName={post.groups?.name || ""}
                authorId={post.user_id || ""}
                onDelete={handleDeletePost}
                initialLikeCount={post.likeCount}
                initialCommentCount={post.commentCount}
                initialUserLiked={post.userLiked}
                initialUserCommented={post.userCommented}
              />
            </article>
          ))}

        {/* Loading more indicator */}
        {!isLoading && posts.length > 0 && (
          <div ref={loadingRef} className="py-4 text-center">
            {isLoadingMore ? (
              <div className="flex justify-center items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse delay-150"></div>
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse delay-300"></div>
                <span className="ml-2">Loading more posts...</span>
              </div>
            ) : hasMore ? (
              <button
                onClick={loadMorePosts}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Load more posts
              </button>
            ) : (
              <p className="text-gray-500 text-sm">No more posts to show</p>
            )}
          </div>
        )}

        {/* No posts found state */}
        {!isLoading && posts.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              No posts to show. Try posting something or following more users!
            </p>

            <Link
              href={"/post/new"}
              className={`my-6 px-4 py-2 inline-flex gap-2 justify-center items-center rounded-full hover:bg-dark dark:hover:bg-light border border-dark dark:border-light hover:text-light dark:hover:text-dark transition-all duration-300 ease-in-out`}
            >
              <IconSquareRoundedPlus size={24} />
              Create your first fragment!
            </Link>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
