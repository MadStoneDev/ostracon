"use server";

import { createClient } from "@/utils/supabase/server";
import { writeRateLimiter } from "@/utils/rate-limit";
import { revalidatePath } from "next/cache";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function saveFragment(
  fragmentId: string,
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

  const { error } = await supabase.from("saved_fragments").insert({
    user_id: user.id,
    fragment_id: fragmentId,
  });

  if (error) {
    // Handle duplicate save gracefully
    if (error.code === "23505") {
      return { success: true };
    }
    console.error("Error saving fragment:", error);
    return { success: false, error: "Failed to save post" };
  }

  return { success: true };
}

export async function unsaveFragment(
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
    .from("saved_fragments")
    .delete()
    .eq("user_id", user.id)
    .eq("fragment_id", fragmentId);

  if (error) {
    console.error("Error unsaving fragment:", error);
    return { success: false, error: "Failed to unsave post" };
  }

  return { success: true };
}
