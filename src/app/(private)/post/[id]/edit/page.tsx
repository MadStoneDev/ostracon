import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import PostForm from "@/components/feed/post/post-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPostById(postId: string) {
  const supabase = await createClient();

  // First check if the current user is the owner of this post
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    redirect("/login");
  }

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

  // Check if the current user is the owner of this post
  if (post.user_id !== session.session.user.id) {
    redirect(`/post/${postId}`); // Redirect to view page if not the owner
  }

  return post;
}

export default async function EditPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const postId = resolvedParams.id;
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

  return <PostForm postId={postId} post={post} isEditing={true} />;
}
