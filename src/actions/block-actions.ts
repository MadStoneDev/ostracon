"use server";

import { createClient } from "@/utils/supabase/server";
import { writeRateLimiter } from "@/utils/rate-limit";
import { revalidatePath } from "next/cache";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function blockUser(
  targetUserId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Prevent self-block
  if (user.id === targetUserId) {
    return { success: false, error: "You cannot block yourself" };
  }

  // Rate limit
  const { success: allowed } = await writeRateLimiter.limit(user.id);
  if (!allowed) {
    return { success: false, error: "Too many requests. Please slow down." };
  }

  // Insert block record
  const { error } = await supabase.from("blocked_users").insert({
    blocker_id: user.id,
    blocked_id: targetUserId,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: true }; // Already blocked
    }
    console.error("Error blocking user:", error);
    return { success: false, error: "Failed to block user" };
  }

  // Auto-unfollow in both directions
  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", targetUserId)
    .eq("following_id", user.id);

  revalidatePath("/");

  return { success: true };
}

export async function unblockUser(
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
    .from("blocked_users")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", targetUserId);

  if (error) {
    console.error("Error unblocking user:", error);
    return { success: false, error: "Failed to unblock user" };
  }

  revalidatePath("/");

  return { success: true };
}
