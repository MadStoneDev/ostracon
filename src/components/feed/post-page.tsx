"use client";

import BottomNav from "@/components/ui/bottom-nav";
import Post from "@/components/feed/single-post";

import { sampleUsers } from "@/data/sample-users";
import samplePosts from "@/data/sample-posts";
import { PostFragment } from "@/types/fragments";

export default function PostPage({
  postId,
  post,
}: {
  postId: string;
  post: PostFragment;
}) {
  const authenticated = true;

  const username = sampleUsers.find((user) => user.id === post.user_id)
    ?.username;

  const avatar_url = sampleUsers.find((user) => user.id === post.user_id)
    ?.avatar_url;

  return (
    <main
      className={`flex-grow relative flex flex-col overflow-y-auto`}
      style={{
        marginTop: "60px",
      }}
    >
      <Post
        postId={postId}
        avatar_url={avatar_url || ""}
        username={username || "Ghost User"}
        content={post.content}
        nsfw={post.is_nsfw}
        timestamp={post.created_at}
        truncate={false}
        isExpanded={true}
      />

      {authenticated && <BottomNav />}
    </main>
  );
}
