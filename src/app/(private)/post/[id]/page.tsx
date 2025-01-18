import PostPage from "@/components/feed/post-page";
import SamplePosts from "@/data/sample-posts";
import BottomNav from "@/components/ui/bottom-nav";
import React from "react";

export default async function Post({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const postId = (await params).id;
  const post = SamplePosts.find((post) => post.id === postId);

  return post ? (
    <PostPage postId={postId} post={post} />
  ) : (
    <span className={`text-sm italic`}>Post not found</span>
  );
}
