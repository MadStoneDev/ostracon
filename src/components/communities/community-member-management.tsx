"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Tables } from "../../../database.types";
import { Shield, ShieldAlert, Crown, UserX, Search } from "lucide-react";

type Profile = Tables<"profiles">;
type CommunityMember = Tables<"community_members"> & {
  profiles: Profile;
};

interface CommunityMemberManagementProps {
  communityName: string;
  members: CommunityMember[];
  currentUserRole: string;
  currentUserId: string;
  createdBy: string | null;
}

export function CommunityMemberManagement({
  communityName,
  members: initialMembers,
  currentUserRole,
  currentUserId,
  createdBy,
}: CommunityMemberManagementProps) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredMembers = members.filter((member) =>
    member.profiles.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const updateMemberRole = async (
    userId: string,
    newRole: "member" | "moderator" | "admin",
  ) => {
    if (
      !confirm(
        `Are you sure you want to change this user's role to ${newRole}?`,
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/communities/${communityName}/members/${userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update role");
      }

      // Update local state
      setMembers(
        members.map((m) =>
          m.user_id === userId ? { ...m, role: newRole } : m,
        ),
      );

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (userId: string, username: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${username} from this community?`,
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/communities/${communityName}/members/${userId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove member");
      }

      // Update local state
      setMembers(members.filter((m) => m.user_id !== userId));

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to remove member");
    } finally {
      setIsLoading(false);
    }
  };

  const transferOwnership = async (userId: string, username: string) => {
    const confirmed = prompt(
      `⚠️ WARNING: You are about to transfer ownership of this community to ${username}.\n\n` +
        `This will:\n` +
        `• Make ${username} the community creator\n` +
        `• Demote you to admin role\n` +
        `• This action CANNOT be undone\n\n` +
        `Type "TRANSFER" to confirm:`,
    );

    if (confirmed !== "TRANSFER") {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/communities/${communityName}/transfer-ownership`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newOwnerId: userId }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to transfer ownership");
      }

      alert("Ownership transferred successfully");
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to transfer ownership",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string, userId: string) => {
    const isCreator = userId === createdBy;

    if (isCreator) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
          <Crown className="h-3 w-3" />
          Creator
        </span>
      );
    }

    switch (role) {
      case "admin":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            <ShieldAlert className="h-3 w-3" />
            Admin
          </span>
        );
      case "moderator":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            <Shield className="h-3 w-3" />
            Moderator
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            Member
          </span>
        );
    }
  };

  const canModifyMember = (memberRole: string, memberId: string) => {
    // Creator can modify anyone
    if (currentUserId === createdBy) return true;

    // Can't modify yourself
    if (memberId === currentUserId) return false;

    // Can't modify creator
    if (memberId === createdBy) return false;

    // Admins can modify moderators and members
    if (currentUserRole === "admin") {
      return memberRole !== "admin";
    }

    return false;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Member Count */}
      <p className="text-sm text-muted-foreground">
        {filteredMembers.length} of {members.length} members
      </p>

      {/* Members List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredMembers.map((member) => (
          <div
            key={member.user_id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {member.profiles.avatar_url ? (
                <img
                  src={member.profiles.avatar_url}
                  alt={member.profiles.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {member.profiles.username[0].toUpperCase()}
                  </span>
                </div>
              )}

              <div>
                <p className="font-medium">{member.profiles.username}</p>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(member.joined_at!).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getRoleBadge(member.role || "member", member.user_id)}

              {canModifyMember(member.role || "member", member.user_id) && (
                <div className="flex gap-1">
                  {/* Role Change Dropdown */}
                  <select
                    value={member.role || "member"}
                    onChange={(e) =>
                      updateMemberRole(
                        member.user_id,
                        e.target.value as "member" | "moderator" | "admin",
                      )
                    }
                    disabled={isLoading}
                    className="text-xs px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="member">Member</option>
                    <option value="moderator">Moderator</option>
                    {currentUserRole === "admin" &&
                      currentUserId === createdBy && (
                        <option value="admin">Admin</option>
                      )}
                  </select>

                  {/* Remove Member Button */}
                  <button
                    onClick={() =>
                      removeMember(member.user_id, member.profiles.username)
                    }
                    disabled={isLoading}
                    className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                    title="Remove member"
                  >
                    <UserX className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Transfer Ownership (Creator only) */}
              {currentUserId === createdBy &&
                member.user_id !== currentUserId &&
                (member.role === "admin" || member.role === "moderator") && (
                  <button
                    onClick={() =>
                      transferOwnership(
                        member.user_id,
                        member.profiles.username,
                      )
                    }
                    disabled={isLoading}
                    className="text-xs px-2 py-1 border border-yellow-600 text-yellow-600 hover:bg-yellow-50 rounded disabled:opacity-50"
                  >
                    Transfer Ownership
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No members found
        </p>
      )}
    </div>
  );
}
