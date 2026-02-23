"use server";

import { createClient } from "@/utils/supabase/server";
import { writeRateLimiter } from "@/utils/rate-limit";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function submitFlagAppeal(
  resolutionId: string,
  reason: string,
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

  if (!reason || reason.trim().length < 20 || reason.trim().length > 1000) {
    return { success: false, error: "Reason must be between 20 and 1000 characters" };
  }

  // Verify user owns the flagged fragment
  const { data: resolution } = await supabase
    .from("fragment_flag_resolutions")
    .select("id, fragment_id, fragments!inner(user_id)")
    .eq("id", resolutionId)
    .single();

  if (!resolution) {
    return { success: false, error: "Resolution not found" };
  }

  const fragment = resolution.fragments as any;
  if (fragment.user_id !== user.id) {
    return { success: false, error: "You can only appeal your own content flags" };
  }

  // Check for duplicate appeal
  const { data: existingAppeal } = await supabase
    .from("flag_appeals")
    .select("id")
    .eq("resolution_id", resolutionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingAppeal) {
    return { success: false, error: "You have already submitted an appeal for this resolution" };
  }

  const { error } = await supabase.from("flag_appeals").insert({
    resolution_id: resolutionId,
    user_id: user.id,
    reason: reason.trim(),
    status: "pending",
  });

  if (error) {
    console.error("Error submitting flag appeal:", error);
    return { success: false, error: "Failed to submit appeal" };
  }

  return { success: true };
}

export async function submitReportAppeal(
  resolutionId: string,
  reason: string,
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

  if (!reason || reason.trim().length < 20 || reason.trim().length > 1000) {
    return { success: false, error: "Reason must be between 20 and 1000 characters" };
  }

  // Verify user is the reported user
  const { data: resolution } = await supabase
    .from("user_report_resolutions")
    .select("id, reported_user_id")
    .eq("id", resolutionId)
    .single();

  if (!resolution) {
    return { success: false, error: "Resolution not found" };
  }

  if (resolution.reported_user_id !== user.id) {
    return { success: false, error: "You can only appeal your own report resolutions" };
  }

  // Check for duplicate appeal
  const { data: existingAppeal } = await supabase
    .from("report_appeals")
    .select("id")
    .eq("resolution_id", resolutionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingAppeal) {
    return { success: false, error: "You have already submitted an appeal for this resolution" };
  }

  const { error } = await supabase.from("report_appeals").insert({
    resolution_id: resolutionId,
    user_id: user.id,
    reason: reason.trim(),
    status: "pending",
  });

  if (error) {
    console.error("Error submitting report appeal:", error);
    return { success: false, error: "Failed to submit appeal" };
  }

  return { success: true };
}

export async function reviewAppeal(
  appealId: string,
  type: "flag" | "report",
  approved: boolean,
  notes?: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify reviewer is moderator or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_moderator, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile || (!profile.is_moderator && !profile.is_admin)) {
    return { success: false, error: "Only moderators and admins can review appeals" };
  }

  const tableName = type === "flag" ? "flag_appeals" : "report_appeals";

  // Fetch the appeal to get the user_id for notification
  const { data: appeal } = await supabase
    .from(tableName)
    .select("id, user_id, status")
    .eq("id", appealId)
    .single();

  if (!appeal) {
    return { success: false, error: "Appeal not found" };
  }

  if (appeal.status !== "pending") {
    return { success: false, error: "This appeal has already been reviewed" };
  }

  const { error } = await supabase
    .from(tableName)
    .update({
      status: approved ? "approved" : "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: notes || null,
    })
    .eq("id", appealId);

  if (error) {
    console.error("Error reviewing appeal:", error);
    return { success: false, error: "Failed to review appeal" };
  }

  // Create notification for the appealer
  await supabase.from("notifications").insert({
    user_id: appeal.user_id,
    actor_id: user.id,
    type: approved ? "appeal_approved" : "appeal_rejected",
  });

  return { success: true };
}
