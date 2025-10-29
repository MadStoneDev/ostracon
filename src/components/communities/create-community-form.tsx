"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  sanitizeCommunityName,
  getCommunityNameError,
  isReservedCommunityName,
} from "@/utils/validation";

interface CreateCommunityFormProps {
  onSuccess?: () => void;
}

export function CreateCommunityForm({ onSuccess }: CreateCommunityFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    const sanitized = sanitizeCommunityName(value);
    setName(sanitized);

    // Real-time validation
    if (sanitized) {
      const error = getCommunityNameError(sanitized);
      if (error) {
        setNameError(error);
      } else if (isReservedCommunityName(sanitized)) {
        setNameError("This community name is reserved");
      } else {
        setNameError(null);
      }
    } else {
      setNameError(null);
    }
  };

  // Auto-generate URL name from display name
  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    if (!name) {
      handleNameChange(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          displayName,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create community");
      }

      router.push(`/connect/${data.name}`);
      router.refresh();
      onSuccess?.();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create community",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="displayName" className="block text-sm font-bold mb-1">
          Community Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="displayName"
          value={displayName}
          onChange={(e) => handleDisplayNameChange(e.target.value)}
          placeholder="Community Name"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
          maxLength={50}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground mt-1">
          The display name shown to users
        </p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-bold mb-1">
          URL Name <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            ostracon.app/connect/
          </span>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="community-slug"
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              nameError
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-primary"
            }`}
            required
            pattern="[a-z0-9-]+"
            minLength={3}
            maxLength={50}
            disabled={isSubmitting}
          />
        </div>
        {nameError ? (
          <p className="text-xs text-red-500 mt-1">{nameError}</p>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">
            Lowercase letters, numbers, and hyphens only (3-50 characters)
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-bold mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A community for photography enthusiasts to share tips, photos, and discussions"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={3}
          maxLength={500}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {description.length}/500 characters
        </p>
      </div>

      <div className="flex gap-2 justify-end mt-2">
        <button
          type="submit"
          disabled={isSubmitting || !!nameError || !name || !displayName}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          {isSubmitting ? "Creating..." : "Create Community"}
        </button>
      </div>
    </form>
  );
}
