"use server";

import { createClient } from "@/utils/supabase/server";
import { writeRateLimiter } from "@/utils/rate-limit";
import { revalidatePath } from "next/cache";

type ActionResult<T = null> = {
  success: boolean;
  error?: string;
  data?: T;
};

export async function createRepost(
  fragmentId: string,
  comment?: string,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { success: allowed } = await writeRateLimiter.limit(user.id);
  if (!allowed) {
    return { success: false, error: "Too many requests. Please slow down." };
  }

  // Can't repost own post
  const { data: fragment } = await supabase
    .from("fragments")
    .select("user_id")
    .eq("id", fragmentId)
    .single();

  if (!fragment) {
    return { success: false, error: "Post not found" };
  }

  if (fragment.user_id === user.id) {
    return { success: false, error: "You cannot repost your own post" };
  }

  const { data: repost, error } = await supabase
    .from("reposts")
    .insert({
      user_id: user.id,
      original_fragment_id: fragmentId,
      comment: comment?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "You already reposted this" };
    }
    console.error("Error creating repost:", error);
    return { success: false, error: "Failed to repost" };
  }

  // Notify original author
  if (fragment.user_id !== user.id) {
    await supabase.from("notifications").insert({
      user_id: fragment.user_id,
      actor_id: user.id,
      type: "repost",
      fragment_id: fragmentId,
    });
  }

  revalidatePath("/explore");
  return { success: true, data: { id: repost.id } };
}

export async function deleteRepost(
  fragmentId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("reposts")
    .delete()
    .eq("user_id", user.id)
    .eq("original_fragment_id", fragmentId);

  if (error) {
    console.error("Error deleting repost:", error);
    return { success: false, error: "Failed to remove repost" };
  }

  revalidatePath("/explore");
  return { success: true };
}
