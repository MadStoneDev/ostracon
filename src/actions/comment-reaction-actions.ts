"use server";

import { createClient } from "@/utils/supabase/server";
import { writeRateLimiter } from "@/utils/rate-limit";

type ActionResult<T = null> = {
  success: boolean;
  error?: string;
  data?: T;
};

export async function toggleCommentReaction(
  commentId: string,
  type: string = "like",
): Promise<ActionResult<{ liked: boolean }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Rate limit
  const { success: allowed } = await writeRateLimiter.limit(user.id);
  if (!allowed) {
    return { success: false, error: "Too many requests. Please slow down." };
  }

  // Check if reaction exists
  const { data: existing } = await supabase
    .from("comment_reactions")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .eq("type", type)
    .maybeSingle();

  if (existing) {
    // Remove reaction
    const { error } = await supabase
      .from("comment_reactions")
      .delete()
      .eq("id", existing.id);

    if (error) {
      console.error("Error removing comment reaction:", error);
      return { success: false, error: "Failed to remove reaction" };
    }

    return { success: true, data: { liked: false } };
  } else {
    // Add reaction
    const { error } = await supabase.from("comment_reactions").insert({
      comment_id: commentId,
      user_id: user.id,
      type,
    });

    if (error) {
      console.error("Error adding comment reaction:", error);
      return { success: false, error: "Failed to add reaction" };
    }

    // Create notification for comment owner (skip self-like)
    if (type === "like") {
      const { data: comment } = await supabase
        .from("fragment_comments")
        .select("user_id, fragment_id")
        .eq("id", commentId)
        .single();

      if (comment && comment.user_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: comment.user_id,
          actor_id: user.id,
          type: "comment_reaction",
          fragment_id: comment.fragment_id,
          comment_id: commentId,
        });
      }
    }

    return { success: true, data: { liked: true } };
  }
}
