/**
 * Standardized API response types for both web and future React Native consumption.
 * All server actions and API routes should use these shapes.
 */

/** Standard action result for mutations */
export type ActionResult<T = null> = {
  success: boolean;
  error?: string;
  data?: T;
};

/** Paginated list response */
export type PaginatedResult<T> = {
  items: T[];
  hasMore: boolean;
  nextPage?: number;
};

/** Common entity shapes used across the app */

export type PublicProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  is_moderator: boolean;
  is_admin: boolean;
};

export type PostSummary = {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  is_nsfw: boolean;
  is_draft: boolean;
  comments_open: boolean;
  reactions_open: boolean;
  published_at: string | null;
  community_id: string | null;
  theme_id: string | null;
  author: {
    username: string;
    avatar_url: string | null;
  };
  community?: {
    name: string;
  } | null;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  userLiked: boolean;
  userCommented: boolean;
  userReposted: boolean;
};

export type ConversationSummary = {
  id: string;
  title: string | null;
  is_group: boolean;
  last_message_at: string | null;
  last_message_preview: string | null;
  participants: PublicProfile[];
  unread: boolean;
};

export type NotificationItem = {
  id: string;
  type: string;
  actor: PublicProfile | null;
  fragment_id: string | null;
  comment_id: string | null;
  read: boolean;
  created_at: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price_aud_cents: number;
  stripe_price_id: string | null;
  features: Record<string, unknown> | null;
};

export type ThemeDefinition = {
  id: string;
  name: string;
  display_name: string;
  emoji_set: { emoji: string; label: string; type: string }[];
  color: string | null;
};
