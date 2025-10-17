"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import PostEditor from "@/components/feed/post-editor";

import {
  IconHeart,
  IconHeartFilled,
  IconMessage,
  IconMessageFilled,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import { Drama } from "lucide-react";

import CommunitySelector from "@/components/ui/community-selector";

import type { Database } from "../../../../database.types";
import TagSelector from "@/components/ui/tag-selector";

type PostSettings = {
  allowReactions: boolean;
  allowComments: boolean;
  postNSFW: boolean;
};

type SettingKey = keyof PostSettings;

type FragmentRow = Database["public"]["Tables"]["fragments"]["Row"];
type CommunityRow = Database["public"]["Tables"]["communities"]["Row"];
type Tag = Database["public"]["Tables"]["tags"]["Row"];
type FragmentWithUser = FragmentRow & {
  users?: {
    username: string;
    avatar_url?: string;
    id?: string;
  };
  groups?: Pick<CommunityRow, "name" | "id"> | null;
};

interface PostFormProps {
  postId?: string;
  post?: FragmentWithUser;
  isEditing?: boolean;
}

export default function PostForm({
  postId,
  post,
  isEditing = false,
}: PostFormProps): React.ReactElement {
  // Supabase
  const supabase = createClient();

  // Hooks
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [postTitle, setPostTitle] = useState(post?.title || "");
  const [postContent, setPostContent] = useState(post?.content || "");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [allowReactions, setAllowReactions] = useState(
    post?.reactions_open ?? true,
  );
  const [allowComments, setAllowComments] = useState(
    post?.comments_open ?? true,
  );
  const [postNSFW, setPostNSFW] = useState(post?.is_nsfw || false);

  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(
    post?.community_id || null,
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
        // Only save default settings when creating new post
        if (!isEditing) {
          const fromLocalStorage = JSON.parse(
            localStorage.getItem("defaultPostSettings") || "{}",
          ) as Partial<PostSettings>;
          fromLocalStorage.allowReactions = !allowReactions;
          localStorage.setItem(
            "defaultPostSettings",
            JSON.stringify(fromLocalStorage),
          );
        }
        break;
      case "allowComments":
        setAllowComments(!allowComments);
        if (!isEditing) {
          const fromLocalStorage = JSON.parse(
            localStorage.getItem("defaultPostSettings") || "{}",
          ) as Partial<PostSettings>;
          fromLocalStorage.allowComments = !allowComments;
          localStorage.setItem(
            "defaultPostSettings",
            JSON.stringify(fromLocalStorage),
          );
        }
        break;
      case "postNSFW":
        setPostNSFW(!postNSFW);
        if (!isEditing) {
          const fromLocalStorage = JSON.parse(
            localStorage.getItem("defaultPostSettings") || "{}",
          ) as Partial<PostSettings>;
          fromLocalStorage.postNSFW = !postNSFW;
          localStorage.setItem(
            "defaultPostSettings",
            JSON.stringify(fromLocalStorage),
          );
        }
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

  const submitPost = async () => {
    if (postContent.trim().length === 0) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let publishedTimestamp = null;

    if (selectedCommunity !== "draft") {
      publishedTimestamp = isEditing
        ? post?.published_at
        : new Date().toISOString();
    }

    const postData = {
      title: postTitle || "",
      content: postContent,
      comments_open: allowComments,
      reactions_open: allowReactions,
      is_nsfw: postNSFW,
      updated_at: new Date().toISOString(),
      is_draft: selectedCommunity === "draft",
      community_id:
        selectedCommunity !== "draft" && selectedCommunity !== "public"
          ? selectedCommunity
          : "",
      published_at: publishedTimestamp,
    };

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to post.");
      }

      if (isEditing && postId) {
        // Check post ownership
        if (user.id !== post?.user_id) {
          throw new Error("You can only edit your own posts.");
        }

        // Update existing post
        const { data, error } = await supabase
          .from("fragments")
          .update(postData)
          .eq("id", postId)
          .select();

        if (error) {
          throw error;
        }

        if (selectedCommunity) {
          const { data: communityData } = await supabase
            .from("communities")
            .select("name")
            .eq("id", selectedCommunity)
            .single();

          if (communityData?.name) {
            router.push(`/connect/${communityData.name}`);
          } else {
            router.push(`/post/${postId}`);
          }
        } else {
          router.push(`/post/${postId}`);
        }
      } else {
        // Create new post
        const { data: fragmentData, error } = await supabase
          .from("fragments")
          .insert(postData)
          .select()
          .single();

        // After inserting the fragment
        if (selectedTags.length > 0 && fragmentData?.id) {
          const tagInserts = selectedTags.map((tag) => ({
            fragment_id: fragmentData.id,
            tag_id: tag.id,
          }));

          await supabase.from("fragment_tags").insert(tagInserts);
        }

        if (error) {
          throw error;
        }

        if (selectedCommunity) {
          const { data: communityData } = await supabase
            .from("communities")
            .select("name")
            .eq("id", selectedCommunity)
            .single();

          if (communityData?.name) {
            router.push(`/connect/${communityData.name}`);
          } else {
            router.push(`/explore`);
          }
        } else {
          router.push(`/explore`);
        }
      }

      router.refresh();
    } catch (error) {
      console.error(
        `Failed to ${isEditing ? "update" : "submit"} post:`,
        error,
      );
      setError(
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : `Failed to ${isEditing ? "update" : "submit"} post.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePost = async () => {
    if (!isEditing || !postId) return;

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
      if (user.id !== post?.user_id) {
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

  // Load default settings for new posts
  useEffect(() => {
    if (!isEditing) {
      const checkLocalStorage = localStorage.getItem("defaultPostSettings");

      if (checkLocalStorage) {
        const fromLocalStorage = JSON.parse(checkLocalStorage);

        setAllowReactions(fromLocalStorage["allowReactions"] ?? true);
        setAllowComments(fromLocalStorage["allowComments"] ?? true);
        setPostNSFW(fromLocalStorage["postNSFW"] ?? false);
      } else {
        localStorage.setItem(
          "defaultPostSettings",
          JSON.stringify({
            allowReactions: true,
            allowComments: true,
            postNSFW: false,
          }),
        );
      }
    }
  }, [isEditing]);

  // Check community from URL for new posts
  useEffect(() => {
    async function validateCommunity() {
      if (isEditing) return; // Skip for edit mode

      const communityFromUrl = searchParams.get("community");

      if (!communityFromUrl) {
        setIsCommunityValidated(true); // No community to validate
        return;
      }

      try {
        const { data: communityData, error: communityError } = await supabase
          .from("communities")
          .select("id")
          .eq("name", communityFromUrl)
          .single();

        if (communityError) {
          throw communityError;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsCommunityValidated(false);
          return;
        }

        const { data: memberData, error: memberError } = await supabase
          .from("community_members")
          .select("community_id")
          .eq("user_id", user.id)
          .eq("community_id", communityData.id);

        if (!memberError && memberData && memberData.length > 0) {
          setSelectedCommunity(communityData.id);
        }

        setIsCommunityValidated(true);
      } catch (error) {
        console.error("Error validating community:", error);
        setIsCommunityValidated(true); // Continue without community
      }
    }
    validateCommunity();
  }, [supabase, searchParams, isEditing]);

  useEffect(() => {
    async function fetchAvailableTags() {
      const { data: tags, error } = await supabase.from("tags").select("*");

      if (tags) {
        setAvailableTags(tags);
      }
    }

    fetchAvailableTags();
  }, [supabase]);

  return (
    <div className={`flex-grow flex flex-col h-full`}>
      <div className={`mb-3 relative flex-grow flex flex-col gap-3`}>
        {/* Header */}
        <section className={`relative flex items-center gap-3`}>
          {isEditing && (
            <button
              onClick={() => router.back()}
              className={`flex flex-col items-end text-dark dark:text-light hover:text-primary dark:hover:text-primary disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 ease-in-out`}
            >
              <IconX size={24} strokeWidth={2} />
            </button>
          )}

          <article className={``}>
            <h1
              className={`font-sans font-black text-xl text-dark dark:text-light`}
            >
              {isEditing ? "Edit your post" : "What do you want to share?"}
            </h1>
          </article>

          {/* Submit Button */}
          <button
            onClick={submitPost}
            className={`${
              isEditing ? "absolute top-1 right-0" : "absolute top-1 right-0"
            } flex flex-col items-end text-dark dark:text-light hover:text-primary dark:hover:text-primary disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 ease-in-out`}
            disabled={
              postContent.trim().length === 0 ||
              isSubmitting ||
              isDeleting ||
              !isCommunityValidated
            }
          >
            {isSubmitting ? (
              <span className={`text-sm`}>
                {isEditing ? "Updating..." : "Posting..."}
              </span>
            ) : (
              <IconSend size={24} strokeWidth={2} />
            )}
          </button>
        </section>

        <section className={`relative flex flex-col text-sm`}>
          <input
            type="text"
            value={postTitle || ""}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Title (optional)"
            className={`py-2 px-4 w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-900 focus:outline-none focus:border-primary`}
          />
        </section>

        <TagSelector
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagAdd={(tag) => {
            // Create a new array to avoid mutating state directly
            const tagsArray = [...selectedTags];

            // Check if tag is not already in the array before adding
            if (!tagsArray.some((existingTag) => existingTag.id === tag.id)) {
              tagsArray.push(tag);
              setSelectedTags(tagsArray);
            }
          }}
          onTagRemove={(tag: string) => {
            // Filter out the tag to remove
            const tagsArray = selectedTags.filter(
              (existingTag) => existingTag.id !== tag,
            );
            setSelectedTags(tagsArray);
          }}
        />

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

      <PostSettings
        allowReactions={allowReactions}
        allowComments={allowComments}
        postNSFW={postNSFW}
        onToggle={handleDefaultSettings}
      />

      {/* Delete Post Option (only in edit mode) */}
      {isEditing && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-500 hover:text-red-700 text-sm"
            disabled={isSubmitting || isDeleting}
          >
            Delete post
          </button>
        </div>
      )}

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

function PostSettings({
  allowReactions,
  allowComments,
  postNSFW,
  onToggle,
}: {
  allowReactions?: boolean;
  allowComments?: boolean;
  postNSFW?: boolean;
  onToggle: (setting: SettingKey) => void;
}) {
  return (
    <aside
      className={`px-2 py-3 absolute top-1/2 -translate-y-1/2 right-0 flex flex-col gap-5 bg-dark text-primary dark:bg-light rounded-l-xl`}
    >
      <button
        className={`relative flex-grow flex justify-center items-center h-full`}
        onClick={() => onToggle("allowReactions")}
      >
        <div
          className={`${
            allowReactions
              ? "opacity-100 bg-red-100 text-red-500 rounded-full p-2"
              : "opacity-50"
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
        onClick={() => onToggle("allowComments")}
      >
        <div
          className={`${
            allowComments
              ? "opacity-100 bg-blue-100 text-blue-500 rounded-full p-2"
              : "opacity-50"
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
          postNSFW
            ? "opacity-100 bg-yellow-100 text-yellow-500 rounded-full p-2"
            : "opacity-50"
        } transition-all duration-300 ease-in-out`}
        onClick={() => onToggle("postNSFW")}
      >
        <Drama size={24} strokeWidth={2} />
      </button>
    </aside>
  );
}
