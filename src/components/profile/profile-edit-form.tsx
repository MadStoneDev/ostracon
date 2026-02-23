"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { updateProfile } from "@/actions/profile-actions";
import UserAvatar from "@/components/ui/user-avatar";
import { IconCamera, IconCheck } from "@tabler/icons-react";

type Profile = {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
};

export default function ProfileEditForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();

  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [coverUrl, setCoverUrl] = useState(profile.cover_url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const uploadFile = async (
    file: File,
    path: string,
  ): Promise<string | null> => {
    const { error } = await supabase.storage
      .from("user.photos")
      .upload(path, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("user.photos").getPublicUrl(path);

    return publicUrl;
  };

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setError(null);

    const path = `${profile.id}/avatar-${Date.now()}.${file.name.split(".").pop()}`;
    const url = await uploadFile(file, path);

    if (url) {
      setAvatarUrl(url);
    } else {
      setError("Failed to upload avatar");
    }

    setIsUploadingAvatar(false);
  };

  const handleCoverUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setError(null);

    const path = `${profile.id}/cover-${Date.now()}.${file.name.split(".").pop()}`;
    const url = await uploadFile(file, path);

    if (url) {
      setCoverUrl(url);
    } else {
      setError("Failed to upload cover photo");
    }

    setIsUploadingCover(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await updateProfile({
      bio,
      avatar_url: avatarUrl,
      cover_url: coverUrl,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/profile/${profile.username}`);
        router.refresh();
      }, 1000);
    } else {
      setError(result.error || "Failed to update profile");
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {/* Cover Photo */}
      <div className="relative">
        <div className="relative w-full h-32 md:h-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden">
          {coverUrl && (
            <Image
              src={coverUrl}
              alt="Cover"
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </div>
        <label
          className={`absolute bottom-2 right-2 p-2 bg-dark/70 dark:bg-light/70 text-light dark:text-dark rounded-full cursor-pointer hover:bg-dark dark:hover:bg-light transition-all duration-300 ease-in-out ${
            isUploadingCover ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <IconCamera size={20} />
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
            disabled={isUploadingCover}
          />
        </label>
        {isUploadingCover && (
          <div className="absolute inset-0 bg-dark/30 grid place-content-center rounded-lg">
            <span className="text-light text-sm">Uploading...</span>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 -mt-12 ml-4">
        <div className="relative">
          <UserAvatar
            username={profile.username}
            avatar_url={avatarUrl}
            avatarSize="w-20 h-20"
            textSize="text-3xl"
          />
          <label
            className={`absolute bottom-0 right-0 p-1.5 bg-dark/70 dark:bg-light/70 text-light dark:text-dark rounded-full cursor-pointer hover:bg-dark dark:hover:bg-light transition-all duration-300 ease-in-out ${
              isUploadingAvatar ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <IconCamera size={16} />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={isUploadingAvatar}
            />
          </label>
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-dark/30 grid place-content-center rounded-full">
              <span className="text-light text-xs">...</span>
            </div>
          )}
        </div>
        <div>
          <h2 className="font-sans font-bold text-lg">@{profile.username}</h2>
        </div>
      </div>

      {/* Bio */}
      <div className="grid gap-2">
        <label className="text-sm font-bold">
          Bio ({bio.length}/500)
        </label>
        <textarea
          value={bio}
          onChange={(e) => {
            if (e.target.value.length <= 500) setBio(e.target.value);
          }}
          placeholder="Tell people about yourself..."
          maxLength={500}
          rows={4}
          className="w-full p-3 bg-neutral-200/70 dark:bg-neutral-50/10 rounded-lg border border-dark/10 dark:border-light/10 focus:outline-none focus:border-primary resize-none transition-all duration-300 ease-in-out"
        />
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-lg flex items-center gap-2">
          <IconCheck size={16} />
          Profile updated! Redirecting...
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || isUploadingAvatar || isUploadingCover}
        className="py-3 bg-primary text-light font-bold rounded-lg hover:bg-dark dark:hover:bg-light dark:hover:text-dark disabled:opacity-50 transition-all duration-300 ease-in-out"
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
