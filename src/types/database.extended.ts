import { Tables } from "../../database.types";

// Extended types with relationships (only these)
export type FragmentWithAuthor = Tables<"fragments"> & {
  profiles: Pick<Tables<"profiles">, "id" | "username" | "avatar_url"> | null;
};

export type FragmentWithCommunity = Tables<"fragments"> & {
  communities: Pick<
    Tables<"communities">,
    "id" | "name" | "display_name" | "avatar_url"
  > | null;
};

export type FragmentWithDetails = Tables<"fragments"> & {
  profiles: Pick<Tables<"profiles">, "id" | "username" | "avatar_url"> | null;
  communities: Pick<
    Tables<"communities">,
    "id" | "name" | "display_name" | "avatar_url"
  > | null;
  fragment_reactions: Array<{
    user_id: string;
    type: string;
  }>;
  fragment_comments: Array<{
    id: string;
    content: string;
  }>;
};

export type CommunityWithDetails = Tables<"communities"> & {
  community_members: Array<{
    user_id: string;
    role: string;
  }>;
  _count?: {
    fragments: number;
  };
};

export type FlagWithDetails = Tables<"fragment_flags"> & {
  profiles: Pick<Tables<"profiles">, "id" | "username" | "avatar_url"> | null;
  fragments: Pick<Tables<"fragments">, "id" | "content" | "user_id"> | null;
};

export type ReportWithDetails = Tables<"user_reports"> & {
  reporter: Pick<Tables<"profiles">, "id" | "username" | "avatar_url"> | null;
  reported_user: Pick<
    Tables<"profiles">,
    "id" | "username" | "avatar_url"
  > | null;
};

export type ConversationWithDetails = Tables<"conversations"> & {
  conversation_participants: Array<
    Tables<"conversation_participants"> & {
      profiles: Pick<
        Tables<"profiles">,
        "id" | "username" | "avatar_url"
      > | null;
    }
  >;
};

export type NotificationWithDetails = Tables<"notifications"> & {
  profiles: Pick<Tables<"profiles">, "id" | "username" | "avatar_url"> | null;
  fragments?: Pick<Tables<"fragments">, "id" | "content"> | null;
};

export type EnhancedFragment = Tables<"fragments"> & {
  profiles: Pick<Tables<"profiles">, "id" | "username" | "avatar_url"> | null;
  communities: Pick<
    Tables<"communities">,
    "id" | "name" | "display_name"
  > | null;
  likeCount: number;
  commentCount: number;
  userLiked: boolean;
  userCommented: boolean;
};
