import React from "react";

import PostScreen from "@/components/feed/post-screen";
import {
  fetchPostById,
  fetchUserSettings,
  fetchCurrentUser,
} from "@/utils/supabase/fetch-supabase";
import { fetchPostComments } from "@/utils/supabase/comment-actions";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const postId = (await params).id;

  // Fetch post data server-side
  const post = await fetchPostById(postId);

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

  // Fetch in parallel for better performance
  const [userSettings, currentUser, comments] = await Promise.all([
    fetchUserSettings(),
    fetchCurrentUser(),
    fetchPostComments(postId),
  ]);

  const authenticated = !!currentUser;

  return (
    <PostScreen
      postId={postId}
      post={post}
      settings={userSettings}
      authenticated={authenticated}
      comments={comments}
      currentUser={currentUser}
    />
  );
}
