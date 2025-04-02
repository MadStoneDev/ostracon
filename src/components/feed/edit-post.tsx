"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import PostEditor from "@/components/feed/post-editor";

import {
  IconEyeOff,
  IconHeart,
  IconHeartFilled,
  IconMessage,
  IconMessageFilled,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import CommunitySelector from "@/components/ui/community-selector";
import type { Database } from "../../../database.types";

type PostSettings = {
  allowReactions: boolean;
  allowComments: boolean;
  postNSFW: boolean;
};

type SettingKey = keyof PostSettings;

type FragmentRow = Database["public"]["Tables"]["fragments"]["Row"];
type GroupRow = Database["public"]["Tables"]["groups"]["Row"];
type FragmentWithUser = FragmentRow & {
  users?: {
    username: string;
    avatar_url?: string;
    id?: string;
  };
  groups?: Pick<GroupRow, "name" | "id"> | null;
};

export default function EditPost({
  postId,
  post,
}: {
  postId: string;
  post: FragmentWithUser;
}): React.ReactElement {
  // Supabase
  const supabase = createClient();

  // Hooks
  const router = useRouter();

  // States
  const [postContent, setPostContent] = useState(post.content || "");
  const [allowReactions, setAllowReactions] = useState(
    post.reactions_open ?? true,
  );
  const [allowComments, setAllowComments] = useState(
    post.comments_open ?? true,
  );
  const [postNSFW, setPostNSFW] = useState(post.is_nsfw || false);

  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(
    post.group_id,
  );
  const [isCommunityValidated, setIsCommunityValidated] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Functions
  const handleDefaultSettings = (setting: SettingKey) => {
    switch (setting) {
      case "allowReactions":
        setAllowReactions(!allowReactions);
        break;
      case "allowComments":
        setAllowComments(!allowComments);
        break;
      case "postNSFW":
        setPostNSFW(!postNSFW);
        break;
      default:
        break;
    }
  };

  const handleEditorContentChange = (htmlContent: string) => {
    setPostContent(htmlContent);
  };

  const handleCommunityChange = (communityId: string | null) => {
    setSelectedCommunity(communityId);
  };

  const updatePost = async () => {
    if (postContent.trim().length === 0) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to update this post.");
      }

      // Verify that the current user is the owner of the post
      if (user.id !== post.user_id) {
        throw new Error("You can only edit your own posts.");
      }

      const { data, error } = await supabase
        .from("fragments")
        .update({
          content: postContent,
          comments_open: allowComments,
          reactions_open: allowReactions,
          is_nsfw: postNSFW,
          group_id: selectedCommunity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId)
        .select();

      if (error) {
        throw error;
      }

      if (selectedCommunity) {
        const { data: communityData } = await supabase
          .from("groups")
          .select("name")
          .eq("id", selectedCommunity)
          .single();

        if (communityData?.name) {
          router.push(`/community/${communityData.name}`);
        } else {
          router.push(`/post/${postId}`);
        }
      } else {
        router.push(`/post/${postId}`);
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to update post:", error);
      setError(
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Failed to update post.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePost = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to delete this post.");
      }

      // Verify that the current user is the owner of the post
      if (user.id !== post.user_id) {
        throw new Error("You can only delete your own posts.");
      }

      const { error } = await supabase
        .from("fragments")
        .delete()
        .eq("id", postId);

      if (error) {
        throw error;
      }

      // Redirect to explore page
      router.push("/explore");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete post:", error);
      setError(
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Failed to delete post.",
      );
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`flex-grow flex flex-col h-full`}>
      <div className={`relative flex-grow flex flex-col`}>
        {/* Header */}
        <section className={`relative flex items-center gap-3`}>
          {/* Cancel Edits */}
          <button
            onClick={() => router.back()}
            className={`flex flex-col items-end text-dark dark:text-light hover:text-primary dark:hover:text-primary disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 ease-in-out`}
          >
            <IconX size={24} strokeWidth={2} />
          </button>

          <article className={``}>
            <h1
              className={`font-sans font-black text-xl text-dark dark:text-light`}
            >
              Edit your post
            </h1>
          </article>

          {/* Update Button */}
          <button
            onClick={updatePost}
            className={`absolute top-1 right-0 flex flex-col items-end text-dark dark:text-light hover:text-primary dark:hover:text-primary disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 ease-in-out`}
            disabled={
              postContent.trim().length === 0 || isSubmitting || isDeleting
            }
          >
            {isSubmitting ? (
              <span className={`text-sm`}>Updating...</span>
            ) : (
              <IconSend size={24} strokeWidth={2} />
            )}
          </button>
        </section>

        {/* Post Editor */}
        <article className={`relative grow flex flex-col text-sm`}>
          <PostEditor
            onChange={handleEditorContentChange}
            initialContent={postContent}
          />
        </article>
      </div>

      {/* Communities */}
      <article className={``}>
        <CommunitySelector
          selectedCommunity={selectedCommunity}
          onChange={handleCommunityChange}
        />
      </article>

      {/* Side Bar*/}
      <aside
        className={`px-2 py-3 fixed top-1/2 -translate-y-1/2 right-0 flex flex-col gap-5 bg-dark text-primary dark:bg-light rounded-l-xl`}
      >
        <button
          className={`relative flex-grow flex justify-center items-center h-full`}
          onClick={() => handleDefaultSettings("allowReactions")}
        >
          <div
            className={`${
              allowReactions ? "opacity-100" : "opacity-50"
            } transition-all duration-300 ease-in-out`}
          >
            {allowReactions ? (
              <IconHeartFilled size={24} strokeWidth={2} />
            ) : (
              <IconHeart size={24} strokeWidth={2} />
            )}
          </div>
        </button>

        <button
          className={`relative flex-grow flex justify-center items-center h-full`}
          onClick={() => handleDefaultSettings("allowComments")}
        >
          <div
            className={`${
              allowComments ? "opacity-100" : "opacity-50"
            } transition-all duration-300 ease-in-out`}
          >
            {allowComments ? (
              <IconMessageFilled size={24} strokeWidth={2} />
            ) : (
              <IconMessage size={24} strokeWidth={2} />
            )}
          </div>
        </button>

        <button
          className={`flex-grow flex justify-center items-center gap-1 h-full ${
            postNSFW ? "opacity-100" : "opacity-50"
          } transition-all duration-300 ease-in-out`}
          onClick={() => handleDefaultSettings("postNSFW")}
        >
          <IconEyeOff size={24} strokeWidth={2} />
        </button>
      </aside>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Delete Post</h3>
            <p className="mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={deletePost}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <div className="py-2 text-red-500 text-sm">{error}</div>}

      {/*  Footer*/}
      <footer className={`py-4 flex flex-col text-xs`}>
        {!allowReactions && <p>Reactions have been disabled for this post.</p>}
        {!allowComments && <p>Comments have been disabled for this post.</p>}
        {postNSFW && (
          <p>
            Thank you for keeping our community safe by marking this post as
            sensitive.
          </p>
        )}
      </footer>
    </div>
  );
}
