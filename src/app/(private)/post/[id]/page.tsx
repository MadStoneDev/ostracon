import React from "react";
import PostPage from "@/components/feed/post-page";
import { createClient } from "@/utils/supabase/server";

async function getPostById(postId: string) {
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

export default async function Post({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const postId = (await params).id;
  const post = await getPostById(postId);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <span className="text-lg font-bold mb-2">Post not found</span>
        <span className="text-sm italic text-center">
          The post you're looking for doesn't exist or has been removed.
        </span>
      </div>
    );
  }

  return <PostPage postId={postId} post={post} />;
}
