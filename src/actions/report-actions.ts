"use server";

import { createClient } from "@/utils/supabase/server";
import { writeRateLimiter } from "@/utils/rate-limit";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function flagFragment(
  fragmentId: string,
  reason: string,
  details: string,
): Promise<ActionResult> {
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

  if (!reason) {
    return { success: false, error: "A reason is required" };
  }

  const { error } = await supabase.from("fragment_flags").insert({
    reporter_id: user.id,
    fragment_id: fragmentId,
    reason,
    details: details || null,
  });

  if (error) {
    // Handle duplicate flag gracefully
    if (error.code === "23505") {
      return { success: false, error: "You have already flagged this post" };
    }
    console.error("Error flagging fragment:", error);
    return { success: false, error: "Failed to flag post" };
  }

  return { success: true };
}

export async function reportUser(
  reportedUserId: string,
  reason: string,
  details: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Prevent self-report
  if (user.id === reportedUserId) {
    return { success: false, error: "You cannot report yourself" };
  }

  // Rate limit
  const { success: allowed } = await writeRateLimiter.limit(user.id);
  if (!allowed) {
    return { success: false, error: "Too many requests. Please slow down." };
  }

  if (!reason) {
    return { success: false, error: "A reason is required" };
  }

  const { error } = await supabase.from("user_reports").insert({
    reporter_id: user.id,
    reported_user_id: reportedUserId,
    reason,
    details: details || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "You have already reported this user" };
    }
    console.error("Error reporting user:", error);
    return { success: false, error: "Failed to report user" };
  }

  return { success: true };
}
