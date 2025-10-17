import React from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import ConversationsList from "@/components/messages/conversations-list";

export default async function Messages() {
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
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching profile:", profileError);
    return <div>Error loading profile</div>;
  }

  // Get all conversations where user is a participant
  const { data: participations, error: participationsError } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", user.id);

  if (participationsError) {
    console.error("Error fetching conversations:", participationsError);
    return (
      <div className="h-full flex flex-col">
        <div
          className={`p-4 border-b border-dark/10 dark:border-light/10 flex justify-between items-center`}
        >
          <h1 className="text-2xl font-bold">Messages</h1>
          <a
            href="/messages/new"
            className="p-2 bg-primary text-white rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </a>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Messages Yet</h2>
          <p className="text-dark/60 dark:text-light/60 mb-6">
            You have no conversations currently.
          </p>
          <a
            href="/messages/new"
            className="px-4 py-2 bg-primary text-white rounded-full flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Start a Conversation
          </a>
        </div>
      </div>
    );
  }

  const conversationIds = participations?.map((p) => p.conversation_id) || [];

  // If user has no conversations, show empty state
  if (conversationIds.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div
          className={`pb-4 border-b border-dark/10 dark:border-light/10 flex justify-between items-center`}
        >
          <h1 className="text-2xl font-bold">Messages</h1>
          <a
            href="/messages/new"
            className="p-2 bg-primary text-white rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </a>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Messages Yet</h2>
          <p className="text-dark/60 dark:text-light/60 mb-6">
            You have no conversations currently. Why not start a conversation
            with someone?
          </p>
          <a
            href="/messages/new"
            className="px-4 py-2 bg-primary text-white rounded-full flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Start a Conversation
          </a>
        </div>
      </div>
    );
  }

  // Get conversation details
  const { data: conversations, error: conversationsError } = await supabase
    .from("conversations")
    .select(
      `
      *,
      conversation_participants!inner (user_id),
      messages (
        id,
        content,
        created_at,
        sender_id,
        message_type,
        media_url,
        media_type,
        is_deleted
      )
    `,
    )
    .in("id", conversationIds)
    .order("last_message_at", { ascending: false });

  if (conversationsError) {
    console.error("Error fetching conversation details:", conversationsError);
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-dark/10 dark:border-light/10 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Messages</h1>
          <a
            href="/messages/new"
            className="p-2 bg-primary text-white rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </a>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-dark/60 dark:text-light/60 mb-6">
            We couldn't load your conversations. Try again later or start a new
            one.
          </p>
          <a
            href="/messages/new"
            className="px-4 py-2 bg-primary text-white rounded-full flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Start a New Conversation
          </a>
        </div>
      </div>
    );
  }

  // Get all other users in these conversations
  const otherUserIds = new Set<string>();
  conversations?.forEach((conversation) => {
    conversation.conversation_participants.forEach((participant: any) => {
      if (participant.user_id !== user.id) {
        otherUserIds.add(participant.user_id);
      }
    });
  });

  // Get user profiles for all participants
  const { data: userProfiles, error: userProfilesError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", Array.from(otherUserIds));

  if (userProfilesError) {
    console.error("Error fetching user profiles:", userProfilesError);
    return <div>Error loading user profiles</div>;
  }

  // Get following list
  const { data: following, error: followingError } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  if (followingError) {
    console.error("Error fetching following:", followingError);
    return <div>Error loading following list</div>;
  }

  const followingIds = following?.map((f) => f.following_id) || [];

  // Create a map of user profiles
  const userProfilesMap = userProfiles?.reduce(
    (acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    },
    {} as Record<string, any>,
  );

  // Process conversations to determine Primary vs Other
  const primaryConversations: any[] = [];
  const otherConversations: any[] = [];

  conversations?.forEach((conversation) => {
    // Find the other participants in this conversation
    const otherParticipantIds = conversation.conversation_participants
      .filter((p: any) => p.user_id !== user.id)
      .map((p: any) => p.user_id);

    // Check if any of them are followed by the current user
    const anyFollowed = otherParticipantIds.some((id: any) =>
      followingIds.includes(id),
    );

    // Check if we've replied to this conversation - if there's a message from us, it's primary
    const hasReplied = conversation.messages.some(
      (m: any) => m.sender_id === user.id,
    );

    // Add the conversation to the appropriate list
    if (anyFollowed || hasReplied) {
      primaryConversations.push({
        ...conversation,
        participants: otherParticipantIds.map((id: any) => userProfilesMap[id]),
      });
    } else {
      otherConversations.push({
        ...conversation,
        participants: otherParticipantIds.map((id: any) => userProfilesMap[id]),
      });
    }
  });

  return (
    <div className="h-full flex flex-col">
      <div
        className={`p-4 border-b border-dark/10 dark:border-light/10 flex justify-between items-center`}
      >
        <h1 className="text-2xl font-bold">Messages</h1>
        <a
          href="/messages/new"
          className="p-2 bg-primary text-white rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </a>
      </div>

      <ConversationsList
        currentUser={user}
        primaryConversations={primaryConversations}
        otherConversations={otherConversations}
        lastReadTimes={participations?.reduce(
          (acc, p) => {
            acc[p.conversation_id] = p.last_read_at;
            return acc;
          },
          {} as Record<string, string | null>,
        )}
      />
    </div>
  );
}
