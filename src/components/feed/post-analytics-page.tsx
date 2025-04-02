"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconEye,
  IconHeart,
  IconMessage2,
  IconLoader,
} from "@tabler/icons-react";

import { createClient } from "@/utils/supabase/client";
import UserAvatar from "@/components/ui/user-avatar";
import { formatTimestamp } from "@/lib/fragments";
import { formatCount } from "@/utils/format-count";

import type { Database } from "../../../database.types";

type FragmentRow = Database["public"]["Tables"]["fragments"]["Row"];
type UserProfile = Database["public"]["Tables"]["users"]["Row"];

export default function PostAnalyticsPage({
  postId,
  post,
}: {
  postId: string;
  post: FragmentRow & {
    users?: {
      id: string;
      username: string;
      avatar_url?: string;
    };
  };
}) {
  // const router = useRouter();
  // const supabase = createClient();
  //
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  //
  // // Analytics data
  // const [viewCount, setViewCount] = useState(0);
  // const [uniqueViewCount, setUniqueViewCount] = useState(0);
  // const [likeCount, setLikeCount] = useState(0);
  // const [commentCount, setCommentCount] = useState(0);
  //
  // // Likers and commenters
  // const [likers, setLikers] = useState<UserProfile[]>([]);
  // const [commenters, setCommenters] = useState<
  //   (UserProfile & { comment_date: string })[]
  // >([]);
  //
  // // Check if current user is authorized to view analytics
  // const [isAuthorized, setIsAuthorized] = useState(false);
  //
  // useEffect(() => {
  //   const checkAuthorization = async () => {
  //     setLoading(true);
  //     try {
  //       const { data: userData } = await supabase.auth.getUser();
  //
  //       // Only the post owner can view analytics
  //       if (userData?.user && post.users) {
  //         const isOwner = userData.user.id === post.user_id;
  //         setIsAuthorized(isOwner);
  //
  //         if (isOwner) {
  //           await fetchAnalyticsData();
  //         } else {
  //           router.push(`/post/${postId}`);
  //         }
  //       } else {
  //         router.push("/login");
  //       }
  //     } catch (err) {
  //       console.error("Error checking authorization:", err);
  //       setError("Failed to verify permissions");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //
  //   checkAuthorization();
  // }, [postId, post.user_id, post.users, router, supabase]);
  //
  // const fetchAnalyticsData = async () => {
  //   try {
  //     // Fetch analytics data
  //     const { data: analytics, error: analyticsError } = await supabase
  //       .from("fragment_analytics")
  //       .select("*")
  //       .eq("fragment_id", postId)
  //       .single();
  //
  //     if (analyticsError && analyticsError.code !== "PGRST116") {
  //       throw analyticsError;
  //     }
  //
  //     if (analytics) {
  //       setViewCount(analytics.views || 0);
  //       setUniqueViewCount(analytics.unique_views || 0);
  //     }
  //
  //     // Fetch likes count and users who liked
  //     const { data: likesData, error: likesError } = await supabase
  //       .from("fragment_reactions")
  //       .select(
  //         `
  //         id,
  //         user_id,
  //         users:user_id (id, username, avatar_url, bio)
  //       `,
  //       )
  //       .eq("fragment_id", postId)
  //       .eq("type", "like");
  //
  //     if (likesError) {
  //       throw likesError;
  //     }
  //
  //     setLikeCount(likesData.length);
  //     const uniqueLikers = likesData
  //       .map((item) => item.users)
  //       .filter(
  //         (user, index, self) =>
  //           user && index === self.findIndex((u) => u && u.id === user.id),
  //       ) as UserProfile[];
  //     setLikers(uniqueLikers);
  //
  //     // Fetch comments count and users who commented
  //     const { data: commentsData, error: commentsError } = await supabase
  //       .from("fragment_comments")
  //       .select(
  //         `
  //         id,
  //         user_id,
  //         created_at,
  //         users:user_id (id, username, avatar_url, bio)
  //       `,
  //       )
  //       .eq("fragment_id", postId);
  //
  //     if (commentsError) {
  //       throw commentsError;
  //     }
  //
  //     setCommentCount(commentsData.length);
  //
  //     // Create unique list of commenters with their most recent comment date
  //     const commentersMap = new Map<
  //       string,
  //       { user: UserProfile; latest_date: string }
  //     >();
  //
  //     commentsData.forEach((comment) => {
  //       if (comment.users) {
  //         const userId = comment.users.id;
  //         const currentEntry = commentersMap.get(userId);
  //
  //         if (
  //           !currentEntry ||
  //           new Date(comment.created_at) > new Date(currentEntry.latest_date)
  //         ) {
  //           commentersMap.set(userId, {
  //             user: comment.users as UserProfile,
  //             latest_date: comment.created_at,
  //           });
  //         }
  //       }
  //     });
  //
  //     const uniqueCommenters = Array.from(commentersMap.values()).map(
  //       (entry) => ({
  //         ...entry.user,
  //         comment_date: entry.latest_date,
  //       }),
  //     );
  //
  //     setCommenters(uniqueCommenters);
  //   } catch (err) {
  //     console.error("Error fetching analytics data:", err);
  //     setError("Failed to load analytics data");
  //   }
  // };
  //
  // if (loading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-[50vh]">
  //       <IconLoader className="animate-spin mb-4" size={32} />
  //       <span>Loading analytics...</span>
  //     </div>
  //   );
  // }
  //
  // if (error) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
  //       <span className="text-lg font-bold mb-2">Error</span>
  //       <span className="text-sm italic text-center text-red-500">{error}</span>
  //       <button
  //         onClick={() => router.push(`/post/${postId}`)}
  //         className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
  //       >
  //         Return to Post
  //       </button>
  //     </div>
  //   );
  // }
  //
  // if (!isAuthorized) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
  //       <span className="text-lg font-bold mb-2">Unauthorized</span>
  //       <span className="text-sm italic text-center">
  //         You don't have permission to view these analytics.
  //       </span>
  //       <button
  //         onClick={() => router.push(`/post/${postId}`)}
  //         className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
  //       >
  //         Return to Post
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/*<div className="flex items-center mb-6">*/}
      {/*  <Link*/}
      {/*    href={`/post/${postId}`}*/}
      {/*    className="mr-4 text-dark dark:text-light opacity-70 hover:opacity-100 transition-all duration-300"*/}
      {/*  >*/}
      {/*    <IconArrowLeft size={24} />*/}
      {/*  </Link>*/}
      {/*  <h1 className="text-xl font-bold">Post Analytics</h1>*/}
      {/*</div>*/}

      {/*/!* Stats Overview *!/*/}
      {/*<div className="grid grid-cols-3 gap-4 mb-8">*/}
      {/*  <div className="bg-light dark:bg-dark/30 p-4 rounded-lg shadow flex flex-col items-center">*/}
      {/*    <IconEye size={24} className="mb-2 text-primary" />*/}
      {/*    <span className="text-2xl font-bold">{formatCount(viewCount)}</span>*/}
      {/*    <span className="text-sm opacity-70">Views</span>*/}
      {/*    <span className="text-xs mt-2 opacity-50">*/}
      {/*      {formatCount(uniqueViewCount)} unique viewers*/}
      {/*    </span>*/}
      {/*  </div>*/}

      {/*  <div className="bg-light dark:bg-dark/30 p-4 rounded-lg shadow flex flex-col items-center">*/}
      {/*    <IconHeart size={24} className="mb-2 text-primary" />*/}
      {/*    <span className="text-2xl font-bold">{formatCount(likeCount)}</span>*/}
      {/*    <span className="text-sm opacity-70">Likes</span>*/}
      {/*    <span className="text-xs mt-2 opacity-50">*/}
      {/*      {((likeCount / Math.max(viewCount, 1)) * 100).toFixed(1)}%*/}
      {/*      engagement*/}
      {/*    </span>*/}
      {/*  </div>*/}

      {/*  <div className="bg-light dark:bg-dark/30 p-4 rounded-lg shadow flex flex-col items-center">*/}
      {/*    <IconMessage2 size={24} className="mb-2 text-primary" />*/}
      {/*    <span className="text-2xl font-bold">*/}
      {/*      {formatCount(commentCount)}*/}
      {/*    </span>*/}
      {/*    <span className="text-sm opacity-70">Comments</span>*/}
      {/*    <span className="text-xs mt-2 opacity-50">*/}
      {/*      {((commentCount / Math.max(viewCount, 1)) * 100).toFixed(1)}%*/}
      {/*      engagement*/}
      {/*    </span>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*/!* People who liked *!/*/}
      {/*<div className="mb-8">*/}
      {/*  <h2 className="text-lg font-semibold mb-4 flex items-center">*/}
      {/*    <IconHeart size={18} className="mr-2 text-primary" />*/}
      {/*    People who liked ({likers.length})*/}
      {/*  </h2>*/}

      {/*  {likers.length === 0 ? (*/}
      {/*    <div className="text-sm italic opacity-70 p-4 text-center">*/}
      {/*      No one has liked this post yet.*/}
      {/*    </div>*/}
      {/*  ) : (*/}
      {/*    <div className="space-y-4 max-h-64 overflow-y-auto p-2">*/}
      {/*      {likers.map((user) => (*/}
      {/*        <div key={user.id} className="flex items-center gap-3">*/}
      {/*          <UserAvatar*/}
      {/*            avatar_url={user.avatar_url || ""}*/}
      {/*            username={user.username}*/}
      {/*          />*/}
      {/*          <div>*/}
      {/*            <Link*/}
      {/*              href={`/profile/${user.username}`}*/}
      {/*              className="font-medium hover:text-primary transition-colors"*/}
      {/*            >*/}
      {/*              @{user.username}*/}
      {/*            </Link>*/}
      {/*            {user.bio && (*/}
      {/*              <p className="text-xs opacity-70 truncate max-w-xs">*/}
      {/*                {user.bio}*/}
      {/*              </p>*/}
      {/*            )}*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  )}*/}
      {/*</div>*/}

      {/*/!* People who commented *!/*/}
      {/*<div className="mb-8">*/}
      {/*  <h2 className="text-lg font-semibold mb-4 flex items-center">*/}
      {/*    <IconMessage2 size={18} className="mr-2 text-primary" />*/}
      {/*    People who commented ({commenters.length})*/}
      {/*  </h2>*/}

      {/*  {commenters.length === 0 ? (*/}
      {/*    <div className="text-sm italic opacity-70 p-4 text-center">*/}
      {/*      No one has commented on this post yet.*/}
      {/*    </div>*/}
      {/*  ) : (*/}
      {/*    <div className="space-y-4 max-h-64 overflow-y-auto p-2">*/}
      {/*      {commenters.map((user) => (*/}
      {/*        <div key={user.id} className="flex items-center gap-3">*/}
      {/*          <UserAvatar*/}
      {/*            avatar_url={user.avatar_url || ""}*/}
      {/*            username={user.username}*/}
      {/*          />*/}
      {/*          <div className="flex-1">*/}
      {/*            <div className="flex items-center justify-between">*/}
      {/*              <Link*/}
      {/*                href={`/profile/${user.username}`}*/}
      {/*                className="font-medium hover:text-primary transition-colors"*/}
      {/*              >*/}
      {/*                @{user.username}*/}
      {/*              </Link>*/}
      {/*              <span className="text-xs opacity-70">*/}
      {/*                {formatTimestamp(user.comment_date).label}*/}
      {/*              </span>*/}
      {/*            </div>*/}
      {/*            {user.bio && (*/}
      {/*              <p className="text-xs opacity-70 truncate max-w-xs">*/}
      {/*                {user.bio}*/}
      {/*              </p>*/}
      {/*            )}*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  )}*/}
      {/*</div>*/}
    </div>
  );
}
