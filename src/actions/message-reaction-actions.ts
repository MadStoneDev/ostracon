"use server";

import { createClient } from "@/utils/supabase/server";
import { messageRateLimiter } from "@/utils/rate-limit";

type ActionResult<T = null> = {
  success: boolean;
  error?: string;
  data?: T;
};

export async function toggleMessageReaction(
  messageId: string,
  emoji: string,
): Promise<ActionResult<{ emojis: string[] }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Rate limit
  const { success: allowed } = await messageRateLimiter.limit(user.id);
  if (!allowed) {
    return { success: false, error: "Too many requests. Please slow down." };
  }

  // Verify user is participant via message → conversation → participants
  const { data: message } = await supabase
    .from("messages")
    .select("conversation_id")
    .eq("id", messageId)
    .single();

  if (!message) {
    return { success: false, error: "Message not found" };
  }

  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("id")
    .eq("conversation_id", message.conversation_id)
    .eq("user_id", user.id)
    .single();

  if (!participant) {
    return { success: false, error: "You are not a participant in this conversation" };
  }

  // Get existing reaction row
  const { data: existing } = await supabase
    .from("message_reactions")
    .select("id, emojis")
    .eq("message_id", messageId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const currentEmojis: string[] = existing.emojis || [];
    const emojiIndex = currentEmojis.indexOf(emoji);

    if (emojiIndex >= 0) {
      // Remove emoji
      currentEmojis.splice(emojiIndex, 1);
    } else {
      // Add emoji
      currentEmojis.push(emoji);
    }

    if (currentEmojis.length === 0) {
      // Delete row if no emojis left
      const { error } = await supabase
        .from("message_reactions")
        .delete()
        .eq("id", existing.id);

      if (error) {
        console.error("Error removing message reaction:", error);
        return { success: false, error: "Failed to remove reaction" };
      }

      return { success: true, data: { emojis: [] } };
    } else {
      // Update emojis array
      const { error } = await supabase
        .from("message_reactions")
        .update({ emojis: currentEmojis })
        .eq("id", existing.id);

      if (error) {
        console.error("Error updating message reaction:", error);
        return { success: false, error: "Failed to update reaction" };
      }

      return { success: true, data: { emojis: currentEmojis } };
    }
  } else {
    // Insert new row
    const { error } = await supabase.from("message_reactions").insert({
      message_id: messageId,
      user_id: user.id,
      emojis: [emoji],
    });

    if (error) {
      console.error("Error adding message reaction:", error);
      return { success: false, error: "Failed to add reaction" };
    }

    return { success: true, data: { emojis: [emoji] } };
  }
}
