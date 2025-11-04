export type ContentSegment = {
  type: "text" | "mention" | "hashtag";
  content: string;
  url?: string;
};
