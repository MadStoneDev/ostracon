"use client";

import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createConversation } from "@/actions/conversation-actions";
import UserAvatar from "@/components/ui/user-avatar";
import { IconSearch, IconArrowLeft, IconUserPlus } from "@tabler/icons-react";

type UserType = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type NewConversationFormProps = {
  currentUser: User;
  userProfiles: UserType[];
};

export default function NewConversationForm({
  currentUser,
  userProfiles,
}: NewConversationFormProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const filteredUsers = userProfiles.filter(
    (profile) =>
      !selectedUsers.some((user) => user.id === profile.id) &&
      profile.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelectUser = (user: UserType) => {
    if (isGroup) {
      setSelectedUsers((prev) => [...prev, user]);
    } else {
      setSelectedUsers([user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const handleToggleGroup = () => {
    setIsGroup((prev) => !prev);
    if (!isGroup && selectedUsers.length > 1) {
      // If switching to group chat and already have multiple users selected, keep them
    } else if (isGroup && selectedUsers.length > 0) {
      // If switching from group chat to individual, keep only the first user
      setSelectedUsers((prev) => [prev[0]]);
    }
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) return;

    setIsCreating(true);

    try {
      const participantIds = selectedUsers.map((user) => user.id);

      const result = await createConversation(
        participantIds,
        isGroup ? groupName : undefined,
        isGroup,
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to create conversation");
      }

      if (result.data?.id) {
        router.push(`/messages/${result.data.id}`);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to create conversation");
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    router.push("/messages");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 flex items-center">
        <button
          onClick={handleBack}
          className="mr-2 p-1 rounded-full hover:bg-dark/10 dark:hover:bg-light/10"
        >
          <IconArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">New Message</h1>
      </div>

      {/* Group toggle */}
      <div className="mb-4 flex items-center">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isGroup}
            onChange={handleToggleGroup}
            className="mr-2"
          />
          <span>Make this a group conversation</span>
        </label>
      </div>

      {/* Group name (if group) */}
      {isGroup && (
        <div className="mb-4">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name (optional)"
            className="w-full p-2 border rounded focus:outline-none"
          />
        </div>
      )}

      {/* Selected users */}
      {selectedUsers.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">To:</div>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center bg-dark/10 dark:bg-light/10 rounded-full pl-1 pr-2 py-1"
              >
                <UserAvatar
                  username={user.username}
                  avatar_url={user.avatar_url || ""}
                  avatarSize="w-6 h-6"
                  textSize="text-xs"
                />
                <span className="mx-1">{user.username}</span>
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      {(isGroup || selectedUsers.length === 0) && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className={`w-full p-2 pl-10 border rounded focus:outline-none`}
            />
            <IconSearch
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark/40 dark:text-light/40"
            />
          </div>
        </div>
      )}

      {/* User list */}
      <div className={`flex-grow overflow-y-auto`}>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-dark/60 dark:text-light/60">
            <p>No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="w-full p-2 flex items-center hover:bg-dark/5 dark:hover:bg-light/5 rounded"
              >
                <UserAvatar
                  username={user.username}
                  avatar_url={user.avatar_url || ""}
                  avatarSize="w-10 h-10"
                  textSize="text-base"
                />
                <span className="ml-3">{user.username}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create button */}
      <div className="mt-4">
        <button
          onClick={handleCreateConversation}
          disabled={selectedUsers.length === 0 || isCreating}
          className="w-full py-2 flex items-center justify-center gap-2 bg-primary text-white rounded disabled:opacity-50"
        >
          <IconUserPlus size={20} />
          {isGroup ? "Create Group Conversation" : "Start Conversation"}
        </button>
      </div>
    </div>
  );
}
