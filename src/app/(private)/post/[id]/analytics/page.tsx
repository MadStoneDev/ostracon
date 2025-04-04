﻿import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import PostAnalyticsPage from "@/components/feed/post-analytics-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const postId = (await params).id;

  return {
    title: `Post Analytics | Ostracon`,
    description: `View analytics for your post on Ostracon`,
  };
}

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

export default async function PostAnalytics({
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

  // Authentication check - we'll leave the detailed permission check to the client component
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <PostAnalyticsPage postId={postId} post={post} />;
}
