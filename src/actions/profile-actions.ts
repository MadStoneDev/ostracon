"use server";

import { createClient } from "@/utils/supabase/server";
import { writeRateLimiter } from "@/utils/rate-limit";
import { stripHtml } from "@/utils/validation";
import { moderateImage } from "@/utils/sightengine";
import { revalidatePath } from "next/cache";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function updateProfile(data: {
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
}): Promise<ActionResult> {
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

  // Build update object with only provided fields
  const updateData: Record<string, string | null> = {};

  if (data.bio !== undefined) {
    // Validate bio length
    if (data.bio.length > 500) {
      return { success: false, error: "Bio must be 500 characters or less" };
    }
    updateData.bio = stripHtml(data.bio);
  }

  if (data.avatar_url !== undefined) {
    // Moderate avatar image if it's a new URL
    if (data.avatar_url) {
      const modResult = await moderateImage(data.avatar_url);
      if (modResult.blocked) {
        return { success: false, error: "Image rejected: " + modResult.reasons.join(", ") };
      }
      if (modResult.flagged) {
        // Log to moderation queue but still allow
        await supabase.from("images_moderation").insert({
          image_url: data.avatar_url,
          uploaded_by: user.id,
          reason: modResult.reasons.join(", "),
          risk_level: modResult.riskLevel,
          sightengine_data: modResult.rawData,
          status: "pending",
        });
      }
    }
    updateData.avatar_url = data.avatar_url;
  }

  if (data.cover_url !== undefined) {
    // Moderate cover image if it's a new URL
    if (data.cover_url) {
      const modResult = await moderateImage(data.cover_url);
      if (modResult.blocked) {
        return { success: false, error: "Image rejected: " + modResult.reasons.join(", ") };
      }
      if (modResult.flagged) {
        await supabase.from("images_moderation").insert({
          image_url: data.cover_url,
          uploaded_by: user.id,
          reason: modResult.reasons.join(", "),
          risk_level: modResult.riskLevel,
          sightengine_data: modResult.rawData,
          status: "pending",
        });
      }
    }
    updateData.cover_url = data.cover_url;
  }

  if (Object.keys(updateData).length === 0) {
    return { success: false, error: "No fields to update" };
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }

  revalidatePath(`/profile`);

  return { success: true };
}
