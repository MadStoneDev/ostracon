"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import PostEditor from "@/components/feed/post-editor";

import {
  IconEyeOff,
  IconHeart,
  IconHeartFilled,
  IconMessage,
  IconMessageFilled,
  IconSend,
} from "@tabler/icons-react";
import CommunitySelector from "@/components/ui/community-selector";

type PostSettings = {
  allowReactions: boolean;
  allowComments: boolean;
  postNSFW: boolean;
};

interface PostData {
  user_id: string;
  content: string;
  comments_open: boolean;
  reactions_open: boolean;
  is_nsfw: boolean;
  group_id: string | null;
}

type SettingKey = keyof PostSettings;

export default function NewPost(): React.ReactElement {
  // Supabase
  const supabase = createClient();

  // Hooks
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [postContent, setPostContent] = useState("");
  const [allowReactions, setAllowReactions] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [postNSFW, setPostNSFW] = useState(false);

  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(
    null,
  );
  const [validatedCommunity, setValidatedCommunity] = useState<string | null>(
    null,
  );
  const [isCommunityValidated, setIsCommunityValidated] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Functions
  const handleDefaultSettings = (setting: SettingKey) => {
    const fromLocalStorage = JSON.parse(
      localStorage.getItem("defaultPostSettings") || "{}",
    ) as Partial<PostSettings>;

    switch (setting) {
      case "allowReactions":
        fromLocalStorage.allowReactions = !allowReactions;
        setAllowReactions(!allowReactions);
        break;
      case "allowComments":
        fromLocalStorage.allowComments = !allowComments;
        setAllowComments(!allowComments);
        break;
      case "postNSFW":
        fromLocalStorage.postNSFW = !postNSFW;
        setPostNSFW(!postNSFW);
        break;
      default:
        break;
    }

    localStorage.setItem(
      "defaultPostSettings",
      JSON.stringify(fromLocalStorage),
    );
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

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to post.");
      }

      const { data, error } = await supabase
        .from("fragments")
        .insert({
          user_id: user.id,
          content: postContent, // Now storing HTML content
          comments_open: allowComments,
          reactions_open: allowReactions,
          is_nsfw: postNSFW,
          group_id: selectedCommunity,
        })
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
          router.push(`/explore`);
        }
      } else {
        router.push(`/explore`);
      }
    } catch (error) {
      console.error("Failed to submit post:", error);
      setError("Failed to submit post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    async function validateCommunity() {
      const communityFromUrl = searchParams.get("community");

      if (!communityFromUrl) {
        setIsCommunityValidated(true); // No community to validate
        return;
      }

      try {
        const { data: communityData, error: communityError } = await supabase
          .from("groups")
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
          .from("group_members")
          .select("group_id")
          .eq("user_id", user.id)
          .eq("group_id", communityData.id);

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
  }, [supabase, searchParams]);

  // Effects
  useEffect(() => {
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
  }, []);

  return (
    <div className={`flex-grow flex flex-col h-full`}>
      <div className={`flex-grow flex flex-col`}>
        {/* Header */}
        <section className={`relative`}>
          <article className={`pb-4 flex gap-2`}>
            <h1
              className={`font-sans font-black text-xl text-dark dark:text-light`}
            >
              What do you want to share?
            </h1>
          </article>

          {/* Send Button */}
          <button
            onClick={submitPost}
            className={`absolute top-1 right-0 flex flex-col items-end text-dark dark:text-light hover:text-primary dark:hover:text-primary disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 ease-in-out`}
            disabled={
              postContent.trim().length === 0 ||
              isSubmitting ||
              !isCommunityValidated
            }
          >
            {isSubmitting ? (
              <span className={`text-sm`}>Posting...</span>
            ) : (
              <IconSend size={24} strokeWidth={2} />
            )}
          </button>
        </section>

        {/* Post Editor */}
        <article className={`relative flex-grow flex flex-col text-sm`}>
          <PostEditor onChange={handleEditorContentChange} />
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
        className={`px-2 py-3 absolute top-1/2 -translate-y-1/2 right-0 flex flex-col gap-5 bg-dark text-primary dark:bg-light rounded-l-xl`}
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
