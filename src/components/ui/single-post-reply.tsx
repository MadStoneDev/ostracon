import React, { useState, Dispatch, SetStateAction, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { IconLoader, IconSend, IconX } from "@tabler/icons-react";
import UserAvatar from "@/components/ui/user-avatar";
import HtmlContent from "@/components/feed/html-content-renderer";
import PostEditor from "@/components/feed/post-editor";
import { useRouter } from "next/navigation";

export default function SinglePostReply({
  startReply,
  setStartReply,
  avatarUrl,
  username,
  postId,
  content,
  truncate,
  isExpanded,
  onCommentAdded,
}: {
  startReply: boolean;
  setStartReply: Dispatch<SetStateAction<boolean>>;
  avatarUrl: string;
  username: string;
  postId: string;
  content: string;
  truncate: boolean;
  isExpanded: boolean;
  onCommentAdded?: () => void;
}) {
  // Initialize Supabase client
  const supabase = createClient();
  const router = useRouter();

  // States
  const [showReply, setShowReply] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>("");

  // Get current user's avatar
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        const { data: userProfile } = await supabase
          .from("users")
          .select("avatar_url")
          .eq("id", userData.user.id)
          .single();

        if (userProfile?.avatar_url) {
          setCurrentUserAvatar(userProfile.avatar_url);
        }
      }
    };

    fetchCurrentUser();
  }, [supabase]);

  // Functions
  const handleReply = (show: boolean) => {
    const documentBody = document.body;

    if (show) {
      setShowReply(true);
      documentBody.style.overflow = "hidden";

      setTimeout(() => {
        setFadeIn(true);
      }, 100);

      setTimeout(() => {
        setSlideIn(true);
      }, 200);
    } else {
      setSlideIn(false);

      setTimeout(() => {
        setFadeIn(false);
      }, 100);

      setTimeout(() => {
        setShowReply(false);
        documentBody.style.overflow = "auto";
      }, 400);
    }
  };

  const handleEditorContentChange = (htmlContent: string) => {
    setReplyContent(htmlContent);
  };

  const submitComment = async () => {
    if (!replyContent.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the current user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("You must be logged in to comment");
      }

      console.log("Submitting comment for post:", postId);

      // Insert the comment
      const { data: insertedComment, error: commentError } = await supabase
        .from("fragment_comments")
        .insert({
          fragment_id: postId,
          user_id: userData.user.id,
          content: replyContent,
        })
        .select();

      if (commentError) {
        console.error("Error inserting comment:", commentError);
        throw commentError;
      }

      console.log("Successfully inserted comment:", insertedComment);

      // Create a notification for the post owner
      const { data: postData } = await supabase
        .from("fragments")
        .select("user_id")
        .eq("id", postId)
        .single();

      if (postData && postData.user_id !== userData.user.id) {
        // Only create notification if the commenter is not the post owner
        await supabase.from("notifications").insert({
          user_id: postData.user_id,
          actor_id: userData.user.id,
          post_id: postId,
          type: "comment",
          read: false,
          data: { comment_content: replyContent.substring(0, 100) },
        });
      }

      // Call the callback if provided
      if (onCommentAdded) {
        onCommentAdded();
      }

      // Close the reply modal and reset content
      setStartReply(false);
      setReplyContent("");

      // Navigate to the post's page to see the comment at the top
      // Using setTimeout to ensure the modal animations can complete
      setTimeout(() => {
        router.push(`/post/${postId}`);
      }, 500);
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError(err instanceof Error ? err.message : "Failed to submit comment");
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    handleReply(startReply);
  }, [startReply]);

  return (
    <div
      className={`fixed inset-0 ${
        !showReply && "pointer-events-none invisible"
      } z-50`}
      aria-hidden={!showReply}
    >
      <section
        className={`px-5 fixed bottom-0 left-0 right-0 bg-light dark:bg-dark ${
          slideIn ? "py-5 max-h-[900px]" : "max-h-0"
        } z-50 transition-all duration-300 ease-in-out`}
      >
        <button
          className={`absolute top-5 right-5`}
          onClick={() => setStartReply(false)}
        >
          <IconX size={18} strokeWidth={2} />
        </button>

        {/* Reply Header */}
        <article
          className={`mb-4 pr-8 pb-5 flex items-center justify-between gap-2 border-b border-dark/20 dark:border-light/20 italic`}
        >
          <div className={`flex gap-3 w-full`}>
            <UserAvatar avatar_url={avatarUrl} username={username} />

            <article className={`pr-3 text-sm overflow-hidden`}>
              <div className="text-sm font-bold mb-1">@{username}</div>
              <HtmlContent
                postId={postId}
                content={content}
                truncate={true}
                isExpanded={false}
                maxLines={2}
                showExpandButton={false}
              />
            </article>
          </div>
        </article>

        {error && <div className="mb-3 text-red-500 text-sm">{error}</div>}

        <article className={`flex items-start gap-2 h-[20vh]`}>
          <div className="flex-shrink-0 mt-2">
            <UserAvatar avatar_url={currentUserAvatar} username="You" />
          </div>
          <div className={`flex-grow h-full overflow-y-auto`}>
            <PostEditor onChange={handleEditorContentChange} />
          </div>

          {loading ? (
            <IconLoader
              size={24}
              strokeWidth={2}
              className={`text-primary animate-[spin_2s_linear_infinite]`}
            />
          ) : (
            <button
              className={`hover:text-primary transition-all duration-300 ease-in-out ${
                !replyContent.trim() && "opacity-50 cursor-not-allowed"
              }`}
              onClick={submitComment}
              disabled={!replyContent.trim()}
            >
              <IconSend size={24} strokeWidth={2} />
            </button>
          )}
        </article>
      </section>

      {/* Reply Overlay */}
      <div
        className={`fixed top-0 bottom-0 left-0 right-0 bg-dark dark:bg-light ${
          fadeIn ? "opacity-50 dark:opacity-30" : "opacity-0"
        } z-30 transition-all duration-300 ease-in-out`}
        onClick={() => setStartReply(false)}
      ></div>
    </div>
  );
}
