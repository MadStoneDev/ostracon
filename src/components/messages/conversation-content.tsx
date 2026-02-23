"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";

import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

import { IconArrowLeft } from "@tabler/icons-react";
import UserAvatar from "@/components/ui/user-avatar";
import MessageInput from "@/components/messages/message-input";
import { formatMessageTime, formatDateForGrouping } from "@/utils/format-time";

// Types
type ConversationType = {
  id: string;
  name: string;
  title: string | null;
  is_group: boolean | null;
  messages: MessageType[];
  participants: UserType[];
};

type MessageType = {
  id: string;
  content: string | null;
  created_at: string;
  sender_id: string | null;
  message_type: string;
  media_url: string | null;
  media_type: string | null;
  is_deleted: boolean | null;
};

type UserType = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type ConversationContentProps = {
  currentUser: User;
  currentUserProfile: any;
  conversation: ConversationType;
};

export default function ConversationContent({
  currentUser,
  currentUserProfile,
  conversation,
}: ConversationContentProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageType[]>(
    conversation.messages,
  );
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          // Add the new message to the list
          setMessages((prev) => [...prev, payload.new as MessageType]);
        },
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, supabase]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update last read timestamp when viewing messages
  useEffect(() => {
    const updateLastRead = async () => {
      await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversation.id)
        .eq("user_id", currentUser.id);
    };

    updateLastRead();
  }, [conversation.id, currentUser.id, supabase]);

  const handleSendMessage = async (
    content: string | null,
    messageType: string,
    mediaUrl: string | null = null,
    mediaType: string | null = null,
  ) => {
    if (!content && !mediaUrl) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversation.id,
            content,
            sender_id: currentUser.id,
            message_type: messageType,
            media_url: mediaUrl,
            media_type: mediaType,
          },
        ])
        .select();

      if (error) throw error;

      // Update the conversation's last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversation.id);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  const loadMoreMessages = async () => {
    if (loadingMoreMessages || messages.length === 0) return;

    setLoadingMoreMessages(true);

    try {
      // Get the oldest message we have
      const oldestMessage = messages.reduce((prev, current) => {
        return new Date(prev.created_at) < new Date(current.created_at)
          ? prev
          : current;
      });

      // Load messages older than this one
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .lt("created_at", oldestMessage.created_at)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data.length > 0) {
        // Add older messages to the beginning of the list
        setMessages((prev) => [...data.reverse(), ...prev]);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  // Delete a message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await supabase
        .from("messages")
        .update({ is_deleted: true })
        .eq("id", messageId)
        .eq("sender_id", currentUser.id);

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, is_deleted: true } : msg,
        ),
      );
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message");
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups: Record<string, MessageType[]>, message) => {
      const date = formatDateForGrouping(new Date(message.created_at));
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {},
  );

  // Go back to messages list
  const handleBack = () => {
    router.push("/messages");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-dark/10 dark:border-light/10 flex items-center">
        <button
          onClick={handleBack}
          className="mr-2 p-1 rounded-full hover:bg-dark/10 dark:hover:bg-light/10"
        >
          <IconArrowLeft size={24} />
        </button>

        <div className="flex items-center">
          {conversation.is_group ? (
            <div className="w-10 h-10 rounded-full bg-dark/10 dark:bg-light/10 flex items-center justify-center">
              <span className="text-xl font-bold">
                {conversation.name.charAt(0)}
              </span>
            </div>
          ) : (
            <UserAvatar
              username={conversation.participants[0]?.username || "Unknown"}
              avatar_url={conversation.participants[0]?.avatar_url || ""}
              avatarSize="w-10 h-10"
              textSize="text-lg"
            />
          )}

          <div className="ml-3">
            <h2 className="font-semibold">{conversation.name}</h2>
            {conversation.is_group && (
              <p className="text-xs text-dark/60 dark:text-light/60">
                {conversation.participants.length + 1} members
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-dark/60 dark:text-light/60">
            <p>No messages yet</p>
            <p className="text-sm mt-2">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          <div>
            {loadingMoreMessages && (
              <div className="text-center py-2 text-dark/60 dark:text-light/60">
                <p>Loading older messages...</p>
              </div>
            )}

            <button
              onClick={loadMoreMessages}
              className="w-full py-2 text-primary hover:underline"
            >
              Load older messages
            </button>

            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="flex justify-center my-4">
                  <div className="px-3 py-1 rounded-full bg-dark/10 dark:bg-light/10 text-sm">
                    {date}
                  </div>
                </div>

                {dateMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={message.sender_id === currentUser.id}
                    senderProfile={
                      message.sender_id === currentUser.id
                        ? currentUserProfile
                        : conversation.participants.find(
                            (p) => p.id === message.sender_id,
                          )
                    }
                    showSender={conversation.is_group}
                    onDelete={() => handleDeleteMessage(message.id)}
                  />
                ))}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-dark/10 dark:border-light/10 p-2">
        <MessageInput
          onSendMessage={handleSendMessage}
          conversationId={conversation.id}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isOwnMessage,
  senderProfile,
  showSender,
  onDelete,
}: {
  message: MessageType;
  isOwnMessage: boolean;
  senderProfile: UserType | undefined;
  showSender: boolean | null;
  onDelete: () => void;
}) {
  const [showOptions, setShowOptions] = useState(false);

  const messageTime = formatMessageTime(new Date(message.created_at));

  // Handle message content based on message type
  const renderMessageContent = () => {
    if (message.is_deleted) {
      return (
        <div className="italic text-dark/60 dark:text-light/60">
          This message was deleted
        </div>
      );
    }

    switch (message.message_type) {
      case "text":
        return <div>{message.content}</div>;

      case "image":
        return (
          <div className="max-w-[240px]">
            <Image
              src={message.media_url || ""}
              alt="Shared image"
              width={240}
              height={300}
              className="rounded-lg max-h-[300px] object-contain"
              unoptimized
            />
            {message.content && <div className="mt-1">{message.content}</div>}
          </div>
        );

      case "gif":
        return (
          <div className="max-w-[240px]">
            <Image
              src={message.media_url || ""}
              alt="GIF"
              width={240}
              height={200}
              className="rounded-lg max-h-[200px] object-contain"
              unoptimized
            />
            {message.content && <div className="mt-1">{message.content}</div>}
          </div>
        );

      case "voice":
        return (
          <div>
            <audio controls className="max-w-[240px]">
              <source src={message.media_url || ""} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            {message.content && <div className="mt-1">{message.content}</div>}
          </div>
        );

      default:
        return <div>{message.content}</div>;
    }
  };

  return (
    <div
      className={`mb-3 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div
        className={`flex ${
          isOwnMessage ? "flex-row-reverse" : "flex-row"
        } items-end max-w-[80%]`}
      >
        {!isOwnMessage && (
          <div className="mx-2 flex-shrink-0">
            <UserAvatar
              username={senderProfile?.username || "Unknown"}
              avatar_url={senderProfile?.avatar_url || ""}
              avatarSize="w-8 h-8"
              textSize="text-xs"
            />
          </div>
        )}

        <div
          className={`rounded-2xl px-3 py-2 ${
            isOwnMessage
              ? "bg-primary text-white rounded-br-none"
              : "bg-dark/10 dark:bg-light/10 rounded-bl-none"
          } relative`}
        >
          {showSender && !isOwnMessage && senderProfile && (
            <div className="text-xs font-semibold mb-1">
              {senderProfile.username}
            </div>
          )}

          {renderMessageContent()}

          <div
            className={`text-xs ${
              isOwnMessage ? "text-white/80" : "text-dark/60 dark:text-light/60"
            } mt-1 text-right`}
          >
            {messageTime}
          </div>

          {isOwnMessage && showOptions && !message.is_deleted && (
            <button
              onClick={onDelete}
              className="absolute -top-6 right-0 px-2 py-0.5 bg-red-500 text-white text-xs rounded"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
