"use server";

import { createClient } from "@/utils/supabase/server";
import { writeRateLimiter } from "@/utils/rate-limit";
import { revalidatePath } from "next/cache";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function followUser(
  targetUserId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Prevent self-follow
  if (user.id === targetUserId) {
    return { success: false, error: "You cannot follow yourself" };
  }

  // Rate limit
  const { success: allowed } = await writeRateLimiter.limit(user.id);
  if (!allowed) {
    return { success: false, error: "Too many requests. Please slow down." };
  }

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: targetUserId,
  });

  if (error) {
    // Handle duplicate follow gracefully
    if (error.code === "23505") {
      return { success: true };
    }
    console.error("Error following user:", error);
    return { success: false, error: "Failed to follow user" };
  }

  // Create notification for target user
  await supabase.from("notifications").insert({
    user_id: targetUserId,
    actor_id: user.id,
    type: "follow",
  });

  revalidatePath("/");

  return { success: true };
}

export async function unfollowUser(
  targetUserId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  if (error) {
    console.error("Error unfollowing user:", error);
    return { success: false, error: "Failed to unfollow user" };
  }

  revalidatePath("/");

  return { success: true };
}
