"use server";

import { createClient } from "@/utils/supabase/server";
import { writeRateLimiter } from "@/utils/rate-limit";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function muteConversation(
  conversationId: string,
  duration?: number, // hours, optional
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

  // Verify user is a participant in this conversation
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (!participant) {
    return { success: false, error: "You are not a participant in this conversation" };
  }

  const mutedUntil = duration
    ? new Date(Date.now() + duration * 60 * 60 * 1000).toISOString()
    : null;

  const { error } = await supabase.from("muted_conversations").upsert(
    {
      user_id: user.id,
      conversation_id: conversationId,
      muted_until: mutedUntil,
    },
    { onConflict: "user_id,conversation_id" },
  );

  if (error) {
    console.error("Error muting conversation:", error);
    return { success: false, error: "Failed to mute conversation" };
  }

  return { success: true };
}

export async function unmuteConversation(
  conversationId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("muted_conversations")
    .delete()
    .eq("user_id", user.id)
    .eq("conversation_id", conversationId);

  if (error) {
    console.error("Error unmuting conversation:", error);
    return { success: false, error: "Failed to unmute conversation" };
  }

  return { success: true };
}
