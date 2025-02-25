import Post from "@/components/feed/single-post";
import { sampleSettings } from "@/data/sample-settings";

import type { Database } from "../../../../database.types";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Explore | Ostracon",
  description:
    "Discover posts from people you follow and communities you're part of",
};

// Define the UserSettings type based on the interface you provided
interface UserSettings {
  // Privacy
  date_of_birth: string;
  allow_sensitive_content: boolean;
  blur_sensitive_content: boolean;

  make_profile_private: boolean;
  allow_messages: "followers" | "everyone" | "none";

  // Notifications
  email_notifications: {
    mentions: boolean;
    replies: boolean;
    follows: boolean;
    messages: boolean;
    reactions: boolean;
    system_updates: boolean;
  };

  push_notifications: {
    mentions: boolean;
    replies: boolean;
    follows: boolean;
    reactions: boolean;
    messages: boolean;
  };

  _version: number;
}

type FragmentRow = Database["public"]["Tables"]["fragments"]["Row"];
type GroupRow = Database["public"]["Tables"]["groups"]["Row"];
type FragmentWithUser = FragmentRow & {
  users?: {
    username: string;
    avatar_url?: string;
  };
  groups?: Pick<GroupRow, "name"> | null;
};

interface FeedData {
  posts: FragmentWithUser[];
  settings: UserSettings;
  error?: string;
}

/**
 * Fetches feed data for the current user
 */
async function getExploreFeedData(): Promise<FeedData> {
  const supabase = await createClient();

  // Get the current authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      posts: [],
      settings: sampleSettings,
      error: "Please sign in to view your explore feed",
    };
  }

  // Get user settings
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("settings")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Error fetching user settings:", userError);
  }

  // Use fetched settings or fall back to sample settings
  const settings = (userData?.settings as UserSettings) || sampleSettings;

  // First, get the list of users the current user follows
  const { data: followingData, error: followingError } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  if (followingError) {
    console.error("Error fetching following data:", followingError);
  }

  // Get the list of groups/communities the user is a member of
  const { data: groupMemberships, error: groupError } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  if (groupError) {
    console.error("Error fetching group memberships:", groupError);
  }

  // Extract the IDs from the query results
  const followingIds = followingData?.map((item) => item.following_id) || [];
  const groupIds = groupMemberships?.map((item) => item.group_id) || [];

  // Create a list of user IDs that includes the current user and followed users
  const relevantUserIds = [user.id, ...followingIds];

  // Build the query to fetch posts
  let postsQuery = supabase
    .from("fragments")
    .select(
      `
      *,
      users:user_id (
        username,
        avatar_url
      ),
      groups:group_id (
        name
      )
    `,
    )
    .order("created_at", { ascending: false });

  // Only add filters if we have valid IDs to filter by
  if (relevantUserIds.length > 0 || groupIds.length > 0) {
    let filterConditions: string[] = [];

    if (relevantUserIds.length > 0) {
      filterConditions.push(`user_id.in.(${relevantUserIds.join(",")})`);
    }

    if (groupIds.length > 0) {
      filterConditions.push(`group_id.in.(${groupIds.join(",")})`);
    }

    if (filterConditions.length > 0) {
      postsQuery = postsQuery.or(filterConditions.join(","));
    }
  } else {
    // This case shouldn't really happen since we're always including the current user
    // but just in case something went wrong
    return {
      posts: [],
      settings,
      error:
        "No posts available. Follow some users or join communities to see more!",
    };
  }

  const { data: posts, error: postsError } = await postsQuery;

  if (postsError) {
    console.error("Error fetching posts:", postsError);
    return {
      posts: [],
      settings,
      error: "Something went wrong. Please try again later.",
    };
  }

  // Filter NSFW content based on user settings
  const filteredPosts =
    posts?.filter((post) => {
      if (post.is_nsfw) {
        return post.is_nsfw === settings.allow_sensitive_content;
      }
      return true;
    }) || [];

  return {
    posts: filteredPosts as FragmentWithUser[],
    settings,
    error:
      filteredPosts.length === 0
        ? "No posts to show. Try posting something or following more users!"
        : undefined,
  };
}

export default async function Explore() {
  const { posts, settings, error } = await getExploreFeedData();

  if (error) {
    return (
      <div className="p-4 text-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid z-0">
      {posts.map((post) => {
        if (post.is_nsfw && !settings.allow_sensitive_content) {
          return null;
        }

        return (
          <article
            key={`feed-post-${post.id}`}
            className="border-b last-of-type:border-b-0 border-dark/10 dark:border-light/10 transition-all duration-300 ease-in-out"
          >
            <Post
              postId={post.id}
              avatar_url={post.users?.avatar_url || ""}
              username={post.users?.username || "Ghost User"}
              content={post.content || ""}
              nsfw={post.is_nsfw || false}
              commentsAllowed={post.comments_open ?? true}
              reactionsAllowed={post.reactions_open ?? true}
              blur={settings.blur_sensitive_content}
              timestamp={post.created_at}
              groupId={post.group_id}
              groupName={post.groups?.name || ""}
            />
          </article>
        );
      })}
    </div>
  );
}
