export type PostFragment = {
  id: string;
  user_id: string;
  content: string;
  comments_open: boolean;
  is_nsfw: boolean;
  created_at: string;
};

export type ContentSegment = {
  type: "text" | "mention" | "hashtag";
  content: string;
  url?: string;
};
