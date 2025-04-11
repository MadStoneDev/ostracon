"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Increments the view count for a post
 */
export async function incrementPostView(postId: string) {
  if (!postId) return { success: false };

  try {
    const supabase = await createClient();

    // Check if an analytics record exists for this post
    const { data: existingRecord } = await supabase
      .from("fragment_analytics")
      .select("views")
      .eq("fragment_id", postId)
      .maybeSingle();

    if (existingRecord) {
      // Update existing record
      const { error } = await supabase
        .from("fragment_analytics")
        .update({ views: (existingRecord.views || 0) + 1 })
        .eq("fragment_id", postId);

      if (error) throw error;
    } else {
      // Create new record
      const { error } = await supabase
        .from("fragment_analytics")
        .insert({ fragment_id: postId, views: 1 });

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return { success: false, error };
  }
}
