"use client";

import { useEffect, useState } from "react";

import BottomNav from "@/components/ui/bottom-nav";
import Post from "@/components/feed/single-post";

import { sampleUsers } from "@/data/sample-users";
import { PostFragment } from "@/types/fragments";

import { settingsService } from "@/lib/settings";
import { UserSettings } from "@/types/settings.types";

export default function PostPage({
  postId,
  post,
}: {
  postId: string;
  post: PostFragment;
}) {
  const authenticated = true;
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await settingsService.getUserSettings();
        setSettings(userSettings);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const username = sampleUsers.find((user) => user.id === post.user_id)
    ?.username;

  const avatar_url = sampleUsers.find((user) => user.id === post.user_id)
    ?.avatar_url;

  return (
    <>
      <Post
        postId={postId}
        avatar_url={avatar_url || ""}
        username={username || "Ghost User"}
        content={post.content}
        nsfw={post.is_nsfw}
        blur={settings ? !settings.blur_sensitive_content : true}
        timestamp={post.created_at}
        truncate={false}
        isExpanded={true}
      />

      {authenticated && <BottomNav />}
    </>
  );
}
