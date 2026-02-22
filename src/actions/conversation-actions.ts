"use server";

import { createClient } from "@/utils/supabase/server";
import { messageRateLimiter } from "@/utils/rate-limit";

type ActionResult<T = null> = {
  success: boolean;
  error?: string;
  data?: T;
};

export async function createConversation(
  participantIds: string[],
  title?: string,
  isGroup: boolean = false,
): Promise<ActionResult<{ id: string }>> {
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

  // Validate participants
  if (!participantIds || participantIds.length === 0) {
    return { success: false, error: "At least one participant is required" };
  }

  // Prevent self-only conversations
  const otherParticipants = participantIds.filter((id) => id !== user.id);
  if (otherParticipants.length === 0) {
    return {
      success: false,
      error: "You must include at least one other participant",
    };
  }

  // For non-group chats, check if a conversation already exists
  if (!isGroup && otherParticipants.length === 1) {
    const { data: existingConversations } = await supabase
      .from("conversations")
      .select(
        `
        id,
        conversation_participants!inner (user_id)
      `,
      )
      .eq("is_group", false);

    if (existingConversations) {
      const existingConversation = existingConversations.find((conv) => {
        const pIds = (conv.conversation_participants as { user_id: string }[]).map(
          (p) => p.user_id,
        );
        return (
          pIds.length === 2 &&
          pIds.includes(user.id) &&
          pIds.includes(otherParticipants[0])
        );
      });

      if (existingConversation) {
        return { success: true, data: { id: existingConversation.id } };
      }
    }
  }

  // Create the conversation
  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({
      title: isGroup ? title || null : null,
      is_group: isGroup,
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (conversationError || !conversation) {
    console.error("Error creating conversation:", conversationError);
    return { success: false, error: "Failed to create conversation" };
  }

  // Add participants (include current user)
  const allParticipantIds = [user.id, ...otherParticipants];
  const participants = allParticipantIds.map((id) => ({
    conversation_id: conversation.id,
    user_id: id,
  }));

  const { error: participantsError } = await supabase
    .from("conversation_participants")
    .insert(participants);

  if (participantsError) {
    console.error("Error adding participants:", participantsError);
    // Clean up the conversation we just created
    await supabase.from("conversations").delete().eq("id", conversation.id);
    return { success: false, error: "Failed to add participants" };
  }

  return { success: true, data: { id: conversation.id } };
}
