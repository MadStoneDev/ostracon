"use client";

import { useEffect, useState } from "react";

import BottomNav from "@/components/ui/bottom-nav";
import Post from "@/components/feed/single-post";
import PostComments from "@/components/feed/post-comments";

import { settingsService } from "@/lib/settings";
import { UserSettings } from "@/types/settings.types";
import type { Database } from "../../../database.types";

type FragmentRow = Database["public"]["Tables"]["fragments"]["Row"];
type GroupRow = Database["public"]["Tables"]["groups"]["Row"];
type FragmentWithUser = FragmentRow & {
  users?: {
    username: string;
    avatar_url?: string;
  };
  groups?: Pick<GroupRow, "name"> | null;
};

export default function PostPage({
  postId,
  post,
}: {
  postId: string;
  post: FragmentWithUser;
}) {
  const authenticated = true;
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Update analytics on component mount
  useEffect(() => {
    const updateAnalytics = async () => {
      try {
        // Call an API route to increment view count
        await fetch(`/api/analytics/view?postId=${postId}`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to update analytics:", error);
      }
    };

    updateAnalytics();
  }, [postId]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await settingsService.getUserSettings();

        // Ensure boolean values are correctly typed
        const sanitizedSettings = {
          ...userSettings,
          blur_sensitive_content: userSettings.blur_sensitive_content === true,
          allow_sensitive_content:
            userSettings.allow_sensitive_content === true,
        };

        setSettings(sanitizedSettings);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Determine if we should blur content based on settings
  const shouldBlur = settings ? Boolean(settings.blur_sensitive_content) : true;

  return (
    <>
      <div className="post-content">
        <Post
          postId={postId}
          avatar_url={post.users?.avatar_url || ""}
          username={post.users?.username || ""}
          content={post.content || ""}
          nsfw={post.is_nsfw || false}
          commentsAllowed={post.comments_open ?? true}
          reactionsAllowed={post.reactions_open ?? true}
          blur={shouldBlur}
          timestamp={post.created_at}
          groupId={post.group_id}
          groupName={post.groups?.name || ""}
          truncate={false}
          isExpanded={true}
        />
      </div>

      {/* Comments Section - Only show if comments are allowed */}
      {post.comments_open !== false && (
        <div className={`comments-container`}>
          <div className="h-[1px] bg-dark/20 dark:bg-light/20 mt-2 mb-4"></div>
          <PostComments postId={postId} />
        </div>
      )}

      {authenticated && <BottomNav />}
    </>
  );
}
