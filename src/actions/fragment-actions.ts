"use server";

import { createClient } from "@/utils/supabase/server";
import { writeRateLimiter } from "@/utils/rate-limit";
import { revalidatePath } from "next/cache";

type ActionResult<T = null> = {
  success: boolean;
  error?: string;
  data?: T;
};

export async function createFragment(data: {
  title: string;
  content: string;
  commentsOpen: boolean;
  reactionsOpen: boolean;
  isNsfw: boolean;
  isDraft: boolean;
  communityId: string;
  tagIds: string[];
}): Promise<ActionResult<{ id: string }>> {
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

  // Validate content
  if (!data.content || data.content.trim().length === 0) {
    return { success: false, error: "Post content is required" };
  }

  const publishedAt = data.isDraft ? null : new Date().toISOString();

  const { data: fragment, error } = await supabase
    .from("fragments")
    .insert({
      user_id: user.id,
      title: data.title || "",
      content: data.content,
      comments_open: data.commentsOpen,
      reactions_open: data.reactionsOpen,
      is_nsfw: data.isNsfw,
      is_draft: data.isDraft,
      community_id: data.communityId || "",
      published_at: publishedAt,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating fragment:", error);
    return { success: false, error: "Failed to create post" };
  }

  // Insert tags
  if (data.tagIds.length > 0 && fragment?.id) {
    const tagInserts = data.tagIds.map((tagId) => ({
      fragment_id: fragment.id,
      tag_id: tagId,
    }));

    await supabase.from("fragments_tags").insert(tagInserts);
  }

  revalidatePath("/explore");

  return { success: true, data: { id: fragment.id } };
}

export async function updateFragment(
  fragmentId: string,
  data: {
    title: string;
    content: string;
    commentsOpen: boolean;
    reactionsOpen: boolean;
    isNsfw: boolean;
    isDraft: boolean;
    communityId: string;
    publishedAt: string | null;
  },
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("fragments")
    .select("user_id")
    .eq("id", fragmentId)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return { success: false, error: "You can only edit your own posts" };
  }

  const publishedAt = data.isDraft
    ? null
    : data.publishedAt ?? new Date().toISOString();

  const { error } = await supabase
    .from("fragments")
    .update({
      title: data.title || "",
      content: data.content,
      comments_open: data.commentsOpen,
      reactions_open: data.reactionsOpen,
      is_nsfw: data.isNsfw,
      is_draft: data.isDraft,
      community_id: data.communityId || "",
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fragmentId);

  if (error) {
    console.error("Error updating fragment:", error);
    return { success: false, error: "Failed to update post" };
  }

  revalidatePath(`/post/${fragmentId}`);

  return { success: true };
}

export async function deleteFragment(
  fragmentId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("fragments")
    .select("user_id")
    .eq("id", fragmentId)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return { success: false, error: "You can only delete your own posts" };
  }

  const { error } = await supabase
    .from("fragments")
    .delete()
    .eq("id", fragmentId);

  if (error) {
    console.error("Error deleting fragment:", error);
    return { success: false, error: "Failed to delete post" };
  }

  revalidatePath("/explore");

  return { success: true };
}

export async function toggleFragmentReaction(
  fragmentId: string,
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
    .from("fragment_reactions")
    .select("id")
    .eq("fragment_id", fragmentId)
    .eq("user_id", user.id)
    .eq("type", type)
    .maybeSingle();

  if (existing) {
    // Remove reaction
    const { error } = await supabase
      .from("fragment_reactions")
      .delete()
      .eq("id", existing.id);

    if (error) {
      console.error("Error removing reaction:", error);
      return { success: false, error: "Failed to remove reaction" };
    }

    return { success: true, data: { liked: false } };
  } else {
    // Add reaction
    const { error } = await supabase.from("fragment_reactions").insert({
      fragment_id: fragmentId,
      user_id: user.id,
      type,
    });

    if (error) {
      console.error("Error adding reaction:", error);
      return { success: false, error: "Failed to add reaction" };
    }

    // Create notification for post owner (skip if self-like)
    if (type === "like") {
      const { data: fragment } = await supabase
        .from("fragments")
        .select("user_id")
        .eq("id", fragmentId)
        .single();

      if (fragment && fragment.user_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: fragment.user_id,
          actor_id: user.id,
          type: "reaction",
          fragment_id: fragmentId,
        });
      }
    }

    return { success: true, data: { liked: true } };
  }
}
