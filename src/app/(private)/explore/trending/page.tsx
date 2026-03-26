import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { calculateTrendingScore } from "@/utils/trending";
import Post from "@/components/feed/single-post";
import Link from "next/link";

export const metadata = {
  title: "Trending | Ostracon",
};

export default async function TrendingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // Fetch recent published posts from last 7 days with engagement data
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: posts } = await supabase
    .from("fragments")
    .select(
      `
      id, user_id, title, content, is_nsfw, comments_open, reactions_open,
      published_at, community_id,
      profiles:user_id (username, avatar_url),
      communities:community_id (name)
    `,
    )
    .eq("is_draft", false)
    .not("published_at", "is", null)
    .gte("published_at", sevenDaysAgo)
    .order("published_at", { ascending: false })
    .limit(100);

  if (!posts || posts.length === 0) {
    return (
      <div className="p-4 pb-[100px]">
        <nav className="flex gap-4 mb-6">
          <Link href="/explore" className="text-muted-foreground hover:text-foreground transition-colors">
            For You
          </Link>
          <span className="font-bold border-b-2 border-primary">Trending</span>
        </nav>
        <p className="text-center text-muted-foreground py-8">
          No trending posts yet. Check back later!
        </p>
      </div>
    );
  }

  // Fetch engagement counts
  const postIds = posts.map((p) => p.id);

  const [likesRes, commentsRes] = await Promise.all([
    supabase
      .from("fragment_reactions")
      .select("fragment_id")
      .in("fragment_id", postIds),
    supabase
      .from("fragment_comments")
      .select("fragment_id")
      .in("fragment_id", postIds),
  ]);

  const likeCounts: Record<string, number> = {};
  const commentCounts: Record<string, number> = {};

  for (const r of likesRes.data || []) {
    likeCounts[r.fragment_id] = (likeCounts[r.fragment_id] || 0) + 1;
  }
  for (const c of commentsRes.data || []) {
    commentCounts[c.fragment_id] = (commentCounts[c.fragment_id] || 0) + 1;
  }

  // Score and sort
  const scored = posts
    .map((post) => ({
      ...post,
      likeCount: likeCounts[post.id] || 0,
      commentCount: commentCounts[post.id] || 0,
      score: calculateTrendingScore(
        likeCounts[post.id] || 0,
        commentCounts[post.id] || 0,
        post.published_at!,
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);

  return (
    <div className="flex flex-col gap-4 p-4 pb-[100px]">
      <nav className="flex gap-4">
        <Link href="/explore" className="text-muted-foreground hover:text-foreground transition-colors">
          For You
        </Link>
        <span className="font-bold border-b-2 border-primary">Trending</span>
      </nav>

      <div className="flex flex-col space-y-3">
        {scored.map((post) => {
          const profile = post.profiles as any;
          const community = post.communities as any;

          return (
            <article key={post.id} className="w-full">
              <Post
                postId={post.id}
                avatar_url={profile?.avatar_url || ""}
                username={profile?.username || ""}
                title={post.title || ""}
                content={post.content || ""}
                nsfw={post.is_nsfw || false}
                commentsAllowed={post.comments_open ?? true}
                reactionsAllowed={post.reactions_open ?? true}
                timestamp={post.published_at || ""}
                groupId={post.community_id}
                groupName={community?.name || ""}
                authorId={post.user_id || ""}
                initialLikeCount={post.likeCount}
                initialCommentCount={post.commentCount}
              />
            </article>
          );
        })}
      </div>
    </div>
  );
}
