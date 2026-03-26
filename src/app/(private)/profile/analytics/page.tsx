import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  IconArticle,
  IconHeart,
  IconMessage,
  IconUsers,
  IconTrendingUp,
  IconClock,
} from "@tabler/icons-react";

export const metadata = {
  title: "Your Analytics | Ostracon",
};

export default async function UserAnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // Fetch all user data in parallel
  const [
    postsRes,
    reactionsRes,
    commentsRes,
    followersRes,
    recentReactionsRes,
  ] = await Promise.all([
    // User's published posts
    supabase
      .from("fragments")
      .select("id, published_at", { count: "exact" })
      .eq("user_id", user.id)
      .eq("is_draft", false)
      .not("published_at", "is", null),
    // Reactions received on user's posts
    supabase
      .from("fragment_reactions")
      .select("id, type, created_at, fragments!inner(user_id)")
      .eq("fragments.user_id", user.id),
    // Comments received on user's posts
    supabase
      .from("fragment_comments")
      .select("id, created_at, fragments!inner(user_id)")
      .eq("fragments.user_id", user.id),
    // Followers
    supabase
      .from("follows")
      .select("id", { count: "exact" })
      .eq("following_id", user.id),
    // Reactions with timestamps for best-time analysis (last 90 days)
    supabase
      .from("fragment_reactions")
      .select("created_at, fragments!inner(user_id, published_at)")
      .eq("fragments.user_id", user.id)
      .gte(
        "created_at",
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      ),
  ]);

  const totalPosts = postsRes.count || 0;
  const totalReactions = reactionsRes.data?.length || 0;
  const totalComments = commentsRes.data?.length || 0;
  const followers = followersRes.count || 0;
  const engagementRate =
    followers > 0
      ? (((totalReactions + totalComments) / Math.max(totalPosts, 1) / followers) * 100).toFixed(1)
      : "0";

  // Calculate best posting times from reaction data
  const hourCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0);

  for (const reaction of recentReactionsRes.data || []) {
    const fragment = reaction.fragments as any;
    if (fragment?.published_at) {
      const pubDate = new Date(fragment.published_at);
      hourCounts[pubDate.getHours()]++;
      dayCounts[pubDate.getDay()]++;
    }
  }

  const bestHour = hourCounts.indexOf(Math.max(...hourCounts));
  const bestDay = dayCounts.indexOf(Math.max(...dayCounts));
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Top posts (by engagement)
  const postEngagement: Record<string, { reactions: number; comments: number }> = {};
  for (const r of reactionsRes.data || []) {
    const frag = r.fragments as any;
    if (!postEngagement[frag?.user_id ? r.id : ""]) {
      // We need fragment_id, not available directly — use post-level aggregation later
    }
  }

  const stats = [
    { label: "Posts", value: totalPosts, icon: IconArticle },
    { label: "Reactions Received", value: totalReactions, icon: IconHeart },
    { label: "Comments Received", value: totalComments, icon: IconMessage },
    { label: "Followers", value: followers, icon: IconUsers },
    { label: "Engagement Rate", value: `${engagementRate}%`, icon: IconTrendingUp },
  ];

  // Format hour
  const formatHour = (h: number) => {
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  const maxHourCount = Math.max(...hourCounts, 1);

  return (
    <div className="flex flex-col gap-6 p-4 pb-[100px]">
      <div>
        <h1 className="text-2xl font-bold">Your Analytics</h1>
        <p className="text-muted-foreground">See how your content is performing</p>
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
          </div>
        ))}
      </div>

      {/* Best posting time */}
      {totalReactions > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <IconClock size={20} />
            <h2 className="text-lg font-semibold">Best Posting Times</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Your posts get the most engagement on{" "}
            <strong>{dayNames[bestDay]}s</strong> around{" "}
            <strong>{formatHour(bestHour)}</strong>
          </p>

          {/* Hour heatmap */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground mb-2">Reactions by hour of day</p>
            <div className="grid grid-cols-12 gap-1">
              {hourCounts.map((count, hour) => {
                const intensity = count / maxHourCount;
                return (
                  <div key={hour} className="text-center">
                    <div
                      className="h-8 rounded"
                      style={{
                        backgroundColor: `rgba(99, 102, 241, ${Math.max(0.05, intensity)})`,
                      }}
                      title={`${formatHour(hour)}: ${count} reactions`}
                    />
                    {hour % 3 === 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatHour(hour).replace(" ", "")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {totalPosts === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Start posting to see your analytics!
        </p>
      )}
    </div>
  );
}
