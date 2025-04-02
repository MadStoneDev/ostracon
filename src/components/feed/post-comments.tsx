"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import CommentItem from "./comment-item"; // Assuming you have a CommentItem component

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

export default function PostComments({ postId }: { postId: string }) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        // First, check if the join syntax is causing the issue
        console.log("Fetching comments for post ID:", postId);

        // Query comments with user information, ordering by created_at descending (newest first)
        const { data, error } = await supabase
          .from("fragment_comments")
          .select(
            `
            id,
            content,
            created_at,
            user_id,
            fragment_id
          `,
          )
          .eq("fragment_id", postId)
          .order("created_at", { ascending: false }) // Order by newest first
          .limit(50); // Limit to recent comments, add pagination later if needed

        if (error) {
          console.error("Database error details:", error);
          throw error;
        }

        console.log("Comments data received:", data);

        // Now fetch user data separately for these comments
        let formattedComments: Comment[] = [];

        if (data && data.length > 0) {
          // Get unique user IDs
          const userIds = [...new Set(data.map((comment) => comment.user_id))];

          // Fetch all users in one query
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("id, username, avatar_url")
            .in("id", userIds);

          if (usersError) {
            console.error("Error fetching users:", usersError);
          }

          // Create a map for quick user lookup
          const userMap: Record<string, any> = {};
          if (usersData) {
            usersData.forEach((user) => {
              userMap[user.id] = user;
            });
          }

          // Join the data manually
          formattedComments = data.map((comment) => ({
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            user_id: comment.user_id,
            fragment_id: comment.fragment_id,
            users: userMap[comment.user_id]
              ? {
                  username: userMap[comment.user_id].username,
                  avatar_url: userMap[comment.user_id].avatar_url,
                }
              : { username: "Unknown", avatar_url: "" },
          }));
        }

        console.log("Formatted comments:", formattedComments);
        setComments(formattedComments);
      } catch (err) {
        console.error("Error fetching comments:", err);
        // Log detailed error information to help debug
        if (err instanceof Error) {
          console.error("Error name:", err.name);
          console.error("Error message:", err.message);
          console.error("Error stack:", err.stack);
        } else {
          console.error("Unknown error type:", typeof err, err);
        }
        setError("Failed to load comments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

    // Set up real-time subscription for new comments
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

            setComments((prevComments) => [newComment, ...prevComments]);
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
  }, [postId, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-pulse text-dark/50 dark:text-light/50">
          Loading comments...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center my-4 p-2 border border-red-300 rounded">
        {error}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center text-dark/50 dark:text-light/50 my-8 p-4">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-4">Comments ({comments.length})</h3>

      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          username={comment.users?.username || "Anonymous"}
          avatarUrl={comment.users?.avatar_url || ""}
          content={comment.content}
          timestamp={comment.created_at}
          postId={postId}
        />
      ))}
    </div>
  );
}
