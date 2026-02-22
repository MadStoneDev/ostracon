"use server";

import { createClient } from "@/utils/supabase/server";
import { writeRateLimiter } from "@/utils/rate-limit";
import { revalidatePath } from "next/cache";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function muteUser(
  targetUserId: string,
  duration?: number, // hours, optional
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Prevent self-mute
  if (user.id === targetUserId) {
    return { success: false, error: "You cannot mute yourself" };
  }

  // Rate limit
  const { success: allowed } = await writeRateLimiter.limit(user.id);
  if (!allowed) {
    return { success: false, error: "Too many requests. Please slow down." };
  }

  const mutedUntil = duration
    ? new Date(Date.now() + duration * 60 * 60 * 1000).toISOString()
    : null;

  const { error } = await supabase.from("muted_users").insert({
    muter_id: user.id,
    muted_id: targetUserId,
    muted_until: mutedUntil,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: true }; // Already muted
    }
    console.error("Error muting user:", error);
    return { success: false, error: "Failed to mute user" };
  }

  return { success: true };
}

export async function unmuteUser(
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
    .from("muted_users")
    .delete()
    .eq("muter_id", user.id)
    .eq("muted_id", targetUserId);

  if (error) {
    console.error("Error unmuting user:", error);
    return { success: false, error: "Failed to unmute user" };
  }

  return { success: true };
}
