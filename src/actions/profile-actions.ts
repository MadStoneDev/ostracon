"use server";

import { createClient } from "@/utils/supabase/server";
import { writeRateLimiter } from "@/utils/rate-limit";
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
    // Strip HTML tags from bio
    updateData.bio = data.bio.replace(/<[^>]*>/g, "");
  }

  if (data.avatar_url !== undefined) {
    updateData.avatar_url = data.avatar_url;
  }

  if (data.cover_url !== undefined) {
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
