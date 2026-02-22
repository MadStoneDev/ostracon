"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function fetchPostComments(postId: string) {
  if (!postId) return [];

  const supabase = await createClient();

  try {
    // First, fetch the comments
    const { data: comments, error } = await supabase
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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return [];
    }

    if (!comments || comments.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(comments.map((comment) => comment.user_id))];

    // Fetch all users in one query
    const { data: usersData, error: usersError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return [];
    }

    // Create a map for quick user lookup
    const userMap: Record<string, any> = {};
    if (usersData) {
      usersData.forEach((user) => {
        userMap[user.id] = user;
      });
    }

    // Join the data manually
    const formattedComments = comments.map((comment) => ({
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

    return formattedComments;
  } catch (error) {
    console.error("Error in fetchPostComments:", error);
    return [];
  }
}

/**
 * Adds a new comment to a post
 */
export async function addComment(formData: FormData) {
  const postId = formData.get("postId") as string;
  const content = formData.get("content") as string;

  if (!content?.trim()) {
    return { success: false, error: "Comment content is required" };
  }

  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Insert the comment
    const { data: commentData, error } = await supabase
      .from("fragment_comments")
      .insert({
        fragment_id: postId,
        user_id: user.id,
        content: content.trim(),
      })
      .select("id")
      .single();

    if (error) throw error;

    // Create a notification for the post owner
    const { data: postData } = await supabase
      .from("fragments")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (postData && postData.user_id !== user.id) {
      // Only create notification if the commenter is not the post owner
      await supabase.from("notifications").insert({
        user_id: postData.user_id,
        actor_id: user.id,
        fragment_id: postId,
        comment_id: commentData?.id ?? null,
        type: "comment",
        read: false,
      });
    }

    // Revalidate the post page to show the new comment
    revalidatePath(`/post/${postId}`);

    return { success: true };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error };
  }
}

export async function deleteComment(commentId: string) {
  if (!commentId) {
    return { success: false, error: "Comment ID is required" };
  }

  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: comment, error: fetchError } = await supabase
      .from("fragment_comments")
      .select("fragment_id, user_id")
      .eq("id", commentId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (comment.user_id !== user.id) {
      return { success: false, error: "Not authorized to delete this comment" };
    }

    const { error: deleteError } = await supabase
      .from("fragment_comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) throw deleteError;

    revalidatePath(`/post/${comment.fragment_id}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error };
  }
}
