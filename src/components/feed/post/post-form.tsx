"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { createFragment, updateFragment, deleteFragment } from "@/actions/fragment-actions";
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

import type { User } from "@supabase/supabase-js";
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
type Community = Database["public"]["Tables"]["communities"]["Row"];
type FragmentWithUser = FragmentRow & {
  users?: {
    username: string;
    avatar_url?: string;
    id?: string;
  };
  groups?: Pick<CommunityRow, "name" | "id"> | null;
};

interface PostFormProps {
  currentUser: User;
  postId?: string;
  post?: FragmentWithUser;
  isEditing?: boolean;
}

export default function PostForm({
  currentUser,
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
  const [availableCommunities, setAvailableCommunities] = useState<Community[]>(
    [],
  );
  const [allowReactions, setAllowReactions] = useState(
    post?.reactions_open ?? true,
  );
  const [allowComments, setAllowComments] = useState(
    post?.comments_open ?? true,
  );
  const [postNSFW, setPostNSFW] = useState(post?.is_nsfw || false);

  const [selectedCommunity, setSelectedCommunity] = useState<
    Community | null | "public" | "draft"
  >("public");

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

  const handleCommunityChange = (
    community: Community | null | "public" | "draft",
  ) => {
    setSelectedCommunity(community);
  };

  const submitPost = async () => {
    if (postContent.trim().length === 0) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const communityId =
      selectedCommunity !== "draft" &&
      selectedCommunity !== "public" &&
      selectedCommunity !== null &&
      typeof selectedCommunity === "object"
        ? selectedCommunity.id
        : "";

    try {
      if (isEditing && postId) {
        const result = await updateFragment(postId, {
          title: postTitle || "",
          content: postContent,
          commentsOpen: allowComments,
          reactionsOpen: allowReactions,
          isNsfw: postNSFW,
          isDraft: selectedCommunity === "draft",
          communityId,
          publishedAt: post?.published_at ?? null,
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to update post");
        }

        if (communityId) {
          const { data: communityData } = await supabase
            .from("communities")
            .select("name")
            .eq("id", communityId)
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
        const result = await createFragment({
          title: postTitle || "",
          content: postContent,
          commentsOpen: allowComments,
          reactionsOpen: allowReactions,
          isNsfw: postNSFW,
          isDraft: selectedCommunity === "draft",
          communityId,
          tagIds: selectedTags.map((tag) => tag.id),
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to create post");
        }

        if (communityId) {
          const { data: communityData } = await supabase
            .from("communities")
            .select("name")
            .eq("id", communityId)
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
      const result = await deleteFragment(postId);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete post");
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
      const { data: tags, error } = await supabase.from("tags").select();

      if (tags) setAvailableTags(tags);
    }

    fetchAvailableTags();
  }, [supabase]);

  useEffect(() => {
    async function fetchCommunities() {
      try {
        // Optional: Add a loading state
        const { data: membershipData, error: membershipError } = await supabase
          .from("community_members")
          .select("community_id")
          .eq("user_id", currentUser.id);

        if (membershipError) {
          console.error(
            "Error fetching community memberships:",
            membershipError,
          );
          setAvailableCommunities([]); // Ensure UI updates even on error
          return;
        }

        // Extract community IDs, use optional chaining
        const communityIds =
          membershipData?.map((membership) => membership.community_id) ?? [];

        if (communityIds.length === 0) {
          setAvailableCommunities([]);
          return;
        }

        const { data: communityData, error: communityError } = await supabase
          .from("communities")
          .select("*")
          .in("id", communityIds);

        if (communityError) {
          console.error("Error fetching community details:", communityError);
          setAvailableCommunities([]);
          return;
        }

        setAvailableCommunities(communityData ?? []);
      } catch (error) {
        console.error("Unexpected error fetching communities:", error);
        setAvailableCommunities([]);
      }
    }

    fetchCommunities();
  }, [supabase, currentUser.id]);

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

        <section
          className={`relative flex flex-row items-center gap-2 text-sm`}
        >
          <input
            type="text"
            value={postTitle || ""}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Title (optional)"
            className={`flex-grow py-2 px-4 h-8 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-900 focus:outline-none focus:border-primary`}
          />

          {/* Communities */}
          <CommunitySelector
            communities={availableCommunities}
            selectedCommunity={selectedCommunity}
            onChange={handleCommunityChange}
          />
        </section>

        {/* Post Editor */}
        <article className={`relative grow flex flex-col text-sm`}>
          <PostEditor
            onChange={handleEditorContentChange}
            initialContent={postContent}
          />
        </article>
      </div>

      <PostSettings
        allowReactions={allowReactions}
        allowComments={allowComments}
        postNSFW={postNSFW}
        onToggle={handleDefaultSettings}
      />

      {/* Tags */}
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
