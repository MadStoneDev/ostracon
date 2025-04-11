"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import CommentItem from "./comment-item";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  fragment_id: string;
  user?: {
    username: string;
    avatar_url?: string;
  };
  users?: {
    username: string;
    avatar_url?: string;
  };
}

export default function PostComments({
  postId,
  initialComments = [],
  currentUser = null,
}: {
  postId: string;
  initialComments?: Comment[];
  currentUser?: any;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up real-time subscription for new comments
  useEffect(() => {
    // Only set up subscription if we're client-side
    const commentsSubscription = supabase
      .channel("comments-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "fragment_comments",
          filter: `fragment_id=eq.${postId}`,
        },
        async (payload) => {
          // When a new comment is added, fetch the user details
          console.log("New comment received:", payload.new);

          try {
            // First fetch the comment data
            const newCommentData = payload.new;

            // Then fetch the user data separately
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("username, avatar_url")
              .eq("id", newCommentData.user_id)
              .single();

            if (userError) {
              console.error(
                "Error fetching user data for new comment:",
                userError,
              );
            }

            // Add the new comment to the top of the list
            const newComment: Comment = {
              id: newCommentData.id,
              content: newCommentData.content,
              created_at: newCommentData.created_at,
              user_id: newCommentData.user_id,
              fragment_id: newCommentData.fragment_id,
              users: {
                username: userData?.username || "Unknown",
                avatar_url: userData?.avatar_url || "",
              },
            };

            // Check if this comment already exists in the list (to avoid duplicates)
            const exists = comments.some(
              (comment) => comment.id === newComment.id,
            );
            if (!exists) {
              setComments((prevComments) => [newComment, ...prevComments]);
            }
          } catch (err) {
            console.error("Error processing new comment:", err);
          }
        },
      )
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(commentsSubscription);
    };
  }, [postId, supabase, comments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || isSubmitting) return;

    if (!currentUser) {
      // Redirect to login if not authenticated
      return router.push("/login");
    }

    setIsSubmitting(true);

    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("content", newComment);

      // Call the server action (imported from actions file)
      // For now, we'll continue to use the client API since we don't have the server action defined
      const { data, error } = await supabase
        .from("fragment_comments")
        .insert({
          fragment_id: postId,
          user_id: currentUser.id,
          content: newComment.trim(),
        })
        .select();

      if (error) throw error;

      // Optimistically add the comment to the UI
      // The real-time subscription will eventually update this
      const optimisticComment: Comment = {
        id: data?.[0]?.id || `temp-${Date.now()}`,
        fragment_id: postId,
        user_id: currentUser.id,
        content: newComment,
        created_at: new Date().toISOString(),
        users: {
          username: currentUser.username || "You",
          avatar_url: currentUser.avatar_url || "",
        },
      };

      setComments((prevComments) => [optimisticComment, ...prevComments]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-4">Comments ({comments.length})</h3>

      {comments.length === 0 ? (
        <div className="text-center text-dark/50 dark:text-light/50 my-8 p-4">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            username={comment.users?.username || "Anonymous"}
            avatarUrl={comment.users?.avatar_url || ""}
            content={comment.content}
            timestamp={comment.created_at}
            postId={postId}
            isCurrentUserComment={currentUser?.id === comment.user_id}
          />
        ))
      )}
    </div>
  );
}
