import { Tables } from "../../database.types";

// Base types from your database schema
export type Message = Tables<"messages">;
export type Conversation = Tables<"conversations">;
export type ConversationParticipant = Tables<"conversation_participants">;
export type User = Tables<"users">;
export type Notification = Tables<"notifications">;

// Extended types for nested queries

export type MessageWithSender = Message & {
  sender?: User;
};

export type ConversationWithMessages = Conversation & {
  messages: MessageWithSender[];
};

export type ParticipationWithConversation = ConversationParticipant & {
  conversations: ConversationWithMessages;
};

// Types for notification handling

export type NotificationType = "follow" | "like" | "comment";

export type NotificationWithActor = Notification & {
  actor?: User;
  data?: {
    actors?: string[];
    count?: number;
    fragmentId?: string;
    commentId?: string;
    commentPreview?: string;
  };
};

// Type for grouped actors in notifications
export type NotificationActorInfo = {
  id: string;
  username: string;
  avatar_url: string | null;
};

// Helper function to cast Supabase query results to typed objects
export function castParticipations(
  data: any[],
): ParticipationWithConversation[] {
  return data as ParticipationWithConversation[];
}

export function castNotifications(data: any[]): NotificationWithActor[] {
  return data as NotificationWithActor[];
}
