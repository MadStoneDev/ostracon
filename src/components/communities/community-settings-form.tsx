"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Tables } from "../../../database.types";

type Community = Tables<"communities">;

interface CommunitySettingsFormProps {
  community: Community;
}

export function CommunitySettingsForm({
  community,
}: CommunitySettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [displayName, setDisplayName] = useState(community.display_name);
  const [description, setDescription] = useState(community.description || "");
  const [isNsfw, setIsNsfw] = useState(community.is_nsfw || false);
  const [joinType, setJoinType] = useState(community.join_type || "open");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/communities/${community.name}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          description,
          is_nsfw: isNsfw,
          join_type: joinType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update community");
      }

      setSuccess(true);
      router.refresh();

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update community",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
          Community settings updated successfully!
        </div>
      )}

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-4">Basic Information</h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium mb-1"
            >
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
              maxLength={50}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL Name</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">/connect/</span>
              <span className="text-sm">{community.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              URL names cannot be changed after creation
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/500 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="joinType"
              className="block text-sm font-medium mb-1"
            >
              Join Type
            </label>
            <select
              id="joinType"
              value={joinType}
              onChange={(e) => setJoinType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSubmitting}
            >
              <option value="open">Open - Anyone can join</option>
              <option value="approval_required">
                Approval Required - Admins must approve requests
              </option>
              <option value="paid" disabled>
                Paid - Requires payment (Coming Soon)
              </option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {joinType === "open" &&
                "Members can join freely without approval"}
              {joinType === "approval_required" &&
                "Admins must approve join requests"}
              {joinType === "paid" &&
                "Members must pay a fee to join (Not yet available)"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isNsfw"
              checked={isNsfw}
              onChange={(e) => setIsNsfw(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              disabled={isSubmitting}
            />
            <label
              htmlFor="isNsfw"
              className="text-sm font-medium cursor-pointer"
            >
              Mark as NSFW (Not Safe For Work)
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
