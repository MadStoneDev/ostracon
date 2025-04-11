"use server";

import { createClient } from "@/utils/supabase/server";
import { Database } from "../../../database.types";

type Profile = Database["public"]["Tables"]["users"]["Row"];
type Fragment = Database["public"]["Tables"]["fragments"]["Row"];

// Enhanced type to include interaction data
type EnhancedFragment = Fragment & {
  likeCount: number;
  commentCount: number;
  viewCount: number;
  userLiked: boolean;
  userCommented: boolean;
};

export async function fetchCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function fetchUserSettings() {
  const user = await fetchCurrentUser();

  if (!user) {
    return null;
  }

  const userId = user.id;

  const supabase = await createClient();
  const { data: userSettings } = await supabase
    .from("users")
    .select("settings")
    .eq("id", userId)
    .single();

  return userSettings;
}

export async function fetchProfileByUsername(username: string) {
  const supabase = await createClient();

  const { data: user } = await supabase
    .from("users")
    .select()
    .eq("username", username)
    .single();

  return user;
}

export async function fetchProfileById(userId: string) {
  if (!userId) return null;

  const supabase = await createClient();

  const { data: user } = await supabase
    .from("users")
    .select()
    .eq("id", userId)
    .single();

  return user.data;
}

// Helper function to fetch interaction data for posts
async function fetchInteractionData(postIds: string[], currentUserId?: string) {
  const supabase = await createClient();

  // 1. Fetch all likes for these posts
  const { data: allLikes } = await supabase
    .from("fragment_reactions")
    .select("fragment_id, user_id")
    .eq("type", "like")
    .in("fragment_id", postIds);

  // 2. Fetch all comments for these posts
  const { data: allComments } = await supabase
    .from("fragment_comments")
    .select("fragment_id, user_id")
    .in("fragment_id", postIds);

  // 3. Fetch all view data for these posts
  const { data: allViews } = await supabase
    .from("fragment_analytics")
    .select("fragment_id, views")
    .in("fragment_id", postIds);

  // Process the results manually in JavaScript

  // Count likes per post
  const likeCountMap: Record<string, number> = {};
  const userLikedMap: Record<string, boolean> = {};

  if (allLikes && allLikes.length > 0) {
    for (const like of allLikes) {
      if (like.fragment_id) {
        // Increment like count
        likeCountMap[like.fragment_id] =
          (likeCountMap[like.fragment_id] || 0) + 1;

        // Check if current user liked this post
        if (currentUserId && like.user_id === currentUserId) {
          userLikedMap[like.fragment_id] = true;
        }
      }
    }
  }

  // Count comments per post
  const commentCountMap: Record<string, number> = {};
  const userCommentedMap: Record<string, boolean> = {};

  if (allComments && allComments.length > 0) {
    // Track which posts we've already seen this user comment on
    const userCommentedPosts = new Set<string>();

    for (const comment of allComments) {
      if (comment.fragment_id) {
        // Increment comment count
        commentCountMap[comment.fragment_id] =
          (commentCountMap[comment.fragment_id] || 0) + 1;

        // Check if current user commented on this post (but only count once per post)
        if (
          currentUserId &&
          comment.user_id === currentUserId &&
          !userCommentedPosts.has(comment.fragment_id)
        ) {
          userCommentedMap[comment.fragment_id] = true;
          userCommentedPosts.add(comment.fragment_id);
        }
      }
    }
  }

  // Get view counts
  const viewCountMap: Record<string, number> = {};

  if (allViews && allViews.length > 0) {
    for (const view of allViews) {
      if (view.fragment_id) {
        viewCountMap[view.fragment_id] = view.views || 0;
      }
    }
  }

  return {
    likeCountMap,
    commentCountMap,
    viewCountMap,
    userLikedMap,
    userCommentedMap,
  };
}

// Enhanced fetch function that includes post interaction data
export async function fetchPostedFeedWithInteractions(
  userId: string,
  currentUserId?: string,
): Promise<EnhancedFragment[]> {
  const supabase = await createClient();

  // Fetch the basic posts first
  const { data: posts } = await supabase
    .from("fragments")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!posts || posts.length === 0) return [];

  // Get all post IDs
  const postIds = posts.map((post) => post.id);

  // Get interaction data
  const {
    likeCountMap,
    commentCountMap,
    viewCountMap,
    userLikedMap,
    userCommentedMap,
  } = await fetchInteractionData(postIds, currentUserId);

  // Combine all the data
  const enhancedPosts: EnhancedFragment[] = posts.map((post) => ({
    ...post,
    likeCount: likeCountMap[post.id] || 0,
    commentCount: commentCountMap[post.id] || 0,
    viewCount: viewCountMap[post.id] || 0,
    userLiked: userLikedMap[post.id] || false,
    userCommented: userCommentedMap[post.id] || false,
  }));

  return enhancedPosts;
}

// Enhanced version of the liked feed function
export async function fetchLikedFeedWithInteractions(
  userId: string,
  currentUserId?: string,
): Promise<EnhancedFragment[]> {
  const supabase = await createClient();

  // Get the posts the user has liked
  const { data: reactions } = await supabase
    .from("fragment_reactions")
    .select()
    .eq("user_id", userId)
    .eq("type", "like");

  if (!reactions || reactions.length === 0) return [];
  const fragmentIds = reactions.map((reaction) => reaction.fragment_id);

  // Fetch the basic posts
  const { data: fragments } = await supabase
    .from("fragments")
    .select()
    .in("id", fragmentIds);

  if (!fragments || fragments.length === 0) return [];

  // Get all post IDs
  const postIds = fragments.map((post) => post.id);

  // Get interaction data
  const {
    likeCountMap,
    commentCountMap,
    viewCountMap,
    userLikedMap,
    userCommentedMap,
  } = await fetchInteractionData(postIds, currentUserId);

  // Combine all the data
  const enhancedPosts: EnhancedFragment[] = fragments.map((post) => ({
    ...post,
    likeCount: likeCountMap[post.id] || 0,
    commentCount: commentCountMap[post.id] || 0,
    viewCount: viewCountMap[post.id] || 0,
    userLiked: userLikedMap[post.id] || false,
    userCommented: userCommentedMap[post.id] || false,
  }));

  return enhancedPosts;
}

export async function fetchFollowStats(userId: string) {
  const myFollowers = (await fetchFollowers(userId))?.length || 0;
  const myFollowing = (await fetchFollowing(userId))?.length || 0;

  return {
    followersCount: myFollowers,
    followingCount: myFollowing,
  };
}

export async function fetchFollowers(userId: string): Promise<Profile[]> {
  const supabase = await createClient();

  const { data: follows } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", userId);

  if (!follows || follows.length === 0) {
    return [];
  }

  const followerIds = follows.map((follow) => follow.follower_id);

  const { data: followers } = await supabase
    .from("users")
    .select("*")
    .in("id", followerIds);

  return followers || [];
}

export async function fetchFollowing(userId: string): Promise<Profile[]> {
  const supabase = await createClient();

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (!follows || follows.length === 0) {
    return [];
  }

  const followingIds = follows.map((follow) => follow.following_id);

  const { data: following } = await supabase
    .from("users")
    .select("*")
    .in("id", followingIds);

  return following || [];
}

export async function fetchUserProfilesByIds(
  userIds: string[],
): Promise<Record<string, Profile>> {
  if (!userIds || userIds.length === 0) return {};

  const supabase = await createClient();
  const uniqueUserIds = [...new Set(userIds)];

  const fetchedProfiles: Record<string, Profile> = {};

  const { data, error } = await supabase
    .from("users")
    .select()
    .in("id", uniqueUserIds);

  if (error || !data) {
    console.error("Error fetching user profiles:", error);
    return {};
  }

  data.forEach((profile) => {
    fetchedProfiles[profile.id] = profile;
  });

  return fetchedProfiles;
}

export async function fetchPostById(postId: string) {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("fragments")
    .select(
      `
      *,
      users:user_id (
        id,
        username,
        avatar_url
      ),
      groups:group_id (
        id,
        name
      )
    `,
    )
    .eq("id", postId)
    .single();

  if (error) {
    console.error("Error fetching post:", error);
    return null;
  }

  return post;
}

export async function fetchPostComments(postId: string) {
  if (!postId) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fragment_comments")
    .select(
      `
      *,
      user:user_id (
        username,
        avatar_url
      )
    `,
    )
    .eq("fragment_id", postId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return data || [];
}
