import React from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import ConversationContent from "@/components/messages/conversation-content";

export default async function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const { conversationId } = params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching profile:", profileError);
    return <div>Error loading profile</div>;
  }

  // Check if the user is a participant in this conversation
  const { data: participant, error: participantError } = await supabase
    .from("conversation_participants")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (participantError) {
    console.error(
      "Error checking conversation participation:",
      participantError,
    );
    return <div>You don't have access to this conversation</div>;
  }

  // Get conversation details
  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select(
      `
      *,
      conversation_participants!inner (user_id)
    `,
    )
    .eq("id", conversationId)
    .single();

  if (conversationError || !conversation) {
    console.error("Error fetching conversation:", conversationError);
    return <div>Conversation not found</div>;
  }

  // Get all messages for this conversation
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Error fetching messages:", messagesError);
    return <div>Error loading messages</div>;
  }

  // Get all other participants in this conversation
  const otherUserIds = conversation.conversation_participants
    .filter((p: any) => p.user_id !== user.id)
    .map((p: any) => p.user_id);

  // Get profiles for all other participants
  const { data: otherProfiles, error: otherProfilesError } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .in("id", otherUserIds);

  if (otherProfilesError) {
    console.error("Error fetching other profiles:", otherProfilesError);
    return <div>Error loading user profiles</div>;
  }

  // Update last read time for this user
  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);

  // Get conversation name
  let conversationName = conversation.title;

  if (!conversationName && !conversation.is_group) {
    // For DMs, use the other person's username
    conversationName = otherProfiles?.[0]?.username || "Unknown User";
  } else if (!conversationName && conversation.is_group) {
    // For group conversations without a title, list members
    conversationName =
      otherProfiles?.map((p) => p.username).join(", ") || "Group Conversation";
  }

  return (
    <ConversationContent
      currentUser={user}
      currentUserProfile={profile}
      conversation={{
        ...conversation,
        name: conversationName,
        messages: messages || [],
        participants: otherProfiles || [],
      }}
    />
  );
}
