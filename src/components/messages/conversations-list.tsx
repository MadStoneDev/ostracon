"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import UserAvatar from "@/components/ui/user-avatar";
import { formatTimeAgo } from "@/utils/format-time";

// Types
type ConversationType = {
  id: string;
  title: string | null;
  is_group: boolean | null;
  last_message_at: string | null;
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

type ConversationsListProps = {
  currentUser: User;
  primaryConversations: ConversationType[];
  otherConversations: ConversationType[];
  lastReadTimes: Record<string, string | null>;
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -1000 : 1000,
    opacity: 0,
    zIndex: 0,
  }),
};

export default function ConversationsList({
  currentUser,
  primaryConversations,
  otherConversations,
  lastReadTimes,
}: ConversationsListProps) {
  const [[activeTab, direction], setActiveTab] = useState(["Primary", 0]);

  const updateTab = (newTab: string) => {
    const tabOrder = ["Primary", "Other"];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    const newDirection = newIndex > currentIndex ? 1 : -1;

    setActiveTab([newTab, newDirection]);
  };

  const getLastMessage = (conversation: ConversationType) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return null;
    }

    // Get the newest message
    const sortedMessages = [...conversation.messages].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return sortedMessages[0];
  };

  const getConversationName = (conversation: ConversationType) => {
    if (conversation.title) {
      return conversation.title;
    }

    if (conversation.is_group) {
      return conversation.participants.map((p) => p.username).join(", ");
    }

    return conversation.participants[0]?.username || "Unknown";
  };

  const isUnread = (conversation: ConversationType) => {
    const lastMessage = getLastMessage(conversation);
    if (!lastMessage) return false;

    // If we sent the last message, it's not unread
    if (lastMessage.sender_id === currentUser.id) return false;

    const lastReadTime = lastReadTimes[conversation.id];
    if (!lastReadTime) return true;

    return new Date(lastMessage.created_at) > new Date(lastReadTime);
  };

  const renderMessagePreview = (message: MessageType | null) => {
    if (!message) return "No messages yet";

    if (message.is_deleted) return "This message was deleted";

    if (message.message_type === "text") {
      return message.content;
    } else if (message.message_type === "image") {
      return "📷 Photo";
    } else if (message.message_type === "gif") {
      return "GIF";
    } else if (message.message_type === "voice") {
      return "🎤 Voice message";
    } else {
      return "New message";
    }
  };

  return (
    <div className="flex-grow overflow-hidden">
      {/* Tabs */}
      <div className="flex px-4 py-2 space-x-2 border-b border-dark/10 dark:border-light/10">
        <button
          className={`group flex items-center rounded-full hover:bg-white hover:text-primary/65 overflow-hidden transition-all duration-300 ease-in-out`}
          onClick={() => updateTab("Primary")}
        >
          <span
            className={`px-3 py-1.5 border rounded-full ${
              activeTab === "Primary"
                ? "text-light border-primary bg-primary"
                : "group-hover:bg-primary/65 text-dark dark:text-light border-dark dark:border-light"
            } transition-all duration-300 ease-in-out`}
          >
            Primary
          </span>
        </button>

        <button
          className={`group flex items-center rounded-full hover:bg-white hover:text-primary/65 overflow-hidden transition-all duration-300 ease-in-out`}
          onClick={() => updateTab("Other")}
        >
          <span
            className={`px-3 py-1.5 border rounded-full ${
              activeTab === "Other"
                ? "text-light border-primary bg-primary"
                : "group-hover:bg-primary/65 text-dark dark:text-light border-dark dark:border-light"
            } transition-all duration-300 ease-in-out`}
          >
            Other
          </span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-grow relative">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className={`absolute inset-0 w-full overflow-y-auto`}
          >
            {activeTab === "Primary" ? (
              <div className="py-2">
                {primaryConversations.length === 0 ? (
                  <div className="text-center py-8 text-dark/60 dark:text-light/60">
                    <p>No primary conversations yet</p>
                    <p className="mt-2 text-sm">
                      Conversations with people you follow will appear here
                    </p>
                  </div>
                ) : (
                  primaryConversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      currentUser={currentUser}
                      unread={isUnread(conversation)}
                      lastMessage={getLastMessage(conversation)}
                      conversationName={getConversationName(conversation)}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="py-2">
                {otherConversations.length === 0 ? (
                  <div className="text-center py-8 text-dark/60 dark:text-light/60">
                    <p>No message requests</p>
                    <p className="mt-2 text-sm">
                      Messages from people you don't follow will appear here
                    </p>
                  </div>
                ) : (
                  otherConversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      currentUser={currentUser}
                      unread={isUnread(conversation)}
                      lastMessage={getLastMessage(conversation)}
                      conversationName={getConversationName(conversation)}
                    />
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  currentUser,
  unread,
  lastMessage,
  conversationName,
}: {
  conversation: ConversationType;
  currentUser: User;
  unread: boolean;
  lastMessage: MessageType | null;
  conversationName: string;
}) {
  const timeAgo = lastMessage
    ? formatTimeAgo(new Date(lastMessage.created_at))
    : "";

  return (
    <Link href={`/messages/${conversation.id}`}>
      <div
        className={`px-4 py-3 flex items-center space-x-3 cursor-pointer hover:bg-dark/5 dark:hover:bg-light/5 ${
          unread ? "bg-primary/10" : ""
        }`}
      >
        {conversation.is_group ? (
          <div className="relative w-12 h-12 rounded-full bg-dark/10 dark:bg-light/10 flex items-center justify-center text-xl font-bold overflow-hidden">
            {/* Group avatar implementation - can be improved */}
            <span>{conversationName.charAt(0)}</span>
          </div>
        ) : (
          <UserAvatar
            username={conversation.participants[0]?.username || "Unknown"}
            avatar_url={conversation.participants[0]?.avatar_url || ""}
            avatarSize="w-12 h-12"
            textSize="text-xl"
          />
        )}

        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-center">
            <span
              className={`font-medium truncate ${unread ? "font-bold" : ""}`}
            >
              {conversationName}
            </span>
            <span className="text-xs text-dark/60 dark:text-light/60 whitespace-nowrap ml-2">
              {timeAgo}
            </span>
          </div>

          <div className="text-sm text-dark/70 dark:text-light/70 truncate mt-1">
            {lastMessage?.sender_id === currentUser.id ? (
              <span>You: {renderMessagePreview(lastMessage)}</span>
            ) : (
              <span>{renderMessagePreview(lastMessage)}</span>
            )}
          </div>
        </div>

        {unread && (
          <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0"></div>
        )}
      </div>
    </Link>
  );

  function renderMessagePreview(message: MessageType | null) {
    if (!message) return "No messages yet";

    if (message.is_deleted) return "This message was deleted";

    if (message.message_type === "text") {
      return message.content;
    } else if (message.message_type === "image") {
      return "📷 Photo";
    } else if (message.message_type === "gif") {
      return "GIF";
    } else if (message.message_type === "voice") {
      return "🎤 Voice message";
    } else {
      return "New message";
    }
  }
}
