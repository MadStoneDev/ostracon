import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import {
  IconUsers,
  IconArticle,
  IconHeart,
  IconMessage,
  IconTrendingUp,
} from "@tabler/icons-react";

export const metadata = {
  title: "Community Analytics | Ostracon",
};

export default async function CommunityAnalyticsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // Get community and verify admin/mod access
  const { data: community } = await supabase
    .from("communities")
    .select("id, name, display_name, member_count, created_at")
    .eq("name", name)
    .single();

  if (!community) notFound();

  const { data: membership } = await supabase
    .from("community_members")
    .select("role")
    .eq("community_id", community.id)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["admin", "moderator", "owner"].includes(membership.role)) {
    redirect(`/connect/${name}`);
  }

  // Fetch analytics data
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [postsRes, reactionsRes, commentsRes, recentMembersRes, topPostersRes] =
    await Promise.all([
      // Posts in community
      supabase
        .from("fragments")
        .select("id, published_at", { count: "exact" })
        .eq("community_id", community.id)
        .eq("is_draft", false)
        .not("published_at", "is", null),
      // Reactions on community posts
      supabase
        .from("fragment_reactions")
        .select("fragment_id, fragments!inner(community_id)", { count: "exact" })
        .eq("fragments.community_id", community.id),
      // Comments on community posts
      supabase
        .from("fragment_comments")
        .select("fragment_id, fragments!inner(community_id)", { count: "exact" })
        .eq("fragments.community_id", community.id),
      // Recent members (joined in last 30 days)
      supabase
        .from("community_members")
        .select("id", { count: "exact" })
        .eq("community_id", community.id)
        .gte("joined_at", thirtyDaysAgo),
      // Top posters
      supabase
        .from("fragments")
        .select("user_id, profiles:user_id(username, avatar_url)")
        .eq("community_id", community.id)
        .eq("is_draft", false)
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(100),
    ]);

  const totalPosts = postsRes.count || 0;
  const totalReactions = reactionsRes.count || 0;
  const totalComments = commentsRes.count || 0;
  const newMembers30d = recentMembersRes.count || 0;

  // Calculate top posters
  const posterCounts: Record<string, { count: number; username: string }> = {};
  for (const post of topPostersRes.data || []) {
    const profile = post.profiles as any;
    if (!posterCounts[post.user_id]) {
      posterCounts[post.user_id] = {
        count: 0,
        username: profile?.username || "unknown",
      };
    }
    posterCounts[post.user_id].count++;
  }
  const topPosters = Object.entries(posterCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5);

  // Engagement rate
  const engagementRate =
    totalPosts > 0
      ? (((totalReactions + totalComments) / totalPosts) * 100).toFixed(1)
      : "0";

  const stats = [
    { label: "Members", value: community.member_count || 0, icon: IconUsers, change: `+${newMembers30d} this month` },
    { label: "Posts", value: totalPosts, icon: IconArticle },
    { label: "Reactions", value: totalReactions, icon: IconHeart },
    { label: "Comments", value: totalComments, icon: IconMessage },
    { label: "Engagement Rate", value: `${engagementRate}%`, icon: IconTrendingUp },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 pb-[100px]">
      <div>
        <h1 className="text-2xl font-bold">{community.display_name} Analytics</h1>
        <p className="text-muted-foreground">Community performance overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <stat.icon size={18} />
              <span className="text-sm">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            {"change" in stat && (
              <p className="text-xs text-green-600 mt-0.5">{stat.change}</p>
            )}
          </div>
        ))}
      </div>

      {/* Top posters */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Top Contributors</h2>
        {topPosters.length === 0 ? (
          <p className="text-muted-foreground text-sm">No posts yet</p>
        ) : (
          <div className="space-y-2">
            {topPosters.map(([userId, data], i) => (
              <div
                key={userId}
                className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <span className="text-sm font-bold text-muted-foreground w-6">
                  #{i + 1}
                </span>
                <span className="font-medium">@{data.username}</span>
                <span className="ml-auto text-sm text-muted-foreground">
                  {data.count} post{data.count === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
